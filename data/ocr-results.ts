export type OcrResult = {
  id: string;
  fileName: string;
  documentType: '領収書' | '請求書' | '通帳' | 'クレジット明細' | '納品書' | '契約書' | 'レシート';
  vendor: string;
  date: string;
  amount: number;
  account: string;
  invoiceNumber: string;
  status: '確認済' | '要確認' | '処理中';
  confidence: number;
  clientName: string;
};

export const ocrResults: OcrResult[] = [
  { id: '1', fileName: 'receipt_001.pdf', documentType: '領収書', vendor: '株式会社オフィスデポ', date: '2026-03-15', amount: 32400, account: '消耗品費', invoiceNumber: 'T1234567890123', status: '確認済', confidence: 98, clientName: '株式会社サクラテック' },
  { id: '2', fileName: 'invoice_002.pdf', documentType: '請求書', vendor: 'AWS Japan', date: '2026-03-01', amount: 156000, account: '通信費', invoiceNumber: 'T9876543210987', status: '確認済', confidence: 95, clientName: '株式会社サクラテック' },
  { id: '3', fileName: 'receipt_003.jpg', documentType: 'レシート', vendor: 'ヨドバシカメラ', date: '2026-03-10', amount: 54780, account: '消耗品費', invoiceNumber: 'T1111222233334', status: '要確認', confidence: 72, clientName: '株式会社マルハシ商事' },
  { id: '4', fileName: 'bank_004.pdf', documentType: '通帳', vendor: 'みずほ銀行', date: '2026-03-20', amount: 500000, account: '普通預金', invoiceNumber: '-', status: '処理中', confidence: 90, clientName: '株式会社ヤマダHD' },
  { id: '5', fileName: 'credit_005.csv', documentType: 'クレジット明細', vendor: '三井住友カード', date: '2026-03-18', amount: 89000, account: '旅費交通費', invoiceNumber: '-', status: '要確認', confidence: 65, clientName: '株式会社フジタ建設' },
  { id: '6', fileName: 'invoice_006.pdf', documentType: '請求書', vendor: '東京電力', date: '2026-03-05', amount: 45600, account: '水道光熱費', invoiceNumber: 'T5555666677778', status: '確認済', confidence: 99, clientName: '株式会社アオゾラ' },
  { id: '7', fileName: 'receipt_007.pdf', documentType: '領収書', vendor: 'タクシー', date: '2026-03-22', amount: 4500, account: '旅費交通費', invoiceNumber: '-', status: '処理中', confidence: 85, clientName: '合同会社ミライ' },
];
