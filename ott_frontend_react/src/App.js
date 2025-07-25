import React, { useState } from "react";
import "./App.css";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { WebSocketProvider, useWebSocket } from "./components/WebSocketProvider";
import ReactionsPanel from "./components/ReactionsPanel";
import ChatPanel from "./components/ChatPanel";
import AISummaries from "./components/AISummaries";
import StatsCharts from "./components/StatsCharts";
import Highlights from "./components/Highlights";
import "./components/WhoVsWhoBar.css";
import ReactPlayer from "react-player";

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
  // PUBLIC_INTERFACE
  // CustomVideoPlayer embeds YouTube with react-player, and displays emoji reaction count as "2.1k watching"
  function CustomVideoPlayer() {
    const [hovered, setHovered] = useState(false);
    // Require WhoVsWhoBar dynamically (to avoid (potential) cyclic deps)
    const WhoVsWhoBar = require("./components/WhoVsWhoBar").default;

    // Emoji reaction count from websocket store, fallback to mock if needed
    const ws = useWebSocket();
    let emojiReactionCount = (ws && ws.reactions && Array.isArray(ws.reactions))
      ? ws.reactions.length
      : 2100;

    // Format as "1.5k" etc.
    function formatWatchers(count) {
      if (count >= 1e6) return (count / 1e6).toFixed(1).replace(/\.0$/, '') + "M";
      if (count >= 1e3) return (count / 1e3).toFixed(1).replace(/\.0$/, '') + "k";
      return count.toString();
    }
    const watchersLabel = `${formatWatchers(emojiReactionCount)} watching`;

    return (
      <div
        className="custom-video-player-root"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={-1}
        style={{ position: "relative" }}
      >
        {/* Who vs Who bar above video */}
        <WhoVsWhoBar
          leftTeam={{ name: "FC Barcelona", abbr: "FCB" }}
          rightTeam={{ name: "Real Madrid", abbr: "RMA" }}
          tournament="UEFA Champions League 2025"
          matchStatus={{
            minute: videoTime > 0
              ? `${Math.floor(videoTime / 60)}:${(videoTime % 60).toString().padStart(2, "0")}`
              : "76:42",
            badge: "LIVE",
          }}
          score="2 - 1"
        />
        <div className="video-card-overlay">
          <div className="top-row">
            <span className="brand-stack">
              <span className="brand-red">Stream</span>
              <span className="brand-white">Sport</span>
              <span className="live-pill video-live" style={{ marginLeft: 22 }}>
                LIVE
              </span>
            </span>
            <div className="video-overlay-viewers">
              {/* Emoji count as "watching" replaces any viewers/views */}
              <button className="viewer-btn" tabIndex={-1} style={{ background: "rgba(60,61,61,0.32)", color: "#ffe" }}>
                <span role="img" aria-label="reactions" style={{ marginRight: 2 }}>👏</span>
                {watchersLabel}
              </button>
              <button className="viewer-btn" tabIndex={-1}>
                <span role="img" aria-label="share">🔗</span>
              </button>
            </div>
          </div>
          <div className="score-row">
            <span className="team-abbr">FCB</span>
            <span className="main-score">
              2 <span className="score-sep">-</span> 1
            </span>
            <span className="team-abbr">RMA</span>
            <span className="minute-marker-lg">
              {videoTime > 0
                ? (
                  <span style={{
                    color: "#ffe141",
                    fontWeight: 900,
                    fontSize: "1.15em",
                    marginLeft: 14,
                  }}>
                    {Math.floor(videoTime / 60)}:{(videoTime % 60).toString().padStart(2, "0")}
                  </span>
                )
                : <span style={{ color: "#ffe141", fontWeight: 900, marginLeft: 14 }}>76:42</span>
              }
            </span>
          </div>
        </div>
        {/* --- EMBEDDED YOUTUBE PLAYER --- */}
        <div className="react-player-wrapper" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 1, display: 'flex', alignItems: 'flex-end', background: 'transparent' }}>
          <ReactPlayer
            url="https://www.youtube.com/watch?v=bWiMT8hRRGM"
            width="100%"
            height="100%"
            playing
            muted={false}
            controls
            config={{
              youtube: {
                playerVars: { rel: 0, modestbranding: 1, fs: 1 }
              }
            }}
            style={{
              pointerEvents: 'auto',
              background: "transparent",
              borderRadius: 0,
              boxShadow: 'none'
            }}
            onProgress={progress => {
              // Optionally, update custom seekbar/videoTime here if tightly syncing
              // setVideoTime(progress.playedSeconds);
            }}
          />
        </div>
        {/* Emoji Bar - rendered ONLY when player is hovered */}
        <ReactionsPanel emojiList={EMOJIS} viewersCount={watchersLabel} show={hovered} />
        {/* Custom seekbar placeholder (mock modern bar, not functional with react-player for now) */}
        <div className="seekbar-shell" style={{ position: "relative", zIndex: 3 }}>
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
