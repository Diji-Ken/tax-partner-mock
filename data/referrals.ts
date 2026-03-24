export type ReferralCategory = 'financing' | 'subsidy' | 'specialist' | 'insurance' | 'ma' | 'it_tool' | 'business_match';

export type ReferralPartner = {
  id: string;
  name: string;
  category: ReferralCategory;
  description: string;
  commission: string;
  status: 'active' | 'pending' | 'inactive';
  deals: number;
  totalRevenue: number;
};

export type ReferralDeal = {
  id: string;
  clientName: string;
  partnerName: string;
  category: ReferralCategory;
  status: 'introduced' | 'in_progress' | 'closed_won' | 'closed_lost';
  amount: number;
  commission: number;
  date: string;
  note: string;
};

export const categoryLabels: Record<ReferralCategory, string> = {
  financing: '融資紹介',
  subsidy: '補助金申請支援',
  specialist: '士業紹介',
  insurance: '保険紹介',
  ma: 'M&A仲介',
  it_tool: 'ITツール導入',
  business_match: 'ビジネスマッチング',
};

export const referralPartners: ReferralPartner[] = [
  {
    id: 'p1',
    name: '日本政策金融公庫',
    category: 'financing',
    description: '創業融資・小規模事業者向け融資の紹介窓口',
    commission: '紹介手数料なし（関係構築目的）',
    status: 'active',
    deals: 12,
    totalRevenue: 0,
  },
  {
    id: 'p2',
    name: '埼玉縣信用金庫',
    category: 'financing',
    description: '地域密着型の事業融資・運転資金の紹介',
    commission: '紹介手数料なし',
    status: 'active',
    deals: 5,
    totalRevenue: 0,
  },
  {
    id: 'p3',
    name: '補助金サポート株式会社',
    category: 'subsidy',
    description: '各種補助金の申請支援・採択サポート',
    commission: '成功報酬10%',
    status: 'active',
    deals: 8,
    totalRevenue: 480000,
  },
  {
    id: 'p4',
    name: '社会保険労務士法人みらい',
    category: 'specialist',
    description: '社労士紹介：就業規則・助成金・労務相談',
    commission: '紹介手数料 ¥30,000/件',
    status: 'active',
    deals: 15,
    totalRevenue: 450000,
  },
  {
    id: 'p5',
    name: '弁護士法人東京リーガル',
    category: 'specialist',
    description: '弁護士紹介：契約書レビュー・法的トラブル対応',
    commission: '紹介手数料 ¥50,000/件',
    status: 'active',
    deals: 3,
    totalRevenue: 150000,
  },
  {
    id: 'p6',
    name: 'ABC保険代理店',
    category: 'insurance',
    description: '法人向け損害保険・生命保険の提案',
    commission: '代理店手数料の20%バック',
    status: 'active',
    deals: 6,
    totalRevenue: 360000,
  },
  {
    id: 'p7',
    name: 'M&Aキャピタル',
    category: 'ma',
    description: '事業承継・M&A仲介サービス',
    commission: '仲介手数料の10%',
    status: 'active',
    deals: 1,
    totalRevenue: 500000,
  },
  {
    id: 'p8',
    name: 'デジタルツール研究所',
    category: 'it_tool',
    description: 'IT導入補助金の支援事業者としてDXツール導入を支援',
    commission: 'IT導入補助金の支援事業者報酬',
    status: 'active',
    deals: 4,
    totalRevenue: 200000,
  },
];

export const referralDeals: ReferralDeal[] = [
  {
    id: 'd1',
    clientName: '株式会社サクラテック',
    partnerName: '日本政策金融公庫',
    category: 'financing',
    status: 'closed_won',
    amount: 10000000,
    commission: 0,
    date: '2026-01-15',
    note: '創業融資1,000万円の紹介。無事満額実行。',
  },
  {
    id: 'd2',
    clientName: '株式会社フジタ建設',
    partnerName: '補助金サポート株式会社',
    category: 'subsidy',
    status: 'in_progress',
    amount: 2000000,
    commission: 200000,
    date: '2026-03-10',
    note: 'ものづくり補助金の申請支援中。採択結果は5月頃。',
  },
  {
    id: 'd3',
    clientName: '株式会社ヤマダHD',
    partnerName: '社会保険労務士法人みらい',
    category: 'specialist',
    status: 'closed_won',
    amount: 500000,
    commission: 30000,
    date: '2026-02-20',
    note: '就業規則の見直し。顧問契約に繋がった。',
  },
  {
    id: 'd4',
    clientName: '合同会社ミライ',
    partnerName: 'ABC保険代理店',
    category: 'insurance',
    status: 'closed_won',
    amount: 1200000,
    commission: 80000,
    date: '2026-02-05',
    note: '法人向け賠償責任保険の契約完了。',
  },
  {
    id: 'd5',
    clientName: '株式会社タナカ物産',
    partnerName: 'M&Aキャピタル',
    category: 'ma',
    status: 'introduced',
    amount: 50000000,
    commission: 0,
    date: '2026-03-18',
    note: '事業承継の相談あり。初回面談を設定。',
  },
  {
    id: 'd6',
    clientName: '株式会社アオゾラ',
    partnerName: 'デジタルツール研究所',
    category: 'it_tool',
    status: 'in_progress',
    amount: 800000,
    commission: 100000,
    date: '2026-03-05',
    note: 'IT導入補助金を活用した会計システムのリプレイス。申請準備中。',
  },
  {
    id: 'd7',
    clientName: '有限会社ハナマル',
    partnerName: '埼玉縣信用金庫',
    category: 'financing',
    status: 'closed_won',
    amount: 5000000,
    commission: 0,
    date: '2026-01-28',
    note: '運転資金500万円の融資実行完了。',
  },
  {
    id: 'd8',
    clientName: '株式会社オーシャン',
    partnerName: '弁護士法人東京リーガル',
    category: 'specialist',
    status: 'closed_lost',
    amount: 300000,
    commission: 0,
    date: '2026-02-12',
    note: '契約書レビューの相談。他の弁護士に依頼済みのため見送り。',
  },
  {
    id: 'd9',
    clientName: '株式会社サクラテック',
    partnerName: '社会保険労務士法人みらい',
    category: 'specialist',
    status: 'closed_won',
    amount: 400000,
    commission: 30000,
    date: '2026-03-01',
    note: '助成金申請サポート。キャリアアップ助成金が採択。',
  },
  {
    id: 'd10',
    clientName: '株式会社フジタ建設',
    partnerName: 'デジタルツール研究所',
    category: 'it_tool',
    status: 'introduced',
    amount: 600000,
    commission: 0,
    date: '2026-03-20',
    note: 'IT導入補助金を活用したクラウド勤怠管理の導入提案。',
  },
];

// 月別紹介収益データ（収益レポート用）
export const monthlyReferralRevenue = [
  { month: '10月', revenue: 120000 },
  { month: '11月', revenue: 180000 },
  { month: '12月', revenue: 250000 },
  { month: '1月', revenue: 310000 },
  { month: '2月', revenue: 420000 },
  { month: '3月', revenue: 180000 },
];

// カテゴリ別収益データ（円グラフ用）
export const categoryRevenue = [
  { name: '融資紹介', value: 0, fill: '#3b82f6' },
  { name: '補助金申請支援', value: 480000, fill: '#10b981' },
  { name: '士業紹介', value: 600000, fill: '#8b5cf6' },
  { name: '保険紹介', value: 360000, fill: '#f59e0b' },
  { name: 'M&A仲介', value: 500000, fill: '#ef4444' },
  { name: 'ITツール導入', value: 200000, fill: '#06b6d4' },
];
