export type Client = {
  id: string;
  name: string;
  representative: string;
  settlementMonth: number;
  accountingSoftware: 'freee' | 'MF' | 'yayoi' | 'other';
  monthlyFee: number;
  assignedStaff: string;
  status: 'active' | 'inactive';
  rank: 'A' | 'B' | 'C';
  type: 'corporate' | 'individual';
  phone: string;
  email: string;
  industry: string;
  registeredDate: string;
};

export const clients: Client[] = [
  { id: '1', name: '株式会社サクラテック', representative: '田中一郎', settlementMonth: 3, accountingSoftware: 'freee', monthlyFee: 50000, assignedStaff: '山田太郎', status: 'active', rank: 'A', type: 'corporate', phone: '03-1111-2222', email: 'tanaka@sakura-tech.co.jp', industry: 'IT・ソフトウェア', registeredDate: '2024-04-01' },
  { id: '2', name: '株式会社ヤマダHD', representative: '山田正雄', settlementMonth: 3, accountingSoftware: 'MF', monthlyFee: 80000, assignedStaff: '山田太郎', status: 'active', rank: 'A', type: 'corporate', phone: '03-2222-3333', email: 'yamada@yamada-hd.co.jp', industry: '不動産', registeredDate: '2023-10-01' },
  { id: '3', name: '株式会社マルハシ商事', representative: '丸橋健太', settlementMonth: 3, accountingSoftware: 'freee', monthlyFee: 35000, assignedStaff: '佐藤花子', status: 'active', rank: 'B', type: 'corporate', phone: '03-3333-4444', email: 'maruhashi@maruhashi.co.jp', industry: '卸売業', registeredDate: '2024-01-15' },
  { id: '4', name: '株式会社フジタ建設', representative: '藤田誠', settlementMonth: 6, accountingSoftware: 'yayoi', monthlyFee: 60000, assignedStaff: '鈴木一郎', status: 'active', rank: 'A', type: 'corporate', phone: '048-111-2222', email: 'fujita@fujita-kensetsu.co.jp', industry: '建設業', registeredDate: '2023-06-01' },
  { id: '5', name: '株式会社タナカ物産', representative: '田中裕子', settlementMonth: 9, accountingSoftware: 'freee', monthlyFee: 30000, assignedStaff: '佐藤花子', status: 'active', rank: 'B', type: 'corporate', phone: '03-5555-6666', email: 'info@tanaka-bussan.co.jp', industry: '小売業', registeredDate: '2024-03-01' },
  { id: '6', name: '合同会社ミライ', representative: '松岡哲平', settlementMonth: 12, accountingSoftware: 'MF', monthlyFee: 25000, assignedStaff: '山田太郎', status: 'active', rank: 'C', type: 'corporate', phone: '048-222-3333', email: 'matsuoka@mirai.co.jp', industry: 'ITコンサルティング', registeredDate: '2024-07-01' },
  { id: '7', name: '株式会社アオゾラ', representative: '青空太陽', settlementMonth: 9, accountingSoftware: 'freee', monthlyFee: 70000, assignedStaff: '鈴木一郎', status: 'active', rank: 'A', type: 'corporate', phone: '03-7777-8888', email: 'aozora@aozora.co.jp', industry: '製造業', registeredDate: '2023-04-01' },
  { id: '8', name: '医療法人さくら', representative: '桜井美咲', settlementMonth: 3, accountingSoftware: 'MF', monthlyFee: 45000, assignedStaff: '佐藤花子', status: 'active', rank: 'B', type: 'corporate', phone: '03-8888-9999', email: 'sakurai@sakura-med.or.jp', industry: '医療', registeredDate: '2024-02-01' },
  { id: '9', name: '株式会社ナカムラ工業', representative: '中村剛', settlementMonth: 12, accountingSoftware: 'yayoi', monthlyFee: 28000, assignedStaff: '鈴木一郎', status: 'active', rank: 'C', type: 'corporate', phone: '048-333-4444', email: 'nakamura@nakamura-k.co.jp', industry: '製造業', registeredDate: '2024-05-01' },
  { id: '10', name: '株式会社コスモス', representative: '花田和也', settlementMonth: 6, accountingSoftware: 'freee', monthlyFee: 40000, assignedStaff: '山田太郎', status: 'active', rank: 'B', type: 'corporate', phone: '03-4444-5555', email: 'hanada@cosmos.co.jp', industry: '飲食業', registeredDate: '2024-08-01' },
  { id: '11', name: '株式会社グローバルIT', representative: '高橋智也', settlementMonth: 9, accountingSoftware: 'freee', monthlyFee: 90000, assignedStaff: '山田太郎', status: 'active', rank: 'A', type: 'corporate', phone: '03-6666-7777', email: 'takahashi@global-it.co.jp', industry: 'IT・SaaS', registeredDate: '2023-01-01' },
  { id: '12', name: '有限会社太陽', representative: '太陽敏彦', settlementMonth: 3, accountingSoftware: 'MF', monthlyFee: 20000, assignedStaff: '佐藤花子', status: 'inactive', rank: 'C', type: 'corporate', phone: '048-555-6666', email: 'taiyo@taiyo-y.co.jp', industry: 'サービス業', registeredDate: '2022-04-01' },
];
