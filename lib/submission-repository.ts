import type { DiagnosisSubmission } from "@/domain/diagnosis/types";
import { createDiagnosisSubmission, getDiagnosisSubmissionById } from "@/lib/diagnosis-storage";

type CreateSubmissionInput = DiagnosisSubmission;

function hasWordPressBackend() {
  return Boolean(
    process.env.WORDPRESS_API_BASE &&
      process.env.WORDPRESS_API_USER &&
      process.env.WORDPRESS_API_APP_PASSWORD
  );
}

function getWordPressAuthHeader() {
  const user = process.env.WORDPRESS_API_USER;
  const password = process.env.WORDPRESS_API_APP_PASSWORD;

  if (!user || !password) {
    throw new Error("WordPress認証情報が設定されていません。");
  }

  return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
}

async function createWordPressSubmission(submission: CreateSubmissionInput) {
  const base = process.env.WORDPRESS_API_BASE;

  if (!base) {
    throw new Error("WordPress APIの接続先が設定されていません。");
  }

  const response = await fetch(`${base}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getWordPressAuthHeader()
    },
    body: JSON.stringify(submission),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "WordPressへの保存に失敗しました。");
  }
}

async function getWordPressSubmissionById(id: string) {
  const base = process.env.WORDPRESS_API_BASE;

  if (!base) {
    throw new Error("WordPress APIの接続先が設定されていません。");
  }

  const response = await fetch(`${base}/submissions/${id}`, {
    headers: {
      Authorization: getWordPressAuthHeader()
    },
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "WordPressからの取得に失敗しました。");
  }

  return (await response.json()) as DiagnosisSubmission;
}

export async function saveSubmission(submission: CreateSubmissionInput) {
  if (hasWordPressBackend()) {
    await createWordPressSubmission(submission);
    return;
  }

  await createDiagnosisSubmission(submission);
}

export async function findSubmissionById(id: string) {
  if (hasWordPressBackend()) {
    return getWordPressSubmissionById(id);
  }

  return getDiagnosisSubmissionById(id);
}
