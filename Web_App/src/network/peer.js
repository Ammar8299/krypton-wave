'use strict';
/**
 * peer.js — PeerConnection class
 *
 * Manages one TCP socket to/from a peer.
 * Orchestrates a config-aware handshake:
 *
 *   1. Both sides send HANDSHAKE_HELLO (pubkeys + name + securityConfig)
 *
 *   if kemEnabled:
 *     2. Initiator → HANDSHAKE_KEM_RESP (ML-KEM-768 ciphertext)
 *   else:
 *     2a. Initiator → ECDH_EXCHANGE (X25519 pubkey)
 *     2b. Responder → ECDH_EXCHANGE (X25519 pubkey)
 *
 *   if sigEnabled:
 *     3. Both → HANDSHAKE_AUTH (Falcon-512 signature over transcript)
 *
 *   4. Both → HANDSHAKE_COMPLETE
 *   → Session key derived. Encrypted or plaintext chat begins.
 *
 * Every CHAT_MESSAGE and CHAT_MESSAGE_PLAIN contains human-readable `pqc_data`
 * metadata reflecting the active cryptographic layer configuration for Wireshark inspection.
 *
 * Events:
 *   onHandshakeComplete(peerInfo)
 *   onMessage(decryptedText, messageId, seqNum)
 *   onTyping(isTyping)
 *   onReceipt(type, messageId)
 *   onDisconnect()
 *
 * Kπyρτόn_wave~ — cryptographic networking experiment
 */

const { EventEmitter } = require('events');
const { v4: uuidv4 }   = require('uuid');
const { MSG, encode, FrameParser } = require('./protocol');
const {
  kemEncapsulate, kemDecapsulate,
  sign, verify, buildTranscript,
  ecdhKeyGen, ecdhComputeSecret,
} = require('../crypto/pqc');
const {
  deriveSessionKey, encryptMessage, decryptMessage,
  buildPQCData, SeqTracker,
} = require('../crypto/session');

const PING_INTERVAL      = 20_000; // 20 s
const HANDSHAKE_TIMEOUT  = 30_000; // 30 s (longer for Falcon-512 keygen)

// Default security config (all 3 real crypto layers ON)
const DEFAULT_CONFIG = {
  kemEnabled: true,
  sigEnabled: true,
  aesEnabled: true,
};

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
   * @param {object} [securityConfig] — active crypto config
   * @param {function} [onCryptoEvent] — optional callback for live log events
   */
  constructor(socket, role, identity, securityConfig = DEFAULT_CONFIG, onCryptoEvent = null) {
    super();
    this.socket         = socket;
    try { this.socket.setNoDelay(true); } catch {}
    this.role           = role;
    this.identity       = identity;
    this.config         = { ...DEFAULT_CONFIG, ...securityConfig };
    this._onCryptoEvent = onCryptoEvent;

    this.id         = null;
    this.peerInfo   = null;
    this.sessionKey = null;
    this.seqTracker = new SeqTracker();
    this.isReady    = false;
    this._pingTimer = null;

    // Handshake state
    this._theirHello    = null;
    this._myHello       = null;
    this._ciphertext    = null;
    this._sharedSecret  = null;
    this._ecdhObj       = null;           // used in KEM-OFF mode
    this._theirEcdhKey  = null;           // peer's ECDH public key
    this._ecdhDone      = false;          // both ECDH keys exchanged
    this._pendingAuthVerified = false;
    this._pendingComplete     = false;
    this._authSent            = false;    // prevent double AUTH send

    // Frame parser
    this._parser = new FrameParser((msg) => this._onFrame(msg));

    socket.on('data',  (chunk) => this._parser.push(chunk));
    socket.on('close', ()      => this._onClose());
    socket.on('error', (err)   => this._onError(err));

    // Handshake timeout
    this._hsTimeout = setTimeout(() => {
      if (!this.isReady) {
        this.emit('error', new Error('Handshake timed out'));
        this.socket.destroy();
      }
    }, HANDSHAKE_TIMEOUT);

    // Start handshake once connected
    if (this.role === 'initiator') {
      if (socket.readyState === 'open') {
        this._sendHello();
      } else {
        socket.once('connect', () => this._sendHello());
      }
    } else {
      this._sendHello();
    }
  }

  // ── Step 1: HELLO ──────────────────────────────────────────────────────────
  _sendHello() {
    const hello = {
      type:          MSG.HANDSHAKE_HELLO,
      kemPublicKey:  this.identity.kemPublicKey,
      sigPublicKey:  this.identity.sigPublicKey,
      name:          this.identity.name,
      listenPort:    this.identity.listenPort || 5050,
      sigAlgorithm:  this.identity.sigAlgorithm || 'Falcon-512',
      // Initiator's config is embedded and is authoritative
      securityConfig: this.config,
    };
    this._myHello = { ...hello };
    this._send(hello);
  }

  _onHello(msg) {
    this._theirHello = msg;

    // Responder adopts the initiator's security config
    if (this.role === 'responder') {
      if (msg.securityConfig) {
        this.config = { ...DEFAULT_CONFIG, ...msg.securityConfig };
      }
      // In KEM-OFF mode, responder needs to generate its ECDH key now
      if (!this.config.kemEnabled) {
        const { ecdhObj, publicKeyB64 } = ecdhKeyGen();
        this._ecdhObj = ecdhObj;
        this._send({ type: MSG.ECDH_EXCHANGE, publicKey: publicKeyB64, role: 'responder' });
      }
    } else {
      // Initiator: start key exchange now that we have peer's pubkey
      if (this.config.kemEnabled) {
        // ML-KEM: encapsulate against peer's KEM public key
        const { ciphertext, sharedSecret } = kemEncapsulate(msg.kemPublicKey);
        this._ciphertext   = ciphertext;
        this._sharedSecret = sharedSecret;
        this._send({ type: MSG.HANDSHAKE_KEM_RESP, ciphertext });
        // Auth is sent after KEM — _sendAuth will be called from _onFrame KEM_RESP handler
        // For initiator, we don't have a KEM_RESP incoming — send auth now
        this._maybeSendAuth();
      } else {
        // ECDH-OFF mode: initiator generates and sends its ECDH pubkey
        const { ecdhObj, publicKeyB64 } = ecdhKeyGen();
        this._ecdhObj = ecdhObj;
        this._send({ type: MSG.ECDH_EXCHANGE, publicKey: publicKeyB64, role: 'initiator' });
      }
    }
  }

  // ── Step 2a: ECDH Exchange (KEM-OFF mode) ──────────────────────────────────
  _onEcdhExchange(msg) {
    this._theirEcdhKey = msg.publicKey;

    if (this.role === 'initiator') {
      // Initiator received responder's ECDH key — compute shared secret
      this._sharedSecret = ecdhComputeSecret(this._ecdhObj, msg.publicKey);
      this._ecdhDone = true;
      this._maybeSendAuth();
    } else {
      // Responder received initiator's ECDH key — compute shared secret
      if (this._ecdhObj) {
        this._sharedSecret = ecdhComputeSecret(this._ecdhObj, msg.publicKey);
        this._ecdhDone = true;
        this._maybeSendAuth();
      }
    }
  }

  // ── Step 2b: ML-KEM response (KEM-ON mode, responder only) ─────────────────
  _onKemResp(msg) {
    // Only responder handles this
    this._ciphertext   = msg.ciphertext;
    this._sharedSecret = kemDecapsulate(this.identity.kemSecretKey, msg.ciphertext);
    this._maybeSendAuth();
  }

  // ── Step 3: AUTH (Falcon-512 signature) ────────────────────────────────────
  _maybeSendAuth() {
    if (this._authSent) return;
    if (!this._sharedSecret) return; // wait until key exchange completes

    this._authSent = true;

    if (this.config.sigEnabled) {
      const transcript = buildTranscript(this._myHello, this._theirHello, this._ciphertext);
      const signature  = sign(this.identity.sigSecretKey, transcript);
      this._send({ type: MSG.HANDSHAKE_AUTH, signature });
    } else {
      // Auth disabled — skip straight to COMPLETE
      this._pendingAuthVerified = true;
      this._send({ type: MSG.HANDSHAKE_COMPLETE });
      this._tryFinalize();
    }
  }

  _onAuth(msg) {
    if (this.config.sigEnabled) {
      const transcript = buildTranscript(this._theirHello, this._myHello, this._ciphertext);
      const valid = verify(this._theirHello.sigPublicKey, transcript, msg.signature);
      if (!valid) {
        this.emit('error', new Error('Falcon-512 handshake auth failed: invalid signature'));
        this.socket.destroy();
        return;
      }
    }
    this._pendingAuthVerified = true;
    this._send({ type: MSG.HANDSHAKE_COMPLETE });
    this._tryFinalize();
  }

  // ── Step 4: COMPLETE ───────────────────────────────────────────────────────
  _onComplete() {
    this._pendingComplete = true;
    this._tryFinalize();
  }

  _tryFinalize() {
    if (this._pendingAuthVerified && this._pendingComplete) this._finalizeHandshake();
  }

  _finalizeHandshake() {
    if (this.isReady) return; // guard double-fire
    clearTimeout(this._hsTimeout);

    // Direct session key from ML-KEM-768 / ECDH shared secret
    this.sessionKey = deriveSessionKey(this._sharedSecret);

    const cleanRemoteAddress = cleanIp(this.socket.remoteAddress);
    const peerPort = this._theirHello.listenPort || this.socket.remotePort;

    const { buildFingerprint } = require('../crypto/identity');
    this.peerInfo = {
      name:         this._theirHello.name,
      kemPublicKey: this._theirHello.kemPublicKey,
      sigPublicKey: this._theirHello.sigPublicKey,
      sigAlgorithm: this._theirHello.sigAlgorithm || 'Falcon-512',
      listenPort:   peerPort,
      fingerprint:  buildFingerprint(this._theirHello.sigPublicKey),
      securityConfig: this.config,
    };

    this.id = `${cleanRemoteAddress}:${peerPort}`;
    this.isReady = true;
    this._startPing();
    this.emit('ready', this.peerInfo);
  }

  // ── Frame dispatcher ───────────────────────────────────────────────────────
  _onFrame(msg) {
    switch (msg.type) {
      case MSG.HANDSHAKE_HELLO:    this._onHello(msg);          break;
      case MSG.HANDSHAKE_KEM_RESP: this._onKemResp(msg);        break;
      case MSG.HANDSHAKE_AUTH:     this._onAuth(msg);            break;
      case MSG.HANDSHAKE_COMPLETE: this._onComplete();           break;
      case MSG.ECDH_EXCHANGE:      this._onEcdhExchange(msg);   break;
      case MSG.CHAT_MESSAGE:       this._onChatMessage(msg);    break;
      case MSG.CHAT_MESSAGE_PLAIN: this._onPlainMessage(msg);   break;
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
      this._send({ type: MSG.MESSAGE_DELIVERED, messageId });
      this._emitCryptoEvent('received', messageId, msg.seqNum, true, msg.payload, null);
    } catch (err) {
      console.error('[peer] Decrypt failed:', err.message);
    }
  }

  _onPlainMessage(msg) {
    if (!this.isReady) return;
    const messageId = msg.messageId || uuidv4();
    this.emit('message', msg.content, messageId, 0);
    this._send({ type: MSG.MESSAGE_DELIVERED, messageId });
    this._emitCryptoEvent('received', messageId, 0, false, null, msg.content);
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  sendText(text) {
    if (!this.isReady) throw new Error('Peer not ready');
    const messageId = uuidv4();

    if (this.config.aesEnabled && this.sessionKey) {
      // Encrypted message with human-readable pqc_data metadata
      const seqNum   = this.seqTracker.nextSend();
      const payload  = encryptMessage(this.sessionKey, text, seqNum);
      const pqc_data = buildPQCData(this.config, payload.ciphertext, null);

      this._send({
        type: MSG.CHAT_MESSAGE,
        messageId,
        seqNum,
        payload,
        pqc_data,
      });
      this._emitCryptoEvent('sent', messageId, seqNum, true, payload, null);
    } else {
      // Plaintext message with human-readable pqc_data metadata (AES disabled)
      const pqc_data = buildPQCData(this.config, null, text);

      this._send({
        type: MSG.CHAT_MESSAGE_PLAIN,
        messageId,
        content: text,
        pqc_data,
      });
      this._emitCryptoEvent('sent', messageId, 0, false, null, text);
    }

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

  // ── Internal helpers ───────────────────────────────────────────────────────
  _send(msg) {
    if (!this.socket || this.socket.destroyed) return;
    const buf = encode(msg);

    if (msg.type === MSG.CHAT_MESSAGE || msg.type === MSG.CHAT_MESSAGE_PLAIN) {
      console.log(`[NETWORK WIRE] Sent ${msg.type} (${buf.length} bytes over TCP)`);
      console.log(`[NETWORK WIRE] pqc_data: "${msg.pqc_data}"`);
    }

    if (this.socket.readyState !== 'open') {
      this.socket.once('connect', () => {
        try { if (!this.socket.destroyed) this.socket.write(buf); } catch {}
      });
      return;
    }
    try {
      this.socket.write(buf);
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

  _emitCryptoEvent(direction, messageId, seqNum, encrypted, payload, plainContent) {
    if (typeof this._onCryptoEvent !== 'function') return;
    this._onCryptoEvent({
      id:         messageId,
      direction,
      seqNum,
      encrypted,
      timestamp:  Date.now(),
      algo:       encrypted ? 'AES-256-GCM' : 'PLAINTEXT',
      iv:         encrypted && payload ? payload.iv : null,
      tag:        encrypted && payload ? payload.tag : null,
      byteSize:   encrypted && payload ? Buffer.from(payload.ciphertext, 'base64').length : (plainContent || '').length,
      config:     { ...this.config },
    });
  }
}

module.exports = { PeerConnection };
