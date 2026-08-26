import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="message-wrap received">
      <div className="typing-indicator">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
