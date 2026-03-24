/**
 * Slack API 型定義
 * 公式: https://api.slack.com/
 * Web API: https://api.slack.com/methods
 * Base URL: https://slack.com/api
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface SlackOAuthResponse {
  /** 処理結果 */
  ok: boolean;
  /** アクセストークン（Bot Token） */
  access_token: string;
  /** トークン種別 */
  token_type: 'bot' | 'user';
  /** スコープ */
  scope: string;
  /** Bot User ID */
  bot_user_id: string;
  /** App ID */
  app_id: string;
  /** チーム情報 */
  team: { id: string; name: string };
  /** ユーザートークン（User Token Scopeが付与された場合） */
  authed_user?: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  /** Incoming Webhook情報 */
  incoming_webhook?: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
}

// ============================================================
// 共通レスポンス
// ============================================================

/** Slack API共通レスポンス */
export interface SlackApiResponse {
  /** 処理結果 */
  ok: boolean;
  /** エラーコード（okがfalseの場合） */
  error?: string;
  /** 警告メッセージ */
  warning?: string;
  /** レスポンスメタデータ */
  response_metadata?: {
    next_cursor?: string;
    scopes?: string[];
  };
}

// ============================================================
// メッセージ (Messages)
// ============================================================

/** メッセージ送信レスポンス */
export interface ChatPostMessageResponse extends SlackApiResponse {
  /** チャンネルID */
  channel: string;
  /** タイムスタンプ（メッセージID） */
  ts: string;
  /** メッセージ */
  message: SlackMessage;
}

/** メッセージ送信パラメータ */
export interface ChatPostMessageParams {
  /** チャンネルID or チャンネル名 */
  channel: string;
  /** メッセージテキスト */
  text?: string;
  /** Block Kit要素 */
  blocks?: SlackBlock[];
  /** アタッチメント */
  attachments?: SlackAttachment[];
  /** スレッドのタイムスタンプ（返信時） */
  thread_ts?: string;
  /** メンションの通知（trueでスレッド内でもチャンネルに通知） */
  reply_broadcast?: boolean;
  /** Markdownパース (full, none) */
  mrkdwn?: boolean;
  /** リンク展開 */
  unfurl_links?: boolean;
  /** メディアリンク展開 */
  unfurl_media?: boolean;
}

/** Slackメッセージ */
export interface SlackMessage {
  /** メッセージ種別 */
  type: string;
  /** サブタイプ */
  subtype?: string;
  /** テキスト */
  text: string;
  /** タイムスタンプ（メッセージID） */
  ts: string;
  /** ユーザーID */
  user?: string;
  /** Bot ID */
  bot_id?: string;
  /** Block Kit要素 */
  blocks?: SlackBlock[];
  /** アタッチメント */
  attachments?: SlackAttachment[];
  /** スレッドのタイムスタンプ */
  thread_ts?: string;
  /** スレッドの返信数 */
  reply_count?: number;
}

/** Block Kit要素（簡易版） */
export interface SlackBlock {
  /** ブロック種別 (section, divider, header, actions, context, image) */
  type: string;
  /** ブロックID */
  block_id?: string;
  /** テキスト要素 */
  text?: { type: 'mrkdwn' | 'plain_text'; text: string };
  /** フィールド */
  fields?: Array<{ type: string; text: string }>;
  /** アクセサリ */
  accessory?: Record<string, unknown>;
  /** 要素 */
  elements?: Array<Record<string, unknown>>;
}

/** アタッチメント */
export interface SlackAttachment {
  /** フォールバックテキスト */
  fallback?: string;
  /** カラー */
  color?: string;
  /** タイトル */
  title?: string;
  /** テキスト */
  text?: string;
  /** フィールド */
  fields?: Array<{ title: string; value: string; short?: boolean }>;
  /** フッター */
  footer?: string;
  /** タイムスタンプ */
  ts?: number;
}

// ============================================================
// チャンネル (Conversations)
// ============================================================

/** チャンネル一覧レスポンス */
export interface ConversationsListResponse extends SlackApiResponse {
  /** チャンネル一覧 */
  channels: SlackChannel[];
}

/** チャンネル */
export interface SlackChannel {
  /** チャンネルID */
  id: string;
  /** チャンネル名 */
  name: string;
  /** チャンネルかどうか */
  is_channel: boolean;
  /** グループかどうか */
  is_group: boolean;
  /** DMかどうか */
  is_im: boolean;
  /** アーカイブ済みかどうか */
  is_archived: boolean;
  /** プライベートかどうか */
  is_private: boolean;
  /** メンバーかどうか */
  is_member: boolean;
  /** トピック */
  topic: { value: string; creator: string; last_set: number };
  /** 目的 */
  purpose: { value: string; creator: string; last_set: number };
  /** メンバー数 */
  num_members: number;
  /** 作成日時 (UNIX timestamp) */
  created: number;
}

// ============================================================
// ファイル (Files)
// ============================================================

/** ファイルアップロードレスポンス */
export interface FilesUploadResponse extends SlackApiResponse {
  /** ファイル情報 */
  file: SlackFile;
}

/** Slackファイル */
export interface SlackFile {
  /** ファイルID */
  id: string;
  /** ファイル名 */
  name: string;
  /** ファイルタイプ */
  filetype: string;
  /** MIMEタイプ */
  mimetype: string;
  /** ファイルサイズ (bytes) */
  size: number;
  /** プレビューURL */
  url_private: string;
  /** ダウンロードURL */
  url_private_download: string;
  /** タイムスタンプ */
  timestamp: number;
  /** チャンネルID配列 */
  channels: string[];
}

// ============================================================
// Incoming Webhook
// ============================================================

/** Incoming Webhook送信パラメータ */
export interface IncomingWebhookParams {
  /** メッセージテキスト */
  text: string;
  /** Block Kit要素 */
  blocks?: SlackBlock[];
  /** アタッチメント */
  attachments?: SlackAttachment[];
  /** ユーザー名（オーバーライド） */
  username?: string;
  /** アイコンURL */
  icon_url?: string;
  /** アイコン絵文字 */
  icon_emoji?: string;
  /** チャンネル（オーバーライド） */
  channel?: string;
}

// ============================================================
// Slash Commands
// ============================================================

/** Slash Commandペイロード */
export interface SlashCommandPayload {
  /** コマンド名 */
  command: string;
  /** コマンドテキスト */
  text: string;
  /** レスポンスURL */
  response_url: string;
  /** トリガーID */
  trigger_id: string;
  /** ユーザーID */
  user_id: string;
  /** ユーザー名 */
  user_name: string;
  /** チャンネルID */
  channel_id: string;
  /** チャンネル名 */
  channel_name: string;
  /** チームID */
  team_id: string;
  /** チームドメイン */
  team_domain: string;
}

// ============================================================
// Events API
// ============================================================

/** Events APIペイロード */
export interface EventPayload {
  /** イベント種別 */
  type: 'url_verification' | 'event_callback';
  /** チャレンジ（URL検証時） */
  challenge?: string;
  /** トークン */
  token: string;
  /** チームID */
  team_id?: string;
  /** イベント */
  event?: SlackEvent;
  /** イベントID */
  event_id?: string;
  /** イベント時刻 */
  event_time?: number;
}

/** Slackイベント */
export interface SlackEvent {
  /** イベント種別 (message, app_mention, etc.) */
  type: string;
  /** サブタイプ */
  subtype?: string;
  /** ユーザーID */
  user?: string;
  /** テキスト */
  text?: string;
  /** チャンネルID */
  channel?: string;
  /** タイムスタンプ */
  ts?: string;
  /** スレッドタイムスタンプ */
  thread_ts?: string;
}
