import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from './WebSocketProvider';

/**
 * Renders the emoji reaction bar, triggers real-time (live) bubbles,
 * and updates instantly for all users with animation on incoming emoji events.
 *
 * Props:
 *  - emojiList: array of { char: string, label: string }
 *  - viewersCount: string|number
 */
export default function ReactionsPanel({ emojiList, viewersCount }) {
  const { sendReaction, reactions } = useWebSocket();
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [bubbles, setBubbles] = useState([]);
  const panelRef = useRef(null);

  // Animate live bubbles when new emoji event arrives
  useEffect(() => {
    if (reactions.length === 0) return;
    // Only react to new items (listen for length increase)
    const last = reactions[reactions.length - 1];
    // For each, float a bubble
    setBubbles((curr) => [
      ...curr,
      {
        id: last.id || Date.now() + Math.random(),
        emoji: last.emoji,
        btnIdx: last.btnIdx,
      },
    ]);
    setAnimatingIndex(last.btnIdx);
    const clearAnimTimer = setTimeout(() => setAnimatingIndex(null), 350);
    const removeBubbleTimer = setTimeout(() => {
      setBubbles((curr) => curr.slice(1));
    }, 1100);
    return () => {
      clearTimeout(clearAnimTimer);
      clearTimeout(removeBubbleTimer);
    };
    // eslint-disable-next-line
  }, [reactions.length]);

  // PUBLIC_INTERFACE
  function triggerEmoji(emoji, btnIdx) {
    sendReaction({ emoji, btnIdx });
  }

  // Figure out position offset for bubble (to match button)
  function getButtonOffset(idx) {
    const base = (100 / (emojiList.length + 1)) * (idx + 1);
    return { left: `${base}%` };
  }

  return (
    <div className="emoji-bar" ref={panelRef}>
      <div className="emoji-bar-inner">
        {emojiList.map((emoji, idx) => (
          <button
            key={emoji.char}
            className={`emoji-btn${animatingIndex === idx ? ' animating' : ''}`}
            onClick={() => triggerEmoji(emoji.char, idx)}
            aria-label={`React with ${emoji.char}`}
            tabIndex={0}
            type="button"
          >
            <span className="emoji-icon">{emoji.char}</span>
          </button>
        ))}
        <span className="emoji-viewers">{viewersCount} watching</span>
      </div>
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
