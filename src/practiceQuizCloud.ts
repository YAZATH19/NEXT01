import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";

import { db } from "./firebase";

import type {
  QuizHistoryRecord,
} from "./quizHistory";

export async function savePracticeQuizToCloud(
  userId: string,
  record: QuizHistoryRecord
): Promise<void> {
  if (!userId || !record.id) {
    throw new Error("Invalid practice quiz result");
  }

  const resultRef = doc(
    db,
    "users",
    userId,
    "practiceQuizHistory",
    record.id
  );

  await setDoc(resultRef, {
    categoryId: record.categoryId,
    score: record.score,
    totalQuestions: record.totalQuestions,
    percentage: record.percentage,
    completedAt: serverTimestamp(),
  });
}
export async function getPracticeQuizHistoryFromCloud(
  userId: string
): Promise<QuizHistoryRecord[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const historyRef = collection(
    db,
    "users",
    userId,
    "practiceQuizHistory"
  );

  const snapshot = await getDocs(historyRef);

  const history: QuizHistoryRecord[] = [];

  snapshot.forEach((document) => {
    const data = document.data();

    const completedAt = data.completedAt as
      | Timestamp
      | undefined;

    if (
      typeof data.categoryId !== "string" ||
      !Number.isInteger(data.score) ||
      !Number.isInteger(data.totalQuestions) ||
      data.totalQuestions <= 0 ||
      data.score < 0 ||
      data.score > data.totalQuestions ||
      !Number.isInteger(data.percentage) ||
      data.percentage !==
        Math.round(
          (data.score / data.totalQuestions) * 100
        ) ||
      !completedAt ||
      typeof completedAt.toDate !== "function"
    ) {
      return;
    }

    history.push({
      id: document.id,
      categoryId: data.categoryId,
      score: data.score,
      totalQuestions: data.totalQuestions,
      percentage: data.percentage,
      completedAt: completedAt.toDate().toISOString(),
    });
  });

  return history.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() -
      new Date(a.completedAt).getTime()
  );
}
export async function syncLocalPracticeQuizToCloud(
  userId: string,
  records: QuizHistoryRecord[]
): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  for (const record of records) {
    if (!record.id) {
      continue;
    }

    const resultRef = doc(
      db,
      "users",
      userId,
      "practiceQuizHistory",
      record.id
    );

    const existingResult = await getDoc(resultRef);

    if (existingResult.exists()) {
      continue;
    }

    await savePracticeQuizToCloud(userId, record);
  }
}