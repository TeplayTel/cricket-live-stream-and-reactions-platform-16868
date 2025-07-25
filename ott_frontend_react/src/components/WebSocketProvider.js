import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

/**
 * WebSocketContext provides WebSocket connection and
 * real-time send/receive logic for emoji and chat events.
 */
const WebSocketContext = createContext(null);

// PUBLIC_INTERFACE
export function useWebSocket() {
  /** Access to ws, last message, and emit/send functions. */
  return useContext(WebSocketContext);
}

/**
 * Rolls up all WebSocket events and exposes broadcast & state.
 *
 * @param {React.ReactNode} children - Wrapped subtree.
 */
export function WebSocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [reactions, setReactions] = useState([]); // {id, emoji, btnIdx, ts}
  const [chatMessages, setChatMessages] = useState([]); // {id, user, text, ts}
  const wsRef = useRef(null);

  // PUBLIC_INTERFACE
  // Backend websocket endpoint for live reactions and chat.
  // Use REACT_APP_WS_URL from .env or fallback to default (for localhost/dev: ws://localhost:8765)
  // Should be like ws://<BACKEND_HOST>:<PORT>/ws or wss://...
  const WS_URL = process.env.REACT_APP_WS_URL || `ws://${window.location.hostname}:8765/ws`;

  // -- WebSocket connection management --
  useEffect(() => {
    let ws;
    let isUnmounted = false;
    ws = new window.WebSocket(WS_URL);

    ws.onopen = () => {
      setConnected(true);
    };
    ws.onclose = () => {
      setConnected(false);
    };
    ws.onerror = (e) => {
      // eslint-disable-next-line
      console.error('WebSocket error:', e);
      setConnected(false);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'reaction') {
        setReactions((prev) => [...prev, data.reaction]);
      } else if (data.type === 'chat') {
        setChatMessages((prev) => [...prev, data.message]);
      }
    };
    wsRef.current = ws;

    // Clean up
    return () => {
      isUnmounted = true;
      if (ws.readyState === 1) ws.close();
    };
    // Only connect once
    // eslint-disable-next-line
  }, []);

  // Methods to send events
  // PUBLIC_INTERFACE
  function sendReaction({ emoji, btnIdx }) {
    const reaction = {
      id: Date.now() + Math.random(),
      emoji,
      btnIdx,
      ts: Date.now(),
    };
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(
        JSON.stringify({ type: 'reaction', reaction })
      );
    }
    // Optimistically add for local UI instant reaction
    setReactions((prev) => [...prev, reaction]);
  }

  // PUBLIC_INTERFACE
  function sendChat({ user, text }) {
    const message = {
      id: Date.now() + Math.random(),
      user,
      text,
      ts: Date.now(),
    };
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(
        JSON.stringify({ type: 'chat', message })
      );
    }
    setChatMessages((prev) => [...prev, message]);
  }

  // Option to clear local reactions/messages (not used)
  // function clearAll() { setReactions([]); setChatMessages([]); }

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        reactions,
        chatMessages,
        sendReaction,
        sendChat,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
