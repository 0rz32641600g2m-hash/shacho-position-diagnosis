import { questionDefinitions } from "./questions";
import { generateBadMoves, generateNextMoves } from "./recommendations";
import { calculateScores } from "./scoring";
import type {
  DiagnosisAnswers,
  DiagnosisResult,
  InsightSummary,
  Momentum,
  OverallGrade,
  Phase,
  Scenario
} from "./types";

function determinePhase({
  defense,
  offense,
  boardAwareness
}: {
  defense: number;
  offense: number;
  boardAwareness: number;
}): Phase {
  // 判定順を固定することで、「盤面が見えていない」「守りが弱い」を先に拾う。
  if (boardAwareness < 42) {
    return "盤面整理局面";
  }

  if (defense < 40) {
    return "守勢局面";
  }

  if (offense >= 70 && defense >= 65) {
    return "攻勢局面";
  }

  if (offense >= 55 && (defense < 65 || boardAwareness < 60)) {
    return "持久戦局面";
  }

  return defense >= offense ? "盤面整理局面" : "持久戦局面";
}

function buildSummaryComment(phase: Phase) {
  switch (phase) {
    case "攻勢局面":
      return {
        shortMessage: "攻めに出やすい状態です。",
        summaryComment: "守りも攻めも比較的整っています。大きく崩れる前に、伸びる施策へ絞って動きやすい局面です。"
      };
    case "持久戦局面":
      return {
        shortMessage: "攻める前に土台固めが必要です。",
        summaryComment: "伸びる余地はありますが、そのまま攻めると失速しやすい状態です。先に守りと数字管理を整えるのが安全です。"
      };
    case "守勢局面":
      return {
        shortMessage: "今は守りを優先すべきです。",
        summaryComment: "攻めるより先に、資金と利益の持ちこたえる力を整えるべき局面です。まずは失点を減らすことが重要です。"
      };
    default:
      return {
        shortMessage: "まずは状況整理が必要です。",
        summaryComment: "数字が十分に見えていないため、攻めるにも守るにも判断しづらい状態です。先に現状を見える化するのが近道です。"
      };
  }
}

function determineMomentum(totalScore: number): Momentum {
  if (totalScore >= 78) {
    return "優勢";
  }

  if (totalScore >= 66) {
    return "やや優勢";
  }

  if (totalScore >= 54) {
    return "互角";
  }

  if (totalScore >= 42) {
    return "やや苦戦";
  }

  return "苦戦";
}

function determineGrade(totalScore: number): OverallGrade {
  if (totalScore >= 82) {
    return "A";
  }

  if (totalScore >= 68) {
    return "B";
  }

  if (totalScore >= 54) {
    return "C";
  }

  if (totalScore >= 40) {
    return "D";
  }

  return "E";
}

function calculateEvaluationValue(totalScore: number) {
  return Math.round((totalScore - 50) * 40);
}

function buildEvaluationLabel(evaluationValue: number) {
  const abs = Math.abs(evaluationValue);

  if (abs < 100) {
    return "互角";
  }

  if (abs < 300) {
    return evaluationValue > 0 ? "わずかに良い" : "わずかに苦しい";
  }

  if (abs < 500) {
    return evaluationValue > 0 ? "少し良い" : "少し苦しい";
  }

  if (abs < 1000) {
    return evaluationValue > 0 ? "有利" : "不利";
  }

  if (abs < 2000) {
    return evaluationValue > 0 ? "優勢" : "劣勢";
  }

  return evaluationValue > 0 ? "勝勢" : "敗勢";
}

function buildHealthStyleComment(momentum: Momentum, phase: Phase, evaluationValue: number) {
  const sign = evaluationValue >= 0 ? "+" : "";

  switch (momentum) {
    case "優勢":
      return `評価値は ${sign}${evaluationValue} で、今は${phase}です。全体として良い状態で、前向きな一手を打ちやすい状況です。`;
    case "やや優勢":
      return `評価値は ${sign}${evaluationValue} で、今は${phase}です。やや良い状態ですが、弱い部分を整えてから動くほうが安全です。`;
    case "互角":
      return `評価値は ${sign}${evaluationValue} で、今は${phase}です。大きく良くも悪くもなく、次の打ち手で形勢が変わりやすい状況です。`;
    case "やや苦戦":
      return `評価値は ${sign}${evaluationValue} で、今は${phase}です。やや苦しいので、攻める前に守りと数字管理を整えるのが先です。`;
    default:
      return `評価値は ${evaluationValue} で、今は${phase}です。苦しい状態なので、まずは守りを立て直すことを優先してください。`;
  }
}

function buildInsights(
  answers: DiagnosisAnswers,
  scores: DiagnosisResult["scores"],
  phase: Phase
): InsightSummary {
  const concerns = questionDefinitions
    .find((question) => question.key === "topConcerns")
    ?.options.filter((option) => answers.topConcerns.includes(option.value))
    .map((option) => option.label);

  const goodPoint =
    scores.offense.score >= 65
      ? "売上や集客にはまだ伸ばせる余地があります。打ち手が当たれば形勢を前に進めやすい状態です。"
      : scores.defense.score >= 60
        ? "足元は大きく崩れておらず、守りの土台は一定あります。慌てず整えれば次の手を打ちやすい状態です。"
        : "大きな崩れが確定しているわけではなく、整え方しだいで持ち直せる余地があります。";

  const cautionPoint =
    scores.boardAwareness.score < 50
      ? "数字や粗利が十分に見えておらず、判断が感覚に寄りやすい点は注意が必要です。"
      : scores.defense.score < 45
        ? "資金と利益の余裕が薄く、このまま攻めると形勢を悪くしやすい点は注意が必要です。"
        : "攻める余地はありますが、まだ盤石ではないため、強く踏み込みすぎると失速しやすい点は注意が必要です。";

  const firstAction =
    phase === "攻勢局面"
      ? "まずやることは、利益が残る施策に絞って一手を打つことです。"
      : phase === "守勢局面"
        ? "まずやることは、資金繰りと利益の確認を進めて守りを固めることです。"
        : phase === "盤面整理局面"
          ? "まずやることは、月次数字と粗利を見えるようにして現状を整理することです。"
          : "まずやることは、数字管理を整えてから攻める順番に切り替えることです。";

  return {
    goodPoint:
      concerns && concerns.length > 0 && scores.offense.score >= 60
        ? `${goodPoint} 今回の悩みである「${concerns.join("・")}」にも手を打てる余地があります。`
        : goodPoint,
    cautionPoint,
    firstAction
  };
}

function buildScenarios(result: DiagnosisResult): Scenario[] {
  const base = Math.round((result.scores.defense.score + result.scores.offense.score) / 2);

  // シミュレーションは精密予測ではなく、打ち手の方向性で形勢が動く感覚を見せる用途。
  return [
    {
      label: "このまま何もしない場合",
      color: "#94a3b8",
      points: [
        { month: "現在", value: base },
        { month: "1か月後", value: Math.max(base - 4, 18) },
        { month: "2か月後", value: Math.max(base - 7, 12) },
        { month: "3か月後", value: Math.max(base - 10, 8) }
      ]
    },
    {
      label: "守りを整えた場合",
      color: "#c4a966",
      points: [
        { month: "現在", value: base },
        { month: "1か月後", value: Math.min(base + 5, 100) },
        { month: "2か月後", value: Math.min(base + 10, 100) },
        { month: "3か月後", value: Math.min(base + 16, 100) }
      ]
    },
    {
      label: "今すぐ攻めた場合",
      color: "#234b80",
      points: [
        { month: "現在", value: base },
        { month: "1か月後", value: Math.max(Math.min(base + 3, 100), 0) },
        { month: "2か月後", value: Math.max(Math.min(base + (result.scores.defense.score >= 55 ? 8 : -3), 100), 0) },
        { month: "3か月後", value: Math.max(Math.min(base + (result.scores.defense.score >= 55 ? 15 : -8), 100), 0) }
      ]
    }
  ];
}

function ratioToPercent(offense: number, defense: number) {
  const total = offense + defense;

  return {
    offensePercent: Math.round((offense / total) * 100),
    defensePercent: Math.round((defense / total) * 100)
  };
}

export function generateDiagnosisResult(answers: DiagnosisAnswers): DiagnosisResult {
  const scores = calculateScores(answers);
  const totalScore = Math.round(
    (scores.defense.score +
      scores.offense.score +
      scores.boardAwareness.score +
      scores.decisionMaking.score) /
      4
  );
  const phase = determinePhase({
    defense: scores.defense.score,
    offense: scores.offense.score,
    boardAwareness: scores.boardAwareness.score
  });
  const momentum = determineMomentum(totalScore);
  const grade = determineGrade(totalScore);
  const evaluationValue = calculateEvaluationValue(totalScore);
  const evaluationLabel = buildEvaluationLabel(evaluationValue);
  const summary = buildSummaryComment(phase);
  const ratio = ratioToPercent(scores.offense.score, scores.defense.score);
  const insights = buildInsights(answers, scores, phase);
  const nextMoves = generateNextMoves(answers, scores);
  const badMoves = generateBadMoves(scores);

  const result: DiagnosisResult = {
    overallPhase: phase,
    momentum,
    grade,
    totalScore,
    evaluationValue,
    evaluationLabel,
    offensePercent: ratio.offensePercent,
    defensePercent: ratio.defensePercent,
    scores,
    summaryComment: buildHealthStyleComment(momentum, phase, evaluationValue),
    shortMessage: summary.shortMessage,
    insights,
    nextMoves,
    badMoves,
    scenarios: []
  };

  result.scenarios = buildScenarios(result);

  return result;
}

export function getQuestionCount() {
  return questionDefinitions.length;
}
