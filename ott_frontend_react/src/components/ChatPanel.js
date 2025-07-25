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
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // for swipe-to-close on mobile (extra UX polish)
  const touchStart = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleInput = (e) => setMessage(e.target.value);

  const handleSend = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length === 0) return;
    sendChat({ user: DEMO_USER.name, text });
    setMessage("");
  };

  // Pressing Esc closes chat (if callback provided)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && typeof onClose === "function") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Mobile swipe/drag to close
  const onTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStart.current = e.touches[0].clientY;
    }
  };
  const onTouchEnd = (e) => {
    if (
      touchStart.current !== null &&
      e.changedTouches &&
      e.changedTouches.length === 1
    ) {
      const delta = e.changedTouches[0].clientY - touchStart.current;
      if (delta > 60 && window.innerWidth < 750) {
        // Dragged down >60px: close overlay
        onClose && onClose();
      }
    }
    touchStart.current = null;
  };

  if (!open) return null;

  return (
    <aside
      className="chat-panel-overlay"
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-modal="true"
      aria-label="Live chat panel"
      role="dialog"
    >
      <div className="chat-panel-header">
        <span role="img" aria-label="chat">
          💬
        </span>{" "}
        Chat
        <button
          className="chat-panel-close"
          aria-label="Close Chat"
          onClick={onClose}
        >
          ×
        </button>
        <span
          className={`chat-panel-conn ${connected ? "online" : "offline"}`}
        >
          {connected ? "Online" : "Offline"}
        </span>
      </div>
      <div className="chat-panel-messages">
        {chatMessages.map((msg) => (
          <div className="chat-message" key={msg.id}>
            <span className="chat-user">{msg.user || "Anon"}: </span>
            <span className="chat-text">{msg.text}</span>
            <span className="chat-ts">
              {new Date(msg.ts).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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
          autoFocus={open}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!connected || !message.trim()}
          tabIndex={open ? 0 : -1}
        >
          Send
        </button>
      </form>
    </aside>
  );
}
