import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { DiagnosisSubmission } from "@/domain/diagnosis/types";

const dataDirectory = path.join(process.cwd(), "data");
const submissionsFile = path.join(dataDirectory, "diagnosis-submissions.json");

async function ensureStorage() {
  await mkdir(dataDirectory, { recursive: true });
}

async function readAllSubmissions() {
  await ensureStorage();

  try {
    const raw = await readFile(submissionsFile, "utf8");
    return JSON.parse(raw) as DiagnosisSubmission[];
  } catch {
    return [];
  }
}

async function writeAllSubmissions(submissions: DiagnosisSubmission[]) {
  await ensureStorage();
  await writeFile(submissionsFile, JSON.stringify(submissions, null, 2), "utf8");
}

export async function createDiagnosisSubmission(submission: DiagnosisSubmission) {
  const submissions = await readAllSubmissions();
  submissions.unshift(submission);
  await writeAllSubmissions(submissions);
}

export async function getDiagnosisSubmissionById(id: string) {
  const submissions = await readAllSubmissions();
  return submissions.find((submission) => submission.id === id) ?? null;
}
