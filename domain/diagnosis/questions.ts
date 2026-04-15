import type { DiagnosisAnswers, QuestionDefinition } from "./types";

export const defaultAnswers: DiagnosisAnswers = {
  revenueScale: "",
  industry: "",
  topConcerns: [],
  cashMonths: "",
  profitStatus: "",
  cashAnxiety: "",
  customerAcquisition: "",
  salesVisibility: "",
  grossProfitVisibility: "",
  monthlyTiming: "",
  cashflowTable: "",
  decisionConfidence: ""
};

export const questionDefinitions: QuestionDefinition[] = [
  {
    key: "revenueScale",
    title: "年商規模",
    required: true,
    category: "基本情報",
    options: [
      { label: "1億円未満", value: "under1" },
      { label: "1〜3億円", value: "1to3" },
      { label: "3〜10億円", value: "3to10" },
      { label: "10〜30億円", value: "10to30" },
      { label: "30億円以上", value: "30plus" }
    ]
  },
  {
    key: "industry",
    title: "業種",
    required: true,
    category: "基本情報",
    options: [
      { label: "製造業", value: "manufacturing" },
      { label: "建設業", value: "construction" },
      { label: "小売業", value: "retail" },
      { label: "IT・サービス業", value: "it_service" },
      { label: "その他", value: "other" }
    ]
  },
  {
    key: "topConcerns",
    title: "今一番の悩み",
    description: "あてはまるものを複数選べます。今どこで手が止まりやすいかを見る設問です。",
    required: true,
    multiple: true,
    category: "基本情報",
    options: [
      { label: "資金繰り", value: "cashflow" },
      { label: "利益が残らない", value: "profitability" },
      { label: "売上の伸び悩み", value: "growth" },
      { label: "集客の不安定さ", value: "acquisition" },
      { label: "人材採用", value: "hiring" },
      { label: "幹部育成", value: "leadership" },
      { label: "数字が見えない", value: "visibility" },
      { label: "投資判断が難しい", value: "investment" }
    ]
  },
  {
    key: "cashMonths",
    title: "手元資金は月商の何か月分ありますか",
    description: "守りの厚みを見るための設問です。",
    required: true,
    category: "財務",
    options: [
      { label: "1か月未満", value: "lt1" },
      { label: "1〜2か月", value: "1to2" },
      { label: "3〜6か月", value: "3to6" },
      { label: "6か月以上", value: "6plus" },
      { label: "分からない", value: "unknown" }
    ]
  },
  {
    key: "profitStatus",
    title: "直近の利益状況に近い感覚はどれですか",
    description: "攻めに出る前の持久力を測る目安です。",
    required: true,
    category: "財務",
    options: [
      { label: "しっかり黒字", value: "strong_profit" },
      { label: "なんとか黒字", value: "slim_profit" },
      { label: "トントン", value: "break_even" },
      { label: "赤字気味", value: "loss" },
      { label: "分からない", value: "unknown" }
    ]
  },
  {
    key: "cashAnxiety",
    title: "資金繰りへの不安はありますか",
    description: "玉の堅さにあたる安全度を見ています。",
    required: true,
    category: "財務",
    options: [
      { label: "強い", value: "high" },
      { label: "ややある", value: "medium" },
      { label: "あまりない", value: "low" },
      { label: "ない", value: "none" }
    ]
  },
  {
    key: "customerAcquisition",
    title: "新規顧客獲得は安定していますか",
    description: "攻め駒が安定して働いているかを見る設問です。",
    required: true,
    category: "売上・マーケティング",
    options: [
      { label: "安定している", value: "stable" },
      { label: "月によって波が大きい", value: "volatile" },
      { label: "紹介頼み", value: "referral" },
      { label: "あまり取れていない", value: "weak" }
    ]
  },
  {
    key: "salesVisibility",
    title: "売上の先行きはどれくらい見えていますか",
    description: "何手先まで読めているかの目安です。",
    required: true,
    category: "売上・マーケティング",
    options: [
      { label: "3か月先まである程度見える", value: "3months" },
      { label: "1か月先くらいまで", value: "1month" },
      { label: "読みにくい", value: "unclear" },
      { label: "ほぼ見えない", value: "blind" }
    ]
  },
  {
    key: "grossProfitVisibility",
    title: "粗利の高い商品・低い商品を把握していますか",
    description: "どの攻め筋が効くかを見極めるための土台です。",
    required: true,
    category: "売上・マーケティング",
    options: [
      { label: "はい", value: "yes" },
      { label: "一部だけ", value: "partial" },
      { label: "いいえ", value: "no" }
    ]
  },
  {
    key: "monthlyTiming",
    title: "月次の数字はいつ見られますか",
    description: "盤面把握のスピードに関わります。",
    required: true,
    category: "経営管理",
    options: [
      { label: "翌月10日以内", value: "10days" },
      { label: "翌月20日以内", value: "20days" },
      { label: "翌月末以降", value: "month_end" },
      { label: "ほとんど見ていない", value: "rarely" }
    ]
  },
  {
    key: "cashflowTable",
    title: "資金繰り表はありますか",
    description: "先の展開を読むための土台です。",
    required: true,
    category: "経営管理",
    options: [
      { label: "毎月更新している", value: "monthly" },
      { label: "たまに作る", value: "sometimes" },
      { label: "ない", value: "none" }
    ]
  },
  {
    key: "decisionConfidence",
    title: "数字をもとに採用・広告・投資判断ができていますか",
    description: "読みの深さと、手の精度を見る設問です。",
    required: true,
    category: "経営管理",
    options: [
      { label: "できている", value: "yes" },
      { label: "一部できている", value: "partial" },
      { label: "できていない", value: "no" }
    ]
  }
];
