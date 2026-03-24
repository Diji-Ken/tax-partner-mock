/**
 * ChatWork API v2 型定義
 * 公式リファレンス: https://developer.chatwork.com/reference
 * Base URL: https://api.chatwork.com/v2
 */

// ============================================================
// 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface ChatworkTokenResponse {
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
// ユーザー (Me)
// ============================================================

/** 自分自身の情報 */
export interface Me {
  /** アカウントID */
  account_id: number;
  /** ルームID */
  room_id: number;
  /** 名前 */
  name: string;
  /** ChatWork ID */
  chatwork_id: string;
  /** 組織ID */
  organization_id: number;
  /** 組織名 */
  organization_name: string;
  /** 部署 */
  department: string;
  /** 役職 */
  title: string;
  /** URL */
  url: string;
  /** 自己紹介 */
  introduction: string;
  /** メールアドレス */
  mail: string;
  /** 電話番号（組織） */
  tel_organization: string;
  /** 電話番号（内線） */
  tel_extension: string;
  /** 電話番号（携帯） */
  tel_mobile: string;
  /** Skype ID */
  skype: string;
  /** Facebook */
  facebook: string;
  /** Twitter */
  twitter: string;
  /** アバター画像URL */
  avatar_image_url: string;
  /** ログインメール */
  login_mail: string;
}

// ============================================================
// ステータス (My Status)
// ============================================================

/** 自分のステータス */
export interface MyStatus {
  /** 未読ルーム数 */
  unread_room_num: number;
  /** メンション数 */
  mention_room_num: number;
  /** マイタスク数 */
  mytask_room_num: number;
  /** 未読数 */
  unread_num: number;
  /** メンション数 */
  mention_num: number;
  /** マイタスク数 */
  mytask_num: number;
}

// ============================================================
// コンタクト (Contacts)
// ============================================================

/** コンタクト */
export interface Contact {
  /** アカウントID */
  account_id: number;
  /** ルームID */
  room_id: number;
  /** 名前 */
  name: string;
  /** ChatWork ID */
  chatwork_id: string;
  /** 組織ID */
  organization_id: number;
  /** 組織名 */
  organization_name: string;
  /** 部署 */
  department: string;
  /** アバター画像URL */
  avatar_image_url: string;
}

// ============================================================
// ルーム (Rooms)
// ============================================================

/** ルーム */
export interface Room {
  /** ルームID */
  room_id: number;
  /** ルーム名 */
  name: string;
  /** ルーム種別 (my: マイチャット, direct: ダイレクト, group: グループ) */
  type: 'my' | 'direct' | 'group';
  /** 権限 (admin: 管理者, member: メンバー, readonly: 閲覧のみ) */
  role: 'admin' | 'member' | 'readonly';
  /** アイコンのパス */
  icon_path: string;
  /** 未読数 */
  unread_num: number;
  /** メンション数 */
  mention_num: number;
  /** マイタスク数 */
  mytask_num: number;
  /** メッセージ数 */
  message_num: number;
  /** ファイル数 */
  file_num: number;
  /** タスク数 */
  task_num: number;
  /** 最終更新時刻 (UNIX timestamp) */
  last_update_time: number;
  /** 概要 */
  description: string;
  /** 固定表示フラグ */
  sticky: boolean;
}

/** ルーム作成パラメータ */
export interface RoomCreateParams {
  /** ルーム名 */
  name: string;
  /** 概要 */
  description?: string;
  /** 招待リンクの作成 (0: 作成しない, 1: 作成する) */
  link?: 0 | 1;
  /** 招待リンクのコード */
  link_code?: string;
  /** 招待リンクの承認要否 (0: 不要, 1: 必要) */
  link_need_acceptance?: 0 | 1;
  /** 管理者のアカウントID配列 */
  members_admin_ids: number[];
  /** メンバーのアカウントID配列 */
  members_member_ids?: number[];
  /** 閲覧のみメンバーのアカウントID配列 */
  members_readonly_ids?: number[];
  /** アイコンプリセット */
  icon_preset?: string;
}

// ============================================================
// メッセージ (Messages)
// ============================================================

/** メッセージ */
export interface Message {
  /** メッセージID */
  message_id: string;
  /** アカウント情報 */
  account: MessageAccount;
  /** メッセージ本文 */
  body: string;
  /** 送信日時 (UNIX timestamp) */
  send_time: number;
  /** 更新日時 (UNIX timestamp) */
  update_time: number;
}

/** メッセージの送信者 */
export interface MessageAccount {
  /** アカウントID */
  account_id: number;
  /** 名前 */
  name: string;
  /** アバター画像URL */
  avatar_image_url: string;
}

/** メッセージ送信パラメータ */
export interface MessageCreateParams {
  /** メッセージ本文 */
  body: string;
  /** 未読管理 (0: 未読にしない) */
  self_unread?: 0 | 1;
}

// ============================================================
// タスク (Tasks)
// ============================================================

/** タスク */
export interface Task {
  /** タスクID */
  task_id: number;
  /** ルームID */
  room_id: number;
  /** タスク作成者 */
  account: MessageAccount;
  /** タスク担当者 */
  assigned_by_account: MessageAccount;
  /** タスク本文 */
  body: string;
  /** 期限 (UNIX timestamp) */
  limit_time: number;
  /** 期限の種別 (none, date, time) */
  limit_type: 'none' | 'date' | 'time';
  /** ステータス (open: 未完了, done: 完了) */
  status: 'open' | 'done';
}

/** タスク作成パラメータ */
export interface TaskCreateParams {
  /** タスク本文 */
  body: string;
  /** 担当者のアカウントID配列 */
  to_ids: number[];
  /** 期限 (UNIX timestamp) */
  limit?: number;
  /** 期限の種別 */
  limit_type?: 'none' | 'date' | 'time';
}

// ============================================================
// ファイル (Files)
// ============================================================

/** ファイル */
export interface ChatworkFile {
  /** ファイルID */
  file_id: number;
  /** ファイル名 */
  filename: string;
  /** ファイルサイズ (bytes) */
  filesize: number;
  /** アップロード者 */
  account: MessageAccount;
  /** アップロード日時 (UNIX timestamp) */
  upload_time: number;
  /** メッセージID */
  message_id: string;
  /** ダウンロードURL（有効期限あり） */
  download_url?: string;
}

// ============================================================
// 招待リンク (Room Link)
// ============================================================

/** 招待リンク */
export interface RoomLink {
  /** 招待リンクの公開状態 */
  public: boolean;
  /** 招待リンクURL */
  url: string;
  /** 承認要否 */
  need_acceptance: boolean;
  /** 概要 */
  description: string;
}

// ============================================================
// 承認待ちリクエスト (Incoming Requests)
// ============================================================

/** 承認待ちコンタクト申請 */
export interface IncomingRequest {
  /** リクエストID */
  request_id: number;
  /** アカウントID */
  account_id: number;
  /** 名前 */
  name: string;
  /** ChatWork ID */
  chatwork_id: string;
  /** 組織ID */
  organization_id: number;
  /** 組織名 */
  organization_name: string;
  /** 部署 */
  department: string;
  /** メッセージ */
  message: string;
  /** アバター画像URL */
  avatar_image_url: string;
}

// ============================================================
// Webhook
// ============================================================

/** Webhook設定 */
export interface WebhookConfig {
  /** Webhook ID */
  webhook_id: string;
  /** 対象ルームID */
  room_id: number;
  /** WebhookイベントURL */
  webhook_url: string;
  /** 対象イベント */
  events: WebhookEvent[];
}

/** Webhookイベント種別 */
export type WebhookEvent = 'message_created' | 'message_updated' | 'message_deleted';

/** Webhookペイロード */
export interface WebhookPayload {
  /** Webhook設定ID */
  webhook_setting_id: string;
  /** Webhookイベント種別 */
  webhook_event_type: WebhookEvent;
  /** Webhookイベントの送信時刻 (UNIX timestamp) */
  webhook_event_time: number;
  /** ルーム情報 */
  room_id: number;
  /** メッセージ情報 */
  message_id: string;
  /** アカウントID */
  account_id: number;
  /** メッセージ本文 */
  body: string;
  /** 送信日時 */
  send_time: number;
  /** 更新日時 */
  update_time: number;
}
