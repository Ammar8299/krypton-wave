import React, { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import ContactItem from './ContactItem';
import WindowControls from './WindowControls';
import { ShieldIcon, SettingsIcon, PlusIcon, SearchIcon } from './Icons';

const getApi = () => window.quantuSecure;

export default function Sidebar() {
  const {
    contacts, ephemeralPeers, activeContactId, peerStatus,
    view, searchQuery,
    setActiveContact, setView, setShowAddModal, setSearchQuery,
  } = useAppStore();

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${c.ip}:${c.port}`.includes(searchQuery)
  );

  const handleContactClick = (id) => {
    setView('chat');
    setActiveContact(id);
  };

  const handleHeaderDoubleClick = () => {
    getApi()?.windowMaximize();
  };

  return (
    <div className="sidebar" style={{ position: 'relative' }}>
      {/* Draggable Header */}
      <div className="sidebar-header" onDoubleClick={handleHeaderDoubleClick}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <WindowControls />
          <div className="wordmark font-mono" style={{ fontSize: 13, letterSpacing: '0.04em' }}>
            <ShieldIcon className="wordmark-icon" />
            Kπyρτόn_wave~
          </div>
        </div>
        <div className="sidebar-actions" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            id="settings-btn"
            className={`icon-btn ${view === 'identity' ? 'active' : ''}`}
            title="Identity & Settings"
            onClick={() => setView(view === 'identity' ? 'chat' : 'identity')}
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            id="search-contacts"
            className="search-input"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="contacts-list">
        {filtered.length > 0 && (
          <>
            <div className="section-label">Contacts</div>
            {filtered.map(contact => {
              const id = `${contact.ip}:${contact.port}`;
              const status = peerStatus[id] || {};
              return (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  contactId={id}
                  isActive={activeContactId === id}
                  isOnline={status.online || false}
                  onClick={() => handleContactClick(id)}
                />
              );
            })}
          </>
        )}

        {/* Ephemeral sessions */}
        {ephemeralPeers.length > 0 && (
          <>
            <div className="section-label">Ephemeral</div>
            {ephemeralPeers.map(peer => (
              <ContactItem
                key={peer.id}
                contact={{ name: peer.name || 'Unknown', ip: peer.ip, port: peer.port }}
                contactId={peer.id}
                isActive={activeContactId === peer.id}
                isOnline={true}
                isEphemeral
                onClick={() => handleContactClick(peer.id)}
              />
            ))}
          </>
        )}

        {contacts.length === 0 && ephemeralPeers.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              NO CONTACTS YET<br />
              <span style={{ color: 'var(--green-dim)' }}>Click + to add a peer by IP:Port</span>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        id="add-peer-fab"
        className="fab"
        title="Add peer by IP:Port"
        onClick={() => setShowAddModal(true)}
      >
        <PlusIcon size={18} />
      </button>
    </div>
  );
}
