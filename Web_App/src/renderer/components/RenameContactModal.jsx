'use strict';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { CloseIcon } from './Icons';

export default function RenameContactModal() {
  const {
    renameModalPeer,
    setRenameModalPeer,
    saveContact,
    renameContact,
    contacts,
    ephemeralPeers,
    setActiveContact,
  } = useAppStore();

  const modalRef = useRef(null);

  const contactId = renameModalPeer?.contactId || '';
  const peerContact = renameModalPeer?.contact || null;

  // Check if contact already exists in saved contacts list
  const existingContact = contacts.find(
    c => `${c.ip}:${c.port}` === contactId || (peerContact?.id && c.id === peerContact.id)
  ) || null;

  // Check ephemeral list for incoming/unregistered peer info
  const ephemeralPeer = ephemeralPeers.find(p => p.id === contactId) || null;

  // Resolve initial default name
  const defaultName = existingContact?.name || peerContact?.name || ephemeralPeer?.name || '';
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    setName(defaultName);
  }, [renameModalPeer, defaultName]);

  useLayoutEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.93, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'back.out(1.5)' }
      );
    }
  }, []);

  if (!renameModalPeer) return null;

  const isExisting = Boolean(existingContact);

  const close = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 4,
        duration: 0.14,
        ease: 'power2.in',
        onComplete: () => setRenameModalPeer(null),
      });
    } else {
      setRenameModalPeer(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (isExisting && existingContact) {
      await renameContact(existingContact.id || contactId, trimmed);
    } else {
      // Parse IP and Port safely
      const parts = contactId.split(':');
      const ip = peerContact?.ip || ephemeralPeer?.ip || parts[0] || '127.0.0.1';
      const port = Number(peerContact?.port || ephemeralPeer?.port || parts[1] || 5050);

      await saveContact({
        name: trimmed,
        ip,
        port,
        kemPublicKey: peerContact?.kemPublicKey || ephemeralPeer?.kemPublicKey || null,
        sigPublicKey: peerContact?.sigPublicKey || ephemeralPeer?.sigPublicKey || null,
        fingerprint:  peerContact?.fingerprint  || ephemeralPeer?.fingerprint  || null,
      });
    }

    setActiveContact(contactId);
    close();
  };

  return (
    <div className="modal-overlay modal-overlay-enter" onClick={(e) => e.target === e.currentTarget && close()}>
      <div ref={modalRef} className="modal modal-enter" style={{ width: 380 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{isExisting ? 'RENAME CONTACT' : 'SAVE CONTACT'}</div>
            <div className="modal-subtitle font-mono">{contactId}</div>
          </div>
          <button className="modal-close" onClick={close}><CloseIcon size={14} /></button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-name-input">CONTACT NAME</label>
            <input
              id="contact-name-input"
              className="form-input"
              placeholder="Enter contact name..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="btn-row" style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              {isExisting ? 'SAVE CHANGES' : 'SAVE CONTACT'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
