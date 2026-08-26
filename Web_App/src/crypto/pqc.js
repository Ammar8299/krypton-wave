'use strict';
/**
 * pqc.js — Post-Quantum Cryptography primitives
 *
 * KEM  : ML-KEM-768 (FIPS 203) via @noble/post-quantum
 * Sign : Ed25519 via @noble/curves  (drop-in stand-in; swap for Falcon-512
 *        via liboqs-js when native build is available)
 *
 * All keys and ciphertexts are stored/transmitted as Base64 strings.
 */

const { ml_kem768 }       = require('@noble/post-quantum/ml-kem');
const { ed25519 }         = require('@noble/curves/ed25519');
const { randomBytes }     = require('crypto');

// ── Helpers ───────────────────────────────────────────────────────────────────
const toB64  = (buf) => Buffer.from(buf).toString('base64');
const fromB64 = (str) => Uint8Array.from(Buffer.from(str, 'base64'));

// ── ML-KEM-768 ────────────────────────────────────────────────────────────────
/**
 * Generate a fresh ML-KEM-768 keypair.
 * @returns {{ kemPublicKey: string, kemSecretKey: string }} Base64-encoded keys
 */
function kemKeyGen() {
  const keys = ml_kem768.keygen();
  return {
    kemPublicKey: toB64(keys.publicKey),
    kemSecretKey: toB64(keys.secretKey),
  };
}

/**
 * Encapsulate: produce a ciphertext and shared secret using the peer's KEM public key.
 * Called by the initiator.
 * @param {string} peerKemPublicKeyB64
 * @returns {{ ciphertext: string, sharedSecret: Uint8Array }}
 */
function kemEncapsulate(peerKemPublicKeyB64) {
  const pubKey = fromB64(peerKemPublicKeyB64);
  const { cipherText, sharedSecret } = ml_kem768.encapsulate(pubKey);
  return {
    ciphertext: toB64(cipherText),
    sharedSecret,               // raw Uint8Array — feed directly into HKDF
  };
}

/**
 * Decapsulate: recover the shared secret using our KEM secret key.
 * Called by the responder.
 * @param {string} kemSecretKeyB64
 * @param {string} ciphertextB64
 * @returns {Uint8Array} sharedSecret
 */
function kemDecapsulate(kemSecretKeyB64, ciphertextB64) {
  const secretKey   = fromB64(kemSecretKeyB64);
  const cipherText  = fromB64(ciphertextB64);
  return ml_kem768.decapsulate(cipherText, secretKey);
}

// ── Ed25519 Signatures (Falcon-512 stand-in) ──────────────────────────────────
/**
 * Generate a fresh signing keypair.
 * @returns {{ sigPublicKey: string, sigSecretKey: string }}
 */
function sigKeyGen() {
  const secretKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(secretKey);
  return {
    sigPublicKey: toB64(publicKey),
    sigSecretKey: toB64(secretKey),
  };
}

/**
 * Sign arbitrary data with our signing secret key.
 * @param {string} sigSecretKeyB64
 * @param {Uint8Array|Buffer} data
 * @returns {string} Base64-encoded signature
 */
function sign(sigSecretKeyB64, data) {
  const secretKey = fromB64(sigSecretKeyB64);
  const sig = ed25519.sign(data instanceof Uint8Array ? data : new Uint8Array(data), secretKey);
  return toB64(sig);
}

/**
 * Verify a signature against a public key.
 * @param {string} sigPublicKeyB64
 * @param {Uint8Array|Buffer} data
 * @param {string} signatureB64
 * @returns {boolean}
 */
function verify(sigPublicKeyB64, data, signatureB64) {
  try {
    const publicKey = fromB64(sigPublicKeyB64);
    const sig       = fromB64(signatureB64);
    return ed25519.verify(sig, data instanceof Uint8Array ? data : new Uint8Array(data), publicKey);
  } catch {
    return false;
  }
}

/**
 * Build a transcript hash for handshake authentication.
 * Prevents signature replay across sessions.
 */
function buildTranscript(helloA, helloB, ciphertext) {
  const str = JSON.stringify({ helloA, helloB, ciphertext });
  return Buffer.from(str);
}

module.exports = {
  kemKeyGen,
  kemEncapsulate,
  kemDecapsulate,
  sigKeyGen,
  sign,
  verify,
  buildTranscript,
  toB64,
  fromB64,
};
