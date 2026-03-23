/**
 * 弥生会計 / Misoca API 型定義
 *
 * 公式ドキュメント:
 * - Misoca API v3: https://doc.misoca.jp/v3/
 * - Misoca API について: https://doc.misoca.jp/
 * - 弥生サポート: https://support.yayoi-kk.co.jp/faq_Subcontents.html?page_id=22266
 *
 * Base URL (Misoca): https://app.misoca.jp/api/v3
 *
 * 注意: 弥生会計本体には公開REST APIは提供されていない。
 * データ連携は以下の方法で行う：
 * 1. Misoca API（請求書・見積書・納品書）
 * 2. YAYOI SMART CONNECT（データ取込）
 * 3. CSV形式でのインポート/エクスポート
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** Misoca OAuth2 トークンレスポンス */
export interface MisocaTokenResponse {
  /** アクセストークン */
  access_token: string;
  /** トークン種別 (Bearer) */
  token_type: string;
  /** 有効期限（秒）。通常86400（1日） */
  expires_in: number;
  /** リフレッシュトークン */
  refresh_token: string;
  /** スコープ */
  scope: string;
  /** トークン発行時刻（UNIX timestamp） */
  created_at: number;
}

// ============================================================
// 請求書 (Invoices)
// ============================================================

/** 請求書一覧レスポンス（配列） */
export type InvoicesResponse = MisocaInvoice[];

/** 請求書 */
export interface MisocaInvoice {
  /** 請求書ID */
  id: string;
  /** 請求書番号 */
  invoice_number: string | null;
  /** 件名 */
  subject: string | null;
  /** 請求日 */
  issue_date: string | null;
  /** 支払期限 */
  payment_due_date: string | null;
  /** 合計金額（税込） */
  total_amount: number;
  /** 小計（税抜） */
  subtotal: number;
  /** 消費税合計 */
  tax: number;
  /** ステータス */
  status: 'draft' | 'submitted' | 'paid';
  /** 請求済みかどうか */
  is_submitted: boolean;
  /** 入金済みかどうか */
  is_paid: boolean;
  /** 送付先（取引先） */
  recipient: MisocaRecipient | null;
  /** 差出人 */
  sender: MisocaSender | null;
  /** 品目行 */
  items: MisocaLineItem[];
  /** 備考 */
  note: string | null;
  /** PDF URL（有効期限あり） */
  pdf_url: string | null;
  /** 消費税計算方式 (inclusive: 内税, exclusive: 外税) */
  tax_type: 'inclusive' | 'exclusive';
  /** 源泉所得税を適用するか */
  withholding_tax_needed: boolean;
  /** 源泉所得税額 */
  withholding_tax_amount: number | null;
  /** 適格請求書発行事業者登録番号 */
  registration_number: string | null;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 送付先（取引先情報） */
export interface MisocaRecipient {
  /** 取引先名 */
  name: string | null;
  /** 取引先名（敬称） */
  title: string | null;
  /** 郵便番号 */
  zip_code: string | null;
  /** 住所1 */
  address1: string | null;
  /** 住所2 */
  address2: string | null;
  /** 電話番号 */
  tel: string | null;
  /** FAX番号 */
  fax: string | null;
  /** メールアドレス */
  email: string | null;
}

/** 差出人情報 */
export interface MisocaSender {
  /** 会社名 */
  name: string | null;
  /** 郵便番号 */
  zip_code: string | null;
  /** 住所1 */
  address1: string | null;
  /** 住所2 */
  address2: string | null;
  /** 電話番号 */
  tel: string | null;
  /** FAX番号 */
  fax: string | null;
  /** メールアドレス */
  email: string | null;
}

/** 品目行 */
export interface MisocaLineItem {
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
  /** 単位 */
  unit: string | null;
  /** 消費税率 */
  tax_rate: number;
  /** 消費税額 */
  tax_amount: number;
  /** 軽減税率かどうか */
  is_reduced_tax_rate: boolean;
  /** 説明 */
  description: string | null;
}

/** 請求書作成パラメータ */
export interface MisocaInvoiceCreateParams {
  /** 件名 */
  subject?: string;
  /** 請求日 (yyyy-mm-dd) */
  issue_date?: string;
  /** 支払期限 (yyyy-mm-dd) */
  payment_due_date?: string;
  /** 送付先 */
  recipient?: Partial<MisocaRecipient>;
  /** 品目行 */
  items: MisocaLineItemParams[];
  /** 備考 */
  note?: string;
  /** 消費税計算方式 */
  tax_type?: 'inclusive' | 'exclusive';
  /** 源泉所得税を適用するか */
  withholding_tax_needed?: boolean;
  /** 適格請求書発行事業者登録番号 */
  registration_number?: string;
}

/** 品目行パラメータ */
export interface MisocaLineItemParams {
  /** 品目名 */
  name: string;
  /** 数量 */
  quantity: number;
  /** 単価 */
  unit_price: number;
  /** 単位 */
  unit?: string;
  /** 消費税率 */
  tax_rate?: number;
  /** 軽減税率かどうか */
  is_reduced_tax_rate?: boolean;
  /** 説明 */
  description?: string;
}

// ============================================================
// 見積書 (Estimates)
// ============================================================

/** 見積書一覧レスポンス */
export type EstimatesResponse = MisocaEstimate[];

/** 見積書 */
export interface MisocaEstimate {
  /** 見積書ID */
  id: string;
  /** 見積書番号 */
  estimate_number: string | null;
  /** 件名 */
  subject: string | null;
  /** 見積日 */
  issue_date: string | null;
  /** 有効期限 */
  expiry_date: string | null;
  /** 合計金額 */
  total_amount: number;
  /** 小計 */
  subtotal: number;
  /** 消費税 */
  tax: number;
  /** 送付先 */
  recipient: MisocaRecipient | null;
  /** 品目行 */
  items: MisocaLineItem[];
  /** 備考 */
  note: string | null;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

// ============================================================
// 納品書 (Delivery Slips)
// ============================================================

/** 納品書一覧レスポンス */
export type DeliverySlipsResponse = MisocaDeliverySlip[];

/** 納品書 */
export interface MisocaDeliverySlip {
  /** 納品書ID */
  id: string;
  /** 納品書番号 */
  delivery_slip_number: string | null;
  /** 件名 */
  subject: string | null;
  /** 納品日 */
  issue_date: string | null;
  /** 合計金額 */
  total_amount: number;
  /** 送付先 */
  recipient: MisocaRecipient | null;
  /** 品目行 */
  items: MisocaLineItem[];
  /** 備考 */
  note: string | null;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

// ============================================================
// 取引先グループ (Contact Groups) / 送付先 (Contacts)
// ============================================================

/** 取引先グループ一覧レスポンス */
export type ContactGroupsResponse = MisocaContactGroup[];

/** 取引先グループ */
export interface MisocaContactGroup {
  /** グループID */
  id: string;
  /** グループ名 */
  name: string;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 送付先一覧レスポンス */
export type ContactsResponse = MisocaContact[];

/** 送付先 */
export interface MisocaContact {
  /** 送付先ID */
  id: string;
  /** 送付先名 */
  name: string;
  /** 敬称 */
  title: string | null;
  /** 郵便番号 */
  zip_code: string | null;
  /** 住所1 */
  address1: string | null;
  /** 住所2 */
  address2: string | null;
  /** 電話番号 */
  tel: string | null;
  /** FAX番号 */
  fax: string | null;
  /** メールアドレス */
  email: string | null;
  /** グループID */
  contact_group_id: string | null;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

// ============================================================
// 品目マスタ (Dealing Items)
// ============================================================

/** 品目マスタ一覧レスポンス */
export type DealingItemsResponse = MisocaDealingItem[];

/** 品目マスタ */
export interface MisocaDealingItem {
  /** 品目ID */
  id: string;
  /** 品目名 */
  name: string;
  /** 単価 */
  unit_price: number;
  /** 単位 */
  unit: string | null;
  /** 説明 */
  description: string | null;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

// ============================================================
// ユーザー情報
// ============================================================

/** ユーザー情報レスポンス */
export interface MisocaUserResponse {
  /** ユーザーID */
  id: string;
  /** メールアドレス */
  email: string;
  /** 名前 */
  name: string | null;
}

// ============================================================
// 弥生会計 CSVインポート形式
// ============================================================

/**
 * 弥生会計仕訳CSVインポート形式
 * 弥生会計本体にはREST APIがないため、CSV形式でのインポートが主な連携手段
 */
export interface YayoiJournalCsvRow {
  /** 仕訳区分 (仕訳, 決算仕訳) */
  journal_type: string;
  /** 伝票番号 */
  slip_number: string;
  /** 日付 (yyyy/mm/dd) */
  date: string;
  /** 借方勘定科目 */
  debit_account: string;
  /** 借方補助科目 */
  debit_sub_account: string;
  /** 借方部門 */
  debit_department: string;
  /** 借方税区分 */
  debit_tax_type: string;
  /** 借方金額 */
  debit_amount: number;
  /** 借方税額 */
  debit_tax: number;
  /** 貸方勘定科目 */
  credit_account: string;
  /** 貸方補助科目 */
  credit_sub_account: string;
  /** 貸方部門 */
  credit_department: string;
  /** 貸方税区分 */
  credit_tax_type: string;
  /** 貸方金額 */
  credit_amount: number;
  /** 貸方税額 */
  credit_tax: number;
  /** 摘要 */
  description: string;
  /** 取引先 */
  partner: string;
  /** メモ */
  memo: string;
}

/**
 * CSVインポートヘッダー
 * 弥生会計へのCSVインポートで使用するカラム順序
 */
export const YAYOI_CSV_HEADERS = [
  '仕訳区分',
  '伝票番号',
  '日付',
  '借方勘定科目',
  '借方補助科目',
  '借方部門',
  '借方税区分',
  '借方金額',
  '借方税額',
  '貸方勘定科目',
  '貸方補助科目',
  '貸方部門',
  '貸方税区分',
  '貸方金額',
  '貸方税額',
  '摘要',
  '取引先',
  'メモ',
] as const;
