import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CopyIcon, ShieldIcon } from './Icons';

const getApi = () => window.quantuSecure;

const CRYPTO_STACK = [
  { name: 'ML-KEM-768',   role: 'Key Exchange (FIPS 203)' },
  { name: 'Ed25519*',     role: 'Authentication / Identity Signing' },
  { name: 'AES-256-GCM',  role: 'Payload Encryption' },
  { name: 'HKDF-SHA256',  role: 'Session Key Derivation' },
];

function useCopy(text) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return [copied, copy];
}

export default function IdentityScreen() {
  const { identity, updateIdentityName } = useAppStore();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal]         = useState(identity?.name || '');
  const [editingPort, setEditingPort] = useState(false);
  const [portVal, setPortVal]         = useState(identity?.listenPort || 5050);
  const [clearConfirm, setClearConfirm] = useState(false);

  const nodeAddress = identity ? `${identity.ip}:${identity.port}` : '…';
  const [copiedAddr, copyAddr]         = useCopy(nodeAddress);
  const [copiedFP,   copyFP]           = useCopy(identity?.fingerprint || '');

  if (!identity) return (
    <div className="identity-screen" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ShieldIcon size={40} className="text-green" style={{ opacity: 0.3 }} />
      <div className="font-mono" style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 11 }}>
        IDENTITY NOT AVAILABLE<br />
        <span style={{ color: 'var(--green-dim)' }}>Run the app via Electron (<code style={{ color: 'var(--green-primary)' }}>npm run dev</code>)</span>
      </div>
    </div>
  );

  const handleSaveName = async () => {
    if (nameVal.trim()) await updateIdentityName(nameVal.trim());
    setEditingName(false);
  };

  const handleClearData = async () => {
    await getApi()?.clearAllData();
    setClearConfirm(false);
  };

  return (
    <div className="identity-screen">
      <div
        className="identity-screen-header"
        style={{ WebkitAppRegion: 'drag', userSelect: 'none' }}
        onDoubleClick={() => getApi()?.windowMaximize()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, WebkitAppRegion: 'no-drag' }}>
          <ShieldIcon size={22} style={{ color: 'var(--green-primary)' }} className="text-green" />
          <div>
            <div className="identity-screen-title">IDENTITY &amp; SECURITY</div>
            <div className="identity-screen-sub font-mono">NODE CONFIGURATION · KEY MANAGEMENT</div>
          </div>
        </div>
      </div>

      {/* My Identity */}
      <div className="info-card">
        <div className="info-card-title">MY IDENTITY</div>

        <div style={{ marginBottom: 16 }}>
          <div className="peer-info-label">DISPLAY NAME</div>
          {editingName ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input
                id="identity-name-input"
                className="form-input"
                style={{ flex: 1 }}
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                autoFocus
              />
              <button className="btn btn-primary" style={{ width: 'auto', padding: '0 16px' }} onClick={handleSaveName}>Save</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="font-headline" style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 600 }}>{identity.name}</span>
              <button id="edit-name-btn" className="copy-btn" onClick={() => { setNameVal(identity.name); setEditingName(true); }}>EDIT</button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="peer-info-label">LOCAL TESTING ADDRESS (LOCALHOST)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className="node-address">127.0.0.1:{identity.port}</span>
            <button id="copy-address-btn" className="copy-btn" onClick={copyAddr}>
              <CopyIcon size={11} />
              {copiedAddr ? ' COPIED!' : ' COPY'}
            </button>
          </div>
          {identity.lanIp && identity.lanIp !== '127.0.0.1' && (
            <div style={{ marginTop: 8 }}>
              <div className="peer-info-label">LAN ADDRESS (OTHER DEVICES ON WIFI)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {identity.lanIp}:{identity.port}
                </span>
                <button
                  id="copy-lan-btn"
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(`${identity.lanIp}:${identity.port}`)}
                >
                  <CopyIcon size={11} /> COPY LAN
                </button>
              </div>
            </div>
          )}
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Use 127.0.0.1 when testing between two instances on this same PC
          </div>
        </div>

        <div>
          <div className="peer-info-label">SIGNING KEY FINGERPRINT</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
            <div className="fingerprint-text" style={{ flex: 1 }}>
              {identity.fingerprint || '—'}
            </div>
            <button id="copy-fingerprint-btn" className="copy-btn" style={{ flexShrink: 0, marginTop: 2 }} onClick={copyFP}>
              <CopyIcon size={11} />
              {copiedFP ? ' COPIED!' : ' COPY'}
            </button>
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Verify this fingerprint out-of-band to confirm your identity has not changed
          </div>
        </div>
      </div>

      {/* Crypto Stack */}
      <div className="info-card">
        <div className="info-card-title">CRYPTOGRAPHIC STACK</div>
        {CRYPTO_STACK.map(row => (
          <div className="crypto-stack-row" key={row.name}>
            <div>
              <div className="crypto-name">{row.name}</div>
              <div className="crypto-role">{row.role}</div>
            </div>
            <span className="active-badge">ACTIVE</span>
          </div>
        ))}
        <div className="font-mono" style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 10 }}>
          * Ed25519 used as authentication stand-in. Swap for Falcon-512 via liboqs for full FIPS 206 compliance.
        </div>
      </div>

      {/* Settings */}
      <div className="info-card">
        <div className="info-card-title">SETTINGS</div>

        <div className="settings-row">
          <span className="settings-key">Listen Port</span>
          {editingPort ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="port-input"
                className="form-input"
                style={{ width: 100, height: 34 }}
                type="number"
                value={portVal}
                onChange={e => setPortVal(e.target.value)}
              />
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '0 12px', height: 34 }}
                onClick={async () => {
                await getApi()?.setListenPort(parseInt(portVal, 10));
                  setEditingPort(false);
                }}
              >Apply</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="settings-val">{identity.port}</span>
              <button id="edit-port-btn" className="copy-btn" onClick={() => setEditingPort(true)}>EDIT</button>
            </div>
          )}
        </div>

        <div className="settings-row">
          <span className="settings-key">Version</span>
          <span className="settings-val font-mono">QuantuSecure v1.0.0</span>
        </div>

        <div style={{ marginTop: 16 }}>
          {!clearConfirm ? (
            <button id="clear-data-btn" className="btn btn-danger" onClick={() => setClearConfirm(true)}>
              CLEAR ALL DATA
            </button>
          ) : (
            <div>
              <div className="font-mono" style={{ fontSize: 11, color: 'var(--red-alert)', marginBottom: 10 }}>
                ⚠ This will delete all contacts and message history. This cannot be undone.
              </div>
              <div className="btn-row">
                <button id="confirm-clear-btn" className="btn btn-danger" onClick={handleClearData}>CONFIRM DELETE</button>
                <button className="btn btn-ghost" onClick={() => setClearConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
