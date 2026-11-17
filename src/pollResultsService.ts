
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export type PollResultsSummary = {
  counts: number[];
  totalVotes: number;
  updatedAt: Date | null;
};

export async function getPollResultsSummary(
  pollId: string
): Promise<PollResultsSummary> {
  const summaryRef = doc(
    db,
    "polls",
    pollId,
    "results",
    "summary"
  );

  const snapshot = await getDoc(summaryRef);

  if (!snapshot.exists()) {
    throw new Error("Poll results summary not found.");
  }

  const data = snapshot.data();

  if (
    !Array.isArray(data.counts) ||
    !data.counts.every(
      (value: unknown) =>
        typeof value === "number" &&
        Number.isSafeInteger(value) &&
        value >= 0
    ) ||
    typeof data.totalVotes !== "number" ||
    !Number.isSafeInteger(data.totalVotes) ||
    data.totalVotes < 0 ||
    data.counts.reduce(
      (sum: number, count: number) => sum + count,
      0
    ) !== data.totalVotes
  ) {
    throw new Error("Invalid poll results data.");
  }

  return {
    counts: data.counts,
    totalVotes: data.totalVotes,
    updatedAt:
      data.updatedAt?.toDate?.() ?? null,
  };
}
