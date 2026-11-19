
export type QuizHistoryRecord = {
  id: string;
  categoryId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
};

const STORAGE_PREFIX = "next01-quiz-history";

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}-${userId}`;
}

export function getQuizHistory(
  userId: string
): QuizHistoryRecord[] {
  try {
    const saved = localStorage.getItem(
      getStorageKey(userId)
    );

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is QuizHistoryRecord =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.categoryId === "string" &&
        typeof item.score === "number" &&
        Number.isFinite(item.score) &&
        typeof item.totalQuestions === "number" &&
        Number.isFinite(item.totalQuestions) &&
        item.totalQuestions > 0 &&
        item.score >= 0 &&
        item.score <= item.totalQuestions &&
        typeof item.percentage === "number" &&
        Number.isFinite(item.percentage) &&
        item.percentage >= 0 &&
        item.percentage <= 100 &&
        typeof item.completedAt === "string"
    );
  } catch {
    return [];
  }
}

export function saveQuizResult(
  userId: string,
  categoryId: string,
  score: number,
  totalQuestions: number
): QuizHistoryRecord {
  if (
    !userId ||
    !categoryId ||
    !Number.isInteger(score) ||
    !Number.isInteger(totalQuestions) ||
    totalQuestions <= 0 ||
    score < 0 ||
    score > totalQuestions
  ) {
    throw new Error("Invalid quiz result");
  }

  const record: QuizHistoryRecord = {
    id: crypto.randomUUID(),
    categoryId,
    score,
    totalQuestions,
    percentage: Math.round(
      (score / totalQuestions) * 100
    ),
    completedAt: new Date().toISOString(),
  };

  const history = getQuizHistory(userId);

  localStorage.setItem(
    getStorageKey(userId),
    JSON.stringify([record, ...history])
  );

  return record;
}

export function getQuizStatistics(
  history: QuizHistoryRecord[]
) {
  const completed = history.length;

  const bestScore = completed
    ? Math.max(
        ...history.map((item) => item.percentage)
      )
    : 0;

  const averageScore = completed
    ? Math.round(
        history.reduce(
          (sum, item) => sum + item.percentage,
          0
        ) / completed
      )
    : 0;

  return {
    completed,
    bestScore,
    averageScore,
  };
}
