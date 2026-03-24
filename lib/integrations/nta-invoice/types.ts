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
