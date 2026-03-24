/**
 * STREAMED連携 型定義
 *
 * STREAMEDは一般公開のREST APIを提供していない。
 * 連携方式:
 * 1. freee会計・MFクラウド会計とのAPI連携（STREAMED側の機能）
 * 2. CSVエクスポート/インポートによる会計ソフト連携
 *
 * 公式: https://streamedup.com/
 * ヘルプ: https://streamedup.com/help/10581
 *
 * 本モジュールはCSV連携の仕様を型定義として提供する。
 */

// ============================================================
// CSV仕訳データ（エクスポート形式）
// ============================================================

/**
 * STREAMED仕訳データ（CSVの1行に対応）
 * STREAMEDから各会計ソフト向けにエクスポートされるCSVのフィールド
 */
export interface StreamedJournalEntry {
  /** 仕訳日付 (yyyy/MM/dd or yyyy-MM-dd) */
  date: string;
  /** 借方勘定科目コード */
  debitAccountCode: string;
  /** 借方勘定科目名 */
  debitAccountName: string;
  /** 借方補助科目コード */
  debitSubAccountCode: string | null;
  /** 借方補助科目名 */
  debitSubAccountName: string | null;
  /** 借方部門コード */
  debitDepartmentCode: string | null;
  /** 借方部門名 */
  debitDepartmentName: string | null;
  /** 借方税区分 */
  debitTaxCategory: string | null;
  /** 借方金額 */
  debitAmount: number;
  /** 借方消費税額 */
  debitTaxAmount: number | null;
  /** 貸方勘定科目コード */
  creditAccountCode: string;
  /** 貸方勘定科目名 */
  creditAccountName: string;
  /** 貸方補助科目コード */
  creditSubAccountCode: string | null;
  /** 貸方補助科目名 */
  creditSubAccountName: string | null;
  /** 貸方部門コード */
  creditDepartmentCode: string | null;
  /** 貸方部門名 */
  creditDepartmentName: string | null;
  /** 貸方税区分 */
  creditTaxCategory: string | null;
  /** 貸方金額 */
  creditAmount: number;
  /** 貸方消費税額 */
  creditTaxAmount: number | null;
  /** 摘要 */
  description: string;
  /** 伝票番号 */
  voucherNumber: string | null;
  /** 仕訳メモ */
  memo: string | null;
}

// ============================================================
// 勘定科目マスタ（インポート/エクスポート）
// ============================================================

/** 勘定科目（CSVインポート/エクスポート用） */
export interface StreamedAccountItem {
  /** 勘定科目コード */
  code: string;
  /** 勘定科目名 */
  name: string;
  /** 科目カテゴリ (assets: 資産, liabilities: 負債, equity: 純資産, revenue: 収益, expense: 費用) */
  category: 'assets' | 'liabilities' | 'equity' | 'revenue' | 'expense';
  /** 税区分 */
  taxCategory: string | null;
  /** 補助科目一覧 */
  subAccounts: StreamedSubAccount[];
}

/** 補助科目 */
export interface StreamedSubAccount {
  /** 補助科目コード */
  code: string;
  /** 補助科目名 */
  name: string;
}

// ============================================================
// 対応会計ソフト
// ============================================================

/**
 * STREAMEDが対応する会計ソフト一覧
 * CSVの出力形式は会計ソフトごとに異なる
 */
export type SupportedAccountingSoftware =
  | 'freee'                // freee会計
  | 'moneyforward'         // MFクラウド会計
  | 'yayoi'                // 弥生会計
  | 'tkcfx'                // TKC FXシリーズ
  | 'jdl'                  // JDL
  | 'pca'                  // PCA会計
  | 'obic'                 // OBIC7
  | 'miroku'               // ミロク情報サービス
  | 'epson'                // エプソン財務応援
  | 'sorimachi'            // ソリマチ会計王
  | 'ohken'                // 応研大蔵大臣
  | 'ics'                  // ICSパートナーズ
  | 'freeway'              // フリーウェイ経理
  | 'a-saas'               // A-SaaS
  | 'bugyo'                // 奉行シリーズ
  | 'sap'                  // SAP
  | 'generic_csv'          // 汎用CSV
  | 'generic_tsv';         // 汎用TSV

// ============================================================
// CSVファイル情報
// ============================================================

/** CSVエクスポートファイル情報 */
export interface StreamedCsvExport {
  /** ファイル名 */
  fileName: string;
  /** 対象会計ソフト */
  targetSoftware: SupportedAccountingSoftware;
  /** ファイル形式 (csv, txt, slp) */
  fileExtension: 'csv' | 'txt' | 'slp';
  /** 文字コード (Shift_JIS, UTF-8) */
  encoding: 'Shift_JIS' | 'UTF-8';
  /** 対象期間（開始） */
  periodFrom: string;
  /** 対象期間（終了） */
  periodTo: string;
  /** 仕訳件数 */
  entryCount: number;
  /** CSVコンテンツ */
  content: string;
}

/** CSVインポートファイル情報（過去仕訳参照用） */
export interface StreamedCsvImport {
  /** ファイル名 */
  fileName: string;
  /** 元の会計ソフト */
  sourceSoftware: SupportedAccountingSoftware;
  /** 文字コード */
  encoding: 'Shift_JIS' | 'UTF-8';
  /** CSVコンテンツ */
  content: string;
}

// ============================================================
// API連携ステータス（freee/MF対応）
// ============================================================

/** API連携ステータス */
export interface StreamedApiSyncStatus {
  /** 連携先サービス */
  service: 'freee' | 'moneyforward';
  /** 連携ステータス (connected: 接続済, disconnected: 未接続, error: エラー) */
  status: 'connected' | 'disconnected' | 'error';
  /** 最終同期日時 */
  lastSyncAt: string | null;
  /** 同期済み仕訳数 */
  syncedCount: number;
  /** エラーメッセージ */
  errorMessage: string | null;
}
