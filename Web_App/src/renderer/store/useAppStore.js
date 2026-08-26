import { create } from 'zustand';

// Lazy getter — window.quantuSecure is injected by Electron's preload.js.
// In a plain browser (Vite dev server without Electron) it is undefined;
// all actions guard against this so the UI renders without crashing.
const getApi = () => window.quantuSecure;

export const useAppStore = create((set, get) => ({
  // ── Identity ──────────────────────────────────────────────────
  identity: null,

  // ── Security Configuration (Kπyρτόn_wave~) ────────────────────
  securityConfig: {
    kemEnabled:    true,
    sigEnabled:    true,
    aesEnabled:    true,
    wiresharkMode: false,
  },
  configDirty: false, // true when user changed config with active connections
  cryptoEvents: [],   // last 8 live packet/crypto events

  // ── Contacts & Blocklist ──────────────────────────────────────
  contacts: [],            // saved contacts from JSON
  blockedPeers: [],        // blocked IP:port strings
  activeContactId: null,  // ip:port string (used as ID for open connections)

  // ── Ephemeral sessions ────────────────────────────────────────
  ephemeralPeers: [],     // [ { id: 'ip:port', name, fingerprint, kemPublicKey, sigPublicKey, ... } ]

  // ── Messages ─────────────────────────────────────────────────
  messages: {},           // { [contactId]: Message[] }

  // ── Peer status ───────────────────────────────────────────────
  peerStatus: {},         // { [contactId]: { online, typing } }

  // ── UI Modals & Menus ─────────────────────────────────────────
  view: 'chat',           // 'chat' | 'identity'
  showAddModal: false,
  securityModalPeer: null, // peer data for Security Details modal
  renameModalPeer: null,   // peer data for Rename / Save modal
  contextMenu: null,       // { x, y, contactId, contact, isEphemeral }
  searchQuery: '',

  // ─────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────

  init: async () => {
    const api = getApi();
    if (!api) {
      console.warn('[Kπyρτόn_wave~] window.quantuSecure not found — run inside Electron for full functionality.');
      return;
    }

    const identity = await api.getIdentity();
    const contacts = (await api.getContacts()) || [];
    const blockedPeers = (await api.getBlockedPeers()) || [];
    const securityConfig = (await api.getSecurityConfig()) || get().securityConfig;
    set({ identity, contacts, blockedPeers, securityConfig });

    // Subscribe to push events from main process
    api.onMessageReceived(({ contactId, message }) => {
      const { blockedPeers } = get();
      if (blockedPeers.includes(contactId)) return; // ignore blocked

      get().addMessageToStore(contactId, message);
      // Send read receipt if this contact is active
      if (get().activeContactId === contactId) {
        getApi()?.updateMessageStatus(message.id, 'read');
      }
    });

    api.onCryptoEvent((event) => {
      get().addCryptoEvent(event);
    });

    api.onPeerEvent(({ type, contactId, data }) => {
      const { peerStatus, ephemeralPeers, contacts, blockedPeers } = get();
      if (blockedPeers.includes(contactId)) return;

      switch (type) {
        case 'connected':
          set({
            peerStatus: { ...peerStatus, [contactId]: { online: true, typing: false } },
            configDirty: false,
          });
          // If not a saved contact, add to ephemeral list with all crypto keys
          if (!contacts.find(c => `${c.ip}:${c.port}` === contactId)) {
            const existingIdx = ephemeralPeers.findIndex(p => p.id === contactId);
            if (existingIdx === -1) {
              set({ ephemeralPeers: [...ephemeralPeers, { id: contactId, ...data }] });
            } else {
              const updated = [...ephemeralPeers];
              updated[existingIdx] = { ...updated[existingIdx], ...data };
              set({ ephemeralPeers: updated });
            }
          }
          break;
        case 'disconnected':
          set({ peerStatus: { ...peerStatus, [contactId]: { online: false, typing: false } } });
          break;
        case 'typing':
          set({ peerStatus: { ...peerStatus, [contactId]: { ...peerStatus[contactId], typing: data.isTyping } } });
          break;
        case 'receipt':
          get().updateMessageStatusInStore(contactId, data.messageId, data.type);
          break;
        case 'incoming': {
          const alreadyEphemeral = get().ephemeralPeers.find(p => p.id === contactId);
          if (!alreadyEphemeral && !contacts.find(c => `${c.ip}:${c.port}` === contactId)) {
            set({ ephemeralPeers: [...get().ephemeralPeers, { id: contactId, ...data }] });
          }
          set({ peerStatus: { ...get().peerStatus, [contactId]: { online: true, typing: false } } });
          break;
        }
        case 'error':
          set({ peerStatus: { ...peerStatus, [contactId]: { online: false, typing: false } } });
          break;
      }
    });
  },

  setSecurityConfig: async (partialConfig) => {
    const updated = { ...get().securityConfig, ...partialConfig };
    set({ securityConfig: updated });

    const api = getApi();
    if (api?.setSecurityConfig) {
      const res = await api.setSecurityConfig(updated);
      if (res?.activePeers > 0) {
        set({ configDirty: true });
      }
    }
  },

  clearConfigDirty: () => set({ configDirty: false }),

  addCryptoEvent: (event) => {
    set(state => ({
      cryptoEvents: [event, ...state.cryptoEvents].slice(0, 8),
    }));
  },

  setActiveContact: async (contactId) => {
    set({ activeContactId: contactId, contextMenu: null });
    if (contactId && !get().messages[contactId]) {
      const msgs = (await getApi()?.getMessages(contactId)) || [];
      set(state => ({ messages: { ...state.messages, [contactId]: msgs } }));
    }
  },

  addMessageToStore: (contactId, message) => {
    set(state => {
      const existing = state.messages[contactId] || [];
      if (existing.find(m => m.id === message.id)) return {}; // dedup
      return { messages: { ...state.messages, [contactId]: [...existing, message] } };
    });
  },

  updateMessageStatusInStore: (contactId, messageId, status) => {
    set(state => {
      const msgs = (state.messages[contactId] || []).map(m =>
        m.id === messageId ? { ...m, status } : m
      );
      return { messages: { ...state.messages, [contactId]: msgs } };
    });
  },

  sendMessage: async (text) => {
    const { activeContactId, blockedPeers } = get();
    if (!activeContactId || !text.trim() || blockedPeers.includes(activeContactId)) return;
    const result = await getApi()?.sendMessage(activeContactId, text.trim());
    if (result?.ok) {
      get().addMessageToStore(activeContactId, result.message);
    }
    return result;
  },

  refreshContacts: async () => {
    const contacts = (await getApi()?.getContacts()) || [];
    const blockedPeers = (await getApi()?.getBlockedPeers()) || [];
    set({ contacts, blockedPeers });
  },

  saveContact: async (data) => {
    const saved = await getApi()?.saveContact(data);
    // Remove from ephemeralPeers once saved
    const contactId = `${data.ip}:${data.port}`;
    set(state => ({
      ephemeralPeers: state.ephemeralPeers.filter(p => p.id !== contactId && p.id !== data.id)
    }));
    await get().refreshContacts();
    return saved;
  },

  renameContact: async (idOrAddress, newName) => {
    await getApi()?.renameContact(idOrAddress, newName);
    // Also update in ephemeral if present
    set(state => ({
      ephemeralPeers: state.ephemeralPeers.map(p =>
        p.id === idOrAddress ? { ...p, name: newName } : p
      )
    }));
    await get().refreshContacts();
  },

  deleteContact: async (id) => {
    await getApi()?.deleteContact(id);
    await get().refreshContacts();
    if (get().activeContactId === id) set({ activeContactId: null });
  },

  blockPeer: async (address) => {
    await getApi()?.blockPeer(address);
    // Disconnect peer
    getApi()?.disconnectPeer(address);
    set(state => ({
      blockedPeers: [...new Set([...state.blockedPeers, address])],
      peerStatus: { ...state.peerStatus, [address]: { online: false, typing: false } },
      activeContactId: state.activeContactId === address ? null : state.activeContactId,
    }));
    await get().refreshContacts();
  },

  unblockPeer: async (address) => {
    await getApi()?.unblockPeer(address);
    set(state => ({
      blockedPeers: state.blockedPeers.filter(a => a !== address),
    }));
    await get().refreshContacts();
  },

  closeChat: (contactId) => {
    if (get().activeContactId === contactId) {
      set({ activeContactId: null });
    }
    // Remove from ephemeral if not saved
    set(state => ({
      ephemeralPeers: state.ephemeralPeers.filter(p => p.id !== contactId),
      contextMenu: null,
    }));
  },

  deleteChatHistory: async (contactId) => {
    await getApi()?.deleteContactMessages(contactId);
    set(state => {
      const newMessages = { ...state.messages };
      delete newMessages[contactId];
      return {
        messages: newMessages,
        activeContactId: state.activeContactId === contactId ? null : state.activeContactId,
        ephemeralPeers: state.ephemeralPeers.filter(p => p.id !== contactId),
      };
    });
  },

  // Modals & Context menu
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setSecurityModalPeer: (peer) => set({ securityModalPeer: peer }),
  setRenameModalPeer: (peer) => set({ renameModalPeer: peer }),

  setView: (view) => set({ view, contextMenu: null }),
  setShowAddModal: (v) => set({ showAddModal: v, contextMenu: null }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  updateIdentityName: async (name) => {
    await getApi()?.setIdentityName(name);
    set(state => ({ identity: { ...state.identity, name } }));
  },
}));
