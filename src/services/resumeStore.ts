import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseFirestore } from "../lib/firebase";
import type { ResumeAiResponse } from "./resumeAiClient";

export async function saveResume(
  resumeText: ResumeAiResponse["resumeText"]
): Promise<string> {
  const firestore = getFirebaseFirestore();

  if (firestore === null) {
    throw new Error("Firebase 설정을 확인해주세요.");
  }

  const resumeDocument = await addDoc(collection(firestore, "resumes"), {
    ...resumeText,
    status: "generated",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return resumeDocument.id;
}
