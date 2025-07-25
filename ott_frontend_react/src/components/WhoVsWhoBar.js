import React from "react";
import "./WhoVsWhoBar.css";

/**
 * PUBLIC_INTERFACE
 * WhoVsWhoBar renders the modern "Who vs Who" match bar for tournaments above the video,
 * using the extracted color palette and styling per provided screenshot/style guide.
 *
 * Props:
 * - leftTeam: { name: string, abbr: string, logoUrl?: string }
 * - rightTeam: { name: string, abbr: string, logoUrl?: string }
 * - tournament: string
 * - matchStatus: { minute: string, badge: string }
 * - score: string (e.g. "2 - 1")
 */
export default function WhoVsWhoBar({
  leftTeam = { name: "FC Barcelona", abbr: "FCB" },
  rightTeam = { name: "Real Madrid", abbr: "RMA" },
  tournament = "UEFA Champions League 2025",
  matchStatus = { minute: "76:42", badge: "LIVE" },
  score = "2 - 1"
}) {
  return (
    <div className="who-vs-who-bar">
      <div className="match-meta">
        <span className="tournament">{tournament}</span>
        <span className="match-minute">{matchStatus.minute}</span>
        <span className="live-pill">{matchStatus.badge}</span>
      </div>
      <div className="teams-row">
        <div className="team team-left">
          {leftTeam.logoUrl && (
            <img className="team-logo" src={leftTeam.logoUrl} alt={leftTeam.abbr} />
          )}
          <span className="team-abbr">{leftTeam.abbr}</span>
          <span className="team-name">{leftTeam.name}</span>
        </div>
        <div className="score-block">
          <span className="score">{score}</span>
        </div>
        <div className="team team-right">
          {rightTeam.logoUrl && (
            <img className="team-logo" src={rightTeam.logoUrl} alt={rightTeam.abbr} />
          )}
          <span className="team-abbr">{rightTeam.abbr}</span>
          <span className="team-name">{rightTeam.name}</span>
        </div>
      </div>
    </div>
  );
}

