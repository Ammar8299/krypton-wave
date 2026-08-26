'use strict';
/**
 * identity.js — Long-term identity keypair management
 *
 * Generates and persists:
 *   - ML-KEM-768 keypair (for key exchange)
 *   - Falcon-512 keypair (FIPS 206, for authentication / identity signing)
 *   - A human-readable fingerprint (hex of SHA-256 of sigPublicKey)
 *
 * Stored at: Electron.app.getPath('userData')/identity.json
 * Keys are Base64-encoded strings in the JSON file.
 *
 * NOTE: If an existing identity.json was created with Ed25519 keys (the old
 * algorithm), it will have sigAlgorithm !== 'Falcon-512' or be missing that
 * field. In that case the identity is automatically regenerated with Falcon-512.
 *
 * Kπyρτόn_wave~ — cryptographic networking experiment
 */

const { app }    = require('electron');
const path       = require('path');
const fs         = require('fs');
const crypto     = require('crypto');
const { initPQC, kemKeyGen, sigKeyGen, toB64, fromB64 } = require('./pqc');

const CURRENT_SIG_ALGORITHM = 'Falcon-512';

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
 * Load identity from disk, or generate a fresh one if first run
 * or if the stored identity uses a different signing algorithm.
 * @returns {object} identity — { kemPublicKey, kemSecretKey, sigPublicKey, sigSecretKey,
 *                               fingerprint, name, listenPort, sigAlgorithm }
 */
async function loadOrCreateIdentity() {
  await initPQC();
  const identityPath = getIdentityPath();

  if (fs.existsSync(identityPath)) {
    try {
      const raw = fs.readFileSync(identityPath, 'utf8');
      const id  = JSON.parse(raw);

      // Check that the stored identity uses the current sig algorithm.
      // If it was generated with Ed25519 (or any other algorithm), regenerate.
      if (id.sigAlgorithm && id.sigAlgorithm === CURRENT_SIG_ALGORITHM) {
        id.fingerprint = buildFingerprint(id.sigPublicKey);
        return id;
      } else {
        console.log('[identity] Algorithm mismatch — regenerating identity with', CURRENT_SIG_ALGORITHM);
        // Back up old identity before regenerating
        const backupPath = identityPath + '.backup-' + Date.now();
        fs.copyFileSync(identityPath, backupPath);
        console.log('[identity] Old identity backed up to:', backupPath);
      }
    } catch (err) {
      console.warn('[identity] Failed to load identity, regenerating:', err.message);
    }
  }

  // First run or algorithm migration — generate fresh keypairs
  const kemKeys = kemKeyGen();
  const sigKeys = sigKeyGen();
  const identity = {
    ...kemKeys,
    ...sigKeys,
    fingerprint:   buildFingerprint(sigKeys.sigPublicKey),
    sigAlgorithm:  CURRENT_SIG_ALGORITHM,
    name:          'Anonymous',
    listenPort:    5050,
    createdAt:     Date.now(),
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
