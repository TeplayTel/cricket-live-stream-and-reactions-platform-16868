import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from './WebSocketProvider';

/**
 * PUBLIC_INTERFACE
 * Modernized Emoji Reaction Bar, minimized by default, expands on hover,
 * sits above the seekbar—matches the redesigned UX.
 *
 * Props:
 *  - emojiList: array of { char: string, label: string }
 *  - viewersCount: string|number
 */
/**
 * PUBLIC_INTERFACE
 * Modernized Emoji Reaction Bar, shown only on player hover, with style and emoji set per latest screenshot.
 * - Props:
 *    - emojiList: array of { char: string, label: string }
 *    - viewersCount: string|number
 *
 * Only renders the emoji bar when 'show' prop is true (controlled by parent/hover state).
 * Uses medium/small emoji size, with all animations retained.
 */
export default function ReactionsPanel({ emojiList, viewersCount, show }) {
  const { sendReaction, reactions } = useWebSocket();
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [bubbles, setBubbles] = useState([]);
  
  // --- Emoji set and arrangement based on latest screenshot ---
  // (this is controlled by parent, so emojiList comes from props)

  // Reduced size for emoji button and icon
  const EMOJI_BTN_SIZE = 32;  // px, medium-small
  const EMOJI_ICON_SIZE = 22;

  // Animate live bubbles as new reactions come in
  useEffect(() => {
    if (reactions.length === 0) return;
    const last = reactions[reactions.length - 1];
    setBubbles((curr) => [
      ...curr,
      {
        id: last.id || Date.now() + Math.random(),
        emoji: last.emoji,
        btnIdx: last.btnIdx,
      },
    ]);
    setAnimatingIndex(last.btnIdx);
    const animTimer = setTimeout(() => setAnimatingIndex(null), 330);
    const removeTimer = setTimeout(() => {
      setBubbles((curr) => curr.slice(1));
    }, 1100);
    return () => {
      clearTimeout(animTimer);
      clearTimeout(removeTimer);
    };
  }, [reactions.length]);

  // PUBLIC_INTERFACE (unchanged)
  function triggerEmoji(emoji, btnIdx) {
    sendReaction({ emoji, btnIdx });
  }

  // For bubble floating, arrange above each btn
  function getButtonOffset(idx) {
    const total = emojiList.length;
    const base = (100 / (total + 1)) * (idx + 1); // Even left spacing
    return { left: `${base}%` };
  }

  // Only render if 'show' is true (parent controls hover detection)
  if (!show) return null;

  return (
    <div
      className="emoji-bar-hover"
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "56px",
        zIndex: 18,
        pointerEvents: "none",
        width: "auto"
      }}
      aria-label="Send a live reaction"
    >
      <div
        className="emoji-bar-inner"
        style={{
          background: "rgba(23, 26, 30, 0.95)",
          borderRadius: 24,
          padding: "6px 23px 6px 17px",
          boxShadow: "0 2.5px 18px rgba(31,34,38,0.20)",
          display: "flex",
          alignItems: "center",
          gap: "13px",
          minWidth: 230,
          pointerEvents: "auto",
        }}
      >
        {emojiList.map((emoji, idx) => (
          <button
            key={emoji.char}
            className={`emoji-btn${animatingIndex === idx ? ' animating' : ''}`}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              width: EMOJI_BTN_SIZE,
              height: EMOJI_BTN_SIZE,
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: EMOJI_ICON_SIZE + 1,
              margin: "0 1.5px",
              transition:
                "background 0.15s, box-shadow 0.13s, transform 0.15s",
              boxShadow: animatingIndex === idx
                ? "0 2.5px 12px #fff8;"
                : "none",
            }}
            onClick={() => triggerEmoji(emoji.char, idx)}
            aria-label={`React with ${emoji.label || emoji.char}`}
            tabIndex={0}
            type="button"
          >
            <span
              className="emoji-icon"
              style={{
                fontSize: EMOJI_ICON_SIZE,
                willChange: "transform",
                transition: "transform 0.19s cubic-bezier(.41,1.44,.23,.98), filter 0.12s",
                transform: animatingIndex === idx ? "scale(1.22)" : "scale(1.0)",
                filter: animatingIndex === idx
                  ? "drop-shadow(0 2px 13px #ffe8)"
                  : "none",
                pointerEvents: "none"
              }}
            >
              {emoji.char}
            </span>
          </button>
        ))}
        <span
          className="emoji-viewers"
          style={{
            marginLeft: "22px",
            color: "#acb2bb",
            fontSize: "1.01rem",
            fontWeight: 500,
            opacity: 0.84,
            pointerEvents: "none",
            transition: "opacity 0.17s"
          }}
        >
          {viewersCount} watching
        </span>
      </div>
      {/* Bubbles overlay for animated emoji on click */}
      <div className="emoji-bubbles">
        {bubbles.map(bub => (
          <span
            key={bub.id}
            className="emoji-bubble"
            style={getButtonOffset(bub.btnIdx)}
            aria-hidden="true"
          >
            {bub.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
