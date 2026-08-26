import React, { useState, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { CloseIcon, AlertCircleIcon } from './Icons';

const getApi = () => window.kryptonWave || window.quantuSecure;

// Handshake states
const S = { IDLE: 'idle', CONNECTING: 'connecting', SUCCESS: 'success', ERROR: 'error' };

export default function AddPeerModal() {
  const { setShowAddModal, setActiveContact, setView, saveContact, refreshContacts } = useAppStore();
  const [address, setAddress]   = useState('');
  const [state, setState]       = useState(S.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [peerInfo, setPeerInfo] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const modalRef = useRef(null);

  useLayoutEffect(() => {
    gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.93, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'back.out(1.5)' });
  }, []);

  const close = () => {
    gsap.to(modalRef.current, { opacity: 0, scale: 0.95, y: 4, duration: 0.14, ease: 'power2.in',
      onComplete: () => setShowAddModal(false) });
  };

  const handleConnect = async () => {
    if (!address.trim()) return;
    const parts = address.trim().split(':');
    if (parts.length < 2) { setErrorMsg('Format: ip:port (e.g. 127.0.0.1:5051)'); setState(S.ERROR); return; }
    const ip   = parts.slice(0, -1).join(':');
    const port = parseInt(parts[parts.length - 1], 10);
    if (!ip || isNaN(port)) { setErrorMsg('Invalid address format'); setState(S.ERROR); return; }

    setState(S.CONNECTING);
    setErrorMsg('');
    const result = await getApi()?.connectPeer(ip, port);
    if (result.ok) {
      setPeerInfo({ ...result.peerInfo, ip, port });
      setDisplayName(result.peerInfo.name || '');
      setState(S.SUCCESS);
    } else {
      setErrorMsg(result.error || 'Connection failed');
      setState(S.ERROR);
    }
  };

  const handleSave = async () => {
    if (!peerInfo) return;
    await saveContact({
      name:         displayName || peerInfo.name || 'Unknown',
      ip:           peerInfo.ip,
      port:         peerInfo.port,
      kemPublicKey: peerInfo.kemPublicKey,
      sigPublicKey: peerInfo.sigPublicKey,
      fingerprint:  peerInfo.fingerprint,
    });
    const id = `${peerInfo.ip}:${peerInfo.port}`;
    setActiveContact(id);
    setView('chat');
    close();
  };

  const handleEphemeral = () => {
    if (!peerInfo) return;
    const id = `${peerInfo.ip}:${peerInfo.port}`;
    setActiveContact(id);
    setView('chat');
    close();
  };

  const tryAgain = () => { setState(S.IDLE); setErrorMsg(''); setPeerInfo(null); };

  const modalClass = state === S.SUCCESS ? 'modal success' : state === S.ERROR ? 'modal error' : 'modal';

  return (
    <div className="modal-overlay modal-overlay-enter" onClick={(e) => e.target === e.currentTarget && close()}>
      <div ref={modalRef} className={`${modalClass} modal-enter`}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">ADD PEER</div>
            <div className="modal-subtitle">Connect via IP:Port · Post-Quantum Handshake</div>
          </div>
          <button className="modal-close" onClick={close}><CloseIcon size={14} /></button>
        </div>

        {/* IDLE / INPUT state */}
        {(state === S.IDLE || state === S.ERROR) && (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="peer-address-input">PEER ADDRESS</label>
              <input
                id="peer-address-input"
                className={`form-input ${state === S.ERROR ? 'error-state' : ''}`}
                placeholder="127.0.0.1:5051"
                value={address}
                onChange={e => { setAddress(e.target.value); if (state === S.ERROR) setState(S.IDLE); }}
                onKeyDown={e => e.key === 'Enter' && handleConnect()}
                autoFocus
              />
            </div>
            {state === S.ERROR && (
              <div className="status-row error">
                <AlertCircleIcon size={13} />
                {errorMsg}
              </div>
            )}
            <button id="initiate-handshake-btn" className="btn btn-primary" onClick={handleConnect}>
              INITIATE HANDSHAKE
            </button>
            {state === S.ERROR && (
              <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={tryAgain}>Try Again</button>
            )}
          </>
        )}

        {/* CONNECTING state */}
        {state === S.CONNECTING && (
          <>
            <div className="status-row connecting">
              <span className="spinner" />
              CONNECTING… POST-QUANTUM HANDSHAKE IN PROGRESS
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" />
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10 }}>
              Establishing secure channel to {address}
            </div>
          </>
        )}

        {/* SUCCESS state */}
        {state === S.SUCCESS && peerInfo && (
          <>
            <div className="status-row success">
              ✓ HANDSHAKE COMPLETE · IDENTITY VERIFIED
            </div>

            <div className="peer-info-card">
              <div className="peer-info-label">PEER IDENTITY</div>
              <div className="peer-info-name">{peerInfo.name || 'Anonymous'}</div>
              <div className="peer-info-label" style={{ marginTop: 8 }}>FINGERPRINT</div>
              <div className="peer-info-value" style={{ fontSize: 10 }}>
                {peerInfo.fingerprint ? peerInfo.fingerprint.slice(0, 39) + '…' : '—'}
              </div>
              <div className="peer-info-label" style={{ marginTop: 8 }}>ADDRESS</div>
              <div className="peer-info-value" style={{ fontSize: 12 }}>{peerInfo.ip}:{peerInfo.port}</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="display-name-input">DISPLAY NAME</label>
              <input
                id="display-name-input"
                className="form-input"
                placeholder={peerInfo.name || 'Enter a name…'}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="btn-row">
              <button id="save-contact-btn" className="btn btn-primary" onClick={handleSave}>
                SAVE CONTACT
              </button>
              <button id="ephemeral-session-btn" className="btn btn-ghost" onClick={handleEphemeral}>
                EPHEMERAL
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
