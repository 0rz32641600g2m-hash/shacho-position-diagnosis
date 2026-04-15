import type { DiagnosisAnswers, ScoreDetail, ScoreKey } from "./types";

const scoreMaps = {
  cashMonths: {
    lt1: 15,
    "1to2": 38,
    "3to6": 72,
    "6plus": 90,
    unknown: 35
  },
  profitStatus: {
    strong_profit: 90,
    slim_profit: 70,
    break_even: 50,
    loss: 20,
    unknown: 35
  },
  cashAnxiety: {
    high: 15,
    medium: 40,
    low: 70,
    none: 88
  },
  cashflowTable: {
    monthly: 85,
    sometimes: 52,
    none: 18
  },
  customerAcquisition: {
    stable: 85,
    volatile: 55,
    referral: 45,
    weak: 22
  },
  salesVisibility: {
    "3months": 82,
    "1month": 60,
    unclear: 35,
    blind: 18
  },
  grossProfitVisibility: {
    yes: 86,
    partial: 56,
    no: 20
  },
  monthlyTiming: {
    "10days": 88,
    "20days": 66,
    month_end: 35,
    rarely: 15
  },
  decisionConfidence: {
    yes: 86,
    partial: 58,
    no: 22
  }
} as const;

const scoreLabels: Record<ScoreKey, string> = {
  defense: "守備力",
  offense: "攻撃力",
  boardAwareness: "盤面把握力",
  decisionMaking: "読みの力"
};

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function describeScore(score: number) {
  if (score >= 75) {
    return {
      tone: "強みあり",
      description: "この軸はよく整っており、本筋の一手を前向きに選びやすい状態です。"
    };
  }

  if (score >= 55) {
    return {
      tone: "伸びしろあり",
      description: "大崩れはしていませんが、もう一段手厚くすると局面が安定します。"
    };
  }

  if (score >= 35) {
    return {
      tone: "要補強",
      description: "強く踏み込む前に、形を整えてから動くほうが安全です。"
    };
  }

  return {
    tone: "優先対応",
    description: "この軸が弱く、無理攻めをすると形勢を悪くしやすい状態です。"
  };
}

function toFiveLevel(score: number): { level: 1 | 2 | 3 | 4 | 5; levelLabel: string } {
  if (score >= 85) {
    return { level: 5, levelLabel: "かなり良い" };
  }

  if (score >= 70) {
    return { level: 4, levelLabel: "良い" };
  }

  if (score >= 55) {
    return { level: 3, levelLabel: "標準" };
  }

  if (score >= 40) {
    return { level: 2, levelLabel: "やや弱い" };
  }

  return { level: 1, levelLabel: "弱い" };
}

export function calculateScores(answers: DiagnosisAnswers): Record<ScoreKey, ScoreDetail> {
  // 各軸は質問の意味づけに沿って集計し、将来の重み調整をここだけで完結させる。
  const defense = average([
    scoreMaps.cashMonths[answers.cashMonths as keyof typeof scoreMaps.cashMonths],
    scoreMaps.profitStatus[answers.profitStatus as keyof typeof scoreMaps.profitStatus],
    scoreMaps.cashAnxiety[answers.cashAnxiety as keyof typeof scoreMaps.cashAnxiety],
    scoreMaps.cashflowTable[answers.cashflowTable as keyof typeof scoreMaps.cashflowTable]
  ]);

  const offense = average([
    scoreMaps.customerAcquisition[
      answers.customerAcquisition as keyof typeof scoreMaps.customerAcquisition
    ],
    scoreMaps.salesVisibility[answers.salesVisibility as keyof typeof scoreMaps.salesVisibility],
    scoreMaps.grossProfitVisibility[
      answers.grossProfitVisibility as keyof typeof scoreMaps.grossProfitVisibility
    ]
  ]);

  const boardAwareness = average([
    scoreMaps.monthlyTiming[answers.monthlyTiming as keyof typeof scoreMaps.monthlyTiming],
    scoreMaps.cashflowTable[answers.cashflowTable as keyof typeof scoreMaps.cashflowTable],
    scoreMaps.profitStatus[answers.profitStatus as keyof typeof scoreMaps.profitStatus],
    scoreMaps.grossProfitVisibility[
      answers.grossProfitVisibility as keyof typeof scoreMaps.grossProfitVisibility
    ]
  ]);

  const decisionMaking = average([
    scoreMaps.decisionConfidence[
      answers.decisionConfidence as keyof typeof scoreMaps.decisionConfidence
    ],
    scoreMaps.salesVisibility[answers.salesVisibility as keyof typeof scoreMaps.salesVisibility],
    scoreMaps.monthlyTiming[answers.monthlyTiming as keyof typeof scoreMaps.monthlyTiming],
    scoreMaps.grossProfitVisibility[
      answers.grossProfitVisibility as keyof typeof scoreMaps.grossProfitVisibility
    ]
  ]);

  return {
    defense: buildScore("defense", defense),
    offense: buildScore("offense", offense),
    boardAwareness: buildScore("boardAwareness", boardAwareness),
    decisionMaking: buildScore("decisionMaking", decisionMaking)
  };
}

function buildScore(key: ScoreKey, score: number): ScoreDetail {
  const detail = describeScore(score);
  const level = toFiveLevel(score);

  return {
    key,
    label: scoreLabels[key],
    score,
    level: level.level,
    levelLabel: level.levelLabel,
    tone: detail.tone,
    description: detail.description
  };
}
