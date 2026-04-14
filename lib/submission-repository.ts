import type { DiagnosisSubmission } from "@/domain/diagnosis/types";
import { createDiagnosisSubmission, getDiagnosisSubmissionById } from "@/lib/diagnosis-storage";

type CreateSubmissionInput = DiagnosisSubmission;

function isHtml403Response(message: string) {
  return message.includes("<title>403 Forbidden</title>") || message.includes("403 Forbidden");
}

function hasWordPressBackend() {
  return Boolean(
    process.env.WORDPRESS_API_BASE &&
      (
        process.env.WORDPRESS_API_TOKEN ||
        (process.env.WORDPRESS_API_USER && process.env.WORDPRESS_API_APP_PASSWORD)
      )
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

function buildWordPressHeaders() {
  const headers = new Headers({
    "Content-Type": "application/json"
  });
  const token = process.env.WORDPRESS_API_TOKEN;

  if (token) {
    headers.set("X-Yourbrain-Shindan-Token", token);
    return headers;
  }

  headers.set("Authorization", getWordPressAuthHeader());
  return headers;
}

async function createWordPressSubmission(submission: CreateSubmissionInput) {
  const base = process.env.WORDPRESS_API_BASE;

  if (!base) {
    throw new Error("WordPress APIの接続先が設定されていません。");
  }

  const response = await fetch(`${base}/submissions`, {
    method: "POST",
    headers: buildWordPressHeaders(),
    body: JSON.stringify(submission),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    if (message && isHtml403Response(message)) {
      await createWordPressSubmissionViaAdminPost(submission);
      return;
    }

    throw new Error(message || "WordPressへの保存に失敗しました。");
  }
}

function buildAdminPostUrl() {
  const base = process.env.WORDPRESS_API_BASE;

  if (!base) {
    throw new Error("WordPress APIの接続先が設定されていません。");
  }

  const token = process.env.WORDPRESS_API_TOKEN;
  const siteBase = base.replace(/\/wp-json\/yourbrain-shindan\/v1\/?$/, "");
  const url = new URL("/wp-admin/admin-post.php", siteBase);

  url.searchParams.set("action", "yourbrain_shindan_submit");

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}

async function createWordPressSubmissionViaAdminPost(submission: CreateSubmissionInput) {
  const body = new URLSearchParams({
    payload: JSON.stringify(submission)
  });

  const response = await fetch(buildAdminPostUrl(), {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded"
    }),
    body: body.toString(),
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
    headers: process.env.WORDPRESS_API_TOKEN
      ? new Headers({
          "X-Yourbrain-Shindan-Token": process.env.WORDPRESS_API_TOKEN
        })
      : new Headers({
          Authorization: getWordPressAuthHeader()
        }),
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
