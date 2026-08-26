'use strict';
/**
 * pqc.js — Post-Quantum Cryptography primitives
 *
 * KEM  : ML-KEM-768 (FIPS 203) via @noble/post-quantum
 * Sign : Falcon-512 (FIPS 206) via @noble/post-quantum — REAL post-quantum signing
 * ECDH : X25519/P-256 via Node.js built-in — fallback when KEM is OFF
 *
 * Loaded dynamically via ESM import() for compatibility with Electron's CJS environment.
 *
 * All keys and ciphertexts are stored/transmitted as Base64 strings.
 *
 * Kπyρτόn_wave~ — cryptographic networking experiment
 */

const { randomBytes } = require('crypto');
const crypto          = require('crypto');

let ml_kem768 = null;
let falcon512 = null;

// Immediately begin dynamic ESM import at module load
const initPromise = (async () => {
  try {
    const [kemMod, falconMod] = await Promise.all([
      import('@noble/post-quantum/ml-kem.js'),
      import('@noble/post-quantum/falcon.js'),
    ]);
    ml_kem768 = kemMod.ml_kem768;
    falcon512 = falconMod.falcon512;
  } catch (err) {
    console.error('[pqc] Error loading post-quantum ES modules:', err);
  }
})();

/**
 * Ensures post-quantum modules are fully loaded before cryptographic operations.
 * Must be awaited at application startup (e.g. in app.whenReady or loadOrCreateIdentity).
 */
async function initPQC() {
  await initPromise;
  if (!ml_kem768 || !falcon512) {
    throw new Error('[pqc] Post-quantum modules failed to initialize.');
  }
}

function ensureReady() {
  if (!ml_kem768 || !falcon512) {
    throw new Error('[pqc] ML-KEM-768 / Falcon-512 not yet initialized. Call and await initPQC() first.');
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toB64   = (buf) => Buffer.from(buf).toString('base64');
const fromB64 = (str) => Uint8Array.from(Buffer.from(str, 'base64'));

// ── ML-KEM-768 ────────────────────────────────────────────────────────────────
/**
 * Generate a fresh ML-KEM-768 keypair.
 * @returns {{ kemPublicKey: string, kemSecretKey: string }} Base64-encoded keys
 */
function kemKeyGen() {
  ensureReady();
  const keys = ml_kem768.keygen();
  return {
    kemPublicKey: toB64(keys.publicKey),
    kemSecretKey: toB64(keys.secretKey),
  };
}

/**
 * Encapsulate: produce a ciphertext and shared secret using the peer's KEM public key.
 * Called by the initiator when ML-KEM is enabled.
 * @param {string} peerKemPublicKeyB64
 * @returns {{ ciphertext: string, sharedSecret: Uint8Array }}
 */
function kemEncapsulate(peerKemPublicKeyB64) {
  ensureReady();
  const pubKey = fromB64(peerKemPublicKeyB64);
  const { cipherText, sharedSecret } = ml_kem768.encapsulate(pubKey);
  return {
    ciphertext: toB64(cipherText),
    sharedSecret,               // raw 32-byte Uint8Array — direct AES-256 session key
  };
}

/**
 * Decapsulate: recover the shared secret using our KEM secret key.
 * Called by the responder when ML-KEM is enabled.
 * @param {string} kemSecretKeyB64
 * @param {string} ciphertextB64
 * @returns {Uint8Array} sharedSecret
 */
function kemDecapsulate(kemSecretKeyB64, ciphertextB64) {
  ensureReady();
  const secretKey  = fromB64(kemSecretKeyB64);
  const cipherText = fromB64(ciphertextB64);
  return ml_kem768.decapsulate(cipherText, secretKey);
}

// ── Falcon-512 Signatures (FIPS 206) ─────────────────────────────────────────
/**
 * Generate a fresh Falcon-512 signing keypair.
 * publicKey: 897 bytes, secretKey: 1281 bytes
 * @returns {{ sigPublicKey: string, sigSecretKey: string }}
 */
function sigKeyGen() {
  ensureReady();
  const keys = falcon512.keygen();
  return {
    sigPublicKey: toB64(keys.publicKey),
    sigSecretKey: toB64(keys.secretKey),
  };
}

/**
 * Sign arbitrary data with our Falcon-512 signing secret key.
 * Uses the "attached" mode: signature is prepended to the message.
 * @param {string} sigSecretKeyB64
 * @param {Uint8Array|Buffer} data
 * @returns {string} Base64-encoded sealed payload (sig + msg)
 */
function sign(sigSecretKeyB64, data) {
  ensureReady();
  const secretKey = fromB64(sigSecretKeyB64);
  const msg = data instanceof Uint8Array ? data : new Uint8Array(data);
  const sealed = falcon512.attached.seal(msg, secretKey);
  return toB64(sealed);
}

/**
 * Verify a Falcon-512 signature.
 * @param {string} sigPublicKeyB64
 * @param {Uint8Array|Buffer} originalData  — the original message that was signed
 * @param {string} sealedB64               — the sealed (sig+msg) from sign()
 * @returns {boolean}
 */
function verify(sigPublicKeyB64, originalData, sealedB64) {
  ensureReady();
  try {
    const publicKey = fromB64(sigPublicKeyB64);
    const sealed    = fromB64(sealedB64);
    const recovered = falcon512.attached.open(sealed, publicKey);
    if (!recovered) return false;
    // Verify recovered message matches original
    const orig = originalData instanceof Uint8Array ? originalData : new Uint8Array(originalData);
    if (recovered.length !== orig.length) return false;
    for (let i = 0; i < orig.length; i++) {
      if (recovered[i] !== orig[i]) return false;
    }
    return true;
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

// ── X25519 / ECDH (KEM-OFF mode fallback) ────────────────────────────────────
/**
 * Generate an ephemeral ECDH keypair for use when ML-KEM is disabled.
 * Classical security only — not quantum-safe. For experiment/education.
 * @returns {{ ecdhObj: ECDH, publicKeyB64: string }}
 */
function ecdhKeyGen() {
  const ecdh = crypto.createECDH('prime256v1');
  const publicKey = ecdh.generateKeys();
  return {
    ecdhObj:      ecdh,
    publicKeyB64: toB64(publicKey),
  };
}

/**
 * Compute ECDH shared secret from peer's public key.
 * @param {ECDH} ecdhObj         — our local ECDH object (from ecdhKeyGen)
 * @param {string} peerPubKeyB64 — peer's public key (65 bytes, uncompressed)
 * @returns {Uint8Array} sharedSecret
 */
function ecdhComputeSecret(ecdhObj, peerPubKeyB64) {
  const peerPubKey = Buffer.from(fromB64(peerPubKeyB64));
  const secret = ecdhObj.computeSecret(peerPubKey);
  return new Uint8Array(secret);
}

module.exports = {
  initPQC,
  kemKeyGen,
  kemEncapsulate,
  kemDecapsulate,
  sigKeyGen,
  sign,
  verify,
  buildTranscript,
  ecdhKeyGen,
  ecdhComputeSecret,
  toB64,
  fromB64,
};
