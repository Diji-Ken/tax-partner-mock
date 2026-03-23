export type Subsidy = {
  id: string;
  name: string;
  category: '補助金' | '税制優遇' | '共済';
  description: string;
  maxAmount: string;
  eligibility: string;
  deadline: string;
  status: '募集中' | '近日公開' | '税制' | '共済';
  region: '全国' | '埼玉県';
  targetIndustry: string;
  targetScale: string;
  url: string;
};

export const subsidies: Subsidy[] = [
  { id: '1', name: 'IT導入補助金2026', category: '補助金', description: 'ITツール導入で業務効率化を図る中小企業を支援。会計ソフト・ECサイト等が対象。', maxAmount: '最大450万円', eligibility: '中小企業・小規模事業者', deadline: '2026-06-30', status: '募集中', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://it-shien.smrj.go.jp/' },
  { id: '2', name: '小規模事業者持続化補助金', category: '補助金', description: '販路開拓や業務効率化の取り組みを支援。チラシ・HP・展示会出展等が対象。', maxAmount: '最大200万円', eligibility: '小規模事業者', deadline: '2026-05-15', status: '募集中', region: '全国', targetIndustry: '全業種', targetScale: '小規模', url: 'https://jizokukahojokin.info/' },
  { id: '3', name: 'ものづくり補助金', category: '補助金', description: '革新的な製品・サービスの開発や生産プロセスの改善を支援。', maxAmount: '最大1,250万円', eligibility: '中小企業', deadline: '2026-07-31', status: '募集中', region: '全国', targetIndustry: '製造業・サービス業', targetScale: '中小企業', url: 'https://portal.monodukuri-hojo.jp/' },
  { id: '4', name: '事業再構築補助金', category: '補助金', description: '新分野展開、業態転換等の事業再構築を支援。', maxAmount: '最大1億円', eligibility: '中小企業', deadline: '2026-09-30', status: '近日公開', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://jigyou-saikouchiku.go.jp/' },
  { id: '5', name: '埼玉DX推進補助金', category: '補助金', description: '埼玉県内の中小企業のDX推進を支援。専門家派遣・ツール導入費用が対象。', maxAmount: '最大100万円', eligibility: '埼玉県内の中小企業', deadline: '2026-08-31', status: '募集中', region: '埼玉県', targetIndustry: '全業種', targetScale: '中小企業', url: 'https://www.pref.saitama.lg.jp/' },
  { id: '6', name: '中小企業投資促進税制', category: '税制優遇', description: '機械装置等の取得に対して特別償却30%または税額控除7%を適用。', maxAmount: '特別償却30%/税額控除7%', eligibility: '青色申告中小企業', deadline: '2027-03-31', status: '税制', region: '全国', targetIndustry: '全業種', targetScale: '中小企業', url: '' },
  { id: '7', name: '所得拡大促進税制', category: '税制優遇', description: '従業員の給与を一定以上増加させた場合に税額控除を適用。', maxAmount: '増加額の15-40%控除', eligibility: '青色申告法人', deadline: '2027-03-31', status: '税制', region: '全国', targetIndustry: '全業種', targetScale: '全規模', url: '' },
  { id: '8', name: '小規模企業共済', category: '共済', description: '個人事業主や小規模企業の経営者のための退職金制度。掛金が全額所得控除。', maxAmount: '月額7万円まで', eligibility: '個人事業主・小規模企業役員', deadline: '随時加入可', status: '共済', region: '全国', targetIndustry: '全業種', targetScale: '小規模', url: 'https://www.smrj.go.jp/kyosai/' },
];
