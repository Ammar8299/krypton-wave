import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../store/useAppStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import InputBar from './InputBar';
import WiresharkWarningBanner from './WiresharkWarningBanner';
import { LockIcon, MessageCircleIcon } from './Icons';

const getApi = () => window.quantuSecure;

function getContactDisplayName(store, contactId) {
  const saved = store.contacts.find(c => `${c.ip}:${c.port}` === contactId);
  if (saved) return { name: saved.name, initial: saved.name[0].toUpperCase(), contact: saved, isEphemeral: false };
  const ep = store.ephemeralPeers.find(p => p.id === contactId);
  if (ep) return { name: ep.name || 'Unknown', initial: (ep.name || '?')[0].toUpperCase(), contact: null, isEphemeral: true };
  return { name: contactId, initial: '?', contact: null, isEphemeral: false };
}

function getEncBadgeText(config) {
  const { kemEnabled, sigEnabled, aesEnabled, wiresharkMode } = config || {};
  const parts = [];
  if (kemEnabled) parts.push('ML-KEM');
  if (sigEnabled) parts.push('Falcon-512');
  if (aesEnabled) parts.push('AES-256');
  if (!aesEnabled) parts.push('⚠ PLAIN');
  if (parts.length === 0) parts.push('⚠ UNENCRYPTED');
  if (wiresharkMode) parts.push('🧪 WS');
  return parts.join(' · ');
}

export default function ConversationView() {
  const store = useAppStore();
  const { activeContactId, messages, peerStatus, securityConfig } = store;
  const listRef = useRef(null);
  const prevMsgCount = useRef(0);

  const msgs = (activeContactId && messages[activeContactId]) || [];
  const status = peerStatus[activeContactId] || {};

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!listRef.current) return;
    if (msgs.length !== prevMsgCount.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      prevMsgCount.current = msgs.length;
    }
  }, [msgs.length]);

  // Animate new messages with GSAP
  useLayoutEffect(() => {
    if (!listRef.current) return;
    const newBubbles = listRef.current.querySelectorAll('.message-wrap:last-child');
    if (newBubbles.length) {
      gsap.fromTo(newBubbles, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' });
    }
  }, [msgs.length]);

  if (!activeContactId) return <EmptyState />;

  const { name, initial, contact, isEphemeral } = getContactDisplayName(store, activeContactId);
  const isBlocked = store.blockedPeers?.includes(activeContactId);
  const badgeText = getEncBadgeText(securityConfig);
  const isPlaintext = !securityConfig?.aesEnabled;

  const handleHeaderMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    store.setContextMenu({
      x: rect.left,
      y: rect.bottom + 6,
      contactId: activeContactId,
      contact: contact || { name, ip: activeContactId.split(':')[0], port: activeContactId.split(':')[1] },
      isEphemeral,
    });
  };

  const handleSecurityClick = () => {
    store.setSecurityModalPeer({
      contactId: activeContactId,
      contact: contact || { name, ip: activeContactId.split(':')[0], port: activeContactId.split(':')[1] },
      isEphemeral,
    });
  };

  return (
    <div className="conversation-pane">
      {/* Header */}
      <div
        className="conv-header"
        style={{ WebkitAppRegion: 'drag', userSelect: 'none' }}
        onDoubleClick={() => getApi()?.windowMaximize()}
      >
        <div
          className="conv-peer-info"
          style={{ WebkitAppRegion: 'no-drag', cursor: 'pointer' }}
          onClick={handleSecurityClick}
          title="Click to view Security Details & Fingerprint"
        >
          <div className="conv-peer-avatar">{initial}</div>
          <div>
            <div className="conv-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {name}
              {isBlocked && (
                <span className="font-mono" style={{ fontSize: 9.5, color: 'var(--red-alert)', border: '1px solid var(--red-alert)', padding: '1px 4px', borderRadius: 3 }}>
                  BLOCKED
                </span>
              )}
              {isEphemeral && !isBlocked && (
                <span className="font-mono" style={{ fontSize: 9.5, color: 'var(--yellow-warn)', border: '1px solid var(--yellow-warn)', padding: '1px 4px', borderRadius: 3 }}>
                  UNSAVED
                </span>
              )}
            </div>
            <div className="conv-status">
              <span className={`conv-status-dot ${status.online ? '' : 'offline'}`} />
              <span>{status.typing ? 'typing...' : status.online ? 'online' : 'offline'}</span>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                {activeContactId}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, WebkitAppRegion: 'no-drag' }}>
          <div
            className={`enc-badge ${isPlaintext ? 'enc-badge--insecure' : ''}`}
            onClick={handleSecurityClick}
            style={{ cursor: 'pointer' }}
            title="Active cryptographic suite (Click for details)"
          >
            <LockIcon size={10} />
            <span className="font-mono">{badgeText}</span>
          </div>

          <button
            id="conv-menu-btn"
            className="icon-btn"
            title="Chat Options (Right-click or click)"
            onClick={handleHeaderMenu}
            style={{ width: 30, height: 30, fontSize: 16 }}
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Wireshark Warning Banner if active */}
      <WiresharkWarningBanner />

      {/* Unsaved / Unknown Sender Banner */}
      {isEphemeral && !isBlocked && (
        <div className="unknown-sender-banner">
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            ⚠️ Unknown peer <strong>{activeContactId}</strong> is not in your contacts.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0 12px', height: 28, fontSize: 11 }}
              onClick={() => store.setRenameModalPeer({ contactId: activeContactId, contact, isEphemeral: true })}
            >
              SAVE CONTACT
            </button>
            <button
              className="btn btn-danger"
              style={{ width: 'auto', padding: '0 12px', height: 28, fontSize: 11 }}
              onClick={() => store.blockPeer(activeContactId)}
            >
              BLOCK
            </button>
          </div>
        </div>
      )}

      {/* Blocked Sender Banner */}
      {isBlocked && (
        <div className="unknown-sender-banner blocked">
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--red-alert)' }}>
            🚫 This peer is blocked. Communication is stopped.
          </div>
          <button
            className="btn btn-ghost"
            style={{ width: 'auto', padding: '0 12px', height: 28, fontSize: 11 }}
            onClick={() => store.unblockPeer(activeContactId)}
          >
            UNBLOCK PEER
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="messages-list" ref={listRef}>
        {msgs.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              {isPlaintext ? (
                <>
                  <span style={{ color: 'var(--red-alert)' }}>⚠️ PLAINTEXT MODE ACTIVE</span><br />
                  <span style={{ color: 'var(--text-muted)' }}>Messages are not encrypted</span>
                </>
              ) : (
                <>
                  PQC SESSION READY<br />
                  <span style={{ color: 'var(--green-dim)' }}>ML-KEM-768 · Falcon-512 · AES-256-GCM</span>
                </>
              )}
            </div>
          </div>
        )}
        {msgs.map((msg, i) => (
          <MessageBubble key={msg.id} msg={msg} prevMsg={msgs[i - 1]} />
        ))}
        {status.typing && <TypingIndicator />}
      </div>

      {/* Input */}
      {!isBlocked && <InputBar contactId={activeContactId} isOnline={status.online} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="conversation-pane">
      <div
        className="conv-header"
        style={{
          WebkitAppRegion: 'drag',
          userSelect: 'none',
          minHeight: 52,
          borderBottom: '1px solid var(--border)',
          background: 'transparent'
        }}
        onDoubleClick={() => getApi()?.windowMaximize()}
      />
      <div className="empty-state">
        <MessageCircleIcon size={64} />
        <div className="empty-state-title font-mono" style={{ color: 'var(--green-bright)' }}>
          Kπyρτόn_wave~
        </div>
        <div className="empty-state-sub font-mono" style={{ fontSize: 11 }}>
          SELECT A CONTACT OR ADD A NEW PEER<br />
          <span style={{ color: 'var(--green-dim)' }}>Post-Quantum Cryptographic Protocol Suite</span>
        </div>
      </div>
    </div>
  );
}
