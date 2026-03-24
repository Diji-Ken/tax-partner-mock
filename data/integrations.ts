export type Integration = {
  id: string;
  name: string;
  description: string;
  category: '会計ソフト' | '給与・労務' | '請求・経費' | 'ストレージ' | '契約管理' | '決済' | 'コミュニケーション' | '税務申告' | '記帳・OCR' | '公的API' | '補助金DB';
  connected: boolean;
  lastSync: string | null;
  connectedClients: number;
  icon: string;
};

export const integrations: Integration[] = [
  // === 会計ソフト ===
  { id: '1', name: 'freee会計', description: '仕訳データの自動取込・同期。取引先管理、試算表取得。OAuth2連携。', category: '会計ソフト', connected: true, lastSync: '2026-03-24 09:30', connectedClients: 5, icon: 'freee' },
  { id: '2', name: 'マネーフォワード クラウド会計', description: '仕訳データの自動取込・同期。勘定科目・部門管理。OAuth2連携。', category: '会計ソフト', connected: true, lastSync: '2026-03-24 09:15', connectedClients: 4, icon: 'mf' },
  { id: '3', name: '弥生会計 / Misoca', description: '仕訳データのCSVインポート・エクスポート。Misoca APIで請求書連携。', category: '会計ソフト', connected: true, lastSync: '2026-03-23 18:00', connectedClients: 2, icon: 'yayoi' },

  // === 給与・労務 ===
  { id: '10', name: 'freee人事労務', description: '従業員管理・給与明細・賞与・勤怠データ取得。年末調整連携。', category: '給与・労務', connected: true, lastSync: '2026-03-24 08:00', connectedClients: 3, icon: 'freee-hr' },
  { id: '11', name: 'MFクラウド給与', description: '給与計算・年末調整・源泉徴収票。社会保険料計算連携。', category: '給与・労務', connected: false, lastSync: null, connectedClients: 0, icon: 'mf-payroll' },

  // === 請求・経費 ===
  { id: '12', name: 'MFクラウド請求書', description: '請求書・見積書・納品書の作成・送付・入金管理。v3.1.0インボイス対応。', category: '請求・経費', connected: true, lastSync: '2026-03-24 07:45', connectedClients: 4, icon: 'mf-invoice' },
  { id: '13', name: 'MFクラウド経費', description: '経費申請・承認ワークフロー。領収書アップロード・仕訳連携。', category: '請求・経費', connected: false, lastSync: null, connectedClients: 0, icon: 'mf-expense' },

  // === 公的API ===
  { id: '14', name: '国税庁 インボイスAPI', description: '適格請求書発行事業者の登録番号検証。法人番号・更新日での検索。', category: '公的API', connected: true, lastSync: '2026-03-24 06:00', connectedClients: 12, icon: 'nta' },
  { id: '15', name: '国税庁 法人番号API', description: '法人番号の検索・法人情報取得。取引先の実在確認に利用。', category: '公的API', connected: true, lastSync: '2026-03-24 06:00', connectedClients: 12, icon: 'nta-corp' },

  // === 補助金DB ===
  { id: '19', name: 'スマート補助金', description: '75,818件の補助金DB。自治体制度を含む日本最大級の補助金検索。都道府県・市区町村レベルの制度も網羅。', category: '補助金DB', connected: true, lastSync: '2026-03-24 06:00', connectedClients: 12, icon: 'smart-hojokin' },
  { id: '20', name: '助成金なう', description: '国・自治体14.5万件＋財団9,800件の助成金・補助金DB。月1,500〜2,000件更新。過去採択企業83万社DB付き。', category: '補助金DB', connected: false, lastSync: null, connectedClients: 0, icon: 'joseikin-now' },
  { id: '21', name: '補助金ポータル', description: '3万件超の補助金情報。士業向けパートナー連携あり（shigyo-portal.jp）。月間100万人利用。', category: '補助金DB', connected: false, lastSync: null, connectedClients: 0, icon: 'hojyokin-portal' },

  // === 税務申告 ===
  { id: '16', name: 'e-Tax連携', description: '国税（法人税・所得税・消費税）の電子申告。XBRL形式データ生成。', category: '税務申告', connected: false, lastSync: null, connectedClients: 0, icon: 'etax' },
  { id: '17', name: 'eLTAX連携', description: '地方税（住民税・事業税）の電子申告。特別徴収税額通知の電子化。', category: '税務申告', connected: false, lastSync: null, connectedClients: 0, icon: 'eltax' },

  // === 記帳・OCR ===
  { id: '18', name: 'STREAMED', description: 'AI-OCR記帳データの取込。領収書・通帳の自動データ化。CSV連携。', category: '記帳・OCR', connected: false, lastSync: null, connectedClients: 0, icon: 'streamed' },

  // === ストレージ ===
  { id: '4', name: 'Google Drive', description: 'ドキュメントの保存・共有。電帳法対応ストレージ。フォルダ自動作成。', category: 'ストレージ', connected: true, lastSync: '2026-03-24 10:00', connectedClients: 12, icon: 'gdrive' },

  // === 契約管理 ===
  { id: '5', name: 'クラウドサイン', description: '電子契約の締結・管理。顧問契約のオンライン締結。Webhook対応。', category: '契約管理', connected: true, lastSync: '2026-03-22 14:30', connectedClients: 8, icon: 'cloudsign' },

  // === 決済 ===
  { id: '6', name: 'Stripe', description: '顧問料の自動課金・カード決済。サブスクリプション管理。', category: '決済', connected: false, lastSync: null, connectedClients: 0, icon: 'stripe' },

  // === コミュニケーション ===
  { id: '7', name: 'ChatWork', description: 'クライアントとのメッセージ連携。タスク通知・ファイル共有。', category: 'コミュニケーション', connected: true, lastSync: '2026-03-24 10:05', connectedClients: 6, icon: 'chatwork' },
  { id: '8', name: 'Slack', description: '事務所内コミュニケーション。タスク完了・期限通知の自動配信。', category: 'コミュニケーション', connected: true, lastSync: '2026-03-24 10:10', connectedClients: 0, icon: 'slack' },
  { id: '9', name: 'LINE WORKS', description: 'クライアントとのLINE連携。書類提出リマインド・ボット対応。', category: 'コミュニケーション', connected: false, lastSync: null, connectedClients: 0, icon: 'lineworks' },
];
