'use strict';
/**
 * contacts.js — Saved contacts CRUD (JSON flat file)
 *
 * File: userData/contacts.json
 * Schema: Contact[]
 *
 * Contact {
 *   id:             string   (uuid)
 *   name:           string
 *   ip:             string
 *   port:           number
 *   kemPublicKey:   string   (Base64)
 *   sigPublicKey:   string   (Base64)
 *   fingerprint:    string   ("A3F2:09B1:...")
 *   createdAt:      number   (ms timestamp)
 *   lastSeen:       number   (ms timestamp)
 * }
 */

const { v4: uuidv4 }                        = require('uuid');
const { getUserDataPath, readJSON, writeJSON } = require('./store');

const CONTACTS_FILE = () => getUserDataPath('contacts.json');

function _read()         { return readJSON(CONTACTS_FILE(), []); }
function _write(contacts) { writeJSON(CONTACTS_FILE(), contacts); }

/** Return all saved contacts. */
function listContacts() {
  return _read();
}

/** Return a single contact by ID, or null. */
function getContact(id) {
  return _read().find(c => c.id === id) || null;
}

/** Return a single contact by ip+port, or null. */
function getContactByAddress(ip, port) {
  return _read().find(c => c.ip === ip && c.port === port) || null;
}

/**
 * Save (upsert) a contact.
 * If a contact with the same id exists, it is overwritten.
 * If no id is provided, a new UUID is generated.
 * @param {Partial<Contact>} data
 * @returns {Contact} saved contact
 */
function saveContact(data) {
  const contacts = _read();
  const now = Date.now();

  if (data.id) {
    const idx = contacts.findIndex(c => c.id === data.id);
    if (idx !== -1) {
      contacts[idx] = { ...contacts[idx], ...data, lastSeen: now };
      _write(contacts);
      return contacts[idx];
    }
  }

  const contact = {
    id:           data.id || uuidv4(),
    name:         data.name || 'Unknown',
    ip:           data.ip,
    port:         data.port,
    kemPublicKey: data.kemPublicKey || null,
    sigPublicKey: data.sigPublicKey || null,
    fingerprint:  data.fingerprint  || null,
    createdAt:    now,
    lastSeen:     now,
  };
  contacts.push(contact);
  _write(contacts);
  return contact;
}

const BLOCKED_FILE = () => getUserDataPath('blocked.json');
function _readBlocked() { return readJSON(BLOCKED_FILE(), []); }
function _writeBlocked(list) { writeJSON(BLOCKED_FILE(), list); }

/** Rename a contact by ID or address (ip:port). */
function renameContact(idOrAddress, newName) {
  const contacts = _read();
  const contact = contacts.find(c => c.id === idOrAddress || `${c.ip}:${c.port}` === idOrAddress);
  if (contact) {
    contact.name = newName;
    _write(contacts);
    return contact;
  }
  return null;
}

/** Block an address or contact ID. */
function blockPeer(address) {
  const blocked = _readBlocked();
  if (!blocked.includes(address)) {
    blocked.push(address);
    _writeBlocked(blocked);
  }
  return blocked;
}

/** Unblock an address or contact ID. */
function unblockPeer(address) {
  const blocked = _readBlocked().filter(a => a !== address);
  _writeBlocked(blocked);
  return blocked;
}

/** Check if address is blocked. */
function isPeerBlocked(address) {
  const blocked = _readBlocked();
  return blocked.includes(address);
}

/** List all blocked peers. */
function listBlockedPeers() {
  return _readBlocked();
}

/** Delete a contact by ID or address. */
function deleteContact(idOrAddress) {
  const contacts = _read().filter(c => c.id !== idOrAddress && `${c.ip}:${c.port}` !== idOrAddress);
  _write(contacts);
}

/** Update the lastSeen timestamp for a contact. */
function updateLastSeen(id) {
  const contacts = _read();
  const c = contacts.find(c => c.id === id || `${c.ip}:${c.port}` === id);
  if (c) { c.lastSeen = Date.now(); _write(contacts); }
}

/** Wipe all contacts. */
function clearAll() {
  _write([]);
  _writeBlocked([]);
}

module.exports = {
  listContacts,
  getContact,
  getContactByAddress,
  saveContact,
  renameContact,
  deleteContact,
  blockPeer,
  unblockPeer,
  isPeerBlocked,
  listBlockedPeers,
  updateLastSeen,
  clearAll,
};
