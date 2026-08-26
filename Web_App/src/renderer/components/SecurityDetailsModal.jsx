import React, { useState, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { CloseIcon, ShieldIcon, CopyIcon, LockIcon } from './Icons';

export default function SecurityDetailsModal() {
  const { securityModalPeer, setSecurityModalPeer, blockPeer, unblockPeer, blockedPeers } = useAppStore();
  const [copiedFp, setCopiedFp] = useState(false);
  const [copiedKem, setCopiedKem] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);
  const modalRef = useRef(null);

  useLayoutEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.93, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'back.out(1.5)' });
    }
  }, []);

  if (!securityModalPeer) return null;

  const { contactId, contact } = securityModalPeer;
  const isBlocked = blockedPeers.includes(contactId);

  const close = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, { opacity: 0, scale: 0.95, y: 4, duration: 0.14, ease: 'power2.in', onComplete: () => setSecurityModalPeer(null) });
    } else {
      setSecurityModalPeer(null);
    }
  };

  const copyText = (text, setCopied) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const fingerprint = contact.fingerprint || '—';
  const kemPub = contact.kemPublicKey || 'Exchanged in ephemeral session';
  const sigPub = contact.sigPublicKey || 'Exchanged in ephemeral session';

  return (
    <div className="modal-overlay modal-overlay-enter" onClick={(e) => e.target === e.currentTarget && close()}>
      <div ref={modalRef} className="modal modal-enter" style={{ width: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldIcon size={22} className="text-green" />
            <div>
              <div className="modal-title">SECURITY &amp; IDENTITY</div>
              <div className="modal-subtitle font-mono">POST-QUANTUM CRYPTOGRAPHIC VERIFICATION</div>
            </div>
          </div>
          <button className="modal-close" onClick={close}><CloseIcon size={14} /></button>
        </div>

        {/* Status Banner */}
        <div className="status-row success" style={{ marginBottom: 16 }}>
          <LockIcon size={13} />
          <span>CHANNEL VERIFIED · ML-KEM-768 · FALCON-512 · AES-256-GCM</span>
        </div>

        {/* Peer Info */}
        <div className="info-card" style={{ padding: 14, marginBottom: 12 }}>
          <div className="peer-info-label">PEER NAME &amp; ADDRESS</div>
          <div className="font-headline" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            {contact.name || 'Anonymous Peer'}
          </div>
          <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {contactId}
          </div>
        </div>

        {/* Fingerprint */}
        <div className="info-card" style={{ padding: 14, marginBottom: 12 }}>
          <div className="peer-info-label">FALCON-512 SIGNING KEY FINGERPRINT (SHA-256)</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
            <div className="fingerprint-text" style={{ flex: 1, fontSize: 11 }}>
              {fingerprint}
            </div>
            <button
              className="copy-btn"
              style={{ flexShrink: 0 }}
              onClick={() => copyText(fingerprint, setCopiedFp)}
            >
              <CopyIcon size={11} /> {copiedFp ? 'COPIED!' : 'COPY'}
            </button>
          </div>
          <div className="font-mono" style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Compare this fingerprint out-of-band to ensure no man-in-the-middle attack
          </div>
        </div>

        {/* Crypto Keys */}
        <div className="info-card" style={{ padding: 14, marginBottom: 12 }}>
          <div className="info-card-title" style={{ marginBottom: 10, paddingBottom: 6 }}>KEY MATERIAL</div>

          <div style={{ marginBottom: 10 }}>
            <div className="peer-info-label">ML-KEM-768 PUBLIC KEY (FIPS 203)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <div className="peer-info-value font-mono" style={{ flex: 1, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {kemPub}
              </div>
              {contact.kemPublicKey && (
                <button className="copy-btn" onClick={() => copyText(kemPub, setCopiedKem)}>
                  <CopyIcon size={11} /> {copiedKem ? 'COPIED!' : 'COPY'}
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="peer-info-label">FALCON-512 SIGNING PUBLIC KEY (FIPS 206)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <div className="peer-info-value font-mono" style={{ flex: 1, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sigPub}
              </div>
              {contact.sigPublicKey && (
                <button className="copy-btn" onClick={() => copyText(sigPub, setCopiedSig)}>
                  <CopyIcon size={11} /> {copiedSig ? 'COPIED!' : 'COPY'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button
            className={`btn ${isBlocked ? 'btn-ghost' : 'btn-danger'}`}
            style={{ flex: 1 }}
            onClick={async () => {
              if (isBlocked) await unblockPeer(contactId);
              else await blockPeer(contactId);
            }}
          >
            {isBlocked ? 'UNBLOCK PEER' : 'BLOCK PEER'}
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={close}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
