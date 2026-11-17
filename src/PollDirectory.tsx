
import { useEffect, useState } from "react";
import {
  getPublishedPolls,
  type PublicPoll,
} from "./pollService";

type PollDirectoryProps = {
  onSelectPoll: (pollId: string) => void;
  onBack: () => void;
};

export default function PollDirectory({
  onSelectPoll,
  onBack,
}: PollDirectoryProps) {
  const [polls, setPolls] = useState<PublicPoll[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadPolls() {
      setLoading(true);
      setError("");

      try {
        const result = await getPublishedPolls();

        if (active) {
          setPolls(result);
        }
      } catch (err) {
        console.error("Poll directory error:", err);

        if (active) {
          setError("Unable to load published polls.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPolls();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const categories = [
    "All",
    ...Array.from(
      new Set(polls.map((poll) => poll.category))
    ).sort(),
  ];

  const visiblePolls =
    category === "All"
      ? polls
      : polls.filter(
          (poll) => poll.category === category
        );

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
        <button type="button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <h1 style={{ marginTop: "35px" }}>
          📊 Public Opinion
        </h1>

        <p>Explore opinions. Your voice matters.</p>

        {loading && <p>Loading polls...</p>}

        {!loading && error && (
          <div role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() =>
                setReloadKey((value) => value + 1)
              }
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "20px",
                    border: "1px solid #FBC713",
                    backgroundColor:
                      category === item
                        ? "#FBC713"
                        : "transparent",
                    color:
                      category === item
                        ? "#050A30"
                        : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <p style={{ marginTop: "25px" }}>
              {visiblePolls.length} published poll(s)
            </p>

            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              {visiblePolls.map((poll) => (
                <article
                  key={poll.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#050A30",
                    padding: "22px",
                    borderRadius: "12px",
                  }}
                >
                  <p style={{ color: "#666666" }}>
                    {poll.category}
                  </p>

                  <h2 style={{ fontSize: "20px" }}>
                    {poll.question}
                  </h2>

                  <button
                    type="button"
                    onClick={() => onSelectPoll(poll.id)}
                    style={{
                      backgroundColor: "#FBC713",
                      color: "#050A30",
                      padding: "12px 20px",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Open Poll
                  </button>
                </article>
              ))}
            </div>

            {visiblePolls.length === 0 && (
              <p>No polls found in this category.</p>
            )}
          </>
        )}

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
