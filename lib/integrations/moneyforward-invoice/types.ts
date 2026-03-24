/**
 * MFクラウド請求書 API v3 型定義
 * 公式: https://invoice.moneyforward.com/docs/api/v3/index.html
 * スタートアップガイド: https://biz.moneyforward.com/support/invoice/guide/api-guide/a04.html
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface MfInvoiceTokenResponse {
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
// 事業所 (Office)
// ============================================================

/** 事業所情報レスポンス */
export interface OfficeResponse {
  /** 事業所名 */
  name: string;
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
  /** FAX */
  fax: string | null;
  /** 適格請求書発行事業者登録番号 */
  registration_code: string | null;
}

// ============================================================
// 請求書 (Billings / Invoices)
// ============================================================

/** 請求書一覧レスポンス */
export interface BillingsIndexResponse {
  data: Billing[];
  pagination: Pagination;
}

/** 請求書詳細レスポンス */
export interface BillingResponse {
  data: Billing;
}

/** 請求書 */
export interface Billing {
  /** 請求書ID */
  id: string;
  /** 請求書番号 */
  billing_number: string | null;
  /** 取引先ID */
  partner_id: string | null;
  /** 取引先名 */
  partner_name: string | null;
  /** 部門ID */
  department_id: string | null;
  /** 件名 */
  title: string | null;
  /** 小計 */
  subtotal: number;
  /** 消費税額 */
  tax: number;
  /** 合計金額 */
  total_price: number;
  /** 請求日 (yyyy-MM-dd) */
  billing_date: string | null;
  /** 支払期限 (yyyy-MM-dd) */
  due_date: string | null;
  /** ステータス (draft: 下書き, sending: 送付中, sent: 送付済み, paid: 入金済み) */
  status: 'draft' | 'sending' | 'sent' | 'paid';
  /** 請求書URL */
  pdf_url: string | null;
  /** 適格請求書フラグ */
  is_qualified_invoice: boolean;
  /** 明細行 */
  items: BillingItem[];
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 請求書明細行 */
export interface BillingItem {
  /** 明細ID */
  id: string;
  /** 品目名 */
  name: string;
  /** 単価 */
  unit_price: number;
  /** 数量 */
  quantity: number;
  /** 単位 */
  unit: string | null;
  /** 金額 */
  price: number;
  /** 消費税率 (%) */
  tax_rate: number;
  /** 軽減税率フラグ */
  is_reduced_tax_rate: boolean;
  /** 課税区分 */
  excise: 'taxation' | 'exemption' | 'non_taxation';
  /** 備考 */
  description: string | null;
}

/** 請求書作成パラメータ */
export interface BillingCreateParams {
  /** 取引先ID */
  partner_id?: string;
  /** 部門ID */
  department_id?: string;
  /** 件名 */
  title?: string;
  /** 請求日 (yyyy-MM-dd) */
  billing_date?: string;
  /** 支払期限 (yyyy-MM-dd) */
  due_date?: string;
  /** 適格請求書フラグ */
  is_qualified_invoice?: boolean;
  /** 明細行 */
  items?: BillingItemCreateParams[];
}

/** 請求書明細作成パラメータ */
export interface BillingItemCreateParams {
  /** 品目名 */
  name: string;
  /** 単価 */
  unit_price: number;
  /** 数量 */
  quantity: number;
  /** 単位 */
  unit?: string;
  /** 消費税率 (%) */
  tax_rate?: number;
  /** 軽減税率フラグ */
  is_reduced_tax_rate?: boolean;
  /** 課税区分 */
  excise?: 'taxation' | 'exemption' | 'non_taxation';
  /** 備考 */
  description?: string;
}

// ============================================================
// 見積書 (Quotes)
// ============================================================

/** 見積書一覧レスポンス */
export interface QuotesIndexResponse {
  data: Quote[];
  pagination: Pagination;
}

/** 見積書 */
export interface Quote {
  /** 見積書ID */
  id: string;
  /** 見積書番号 */
  quote_number: string | null;
  /** 取引先ID */
  partner_id: string | null;
  /** 取引先名 */
  partner_name: string | null;
  /** 件名 */
  title: string | null;
  /** 合計金額 */
  total_price: number;
  /** 見積日 (yyyy-MM-dd) */
  quote_date: string | null;
  /** 有効期限 (yyyy-MM-dd) */
  expiry_date: string | null;
  /** ステータス */
  status: string;
  /** 明細行 */
  items: BillingItem[];
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

// ============================================================
// 納品書 (Delivery Slips)
// ============================================================

/** 納品書 */
export interface DeliverySlip {
  /** 納品書ID */
  id: string;
  /** 納品書番号 */
  delivery_number: string | null;
  /** 取引先ID */
  partner_id: string | null;
  /** 取引先名 */
  partner_name: string | null;
  /** 件名 */
  title: string | null;
  /** 合計金額 */
  total_price: number;
  /** 納品日 (yyyy-MM-dd) */
  delivery_date: string | null;
  /** ステータス */
  status: string;
  /** 明細行 */
  items: BillingItem[];
}

// ============================================================
// 取引先 (Partners)
// ============================================================

/** 取引先一覧レスポンス */
export interface PartnersIndexResponse {
  data: MfPartner[];
  pagination: Pagination;
}

/** 取引先レスポンス */
export interface PartnerResponse {
  data: MfPartner;
}

/** 取引先 */
export interface MfPartner {
  /** 取引先ID */
  id: string;
  /** 取引先コード */
  code: string | null;
  /** 取引先名 */
  name: string;
  /** 敬称 */
  name_suffix: string | null;
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
  /** メールアドレス */
  email: string | null;
  /** 担当者名 */
  contact_name: string | null;
  /** 適格請求書発行事業者登録番号 */
  registration_code: string | null;
  /** 部門一覧 */
  departments: PartnerDepartment[];
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 取引先部門 */
export interface PartnerDepartment {
  /** 部門ID */
  id: string;
  /** 部門名 */
  name: string;
}

/** 取引先作成パラメータ */
export interface PartnerCreateParams {
  /** 取引先名 */
  name: string;
  /** 取引先コード */
  code?: string;
  /** 敬称 */
  name_suffix?: string;
  /** 郵便番号 */
  zip?: string;
  /** 都道府県 */
  prefecture?: string;
  /** 住所1 */
  address1?: string;
  /** 住所2 */
  address2?: string;
  /** 電話番号 */
  tel?: string;
  /** メールアドレス */
  email?: string;
  /** 担当者名 */
  contact_name?: string;
  /** 適格請求書発行事業者登録番号 */
  registration_code?: string;
}

// ============================================================
// 品目 (Items)
// ============================================================

/** 品目一覧レスポンス */
export interface ItemsIndexResponse {
  data: MfItem[];
  pagination: Pagination;
}

/** 品目 */
export interface MfItem {
  /** 品目ID */
  id: string;
  /** 品目名 */
  name: string;
  /** 単価 */
  unit_price: number | null;
  /** 数量 */
  quantity: number | null;
  /** 単位 */
  unit: string | null;
  /** 消費税率 */
  tax_rate: number | null;
  /** 軽減税率フラグ */
  is_reduced_tax_rate: boolean;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

// ============================================================
// 共通型
// ============================================================

/** ページネーション */
export interface Pagination {
  /** 総件数 */
  total_count: number;
  /** 現在のページ */
  current_page: number;
  /** 1ページあたりの件数 */
  per_page: number;
  /** 総ページ数 */
  total_pages: number;
}
