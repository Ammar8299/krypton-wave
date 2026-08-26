'use strict';
/**
 * messages.js — Per-contact message history (JSON flat files)
 *
 * Files: userData/messages/<contactId>.json
 * Schema: Message[]
 *
 * Message {
 *   id:        string   (uuid)
 *   contactId: string
 *   direction: 'sent' | 'received'
 *   content:   string   (plaintext, decrypted)
 *   status:    'sent' | 'delivered' | 'read' | 'received'
 *   seqNum:    number
 *   timestamp: number   (ms)
 * }
 */

const path                                          = require('path');
const { v4: uuidv4 }                                = require('uuid');
const { getUserDataPath, readJSON, writeJSON,
        deleteFile, listFiles }                     = require('./store');

const MESSAGES_DIR = () => getUserDataPath('messages');
const msgFile = (contactId) => path.join(MESSAGES_DIR(), `${_sanitize(contactId)}.json`);

/** Sanitize contactId for use as a filename (replace colons, dots) */
function _sanitize(id) {
  return id.replace(/[:.]/g, '_');
}

function _read(contactId)        { return readJSON(msgFile(contactId), []); }
function _write(contactId, msgs) { writeJSON(msgFile(contactId), msgs); }

/** Get all messages for a contact (sorted oldest → newest). */
function getMessages(contactId) {
  return _read(contactId).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Add a new message.
 * @param {Partial<Message>} data
 * @returns {Message}
 */
function addMessage(data) {
  const msgs = _read(data.contactId);
  const msg = {
    id:        data.id        || uuidv4(),
    contactId: data.contactId,
    direction: data.direction,
    content:   data.content,
    status:    data.status    || (data.direction === 'sent' ? 'sent' : 'received'),
    seqNum:    data.seqNum    || 0,
    timestamp: data.timestamp || Date.now(),
  };
  // Prevent duplicate IDs
  if (!msgs.find(m => m.id === msg.id)) {
    msgs.push(msg);
    _write(data.contactId, msgs);
  }
  return msg;
}

/** Update the status of a message by ID. */
function updateMessageStatus(messageId, status) {
  // We need to search across all contact files
  const dir = MESSAGES_DIR();
  const files = listFiles(dir, '.json');
  for (const file of files) {
    const contactId = file.replace('.json', '');
    const msgs = _read(contactId);
    const msg = msgs.find(m => m.id === messageId);
    if (msg) {
      msg.status = status;
      _write(contactId, msgs);
      return;
    }
  }
}

/** Delete all messages for a contact. */
function deleteContactMessages(contactId) {
  deleteFile(msgFile(contactId));
}

/** Wipe ALL message files. */
function clearAll() {
  const dir = MESSAGES_DIR();
  const files = listFiles(dir, '.json');
  for (const file of files) {
    deleteFile(path.join(dir, file));
  }
}

module.exports = {
  getMessages,
  addMessage,
  updateMessageStatus,
  deleteContactMessages,
  clearAll,
};
