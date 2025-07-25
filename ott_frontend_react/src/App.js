import React, { useState, useEffect } from 'react';
import './App.css';

/*
  PUBLIC_INTERFACE
  Main App renders the live cricket stream video area,
  sticky emoji reaction bar with animated reactions as per design.
*/
function App() {
  const [theme, setTheme] = useState('light');
  const [bubbles, setBubbles] = useState([]);
  const [animatingIndex, setAnimatingIndex] = useState(null);

  const EMOJIS = [
    { char: '❤️', label: 'Heart' },
    { char: '🔥', label: 'Fire' },
    { char: '😄', label: 'Smiley' },
    { char: '😮', label: 'Surprised' },
    { char: '👏', label: 'Applause' },
    { char: '😡', label: 'Angry' },
    { char: '👍', label: 'Thumbs up' }
  ];
  const viewersCount = '2.1K';

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  // Triggers the emoji animation and floating bubble
  function triggerEmoji(emoji, btnIdx) {
    // Animate the pressed button (scale pop)
    setAnimatingIndex(btnIdx);
    setTimeout(() => setAnimatingIndex(null), 300);

    // Floating emoji bubbles (unique id for animation instance)
    const bubbleId = Date.now() + Math.random();
    setBubbles(b => [
      ...b,
      { id: bubbleId, emoji, btnIdx }
    ]);
    // Clean up bubble after animation completes
    setTimeout(() => {
      setBubbles(curr => curr.filter(bub => bub.id !== bubbleId));
    }, 1000);
  }

  // Calculate emoji button's relative position (for bubble effect)
  function getButtonOffset(idx) {
    // Assumes emoji bar has width of 100%. Distribute evenly.
    const base = (100 / (EMOJIS.length + 1)) * (idx + 1);
    return { left: `${base}%` };
  }

  return (
    <div className="App stream-bg">
      <header className="App-header" style={{background: 'none', minHeight: 0, padding: 0 }}>
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="stream-main">
        {/* --- Video Area --- */}
        <div className="video-area">
          {/* Simulated video for UI layout */}
          <div className="mock-video-player">
            <div className="video-overlay-title">
              <span className="streamsport-logo">StreamSport</span>
              <span className="live-pill">LIVE</span>
            </div>
            <div className="video-overlay-score">
              <strong>FCB</strong> <span className="score-main">2 - 1</span> <strong>RMA</strong>
              <span className="minute-marker">76:42</span>
            </div>
            <div className="video-overlay-viewers">
              <button className="viewer-btn" tabIndex={-1}><span role="img" aria-label="eye">👁</span> {viewersCount}</button>
              <button className="viewer-btn" tabIndex={-1}><span role="img" aria-label="share">🔗</span></button>
            </div>
          </div>

          {/* --- Emoji Bar (Sticky/Overlay) --- */}
          <div className="emoji-bar">
            <div className="emoji-bar-inner">
              {EMOJIS.map((emoji, idx) => (
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
              {/* Viewers text on right */}
              <span className="emoji-viewers">{viewersCount} watching</span>
            </div>
            {/* Floating bubbles */}
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
        </div>
      </main>
    </div>
  );
}

export default App;
