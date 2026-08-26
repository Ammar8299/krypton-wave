import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CopyIcon, ShieldIcon } from './Icons';

const getApi = () => window.kryptonWave || window.quantuSecure;

function formatHexSnippet(b64Str, byteCount = 4) {
  if (!b64Str) return '—';
  try {
    const raw = atob(b64Str);
    let hex = '';
    for (let i = 0; i < Math.min(raw.length, byteCount); i++) {
      hex += raw.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex + (raw.length > byteCount ? '…' : '');
  } catch {
    return b64Str.slice(0, 8) + '…';
  }
}

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

function getStatusBadge(config) {
  const { kemEnabled, sigEnabled, aesEnabled } = config || {};
  if (!kemEnabled && !sigEnabled && !aesEnabled) {
    return {
      text: '⚠️ NO MESSAGE ENCRYPTION — PLAINTEXT MODE',
      className: 'status-badge--danger',
    };
  }
  if (kemEnabled && sigEnabled && aesEnabled) {
    return {
      text: '🔐 POST-QUANTUM KEY ESTABLISHMENT + AUTHENTICATED ENCRYPTION',
      className: 'status-badge--secure',
    };
  }
  const parts = [];
  if (kemEnabled) parts.push('ML-KEM');
  if (sigEnabled) parts.push('Falcon-512');
  if (aesEnabled) parts.push('AES-GCM');
  return {
    text: `🔒 ACTIVE LAYERS: ${parts.join(' + ')}`,
    className: 'status-badge--warn',
  };
}

export default function IdentityScreen() {
  const {
    identity,
    updateIdentityName,
    securityConfig,
    setSecurityConfig,
    configDirty,
    cryptoEvents,
  } = useAppStore();

  const [editingName, setEditingName]   = useState(false);
  const [nameVal, setNameVal]           = useState(identity?.name || '');
  const [editingPort, setEditingPort]   = useState(false);
  const [portVal, setPortVal]           = useState(identity?.listenPort || 5050);
  const [clearConfirm, setClearConfirm] = useState(false);

  const nodeAddress = identity ? `${identity.ip}:${identity.port}` : '…';
  const [copiedAddr, copyAddr] = useCopy(nodeAddress);
  const [copiedFP,   copyFP]   = useCopy(identity?.fingerprint || '');

  if (!identity) {
    return (
      <div className="identity-screen" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ShieldIcon size={40} className="text-green" style={{ opacity: 0.3 }} />
        <div className="font-mono" style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 11 }}>
          IDENTITY NOT AVAILABLE<br />
          <span style={{ color: 'var(--green-dim)' }}>Run via Electron (<code style={{ color: 'var(--green-primary)' }}>npm run dev</code>)</span>
        </div>
      </div>
    );
  }

  const handleSaveName = async () => {
    if (nameVal.trim()) await updateIdentityName(nameVal.trim());
    setEditingName(false);
  };

  const handleClearData = async () => {
    await getApi()?.clearAllData();
    setClearConfirm(false);
  };

  const statusBadge = getStatusBadge(securityConfig);

  return (
    <div className="identity-screen">
      {/* Header */}
      <div
        className="identity-screen-header"
        style={{ WebkitAppRegion: 'drag', userSelect: 'none' }}
        onDoubleClick={() => getApi()?.windowMaximize()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, WebkitAppRegion: 'no-drag' }}>
          <ShieldIcon size={22} style={{ color: 'var(--green-primary)' }} className="text-green" />
          <div>
            <div className="identity-screen-title font-mono">Kπyρτόn_wave~</div>
            <div className="identity-screen-sub font-mono">NODE CONFIGURATION · POST-QUANTUM PROTOCOL SUITE</div>
          </div>
        </div>
      </div>

      {/* ── 1. My Identity ────────────────────────────────────────── */}
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
              <div className="peer-info-label">LAN ADDRESS (OTHER DEVICES ON NETWORK)</div>
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
            Use 127.0.0.1 when testing between two instances on this same device
          </div>
        </div>

        <div>
          <div className="peer-info-label">FALCON-512 SIGNING FINGERPRINT (FIPS 206)</div>
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
            Deterministic SHA-256 fingerprint of your Falcon-512 public key (897 bytes)
          </div>
        </div>
      </div>

      {/* ── 2. Cryptographic Stack with Toggles ──────────────────── */}
      <div className="info-card">
        <div className="info-card-title">CRYPTOGRAPHIC STACK</div>

        {/* ML-KEM-768 */}
        <div className="crypto-toggle-row">
          <div className="crypto-toggle-info">
            <div className="crypto-toggle-name" style={{ color: 'var(--color-kem)' }}>
              ML-KEM-768
            </div>
            <div className="crypto-toggle-desc font-mono">
              Key Exchange (FIPS 203) — Post-Quantum lattice-based KEM
            </div>
          </div>
          <button
            id="toggle-kem-btn"
            className={`toggle-btn ${securityConfig.kemEnabled ? 'active-kem' : ''}`}
            onClick={() => setSecurityConfig({ kemEnabled: !securityConfig.kemEnabled })}
          >
            <span className="toggle-indicator" />
            <span className="font-mono">{securityConfig.kemEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Falcon-512 */}
        <div className="crypto-toggle-row">
          <div className="crypto-toggle-info">
            <div className="crypto-toggle-name" style={{ color: 'var(--color-sig)' }}>
              Falcon-512
            </div>
            <div className="crypto-toggle-desc font-mono">
              Authentication &amp; Identity Signing (FIPS 206) — Post-Quantum lattice signatures
            </div>
          </div>
          <button
            id="toggle-sig-btn"
            className={`toggle-btn ${securityConfig.sigEnabled ? 'active-sig' : ''}`}
            onClick={() => setSecurityConfig({ sigEnabled: !securityConfig.sigEnabled })}
          >
            <span className="toggle-indicator" />
            <span className="font-mono">{securityConfig.sigEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* AES-256-GCM */}
        <div className="crypto-toggle-row">
          <div className="crypto-toggle-info">
            <div className="crypto-toggle-name" style={{ color: 'var(--color-aes)' }}>
              AES-256-GCM
            </div>
            <div className="crypto-toggle-desc font-mono">
              Message Payload Encryption — AEAD with 96-bit IV &amp; 128-bit tag
            </div>
          </div>
          <button
            id="toggle-aes-btn"
            className={`toggle-btn ${securityConfig.aesEnabled ? 'active-aes' : ''}`}
            onClick={() => setSecurityConfig({ aesEnabled: !securityConfig.aesEnabled })}
          >
            <span className="toggle-indicator" />
            <span className="font-mono">{securityConfig.aesEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Live status string */}
        <div className={`status-summary-bar font-mono ${statusBadge.className}`}>
          {statusBadge.text}
        </div>

        {/* Dirty configuration warning */}
        {configDirty && (
          <div className="reconnect-alert font-mono">
            ⚡ Security configuration changed — reconnect or perform a new handshake to apply.
          </div>
        )}
      </div>

      {/* ── 3. Live Crypto Telemetry ─────────────────────────────── */}
      <div className="info-card">
        <div className="info-card-title">LIVE CRYPTO TELEMETRY (REAL PACKETS)</div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          Real event stream from sent &amp; received TCP messages. No simulated data.
        </div>

        {cryptoEvents.length === 0 ? (
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', padding: '12px 0', textAlign: 'center' }}>
            Awaiting network traffic — send a message to observe live cryptographic telemetry.
          </div>
        ) : (
          <div className="telemetry-table">
            <div className="telemetry-header font-mono">
              <span>TIME</span>
              <span>DIR</span>
              <span>ALGORITHM</span>
              <span>PAYLOAD SIZE</span>
              <span>IV / TAG</span>
            </div>
            {(cryptoEvents || []).map((evt, idx) => {
              const timeStr = evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : '--:--:--';
              const isEnc = evt.encrypted;
              const ivSnippet = formatHexSnippet(evt.iv, 4);
              const tagSnippet = formatHexSnippet(evt.tag, 4);
              return (
                <div key={`${evt.id || idx}-${evt.timestamp || idx}`} className="telemetry-row font-mono">
                  <span style={{ color: 'var(--text-muted)' }}>{timeStr}</span>
                  <span className={evt.direction === 'sent' ? 'telemetry-sent' : 'telemetry-recv'}>
                    {(evt.direction || 'EVENT').toUpperCase()}
                  </span>
                  <span style={{ color: isEnc ? 'var(--color-aes)' : 'var(--red-alert)' }}>
                    {evt.algo || (isEnc ? 'AES-256-GCM' : 'PLAINTEXT')}
                  </span>
                  <span>{evt.byteSize || 0} B</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {isEnc ? `iv:${ivSnippet} tag:${tagSnippet}` : 'RAW PLAINTEXT'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. Settings ─────────────────────────────────────────── */}
      <div className="info-card">
        <div className="info-card-title">SETTINGS</div>

        <div className="settings-row">
          <span className="settings-key font-mono">Listen Port</span>
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
              <span className="settings-val font-mono">{identity.port}</span>
              <button id="edit-port-btn" className="copy-btn" onClick={() => setEditingPort(true)}>EDIT</button>
            </div>
          )}
        </div>

        <div className="settings-row">
          <span className="settings-key font-mono">Project</span>
          <span className="settings-val font-mono" style={{ color: 'var(--green-bright)' }}>Kπyρτόn_wave~ v1.0.0</span>
        </div>

        <div style={{ marginTop: 16 }}>
          {!clearConfirm ? (
            <button id="clear-data-btn" className="btn btn-danger font-mono" onClick={() => setClearConfirm(true)}>
              CLEAR ALL DATA
            </button>
          ) : (
            <div>
              <div className="font-mono" style={{ fontSize: 11, color: 'var(--red-alert)', marginBottom: 10 }}>
                ⚠ This will delete all contacts and message history. This cannot be undone.
              </div>
              <div className="btn-row">
                <button id="confirm-clear-btn" className="btn btn-danger font-mono" onClick={handleClearData}>CONFIRM DELETE</button>
                <button className="btn btn-ghost font-mono" onClick={() => setClearConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
