'use strict';
/**
 * peer.js — PeerConnection class
 *
 * Manages one TCP socket to/from a peer.
 * Orchestrates the 5-step handshake:
 *   1. Both sides send HANDSHAKE_HELLO (pubkeys + name)
 *   2. Initiator sends HANDSHAKE_KEM_RESP (KEM ciphertext)
 *   3. Both send HANDSHAKE_AUTH (signature over transcript)
 *   4. Both send HANDSHAKE_COMPLETE
 *   → Session key derived, encrypted chat begins
 *
 * Events (via callbacks):
 *   onHandshakeComplete(peerInfo)
 *   onMessage(decryptedText, messageId, seqNum)
 *   onTyping(isTyping)
 *   onReceipt(type, messageId)
 *   onDisconnect()
 */

const { EventEmitter }                                       = require('events');
const { v4: uuidv4 }                                         = require('uuid');
const { MSG, encode, FrameParser }                           = require('./protocol');
const { kemEncapsulate, kemDecapsulate, sign, verify,
        buildTranscript }                                    = require('../crypto/pqc');
const { deriveSessionKey, encryptMessage, decryptMessage,
        SeqTracker }                                         = require('../crypto/session');

const PING_INTERVAL = 20_000;  // 20 s
const HANDSHAKE_TIMEOUT = 15_000; // 15 s

function cleanIp(ip) {
  if (!ip) return '127.0.0.1';
  if (ip === '::1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.substring(7);
  return ip;
}

class PeerConnection extends EventEmitter {
  /**
   * @param {net.Socket} socket
   * @param {'initiator'|'responder'} role
   * @param {object} identity  — our long-term identity
   */
  constructor(socket, role, identity) {
    super();
    this.socket    = socket;
    this.role      = role;         // 'initiator' | 'responder'
    this.identity  = identity;

    this.id        = null;         // set after handshake (ip:port of peer)
    this.peerInfo  = null;         // { name, kemPublicKey, sigPublicKey, fingerprint }
    this.sessionKey = null;
    this.seqTracker = new SeqTracker();
    this.isReady   = false;
    this._pingTimer = null;

    // Handshake state
    this._theirHello = null;
    this._myHello    = null;
    this._ciphertext = null;       // KEM ciphertext (set by initiator)
    this._sharedSecret = null;

    // Frame parser
    this._parser = new FrameParser((msg) => this._onFrame(msg));

    socket.on('data',  (chunk) => this._parser.push(chunk));
    socket.on('close', ()      => this._onClose());
    socket.on('error', (err)   => this._onError(err));

    // Timeout if handshake not completed
    this._hsTimeout = setTimeout(() => {
      if (!this.isReady) {
        this.emit('error', new Error('Handshake timed out'));
        this.socket.destroy();
      }
    }, HANDSHAKE_TIMEOUT);

    // Start handshake once socket is connected
    if (this.role === 'initiator') {
      socket.once('connect', () => {
        this._sendHello();
      });
    } else {
      this._sendHello();
    }
  }

  // ── Handshake steps ──────────────────────────────────────────────────────────
  _sendHello() {
    const hello = {
      type: MSG.HANDSHAKE_HELLO,
      kemPublicKey: this.identity.kemPublicKey,
      sigPublicKey: this.identity.sigPublicKey,
      name:         this.identity.name,
      listenPort:   this.identity.listenPort || 5050,
    };
    this._myHello = { ...hello };   // save for transcript
    this._send(hello);
  }

  _onHello(msg) {
    this._theirHello = msg;
    if (this.role === 'initiator') {
      // We have their pubkey — encapsulate and send KEM response
      const { ciphertext, sharedSecret } = kemEncapsulate(msg.kemPublicKey);
      this._ciphertext    = ciphertext;
      this._sharedSecret  = sharedSecret;
      this._send({ type: MSG.HANDSHAKE_KEM_RESP, ciphertext });
      this._sendAuth();
    }
    // Responder waits for KEM_RESP
  }

  _onKemResp(msg) {
    // Only responder handles this
    this._ciphertext   = msg.ciphertext;
    this._sharedSecret = kemDecapsulate(this.identity.kemSecretKey, msg.ciphertext);
    // Responder now sends its own auth
    this._sendAuth();
  }

  _sendAuth() {
    const transcript = buildTranscript(this._myHello, this._theirHello, this._ciphertext);
    const signature  = sign(this.identity.sigSecretKey, transcript);
    this._send({ type: MSG.HANDSHAKE_AUTH, signature });
  }

  _onAuth(msg) {
    // Verify their signature over (theirHello, myHello, ciphertext)
    const transcript = buildTranscript(this._theirHello, this._myHello, this._ciphertext);
    const valid = verify(this._theirHello.sigPublicKey, transcript, msg.signature);
    if (!valid) {
      this.emit('error', new Error('Handshake auth failed: invalid signature'));
      this.socket.destroy();
      return;
    }
    this._pendingAuthVerified = true;
    // Send COMPLETE to signal we accepted their auth
    this._send({ type: MSG.HANDSHAKE_COMPLETE });
    this._tryFinalize();
  }

  _pendingComplete = false;
  _pendingAuthVerified = false;

  _tryFinalize() {
    if (this._pendingAuthVerified && this._pendingComplete) this._finalizeHandshake();
  }

  _onComplete() {
    this._pendingComplete = true;
    this._tryFinalize();
  }

  _finalizeHandshake() {
    if (this.isReady) return; // guard double-fire
    clearTimeout(this._hsTimeout);

    // Derive session key
    this.sessionKey = deriveSessionKey(this._sharedSecret, 'quantusecure-v1-chat');

    const cleanRemoteAddress = cleanIp(this.socket.remoteAddress);
    const peerPort = this._theirHello.listenPort || this.socket.remotePort;

    // Build peer info
    const { buildFingerprint } = require('../crypto/identity');
    this.peerInfo = {
      name:         this._theirHello.name,
      kemPublicKey: this._theirHello.kemPublicKey,
      sigPublicKey: this._theirHello.sigPublicKey,
      listenPort:   peerPort,
      fingerprint:  buildFingerprint(this._theirHello.sigPublicKey),
    };

    this.id = `${cleanRemoteAddress}:${peerPort}`;

    this.isReady = true;
    this._startPing();
    this.emit('ready', this.peerInfo);
  }

  // ── Frame dispatcher ─────────────────────────────────────────────────────────
  _onFrame(msg) {
    switch (msg.type) {
      case MSG.HANDSHAKE_HELLO:    this._onHello(msg);          break;
      case MSG.HANDSHAKE_KEM_RESP: this._onKemResp(msg);
                                   // Initiator sends its auth immediately after KEM exchange
                                   if (this.role === 'initiator') this._sendAuth();
                                   break;
      case MSG.HANDSHAKE_AUTH:     this._onAuth(msg);           break;
      case MSG.HANDSHAKE_COMPLETE: this._onComplete();          break;
      case MSG.CHAT_MESSAGE:       this._onChatMessage(msg);    break;
      case MSG.TYPING_START:       this.emit('typing', true);   break;
      case MSG.TYPING_STOP:        this.emit('typing', false);  break;
      case MSG.MESSAGE_DELIVERED:  this.emit('receipt', 'delivered', msg.messageId); break;
      case MSG.MESSAGE_READ:       this.emit('receipt', 'read', msg.messageId);      break;
      case MSG.PING:               this._send({ type: MSG.PONG });                   break;
      case MSG.DISCONNECT:         this.socket.destroy();                            break;
    }
  }

  _onChatMessage(msg) {
    if (!this.isReady) return;

    // Replay check
    if (!this.seqTracker.validateRecv(msg.seqNum)) {
      console.warn('[peer] Replay/duplicate message dropped, seqNum:', msg.seqNum);
      return;
    }

    try {
      const plaintext = decryptMessage(this.sessionKey, msg.payload);
      const messageId = msg.messageId;
      this.emit('message', plaintext, messageId, msg.seqNum);
      // Send delivery receipt
      this._send({ type: MSG.MESSAGE_DELIVERED, messageId });
    } catch (err) {
      console.error('[peer] Decrypt failed:', err.message);
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  sendText(text) {
    if (!this.isReady) throw new Error('Peer not ready');
    const messageId = uuidv4();
    const seqNum    = this.seqTracker.nextSend();
    const payload   = encryptMessage(this.sessionKey, text, seqNum);
    this._send({ type: MSG.CHAT_MESSAGE, messageId, seqNum, payload });
    return messageId;
  }

  sendTyping(isTyping) {
    if (!this.isReady) return;
    this._send({ type: isTyping ? MSG.TYPING_START : MSG.TYPING_STOP });
  }

  sendRead(messageId) {
    if (!this.isReady) return;
    this._send({ type: MSG.MESSAGE_READ, messageId });
  }

  close() {
    try { this._send({ type: MSG.DISCONNECT }); } catch {}
    clearInterval(this._pingTimer);
    this.socket.destroy();
  }

  // ── Internal helpers ─────────────────────────────────────────────────────────
  _send(msg) {
    if (!this.socket || this.socket.destroyed) return;
    if (this.socket.readyState !== 'open') {
      this.socket.once('connect', () => {
        try {
          if (!this.socket.destroyed) this.socket.write(encode(msg));
        } catch {}
      });
      return;
    }
    try {
      this.socket.write(encode(msg));
    } catch (err) {
      console.error('[peer] Socket write error:', err.message);
    }
  }

  _startPing() {
    this._pingTimer = setInterval(() => {
      if (this.socket.destroyed) { clearInterval(this._pingTimer); return; }
      this._send({ type: MSG.PING });
    }, PING_INTERVAL);
  }

  _onClose() {
    clearTimeout(this._hsTimeout);
    clearInterval(this._pingTimer);
    this.isReady = false;
    this.emit('disconnect');
  }

  _onError(err) {
    console.error(`[peer ${this.id || 'connecting'}] Socket error:`, err.message);
    this.emit('error', err);
  }
}

module.exports = { PeerConnection };
