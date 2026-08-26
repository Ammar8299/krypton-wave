import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function ContextMenu() {
  const {
    contextMenu, setContextMenu, setRenameModalPeer, setSecurityModalPeer,
    blockPeer, unblockPeer, blockedPeers, closeChat, deleteChatHistory, deleteContact
  } = useAppStore();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setContextMenu]);

  if (!contextMenu) return null;

  const { x, y, contactId, contact, isEphemeral } = contextMenu;
  const isBlocked = blockedPeers.includes(contactId);

  // Position adjustments to prevent overflow offscreen
  const menuWidth = 210;
  const menuHeight = 220;
  const posX = Math.min(x, window.innerWidth - menuWidth - 10);
  const posY = Math.min(y, window.innerHeight - menuHeight - 10);

  const handleRenameOrSave = () => {
    setContextMenu(null);
    setRenameModalPeer({ contactId, contact, isEphemeral });
  };

  const handleSecurity = () => {
    setContextMenu(null);
    setSecurityModalPeer({ contactId, contact, isEphemeral });
  };

  const handleBlockToggle = async () => {
    setContextMenu(null);
    if (isBlocked) {
      await unblockPeer(contactId);
    } else {
      await blockPeer(contactId);
    }
  };

  const handleClose = () => {
    setContextMenu(null);
    closeChat(contactId);
  };

  const handleDelete = async () => {
    setContextMenu(null);
    if (window.confirm(`Delete chat and contact for ${contact.name || contactId}?`)) {
      await deleteChatHistory(contactId);
      if (contact.id) await deleteContact(contact.id);
    }
  };

  return (
    <div
      ref={menuRef}
      className="custom-context-menu"
      style={{
        position: 'fixed',
        left: posX,
        top: posY,
        zIndex: 2000,
      }}
    >
      <div className="context-menu-header font-mono">
        {contact.name || contactId}
      </div>

      <button className="context-menu-item" onClick={handleRenameOrSave}>
        <span className="menu-icon">{isEphemeral ? '💾' : '✏️'}</span>
        <span>{isEphemeral ? 'Save Contact' : 'Rename Contact'}</span>
      </button>

      <button className="context-menu-item" onClick={handleSecurity}>
        <span className="menu-icon">🔒</span>
        <span>Security Details</span>
      </button>

      <div className="context-menu-divider" />

      <button
        className={`context-menu-item ${isBlocked ? 'text-green' : 'text-red'}`}
        onClick={handleBlockToggle}
      >
        <span className="menu-icon">🚫</span>
        <span>{isBlocked ? 'Unblock Peer' : 'Block Peer'}</span>
      </button>

      <button className="context-menu-item" onClick={handleClose}>
        <span className="menu-icon">✕</span>
        <span>Close Chat</span>
      </button>

      <button className="context-menu-item text-red" onClick={handleDelete}>
        <span className="menu-icon">🗑️</span>
        <span>Delete Chat</span>
      </button>
    </div>
  );
}
