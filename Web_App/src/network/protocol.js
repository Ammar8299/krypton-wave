'use strict';
/**
 * protocol.js — TCP message framing
 *
 * Wire format:
 *   [4-byte big-endian uint32 length][UTF-8 JSON payload]
 *
 * Message types:
 *   HANDSHAKE_HELLO       — exchange pubkeys + name + securityConfig
 *   HANDSHAKE_KEM_RESP    — initiator sends ML-KEM-768 ciphertext (if kemEnabled)
 *   HANDSHAKE_AUTH        — Falcon-512 signature over transcript (if sigEnabled)
 *   HANDSHAKE_COMPLETE    — final ACK, session open
 *   ECDH_EXCHANGE         — X25519 pubkey (when kemEnabled === false)
 *   CHAT_MESSAGE          — AES-256-GCM encrypted payload (with pqc_data metadata)
 *   CHAT_MESSAGE_PLAIN    — plaintext message (with pqc_data metadata, when aesEnabled === false)
 *   TYPING_START          — peer started typing
 *   TYPING_STOP           — peer stopped typing
 *   MESSAGE_DELIVERED     — delivery receipt
 *   MESSAGE_READ          — read receipt
 *   PING                  — keepalive
 *   PONG                  — keepalive response
 *   DISCONNECT            — graceful close notification
 *
 * Kπyρτόn_wave~ — cryptographic networking experiment
 */

const MSG = {
  // Handshake
  HANDSHAKE_HELLO:    'HANDSHAKE_HELLO',
  HANDSHAKE_KEM_RESP: 'HANDSHAKE_KEM_RESP',
  HANDSHAKE_AUTH:     'HANDSHAKE_AUTH',
  HANDSHAKE_COMPLETE: 'HANDSHAKE_COMPLETE',

  // Key exchange (KEM-OFF mode)
  ECDH_EXCHANGE:      'ECDH_EXCHANGE',

  // Chat messages (embeds pqc_data metadata)
  CHAT_MESSAGE:       'CHAT_MESSAGE',       // AES encrypted + pqc_data
  CHAT_MESSAGE_PLAIN: 'CHAT_MESSAGE_PLAIN', // AES disabled — plaintext + pqc_data

  // Control
  TYPING_START:       'TYPING_START',
  TYPING_STOP:        'TYPING_STOP',
  MESSAGE_DELIVERED:  'MESSAGE_DELIVERED',
  MESSAGE_READ:       'MESSAGE_READ',
  PING:               'PING',
  PONG:               'PONG',
  DISCONNECT:         'DISCONNECT',
};

/**
 * Encode a message object into a length-prefixed buffer.
 * @param {object} msg — { type, ...payload }
 * @returns {Buffer}
 */
function encode(msg) {
  const json = JSON.stringify(msg);
  const body = Buffer.from(json, 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}

/**
 * Stateful stream parser.
 * Feed raw TCP chunks; fires onMessage(parsedObject) for each complete frame.
 */
class FrameParser {
  constructor(onMessage) {
    this._buf   = Buffer.alloc(0);
    this._onMsg = onMessage;
  }

  push(chunk) {
    this._buf = Buffer.concat([this._buf, chunk]);
    this._drain();
  }

  _drain() {
    while (this._buf.length >= 4) {
      const bodyLen = this._buf.readUInt32BE(0);
      if (this._buf.length < 4 + bodyLen) break; // wait for more data
      const body = this._buf.slice(4, 4 + bodyLen);
      this._buf  = this._buf.slice(4 + bodyLen);
      try {
        const msg = JSON.parse(body.toString('utf8'));
        this._onMsg(msg);
      } catch (err) {
        console.error('[protocol] Failed to parse frame:', err.message);
      }
    }
  }
}

module.exports = { MSG, encode, FrameParser };
