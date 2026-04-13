import { defaultAnswers } from "@/domain/diagnosis/questions";
import type { DiagnosisAnswers } from "@/domain/diagnosis/types";

export function serializeAnswers(answers: DiagnosisAnswers) {
  // 初期版ではフォーム状態をURLに載せ、サーバー側でも同じ計算結果を再現できるようにする。
  return encodeURIComponent(JSON.stringify(answers));
}

export function deserializeAnswers(input?: string) {
  if (!input) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(input)) as Partial<DiagnosisAnswers>;

    return {
      ...defaultAnswers,
      ...parsed,
      topConcerns: Array.isArray(parsed.topConcerns) ? parsed.topConcerns : []
    } satisfies DiagnosisAnswers;
  } catch {
    return null;
  }
}
