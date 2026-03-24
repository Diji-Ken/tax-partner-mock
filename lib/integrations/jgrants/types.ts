/**
 * jGrants API (デジタル庁 補助金申請システム) 型定義
 *
 * 公式ドキュメント: https://developers.digital.go.jp/documents/jgrants/api/
 * OpenAPI仕様: jgrants-api.yaml (38.4KB)
 * Base URL: https://api.jgrants-portal.go.jp/exp
 *
 * 認証: 不要（公開API）
 * レスポンス形式: JSON (application/json)
 */

// ============================================================
// リクエストパラメータ
// ============================================================

/**
 * 補助金一覧検索パラメータ (GET /v1/public/subsidies)
 *
 * @see https://developers.digital.go.jp/documents/jgrants/api/
 */
export interface SubsidiesSearchRequest {
  /** 検索キーワード（2文字以上必須） */
  keyword: string;
  /** 業種フィルター（農業・林業、製造業、情報通信業 等） */
  industry?: string;
  /** 対象地域（都道府県名: 東京都、大阪府 等。複数指定は配列で） */
  target_area_search?: string;
  /** 対象従業員数（"5人以下", "6～20人", "21～50人", "51～100人", "101～300人", "301人以上" 等） */
  target_number_of_employees?: string;
  /** ソートフィールド */
  sort?: 'acceptance_end_datetime' | 'acceptance_start_datetime' | 'created_date';
  /** ソート順 */
  order?: 'ASC' | 'DESC';
  /**
   * 受付状態フィルター
   * 0: 全件（受付終了含む）
   * 1: 現在受付中のみ
   */
  acceptance?: 0 | 1;
  /** 利用目的（設備投資、人材育成、販路開拓 等） */
  use_purpose?: string;
}

/**
 * 補助金詳細取得パラメータ (GET /v1/public/subsidies/id/{id})
 */
export interface SubsidyDetailRequest {
  /** 補助金ID（最大18文字） */
  id: string;
}

/**
 * 補助金詳細取得パラメータ V2 (GET /v2/public/subsidies/id/{id})
 * V2ではworkflow（公募回次）情報が追加される
 */
export interface SubsidyDetailV2Request {
  /** 補助金ID（最大18文字） */
  id: string;
}

// ============================================================
// レスポンス型
// ============================================================

/** レスポンスメタデータ */
export interface SubsidiesMetadata {
  /** APIドキュメントURL */
  type: string;
  /** 結果セット情報 */
  resultset: {
    /** 検索結果件数 */
    count: number;
  };
}

/**
 * 補助金一覧検索レスポンス
 * GET /v1/public/subsidies
 */
export interface SubsidiesSearchResponse {
  /** メタデータ */
  metadata: SubsidiesMetadata;
  /** 補助金一覧 */
  result: SubsidySummary[];
}

/** 補助金サマリー（一覧表示用） */
export interface SubsidySummary {
  /** 補助金ID */
  id: string;
  /** 補助金コード（例: "S-01100011"） */
  name: string;
  /** 補助金名称 */
  title: string;
  /** 対象地域（カンマ区切り） */
  target_area_search: string;
  /** 補助上限額（円） */
  subsidy_max_limit: number | null;
  /** 受付開始日時 (ISO 8601) */
  acceptance_start_datetime: string | null;
  /** 受付終了日時 (ISO 8601) */
  acceptance_end_datetime: string | null;
  /** 対象従業員数 */
  target_number_of_employees: string;
}

/**
 * 補助金詳細レスポンス (V1)
 * GET /v1/public/subsidies/id/{id}
 */
export interface SubsidyDetailResponse {
  /** メタデータ */
  metadata: SubsidiesMetadata;
  /** 補助金詳細 */
  result: SubsidyDetail;
}

/** 補助金詳細情報 */
export interface SubsidyDetail {
  /** 補助金ID */
  id: string;
  /** 補助金コード */
  name: string;
  /** 補助金名称 */
  title: string;
  /** キャッチフレーズ */
  subsidy_catch_phrase: string | null;
  /** 詳細説明 */
  detail: string | null;
  /** 利用目的カテゴリ（カンマ区切り: 設備投資、人材育成 等） */
  use_purpose: string;
  /** 対象業種（カンマ区切り） */
  industry: string;
  /** 対象地域（検索用、カンマ区切り） */
  target_area_search: string;
  /** 対象地域（詳細説明テキスト） */
  target_area_detail: string | null;
  /** 対象従業員数 */
  target_number_of_employees: string;
  /** 補助上限額（円） */
  subsidy_max_limit: number | null;
  /** 補助率（例: "1/2", "2/3"） */
  subsidy_rate: string | null;
  /** 受付開始日時 (ISO 8601) */
  acceptance_start_datetime: string | null;
  /** 受付終了日時 (ISO 8601) */
  acceptance_end_datetime: string | null;
  /** 事業完了期限 (ISO 8601) */
  project_end_deadline: string | null;
  /** 申請受付の有無 */
  request_reception_presence: boolean;
  /** 複数回申請の可否 */
  is_enable_multiple_request: boolean;
  /**
   * 公募要領PDF
   * name: ファイル名
   * data: Base64エンコードされたPDFデータ
   */
  application_guidelines: SubsidyDocument | null;
  /**
   * 補助金概要PDF
   * name: ファイル名
   * data: Base64エンコードされたPDFデータ
   */
  outline_of_grant: SubsidyDocument | null;
  /**
   * 申請書PDF
   * name: ファイル名
   * data: Base64エンコードされたPDFデータ
   */
  application_form: SubsidyDocument | null;
}

/** 補助金添付ドキュメント */
export interface SubsidyDocument {
  /** ファイル名 */
  name: string;
  /** Base64エンコードされたファイルデータ */
  data: string;
}

/**
 * 補助金詳細レスポンス (V2)
 * GET /v2/public/subsidies/id/{id}
 * V2ではworkflow（公募回次）情報が追加される
 */
export interface SubsidyDetailV2Response {
  /** メタデータ */
  metadata: SubsidiesMetadata;
  /** 補助金詳細（V2） */
  result: SubsidyDetailV2;
}

/** 補助金詳細情報 (V2) - workflowフィールド追加 */
export interface SubsidyDetailV2 extends Omit<SubsidyDetail, 'acceptance_start_datetime' | 'acceptance_end_datetime' | 'project_end_deadline'> {
  /** 補助金種別（交付金、補助金 等） */
  granttype: string | null;
  /** 公募回次（ワークフロー）一覧 */
  workflow: SubsidyWorkflow[];
}

/** 公募回次（ワークフロー）情報 */
export interface SubsidyWorkflow {
  /** ワークフローID */
  id: string;
  /** 対象地域 */
  target_area_search: string;
  /** 対象地域詳細 */
  target_area_detail: string | null;
  /** 年度・回次（例: "令和6年度 第2回"） */
  fiscal_year_round: string | null;
  /** 受付開始日時 (ISO 8601) */
  acceptance_start_datetime: string | null;
  /** 受付終了日時 (ISO 8601) */
  acceptance_end_datetime: string | null;
  /** 事業完了期限 (ISO 8601) */
  project_end_deadline: string | null;
}

// ============================================================
// エラーレスポンス
// ============================================================

/** APIエラーレスポンス */
export interface JGrantsApiError {
  /** HTTPステータスコード (400, 401, 404, 405, 406, 415, 500, 501) */
  status: number;
  /** エラーメッセージ */
  message: string;
}

// ============================================================
// 税理士CRM向けユーティリティ型
// ============================================================

/** 補助金マッチング結果（顧問先への提案用） */
export interface SubsidyMatchResult {
  /** 補助金情報 */
  subsidy: SubsidySummary;
  /** マッチングスコア (0-100) */
  matchScore: number;
  /** マッチした条件 */
  matchReasons: string[];
  /** 申請期限までの残日数 */
  daysUntilDeadline: number | null;
}

/** 顧問先の補助金検索条件 */
export interface ClientSubsidyProfile {
  /** 業種 */
  industry: string;
  /** 所在地（都道府県） */
  prefecture: string;
  /** 従業員数 */
  employeeCount: number;
  /** 関心のある利用目的 */
  purposes: string[];
  /** キーワード（事業内容等） */
  keywords: string[];
}
