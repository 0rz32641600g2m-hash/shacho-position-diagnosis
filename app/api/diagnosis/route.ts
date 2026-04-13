import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { questionDefinitions } from "@/domain/diagnosis/questions";
import { generateDiagnosisResult } from "@/domain/diagnosis/result";
import type { DiagnosisAnswers, DiagnosisSubmission, LeadFormValues } from "@/domain/diagnosis/types";
import { saveSubmission } from "@/lib/submission-repository";

type RequestBody = {
  lead?: LeadFormValues;
  answers?: DiagnosisAnswers;
};

function validateLead(lead?: LeadFormValues) {
  if (!lead) {
    return "事前情報が不足しています。";
  }

  if (!lead.companyName.trim()) {
    return "会社名を入力してください。";
  }

  if (!lead.contactName.trim()) {
    return "お名前を入力してください。";
  }

  if (!lead.email.trim()) {
    return "メールアドレスを入力してください。";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return "メールアドレスの形式を確認してください。";
  }

  if (!lead.consent) {
    return "利用規約への同意が必要です。";
  }

  return null;
}

function validateAnswers(answers?: DiagnosisAnswers) {
  if (!answers) {
    return "診断回答が不足しています。";
  }

  for (const question of questionDefinitions) {
    const value = answers[question.key];
    const empty = Array.isArray(value) ? value.length === 0 : !value;

    if (question.required && empty) {
      return `${question.title}は入力必須です。`;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const leadError = validateLead(body.lead);

    if (leadError) {
      return NextResponse.json({ error: leadError }, { status: 400 });
    }

    const answersError = validateAnswers(body.answers);

    if (answersError) {
      return NextResponse.json({ error: answersError }, { status: 400 });
    }

    const lead = body.lead as LeadFormValues;
    const answers = body.answers as DiagnosisAnswers;
    const result = generateDiagnosisResult(answers);
    const submission: DiagnosisSubmission = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      lead,
      answers,
      result
    };

    await saveSubmission(submission);

    return NextResponse.json({
      id: submission.id,
      result
    });
  } catch (error) {
    console.error("diagnosis submission failed", error);

    const message = error instanceof Error ? error.message : "診断結果の保存に失敗しました。";

    return NextResponse.json(
      {
        error: message || "診断結果の保存に失敗しました。"
      },
      { status: 500 }
    );
  }
}
