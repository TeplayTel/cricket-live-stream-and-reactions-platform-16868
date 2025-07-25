import React, { useEffect, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Highlights component shows a list of highlight reel spikes (moments of peak reactions).
 * Allows user to jump to those highlights in the (mock) main video player.
 * Props:
 *   - onJump(time: number): callback to perform video seek (seconds)
 * Usage:
 *   <Highlights onJump={yourJumpHandlerFunction} />
 */
export default function Highlights({ onJump }) {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulated fetch from backend: swap this logic for real fetch when endpoint is live.
  useEffect(() => {
    setLoading(true);
    // TODO: Replace with actual API: fetch("/api/highlights").then(...)
    setTimeout(() => {
      setHighlights([
        {
          id: 1,
          time: 320, // seconds (5:20)
          label: "🔥 Surprise Six",
          emoji: "🔥",
          event: "Six",
        },
        {
          id: 2,
          time: 1410, // 23:30
          label: "👏 Wicket Reaction",
          emoji: "👏",
          event: "Wicket",
        },
        {
          id: 3,
          time: 2110, // 35:10
          label: "😮 Close Catch!",
          emoji: "😮",
          event: "Catch",
        },
        {
          id: 4,
          time: 2742, // 45:42
          label: "❤️ Final Over Roar",
          emoji: "❤️",
          event: "Final Over",
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Helper to format time as mm:ss
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <section
      className="highlights-panel"
      style={{
        background: "var(--bg-card,#232323)",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: 16,
        margin: "20px 0 0 0",
        maxWidth: 460,
        color: "var(--text-primary,#fff)",
        width: "100%",
      }}
      aria-label="Reaction Highlights Reel"
    >
      <div style={{
        marginBottom: 8, display: "flex", alignItems: "center", gap: 9
      }}>
        <span
          style={{
            background: "var(--accent,#ff3232)", color: "#fff",
            borderRadius: 8, fontWeight: 700, padding: "3px 12px",
            fontSize: "1.07rem", marginRight: 5, textTransform: "uppercase",
            letterSpacing: "0.07em"
          }}
        >
          Highlights
        </span>
        <span style={{ color: "var(--text-secondary,#b0b0b0)", fontSize: "0.97rem" }}>
          {loading && "Loading…"}
        </span>
      </div>
      {!loading && highlights.length === 0 && (
        <div style={{ color: "#d1b255", fontWeight: 600 }}>No highlights found.</div>
      )}
      <ul style={{
        listStyle: "none",
        padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 13
      }}>
        {highlights.map((hl, idx) => (
          <li key={hl.id}
              style={{
                display: "flex",
                alignItems: "center",
                background: idx % 2 ? "rgba(255,255,255,0.04)" : "",
                borderRadius: 7, padding: "8px 9px"
              }}>
            <span
              style={{
                fontSize: "1.5rem",
                marginRight: 13,
                filter: "drop-shadow(0 1px 8px #0008)"
              }}
              aria-label="highlight emoji"
            >
              {hl.emoji}
            </span>
            <button
              onClick={() => onJump && onJump(hl.time)}
              style={{
                color: "var(--accent-gold,#f5cd58)",
                background: "none",
                border: "none",
                fontWeight: 750,
                fontSize: "1.08rem",
                cursor: "pointer",
                marginRight: 13
              }}
              aria-label={`Jump to highlight at ${formatTime(hl.time)}`}
            >
              {formatTime(hl.time)}
            </button>
            <span style={{ color: "#fff", fontWeight: 500, fontSize: "1rem", flex: 1 }}>
              {hl.label}
              <span style={{
                color: "var(--text-secondary,#b0b0b0)",
                marginLeft: 11, fontSize: "0.93rem",
                letterSpacing: "0.01em"
              }}>({hl.event})</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
