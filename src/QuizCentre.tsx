
import { useState } from "react";
import { quizCategories } from "./quizData";
import {
  getQuestionsByCategory,
  type QuizQuestion,
} from "./quizQuestions";
import { auth } from "./firebase";
import { saveQuizResult } from "./quizHistory";
import QuizHistory from "./QuizHistoryScreen";

type QuizCentreProps = {
  onBack: () => void;
};

export default function QuizCentre({
  onBack,
}: QuizCentreProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [answers, setAnswers] = useState<
    Record<string, number>
  >({});

  const [completed, setCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const category = quizCategories.find(
    (item) => item.id === selectedCategory
  );

  const questions = selectedCategory
    ? getQuestionsByCategory(selectedCategory)
    : [];

  const currentQuestion: QuizQuestion | undefined =
    questions[questionIndex];

  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const score = questions.reduce(
    (total, question) =>
      total +
      (answers[question.id] ===
      question.correctAnswerIndex
        ? 1
        : 0),
    0
  );

  const percentage = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

const resetQuiz = () => {
  setQuestionIndex(0);
  setAnswers({});
  setCompleted(false);
  setShowReview(false);
  setHistoryError("");
};

  const returnToCategories = () => {
    resetQuiz();
    setSelectedCategory(null);
  };

const handleNext = () => {
  if (selectedAnswer === undefined) return;

  if (questionIndex < questions.length - 1) {
    setQuestionIndex((index) => index + 1);
  } else {
    setHistoryError("");

    const userId = auth.currentUser?.uid;

    if (userId && selectedCategory) {
      try {
        saveQuizResult(
          userId,
          selectedCategory,
          score,
          questions.length
        );
      } catch {
        setHistoryError(
          "Quiz completed, but your result could not be saved."
        );
      }
    } else {
      setHistoryError(
        "Quiz completed, but no signed-in account was found."
      );
    }

    setCompleted(true);
  }
};
if (showHistory) {
  return (
    <QuizHistory
      onBack={() => setShowHistory(false)}
    />
  );
}
  const buttonStyle = {
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold" as const,
  };

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
          onClick={
            selectedCategory
              ? returnToCategories
              : onBack
          }
          style={{
            ...buttonStyle,
            backgroundColor: "#FFFFFF",
            color: "#050A30",
          }}
        >
          {selectedCategory
            ? "← Back to Categories"
            : "← Back to Dashboard"}
        </button>

        <h1 style={{ marginTop: "35px" }}>
          🧠 NEXT01 Quiz Centre
        </h1>

        <p>Learn, Challenge Yourself and Grow.</p>

<button
  type="button"
  onClick={() => setShowHistory(true)}
  style={{
    backgroundColor: "#FBC713",
    color: "#050A30",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    marginTop: "15px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  📊 My Quiz History
</button>


        {!category ? (
          <>
            <h2 style={{ marginTop: "35px" }}>
              Choose a Quiz Category
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: "15px",
                marginTop: "25px",
              }}
            >
              {quizCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    resetQuiz();
                    setSelectedCategory(item.id);
                  }}
                  style={{
                    backgroundColor: "#19234C",
                    color: "#FFFFFF",
                    border: "1px solid #FBC713",
                    borderRadius: "15px",
                    padding: "25px 15px",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "36px" }}>
                    {item.icon}
                  </div>
                  <h3>{item.name}</h3>
                  <p style={{ fontSize: "13px", opacity: 0.8 }}>
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <section
            style={{
              backgroundColor: "#FFFFFF",
              color: "#050A30",
              padding: "25px",
              borderRadius: "15px",
              marginTop: "30px",
            }}
          >
            <h2>
              {category.icon} {category.name}
            </h2>

            {questions.length === 0 ? (
              <p>
                Questions for this category are
                coming soon.
              </p>
            ) : completed ? (
              <div style={{ textAlign: "center" }}>
                <h3>🎉 Quiz Completed!</h3>
                {historyError && (
  <p
    role="alert"
    style={{
      color: "#B42318",
      backgroundColor: "#FFF0EE",
      padding: "12px",
      borderRadius: "8px",
    }}
  >
    {historyError}
  </p>
)}
                <p>Your Score</p>

                <strong style={{ fontSize: "40px" }}>
                  {score} / {questions.length}
                </strong>

                <p style={{ fontSize: "24px" }}>
                  {percentage}%
                </p>

<button
  type="button"
  onClick={() => setShowReview((value) => !value)}
  style={{
    ...buttonStyle,
    backgroundColor: "#050A30",
    color: "#FFFFFF",
    marginRight: "10px",
    marginBottom: "15px",
  }}
>
  {showReview ? "Hide Answers" : "Review Answers"}

</button>

{showReview && (
  <div
    style={{
      marginTop: "25px",
      marginBottom: "25px",
      textAlign: "left",
      display: "grid",
      gap: "15px",
    }}
  >
    {questions.map((question, index) => {
      const userAnswer = answers[question.id];
      const isCorrect =
        userAnswer === question.correctAnswerIndex;

      return (
        <div
          key={question.id}
          style={{
            padding: "18px",
            borderRadius: "10px",
            backgroundColor: "#F4F6FA",
            borderLeft: `5px solid ${
              isCorrect ? "#198754" : "#DC3545"
            }`,
          }}
        >
          <strong>
            {index + 1}. {question.question}
          </strong>

          <p>
            {isCorrect ? "✅" : "❌"} Your answer:{" "}
            {userAnswer === undefined
              ? "Not answered"
              : question.options[userAnswer]}
          </p>

          {!isCorrect && (
            <p style={{ color: "#176B3A" }}>
              ✓ Correct answer:{" "}
              {
                question.options[
                  question.correctAnswerIndex
                ]
              }
            </p>
          )}
        </div>
      );
    })}
  </div>
)}
                <button
                  type="button"
                  onClick={resetQuiz}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#FBC713",
                    color: "#050A30",
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : currentQuestion ? (
              <>
                <p style={{ color: "#666666" }}>
                  Question {questionIndex + 1} of{" "}
                  {questions.length}
                </p>

                <div
                  style={{
                    height: "10px",
                    backgroundColor: "#E8EBF2",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        ((questionIndex + 1) /
                          questions.length) *
                        100
                      }%`,
                      height: "100%",
                      backgroundColor: "#FBC713",
                    }}
                  />
                </div>

                <h3 style={{ marginTop: "25px" }}>
                  {currentQuestion.question}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "25px",
                  }}
                >
                  {currentQuestion.options.map(
                    (option, index) => (
                      <label
                        key={index}
                        style={{
                          padding: "15px",
                          border: "1px solid #CCCCCC",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor:
                            selectedAnswer === index
                              ? "#FFF3C0"
                              : "#FFFFFF",
                        }}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          checked={
                            selectedAnswer === index
                          }
                          onChange={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [currentQuestion.id]: index,
                            }))
                          }
                          style={{
                            marginRight: "12px",
                          }}
                        />
                        {option}
                      </label>
                    )
                  )}
                </div>

                <button
                  type="button"
                  disabled={
                    selectedAnswer === undefined
                  }
                  onClick={handleNext}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#FBC713",
                    color: "#050A30",
                    width: "100%",
                    marginTop: "25px",
                    opacity:
                      selectedAnswer === undefined
                        ? 0.5
                        : 1,
                    cursor:
                      selectedAnswer === undefined
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {questionIndex ===
                  questions.length - 1
                    ? "Finish Quiz"
                    : "Next Question →"}
                </button>
              </>
            ) : null}
          </section>
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
