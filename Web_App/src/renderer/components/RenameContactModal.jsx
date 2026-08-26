import React, { useState, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { CloseIcon } from './Icons';

export default function RenameContactModal() {
  const { renameModalPeer, setRenameModalPeer, saveContact, renameContact, contacts, setActiveContact } = useAppStore();
  const [name, setName] = useState(renameModalPeer?.contact?.name || '');
  const modalRef = useRef(null);

  useLayoutEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.93, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'back.out(1.5)' });
    }
  }, []);

  if (!renameModalPeer) return null;

  const { contactId, contact, isEphemeral } = renameModalPeer;
  const isExisting = Boolean(contacts.find(c => `${c.ip}:${c.port}` === contactId || c.id === contact.id));

  const close = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, { opacity: 0, scale: 0.95, y: 4, duration: 0.14, ease: 'power2.in', onComplete: () => setRenameModalPeer(null) });
    } else {
      setRenameModalPeer(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isExisting) {
      await renameContact(contact.id || contactId, name.trim());
    } else {
      // Save new contact
      const [ip, port] = contactId.split(':');
      await saveContact({
        name: name.trim(),
        ip: contact.ip || ip,
        port: Number(contact.port || port),
        kemPublicKey: contact.kemPublicKey || null,
        sigPublicKey: contact.sigPublicKey || null,
        fingerprint: contact.fingerprint || null,
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
