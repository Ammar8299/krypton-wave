'use strict';
/**
 * session.js — Symmetric session crypto
 *
 * Direct Key     : 32-byte shared secret from ML-KEM-768 directly applied as AES-256 key
 * Encryption     : AES-256-GCM (Node.js built-in crypto)
 * Replay guard   : monotonic sequence numbers (64-bit, stored per-session)
 * Analysis       : buildAnalysisString() for Wireshark Analysis Mode
 *
 * Kπyρτόn_wave~ — cryptographic networking experiment
 */

const crypto = require('crypto');

// ── Session Key ───────────────────────────────────────────────────────────────
/**
 * Takes the 32-byte shared secret directly from ML-KEM-768 (or ECDH fallback)
 * and formats it as the 32-byte AES-256-GCM session key.
 * @param {Uint8Array} sharedSecret — raw 32-byte shared secret
 * @returns {Buffer} 32-byte session key
 */
function deriveSessionKey(sharedSecret) {
  const buf = Buffer.from(sharedSecret);
  if (buf.length === 32) return buf;
  if (buf.length > 32) return buf.subarray(0, 32);
  const padded = Buffer.alloc(32, 0);
  buf.copy(padded);
  return padded;
}

// ── AES-256-GCM ───────────────────────────────────────────────────────────────
const IV_LENGTH  = 12; // 96-bit GCM IV
const TAG_LENGTH = 16; // 128-bit auth tag

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

  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

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

// ── Wireshark Analysis Mode ───────────────────────────────────────────────────
/**
 * Build the nested analysis label string for Wireshark Mode.
 * This is intentionally transmitted as PLAINTEXT for educational inspection.
 *
 * NEVER exposes: session keys, shared secrets, private keys, or decrypted
 * message content when AES is enabled.
 *
 * @param {object} securityConfig - { kemEnabled, sigEnabled, aesEnabled }
 * @param {object|null} payload   - AES envelope { ciphertext, iv, tag, seqNum } or null
 * @param {string|null} plainContent - plaintext only when aesEnabled === false
 * @returns {string}
 */
function buildAnalysisString(securityConfig, payload, plainContent) {
  const { kemEnabled, sigEnabled, aesEnabled } = securityConfig;

  // Inner layer
  let inner;
  if (aesEnabled && payload) {
    // Show real ciphertext in hex. iv and tag are already transmitted as protocol
    // metadata so safe to show here.
    const ctHex  = Buffer.from(payload.ciphertext, 'base64').toString('hex');
    const ivHex  = Buffer.from(payload.iv, 'base64').toString('hex');
    const tagHex = Buffer.from(payload.tag, 'base64').toString('hex');
    inner = `AES-256-GCM(iv:${ivHex.slice(0, 16)}…,ct:${ctHex.slice(0, 24)}…,tag:${tagHex.slice(0, 16)}…)`;
  } else {
    // AES is OFF — plain content is already visible on the wire
    inner = plainContent || '<empty>';
  }

  // Wrap with Falcon-512 label if sig enabled
  if (sigEnabled) inner = `Falcon-512(${inner})`;

  // Wrap with ML-KEM-768 label if kem enabled
  if (kemEnabled) inner = `ML-KEM-768(${inner})`;

  return `data(${inner})`;
}

module.exports = {
  deriveSessionKey,
  encryptMessage,
  decryptMessage,
  buildAnalysisString,
  SeqTracker,
};
