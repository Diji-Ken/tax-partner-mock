export type PipelineItem = {
  id: string;
  companyName: string;
  contactPerson: string;
  stage: '問い合わせ' | 'ヒアリング' | '提案' | '契約交渉' | '成約';
  estimatedMonthlyFee: number;
  probability: number;
  assignedStaff: string;
  source: string;
  lastContact: string;
  notes: string;
};

export const pipelineItems: PipelineItem[] = [
  { id: '1', companyName: '株式会社テクノベース', contactPerson: '佐々木太一', stage: '問い合わせ', estimatedMonthlyFee: 50000, probability: 10, assignedStaff: '山田太郎', source: 'HP問い合わせ', lastContact: '2026-03-20', notes: 'IT企業、freee利用中' },
  { id: '2', companyName: '有限会社グリーンファーム', contactPerson: '緑川和也', stage: 'ヒアリング', estimatedMonthlyFee: 30000, probability: 30, assignedStaff: '佐藤花子', source: '紹介', lastContact: '2026-03-18', notes: '農業法人、MF希望' },
  { id: '3', companyName: '株式会社ブルースカイ', contactPerson: '空田翔', stage: '提案', estimatedMonthlyFee: 60000, probability: 50, assignedStaff: '山田太郎', source: 'セミナー参加', lastContact: '2026-03-15', notes: '建設業、決算月変更検討中' },
  { id: '4', companyName: '合同会社スターライト', contactPerson: '星野光', stage: '契約交渉', estimatedMonthlyFee: 45000, probability: 80, assignedStaff: '鈴木一郎', source: '紹介', lastContact: '2026-03-22', notes: '飲食チェーン3店舗' },
  { id: '5', companyName: '株式会社オーシャン', contactPerson: '海野大輔', stage: '成約', estimatedMonthlyFee: 55000, probability: 100, assignedStaff: '山田太郎', source: 'HP問い合わせ', lastContact: '2026-03-10', notes: '4月から顧問開始' },
  { id: '6', companyName: '株式会社サンフラワー', contactPerson: '向日葵太郎', stage: '問い合わせ', estimatedMonthlyFee: 35000, probability: 10, assignedStaff: '佐藤花子', source: 'Google広告', lastContact: '2026-03-23', notes: '美容院2店舗経営' },
];
