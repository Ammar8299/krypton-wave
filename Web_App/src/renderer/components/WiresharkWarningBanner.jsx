import React from 'react';
import { useAppStore } from '../store/useAppStore';

export default function WiresharkWarningBanner() {
  const { securityConfig } = useAppStore();

  if (!securityConfig?.wiresharkMode) return null;

  return (
    <div className="wireshark-banner">
      <div className="wireshark-banner-icon">🧪</div>
      <div className="wireshark-banner-content">
        <div className="wireshark-banner-title">
          ⚠️ WIRESHARK ANALYSIS MODE ACTIVE
        </div>
        <div className="wireshark-banner-desc font-mono">
          Debug metadata frames are intentionally transmitted as plaintext for network packet inspection.
        </div>
      </div>
    </div>
  );
}
