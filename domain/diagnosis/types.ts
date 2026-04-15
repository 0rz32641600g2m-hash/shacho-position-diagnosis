export type SingleValue =
  | "revenueScale"
  | "industry"
  | "cashMonths"
  | "profitStatus"
  | "cashAnxiety"
  | "customerAcquisition"
  | "salesVisibility"
  | "grossProfitVisibility"
  | "monthlyTiming"
  | "cashflowTable"
  | "decisionConfidence";

export type MultiValue = "topConcerns";

export type QuestionKey = SingleValue | MultiValue;

export type ScoreKey = "defense" | "offense" | "boardAwareness" | "decisionMaking";

export type Phase =
  | "序盤整備局面"
  | "盤面整理局面"
  | "中盤競り合い局面"
  | "受け優先局面"
  | "優勢拡大型"
  | "逆転含み局面"
  | "終盤勝負局面";
export type Momentum = "優勢" | "やや優勢" | "互角" | "やや苦戦" | "苦戦";
export type OverallGrade = "A" | "B" | "C" | "D" | "E";

export type OptionDefinition = {
  label: string;
  value: string;
};

export type QuestionDefinition = {
  key: QuestionKey;
  title: string;
  description?: string;
  required: boolean;
  multiple?: boolean;
  category: "基本情報" | "財務" | "売上・マーケティング" | "経営管理";
  options: OptionDefinition[];
};

export type DiagnosisAnswers = Record<SingleValue, string> & {
  topConcerns: string[];
};

export type LeadFormValues = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  consent: boolean;
};

export type ScoreDetail = {
  key: ScoreKey;
  label: string;
  score: number;
  level: 1 | 2 | 3 | 4 | 5;
  levelLabel: string;
  tone: string;
  description: string;
};

export type NextMove = {
  title: string;
  evaluationDelta: number;
  deltaLabel: string;
  categoryLabel?: string;
  best?: boolean;
};

export type InsightSummary = {
  goodPoint: string;
  cautionPoint: string;
  firstAction: string;
};

export type ScenarioPoint = {
  month: string;
  value: number;
};

export type Scenario = {
  label: string;
  color: string;
  points: ScenarioPoint[];
};

export type DiagnosisResult = {
  overallPhase: Phase;
  momentum: Momentum;
  grade: OverallGrade;
  totalScore: number;
  evaluationValue: number;
  evaluationLabel: string;
  offensePercent: number;
  defensePercent: number;
  scores: Record<ScoreKey, ScoreDetail>;
  summaryComment: string;
  shortMessage: string;
  insights: InsightSummary;
  nextMoves: NextMove[];
  badMoves: NextMove[];
  scenarios: Scenario[];
};

export type DiagnosisSubmission = {
  id: string;
  createdAt: string;
  lead: LeadFormValues;
  answers: DiagnosisAnswers;
  result: DiagnosisResult;
};
