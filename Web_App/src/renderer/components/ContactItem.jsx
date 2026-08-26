import React from 'react';
import { useAppStore } from '../store/useAppStore';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ContactItem({ contact, contactId, isActive, isOnline, isEphemeral, onClick }) {
  const { setContextMenu, blockedPeers } = useAppStore();
  const initial = (contact.name || '?')[0].toUpperCase();
  const address = `${contact.ip}:${contact.port}`;
  const isBlocked = blockedPeers.includes(contactId);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      contactId,
      contact,
      isEphemeral,
    });
  };

  return (
    <div
      id={`contact-${contactId?.replace(/[:.]/g, '-')}`}
      className={`contact-item sidebar-item-appear ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Avatar */}
      <div className={`contact-avatar ${isEphemeral ? 'ephemeral' : ''}`}>
        {initial}
        <span className={`online-dot ${isOnline ? 'pulse' : 'offline'}`} />
      </div>

      {/* Meta */}
      <div className="contact-meta">
        <div className="contact-name">
          {contact.name}
          {isBlocked && (
            <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--red-alert)', fontFamily: 'var(--font-mono)' }}>
              [BLOCKED]
            </span>
          )}
          {isEphemeral && !isBlocked && (
            <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              [UNSAVED]
            </span>
          )}
        </div>
        <div className="contact-preview font-mono" style={{ fontSize: 11 }}>{address}</div>
      </div>

      {/* Timestamp */}
      {contact.lastSeen && (
        <div className="contact-time">{formatTime(contact.lastSeen)}</div>
      )}
    </div>
  );
}
