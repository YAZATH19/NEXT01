
import { useState } from "react";
import { auth } from "./firebase";
import { quizCategories } from "./quizData";
import {
  getQuizHistory,
  getQuizStatistics,
  type QuizHistoryRecord,
} from "./quizHistory";

type QuizHistoryProps = {
  onBack: () => void;
};

export default function QuizHistory({
  onBack,
}: QuizHistoryProps) {
  const [history] = useState<QuizHistoryRecord[]>(
    () => {
      const userId = auth.currentUser?.uid;
      return userId ? getQuizHistory(userId) : [];
    }
  );

  const statistics = getQuizStatistics(history);

  const getCategory = (categoryId: string) =>
    quizCategories.find(
      (category) => category.id === categoryId
    );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050A30",
        color: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: "12px 18px",
            backgroundColor: "#FFFFFF",
            color: "#050A30",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back to Quiz Centre
        </button>

        <h1 style={{ marginTop: "35px" }}>
          📊 My Quiz History
        </h1>

        <p>Track your learning progress.</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          {[
            {
              label: "Completed",
              value: statistics.completed,
            },
            {
              label: "Best Score",
              value: `${statistics.bestScore}%`,
            },
            {
              label: "Average Score",
              value: `${statistics.averageScore}%`,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: "#19234C",
                border: "1px solid #FBC713",
                borderRadius: "12px",
                padding: "22px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#FBC713",
                }}
              >
                {item.value}
              </div>
              <p>{item.label}</p>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: "40px" }}>
          Recent Quiz Results
        </h2>

        {history.length === 0 ? (
          <p>
            No quiz history yet. Complete a quiz
            to see your results here.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            {history.map((record) => {
              const category = getCategory(
                record.categoryId
              );

              const date = new Date(
                record.completedAt
              );

              return (
                <div
                  key={record.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#050A30",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  <div>
                    <strong>
                      {category?.icon ?? "🧠"}{" "}
                      {category?.name ??
                        record.categoryId}
                    </strong>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666666",
                      }}
                    >
                      {Number.isNaN(date.getTime())
                        ? "Date unavailable"
                        : date.toLocaleString()}
                    </p>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "22px",
                      }}
                    >
                      {record.score} /{" "}
                      {record.totalQuestions}
                    </strong>

                    <p
                      style={{
                        color: "#176B3A",
                        margin: "5px 0",
                      }}
                    >
                      {record.percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer
          style={{
            textAlign: "center",
            marginTop: "50px",
            fontSize: "12px",
            opacity: 0.6,
          }}
        >
          Powered by UDB Corporation (Pvt) Ltd.
        </footer>
      </div>
    </main>
  );
}
