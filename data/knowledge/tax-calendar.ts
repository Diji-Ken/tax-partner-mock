export type TaxCalendarItem = {
  id: string;
  month: number;
  title: string;
  description: string;
  deadline: string;
  category: '法人税' | '消費税' | '源泉所得税' | '住民税' | '年末調整' | 'その他';
};

export const taxCalendar: TaxCalendarItem[] = [
  { id: '1', month: 1, title: '法定調書の提出', description: '給与所得の源泉徴収票等の法定調書合計表', deadline: '1月31日', category: 'その他' },
  { id: '2', month: 1, title: '償却資産の申告', description: '固定資産税の償却資産申告', deadline: '1月31日', category: 'その他' },
  { id: '3', month: 3, title: '12月決算法人の確定申告', description: '法人税・消費税の確定申告', deadline: '2月末日', category: '法人税' },
  { id: '4', month: 3, title: '個人の確定申告', description: '所得税・復興特別所得税の確定申告', deadline: '3月15日', category: 'その他' },
  { id: '5', month: 5, title: '3月決算法人の確定申告', description: '法人税・消費税の確定申告', deadline: '5月末日', category: '法人税' },
  { id: '6', month: 6, title: '住民税特別徴収税額の通知', description: '市区町村から届く住民税額の確認', deadline: '6月', category: '住民税' },
  { id: '7', month: 7, title: '源泉所得税の納付（納期特例）', description: '1月〜6月分の源泉所得税', deadline: '7月10日', category: '源泉所得税' },
  { id: '8', month: 11, title: '年末調整の準備', description: '扶養控除等申告書・保険料控除申告書の配布', deadline: '11月中旬', category: '年末調整' },
  { id: '9', month: 12, title: '年末調整の実施', description: '年末調整計算・源泉徴収票の作成', deadline: '12月最終給与日', category: '年末調整' },
  { id: '10', month: 1, title: '源泉所得税の納付（納期特例）', description: '7月〜12月分の源泉所得税', deadline: '1月20日', category: '源泉所得税' },
];
