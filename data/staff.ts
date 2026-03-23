export type Staff = {
  id: string;
  name: string;
  email: string;
  role: '管理者' | 'スタッフ' | '閲覧者';
  status: 'active' | 'inactive';
  clientCount: number;
  averageHours: number;
  productivity: 'A' | 'B' | 'C';
};

export const staff: Staff[] = [
  { id: '1', name: '山田太郎', email: 'yamada@sample-tax.co.jp', role: '管理者', status: 'active', clientCount: 5, averageHours: 32, productivity: 'A' },
  { id: '2', name: '佐藤花子', email: 'sato@sample-tax.co.jp', role: 'スタッフ', status: 'active', clientCount: 4, averageHours: 28, productivity: 'A' },
  { id: '3', name: '鈴木一郎', email: 'suzuki@sample-tax.co.jp', role: 'スタッフ', status: 'active', clientCount: 3, averageHours: 24, productivity: 'B' },
];
