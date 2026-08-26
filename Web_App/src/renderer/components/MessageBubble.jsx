import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { CheckIcon, DoubleCheckIcon } from './Icons';

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function shouldShowDate(msg, prevMsg) {
  if (!prevMsg) return true;
  const a = new Date(msg.timestamp).toDateString();
  const b = new Date(prevMsg.timestamp).toDateString();
  return a !== b;
}

function TickIcon({ status }) {
  if (status === 'sent')      return <CheckIcon className="tick-icon" size={13} />;
  if (status === 'delivered') return <DoubleCheckIcon className="tick-icon delivered" size={13} />;
  if (status === 'read')      return <DoubleCheckIcon className="tick-icon read" size={13} />;
  return null;
}

export default function MessageBubble({ msg, prevMsg }) {
  const bubbleRef = useRef(null);
  const isSent = msg.direction === 'sent';

  // GSAP entrance
  useLayoutEffect(() => {
    if (bubbleRef.current) {
      gsap.fromTo(
        bubbleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, []);

  const showDate = shouldShowDate(msg, prevMsg);

  return (
    <>
      {showDate && (
        <div className="day-divider font-mono">
          {new Date(msg.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      )}
      <div ref={bubbleRef} className={`message-wrap ${isSent ? 'sent' : 'received'}`}>
        <div className={`bubble ${isSent ? 'sent' : 'received'}`}>
          {msg.content}
        </div>
        <div className="bubble-footer">
          <span className="bubble-time font-mono">{formatTime(msg.timestamp)}</span>
          {isSent && <TickIcon status={msg.status} />}
        </div>
      </div>
    </>
  );
}
