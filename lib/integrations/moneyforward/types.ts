/**
 * マネーフォワード クラウド会計 API 型定義
 *
 * 公式ドキュメント:
 * - 会計API: https://developer.moneyforward.com/
 * - 請求書API: https://invoice.moneyforward.com/docs/api/v3/index.html
 * - 経費API: https://expense.moneyforward.com/api/index.html
 * - GitHub: https://github.com/moneyforward/expense-api-doc
 *
 * Base URL (会計): https://api.moneyforward.com/api/v3
 * Base URL (請求書): https://invoice.moneyforward.com/api/v3
 * Base URL (経費): https://expense.moneyforward.com/api/external/v1
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface MFTokenResponse {
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
  /** トークン発行時刻（UNIX timestamp） */
  created_at: number;
}

/** トークン情報レスポンス */
export interface MFTokenInfoResponse {
  /** リソースオーナーID */
  resource_owner_id: string;
  /** スコープ配列 */
  scope: string[];
  /** 有効期限（秒） */
  expires_in: number;
  /** アプリケーション情報 */
  application: {
    uid: string;
  };
  /** 作成日時（UNIX timestamp） */
  created_at: number;
}

// ============================================================
// 事業所 (Offices)
// ============================================================

/** 事業所一覧レスポンス */
export interface MFOfficesResponse {
  offices: MFOffice[];
}

/** 事業所 */
export interface MFOffice {
  /** 事業所ID */
  id: string;
  /** 事業所名 */
  name: string;
  /** 事業所名（カナ） */
  name_kana: string | null;
  /** 郵便番号 */
  zip: string | null;
  /** 都道府県 */
  prefecture: string | null;
  /** 住所1 */
  address1: string | null;
  /** 住所2 */
  address2: string | null;
  /** 電話番号 */
  tel: string | null;
  /** FAX番号 */
  fax: string | null;
  /** 法人番号 */
  office_type: string;
  /** 決算月 */
  end_of_fiscal_year_month: number;
  /** 業種 */
  industry_class: string | null;
  /** 設立日 */
  founded_date: string | null;
  /** 役割 */
  role: string;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

// ============================================================
// 仕訳 (Journal Entries)
// ============================================================

/** 仕訳一覧レスポンス */
export interface MFJournalEntriesResponse {
  journal_entries: MFJournalEntry[];
  pagination: MFPagination;
}

/** 仕訳詳細レスポンス */
export interface MFJournalEntryResponse {
  journal_entry: MFJournalEntry;
}

/** ページネーション情報 */
export interface MFPagination {
  /** 総件数 */
  total_count: number;
  /** 現在のページ */
  current_page: number;
  /** 1ページあたりの件数 */
  per_page: number;
  /** 総ページ数 */
  total_pages: number;
}

/** 仕訳 */
export interface MFJournalEntry {
  /** 仕訳ID */
  id: string;
  /** 事業所ID */
  office_id: string;
  /** 発生日 */
  issue_date: string;
  /** 仕訳番号 */
  journal_number: number | null;
  /** 仕訳行 */
  details: MFJournalEntryDetail[];
  /** メモ */
  description: string | null;
  /** 調整仕訳かどうか */
  adjustment: boolean;
  /** ステータス */
  status: string;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 仕訳行 */
export interface MFJournalEntryDetail {
  /** 明細ID */
  id: string;
  /** 貸借区分 (debit: 借方, credit: 貸方) */
  entry_side: 'debit' | 'credit';
  /** 勘定科目ID */
  account_item_id: string;
  /** 勘定科目名 */
  account_item_name: string | null;
  /** 補助科目ID */
  sub_account_item_id: string | null;
  /** 補助科目名 */
  sub_account_item_name: string | null;
  /** 金額 */
  amount: number;
  /** 税区分 */
  tax_classification: string | null;
  /** 消費税額 */
  tax_amount: number;
  /** 取引先ID */
  partner_id: string | null;
  /** 取引先名 */
  partner_name: string | null;
  /** 部門ID */
  department_id: string | null;
  /** 部門名 */
  department_name: string | null;
  /** 品目ID */
  item_id: string | null;
  /** 品目名 */
  item_name: string | null;
  /** メモ */
  description: string | null;
}

/** 仕訳作成パラメータ */
export interface MFJournalEntryCreateParams {
  /** 事業所ID */
  office_id: string;
  /** 発生日 */
  issue_date: string;
  /** 仕訳行 */
  details: MFJournalEntryDetailParams[];
  /** メモ */
  description?: string;
  /** 調整仕訳かどうか */
  adjustment?: boolean;
}

/** 仕訳行作成パラメータ */
export interface MFJournalEntryDetailParams {
  /** 貸借区分 */
  entry_side: 'debit' | 'credit';
  /** 勘定科目ID */
  account_item_id: string;
  /** 補助科目ID */
  sub_account_item_id?: string;
  /** 金額 */
  amount: number;
  /** 税区分 */
  tax_classification?: string;
  /** 取引先ID */
  partner_id?: string;
  /** 部門ID */
  department_id?: string;
  /** 品目ID */
  item_id?: string;
  /** メモ */
  description?: string;
}

// ============================================================
// 勘定科目 (Account Items)
// ============================================================

/** 勘定科目一覧レスポンス */
export interface MFAccountItemsResponse {
  account_items: MFAccountItem[];
}

/** 勘定科目 */
export interface MFAccountItem {
  /** 勘定科目ID */
  id: string;
  /** 事業所ID */
  office_id: string;
  /** 勘定科目コード */
  code: string | null;
  /** 勘定科目名 */
  name: string;
  /** 勘定科目名（カナ） */
  name_kana: string | null;
  /** 勘定科目区分 (assets, liabilities, equity, revenue, expense) */
  account_category: string;
  /** 税区分 */
  default_tax_classification: string | null;
  /** 並び順 */
  sort_order: number;
  /** 利用可否 */
  is_active: boolean;
  /** 補助科目 */
  sub_account_items?: MFSubAccountItem[];
}

/** 補助科目 */
export interface MFSubAccountItem {
  /** 補助科目ID */
  id: string;
  /** 補助科目名 */
  name: string;
  /** 補助科目名（カナ） */
  name_kana: string | null;
  /** 利用可否 */
  is_active: boolean;
}

// ============================================================
// 取引先 (Partners)
// ============================================================

/** 取引先一覧レスポンス */
export interface MFPartnersResponse {
  partners: MFPartner[];
}

/** 取引先 */
export interface MFPartner {
  /** 取引先ID */
  id: string;
  /** 事業所ID */
  office_id: string;
  /** 取引先コード */
  code: string | null;
  /** 取引先名 */
  name: string;
  /** 取引先名（カナ） */
  name_kana: string | null;
  /** 敬称 */
  name_suffix: string | null;
  /** メモ */
  memo: string | null;
  /** 取引先区分 */
  partner_type: string | null;
  /** 住所 */
  address: MFPartnerAddress | null;
  /** 担当者 */
  contact_person: MFContactPerson | null;
  /** 利用可否 */
  is_active: boolean;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 取引先住所 */
export interface MFPartnerAddress {
  /** 郵便番号 */
  zip_code: string | null;
  /** 都道府県 */
  prefecture: string | null;
  /** 住所1 */
  address1: string | null;
  /** 住所2 */
  address2: string | null;
}

/** 担当者情報 */
export interface MFContactPerson {
  /** 担当者名 */
  name: string | null;
  /** メールアドレス */
  email: string | null;
  /** 電話番号 */
  tel: string | null;
}

// ============================================================
// 部門 (Departments)
// ============================================================

/** 部門一覧レスポンス */
export interface MFDepartmentsResponse {
  departments: MFDepartment[];
}

/** 部門 */
export interface MFDepartment {
  /** 部門ID */
  id: string;
  /** 事業所ID */
  office_id: string;
  /** 部門コード */
  code: string | null;
  /** 部門名 */
  name: string;
  /** 親部門ID */
  parent_id: string | null;
  /** 利用可否 */
  is_active: boolean;
  /** 並び順 */
  sort_order: number;
}

// ============================================================
// 試算表 (Trial Balance)
// ============================================================

/** 貸借対照表レスポンス */
export interface MFTrialBsResponse {
  trial_bs: MFTrialBsData;
}

/** 損益計算書レスポンス */
export interface MFTrialPlResponse {
  trial_pl: MFTrialPlData;
}

/** 貸借対照表データ */
export interface MFTrialBsData {
  /** 事業所ID */
  office_id: string;
  /** 開始日 */
  start_date: string;
  /** 終了日 */
  end_date: string;
  /** 勘定科目別残高 */
  balances: MFTrialBalance[];
}

/** 損益計算書データ */
export interface MFTrialPlData {
  /** 事業所ID */
  office_id: string;
  /** 開始日 */
  start_date: string;
  /** 終了日 */
  end_date: string;
  /** 勘定科目別残高 */
  balances: MFTrialBalance[];
}

/** 試算表の勘定科目残高 */
export interface MFTrialBalance {
  /** 勘定科目ID */
  account_item_id: string;
  /** 勘定科目名 */
  account_item_name: string;
  /** 勘定科目区分 */
  account_category: string;
  /** 期首残高 */
  opening_balance: number;
  /** 借方合計 */
  debit_amount: number;
  /** 貸方合計 */
  credit_amount: number;
  /** 期末残高 */
  closing_balance: number;
}

// ============================================================
// 請求書 (Billings / Invoices) - Invoice API v3
// ============================================================

/** 請求書一覧レスポンス */
export interface MFBillingsResponse {
  billings: MFBilling[];
  pagination: MFPagination;
}

/** 請求書詳細レスポンス */
export interface MFBillingResponse {
  billing: MFBilling;
}

/** 請求書 */
export interface MFBilling {
  /** 請求書ID */
  id: string;
  /** 請求書番号 */
  billing_number: string | null;
  /** 件名 */
  title: string | null;
  /** 請求日 */
  billing_date: string;
  /** 支払期限 */
  due_date: string | null;
  /** 合計金額 */
  total_amount: number;
  /** 消費税合計 */
  total_tax: number;
  /** 小計 */
  subtotal: number;
  /** ステータス */
  status: 'draft' | 'submitted' | 'paid' | 'cancelled';
  /** 取引先ID */
  partner_id: string | null;
  /** 取引先名 */
  partner_name: string | null;
  /** 送付先情報 */
  recipient: MFBillingRecipient | null;
  /** 品目行 */
  items: MFBillingItem[];
  /** メモ */
  note: string | null;
  /** 振込先情報 */
  payment_info: MFPaymentInfo | null;
  /** PDFダウンロードURL */
  pdf_url: string | null;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 請求書の送付先 */
export interface MFBillingRecipient {
  /** 宛名 */
  name: string | null;
  /** 敬称 */
  title: string | null;
  /** 郵便番号 */
  zip_code: string | null;
  /** 住所 */
  address: string | null;
  /** メールアドレス */
  email: string | null;
}

/** 請求書品目 */
export interface MFBillingItem {
  /** 品目ID */
  id: string;
  /** 品目名 */
  name: string;
  /** 数量 */
  quantity: number;
  /** 単価 */
  unit_price: number;
  /** 金額 */
  amount: number;
  /** 税区分 */
  tax_classification: string | null;
  /** 消費税額 */
  tax_amount: number;
  /** 説明 */
  description: string | null;
}

/** 振込先情報 */
export interface MFPaymentInfo {
  /** 銀行名 */
  bank_name: string | null;
  /** 支店名 */
  branch_name: string | null;
  /** 口座種別 */
  account_type: string | null;
  /** 口座番号 */
  account_number: string | null;
  /** 口座名義 */
  account_name: string | null;
}

/** 請求書作成パラメータ */
export interface MFBillingCreateParams {
  /** 取引先ID */
  partner_id?: string;
  /** 件名 */
  title?: string;
  /** 請求日 */
  billing_date: string;
  /** 支払期限 */
  due_date?: string;
  /** 品目行 */
  items: MFBillingItemParams[];
  /** メモ */
  note?: string;
}

/** 請求書品目パラメータ */
export interface MFBillingItemParams {
  /** 品目名 */
  name: string;
  /** 数量 */
  quantity: number;
  /** 単価 */
  unit_price: number;
  /** 税区分 */
  tax_classification?: string;
  /** 説明 */
  description?: string;
}

// ============================================================
// 経費精算 (Expense Applications) - Expense API
// ============================================================

/** 経費申請一覧レスポンス */
export interface MFExpenseApplicationsResponse {
  expense_applications: MFExpenseApplication[];
  pagination: MFPagination;
}

/** 経費申請 */
export interface MFExpenseApplication {
  /** 経費申請ID */
  id: string;
  /** 申請番号 */
  number: string | null;
  /** 件名 */
  title: string;
  /** 申請者ID */
  applicant_id: string;
  /** 申請者名 */
  applicant_name: string | null;
  /** 合計金額 */
  total_amount: number;
  /** ステータス (draft, submitted, approved, rejected, cancelled) */
  status: string;
  /** 経費明細行 */
  expense_items: MFExpenseItem[];
  /** 申請日 */
  application_date: string | null;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 経費明細行 */
export interface MFExpenseItem {
  /** 明細ID */
  id: string;
  /** 発生日 */
  issue_date: string;
  /** 勘定科目ID */
  account_item_id: string | null;
  /** 勘定科目名 */
  account_item_name: string | null;
  /** 金額 */
  amount: number;
  /** 消費税額 */
  tax_amount: number;
  /** メモ */
  description: string | null;
  /** 証憑画像URL */
  receipt_url: string | null;
}
