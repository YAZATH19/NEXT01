
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import PollResults from "./PollResults";


type PublicOpinionProps = {
  onBack: () => void;
  pollId?: string;
};


type Poll = {
  question: string;
  category: string;
  options: string[];
};


export default function PublicOpinion({
  onBack,
  pollId = "sample-poll-001",
}: PublicOpinionProps) {
  const POLL_ID = pollId;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<number | null>(
    null
  );
  const [previousVote, setPreviousVote] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPoll = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setError("Please sign in to participate.");
          return;
        }

        const pollRef = doc(db, "polls", POLL_ID);
        const voteRef = doc(
          db,
          "polls",
          POLL_ID,
          "votes",
          user.uid
        );

        const [pollSnapshot, voteSnapshot] =
          await Promise.all([
            getDoc(pollRef),
            getDoc(voteRef),
          ]);

        if (!active) return;

        if (!pollSnapshot.exists()) {
          setError("Poll not found.");
          return;
        }

        const data = pollSnapshot.data();

        if (
          data.status !== "published" ||
          typeof data.question !== "string" ||
          typeof data.category !== "string" ||
          !Array.isArray(data.options) ||
          data.options.length === 0 ||
          !data.options.every(
            (option: unknown) =>
              typeof option === "string"
          )
        ) {
          setError("Poll is unavailable.");
          return;
        }

        setPoll({
          question: data.question,
          category: data.category,
          options: data.options,
        });

        if (voteSnapshot.exists()) {
          const savedIndex =
            voteSnapshot.data().optionIndex;

          if (
            Number.isInteger(savedIndex) &&
            savedIndex >= 0 &&
            savedIndex < data.options.length
          ) {
            setPreviousVote(savedIndex);
            setSelected(savedIndex);
          } else {
            setError("Your saved vote is invalid.");
          }
        }
      } catch (err) {
        console.error("Poll loading error:", err);

        if (active) {
          setError(
            "Unable to load poll. Check Firebase access."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPoll();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmitVote = async () => {
    const user = auth.currentUser;

    if (
      !user ||
      !poll ||
      selected === null ||
      previousVote !== null ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const voteRef = doc(
        db,
        "polls",
        POLL_ID,
        "votes",
        user.uid
      );

      // Check whether the user has already voted.
      const existingVote = await getDoc(voteRef);

      if (existingVote.exists()) {
        const savedIndex =
          existingVote.data().optionIndex;

        if (Number.isInteger(savedIndex)) {
          setPreviousVote(savedIndex);
          setSelected(savedIndex);
        }

        setMessage("You have already voted.");
        return;
      }

      await setDoc(voteRef, {
        optionIndex: selected,
        createdAt: serverTimestamp(),
      });

      setPreviousVote(selected);
      setMessage("Your vote was submitted successfully!");
    } catch (err) {
      console.error("Vote submission error:", err);

      // A second submission may have been rejected by
      // Firestore Security Rules.
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const voteRef = doc(
            db,
            "polls",
            POLL_ID,
            "votes",
            currentUser.uid
          );

          const savedVote = await getDoc(voteRef);

          if (savedVote.exists()) {
            const savedIndex =
              savedVote.data().optionIndex;

            if (Number.isInteger(savedIndex)) {
              setPreviousVote(savedIndex);
              setSelected(savedIndex);
            }

            setMessage("You have already voted.");
            return;
          }
        }
      } catch (readError) {
        console.error("Vote verification error:", readError);
      }

      setError(
        "Vote submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hasVoted = previousVote !== null;
  if (showResults && poll) {
  return (
    <PollResults
      pollId={POLL_ID}
      question={poll.question}
      options={poll.options}
      onBack={() => setShowResults(false)}
    />
  );
}

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
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ marginTop: "35px" }}>
          📊 Public Opinion
        </h1>

        <p>
          Share your opinion. Your voice matters.
        </p>

        {loading && (
          <p role="status">Loading poll...</p>
        )}

        {!loading && poll && (
          <section
            style={{
              backgroundColor: "#FFFFFF",
              color: "#050A30",
              padding: "25px",
              borderRadius: "15px",
              marginTop: "30px",
            }}
          >
            <p style={{ color: "#666666" }}>
              {poll.category} • Public Opinion
            </p>

            <h2>{poll.question}</h2>

            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "25px",
              }}
            >
              {poll.options.map((option, index) => (
                <label
                  key={index}
                  style={{
                    padding: "15px",
                    border: "1px solid #CCCCCC",
                    borderRadius: "8px",
                    cursor: hasVoted
                      ? "default"
                      : "pointer",
                    backgroundColor:
                      selected === index
                        ? "#FFF3C0"
                        : "#FFFFFF",
                  }}
                >
                  <input
                    type="radio"
                    name="poll"
                    checked={selected === index}
                    disabled={hasVoted || submitting}
                    onChange={() => setSelected(index)}
                    style={{ marginRight: "12px" }}
                  />
                  {option}
                </label>
              ))}
            </div>

            {hasVoted ? (
              <p
                role="status"
                style={{
                  marginTop: "25px",
                  color: "#176B3A",
                  fontWeight: "bold",
                }}
              >
                ✓ Your vote has been recorded.
              </p>
            ) : (
              <button
                type="button"
                disabled={
                  selected === null || submitting
                }
                onClick={handleSubmitVote}
                style={{
                  marginTop: "25px",
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#FBC713",
                  color: "#050A30",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor:
                    selected === null || submitting
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    selected === null || submitting
                      ? 0.5
                      : 1,
                }}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Vote"}
              </button>
            )}
          <button
  type="button"
  onClick={() => setShowResults(true)}
  style={{
    marginTop: "15px",
    width: "100%",
    padding: "15px",
    backgroundColor: "#050A30",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  📊 View Results (Demo)
</button>
            {message && (              
              <p role="status" style={{ color: "#176B3A" }}>
                {message}
              </p>
            )}

            {error && (
              <p role="alert" style={{ color: "#A00000" }}>
                {error}
              </p>
            )}
          </section>
        )}

        {!loading && error && !poll && (
          <p role="alert">{error}</p>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            opacity: 0.7,
            marginTop: "40px",
          }}
        >
          Powered by UDB Corporation (Pvt) Ltd.
        </p>
      </div>
    </main>
  );
}
