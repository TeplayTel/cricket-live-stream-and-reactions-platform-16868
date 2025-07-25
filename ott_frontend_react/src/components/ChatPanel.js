import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from './WebSocketProvider';

// Mock user for demo
const DEMO_USER = { name: 'You' };

/**
 * Sidebar/overlay chat panel, real-time with emoji support.
 * Shows all messages live, auto-scrolls, and provides new message input.
 */
export default function ChatPanel({ open, onClose }) {
  const { chatMessages, sendChat, connected } = useWebSocket();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const handleInput = (e) => {
    setMessage(e.target.value);
  };
  const handleSend = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length === 0) return;
    sendChat({ user: DEMO_USER.name, text });
    setMessage('');
  };

  // Pressing Esc closes chat (if callback provided)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && typeof onClose === 'function') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Simple overlay style for demo
  if (!open) return null;

  return (
    <aside className="chat-panel-overlay">
      <div className="chat-panel-header">
        <span role="img" aria-label="chat">💬</span> Chat
        <button
          className="chat-panel-close"
          aria-label="Close Chat"
          onClick={onClose}
        >
          ×
        </button>
        <span className={`chat-panel-conn ${connected ? 'online' : 'offline'}`}>
          {connected ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="chat-panel-messages">
        {chatMessages.map(msg => (
          <div className="chat-message" key={msg.id}>
            <span className="chat-user">{msg.user || 'Anon'}: </span>
            <span className="chat-text">{msg.text}</span>
            <span className="chat-ts">{new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <form className="chat-panel-input" onSubmit={handleSend}>
        <input
          type="text"
          value={message}
          onChange={handleInput}
          placeholder="Type a message…"
          aria-label="Type a message"
          disabled={!connected}
        />
        <button type="submit" disabled={!connected || !message.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
}
