export type SubsidySource = 'jgrants' | 'smart-hojokin' | 'jnet21' | 'mirasapo' | 'joseikin-now' | 'hojyokin-portal' | 'manual';

export type Subsidy = {
  id: string;
  name: string;
  category: '補助金' | '税制優遇' | '共済';
  description: string;
  maxAmount: string;
  eligibility: string;
  deadline: string;
  status: '募集中' | '近日公開' | '税制' | '共済';
  region: '全国' | '埼玉県' | '東京都' | '大阪府' | '愛知県' | '福岡県';
  targetIndustry: string;
  targetScale: string;
  url: string;
  source: SubsidySource;
};

export const subsidies: Subsidy[] = [
  // === 全国制度 ===
  { id: '1', name: 'IT導入補助金2026', category: '補助金', description: 'ITツール導入で業務効率化を図る中小企業を支援。会計ソフト・ECサイト等が対象。', maxAmount: '最大450万円', eligibility: '中小企業・小規模事業者', deadline: '2026-06-30', status: '募集中', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://it-shien.smrj.go.jp/', source: 'jgrants' },
  { id: '2', name: '小規模事業者持続化補助金', category: '補助金', description: '販路開拓や業務効率化の取り組みを支援。チラシ・HP・展示会出展等が対象。', maxAmount: '最大200万円', eligibility: '小規模事業者', deadline: '2026-05-15', status: '募集中', region: '全国', targetIndustry: '全業種', targetScale: '小規模', url: 'https://jizokukahojokin.info/', source: 'jgrants' },
  { id: '3', name: 'ものづくり補助金', category: '補助金', description: '革新的な製品・サービスの開発や生産プロセスの改善を支援。', maxAmount: '最大1,250万円', eligibility: '中小企業', deadline: '2026-07-31', status: '募集中', region: '全国', targetIndustry: '製造業・サービス業', targetScale: '中小企業', url: 'https://portal.monodukuri-hojo.jp/', source: 'jgrants' },
  { id: '4', name: '事業再構築補助金', category: '補助金', description: '新分野展開、業態転換等の事業再構築を支援。', maxAmount: '最大1億円', eligibility: '中小企業', deadline: '2026-09-30', status: '近日公開', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://jigyou-saikouchiku.go.jp/', source: 'jgrants' },
  { id: '5', name: '中小企業省力化投資補助金', category: '補助金', description: 'IoT・ロボット等の汎用製品導入による省力化を支援。カタログ型で簡易申請。', maxAmount: '最大1,500万円', eligibility: '中小企業・小規模事業者', deadline: '2026-09-30', status: '募集中', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://shoryokuka.smrj.go.jp/', source: 'jnet21' },

  // === 自治体独自制度 ===
  { id: '6', name: '埼玉県DX推進補助金', category: '補助金', description: '埼玉県内の中小企業のDX推進を支援。専門家派遣・ツール導入費用が対象。AI・RPA導入も対象。', maxAmount: '最大100万円', eligibility: '埼玉県内の中小企業', deadline: '2026-08-31', status: '募集中', region: '埼玉県', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://www.pref.saitama.lg.jp/', source: 'smart-hojokin' },
  { id: '7', name: '東京都 中小企業デジタルツール導入促進助成金', category: '補助金', description: 'ERPやグループウェア等のデジタルツール導入費用を助成。導入コンサルティング費用も対象。', maxAmount: '最大100万円（補助率1/2）', eligibility: '東京都内の中小企業', deadline: '2026-07-31', status: '募集中', region: '東京都', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://www.tokyo-kosha.or.jp/', source: 'smart-hojokin' },
  { id: '8', name: '大阪府 中小企業DX推進プロジェクト補助金', category: '補助金', description: 'データ利活用やAI導入によるDXプロジェクトを支援。伴走支援型で専門家のアドバイスも受けられる。', maxAmount: '最大200万円（補助率2/3）', eligibility: '大阪府内の中小企業', deadline: '2026-06-30', status: '募集中', region: '大阪府', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://www.pref.osaka.lg.jp/', source: 'joseikin-now' },
  { id: '9', name: '愛知県 スタートアップ支援補助金', category: '補助金', description: 'STATION Aiを拠点とした愛知県のスタートアップ支援。事業化フェーズの開発費・実証費を補助。', maxAmount: '最大300万円（補助率2/3）', eligibility: '愛知県内のスタートアップ企業', deadline: '2026-09-30', status: '募集中', region: '愛知県', targetIndustry: 'IT・テック', targetScale: 'スタートアップ', url: 'https://www.pref.aichi.jp/', source: 'hojyokin-portal' },
  { id: '10', name: '福岡県 中小企業生産性向上支援補助金', category: '補助金', description: '福岡県内の中小企業の生産性向上に資する設備投資を支援。IoTセンサー・自動化設備等が対象。', maxAmount: '最大150万円（補助率1/2）', eligibility: '福岡県内の中小企業', deadline: '2026-08-31', status: '募集中', region: '福岡県', targetIndustry: '製造業・サービス業', targetScale: '中小企業', url: 'https://www.pref.fukuoka.lg.jp/', source: 'smart-hojokin' },

  // === 税制優遇 ===
  { id: '11', name: '中小企業投資促進税制', category: '税制優遇', description: '機械装置等の取得に対して特別償却30%または税額控除7%を適用。', maxAmount: '特別償却30%/税額控除7%', eligibility: '青色申告中小企業', deadline: '2027-03-31', status: '税制', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: '', source: 'manual' },
  { id: '12', name: '所得拡大促進税制', category: '税制優遇', description: '従業員の給与を一定以上増加させた場合に税額控除を適用。', maxAmount: '増加額の15-40%控除', eligibility: '青色申告法人', deadline: '2027-03-31', status: '税制', region: '全国', targetIndustry: '全業種', targetScale: '全規模', url: '', source: 'manual' },
  { id: '13', name: '中小企業経営強化税制', category: '税制優遇', description: '経営力向上計画の認定を受けた中小企業が設備取得時に即時償却または税額控除10%を適用。', maxAmount: '即時償却/税額控除10%', eligibility: '認定中小企業', deadline: '2027-03-31', status: '税制', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: '', source: 'mirasapo' },

  // === 共済 ===
  { id: '14', name: '小規模企業共済', category: '共済', description: '個人事業主や小規模企業の経営者のための退職金制度。掛金が全額所得控除。', maxAmount: '月額7万円まで', eligibility: '個人事業主・小規模企業役員', deadline: '随時加入可', status: '共済', region: '全国', targetIndustry: '全業種', targetScale: '小規模', url: 'https://www.smrj.go.jp/kyosai/', source: 'manual' },
  { id: '15', name: '経営セーフティ共済（倒産防止共済）', category: '共済', description: '取引先の倒産時に無担保・無保証で掛金の最大10倍の借入が可能。掛金は損金算入。', maxAmount: '月額20万円まで（最大800万円）', eligibility: '中小企業・個人事業主', deadline: '随時加入可', status: '共済', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://www.smrj.go.jp/kyosai/tkyosai/', source: 'manual' },
];

/** データソース別の表示名 */
export const sourceLabels: Record<SubsidySource, string> = {
  'jgrants': 'jGrants',
  'smart-hojokin': 'スマート補助金',
  'jnet21': 'J-Net21',
  'mirasapo': 'ミラサポ',
  'joseikin-now': '助成金なう',
  'hojyokin-portal': '補助金ポータル',
  'manual': '手動登録',
};

/** データソース別のバッジカラー */
export const sourceBadgeColors: Record<SubsidySource, string> = {
  'jgrants': 'bg-blue-100 text-blue-700',
  'smart-hojokin': 'bg-emerald-100 text-emerald-700',
  'jnet21': 'bg-indigo-100 text-indigo-700',
  'mirasapo': 'bg-cyan-100 text-cyan-700',
  'joseikin-now': 'bg-amber-100 text-amber-700',
  'hojyokin-portal': 'bg-rose-100 text-rose-700',
  'manual': 'bg-gray-100 text-gray-600',
};

/** データソース別の件数サマリー（参考値） */
export const sourceDbCounts: Record<SubsidySource, string> = {
  'jgrants': '約150件（受付中）',
  'smart-hojokin': '75,818件',
  'jnet21': '200件以上',
  'mirasapo': '100件以上',
  'joseikin-now': '155,001件',
  'hojyokin-portal': '30,000件以上',
  'manual': '-',
};
