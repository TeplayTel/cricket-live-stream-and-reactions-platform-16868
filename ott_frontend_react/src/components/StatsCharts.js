import React, { useEffect, useState, useCallback } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useWebSocket } from "./WebSocketProvider";

/**
 * PUBLIC_INTERFACE
 * StatsCharts displays live cricket stats and crowd sentiment in modern, card-based charts.
 * Fetches data from backend API or over WebSocket, with robust error/loading/empty state handling.
 *
 * Props:
 *   - pollInterval: ms to poll for new stats (when WebSocket not providing push events)
 */

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

/* --- Modern chart color palette (updated to match new CSS vars/reference) --- */
const palette = [
  "var(--accent-blue, #5da2fa)",
  "var(--accent-yellow, #f5cd58)",
  "var(--accent-purple, #e87afa)",
  "var(--accent-teal, #21dcac)",
  "var(--accent-orange, #ff7530)",
  "var(--accent-gold, #f5cd58)",
  "var(--accent-pink, #f75d84)"
];

/* Modern card style (redesign) */
const cardStyle = {
  background: "var(--bg-card, #22252a)",
  borderRadius: "var(--border-radius, 20px)",
  boxShadow: "var(--shadow, 0 4px 24px 0 #0e111733)",
  padding: "28px 18px 28px 22px",
  color: "var(--text-primary, #fff)",
  minWidth: 240,
  minHeight: 235,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  fontSize: "1.06rem",
  margin: "0",
  fontFamily: "Helvetica Neue, Arial, sans-serif"
};

const gridStyle = {
  display: "grid",
  gap: "24px",
  gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
  alignItems: "stretch"
};

// Util: parse backend response to Stats shape, fall back to mock data if needed
function parseStatsResponse(data) {
  // expects: {team_runs, wickets, best_players, crowd_sentiment_percent, bowling_completion_percent}
  // team_runs: [{label, value}], etc.
  if (!data || typeof data !== "object") return null;
  // Defensive: only extract what we expect
  const { team_runs, wickets, best_players, crowd_sentiment_percent, bowling_completion_percent } = data;
  if (!Array.isArray(team_runs) || !Array.isArray(wickets) || !Array.isArray(best_players)) return null;
  return {
    teamRuns: team_runs.map((t, i) => ({ ...t, color: palette[i % palette.length] })),
    wicketBreakdown: wickets.map((w, i) => ({ ...w, color: palette[(i+2)%palette.length] })),
    bestPlayers: best_players.map((p, i) => ({ ...p, color: palette[(i)%palette.length] })),
    crowdSentiment: Number.isFinite(crowd_sentiment_percent) ? crowd_sentiment_percent : null,
    bowlingCompletion: Number.isFinite(bowling_completion_percent) ? bowling_completion_percent : null
  };
}

/**
 * Fetch stats from backend REST API (replace with real endpoint).
 * Gracefully handles error/empty state.
 */
function fetchStats(setStats, setError, setLoading) {
  setLoading(true);
  // Example backend: /api/stats or similar; fallback to mock if fails
  fetch("/api/stats")
    .then(resp => {
      if (!resp.ok) throw new Error(resp.status + "");
      return resp.json();
    })
    .then(data => {
      const parsed = parseStatsResponse(data);
      if (parsed) {
        setStats(parsed);
        setError(null);
      } else {
        setStats(null);
        setError("Malformed stats data.");
      }
    })
    .catch(err => {
      setError("Could not load stats: " + (err.message || err));
      setStats(null);
    })
    .finally(() => setLoading(false));
}

export default function StatsCharts({ pollInterval = 60000 }) {
  // State: stats, loading, error
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Always call hook at top level (fixes react-hooks rules-of-hooks)
  const ws = useWebSocket();

  // If ws.stats exists and is valid, always show live; otherwise poll REST API
  useEffect(() => {
    if (ws && ws.stats) {
      // Allow websocket live stats to take precedence (if structure matches)
      const parsed = parseStatsResponse(ws.stats);
      if (parsed) {
        setStats(parsed);
        setError(null);
        setLoading(false);
      }
    }
    // if ws.stats changes, update
    // eslint-disable-next-line
  }, [ws && ws.stats]);

  // Initial fetch, and polling unless overridden by WS
  useEffect(() => {
    let interval = null;
    if (!(ws && ws.stats)) {
      fetchStats(setStats, setError, setLoading);
      // Poll every pollInterval ms
      interval = setInterval(() => {
        fetchStats(setStats, setError, setLoading);
      }, pollInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [pollInterval, ws && ws.stats]);

  // If neither API nor ws has stats, fallback to static demo data; only after error
  useEffect(() => {
    if (!loading && !stats && !ws?.stats && !error) {
      // Static fallback for demo ONLY; in prod prefer empty/error.
      setStats({
        teamRuns: [
          { label: "FCB", value: 242, color: palette[0] },
          { label: "RMA", value: 230, color: palette[1] }
        ],
        wicketBreakdown: [
          { label: "Bowled", value: 3, color: palette[2] },
          { label: "Caught", value: 5, color: palette[3] },
          { label: "LBW", value: 2, color: palette[4] },
          { label: "Other", value: 1, color: palette[5] }
        ],
        bestPlayers: [
          { label: "Smith", value: 72, color: palette[0] },
          { label: "Patel", value: 64, color: palette[1] },
          { label: "Morgan", value: 44, color: palette[2] },
          { label: "Ali", value: 28, color: palette[3] }
        ],
        crowdSentiment: 83,
        bowlingCompletion: 72,
      });
    }
  }, [loading, stats, error, ws]);

  // -- Chart configurations (styling, legend, data) --
// ... remainder of file unchanged ...

  // Team bar chart -- modern, flat, colored bars, no grid lines, legend top
  function getTeamBarData() {
    return {
      labels: stats.teamRuns.map((t) => t.label),
      datasets: [
        {
          label: "Runs",
          data: stats.teamRuns.map((t) => t.value),
          backgroundColor: stats.teamRuns.map((t) => t.color),
          borderRadius: 11,
          maxBarThickness: 38,
        },
      ],
    };
  }

  const teamBarOptions = {
    responsive: true,
    aspectRatio: 2.2,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#b5c6db", font: { weight: 500, size: 14 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "#293140", borderDash: [5], drawTicks: false },
        ticks: { color: "#abb2c9", font: { weight: 600, size: 13 } }
      },
    },
    maintainAspectRatio: false,
  };

  // Pie chart for wicket breakdown
  function getWicketPieData() {
    return {
      labels: stats.wicketBreakdown.map((w) => w.label),
      datasets: [
        {
          data: stats.wicketBreakdown.map((w) => w.value),
          backgroundColor: stats.wicketBreakdown.map((w) => w.color),
          borderWidth: 3,
          borderColor: "#161a21",
        },
      ],
    };
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: { size: 13, family: "Helvetica Neue, Arial, sans-serif" },
          color: "#acb2bb",
          padding: 13,
        }
      },
      title: { display: false },
      tooltip: { enabled: true }
    },
    cutout: "65%", // donut inner radius (large)
    maintainAspectRatio: false,
  };

  // Doughnut chart for "Best Players" (simulate central value as in reference)
  function getBestPlayersDoughnutData() {
    return {
      labels: stats.bestPlayers.map((p) => p.label),
      datasets: [
        {
          data: stats.bestPlayers.map((p) => p.value),
          backgroundColor: stats.bestPlayers.map((p) => p.color),
          borderWidth: 3,
          borderColor: "#191e24",
        }
      ]
    };
  }
  const playerDoughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: { size: 13 },
          color: "#acb2bb",
          boxWidth: 16,
          padding: 13,
        }
      },
      title: { display: false },
      tooltip: { enabled: true },
    },
    cutout: "73%",
    maintainAspectRatio: false,
  };

  // Simulated radial bar chart: show a doughnut with wide arc, 83%
  function getRadialBarData(percent, label) {
    return {
      labels: [label, ""],
      datasets: [
        {
          data: [percent, 100 - percent],
          backgroundColor: [palette[2], "#223047"],
          borderWidth: 5,
        },
      ],
    };
  }
  const radialOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    cutout: "77%",
    rotation: -90,
    circumference: 360,
    maintainAspectRatio: false,
  };

  // Simulated progress pie
  function getProgressPieData(percent, label) {
    return {
      labels: [label, ""],
      datasets: [
        {
          data: [percent, 100 - percent],
          backgroundColor: [palette[3], "#273546"],
          borderWidth: 5,
        },
      ],
    };
  }
  const progressPieOptions = radialOptions;

  // -- Render chart cards grid --
  return (
    <section
      className="chart-grid-outer"
      aria-label="Live Team & Player Statistics"
      style={{
        width: "100%",
        margin: "0 0 24px 0",
      }}
    >
      <div className="chart-grid" style={gridStyle}>
        {/* 1. Team Runs Bar Chart */}
        {stats && (
          <div style={cardStyle}>
            <div style={{
              marginBottom: 15,
              fontSize: "1.01rem",
              fontWeight: 700,
              color: palette[0],
              textTransform: "uppercase"
            }}>Team Runs</div>
            <div style={{ minHeight: 172, position: "relative" }}>
              <Bar
                data={getTeamBarData()}
                options={teamBarOptions}
                height={180}
              />
            </div>
            <div style={{ marginTop: 8, color: "#acb2bb", fontSize: "0.96rem", textAlign: "right" }}>
              Today
            </div>
          </div>
        )}
        {/* 2. Wicket Type Pie Chart */}
        {stats && (
          <div style={cardStyle}>
            <div style={{
              marginBottom: 13,
              fontSize: "1.01rem",
              fontWeight: 700,
              color: palette[2],
              textTransform: "uppercase"
            }}>Wicket Types</div>
            <div style={{ position: "relative", minHeight: 145 }}>
              <Doughnut
                data={getWicketPieData()}
                options={pieOptions}
                height={155}
              />
              {/* Central Value */}
              <span style={{
                position: "absolute",
                left: "50%",
                top: "53%",
                transform: "translate(-50%,-50%)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.34rem",
                letterSpacing: 0.02
              }}>
                {stats.wicketBreakdown.reduce((a, b) => a + b.value, 0)}
              </span>
            </div>
            <div style={{ marginTop: 8, color: "#acb2bb", fontSize: "0.93rem", textAlign: "right" }}>
              All modes
            </div>
          </div>
        )}
        {/* 3. Best Players Doughnut */}
        {stats && (
          <div style={cardStyle}>
            <div style={{
              marginBottom: 13,
              fontSize: "1.01rem",
              fontWeight: 700,
              color: palette[1],
              textTransform: "uppercase"
            }}>Best Players</div>
            <div style={{ position: "relative", minHeight: 140 }}>
              <Doughnut
                data={getBestPlayersDoughnutData()}
                options={playerDoughnutOptions}
                height={143}
              />
              {/* Central Value */}
              <span style={{
                position: "absolute",
                left: "50%",
                top: "54%",
                transform: "translate(-50%,-50%)",
                color: "#fff",
                fontWeight: 900,
                fontSize: "1.3rem"
              }}>
                Top {stats.bestPlayers.length}
              </span>
            </div>
            <div style={{ marginTop: 8, color: "#acb2bb", fontSize: "0.93rem", textAlign: "right" }}>
              Batting Rankings
            </div>
          </div>
        )}

        {/* 4. Crowd Sentiment Radial Bar */}
        {stats && (
          <div style={cardStyle}>
            <div style={{
              marginBottom: 13,
              fontSize: "1.01rem",
              fontWeight: 700,
              color: palette[2],
              textTransform: "uppercase"
            }}>Crowd Sentiment</div>
            <div style={{
              position: "relative",
              width: "100%",
              minHeight: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Doughnut
                data={getRadialBarData(stats.crowdSentiment, "Positive")}
                options={radialOptions}
                height={140}
              />
              {/* Center value */}
              <span style={{
                position: "absolute",
                left: "50%",
                top: "54%",
                transform: "translate(-50%,-50%)",
                color: palette[2],
                fontWeight: 900,
                fontSize: "1.45rem"
              }}>
                {stats.crowdSentiment}%
              </span>
            </div>
            <div style={{ marginTop: 8, color: "#acb2bb", fontSize: "0.93rem", textAlign: "right" }}>
              Positive
            </div>
          </div>
        )}

        {/* 5. Progress Pie (Bowling Completion) */}
        {stats && (
          <div style={cardStyle}>
            <div style={{
              marginBottom: 13,
              fontSize: "1.01rem",
              fontWeight: 700,
              color: palette[3],
              textTransform: "uppercase"
            }}>Overs Completed</div>
            <div style={{
              position: "relative",
              width: "100%",
              minHeight: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Doughnut
                data={getProgressPieData(stats.bowlingCompletion, "Completed")}
                options={progressPieOptions}
                height={140}
              />
              <span style={{
                position: "absolute",
                left: "50%",
                top: "54%",
                transform: "translate(-50%,-50%)",
                color: palette[3],
                fontWeight: 900,
                fontSize: "1.45rem"
              }}>
                {stats.bowlingCompletion}%
              </span>
            </div>
            <div style={{ marginTop: 8, color: "#acb2bb", fontSize: "0.93rem", textAlign: "right" }}>
              Completed
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
