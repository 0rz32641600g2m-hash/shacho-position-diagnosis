import type { DiagnosisAnswers, NextMove, ScoreDetail, ScoreKey } from "./types";

const concernMoves: Record<string, Omit<NextMove, "best">> = {
  cashflow: {
    title: "3か月先の資金繰り表をつくり、月次で更新する",
    evaluationDelta: 420,
    categoryLabel: "受けを固める一手",
    deltaLabel: "守りの形を崩さずに持久力を戻す本筋です。"
  },
  profitability: {
    title: "粗利の高い商品・低い商品を分けて、利益の出る受注に寄せる",
    evaluationDelta: 360,
    categoryLabel: "本筋の一手",
    deltaLabel: "勝ち筋につながる利益源を見極めやすくなります。"
  },
  growth: {
    title: "新規顧客の獲得経路ごとに受注率と粗利を見える化する",
    evaluationDelta: 300,
    categoryLabel: "読みを深くする一手",
    deltaLabel: "攻め筋の良し悪しを数字で読み分けやすくなります。"
  },
  acquisition: {
    title: "紹介以外の集客導線を1つ追加し、月次で検証する",
    evaluationDelta: 240,
    categoryLabel: "攻め筋を太くする一手",
    deltaLabel: "攻め駒の働きを増やし、集客の再現性を高めます。"
  },
  hiring: {
    title: "採用判断の前に、売上見通しと固定費耐性を並べて確認する",
    evaluationDelta: 220,
    categoryLabel: "手厚い一手",
    deltaLabel: "攻め急ぎを防ぎ、受けを崩さずに次の手を選べます。"
  },
  leadership: {
    title: "幹部と数字会議を月1回設け、同じ指標で会話する",
    evaluationDelta: 200,
    categoryLabel: "読みを深くする一手",
    deltaLabel: "読み筋の共有が進み、手のズレが減ります。"
  },
  visibility: {
    title: "月次数字を翌月15日以内に見られる体制を整える",
    evaluationDelta: 440,
    categoryLabel: "本筋の一手",
    deltaLabel: "局面判断の精度が上がり、悪手を避けやすくなります。"
  },
  investment: {
    title: "広告・採用・設備投資の判断前に、回収条件を定義する",
    evaluationDelta: 260,
    categoryLabel: "手厚い一手",
    deltaLabel: "読みの浅い投資を防ぎ、形勢悪化を抑えます。"
  }
};

const scoreMoves: Record<ScoreKey, Omit<NextMove, "best">[]> = {
  defense: [
    {
      title: "固定費と返済負担を整理し、守りの余力を確認する",
      evaluationDelta: 380,
      categoryLabel: "受けを固める一手",
      deltaLabel: "玉の堅さにあたる資金余力を把握しやすくなります。"
    },
    {
      title: "資金ショートの前兆を週次で把握できる指標を決める",
      evaluationDelta: 260,
      categoryLabel: "手厚い一手",
      deltaLabel: "苦戦側に振れたときも早めに受けへ回れます。"
    }
  ],
  offense: [
    {
      title: "受注が安定する導線を1つに絞って再現性を高める",
      evaluationDelta: 340,
      categoryLabel: "攻め筋を太くする一手",
      deltaLabel: "攻め駒の働きが揃い、伸びる筋が見えやすくなります。"
    },
    {
      title: "売上先行指標を3つに絞り、毎週トラッキングする",
      evaluationDelta: 240,
      categoryLabel: "勝ち筋を広げる一手",
      deltaLabel: "攻めるべき場面と控える場面を分けやすくなります。"
    }
  ],
  boardAwareness: [
    {
      title: "月次試算表と資金繰り表を経営会議の定例資料にする",
      evaluationDelta: 400,
      categoryLabel: "本筋の一手",
      deltaLabel: "盤面の見え方が揃い、局面判断に迷いが減ります。"
    },
    {
      title: "粗利・固定費・回収サイトをひと目で見える1枚表にする",
      evaluationDelta: 320,
      categoryLabel: "読みを深くする一手",
      deltaLabel: "何を優先して指すべきかを整理しやすくなります。"
    }
  ],
  decisionMaking: [
    {
      title: "広告・採用・投資の判断基準を数字で事前定義する",
      evaluationDelta: 360,
      categoryLabel: "読みを深くする一手",
      deltaLabel: "何手先まで踏み込めるかの判断精度が上がります。"
    },
    {
      title: "幹部に共有するKPIを絞り、判断の基準を揃える",
      evaluationDelta: 220,
      categoryLabel: "手厚い一手",
      deltaLabel: "読み筋が揃い、攻めと受けの判断ブレを減らせます。"
    }
  ]
};

const badMoveTemplates: Record<ScoreKey, Omit<NextMove, "best">[]> = {
  defense: [
    {
      title: "資金繰りを確認しないまま広告費を先に増やす",
      evaluationDelta: -420,
      categoryLabel: "無理攻め",
      deltaLabel: "守りを置き去りにして、形勢を一気に崩しやすい手です。"
    },
    {
      title: "利益確認を後回しにして値引き受注を増やす",
      evaluationDelta: -360,
      categoryLabel: "形を崩す一手",
      deltaLabel: "受けの形が薄くなり、持久戦で苦しくなりやすいです。"
    }
  ],
  offense: [
    {
      title: "集客の型がないまま施策を増やし続ける",
      evaluationDelta: -300,
      categoryLabel: "攻め駒が散る一手",
      deltaLabel: "攻め筋がばらけて、成果が読みづらくなります。"
    },
    {
      title: "紹介頼みのまま新規獲得の改善を止める",
      evaluationDelta: -220,
      categoryLabel: "読みの浅い一手",
      deltaLabel: "攻めの再現性が育たず、局面が細くなります。"
    }
  ],
  boardAwareness: [
    {
      title: "月次数字を見ないまま感覚で意思決定する",
      evaluationDelta: -380,
      categoryLabel: "読みの浅い一手",
      deltaLabel: "局面判断がぶれやすく、悪手を重ねやすくなります。"
    },
    {
      title: "粗利差を見ずに商品や案件を広げる",
      evaluationDelta: -320,
      categoryLabel: "形を崩す一手",
      deltaLabel: "効く攻め筋が見えず、手損になりやすいです。"
    }
  ],
  decisionMaking: [
    {
      title: "回収条件を決めずに採用や投資を先行する",
      evaluationDelta: -340,
      categoryLabel: "受けを軽視した一手",
      deltaLabel: "先の読みが浅いまま踏み込み、失点につながりやすい手です。"
    },
    {
      title: "幹部ごとに違う数字で判断を進める",
      evaluationDelta: -200,
      categoryLabel: "攻め駒が散る一手",
      deltaLabel: "読み筋が割れて、勝ち筋を太くできなくなります。"
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
