/**
 * 国税庁 法人番号公表システム Web-API 型定義
 * 公式: https://www.houjin-bangou.nta.go.jp/webapi/
 * 仕様書: https://www.houjin-bangou.nta.go.jp/webapi/kyuusiyousyo.html
 *
 * レスポンス形式: XML / CSV（JSONは非対応）
 * APIバージョン: 1, 2, 3, 4（最新: 4）
 */

// ============================================================
// リクエストパラメータ
// ============================================================

/** 法人番号検索パラメータ (GET /{version}/num) */
export interface CorporateNumRequest {
  /** アプリケーションID（事前申請で取得） */
  id: string;
  /** 法人番号（13桁、カンマ区切りで複数指定可能） */
  number: string;
  /** レスポンス形式 (01: csv(Shift_JIS), 02: csv(Unicode), 12: xml) */
  type: '01' | '02' | '12';
  /** 変更履歴の有無 (0: なし, 1: あり) */
  history: '0' | '1';
}

/** 法人名検索パラメータ (GET /{version}/name) */
export interface CorporateNameRequest {
  /** アプリケーションID */
  id: string;
  /** 法人名（URLエンコード必須） */
  name: string;
  /** レスポンス形式 */
  type: '01' | '02' | '12';
  /** 検索方式 (1: 前方一致, 2: 部分一致) */
  mode: '1' | '2';
  /** 検索対象 (1: あいまい検索, 2: 完全一致, 3: 英語表記) */
  target: '1' | '2' | '3';
  /** 都道府県コード (01-47、全国: 指定なし) */
  address?: string;
  /** 法人種別 (01: 国の機関, 02: 地方公共団体, 03: 設立登記法人, 04: 外国会社等, 05: その他) */
  kind?: string;
  /** 変更履歴の有無 */
  history?: '0' | '1';
  /** 閉鎖法人の有無 (0: 含めない, 1: 含める) */
  close?: '0' | '1';
  /** 取得開始件数（ページング用、1始まり） */
  from?: string;
  /** 分割番号 */
  divide?: string;
}

/** 期間指定差分検索パラメータ (GET /{version}/diff) */
export interface CorporateDiffRequest {
  /** アプリケーションID */
  id: string;
  /** 取得開始日 (yyyy-MM-dd) */
  from: string;
  /** 取得終了日 (yyyy-MM-dd) */
  to: string;
  /** レスポンス形式 */
  type: '01' | '02' | '12';
  /** 都道府県コード */
  address?: string;
  /** 法人種別 */
  kind?: string;
  /** 分割番号 */
  divide?: string;
}

// ============================================================
// XML レスポンス型定義（パース後のオブジェクト形式）
// ============================================================

/** 法人番号検索レスポンス */
export interface CorporateNumResponse {
  /** 最終更新日 */
  lastUpdateDate: string;
  /** 件数 */
  count: number;
  /** 分割番号 */
  divideNumber: number;
  /** 分割数 */
  divideSize: number;
  /** 法人情報一覧 */
  corporations: Corporation[];
}

/** 法人名検索レスポンス */
export interface CorporateNameResponse {
  /** 最終更新日 */
  lastUpdateDate: string;
  /** 件数 */
  count: number;
  /** 分割番号 */
  divideNumber: number;
  /** 分割数 */
  divideSize: number;
  /** 法人情報一覧 */
  corporations: Corporation[];
}

/** 差分検索レスポンス */
export interface CorporateDiffResponse {
  /** 最終更新日 */
  lastUpdateDate: string;
  /** 件数 */
  count: number;
  /** 分割番号 */
  divideNumber: number;
  /** 分割数 */
  divideSize: number;
  /** 法人情報一覧 */
  corporations: Corporation[];
}

/** 法人情報 */
export interface Corporation {
  /** 一連番号 */
  sequenceNumber: number;
  /** 法人番号（13桁） */
  corporateNumber: string;
  /** 処理区分 (01: 新規, 11: 商号等変更, 12: 本店所在地変更, 21: 閉鎖, 22: 閉鎖取消, 71: 削除, 99: その他) */
  process: string;
  /** 訂正区分 (0: 訂正なし, 1: 訂正あり) */
  correct: '0' | '1';
  /** 更新年月日 (yyyy-MM-dd) */
  updateDate: string;
  /** 変更年月日 (yyyy-MM-dd) */
  changeDate: string;
  /** 法人名 */
  name: string;
  /** 法人名フリガナ */
  nameImageId: string | null;
  /** 法人種別 (101: 国の機関等, 201: 地方公共団体, 301: 株式会社, 302: 有限会社, ...) */
  kind: string;
  /** 都道府県コード */
  prefectureCode: string | null;
  /** 市区町村コード */
  cityCode: string | null;
  /** 丁目番地等 */
  streetNumber: string | null;
  /** 住所イメージID */
  addressImageId: string | null;
  /** 都道府県名 */
  prefectureName: string | null;
  /** 市区町村名 */
  cityName: string | null;
  /** 国内住所（都道府県+市区町村+丁目番地） */
  postCode: string | null;
  /** 住所（フルテキスト） */
  addressOutside: string | null;
  /** 住所（英語） */
  addressOutsideImageId: string | null;
  /** 閉鎖年月日 */
  closeDate: string | null;
  /** 閉鎖事由 (01: 清算の結了等, 11: 合併による解散, 21: 登記官による閉鎖, 31: その他) */
  closeCause: string | null;
  /** 承継法人の法人番号 */
  successorCorporateNumber: string | null;
  /** 変更事由の詳細 */
  changeCause: string | null;
  /** 資格喪失年月日 */
  assignmentDate: string | null;
  /** 最新登記記録の更新年月日 */
  latest: '0' | '1';
  /** 英語表記の法人名 */
  enName: string | null;
  /** 英語表記の住所 */
  enPrefectureName: string | null;
  /** 英語表記の市区町村名 */
  enCityName: string | null;
  /** 英語表記のその他住所 */
  enAddressOutside: string | null;
  /** 法人名フリガナ（Ver.4以降） */
  furigana: string | null;
  /** 法人番号のQRコードURL */
  hpiUrl: string | null;
}
