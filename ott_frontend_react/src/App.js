import React, { useState, useEffect } from 'react';
import './App.css';
import { WebSocketProvider } from './components/WebSocketProvider';
import ReactionsPanel from './components/ReactionsPanel';
import ChatPanel from './components/ChatPanel';
import AISummaries from './components/AISummaries';
import StatsCharts from './components/StatsCharts';

/*
  PUBLIC_INTERFACE
  Main App renders the live cricket stream video area,
  sticky emoji reaction bar, live chat overlay, and animated reactions as per design.
*/
function App() {
  const [theme, setTheme] = useState('light');
  const [showChat, setShowChat] = useState(false);

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
  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  return (
    <WebSocketProvider>
      <div className="App stream-bg">
        <header className="App-header" style={{ background: 'none', minHeight: 0, padding: 0 }}>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          {/* Chat toggle button */}
          <button
            className="theme-toggle"
            style={{ right: 110, position: 'absolute', top: 20, zIndex: 201, background: '#2a2a31' }}
            onClick={toggleChat}
            aria-label="Toggle live chat">
            💬 Chat
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
            <ReactionsPanel emojiList={EMOJIS} viewersCount={viewersCount} />
          </div>
          {/* --- Live Statistics Charts Panel --- */}
          <StatsCharts pollInterval={60000} />
          {/* --- AI Summaries Panel --- */}
          <AISummaries pollInterval={15000} />
        </main>
        <ChatPanel open={showChat} onClose={() => setShowChat(false)} />
      </div>
    </WebSocketProvider>
  );
}

export default App;
