export type Integration = {
  id: string;
  name: string;
  description: string;
  category: '会計ソフト' | 'ストレージ' | '契約管理' | '決済' | 'コミュニケーション';
  connected: boolean;
  lastSync: string | null;
  connectedClients: number;
  icon: string;
};

export const integrations: Integration[] = [
  { id: '1', name: 'freee会計', description: '仕訳データの自動取込・同期。請求書連携。', category: '会計ソフト', connected: true, lastSync: '2026-03-24 09:30', connectedClients: 5, icon: 'freee' },
  { id: '2', name: 'マネーフォワード クラウド', description: '仕訳データの自動取込・同期。給与計算連携。', category: '会計ソフト', connected: true, lastSync: '2026-03-24 09:15', connectedClients: 4, icon: 'mf' },
  { id: '3', name: '弥生会計', description: '仕訳データのインポート・エクスポート。', category: '会計ソフト', connected: true, lastSync: '2026-03-23 18:00', connectedClients: 2, icon: 'yayoi' },
  { id: '4', name: 'Google Drive', description: 'ドキュメントの保存・共有。電帳法対応ストレージ。', category: 'ストレージ', connected: true, lastSync: '2026-03-24 10:00', connectedClients: 12, icon: 'gdrive' },
  { id: '5', name: 'クラウドサイン', description: '電子契約の締結・管理。顧問契約のオンライン締結。', category: '契約管理', connected: true, lastSync: '2026-03-22 14:30', connectedClients: 8, icon: 'cloudsign' },
  { id: '6', name: 'Stripe', description: '顧問料の自動課金・カード決済。', category: '決済', connected: false, lastSync: null, connectedClients: 0, icon: 'stripe' },
  { id: '7', name: 'ChatWork', description: 'クライアントとのメッセージ連携。通知配信。', category: 'コミュニケーション', connected: true, lastSync: '2026-03-24 10:05', connectedClients: 6, icon: 'chatwork' },
  { id: '8', name: 'Slack', description: '事務所内コミュニケーション。タスク通知連携。', category: 'コミュニケーション', connected: true, lastSync: '2026-03-24 10:10', connectedClients: 0, icon: 'slack' },
  { id: '9', name: 'LINE WORKS', description: 'クライアントとのLINE連携。書類提出リマインド。', category: 'コミュニケーション', connected: false, lastSync: null, connectedClients: 0, icon: 'lineworks' },
];
