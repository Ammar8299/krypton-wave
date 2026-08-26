'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, typed API to the renderer process
contextBridge.exposeInMainWorld('quantuSecure', {
  // ── Identity ─────────────────────────────────────────────────────────────
  getIdentity: () => ipcRenderer.invoke('get-identity'),
  setIdentityName: (name) => ipcRenderer.invoke('set-identity-name', name),
  setListenPort: (port) => ipcRenderer.invoke('set-listen-port', port),

  // ── Window controls ───────────────────────────────────────────────────────
  windowMinimize:    () => ipcRenderer.invoke('window-minimize'),
  windowMaximize:    () => ipcRenderer.invoke('window-maximize'),
  windowClose:       () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // ── Contacts ─────────────────────────────────────────────────────────────
  getContacts: () => ipcRenderer.invoke('get-contacts'),
  saveContact: (data) => ipcRenderer.invoke('save-contact', data),
  renameContact: (idOrAddress, newName) => ipcRenderer.invoke('rename-contact', { idOrAddress, newName }),
  deleteContact: (id) => ipcRenderer.invoke('delete-contact', id),
  blockPeer: (address) => ipcRenderer.invoke('block-peer', address),
  unblockPeer: (address) => ipcRenderer.invoke('unblock-peer', address),
  getBlockedPeers: () => ipcRenderer.invoke('get-blocked-peers'),

  // ── Messages ─────────────────────────────────────────────────────────────
  getMessages: (contactId) => ipcRenderer.invoke('get-messages', contactId),
  deleteContactMessages: (contactId) => ipcRenderer.invoke('delete-contact-messages', contactId),
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),

  // ── Networking ────────────────────────────────────────────────────────────
  connectPeer: (ip, port) => ipcRenderer.invoke('connect-peer', { ip, port }),
  sendMessage: (contactId, text) => ipcRenderer.invoke('send-message', { contactId, text }),
  sendTyping: (contactId, isTyping) => ipcRenderer.invoke('send-typing', { contactId, isTyping }),
  updateMessageStatus: (messageId, status) => ipcRenderer.invoke('update-message-status', { messageId, status }),
  disconnectPeer: (contactId) => ipcRenderer.invoke('disconnect-peer', contactId),

  // ── Push events from main → renderer ─────────────────────────────────────
  onMessageReceived: (cb) => {
    ipcRenderer.on('message-received', (_, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('message-received');
  },
  onPeerEvent: (cb) => {
    ipcRenderer.on('peer-event', (_, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('peer-event');
  },

  // ── Shell ─────────────────────────────────────────────────────────────────
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
