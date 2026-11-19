import {
  doc,
  serverTimestamp,
  setDoc,
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