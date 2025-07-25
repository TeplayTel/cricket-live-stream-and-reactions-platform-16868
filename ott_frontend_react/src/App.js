import React, { useState } from "react";
import ReactPlayer from "react-player";
import "./App.css";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { WebSocketProvider } from "./components/WebSocketProvider";
import ReactionsPanel from "./components/ReactionsPanel";
import ChatPanel from "./components/ChatPanel";
import AISummaries from "./components/AISummaries";
import StatsCharts from "./components/StatsCharts";
import Highlights from "./components/Highlights";

/*
  PUBLIC_INTERFACE
  Main App renders the live cricket stream video area,
  sticky emoji reaction bar, live chat overlay, and animated reactions as per design.
*/
function CoreApp() {
  const { theme, toggleTheme } = useTheme();
  const [showChat, setShowChat] = useState(false);

  // Simulated video time state for highlight jumping (if using real player, replace with ref API)
  const [videoTime, setVideoTime] = useState(0);

  const EMOJIS = [
    { char: "❤️", label: "Heart" },
    { char: "🔥", label: "Fire" },
    { char: "😄", label: "Smiley" },
    { char: "😮", label: "Surprised" },
    { char: "👏", label: "Applause" },
    { char: "😡", label: "Angry" },
    { char: "👍", label: "Thumbs up" },
  ];
  const viewersCount = "2.1K";

  // Provide overlay tap to close for chat on mobile
  const isMobile =
    typeof window !== "undefined"
      ? window.innerWidth < 700
      : false;

  return (
    <WebSocketProvider>
      <div className="App stream-bg">
        <header
          className="App-header"
          style={{ background: "none", minHeight: 0, padding: 0 }}
        >
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          {/* Chat toggle button */}
          <button
            className="theme-toggle"
            style={{
              right: 110,
              position: "absolute",
              top: 20,
              zIndex: 201,
              background: "#2a2a31",
            }}
            onClick={() => setShowChat((prev) => !prev)}
            aria-label="Toggle live chat"
          >
            💬 Chat
          </button>
        </header>

        <main className="stream-main">
          {/* --- Video Area --- */}
          <div className="video-area" style={{ position: "relative" }}>
            {/* Real YouTube video player, overlays above it */}
            <ReactPlayer
              url="https://www.youtube.com/watch?v=bWiMT8hRRGM"
              width="100%"
              height="100%"
              playing
              controls
              muted={false}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                background: "#1a1a1a",
              }}
              config={{
                youtube: {
                  playerVars: { showinfo: 0, rel: 0 },
                },
              }}
            />
            {/* --- Video overlays (score, title, etc.) --- */}
            <div className="video-overlay-title">
              <span className="streamsport-logo">StreamSport</span>
              <span className="live-pill">LIVE</span>
            </div>
            <div className="video-overlay-score">
              <strong>FCB</strong>{" "}
              <span className="score-main">2 - 1</span> <strong>RMA</strong>
              <span className="minute-marker">
                {/* Show "jumped" time if highlight jump was clicked */}
                {videoTime > 0 ? (
                  <span
                    style={{
                      color: "#ffe141",
                      fontWeight: 900,
                      marginRight: 6,
                      fontSize: "1.10em",
                    }}
                  >
                    {/* mm:ss */}
                    {Math.floor(videoTime / 60)}:
                    {(videoTime % 60).toString().padStart(2, "0")}
                  </span>
                ) : (
                  "76:42"
                )}
              </span>
            </div>
            <div className="video-overlay-viewers">
              <button className="viewer-btn" tabIndex={-1}>
                <span role="img" aria-label="eye">
                  👁
                </span>{" "}
                {viewersCount}
              </button>
              <button className="viewer-btn" tabIndex={-1}>
                <span role="img" aria-label="share">
                  🔗
                </span>
              </button>
            </div>
            {/* --- Emoji Bar (Sticky/Overlay) --- */}
            <ReactionsPanel emojiList={EMOJIS} viewersCount={viewersCount} />
          </div>
          {/* --- Highlight Reel Panel --- */}
          <Highlights onJump={(time) => setVideoTime(time)} />
          {/* --- Live Statistics Charts Panel --- */}
          <StatsCharts pollInterval={60000} />
          {/* --- AI Summaries Panel --- */}
          <AISummaries pollInterval={15000} />
        </main>
        {/* Overlay background for mobile when chat is open */}
        {showChat && isMobile && (
          <div
            style={{
              position: "fixed",
              zIndex: 200,
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.27)",
              touchAction: "none",
            }}
            onClick={() => setShowChat(false)}
            aria-label="Close chat overlay"
          />
        )}
        <ChatPanel open={showChat} onClose={() => setShowChat(false)} />
      </div>
    </WebSocketProvider>
  );
}

// Wrap entire app in ThemeProvider (entrypoint)
function App() {
  return (
    <ThemeProvider>
      <CoreApp />
    </ThemeProvider>
  );
}

export default App;
