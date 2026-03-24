/**
 * MFクラウド経費 API 型定義
 * 公式: https://expense.moneyforward.com/api/index.html
 * GitHub: https://github.com/moneyforward/expense-api-doc
 * Base URL: https://expense.moneyforward.com/api/external/v1
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface MfExpenseTokenResponse {
  /** アクセストークン */
  access_token: string;
  /** トークン種別 (Bearer) */
  token_type: string;
  /** 有効期限（秒） */
  expires_in: number;
  /** リフレッシュトークン */
  refresh_token: string;
  /** スコープ */
  scope: string;
}

// ============================================================
// 事業所 (Offices)
// ============================================================

/** 事業所一覧レスポンス */
export interface OfficesIndexResponse {
  offices: MfExpenseOffice[];
}

/** 事業所 */
export interface MfExpenseOffice {
  /** 事業所ID */
  id: string;
  /** 事業所名 */
  name: string;
}

// ============================================================
// 経費申請 (Expense Reports)
// ============================================================

/** 経費申請一覧レスポンス */
export interface ExReportsIndexResponse {
  ex_reports: ExReport[];
}

/** 経費申請詳細レスポンス */
export interface ExReportResponse {
  ex_report: ExReport;
}

/** 経費申請 */
export interface ExReport {
  /** 経費申請ID */
  id: string;
  /** 事業所ID */
  office_id: string;
  /** 申請者ID */
  applicant_id: string;
  /** 申請者名 */
  applicant_name: string;
  /** 申請番号 */
  number: string | null;
  /** タイトル */
  title: string;
  /** ステータス (draft: 下書き, applying: 申請中, approved: 承認済, rejected: 差戻し, exported: 出力済) */
  status: 'draft' | 'applying' | 'approved' | 'rejected' | 'exported';
  /** 合計金額 */
  total_amount: number;
  /** 申請日 (yyyy-MM-dd) */
  application_date: string | null;
  /** 承認日 (yyyy-MM-dd) */
  approved_date: string | null;
  /** 経費明細一覧 */
  ex_transactions: ExTransaction[];
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 経費明細 */
export interface ExTransaction {
  /** 経費明細ID */
  id: string;
  /** 経費日 (yyyy-MM-dd) */
  date: string;
  /** 金額 */
  amount: number;
  /** 消費税額 */
  tax_amount: number | null;
  /** 摘要 */
  description: string | null;
  /** 経費科目名 */
  ex_item_name: string | null;
  /** 部門名 */
  department_name: string | null;
  /** 取引先名 */
  partner_name: string | null;
  /** 領収書添付フラグ */
  has_receipt: boolean;
  /** 交通費フラグ */
  is_transportation: boolean;
  /** 出発地 */
  from_station: string | null;
  /** 到着地 */
  to_station: string | null;
}

// ============================================================
// 承認待ち経費 (Approving Reports)
// ============================================================

/** 承認待ち経費一覧レスポンス */
export interface ApprovingExReportsIndexResponse {
  approving_ex_reports: ExReport[];
}

// ============================================================
// 仕訳データ (Journals)
// ============================================================

/** 仕訳データ一覧レスポンス */
export interface ExJournalsIndexResponse {
  ex_journals: ExJournal[];
}

/** 仕訳データ */
export interface ExJournal {
  /** 仕訳ID */
  id: string;
  /** 経費申請ID */
  ex_report_id: string;
  /** 仕訳日 (yyyy-MM-dd) */
  journal_date: string;
  /** 借方勘定科目コード */
  debit_account_code: string;
  /** 借方勘定科目名 */
  debit_account_name: string;
  /** 借方補助科目コード */
  debit_sub_account_code: string | null;
  /** 借方補助科目名 */
  debit_sub_account_name: string | null;
  /** 貸方勘定科目コード */
  credit_account_code: string;
  /** 貸方勘定科目名 */
  credit_account_name: string;
  /** 貸方補助科目コード */
  credit_sub_account_code: string | null;
  /** 貸方補助科目名 */
  credit_sub_account_name: string | null;
  /** 金額 */
  amount: number;
  /** 消費税額 */
  tax_amount: number | null;
  /** 摘要 */
  description: string | null;
  /** 部門コード */
  department_code: string | null;
  /** 部門名 */
  department_name: string | null;
}

// ============================================================
// 領収書 (Receipts)
// ============================================================

/** 領収書アップロードレスポンス */
export interface ReceiptUploadResponse {
  /** アップロードされたファイルID */
  id: string;
  /** ファイル名 */
  file_name: string;
  /** MIMEタイプ */
  content_type: string;
  /** ファイルサイズ (bytes) */
  file_size: number;
  /** アップロード日時 */
  created_at: string;
}
