export type AiLearningRule = {
  id: string;
  clientName: string;
  condition: string;
  action: string;
  account: string;
  status: '承認済' | '要確認' | '新規候補';
  confidence: number;
  appliedCount: number;
  lastApplied: string;
};

export const aiLearningRules: AiLearningRule[] = [
  { id: '1', clientName: '株式会社サクラテック', condition: '摘要に「AWS」を含む', action: '通信費に仕訳', account: '通信費', status: '承認済', confidence: 98, appliedCount: 24, lastApplied: '2026-03-15' },
  { id: '2', clientName: '株式会社サクラテック', condition: '摘要に「Slack」「GitHub」を含む', action: '通信費に仕訳', account: '通信費', status: '承認済', confidence: 95, appliedCount: 12, lastApplied: '2026-03-10' },
  { id: '3', clientName: '株式会社マルハシ商事', condition: '取引先「ヨドバシ」金額5万円以下', action: '消耗品費に仕訳', account: '消耗品費', status: '要確認', confidence: 72, appliedCount: 5, lastApplied: '2026-03-10' },
  { id: '4', clientName: '株式会社フジタ建設', condition: '摘要に「ガソリン」「燃料」を含む', action: '車両費に仕訳', account: '車両費', status: '承認済', confidence: 96, appliedCount: 36, lastApplied: '2026-03-20' },
  { id: '5', clientName: '株式会社アオゾラ', condition: '取引先「東京電力」「東京ガス」', action: '水道光熱費に仕訳', account: '水道光熱費', status: '承認済', confidence: 99, appliedCount: 48, lastApplied: '2026-03-05' },
  { id: '6', clientName: '合同会社ミライ', condition: '摘要に「タクシー」金額1万円以下', action: '旅費交通費に仕訳', account: '旅費交通費', status: '新規候補', confidence: 60, appliedCount: 2, lastApplied: '2026-03-22' },
];
