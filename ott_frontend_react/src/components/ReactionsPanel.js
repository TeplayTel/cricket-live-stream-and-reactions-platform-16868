import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from './WebSocketProvider';

/**
 * PUBLIC_INTERFACE
 * Refactored Emoji Reaction Bar—now emoji fly animation ONLY on click, never on hover.
 *
 * Props:
 *  - emojiList: array of { char: string, label: string }
 *  - viewersCount: string|number
 *  - show: bool (show bar)
 */
export default function ReactionsPanel({ emojiList, viewersCount, show }) {
  const { sendReaction } = useWebSocket();
  // We keep *local* click bubble state, instead of tracking incoming reactions for flying animation
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [bubbles, setBubbles] = useState([]); // {id, emoji, btnIdx}

  const EMOJI_BTN_SIZE = 32;
  const EMOJI_ICON_SIZE = 22;

  // PUBLIC_INTERFACE: On click, animate only the clicked emoji and make its bubble fly
  function triggerEmoji(emoji, btnIdx) {
    // Animate the clicked emoji icon and bubble
    setAnimatingIndex(btnIdx);
    setBubbles((curr) => [
      ...curr,
      {
        id: Date.now() + Math.random(),
        emoji,
        btnIdx,
      },
    ]);
    // Send the reaction (WebSocket propagation of reaction—it may trigger flying bubbles for other users if necessary)
    sendReaction({ emoji, btnIdx });
    setTimeout(() => setAnimatingIndex(null), 340);
    setTimeout(() => {
      setBubbles((curr) => curr.slice(1));
    }, 1100);
  }

  // Arrange floating emoji bubble above each emoji button (responsive to button index)
  function getButtonOffset(idx) {
    const total = emojiList.length;
    const base = (100 / (total + 1)) * (idx + 1);
    return { left: `${base}%` };
  }

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
        width: "auto",
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
                // ONLY animate scale on click (not hover)
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
      {/* Only bubbles triggered by local click fly up */}
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
