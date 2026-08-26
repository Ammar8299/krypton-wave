'use strict';
/**
 * identity.js — Long-term identity keypair management
 *
 * Generates and persists:
 *   - ML-KEM-768 keypair (for key exchange)
 *   - Ed25519 keypair (for authentication / identity verification)
 *   - A human-readable fingerprint (hex of SHA-256 of sigPublicKey)
 *
 * Stored at: Electron.app.getPath('userData')/identity.json
 * Keys are Base64-encoded strings in the JSON file.
 */

const { app }          = require('electron');
const path             = require('path');
const fs               = require('fs');
const crypto           = require('crypto');
const { kemKeyGen, sigKeyGen, toB64, fromB64 } = require('./pqc');

function getIdentityPath() {
  return path.join(app.getPath('userData'), 'identity.json');
}

/**
 * Build a colon-separated fingerprint from a Base64 public key.
 * Format: "A3F2:09B1:C7D4:..." (8 groups of 4 hex chars)
 */
function buildFingerprint(sigPublicKeyB64) {
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(sigPublicKeyB64, 'base64'))
    .digest('hex')
    .toUpperCase();
  return hash.match(/.{4}/g).join(':');
}

/**
 * Load identity from disk, or generate a fresh one if first run.
 * @returns {object} identity — { kemPublicKey, kemSecretKey, sigPublicKey, sigSecretKey, fingerprint, name, listenPort }
 */
async function loadOrCreateIdentity() {
  const identityPath = getIdentityPath();

  if (fs.existsSync(identityPath)) {
    try {
      const raw = fs.readFileSync(identityPath, 'utf8');
      const id  = JSON.parse(raw);
      // Recompute fingerprint in case of format change
      id.fingerprint = buildFingerprint(id.sigPublicKey);
      return id;
    } catch (err) {
      console.warn('[identity] Failed to load identity, regenerating:', err.message);
    }
  }

  // First run — generate fresh keypairs
  const kemKeys = kemKeyGen();
  const sigKeys = sigKeyGen();
  const identity = {
    ...kemKeys,
    ...sigKeys,
    fingerprint: buildFingerprint(sigKeys.sigPublicKey),
    name: 'Anonymous',
    listenPort: 5050,
    createdAt: Date.now(),
  };

  saveIdentity(identity);
  return identity;
}

/**
 * Persist identity to disk.
 */
function saveIdentity(identity) {
  const identityPath = getIdentityPath();
  const dir = path.dirname(identityPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(identityPath, JSON.stringify(identity, null, 2), 'utf8');
}

module.exports = { loadOrCreateIdentity, saveIdentity, buildFingerprint };
