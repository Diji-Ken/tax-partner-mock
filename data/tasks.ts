export type Task = {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  category: '月次処理' | '決算' | '法人税申告' | '消費税申告' | '年末調整' | '給与計算';
  status: '未着手' | '進行中' | '確認待ち' | '完了';
  priority: 'high' | 'medium' | 'low';
  assignedStaff: string;
  dueDate: string;
  description: string;
};

export const tasks: Task[] = [
  { id: '1', title: '3月度月次処理', clientId: '1', clientName: '株式会社サクラテック', category: '月次処理', status: '進行中', priority: 'high', assignedStaff: '山田太郎', dueDate: '2026-04-10', description: '3月度の仕訳入力・残高確認' },
  { id: '2', title: '3月決算', clientId: '2', clientName: '株式会社ヤマダHD', category: '決算', status: '未着手', priority: 'high', assignedStaff: '山田太郎', dueDate: '2026-05-31', description: '3月期決算書作成' },
  { id: '3', title: '法人税申告書作成', clientId: '1', clientName: '株式会社サクラテック', category: '法人税申告', status: '未着手', priority: 'high', assignedStaff: '山田太郎', dueDate: '2026-05-31', description: '法人税・地方税の申告書作成' },
  { id: '4', title: '消費税申告', clientId: '4', clientName: '株式会社フジタ建設', category: '消費税申告', status: '確認待ち', priority: 'medium', assignedStaff: '鈴木一郎', dueDate: '2026-08-31', description: '消費税確定申告書作成' },
  { id: '5', title: '3月度月次処理', clientId: '3', clientName: '株式会社マルハシ商事', category: '月次処理', status: '進行中', priority: 'medium', assignedStaff: '佐藤花子', dueDate: '2026-04-10', description: '3月度の仕訳入力・残高確認' },
  { id: '6', title: '給与計算（3月分）', clientId: '7', clientName: '株式会社アオゾラ', category: '給与計算', status: '完了', priority: 'medium', assignedStaff: '鈴木一郎', dueDate: '2026-03-25', description: '3月分給与計算・明細作成' },
  { id: '7', title: '3月度月次処理', clientId: '5', clientName: '株式会社タナカ物産', category: '月次処理', status: '未着手', priority: 'medium', assignedStaff: '佐藤花子', dueDate: '2026-04-10', description: '3月度の仕訳入力・残高確認' },
  { id: '8', title: '年末調整準備', clientId: '11', clientName: '株式会社グローバルIT', category: '年末調整', status: '完了', priority: 'low', assignedStaff: '山田太郎', dueDate: '2026-01-31', description: '年末調整関連書類の提出確認' },
  { id: '9', title: '3月度月次処理', clientId: '6', clientName: '合同会社ミライ', category: '月次処理', status: '確認待ち', priority: 'low', assignedStaff: '山田太郎', dueDate: '2026-04-10', description: '3月度の仕訳入力・残高確認' },
  { id: '10', title: '決算報告書作成', clientId: '3', clientName: '株式会社マルハシ商事', category: '決算', status: '未着手', priority: 'high', assignedStaff: '佐藤花子', dueDate: '2026-05-31', description: '3月期決算報告書の作成' },
  { id: '11', title: '3月度月次処理', clientId: '8', clientName: '医療法人さくら', category: '月次処理', status: '進行中', priority: 'medium', assignedStaff: '佐藤花子', dueDate: '2026-04-10', description: '3月度の仕訳入力・残高確認' },
  { id: '12', title: '法人税中間申告', clientId: '7', clientName: '株式会社アオゾラ', category: '法人税申告', status: '未着手', priority: 'medium', assignedStaff: '鈴木一郎', dueDate: '2026-04-30', description: '法人税中間申告書の作成' },
];
