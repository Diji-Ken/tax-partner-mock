/**
 * freee会計 API 型定義
 * 公式リファレンス: https://developer.freee.co.jp/reference/accounting/reference
 * Base URL: https://api.freee.co.jp/api/1
 *
 * フィールド名は公式APIレスポンスに準拠（snake_case）
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface FreeeTokenResponse {
  /** アクセストークン */
  access_token: string;
  /** トークン種別 (bearer) */
  token_type: string;
  /** 有効期限（秒） */
  expires_in: number;
  /** リフレッシュトークン */
  refresh_token: string;
  /** スコープ ("read write") */
  scope: string;
  /** トークン発行時刻（UNIX timestamp） */
  created_at: number;
  /** 事業所ID */
  company_id?: number;
  /** 外部CID */
  external_cid?: string;
}

// ============================================================
// 事業所 (Companies)
// ============================================================

/** 事業所一覧レスポンス */
export interface CompaniesIndexResponse {
  companies: CompanySummary[];
}

/** 事業所詳細レスポンス */
export interface CompaniesShowResponse {
  company: CompanyDetail;
}

/** 事業所概要 */
export interface CompanySummary {
  /** 事業所ID */
  id: number;
  /** 事業所名 */
  name: string | null;
  /** 正式名称（カナ） */
  name_kana: string | null;
  /** 事業所の表示名 */
  display_name: string | null;
  /** 法人番号 */
  corporate_number: string | null;
  /** 事業形態 (個人: personal, 法人: corporate) */
  type: 'personal' | 'corporate';
  /** 役割 (admin, simple_accounting, self_only, read_only) */
  role: string;
}

/** 事業所詳細 */
export interface CompanyDetail extends CompanySummary {
  /** 従業員数 */
  head_count: number | null;
  /** 郵便番号 */
  zipcode: string | null;
  /** 都道府県コード (0〜46) */
  prefecture_code: number | null;
  /** 住所1 */
  street_name1: string | null;
  /** 住所2 */
  street_name2: string | null;
  /** 電話番号1 */
  phone1: string | null;
  /** 電話番号2 */
  phone2: string | null;
  /** FAX番号 */
  fax: string | null;
  /** 業種 */
  industry_class: string | null;
  /** 業種コード */
  industry_code: string | null;
  /** 決算月 (1〜12) */
  fiscal_year_end_month: number;
  /** 決算日 (0: 月末, 1〜31: 日指定) */
  fiscal_year_end_day: number;
  /** 期首月 */
  fiscal_year_start_month: number;
  /** 勘定科目体系 */
  account_category: string | null;
  /** 仕訳番号形式 (通期: fy, 月次: monthly) */
  txn_number_format: string;
  /** 消費税設定 */
  tax_at_source_calc_type: number;
  /** 取引先リスト */
  partners?: Partner[];
  /** 勘定科目リスト */
  account_items?: AccountItem[];
  /** 税区分リスト */
  taxes?: Tax[];
  /** 品目リスト */
  items?: Item[];
  /** 部門リスト */
  sections?: Section[];
  /** メモタグリスト */
  tags?: Tag[];
  /** 口座リスト */
  walletables?: Walletable[];
}

// ============================================================
// 取引 (Deals)
// ============================================================

/** 取引一覧レスポンス */
export interface DealsIndexResponse {
  deals: Deal[];
  meta: PaginationMeta;
}

/** 取引詳細レスポンス */
export interface DealResponse {
  deal: Deal;
}

/** 取引作成レスポンス */
export interface DealCreateResponse {
  deal: Deal;
}

/** ページネーションメタ情報 */
export interface PaginationMeta {
  /** 総件数 */
  total_count: number;
}

/** 取引 */
export interface Deal {
  /** 取引ID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** 発生日 (yyyy-mm-dd) */
  issue_date: string;
  /** 支払期日 (yyyy-mm-dd) */
  due_date: string | null;
  /** 収支区分 (income: 収入, expense: 支出) */
  type: 'income' | 'expense';
  /** 金額 */
  amount: number;
  /** 未精算金額 */
  due_amount: number;
  /** 決済状況 (unsettled: 未決済, settled: 完了) */
  status: 'unsettled' | 'settled';
  /** 取引先ID */
  partner_id: number | null;
  /** 取引先コード */
  partner_code: string | null;
  /** 備考 */
  ref_number: string | null;
  /** 取引明細行 */
  details: DealDetail[];
  /** 決済行 */
  payments?: DealPayment[];
  /** レシート */
  receipts?: DealReceipt[];
  /** 振替伝票行 */
  renews?: DealRenew[];
}

/** 取引明細行 */
export interface DealDetail {
  /** 取引明細行ID */
  id: number;
  /** 勘定科目ID */
  account_item_id: number;
  /** 税区分コード */
  tax_code: number;
  /** 品目ID */
  item_id: number | null;
  /** 部門ID */
  section_id: number | null;
  /** メモタグID配列 */
  tag_ids: number[];
  /** セグメント1タグID */
  segment_1_tag_id: number | null;
  /** セグメント2タグID */
  segment_2_tag_id: number | null;
  /** セグメント3タグID */
  segment_3_tag_id: number | null;
  /** 金額 */
  amount: number;
  /** 消費税額 */
  vat: number;
  /** 備考 */
  description: string | null;
  /** 貸借 (debit: 借方, credit: 貸方) */
  entry_side: 'debit' | 'credit';
}

/** 取引の決済行 */
export interface DealPayment {
  /** 決済ID */
  id: number;
  /** 支払日 */
  date: string;
  /** 口座区分 */
  from_walletable_type: string;
  /** 口座ID */
  from_walletable_id: number;
  /** 金額 */
  amount: number;
}

/** 取引レシート */
export interface DealReceipt {
  /** レシートID */
  id: number;
  /** ステータス */
  status: string;
  /** MIME type */
  mime_type: string;
  /** 発生日 */
  issue_date: string | null;
}

/** 振替行 */
export interface DealRenew {
  /** 振替ID */
  id: number;
  /** 更新日 */
  update_date: string;
  /** 振替明細 */
  details: DealDetail[];
  /** 債権債務行 */
  accruals: DealDetail[];
}

/** 取引作成パラメータ */
export interface DealCreateParams {
  /** 事業所ID */
  company_id: number;
  /** 発生日 (yyyy-mm-dd) */
  issue_date: string;
  /** 収支区分 */
  type: 'income' | 'expense';
  /** 支払期日 */
  due_date?: string;
  /** 取引先ID */
  partner_id?: number;
  /** 取引先コード */
  partner_code?: string;
  /** 備考 */
  ref_number?: string;
  /** 取引明細行 */
  details: DealDetailParams[];
  /** 決済行 */
  payments?: DealPaymentParams[];
  /** レシートID配列 */
  receipt_ids?: number[];
}

/** 取引明細行作成パラメータ */
export interface DealDetailParams {
  /** 勘定科目ID */
  account_item_id: number;
  /** 税区分コード */
  tax_code: number;
  /** 金額 */
  amount: number;
  /** 品目ID */
  item_id?: number;
  /** 部門ID */
  section_id?: number;
  /** メモタグID配列 */
  tag_ids?: number[];
  /** 備考 */
  description?: string;
  /** 消費税額（指定しない場合は自動計算） */
  vat?: number;
}

/** 決済行作成パラメータ */
export interface DealPaymentParams {
  /** 支払日 */
  date: string;
  /** 口座区分 */
  from_walletable_type: string;
  /** 口座ID */
  from_walletable_id: number;
  /** 金額 */
  amount: number;
}

// ============================================================
// 勘定科目 (Account Items)
// ============================================================

/** 勘定科目一覧レスポンス */
export interface AccountItemsIndexResponse {
  account_items: AccountItem[];
}

/** 勘定科目詳細レスポンス */
export interface AccountItemResponse {
  account_item: AccountItem;
}

/** 勘定科目 */
export interface AccountItem {
  /** 勘定科目ID */
  id: number;
  /** 勘定科目名 */
  name: string;
  /** ショートカット1 */
  shortcut: string | null;
  /** ショートカット2 */
  shortcut_num: string | null;
  /** 勘定科目カテゴリー */
  account_category: string;
  /** 勘定科目のカテゴリーID */
  account_category_id: number;
  /** 税区分コード */
  tax_code: number;
  /** 対応する収入カテゴリ */
  corresponding_income_id: number | null;
  /** 対応する支出カテゴリ */
  corresponding_expense_id: number | null;
  /** 減価償却累計額勘定科目ID */
  accumulated_dep_account_item_id: number | null;
  /** 検索可能フラグ */
  searchable: number;
  /** 並び順 */
  sorting_number: number | null;
  /** 仕訳で使用可能か */
  available: boolean;
  /** ウォレブル連携ID */
  walletable_id: number | null;
  /** グループ名 */
  group_name: string | null;
  /** 関連する仕訳の勘定科目の名称 */
  corresponding_type_expense: string | null;
  /** 関連する仕訳の勘定科目の名称 */
  corresponding_type_income: string | null;
}

/** 勘定科目作成パラメータ */
export interface AccountItemCreateParams {
  /** 事業所ID */
  company_id: number;
  /** 勘定科目名 */
  name: string;
  /** ショートカット1 */
  shortcut?: string;
  /** ショートカット2 */
  shortcut_num?: string;
  /** 税区分コード */
  tax_code: number;
  /** グループ名 */
  group_name: string;
  /** 勘定科目のカテゴリーID */
  account_category_id: number;
  /** 対応する収入カテゴリ */
  corresponding_income_id?: number;
  /** 対応する支出カテゴリ */
  corresponding_expense_id?: number;
  /** 減価償却累計額勘定科目ID */
  accumulated_dep_account_item_id?: number;
  /** 検索可能フラグ (0: 不可, 1: 可) */
  searchable?: number;
}

// ============================================================
// 取引先 (Partners)
// ============================================================

/** 取引先一覧レスポンス */
export interface PartnersIndexResponse {
  partners: Partner[];
}

/** 取引先詳細レスポンス */
export interface PartnerResponse {
  partner: Partner;
}

/** 取引先 */
export interface Partner {
  /** 取引先ID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** 取引先名 */
  name: string;
  /** 取引先コード */
  code: string | null;
  /** ショートカット1 */
  shortcut1: string | null;
  /** ショートカット2 */
  shortcut2: string | null;
  /** 正式名称 */
  long_name: string | null;
  /** カナ名 */
  name_kana: string | null;
  /** 敬称(御中: mr, 様: ms, (なし): nothing) */
  default_title: string | null;
  /** 電話番号 */
  phone: string | null;
  /** 担当者名 */
  contact_name: string | null;
  /** メールアドレス */
  email: string | null;
  /** 住所 */
  address_attributes: PartnerAddress | null;
  /** 振込先口座 */
  partner_bank_account_attributes: PartnerBankAccount | null;
  /** 利用可否 */
  available: boolean;
  /** 更新日 */
  update_date: string;
}

/** 取引先住所 */
export interface PartnerAddress {
  /** 郵便番号 */
  zipcode: string | null;
  /** 都道府県コード */
  prefecture_code: number | null;
  /** 住所1 */
  street_name1: string | null;
  /** 住所2 */
  street_name2: string | null;
}

/** 取引先振込先口座 */
export interface PartnerBankAccount {
  /** 銀行名 */
  bank_name: string | null;
  /** 銀行コード */
  bank_code: string | null;
  /** 銀行名カナ */
  bank_name_kana: string | null;
  /** 支店名 */
  branch_name: string | null;
  /** 支店コード */
  branch_code: string | null;
  /** 支店名カナ */
  branch_kana: string | null;
  /** 口座種別 (ordinary: 普通, checking: 当座, earmarked: 納税準備, savings: 貯蓄, other: その他) */
  account_type: string | null;
  /** 口座番号 */
  account_number: string | null;
  /** 口座名義 */
  account_name: string | null;
  /** 受取人名（カナ） */
  long_account_name: string | null;
}

// ============================================================
// 試算表 (Trial Balance) - BS/PL
// ============================================================

/** 試算表レスポンス（貸借対照表） */
export interface TrialBsResponse {
  trial_bs: TrialBsData;
}

/** 試算表レスポンス（損益計算書） */
export interface TrialPlResponse {
  trial_pl: TrialPlData;
}

/** 貸借対照表データ */
export interface TrialBsData {
  /** 事業所ID */
  company_id: number;
  /** 会計年度 */
  fiscal_year: number;
  /** 開始月 */
  start_month: number;
  /** 終了月 */
  end_month: number;
  /** 開始日 */
  start_date: string | null;
  /** 終了日 */
  end_date: string | null;
  /** 勘定科目ごとの金額 */
  balances: TrialBsBalance[];
  /** 作成日時 */
  created_at: string | null;
}

/** 損益計算書データ */
export interface TrialPlData {
  /** 事業所ID */
  company_id: number;
  /** 会計年度 */
  fiscal_year: number;
  /** 開始月 */
  start_month: number;
  /** 終了月 */
  end_month: number;
  /** 開始日 */
  start_date: string | null;
  /** 終了日 */
  end_date: string | null;
  /** 勘定科目ごとの金額 */
  balances: TrialPlBalance[];
  /** 作成日時 */
  created_at: string | null;
}

/** 貸借対照表の勘定科目残高 */
export interface TrialBsBalance {
  /** 勘定科目ID */
  account_item_id: number;
  /** 勘定科目名 */
  account_item_name: string;
  /** 勘定科目カテゴリー名 */
  account_category_name: string;
  /** 階層レベル */
  hierarchy_level: number;
  /** 親勘定科目ID */
  parent_account_item_id: number | null;
  /** 期首残高 */
  opening_balance: number;
  /** 借方金額 */
  debit_amount: number;
  /** 貸方金額 */
  credit_amount: number;
  /** 期末残高 */
  closing_balance: number;
  /** 構成比（%） */
  composition_ratio: number | null;
}

/** 損益計算書の勘定科目残高 */
export interface TrialPlBalance {
  /** 勘定科目ID */
  account_item_id: number;
  /** 勘定科目名 */
  account_item_name: string;
  /** 勘定科目カテゴリー名 */
  account_category_name: string;
  /** 階層レベル */
  hierarchy_level: number;
  /** 親勘定科目ID */
  parent_account_item_id: number | null;
  /** 借方金額 */
  debit_amount: number;
  /** 貸方金額 */
  credit_amount: number;
  /** 差引金額 */
  balance: number;
  /** 構成比（%） */
  composition_ratio: number | null;
}

// ============================================================
// 仕訳帳 (Journals)
// ============================================================

/** 仕訳帳ダウンロードレスポンス */
export interface JournalsDownloadResponse {
  journals: {
    /** ダウンロードID */
    id: number;
    /** ダウンロードURL */
    download_url: string | null;
    /** ステータス (enqueued: キュー中, working: 処理中, uploaded: 完了) */
    status: 'enqueued' | 'working' | 'uploaded';
  };
}

/** 仕訳帳ステータスレスポンス */
export interface JournalsStatusResponse {
  journals: {
    /** ダウンロードID */
    id: number;
    /** ステータス */
    status: 'enqueued' | 'working' | 'uploaded';
    /** ダウンロードURL (status=uploadedの時のみ) */
    download_url: string | null;
  };
}

// ============================================================
// 振替伝票 (Manual Journals)
// ============================================================

/** 振替伝票一覧レスポンス */
export interface ManualJournalsIndexResponse {
  manual_journals: ManualJournal[];
  meta: PaginationMeta;
}

/** 振替伝票詳細レスポンス */
export interface ManualJournalResponse {
  manual_journal: ManualJournal;
}

/** 振替伝票 */
export interface ManualJournal {
  /** 振替伝票ID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** 発生日 (yyyy-mm-dd) */
  issue_date: string;
  /** 決算整理仕訳かどうか */
  adjustment: boolean;
  /** 金額 */
  amount: number;
  /** 借方行 */
  debit_details: ManualJournalDetail[];
  /** 貸方行 */
  credit_details: ManualJournalDetail[];
}

/** 振替伝票明細行 */
export interface ManualJournalDetail {
  /** 明細行ID */
  id: number;
  /** 貸借 */
  entry_side: 'debit' | 'credit';
  /** 勘定科目ID */
  account_item_id: number;
  /** 金額 */
  amount: number;
  /** 消費税額 */
  vat: number;
  /** 税区分コード */
  tax_code: number;
  /** 取引先ID */
  partner_id: number | null;
  /** 品目ID */
  item_id: number | null;
  /** 部門ID */
  section_id: number | null;
  /** メモタグID配列 */
  tag_ids: number[];
  /** 備考 */
  description: string | null;
}

// ============================================================
// ファイルボックス (Receipts)
// ============================================================

/** レシート一覧レスポンス */
export interface ReceiptsIndexResponse {
  receipts: Receipt[];
  meta: PaginationMeta;
}

/** レシート詳細レスポンス */
export interface ReceiptResponse {
  receipt: Receipt;
}

/** レシート (ファイルボックス) */
export interface Receipt {
  /** レシートID */
  id: number;
  /** ステータス (unconfirmed: 未確認, confirmed: 確認済み, deleted: 削除済み, ignored: 無視) */
  status: 'unconfirmed' | 'confirmed' | 'deleted' | 'ignored';
  /** 説明 */
  description: string | null;
  /** MIMEタイプ */
  mime_type: string;
  /** 発生日 */
  issue_date: string | null;
  /** 取引先名（OCR結果） */
  origin: string | null;
  /** 作成日時 */
  created_at: string;
  /** ファイルソース */
  file_src: string;
  /** ユーザー */
  user: {
    id: number;
    email: string;
    display_name: string | null;
  };
  /** 金額 */
  amount: number | null;
  /** インボイス制度登録番号ステータス */
  qualified_invoice_status: string | null;
}

/** レシートアップロードパラメータ */
export interface ReceiptCreateParams {
  /** 事業所ID */
  company_id: number;
  /** レシートファイル (FormData) */
  receipt: File | Blob;
  /** 説明 */
  description?: string;
  /** 発生日 */
  issue_date?: string;
}

// ============================================================
// 共通型
// ============================================================

/** 税区分 */
export interface Tax {
  /** 税区分コード */
  code: number;
  /** 税区分名 */
  name: string;
  /** 税区分名（日本語） */
  name_ja: string;
}

/** 品目 */
export interface Item {
  /** 品目ID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** 品目名 */
  name: string;
  /** ショートカット1 */
  shortcut1: string | null;
  /** ショートカット2 */
  shortcut2: string | null;
  /** 利用可否 */
  available: boolean;
  /** 更新日時 */
  update_date: string;
}

/** 部門 */
export interface Section {
  /** 部門ID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** 部門名 */
  name: string;
  /** ショートカット1 */
  shortcut1: string | null;
  /** ショートカット2 */
  shortcut2: string | null;
  /** 利用可否 */
  available: boolean;
  /** 親部門ID */
  parent_id: number | null;
}

/** メモタグ */
export interface Tag {
  /** タグID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** タグ名 */
  name: string;
  /** ショートカット1 */
  shortcut1: string | null;
  /** ショートカット2 */
  shortcut2: string | null;
  /** 更新日時 */
  update_date: string;
}

/** 口座 */
export interface Walletable {
  /** 口座ID */
  id: number;
  /** 口座名 */
  name: string;
  /** 口座タイプ (bank_account: 銀行口座, credit_card: クレジットカード, wallet: 現金) */
  type: 'bank_account' | 'credit_card' | 'wallet';
  /** 銀行ID */
  bank_id: number | null;
  /** 最終残高 */
  last_balance: number | null;
  /** 口座残高 */
  walletable_balance: number | null;
}
