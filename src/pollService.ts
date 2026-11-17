
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

export type PublicPoll = {
  id: string;
  question: string;
  category: string;
  options: string[];
  status: "published";
};

export async function getPublishedPolls(): Promise<
  PublicPoll[]
> {
  const pollsRef = collection(db, "polls");

  const pollsQuery = query(
    pollsRef,
    where("status", "==", "published")
  );

  const snapshot = await getDocs(pollsQuery);

  const polls: PublicPoll[] = [];

  snapshot.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();

    // Ignore malformed poll documents.
    if (
      typeof data.question !== "string" ||
      !data.question.trim() ||
      !Array.isArray(data.options) ||
      data.options.length < 2 ||
      !data.options.every(
        (option: unknown) =>
          typeof option === "string" &&
          option.trim().length > 0
      ) ||
      data.status !== "published"
    ) {
      return;
    }

    polls.push({
      id: documentSnapshot.id,
      question: data.question,
      category:
        typeof data.category === "string" &&
        data.category.trim()
          ? data.category
          : "General",
      options: data.options,
      status: "published",
    });
  });

  return polls;
}
