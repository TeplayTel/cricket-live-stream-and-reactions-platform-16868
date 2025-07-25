import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
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

/**
 * PUBLIC_INTERFACE
 * StatsCharts displays team and player statistics as responsive charts.
 * Polls backend API every 60s for updated statistics.
 * Props:
 *   - pollInterval: (optional) polling interval in ms (default: 60000)
 */
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_ENDPOINT = "/api/stats"; // Update this if backend API provides a different stats path

export default function StatsCharts({ pollInterval = 60000 }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch statistics from backend
  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    // Replace this with actual backend fetch.
    // Use dummy data for now if backend endpoint is not ready.
    try {
      // const response = await fetch(API_ENDPOINT);
      // if (!response.ok) throw new Error("Failed to fetch statistics");
      // const data = await response.json();

      // --- DEMO DATA BEGIN ---
      // Simulated response:
      const data = {
        teams: [
          {
            name: "FCB",
            color: "#26b9f2",
            stats: {
              runs: 242,
              wickets: 7,
              overs: 45,
              sixes: 14,
              fours: 18,
            },
          },
          {
            name: "RMA",
            color: "#ffe141",
            stats: {
              runs: 230,
              wickets: 10,
              overs: 50,
              sixes: 10,
              fours: 21,
            },
          },
        ],
        players: [
          { name: "Smith", runs: 83, wickets: 0 },
          { name: "Jones", runs: 44, wickets: 1 },
          { name: "Patel", runs: 73, wickets: 3 },
          { name: "Morgan", runs: 7, wickets: 0 },
          { name: "Ali", runs: 29, wickets: 1 },
        ],
      };
      // --- DEMO DATA END ---

      setStats(data);
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  // Poll the API every pollInterval ms
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, pollInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [pollInterval]);

  // Responsive chart card style
  const cardStyle = {
    background: "var(--bg-card, #232323)",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.11)",
    padding: 24,
    margin: "18px 0",
    color: "var(--text-primary, #fff)",
    width: "100%",
    maxWidth: 470,
    minWidth: 240,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    fontSize: "1.06rem",
  };

  // Chart configuration
  function genTeamBarData() {
    // Show Team Runs, Wickets, Sixes, Fours as grouped bars
    if (!stats?.teams) return {};
    const labels = ["Runs", "Wickets", "Sixes", "Fours"];
    return {
      labels,
      datasets: stats.teams.map((team) => ({
        label: team.name,
        backgroundColor: team.color,
        data: [
          team.stats.runs,
          team.stats.wickets,
          team.stats.sixes,
          team.stats.fours,
        ],
        borderRadius: 7,
        maxBarThickness: 44,
      })),
    };
  }

  function genPlayerPieData() {
    if (!stats?.players) return {};
    return {
      labels: stats.players.map((p) => p.name),
      datasets: [
        {
          label: "Runs",
          data: stats.players.map((p) => p.runs),
          backgroundColor: [
            "#d1b255",
            "#ff3232",
            "#26b9f2",
            "#ffe141",
            "#97d848",
          ],
        },
      ],
    };
  }

  return (
    <section
      className="stats-charts-panel"
      aria-label="Live Team & Player Statistics"
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 32,
        justifyContent: "center",
        alignItems: "flex-start",
        margin: "22px 0",
      }}
    >
      {/* Chart card: Team Stats */}
      <div style={cardStyle}>
        <div style={{ marginBottom: 11 }}>
          <span
            style={{
              background: "var(--stat-gold, #d1b255)",
              color: "#181818",
              borderRadius: 8,
              fontWeight: 700,
              padding: "2px 11px",
              fontSize: "1.01rem",
              marginRight: 9,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Team Stats
          </span>
          <span style={{ color: "var(--text-secondary,#b0b0b0)", fontSize: "0.97rem" }}>
            {loading ? "Updating..." : ""}
          </span>
        </div>
        {error && (
          <div style={{ color: "#ff3232", fontWeight: 600 }}>Error: {error}</div>
        )}
        {!error && stats && (
          <Bar
            data={genTeamBarData()}
            height={240}
            options={{
              responsive: true,
              aspectRatio: 1.8,
              plugins: {
                legend: {
                  labels: { color: "var(--text-secondary,#b0b0b0)" },
                  position: "top"
                },
                title: {
                  display: false,
                },
              },
              scales: {
                x: {
                  ticks: { color: "var(--text-secondary,#b0b0b0)" },
                  grid: { color: "#322" },
                },
                y: {
                  beginAtZero: true,
                  ticks: { color: "var(--text-secondary,#b0b0b0)", font: { weight: 600 } }
                },
              },
              maintainAspectRatio: false,
            }}
          />
        )}
        {!error && !stats && !loading && (
          <div style={{ color: "#d1b255", fontWeight: 600 }}>
            No stats available.
          </div>
        )}
      </div>

      {/* Chart card: Player Pie Chart */}
      <div style={cardStyle}>
        <div style={{ marginBottom: 11 }}>
          <span
            style={{
              background: "var(--accent,#ff3232)",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 700,
              padding: "2px 10px",
              fontSize: "1.01rem",
              marginRight: 9,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Player Runs
          </span>
        </div>
        {!error && stats && (
          <Pie
            data={genPlayerPieData()}
            height={220}
            options={{
              responsive: true,
              aspectRatio: 1.63,
              plugins: {
                legend: {
                  labels: { color: "var(--text-secondary,#b0b0b0)" },
                  display: true,
                  position: "bottom"
                },
                title: { display: false },
              },
              maintainAspectRatio: false,
            }}
          />
        )}
        {!error && !stats && !loading && (
          <div style={{ color: "#d1b255", fontWeight: 600 }}>
            No stats available.
          </div>
        )}
      </div>
    </section>
  );
}
