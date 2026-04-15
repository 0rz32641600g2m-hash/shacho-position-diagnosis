import { questionDefinitions } from "./questions";
import { generateBadMoves, generateNextMoves } from "./recommendations";
import { calculateScores } from "./scoring";
import type {
  DiagnosisAnswers,
  DiagnosisResult,
  InsightSummary,
  Momentum,
  OverallGrade,
  Phase
} from "./types";

function determinePhase({
  defense,
  offense,
  boardAwareness,
  decisionMaking
}: {
  defense: number;
  offense: number;
  boardAwareness: number;
  decisionMaking: number;
}): Phase {
  if (boardAwareness < 38) {
    return "序盤整備局面";
  }

  if (defense < 38) {
    return offense >= 58 ? "逆転含み局面" : "受け優先局面";
  }

  if (offense >= 76 && defense >= 68 && decisionMaking >= 64) {
    return "優勢拡大型";
  }

  if (offense >= 62 && defense >= 56) {
    return "中盤競り合い局面";
  }

  if (defense >= 68 && offense >= 58 && decisionMaking >= 72) {
    return "終盤勝負局面";
  }

  if (boardAwareness < 52 || decisionMaking < 52) {
    return "盤面整理局面";
  }

  return defense >= offense ? "受け優先局面" : "中盤競り合い局面";
}

function buildSummaryComment(phase: Phase) {
  switch (phase) {
    case "優勢拡大型":
      return {
        shortMessage: "優勢を広げる本筋を選びやすい局面です。",
        summaryComment:
          "攻め駒も守りもよく働いています。無理に手を広げるより、勝ち筋が太くなる一手に絞ると形勢を伸ばしやすい状態です。"
      };
    case "中盤競り合い局面":
      return {
        shortMessage: "攻めと受けの両睨みで、次の一手が重要です。",
        summaryComment:
          "大きく悪くはありませんが、踏み込み方を誤ると形勢が振れやすい局面です。攻める前に、効く筋と効かない筋を見分けたい状態です。"
      };
    case "受け優先局面":
      return {
        shortMessage: "攻めたい気持ちより、まず受けを固めたい局面です。",
        summaryComment:
          "今は前へ出るよりも、資金や利益の持久力を厚くするほうが本筋です。受けが整うだけで、苦戦側から戻しやすくなります。"
      };
    case "逆転含み局面":
      return {
        shortMessage: "攻め筋はあるものの、無理攻めは避けたい局面です。",
        summaryComment:
          "伸びる余地は見えますが、守りが薄いまま踏み込むと形勢を崩しやすい状態です。受けを整えてからなら、逆転の目も十分あります。"
      };
    case "終盤勝負局面":
      return {
        shortMessage: "読みの精度で差がつく、詰めの局面です。",
        summaryComment:
          "ここからは大きな方針より、どの順で指すかが重要です。利益の残る一手に絞れると、優位を固めやすい状態です。"
      };
    case "序盤整備局面":
      return {
        shortMessage: "まずは盤面を整えて、局面を見えるようにしたい段階です。",
        summaryComment:
          "大きく良い悪いを判断する前に、数字と現状認識を揃えることが先です。盤面が見えれば、攻めるか受けるかの判断もぶれにくくなります。"
      };
    default:
      return {
        shortMessage: "形を整えてから動きたい局面です。",
        summaryComment:
          "大きく悪いわけではありませんが、まだ盤面に曖昧さがあります。見える化を先に進めるほど、次の一手の精度が上がります。"
      };
  }
}

function determineMomentum(totalScore: number): Momentum {
  if (totalScore >= 78) return "優勢";
  if (totalScore >= 66) return "やや優勢";
  if (totalScore >= 54) return "互角";
  if (totalScore >= 42) return "やや苦戦";
  return "苦戦";
}

function determineGrade(totalScore: number): OverallGrade {
  if (totalScore >= 82) return "A";
  if (totalScore >= 68) return "B";
  if (totalScore >= 54) return "C";
  if (totalScore >= 40) return "D";
  return "E";
}

function calculateEvaluationValue(totalScore: number) {
  return Math.round((totalScore - 50) * 40);
}

function buildEvaluationLabel(evaluationValue: number) {
  const abs = Math.abs(evaluationValue);

  if (abs < 100) return "互角";
  if (abs < 300) return evaluationValue > 0 ? "わずかに良い" : "わずかに苦しい";
  if (abs < 500) return evaluationValue > 0 ? "少し良い" : "少し苦しい";
  if (abs < 1000) return evaluationValue > 0 ? "有利" : "不利";
  if (abs < 2000) return evaluationValue > 0 ? "優勢" : "劣勢";
  return evaluationValue > 0 ? "勝勢" : "敗勢";
}

function buildHealthStyleComment(momentum: Momentum, phase: Phase, evaluationValue: number) {
  const sign = evaluationValue >= 0 ? "+" : "";

  switch (momentum) {
    case "優勢":
      return `評価値は ${sign}${evaluationValue}。現在の形勢は${momentum}、局面は${phase}です。勝ち筋を広げる一手を選びやすい状態です。`;
    case "やや優勢":
      return `評価値は ${sign}${evaluationValue}。現在の形勢は${momentum}、局面は${phase}です。前向きに動けますが、手厚さを保つほど優位が安定します。`;
    case "互角":
      return `評価値は ${sign}${evaluationValue}。現在の形勢は${momentum}、局面は${phase}です。次の一手しだいで、良くも悪くも振れやすい状態です。`;
    case "やや苦戦":
      return `評価値は ${sign}${evaluationValue}。現在の形勢は${momentum}、局面は${phase}です。攻め急がず、受けを整えるほど戻しやすくなります。`;
    default:
      return `評価値は ${evaluationValue}。現在の形勢は${momentum}、局面は${phase}です。まずは守りと盤面整理を優先したい状態です。`;
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
    scores.offense.score >= 68
      ? "攻め駒にあたる売上や集客の伸びしろはあります。筋を絞れば、前に出る余地は十分あります。"
      : scores.defense.score >= 62
        ? "受けの土台は一定あります。慌てて手を広げなければ、形勢を崩さず次の一手を選べます。"
        : "まだ立て直しの余地があります。形を整えれば、局面を戻せる余白は残っています。";

  const cautionPoint =
    scores.boardAwareness.score < 50
      ? "盤面把握力が弱く、どの筋が効いているかを読み切りにくい状態です。感覚で動くと手損になりやすいです。"
      : scores.defense.score < 45
        ? "守備力が薄く、攻めに出ても受けが利かずに失点しやすい状態です。無理攻めは避けたい局面です。"
        : "読みの力にまだ粗さがあり、良い手と悪い手の差が大きく出やすい状態です。踏み込み方には慎重さが要ります。";

  const firstAction =
    phase === "優勢拡大型"
      ? "まずやることは、利益が残る攻め筋を1つに絞って、優勢を広げることです。"
      : phase === "受け優先局面"
        ? "まずやることは、資金繰りと利益の持久力を確認して、受けを固めることです。"
        : phase === "序盤整備局面" || phase === "盤面整理局面"
          ? "まずやることは、月次数字・粗利・資金繰りを見えるようにして盤面を整えることです。"
          : phase === "逆転含み局面"
            ? "まずやることは、守りを薄くしない一手から入り、逆転の目を残すことです。"
            : "まずやることは、読みの精度を上げて、本筋の一手に集中することです。";

  return {
    goodPoint:
      concerns && concerns.length > 0 && scores.offense.score >= 60
        ? `${goodPoint} とくに「${concerns.join("・")}」には、まだ改善の余地があります。`
        : goodPoint,
    cautionPoint,
    firstAction
  };
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
    boardAwareness: scores.boardAwareness.score,
    decisionMaking: scores.decisionMaking.score
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

  return {
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
}

export function getQuestionCount() {
  return questionDefinitions.length;
}
