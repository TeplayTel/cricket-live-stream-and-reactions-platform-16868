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
export default function ReactionsPanel({ emojiList, viewersCount }) {
  const { sendReaction, reactions } = useWebSocket();
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [bubbles, setBubbles] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef(null);

  // amount of emojis shown in minimized state (responsive: 2/3 on mobile, 3 on md, 4+ on wide)
  const getVisibleCount = () => {
    // basic heuristic, should ideally be responsive to container size
    if (window.innerWidth < 450) return 1;
    if (window.innerWidth < 650) return 2;
    if (window.innerWidth < 900) return 3;
    return 3;
  };
  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    // Update on resize
    const handler = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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
    const animTimer = setTimeout(() => setAnimatingIndex(null), 350);
    const removeTimer = setTimeout(() => {
      setBubbles((curr) => curr.slice(1));
    }, 1100);
    return () => {
      clearTimeout(animTimer);
      clearTimeout(removeTimer);
    };
    // eslint-disable-next-line
  }, [reactions.length]);

  // PUBLIC_INTERFACE
  function triggerEmoji(emoji, btnIdx) {
    sendReaction({ emoji, btnIdx });
    setExpanded(false);  // collapse after click (optional)
  }

  // For bubble floating
  function getButtonOffset(idx) {
    // Works for emoji count up to 7; expand logic in future.
    const total = expanded ? emojiList.length : visibleCount;
    const base = (100 / (total + 1)) * ((expanded ? idx : idx % visibleCount) + 1);
    return { left: `${base}%` };
  }

  // Styling: Expanded state logic & accessible focus
  const minimizedEmojis = emojiList.slice(0, visibleCount);

  return (
    <div
      className={`emoji-bar-minimized${expanded ? " expanded" : ""}`}
      ref={panelRef}
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "56px",
        background: "rgba(23, 26, 30, 0.88)",
        borderRadius: 32,
        boxShadow: expanded
          ? "0 8px 32px rgba(31,34,38,0.22)"
          : "0 2.5px 18px rgba(31,34,38,0.17)",
        padding: "7px 10px",
        display: "flex",
        alignItems: "center",
        gap: "7px",
        zIndex: 8,
        transition: "width .18s, box-shadow .22s"
      }}
      tabIndex={0}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      aria-label="Send a live reaction"
    >
      <div className="emoji-bar-inner" style={{
        display: "flex",
        alignItems: "center",
        gap: expanded ? "12px" : "8px",
        minHeight: 38,
        justifyContent: "flex-start",
        transition: "gap .17s"
      }}>
        {(expanded ? emojiList : minimizedEmojis).map((emoji, idx) => (
          <button
            key={emoji.char}
            className={`emoji-btn${animatingIndex === idx ? ' animating' : ''}`}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              width: 38,
              height: 38,
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              transition: "background 0.19s, box-shadow 0.17s, transform 0.15s",
              margin: "0 2px",
              opacity: expanded || idx < visibleCount ? 1 : 0,
              pointerEvents: expanded || idx < visibleCount ? "auto" : "none"
            }}
            onClick={() => triggerEmoji(emoji.char, idx)}
            aria-label={`React with ${emoji.label || emoji.char}`}
            tabIndex={0}
            type="button"
          >
            <span
              className="emoji-icon"
              style={{
                fontSize: 26,
                willChange: "transform",
                transition: "transform 0.17s cubic-bezier(.42,1.48,.20,.98)",
                transform: animatingIndex === idx ? "scale(1.23)" : "scale(1.0)",
                filter: animatingIndex === idx ?
                  "drop-shadow(0 2px 16px #ffe)" :
                  "none"
              }}
            >
              {emoji.char}
            </span>
          </button>
        ))}
        {/* Only show watchers in expanded mode or on desktop */}
        <span
          className="emoji-viewers"
          style={{
            color: "#acb2bb",
            fontSize: "1.04rem",
            fontWeight: 500,
            marginLeft: expanded ? 19 : 9,
            opacity: expanded ? 1 : 0.72,
            transition: "opacity 0.19s, margin 0.19s"
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
