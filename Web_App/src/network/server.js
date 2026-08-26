'use strict';
/**
 * server.js — TCP server + PeerManager
 *
 * PeerManager is a singleton that:
 *  - Runs the TCP server (net.createServer)
 *  - Maintains a Map of contactId → PeerConnection
 *  - Manages active security configuration across connections
 *  - Provides sendMessage, sendTyping, connectPeer, disconnectPeer APIs
 *  - Fires callbacks: onMessage, onPeerEvent, onIncomingPeer, onCryptoEvent
 *
 * Kπyρτόn_wave~ — cryptographic networking experiment
 */

const net  = require('net');
const { v4: uuidv4 } = require('uuid');
const { PeerConnection } = require('./peer');

function cleanIp(ip) {
  if (!ip) return '127.0.0.1';
  if (ip === '::1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.substring(7);
  return ip;
}

function createPeerManager({ identity, securityConfig, onMessage, onPeerEvent, onIncomingPeer, onCryptoEvent }) {
  /** Map<contactId, PeerConnection> */
  const peers = new Map();
  let server  = null;
  let listenPort = identity.listenPort || 5050;
  let activeSecurityConfig = {
    kemEnabled: true,
    sigEnabled: true,
    aesEnabled: true,
    wiresharkMode: false,
    ...securityConfig,
  };

  function updateSecurityConfig(newConfig) {
    activeSecurityConfig = { ...activeSecurityConfig, ...newConfig };
    console.log('[server] Updated active security config:', activeSecurityConfig);
  }

  function getSecurityConfig() {
    return { ...activeSecurityConfig };
  }

  // ── Wire up a PeerConnection's events ───────────────────────────────────────
  function wireEvents(conn, contactId) {
    const emitConnected = (info) => {
      peers.set(contactId, conn);
      onPeerEvent('connected', contactId, {
        ...info,
        id: contactId,
        ip: cleanIp(conn.socket.remoteAddress),
        port: info?.listenPort || conn.socket.remotePort,
      });
    };

    if (conn.isReady && conn.peerInfo) {
      emitConnected(conn.peerInfo);
    } else {
      conn.once('ready', (peerInfo) => {
        emitConnected(peerInfo);
      });
    }

    conn.on('message', (text, messageId, seqNum) => {
      const msg = {
        id:        messageId,
        direction: 'received',
        content:   text,
        status:    'received',
        seqNum,
        timestamp: Date.now(),
      };
      onMessage(contactId, msg);
      // Auto send read receipt after a short delay (UI will also trigger this)
      setTimeout(() => conn.sendRead(messageId), 500);
    });

    conn.on('typing', (isTyping) => {
      onPeerEvent('typing', contactId, { isTyping });
    });

    conn.on('receipt', (type, messageId) => {
      onPeerEvent('receipt', contactId, { type, messageId });
    });

    conn.on('disconnect', () => {
      peers.delete(contactId);
      onPeerEvent('disconnected', contactId, {});
    });

    conn.on('error', (err) => {
      peers.delete(contactId);
      onPeerEvent('error', contactId, { error: err.message });
    });
  }

  // ── Find a free TCP port ──────────────────────────────────────────────────────
  async function findFreePort(startPort, maxTries = 20) {
    for (let p = startPort; p < startPort + maxTries; p++) {
      const free = await new Promise(resolve => {
        const probe = net.createServer();
        probe.unref();
        probe.on('error', () => resolve(false));
        probe.listen(p, '0.0.0.0', () => probe.close(() => resolve(true)));
      });
      if (free) return p;
    }
    throw new Error(`No free TCP port found in range ${startPort}–${startPort + maxTries - 1}`);
  }

  // ── Start TCP server ─────────────────────────────────────────────────────────
  async function listen(port) {
    const actualPort = await findFreePort(port);
    listenPort = actualPort;

    return new Promise((resolve, reject) => {
      server = net.createServer((socket) => {
        // Incoming connection — we are the responder
        const rawIp = cleanIp(socket.remoteAddress);
        const conn = new PeerConnection(
          socket,
          'responder',
          identity,
          activeSecurityConfig,
          onCryptoEvent
        );

        conn.once('ready', (peerInfo) => {
          const peerPort = peerInfo.listenPort || socket.remotePort;
          const remoteId = `${rawIp}:${peerPort}`;

          wireEvents(conn, remoteId);
          onIncomingPeer({
            id:          remoteId,
            ip:          rawIp,
            port:        peerPort,
            ...peerInfo,
          });
        });

        conn.on('error', (err) => {
          console.error('[server] Incoming connection error:', err.message);
        });
      });

      server.on('error', reject);
      server.listen(actualPort, '0.0.0.0', () => {
        console.log(`[server] Listening on port ${actualPort}`);
        resolve(actualPort);
      });
    });
  }

  // ── Re-listen on a new port ──────────────────────────────────────────────────
  async function relisten(newPort) {
    if (server) {
      await new Promise((res) => server.close(res));
    }
    await listen(newPort);
  }

  // ── Initiate an outgoing connection ─────────────────────────────────────────
  async function connectPeer(ip, port, callerIdentity) {
    const cleanAddr = cleanIp(ip);
    const contactId = `${cleanAddr}:${port}`;
    if (peers.has(contactId) && peers.get(contactId).isReady) {
      return peers.get(contactId).peerInfo;
    }

    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ port: Number(port), host: cleanAddr });
      const conn = new PeerConnection(
        socket,
        'initiator',
        callerIdentity || identity,
        activeSecurityConfig,
        onCryptoEvent
      );

      wireEvents(conn, contactId);

      conn.once('ready', (peerInfo) => {
        resolve({ id: contactId, ip: cleanAddr, port: Number(port), ...peerInfo });
      });

      conn.once('error', (err) => {
        reject(err);
      });
      socket.on('error', (err) => {
        reject(err);
      });
    });
  }

  // ── Send a chat message ──────────────────────────────────────────────────────
  async function sendMessage(contactId, text) {
    const conn = peers.get(contactId);
    if (!conn) throw new Error(`No active connection to ${contactId}`);
    const messageId = conn.sendText(text);
    return {
      id:        messageId,
      direction: 'sent',
      content:   text,
      status:    'sent',
      timestamp: Date.now(),
    };
  }

  // ── Typing indicator ─────────────────────────────────────────────────────────
  function sendTyping(contactId, isTyping) {
    const conn = peers.get(contactId);
    conn?.sendTyping(isTyping);
  }

  // ── Disconnect ───────────────────────────────────────────────────────────────
  function disconnectPeer(contactId) {
    const conn = peers.get(contactId);
    if (conn) { conn.close(); peers.delete(contactId); }
  }

  // ── Online status ────────────────────────────────────────────────────────────
  function isPeerOnline(contactId) {
    return peers.has(contactId) && peers.get(contactId).isReady;
  }

  function getActivePeerCount() {
    return peers.size;
  }

  return {
    listen,
    relisten,
    connectPeer,
    sendMessage,
    sendTyping,
    disconnectPeer,
    isPeerOnline,
    getActivePeerCount,
    updateSecurityConfig,
    getSecurityConfig,
  };
}

module.exports = { createPeerManager };
