export type OfficeRule = {
  id: string;
  title: string;
  category: '仕訳ルール' | 'チェックリスト' | '報酬' | '通知';
  description: string;
  condition?: string;
  action?: string;
  enabled: boolean;
};

export const officeRules: OfficeRule[] = [
  { id: '1', title: '交際費の上限チェック', category: '仕訳ルール', description: '1件5万円以上の交際費は要確認フラグを付ける', condition: '勘定科目=交際費 AND 金額>=50000', action: '要確認フラグを付与', enabled: true },
  { id: '2', title: '旅費の領収書必須', category: '仕訳ルール', description: '旅費交通費の1回3万円以上は領収書を必須にする', condition: '勘定科目=旅費交通費 AND 金額>=30000', action: '領収書未添付アラート', enabled: true },
  { id: '3', title: '月次処理チェック', category: 'チェックリスト', description: '月次処理完了時に必ず確認する項目リスト', enabled: true },
  { id: '4', title: '決算チェック', category: 'チェックリスト', description: '決算時に確認する項目リスト', enabled: true },
  { id: '5', title: 'タスク期限通知', category: '通知', description: 'タスク期限の3日前にリマインド通知を送信', enabled: true },
  { id: '6', title: '未入金アラート', category: '通知', description: '支払期限を過ぎた請求書のアラート通知', enabled: true },
  { id: '7', title: 'OCR確認通知', category: '通知', description: 'OCR処理で確信度80%未満の仕訳を通知', enabled: true },
  { id: '8', title: '月次完了報告', category: '通知', description: '月次処理完了時にクライアントへ自動通知', enabled: false },
  { id: '9', title: '新規問い合わせ通知', category: '通知', description: '新規問い合わせ受信時にSlackへ通知', enabled: true },
];
