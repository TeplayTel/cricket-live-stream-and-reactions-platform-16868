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

    try {
      // Demo data for now
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
      setStats(data);
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, pollInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [pollInterval]);

  // -- Card style with larger radius and shadow as per design --
  const cardStyle = {
    background: "#22252A",
    borderRadius: "22px",
    boxShadow: "0 4px 24px 0 #0e111733",
    padding: "20px 22px 28px 22px",
    color: "#fff",
    minWidth: 240,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    fontSize: "1.06rem",
    margin: "0", // margin handled by grid
  };

  // Chart configuration functions
  function genTeamBarData() {
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
        borderRadius: 8,
        maxBarThickness: 48,
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
            "#5da2fa",
            "#e175ea",
            "#ff3232",
            "#f5cd58",
            "#38e7c5",
          ],
        },
      ],
    };
  }

  return (
    <section
      className="chart-grid-outer"
      aria-label="Live Team & Player Statistics"
      style={{
        width: "100%",
        margin: "0 0 24px 0",
      }}
    >
      <div
        className="chart-grid"
        style={{
          display: "grid",
          gap: "22px",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          alignItems: "stretch",
        }}
      >
        {/* Chart card: Team Stats */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 17 }}>
            <span
              style={{
                background: "#f5cd58",
                color: "#171a1e",
                borderRadius: 10,
                fontWeight: 700,
                padding: "4px 14px",
                fontSize: "1.07rem",
                marginRight: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Team Stats
            </span>
            <span style={{ color: "#acb2bb", fontSize: "0.97rem", marginLeft: 9 }}>
              {loading ? "Updating..." : ""}
            </span>
          </div>
          {error && (
            <div style={{ color: "#ff3232", fontWeight: 600 }}>Error: {error}</div>
          )}
          {!error && stats && (
            <Bar
              data={genTeamBarData()}
              height={255}
              options={{
                responsive: true,
                aspectRatio: 1.7,
                plugins: {
                  legend: {
                    labels: { color: "#acb2bb", font: { size: 13 } },
                    position: "top",
                  },
                  title: { display: false },
                },
                scales: {
                  x: {
                    ticks: { color: "#acb2bb" },
                    grid: { color: "#26262a" },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: "#acb2bb", font: { weight: 600 } },
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          )}
          {!error && !stats && !loading && (
            <div style={{ color: "#f5cd58", fontWeight: 600 }}>No stats available.</div>
          )}
        </div>
        {/* Chart card: Player Runs Pie Chart */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 10 }}>
            <span
              style={{
                background: "#5da2fa",
                color: "#fff",
                borderRadius: 10,
                fontWeight: 700,
                padding: "3px 12px",
                fontSize: "1.07rem",
                marginRight: 9,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Player Runs
            </span>
          </div>
          {!error && stats && (
            <Pie
              data={genPlayerPieData()}
              height={223}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: { color: "#acb2bb", font: { size: 13 } },
                    display: true,
                    position: "bottom",
                  },
                  title: { display: false },
                },
                maintainAspectRatio: false,
              }}
            />
          )}
          {!error && !stats && !loading && (
            <div style={{ color: "#f5cd58", fontWeight: 600 }}>No stats available.</div>
          )}
        </div>
        {/* Future: insert more chart cards here (for added stats, radial/progress, etc.) */}
      </div>
    </section>
  );
}
