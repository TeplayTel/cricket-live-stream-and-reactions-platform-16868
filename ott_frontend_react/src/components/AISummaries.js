import React, { useEffect, useState } from 'react';

/*
  PUBLIC_INTERFACE
  AISummaries panel fetches and displays AI-powered match summary, chat summary, and sentiment analysis.
  Props:
    - pollInterval: number (ms), how often to refresh from backend API
*/
function fetchSummary(setSummary, setLoading, setError) {
  setLoading(true);
  fetch('/ai/summary')
    .then((resp) => {
      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      return resp.json();
    })
    .then((data) => {
      setSummary(data);
      setError(null);
    })
    .catch((err) => {
      setError(err.message);
      setSummary(null);
    })
    .finally(() => setLoading(false));
}

export default function AISummaries({ pollInterval = 15000 }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Poll for new AI summary data every pollInterval ms
  useEffect(() => {
    fetchSummary(setSummary, setLoading, setError);
    const interval = setInterval(() => {
      fetchSummary(setSummary, setLoading, setError);
    }, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  // Render
  return (
    <section
      className="ai-summaries-panel"
      style={{
        background: 'var(--bg-card, #232323)',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
        padding: 18,
        margin: '18px 0',
        color: 'var(--text-primary, #fff)',
        maxWidth: 420,
        minWidth: 280,
        fontSize: '1.06rem',
      }}
      aria-label="Match AI Insights"
    >
      <div style={{ marginBottom: 9 }}>
        <span style={{
          background: 'var(--accent,#ff3232)', color: '#fff', borderRadius: 8, fontWeight: 700,
          padding: '3px 12px', fontSize: '1.02rem', marginRight: 10
        }}>AI Insights</span>
        <span style={{
          color: 'var(--text-secondary,#b0b0b0)',
          fontSize: '0.98rem'
        }}>
          {/* Polling status indicator */}
          {loading && <span style={{ marginLeft: 8 }}>Updating…</span>}
        </span>
      </div>
      {error &&
        <div style={{ color: 'var(--accent,#e54545)', margin: '10px 0', fontWeight: 600 }}>
          Error loading summary: {error}
        </div>
      }
      {!error && summary && (
        <div>
          {summary.match_summary && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: 'var(--accent-gold, #f5cd58)', fontWeight: 600, marginBottom: 4 }}>
                🏏 Match Summary
              </div>
              <div style={{ lineHeight: 1.4 }}>{summary.match_summary}</div>
            </div>
          )}
          {summary.chat_summary && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: 'var(--accent,#ff3232)', fontWeight: 600, marginBottom: 4 }}>
                💬 Chat Summary
              </div>
              <div style={{ lineHeight: 1.4 }}>{summary.chat_summary}</div>
            </div>
          )}
          {summary.crowd_sentiment && (
            <div>
              <div style={{ color: 'var(--text-secondary,#b0b0b0)', marginBottom: 4, fontWeight: 500 }}>
                Crowd Sentiment
              </div>
              <strong style={{ fontSize: '1.25rem', color: summary.crowd_sentiment.label === 'Positive'
                ? '#58db63'
                : summary.crowd_sentiment.label === 'Negative'
                  ? '#d42e11'
                  : '#d1b255'
                }}>
                {summary.crowd_sentiment.label}
              </strong>
              {summary.crowd_sentiment.explanation &&
                <span style={{
                  display: 'block', color: 'var(--text-secondary,#b0b0b0)',
                  marginTop: 5, fontWeight: 400
                }}>{summary.crowd_sentiment.explanation}</span>
              }
            </div>
          )}
        </div>
      )}
      {!error && !summary && !loading && (
        <div style={{ color: '#d1b255', fontWeight: 600 }}>No summary data available.</div>
      )}
    </section>
  );
}
