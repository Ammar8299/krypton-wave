import React, { useState, useRef, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { SendIcon } from './Icons';

const getApi = () => window.quantuSecure;
let typingTimer = null;

export default function InputBar({ contactId, isOnline }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const sendBtnRef = useRef(null);
  const { sendMessage } = useAppStore();
  const isTyping = useRef(false);

  // Typing indicator logic
  useEffect(() => {
    return () => {
      clearTimeout(typingTimer);
      if (isTyping.current) getApi()?.sendTyping(contactId, false);
    };
  }, [contactId]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!isTyping.current) {
      isTyping.current = true;
      getApi()?.sendTyping(contactId, true);
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      isTyping.current = false;
      getApi()?.sendTyping(contactId, false);
    }, 2000);
  };

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending || !isOnline) return;
    clearTimeout(typingTimer);
    if (isTyping.current) { isTyping.current = false; getApi()?.sendTyping(contactId, false); }

    // Animate send button
    if (sendBtnRef.current) {
      gsap.fromTo(sendBtnRef.current, { scale: 0.88 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
    }

    setSending(true);
    const content = text;
    setText('');
    await sendMessage(content);
    setSending(false);
  }, [text, sending, isOnline, contactId, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-bar">
      <textarea
        id="message-input"
        className="message-input"
        placeholder={isOnline ? 'Type a message…' : 'Peer offline — connect first'}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={!isOnline}
        rows={1}
        style={{ height: 'auto' }}
        onInput={e => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
        }}
      />
      <button
        id="send-btn"
        ref={sendBtnRef}
        className="send-btn"
        onClick={handleSend}
        disabled={!text.trim() || sending || !isOnline}
        title="Send (Enter)"
      >
        <SendIcon size={16} />
      </button>
    </div>
  );
}
