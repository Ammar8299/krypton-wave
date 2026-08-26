'use strict';
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');

const isDev = process.env.NODE_ENV === 'development';

// ── Backend modules (loaded after app ready) ─────────────────────────────────
let peerManager, identity, contacts, messages;

// ── Utility: get local LAN IP ─────────────────────────────────────────────────
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const ifaces of Object.values(nets)) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

// ── Window ────────────────────────────────────────────────────────────────────
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#080808',
    frame: false,          // We draw our own title bar
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'src/renderer/assets/icon.png'),
    show: false,
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (isDev) {
    const vitePort = process.env.VITE_PORT || 5173;
    mainWindow.loadURL(`http://localhost:${vitePort}`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Lazy-load backend after app is ready (so app.getPath works)
  const { loadOrCreateIdentity } = require('./src/crypto/identity');
  const { createPeerManager }    = require('./src/network/server');
  const contactsStore            = require('./src/storage/contacts');
  const messagesStore            = require('./src/storage/messages');

  contacts = contactsStore;
  messages = messagesStore;

  // Load or create long-term identity keypair
  identity = await loadOrCreateIdentity();

  // Start TCP server — auto-increments if configured port is busy
  const listenPort = identity.listenPort || 5050;
  peerManager = createPeerManager({
    identity,
    onMessage(contactId, msg) {
      // Persist and push to renderer
      messages.addMessage({ ...msg, contactId });
      mainWindow?.webContents.send('message-received', { contactId, message: msg });
    },
    onPeerEvent(type, contactId, data) {
      mainWindow?.webContents.send('peer-event', { type, contactId, data });
    },
    onIncomingPeer(peerInfo) {
      mainWindow?.webContents.send('peer-event', { type: 'incoming', contactId: peerInfo.id, data: peerInfo });
    },
  });

  try {
    const actualPort = await peerManager.listen(listenPort);
    if (actualPort !== listenPort) {
      console.log(`[main] Port ${listenPort} busy — bound to ${actualPort} instead`);
      identity.listenPort = actualPort;
      const { saveIdentity } = require('./src/crypto/identity');
      saveIdentity(identity);
    }
  } catch (err) {
    console.error('[main] Failed to start TCP server:', err.message);
    // App still opens — networking unavailable
  }

  registerIPC();
  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ── IPC Handlers ──────────────────────────────────────────────────────────────
function registerIPC() {
  // Window controls (for custom traffic-light buttons)
  ipcMain.handle('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
    win?.minimize();
  });
  ipcMain.handle('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      return win.isMaximized();
    }
    return false;
  });
  ipcMain.handle('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
    win?.close();
  });
  ipcMain.handle('window-is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
    return win ? win.isMaximized() : false;
  });

  // Identity
  ipcMain.handle('get-identity', () => ({
    ip: '127.0.0.1',
    lanIp: getLocalIP(),
    port: identity.listenPort,
    fingerprint: identity.fingerprint,
    name: identity.name,
  }));

  ipcMain.handle('set-identity-name', (_, name) => {
    identity.name = name;
    const { saveIdentity } = require('./src/crypto/identity');
    saveIdentity(identity);
  });

  ipcMain.handle('set-listen-port', async (_, port) => {
    await peerManager.relisten(port);
    identity.listenPort = port;
    const { saveIdentity } = require('./src/crypto/identity');
    saveIdentity(identity);
    return { port };
  });

  // Contacts
  ipcMain.handle('get-contacts', () => contacts.listContacts());
  ipcMain.handle('save-contact', (_, data) => contacts.saveContact(data));
  ipcMain.handle('rename-contact', (_, { idOrAddress, newName }) => contacts.renameContact(idOrAddress, newName));
  ipcMain.handle('delete-contact', (_, id) => contacts.deleteContact(id));
  ipcMain.handle('block-peer', (_, address) => {
    peerManager.disconnectPeer(address);
    return contacts.blockPeer(address);
  });
  ipcMain.handle('unblock-peer', (_, address) => contacts.unblockPeer(address));
  ipcMain.handle('get-blocked-peers', () => contacts.listBlockedPeers());

  // Messages
  ipcMain.handle('get-messages', (_, contactId) => messages.getMessages(contactId));
  ipcMain.handle('delete-contact-messages', (_, contactId) => messages.deleteContactMessages(contactId));
  ipcMain.handle('clear-all-data', () => {
    contacts.clearAll();
    messages.clearAll();
  });

  // Networking
  ipcMain.handle('connect-peer', async (_, { ip, port }) => {
    try {
      const result = await peerManager.connectPeer(ip, port, identity);
      return { ok: true, peerInfo: result };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('send-message', async (_, { contactId, text }) => {
    try {
      const msg = await peerManager.sendMessage(contactId, text);
      messages.addMessage({ ...msg, contactId });
      return { ok: true, message: msg };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('send-typing', (_, { contactId, isTyping }) => {
    peerManager.sendTyping(contactId, isTyping);
  });

  ipcMain.handle('update-message-status', (_, { messageId, status }) => {
    messages.updateMessageStatus(messageId, status);
  });

  ipcMain.handle('disconnect-peer', (_, contactId) => {
    peerManager.disconnectPeer(contactId);
  });

  ipcMain.handle('open-external', (_, url) => shell.openExternal(url));
}
