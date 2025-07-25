import React, { useState } from "react";
import "./App.css";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { WebSocketProvider } from "./components/WebSocketProvider";
import ReactionsPanel from "./components/ReactionsPanel";
import ChatPanel from "./components/ChatPanel";
import AISummaries from "./components/AISummaries";
import StatsCharts from "./components/StatsCharts";
import Highlights from "./components/Highlights";
import "./components/WhoVsWhoBar.css";

/*
  PUBLIC_INTERFACE
  Main App renders the live cricket stream video area,
  chart grid, sleek emoji bar, and custom video player per redesign spec.
*/
function CoreApp() {
  const { theme, toggleTheme } = useTheme();
  const [showChat, setShowChat] = useState(false);
  const [videoTime, setVideoTime] = useState(0);

  const EMOJIS = [
    { char: "❤️", label: "Heart" },
    { char: "🔥", label: "Fire" },
    { char: "😄", label: "Smiley" },
    { char: "😮", label: "Surprised" },
    { char: "👏", label: "Applause" },
    { char: "😡", label: "Angry" },
    { char: "👍", label: "Thumbs up" }
  ];
  const viewersCount = "2.1K";
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 700 : false;

  // -- Custom video player shell (replace embedded YouTube look) --
  function CustomVideoPlayer() {
    // Track hover state for the video player area
    const [hovered, setHovered] = useState(false);

    // Emoji bar emoji set and desired arrangement per screenshot:
    // ❤️, 🔥, 😄, 😮, 👏, 😡, 👍 (already provided above in EMOJIS)

    // Import WhoVsWhoBar at the top
    // import WhoVsWhoBar from "./components/WhoVsWhoBar";
    // Since we can't dynamically inject import, add it at the top of this file for real usage:
    // import WhoVsWhoBar from "./components/WhoVsWhoBar";
    const WhoVsWhoBar = require("./components/WhoVsWhoBar").default;

    return (
      <div
        className="custom-video-player-root"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={-1}
        style={{ position: "relative" }}
      >
        {/* Modern Who vs Who bar above the overlay header */}
        <WhoVsWhoBar
          leftTeam={{ name: "FC Barcelona", abbr: "FCB" }}
          rightTeam={{ name: "Real Madrid", abbr: "RMA" }}
          tournament="UEFA Champions League 2025"
          matchStatus={{ minute: videoTime > 0
            ? `${Math.floor(videoTime / 60)}:${(videoTime % 60).toString().padStart(2, "0")}`
            : "76:42",
            badge: "LIVE"
          }}
          score="2 - 1"
        />

        <div className="video-card-overlay">
          <div className="top-row">
            <span className="brand-stack">
              <span className="brand-red">Stream</span>
              <span className="brand-white">Sport</span>
              <span className="live-pill video-live" style={{ marginLeft: 22 }}>LIVE</span>
            </span>
            <div className="video-overlay-viewers">
              <button className="viewer-btn" tabIndex={-1}>
                <span role="img" aria-label="eye">👁</span> {viewersCount}
              </button>
              <button className="viewer-btn" tabIndex={-1}>
                <span role="img" aria-label="share">🔗</span>
              </button>
            </div>
          </div>
          <div className="score-row">
            <span className="team-abbr">FCB</span>
            <span className="main-score">2 <span className="score-sep">-</span> 1</span>
            <span className="team-abbr">RMA</span>
            <span className="minute-marker-lg">
              {videoTime > 0
                ? (
                  <span style={{
                    color: "#ffe141", fontWeight: 900, fontSize: "1.15em", marginLeft: 14
                  }}>{Math.floor(videoTime / 60)}:{(videoTime % 60).toString().padStart(2, "0")}</span>
                )
                : <span style={{ color: "#ffe141", fontWeight: 900, marginLeft: 14 }}>76:42</span>
              }
            </span>
          </div>
        </div>
        {/* FAKE video content */}
        <div className="mock-video-bg">
          <div className="video-fake-label">[Live Stream Demo]</div>
        </div>
        {/* Emoji Bar - rendered ONLY when player is hovered */}
        <ReactionsPanel emojiList={EMOJIS} viewersCount={viewersCount} show={hovered} />
        {/* Seekbar placeholder */}
        <div className="seekbar-shell">
          <div className="seekbar-track">
            <div className="seekbar-handle" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <WebSocketProvider>
      <div className="App stream-bg" style={{ background: "#171a1e" }}>
        <header className="App-header" style={{ background: "none", minHeight: 0, padding: 0 }}>
          {/* Theme and chat toggles */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
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
        {/* --- Modern single-column layout: video player top, all stats/tables below --- */}
        <main
          className="main-redesign-grid stacked-below-player"
          style={{
            width: "100%",
            maxWidth: 820,
            margin: "0 auto",
            padding: "26px 6vw 20px 6vw",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {/* Video player is always at the top */}
          <section className="videoPlayerArea" style={{ marginBottom: 0 }}>
            <CustomVideoPlayer />
          </section>

          {/* All stats/tables below: stacked */}
          <section
            className="below-player-stats"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "28px",
              width: "100%",
              alignItems: "stretch",
            }}
          >
            <Highlights onJump={(time) => setVideoTime(time)} />

            <div
              className="stats-charts-and-ai"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                width: "100%",
              }}
            >
              {/* Modern grid for charts */}
              <StatsCharts pollInterval={60000} />

              {/* AI summary block, full-width looking card */}
              <AISummaries pollInterval={15000} />
            </div>
          </section>
        </main>

        {/* Mobile chat overlay backdrop */}
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
