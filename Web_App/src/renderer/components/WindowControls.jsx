import React, { useState, useEffect } from 'react';

const getApi = () => window.kryptonWave || window.quantuSecure;

export default function WindowControls({ className = '' }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMax = async () => {
      const max = await getApi()?.windowIsMaximized();
      if (typeof max === 'boolean') setIsMaximized(max);
    };
    checkMax();
  }, []);

  const handleClose = (e) => {
    e.stopPropagation();
    getApi()?.windowClose();
  };

  const handleMinimize = (e) => {
    e.stopPropagation();
    getApi()?.windowMinimize();
  };

  const handleMaximize = async (e) => {
    e.stopPropagation();
    await getApi()?.windowMaximize();
    const max = await getApi()?.windowIsMaximized();
    if (typeof max === 'boolean') setIsMaximized(max);
  };

  return (
    <div
      className={`mac-traffic-lights ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      {/* Close (Red) */}
      <button
        id="window-close-btn"
        className="traffic-btn traffic-close"
        title="Close"
        onClick={handleClose}
      >
        {isHovered && (
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <path d="M0.8 0.8L5.2 5.2M5.2 0.8L0.8 5.2" stroke="#4d0000" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Minimize (Yellow) */}
      <button
        id="window-minimize-btn"
        className="traffic-btn traffic-minimize"
        title="Minimize"
        onClick={handleMinimize}
      >
        {isHovered && (
          <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
            <path d="M0.8 1H5.2" stroke="#5a3d00" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Maximize / Restore (Green) */}
      <button
        id="window-maximize-btn"
        className="traffic-btn traffic-maximize"
        title={isMaximized ? "Restore Window" : "Maximize Window"}
        onClick={handleMaximize}
      >
        {isHovered && (
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            {isMaximized ? (
              <path d="M1.2 4.8L4.8 1.2M3 1.2H4.8V3M3 4.8H1.2V3" stroke="#003d10" strokeWidth="1" strokeLinecap="round" />
            ) : (
              <path d="M4.8 1.2L1.2 4.8M1.2 2.5V4.8H3.5M4.8 3.5V1.2H2.5" stroke="#003d10" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        )}
      </button>
    </div>
  );
}
