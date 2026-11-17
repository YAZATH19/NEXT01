
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import {
  getPollResultsSummary,
  type PollResultsSummary,
} from "./pollResultsService";

type PollResultsProps = {
  question: string;
  options: string[];
  onBack: () => void;
  pollId?: string;
};

export default function PollResults({
  question,
  options,
  onBack,
  pollId = "sample-poll-001",
}: PollResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const [summary, setSummary] =
    useState<PollResultsSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadResults() {
      setLoading(true);
      setError("");
      setSummary(null);

      try {
        const result = await getPollResultsSummary(pollId);

        if (active) {
          if (result.counts.length !== options.length) {
            throw new Error(
              "Poll options and results do not match."
            );
          }

          setSummary(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load poll results."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      active = false;
    };
  }, [pollId, options.length, reloadKey]);

  const cardStyle: CSSProperties = {
    backgroundColor: "#FFFFFF",
    color: "#050A30",
    borderRadius: "15px",
    padding: "25px",
  };

  const counts = summary?.counts ?? [];
  const totalVotes = summary?.totalVotes ?? 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050A30",
        color: "#FFFFFF",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: "12px 18px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back to Public Opinion
        </button>

        <h1 style={{ marginTop: "35px" }}>
          📊 Poll Results
        </h1>

        <p>NEXT01 Public Opinion Results</p>

        <section style={cardStyle}>
          <h2>{question}</h2>

          {loading && (
            <p role="status" style={{ color: "#666666" }}>
              Loading results from Firestore...
            </p>
          )}

          {!loading && error && (
            <div role="alert">
              <p style={{ color: "#B42318" }}>
                Unable to load results: {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setReloadKey((previous) => previous + 1)
                }
                style={{
                  backgroundColor: "#FBC713",
                  color: "#050A30",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 18px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && summary && (
            <>
              <p
                style={{
                  color: "#666666",
                }}
              >
                Total recorded votes: {totalVotes}
              </p>

              <p
                style={{
                  color: "#8A6000",
                  fontSize: "12px",
                }}
              >
                Stored aggregate snapshot — not
                automatically updated after each vote.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  marginTop: "30px",
                }}
              >
                {options.map((option, index) => {
                  const count = counts[index] ?? 0;

                  const percentage =
                    totalVotes > 0
                      ? (count / totalVotes) * 100
                      : 0;

                  return (
                    <div key={index}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <span>{option}</span>

                        <strong>
                          {percentage.toFixed(1)}%
                        </strong>
                      </div>

                      <div
                        style={{
                          backgroundColor: "#E8EBF2",
                          height: "14px",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            backgroundColor: "#FBC713",
                            borderRadius: "10px",
                          }}
                        />
                      </div>

                      {showDetails && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#666666",
                          }}
                        >
                          Recorded votes: {count}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDetails(
                    (previous) => !previous
                  )
                }
                style={{
                  width: "100%",
                  marginTop: "30px",
                  padding: "14px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#FBC713",
                  color: "#050A30",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {showDetails
                  ? "Hide Vote Counts"
                  : "Show Vote Counts"}
              </button>

              {summary.updatedAt && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666666",
                    marginTop: "20px",
                  }}
                >
                  Summary updated:{" "}
                  {summary.updatedAt.toLocaleString()}
                </p>
              )}
            </>
          )}
        </section>

        <p
          style={{
            textAlign: "center",
            marginTop: "40px",
            fontSize: "12px",
            opacity: 0.7,
          }}
        >
          Powered by UDB Corporation (Pvt) Ltd.
        </p>
      </div>
    </main>
  );
}
