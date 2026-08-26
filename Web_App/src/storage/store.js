'use strict';
/**
 * store.js — Atomic JSON flat-file I/O helper
 *
 * All data lives in Electron's userData directory:
 *   userData/contacts.json
 *   userData/messages/<contactId>.json
 *
 * Atomic write pattern: write to <file>.tmp → fs.renameSync to <file>
 * This prevents corruption if the process crashes mid-write.
 */

const { app }  = require('electron');
const path     = require('path');
const fs       = require('fs');

function getUserDataPath(...segments) {
  return path.join(app.getPath('userData'), ...segments);
}

/**
 * Read a JSON file. Returns defaultValue if the file doesn't exist.
 * @param {string}  filePath
 * @param {*}       defaultValue
 * @returns {*}
 */
function readJSON(filePath, defaultValue = null) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[store] readJSON failed:', filePath, err.message);
    return defaultValue;
  }
}

/**
 * Write data to a JSON file atomically (write to .tmp, then rename).
 * @param {string}  filePath
 * @param {*}       data
 */
function writeJSON(filePath, data) {
  const dir     = path.dirname(filePath);
  const tmpPath = filePath + '.tmp';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);
}

/**
 * Delete a file if it exists.
 */
function deleteFile(filePath) {
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
}

/**
 * List all files in a directory matching a suffix.
 */
function listFiles(dir, suffix = '.json') {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith(suffix));
  } catch { return []; }
}

module.exports = { getUserDataPath, readJSON, writeJSON, deleteFile, listFiles };
