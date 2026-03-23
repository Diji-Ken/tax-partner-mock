export type Activity = {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
  type: 'create' | 'update' | 'complete' | 'upload' | 'send';
};

export const activities: Activity[] = [
  { id: '1', action: '請求書を送付しました', target: '株式会社ヤマダHD', user: '山田太郎', timestamp: '2026-03-24 10:30', type: 'send' },
  { id: '2', action: '月次処理を完了しました', target: '株式会社アオゾラ', user: '鈴木一郎', timestamp: '2026-03-24 09:15', type: 'complete' },
  { id: '3', action: 'OCR処理結果を確認しました', target: '株式会社サクラテック', user: '山田太郎', timestamp: '2026-03-23 16:45', type: 'update' },
  { id: '4', action: '決算書類をアップロードしました', target: '株式会社フジタ建設', user: '鈴木一郎', timestamp: '2026-03-23 14:20', type: 'upload' },
  { id: '5', action: '新規顧問先を登録しました', target: '株式会社オーシャン', user: '山田太郎', timestamp: '2026-03-22 11:00', type: 'create' },
];
