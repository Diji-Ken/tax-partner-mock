/**
 * 国税庁 適格請求書発行事業者公表システム Web-API 型定義
 * 公式: https://www.invoice-kohyo.nta.go.jp/web-api/index.html
 * 仕様書: https://www.invoice-kohyo.nta.go.jp/web-api/web-api-download.html
 *
 * レスポンス形式: JSON / XML / CSV（typeパラメータで指定）
 */

// ============================================================
// リクエストパラメータ
// ============================================================

/** 登録番号検索パラメータ (GET /1/num) */
export interface InvoiceNumRequest {
  /** アプリケーションID（事前申請で取得） */
  id: string;
  /** 登録番号（T+13桁の数字、カンマ区切りで最大10件） */
  number: string;
  /** レスポンス形式 (01: csv(Shift_JIS), 02: csv(Unicode), 12: xml, 21: json(Unicode)) */
  type: '01' | '02' | '12' | '21';
  /** 変更履歴の有無 (0: 変更履歴なし, 1: 変更履歴あり) */
  history: '0' | '1';
}

/** 期間指定差分検索パラメータ (GET /1/diff) */
export interface InvoiceDiffRequest {
  /** アプリケーションID */
  id: string;
  /** 取得開始日 (yyyy-MM-dd) */
  from: string;
  /** 取得終了日 (yyyy-MM-dd) */
  to: string;
  /** レスポンス形式 */
  type: '01' | '02' | '12' | '21';
  /** 事業者種別 (1: 個人, 2: 法人, 3: 個人+法人) */
  division: '1' | '2' | '3';
  /** 分割番号（大量データ時の分割取得用、1始まり） */
  divide?: string;
}

/** 登録番号＋日付指定検索パラメータ (GET /1/valid) */
export interface InvoiceValidRequest {
  /** アプリケーションID */
  id: string;
  /** 登録番号（T+13桁の数字、カンマ区切りで最大10件） */
  number: string;
  /** 判定日 (yyyy-MM-dd) */
  day: string;
  /** レスポンス形式 */
  type: '01' | '02' | '12' | '21';
}

// ============================================================
// JSON レスポンス
// ============================================================

/** 登録番号検索レスポンス（JSON形式） */
export interface InvoiceNumResponse {
  /** 最終更新日 */
  lastUpdateDate: string;
  /** 件数 */
  count: string;
  /** 分割番号 */
  divideNumber: string;
  /** 分割数 */
  divideSize: string;
  /** 公表情報一覧 */
  announcement: InvoiceAnnouncement[];
}

/** 差分検索レスポンス（JSON形式） */
export interface InvoiceDiffResponse {
  /** 最終更新日 */
  lastUpdateDate: string;
  /** 件数 */
  count: string;
  /** 分割番号 */
  divideNumber: string;
  /** 分割数 */
  divideSize: string;
  /** 公表情報一覧 */
  announcement: InvoiceAnnouncement[];
}

/** 有効性確認レスポンス（JSON形式） */
export interface InvoiceValidResponse {
  /** 最終更新日 */
  lastUpdateDate: string;
  /** 件数 */
  count: string;
  /** 公表情報一覧 */
  announcement: InvoiceValidAnnouncement[];
}

/** 公表情報 */
export interface InvoiceAnnouncement {
  /** 一連番号 */
  sequenceNumber: string;
  /** 登録番号 (T+13桁) */
  registratedNumber: string;
  /** 処理区分 (01: 新規, 02: 変更, 99: 削除) */
  process: '01' | '02' | '99';
  /** 訂正区分 (0: 訂正なし, 1: 訂正あり) */
  correct: '0' | '1';
  /** 人格区分 (1: 個人, 2: 法人) */
  kind: '1' | '2';
  /** 国内外区分 (1: 国内, 2: 国外, 3: 国外取次) */
  country: '1' | '2' | '3';
  /** 氏名又は名称 */
  name: string;
  /** 都道府県コード */
  address: string;
  /** 法人番号（法人の場合のみ） */
  kana: string | null;
  /** 登録年月日 (yyyy-MM-dd) */
  registrationDate: string;
  /** 更新年月日 (yyyy-MM-dd) */
  updateDate: string;
  /** 取消年月日 */
  disposalDate: string | null;
  /** 失効年月日 */
  expireDate: string | null;
  /** 本店又は主たる事務所の所在地（法人のみ） */
  addressInside: string | null;
  /** 本店又は主たる事務所の所在地（都道府県名含む） */
  addressInsidePrefecture: string | null;
  /** 本店又は主たる事務所の所在地（市区町村以下） */
  addressInsideCity: string | null;
  /** 主たる屋号（個人のみ） */
  tradeName: string | null;
  /** 通称・旧姓（個人のみ） */
  popularName_previousName: string | null;
}

/** 有効性確認の公表情報 */
export interface InvoiceValidAnnouncement extends InvoiceAnnouncement {
  /** 有効区分 (0: 無効, 1: 有効) */
  valid: '0' | '1';
}

// ============================================================
// バルク検証（税理士CRM向け拡張）
// ============================================================

/** バルク検証リクエスト */
export interface BulkValidationRequest {
  /** 検証対象の登録番号一覧 */
  numbers: string[];
  /** 判定日（省略時は本日） */
  day?: string;
  /** 並列リクエスト数（デフォルト: 3、API負荷軽減のため制限推奨） */
  concurrency?: number;
}

/** 個別の検証結果 */
export interface ValidationResult {
  /** 登録番号 */
  registrationNumber: string;
  /** 有効性 */
  isValid: boolean;
  /** 事業者名 */
  name: string | null;
  /** 登録日 */
  registrationDate: string | null;
  /** 取消日（取消されている場合） */
  disposalDate: string | null;
  /** 失効日（失効している場合） */
  expireDate: string | null;
  /** 検証日 */
  validatedAt: string;
  /** エラー（取得失敗時） */
  error: string | null;
}

/** バルク検証結果 */
export interface BulkValidationResult {
  /** 検証結果一覧 */
  results: ValidationResult[];
  /** 検証成功数 */
  successCount: number;
  /** 検証失敗数 */
  errorCount: number;
  /** 有効な事業者数 */
  validCount: number;
  /** 無効な事業者数 */
  invalidCount: number;
  /** 検証日 */
  validatedAt: string;
  /** 処理時間 (ms) */
  durationMs: number;
}

// ============================================================
// キャッシュ（税理士CRM向け拡張）
// ============================================================

/** キャッシュエントリ */
export interface CachedValidation {
  /** 登録番号 */
  registrationNumber: string;
  /** 検証結果 */
  result: ValidationResult;
  /** キャッシュ作成日時 */
  cachedAt: number;
  /** キャッシュ有効期限 */
  expiresAt: number;
}

/** キャッシュ統計 */
export interface CacheStats {
  /** キャッシュエントリ数 */
  size: number;
  /** キャッシュヒット数 */
  hits: number;
  /** キャッシュミス数 */
  misses: number;
  /** ヒット率 (0-1) */
  hitRate: number;
}

// ============================================================
// 更新情報定期取得（税理士CRM向け拡張）
// ============================================================

/** 差分更新の結果 */
export interface DiffUpdateResult {
  /** 取得期間（開始） */
  from: string;
  /** 取得期間（終了） */
  to: string;
  /** 新規登録された事業者 */
  newRegistrations: InvoiceAnnouncement[];
  /** 情報が変更された事業者 */
  updatedRegistrations: InvoiceAnnouncement[];
  /** 削除（取消）された事業者 */
  deletedRegistrations: InvoiceAnnouncement[];
  /** 総件数 */
  totalCount: number;
  /** 取得日時 */
  fetchedAt: string;
}
