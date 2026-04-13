import type { DiagnosisAnswers, NextMove, ScoreDetail, ScoreKey } from "./types";

const concernMoves: Record<string, Omit<NextMove, "best">> = {
  cashflow: {
    title: "3か月先の資金繰り表をつくり、月次で更新する",
    evaluationDelta: 420,
    deltaLabel: "守りを立て直しやすい一手"
  },
  profitability: {
    title: "粗利の高い商品・低い商品を分けて、利益の出る受注に寄せる",
    evaluationDelta: 360,
    deltaLabel: "利益改善につながりやすい一手"
  },
  growth: {
    title: "新規顧客の獲得経路ごとに受注率と粗利を見える化する",
    evaluationDelta: 300,
    deltaLabel: "攻め筋の精度を上げる一手"
  },
  acquisition: {
    title: "紹介以外の集客導線を1つ追加し、月次で検証する",
    evaluationDelta: 240,
    deltaLabel: "売上の安定度を高める一手"
  },
  hiring: {
    title: "採用判断の前に、売上見通しと固定費耐性を並べて確認する",
    evaluationDelta: 220,
    deltaLabel: "無理な投資を防ぐ一手"
  },
  leadership: {
    title: "幹部と数字会議を月1回設け、同じ指標で会話する",
    evaluationDelta: 200,
    deltaLabel: "意思決定のズレを減らす一手"
  },
  visibility: {
    title: "月次数字を翌月15日以内に見られる体制を整える",
    evaluationDelta: 440,
    deltaLabel: "数字把握を早める一手"
  },
  investment: {
    title: "広告・採用・設備投資の判断前に、回収条件を定義する",
    evaluationDelta: 260,
    deltaLabel: "失点を防ぎやすい一手"
  }
};

const scoreMoves: Record<ScoreKey, Omit<NextMove, "best">[]> = {
  defense: [
    {
      title: "固定費と返済負担を整理し、守りの余力を確認する",
      evaluationDelta: 380,
      deltaLabel: "守りを安定させる一手"
    },
    {
      title: "資金ショートの前兆を週次で把握できる指標を決める",
      evaluationDelta: 260,
      deltaLabel: "悪化を早めに止める一手"
    }
  ],
  offense: [
    {
      title: "受注が安定する導線を1つに絞って再現性を高める",
      evaluationDelta: 340,
      deltaLabel: "攻め筋を太くする一手"
    },
    {
      title: "売上先行指標を3つに絞り、毎週トラッキングする",
      evaluationDelta: 240,
      deltaLabel: "攻めの精度を上げる一手"
    }
  ],
  boardAwareness: [
    {
      title: "月次試算表と資金繰り表を経営会議の定例資料にする",
      evaluationDelta: 400,
      deltaLabel: "局面判断を明確にする一手"
    },
    {
      title: "粗利・固定費・回収サイトをひと目で見える1枚表にする",
      evaluationDelta: 320,
      deltaLabel: "数字の見え方を揃える一手"
    }
  ],
  decisionMaking: [
    {
      title: "広告・採用・投資の判断基準を数字で事前定義する",
      evaluationDelta: 360,
      deltaLabel: "判断ミスを減らす一手"
    },
    {
      title: "幹部に共有するKPIを絞り、判断の基準を揃える",
      evaluationDelta: 220,
      deltaLabel: "判断基準を揃える一手"
    }
  ]
};

const badMoveTemplates: Record<ScoreKey, Omit<NextMove, "best">[]> = {
  defense: [
    {
      title: "資金繰りを確認しないまま広告費を先に増やす",
      evaluationDelta: -420,
      deltaLabel: "一気に形勢を崩しやすい手"
    },
    {
      title: "利益確認を後回しにして値引き受注を増やす",
      evaluationDelta: -360,
      deltaLabel: "守りを悪化させやすい手"
    }
  ],
  offense: [
    {
      title: "集客の型がないまま施策を増やし続ける",
      evaluationDelta: -300,
      deltaLabel: "攻め筋が散りやすい手"
    },
    {
      title: "紹介頼みのまま新規獲得の改善を止める",
      evaluationDelta: -220,
      deltaLabel: "攻めの再現性を落とす手"
    }
  ],
  boardAwareness: [
    {
      title: "月次数字を見ないまま感覚で意思決定する",
      evaluationDelta: -380,
      deltaLabel: "悪手が増えやすい手"
    },
    {
      title: "粗利差を見ずに商品や案件を広げる",
      evaluationDelta: -320,
      deltaLabel: "形勢を落としやすい手"
    }
  ],
  decisionMaking: [
    {
      title: "回収条件を決めずに採用や投資を先行する",
      evaluationDelta: -340,
      deltaLabel: "失点が増えやすい手"
    },
    {
      title: "幹部ごとに違う数字で判断を進める",
      evaluationDelta: -200,
      deltaLabel: "改善速度を落としやすい手"
    }
  ]
};

export function generateNextMoves(
  answers: DiagnosisAnswers,
  scores: Record<ScoreKey, ScoreDetail>
): NextMove[] {
  const moves: NextMove[] = [];
  const sortedWeaknesses = Object.values(scores)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.key);

  sortedWeaknesses.slice(0, 2).forEach((key) => {
    moves.push(...scoreMoves[key]);
  });

  answers.topConcerns.forEach((concern) => {
    const move = concernMoves[concern];
    if (move) {
      moves.push(move);
    }
  });

  const deduped = moves.filter(
    (move, index, list) => index === list.findIndex((candidate) => candidate.title === move.title)
  );

  return deduped
    .sort((a, b) => b.evaluationDelta - a.evaluationDelta)
    .slice(0, 5)
    .map((move, index) => ({
      ...move,
      best: index === 0
    }));
}

export function generateBadMoves(scores: Record<ScoreKey, ScoreDetail>): NextMove[] {
  const weakAreas = Object.values(scores)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.key);

  return weakAreas
    .slice(0, 2)
    .flatMap((key) => badMoveTemplates[key])
    .filter((move, index, list) => index === list.findIndex((candidate) => candidate.title === move.title))
    .sort((a, b) => a.evaluationDelta - b.evaluationDelta)
    .slice(0, 4);
}
