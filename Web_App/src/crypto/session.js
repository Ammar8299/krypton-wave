'use strict';
/**
 * session.js — Symmetric session crypto
 *
 * Key derivation : HKDF-SHA256  (Node.js built-in crypto)
 * Encryption     : AES-256-GCM  (Node.js built-in crypto)
 * Replay guard   : monotonic sequence numbers (64-bit, stored per-session)
 */

const crypto = require('crypto');

// ── HKDF-SHA256 ───────────────────────────────────────────────────────────────
/**
 * Derive a 32-byte AES session key from the ML-KEM shared secret.
 * @param {Uint8Array} sharedSecret   — raw shared secret from ML-KEM decap/encap
 * @param {string}     info           — context label e.g. 'quantusecure-v1-chat'
 * @param {Buffer}     [salt]         — optional random salt
 * @returns {Buffer}  32-byte session key
 */
function deriveSessionKey(sharedSecret, info = 'quantusecure-v1-chat', salt) {
  const keyMaterial = Buffer.from(sharedSecret);
  const saltBuf = salt || Buffer.alloc(32, 0);
  // HKDF extract
  const prk = crypto.createHmac('sha256', saltBuf).update(keyMaterial).digest();
  // HKDF expand
  const infoBuffer = Buffer.from(info, 'utf8');
  const t1 = crypto.createHmac('sha256', prk)
    .update(Buffer.concat([infoBuffer, Buffer.from([0x01])]))
    .digest();
  return t1.slice(0, 32);
}

// ── AES-256-GCM ───────────────────────────────────────────────────────────────
const IV_LENGTH   = 12; // 96-bit GCM IV
const TAG_LENGTH  = 16; // 128-bit auth tag

/**
 * Encrypt a plaintext message.
 * @param {Buffer}  sessionKey   — 32-byte key from deriveSessionKey()
 * @param {string}  plaintext    — UTF-8 message text
 * @param {number}  seqNum       — monotonic counter (for AAD, replay protection)
 * @returns {{ ciphertext: string, iv: string, tag: string, seqNum: number }}
 */
function encryptMessage(sessionKey, plaintext, seqNum) {
  const iv  = crypto.randomBytes(IV_LENGTH);
  const aad = buildAAD(seqNum);

  const cipher = crypto.createCipheriv('aes-256-gcm', sessionKey, iv);
  cipher.setAAD(aad);

  const enc  = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag  = cipher.getAuthTag();

  return {
    ciphertext: enc.toString('base64'),
    iv:  iv.toString('base64'),
    tag: tag.toString('base64'),
    seqNum,
  };
}

/**
 * Decrypt an encrypted message envelope.
 * @param {Buffer}  sessionKey
 * @param {{ ciphertext: string, iv: string, tag: string, seqNum: number }} envelope
 * @returns {string} plaintext
 * @throws on authentication failure or replay
 */
function decryptMessage(sessionKey, envelope) {
  const { ciphertext, iv, tag, seqNum } = envelope;
  const aad = buildAAD(seqNum);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    sessionKey,
    Buffer.from(iv, 'base64')
  );
  decipher.setAAD(aad);
  decipher.setAuthTag(Buffer.from(tag, 'base64'));

  const dec = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}

/** Build Additional Authenticated Data from the sequence number. */
function buildAAD(seqNum) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(seqNum));
  return buf;
}

// ── Sequence number tracker ───────────────────────────────────────────────────
class SeqTracker {
  constructor() {
    this.sendSeq = 0;
    this.recvSeq = -1;
  }
  nextSend() { return ++this.sendSeq; }
  /** Returns true if seqNum is valid (strictly greater than last seen). */
  validateRecv(seqNum) {
    if (seqNum <= this.recvSeq) return false; // replay or reorder
    this.recvSeq = seqNum;
    return true;
  }
}

module.exports = { deriveSessionKey, encryptMessage, decryptMessage, SeqTracker };
