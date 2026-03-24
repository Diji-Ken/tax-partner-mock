/**
 * e-Tax連携 型定義
 *
 * e-Taxは通常のREST APIではなく、以下の連携方式を採用:
 * 1. e-Taxソフト(WEB版) - ブラウザベースの操作
 * 2. XBRL形式の申告データ作成 - XML/XBRLファイルの生成と送信
 * 3. クラウドサービス連携API - デジタル庁が仕様を公開
 *
 * 公式: https://www.e-tax.nta.go.jp/
 * 開発者向け: https://www.e-tax.nta.go.jp/shiyo/index.htm
 */

// ============================================================
// XBRL申告データ
// ============================================================

/** XBRL申告データのメタ情報 */
export interface XbrlDocument {
  /** 申告種別 (hojinzei: 法人税, shotokuzei: 所得税, shohizei: 消費税) */
  taxType: 'hojinzei' | 'shotokuzei' | 'shohizei';
  /** 事業年度開始日 (yyyy-MM-dd) */
  fiscalYearStart: string;
  /** 事業年度終了日 (yyyy-MM-dd) */
  fiscalYearEnd: string;
  /** 法人番号（13桁） */
  corporateNumber: string;
  /** 法人名 */
  corporateName: string;
  /** 代表者氏名 */
  representativeName: string;
  /** 提出先税務署コード */
  taxOfficeCode: string;
  /** 提出先税務署名 */
  taxOfficeName: string;
  /** XBRLバージョン (2.1) */
  xbrlVersion: '2.1';
  /** タクソノミバージョン */
  taxonomyVersion: string;
  /** 申告データ（XMLテキスト） */
  xbrlContent: string;
}

/** 財務諸表データ（XBRL形式） */
export interface FinancialStatementXbrl {
  /** 書類種別 (bs: 貸借対照表, pl: 損益計算書, ss: 株主資本等変動計算書) */
  documentType: 'bs' | 'pl' | 'ss' | 'cf' | 'notes';
  /** 事業年度 */
  fiscalYear: string;
  /** XBRLコンテンツ（XML形式のテキスト） */
  content: string;
  /** ファイル名 */
  fileName: string;
}

/** CSV形式の財務諸表データ（2020年4月以降対応） */
export interface FinancialStatementCsv {
  /** 書類種別 */
  documentType: 'bs' | 'pl' | 'ss' | 'cf' | 'notes';
  /** CSVコンテンツ */
  content: string;
  /** ファイル名 */
  fileName: string;
  /** 文字コード (UTF-8) */
  encoding: 'UTF-8';
}

// ============================================================
// 受付結果
// ============================================================

/** e-Tax送信結果 */
export interface EtaxSubmissionResult {
  /** 受付番号 */
  receiptNumber: string;
  /** 受付日時 */
  receiptDate: string;
  /** 受付結果 (accepted: 受付完了, rejected: エラー) */
  status: 'accepted' | 'rejected';
  /** エラーメッセージ一覧 */
  errors: EtaxError[];
  /** 利用者識別番号 */
  userId: string;
}

/** e-Taxエラー */
export interface EtaxError {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** エラー箇所 */
  location: string | null;
}

/** 受付番号管理レコード */
export interface EtaxReceiptRecord {
  /** 受付番号 */
  receiptNumber: string;
  /** 提出日 */
  submissionDate: string;
  /** 申告種別 */
  taxType: string;
  /** 事業年度 */
  fiscalYear: string;
  /** 法人番号 */
  corporateNumber: string;
  /** 法人名 */
  corporateName: string;
  /** ステータス */
  status: 'submitted' | 'accepted' | 'rejected' | 'pending';
  /** メモ */
  memo: string | null;
}

// ============================================================
// クラウドサービス連携
// ============================================================

/** クラウドサービス連携API（デジタル庁仕様）リクエスト */
export interface CloudServiceApiRequest {
  /** 利用者識別番号 */
  userId: string;
  /** 暗証番号（ハッシュ化推奨） */
  password: string;
  /** 申告データ種別 */
  documentType: string;
  /** 申告データ（Base64エンコード） */
  documentData: string;
  /** 電子署名データ（Base64エンコード） */
  signatureData: string;
  /** 提出先税務署コード */
  taxOfficeCode: string;
}

/** クラウドサービス連携APIレスポンス */
export interface CloudServiceApiResponse {
  /** 受付結果 */
  result: 'success' | 'error';
  /** 受付番号 */
  receiptNumber: string | null;
  /** メッセージ */
  message: string;
  /** エラー詳細 */
  errors: EtaxError[];
}

// ============================================================
// 法定調書
// ============================================================

/** 法定調書データ */
export interface StatutoryReport {
  /** 報告書種別 */
  reportType: string;
  /** 提出年度 */
  year: number;
  /** 提出者（法人番号） */
  submitterCorporateNumber: string;
  /** 提出者名 */
  submitterName: string;
  /** データ形式 (xml, csv) */
  format: 'xml' | 'csv';
  /** データ内容 */
  content: string;
}
