/**
 * クラウドサイン Web API 型定義
 *
 * 公式ドキュメント:
 * - ヘルプセンター: https://help.cloudsign.jp/ja/articles/936884
 * - 利用ガイド: https://help.cloudsign.jp/ja/articles/2681259
 * - Swagger: https://app.swaggerhub.com/apis/CloudSign/cloudsign-web_api/
 *
 * Base URL:
 * - 本番: https://api.cloudsign.jp
 * - サンドボックス: https://api-sandbox.cloudsign.jp
 */

// ============================================================
// 認証
// ============================================================

/** アクセストークンレスポンス */
export interface CloudSignTokenResponse {
  /** アクセストークン（36文字の英数字・ハイフン） */
  access_token: string;
  /** 有効期限（秒）。通常3600（1時間） */
  expires_in: number;
  /** トークン種別 (Bearer) */
  token_type: string;
}

// ============================================================
// 書類 (Documents)
// ============================================================

/** 書類一覧レスポンス */
export interface DocumentsListResponse {
  /** 書類一覧 */
  documents: CloudSignDocument[];
  /** 総件数 */
  total: number;
  /** 現在のページ */
  page: number;
  /** 1ページあたりの件数（最大100） */
  per_page: number;
}

/** 書類 */
export interface CloudSignDocument {
  /** 書類ID */
  id: string;
  /** 書類タイトル */
  title: string;
  /** 書類ステータス */
  status: DocumentStatus;
  /** 備考 */
  note: string | null;
  /** テンプレートID（テンプレートから作成した場合） */
  template_id: string | null;
  /** ファイル一覧 */
  files: CloudSignFile[];
  /** 宛先（署名者）一覧 */
  participants: CloudSignParticipant[];
  /** 作成者情報 */
  created_by: CloudSignUser | null;
  /** 作成日時 (ISO 8601) */
  created_at: string;
  /** 更新日時 (ISO 8601) */
  updated_at: string;
  /** 送信日時 */
  sent_at: string | null;
  /** 完了日時 */
  completed_at: string | null;
  /** 有効期限 */
  expired_at: string | null;
  /** キャビネットID（Enterpriseプラン） */
  cabinet_id: string | null;
}

/** 書類ステータス */
export type DocumentStatus =
  | 'draft'          // 下書き
  | 'sent'           // 送信済み（確認待ち）
  | 'completed'      // 締結完了
  | 'declined'       // 辞退
  | 'cancelled'      // キャンセル
  | 'expired';       // 期限切れ

/** 書類作成パラメータ */
export interface DocumentCreateParams {
  /** 書類タイトル */
  title: string;
  /** 備考 */
  note?: string;
  /** テンプレートID（テンプレートから作成する場合） */
  template_id?: string;
  /** キャビネットID（Enterpriseプラン） */
  cabinet_id?: string;
}

// ============================================================
// ファイル (Files)
// ============================================================

/** 書類に添付されたファイル */
export interface CloudSignFile {
  /** ファイルID */
  id: string;
  /** ファイル名 */
  name: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** MIMEタイプ */
  content_type: string;
  /** ページ数 */
  page_count: number;
  /** 作成日時 */
  created_at: string;
}

// ============================================================
// 宛先・署名者 (Participants)
// ============================================================

/** 宛先（署名者） */
export interface CloudSignParticipant {
  /** 宛先ID */
  id: string;
  /** メールアドレス */
  email: string;
  /** 氏名 */
  name: string | null;
  /** 会社名 */
  organization: string | null;
  /** ステータス */
  status: ParticipantStatus;
  /** 署名順序（1始まり） */
  order: number;
  /** アクセスコード（設定時のみ） */
  access_code: string | null;
  /** 言語設定 */
  language: string;
  /** 確認日時 */
  confirmed_at: string | null;
  /** 作成日時 */
  created_at: string;
}

/** 宛先ステータス */
export type ParticipantStatus =
  | 'waiting'        // 確認待ち
  | 'confirmed'      // 確認済み
  | 'declined';      // 辞退

/** 宛先追加パラメータ */
export interface ParticipantCreateParams {
  /** メールアドレス */
  email: string;
  /** 氏名 */
  name?: string;
  /** 会社名 */
  organization?: string;
  /** 署名順序 */
  order?: number;
  /** アクセスコード */
  access_code?: string;
  /** 言語設定 (ja, en) */
  language?: string;
}

/** 宛先更新パラメータ */
export interface ParticipantUpdateParams {
  /** メールアドレス */
  email?: string;
  /** 氏名 */
  name?: string;
  /** 会社名 */
  organization?: string;
  /** 署名順序 */
  order?: number;
  /** アクセスコード */
  access_code?: string;
}

// ============================================================
// 入力項目 (Widgets)
// ============================================================

/** 入力項目 */
export interface CloudSignWidget {
  /** 入力項目ID */
  id: string;
  /** 入力項目タイプ */
  type: WidgetType;
  /** ラベル名 */
  label: string | null;
  /** 対象の宛先ID */
  participant_id: string;
  /** ファイルID */
  file_id: string;
  /** ページ番号（1始まり） */
  page: number;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** 幅 */
  width: number;
  /** 高さ */
  height: number;
  /** 必須かどうか */
  required: boolean;
  /** 入力値 */
  value: string | null;
}

/** 入力項目タイプ */
export type WidgetType =
  | 'text'           // テキスト入力
  | 'signature'      // 署名欄
  | 'date'           // 日付
  | 'checkbox'       // チェックボックス
  | 'radio'          // ラジオボタン
  | 'stamp';         // 印影

/** 入力項目作成パラメータ */
export interface WidgetCreateParams {
  /** 入力項目タイプ */
  type: WidgetType;
  /** ラベル名 */
  label?: string;
  /** 対象の宛先ID */
  participant_id: string;
  /** ページ番号 */
  page: number;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** 幅 */
  width: number;
  /** 高さ */
  height: number;
  /** 必須かどうか */
  required?: boolean;
}

// ============================================================
// ユーザー情報
// ============================================================

/** ユーザー情報 */
export interface CloudSignUser {
  /** ユーザーID */
  id: string;
  /** メールアドレス */
  email: string;
  /** 氏名 */
  name: string | null;
}

// ============================================================
// 書類属性 (Document Attributes)
// ============================================================

/** 書類属性 */
export interface DocumentAttribute {
  /** 管理項目名 */
  name: string;
  /** 管理項目値 */
  value: string | null;
}

// ============================================================
// 締結証明書
// ============================================================

/** 締結証明書レスポンス */
export interface CertificateResponse {
  /** 締結証明書のダウンロードURL */
  url: string;
}

// ============================================================
// キャビネット (Enterprise)
// ============================================================

/** キャビネット一覧レスポンス */
export interface CabinetsListResponse {
  cabinets: CloudSignCabinet[];
}

/** キャビネット */
export interface CloudSignCabinet {
  /** キャビネットID */
  id: string;
  /** キャビネット名 */
  name: string;
  /** 作成日時 */
  created_at: string;
}

// ============================================================
// インポート書類
// ============================================================

/** インポート書類（PDF管理用） */
export interface ImportedDocument {
  /** インポート書類ID */
  id: string;
  /** タイトル */
  title: string;
  /** ファイル情報 */
  file: CloudSignFile;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

// ============================================================
// Webhook
// ============================================================

/** Webhookイベント */
export interface CloudSignWebhookEvent {
  /** イベント種別 */
  event: WebhookEventType;
  /** 書類ID */
  document_id: string;
  /** イベント発生日時 */
  timestamp: string;
  /** 書類データ */
  document: CloudSignDocument;
}

/** Webhookイベント種別 */
export type WebhookEventType =
  | 'document.created'       // 書類作成
  | 'document.sent'          // 書類送信
  | 'document.confirmed'     // 署名完了（宛先単位）
  | 'document.completed'     // 締結完了
  | 'document.declined'      // 辞退
  | 'document.expired';      // 期限切れ
