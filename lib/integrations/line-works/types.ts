/**
 * LINE WORKS API 2.0 型定義
 * 公式: https://developers.worksmobile.com/jp/docs/api
 * 認証: https://developers.worksmobile.com/jp/docs/auth
 */

// ============================================================
// 認証 (JWT / OAuth2)
// ============================================================

/** サービスアカウント認証（JWT）トークンレスポンス */
export interface LineWorksTokenResponse {
  /** アクセストークン */
  access_token: string;
  /** トークン種別 (Bearer) */
  token_type: string;
  /** 有効期限（秒） */
  expires_in: number;
  /** スコープ */
  scope: string;
}

/** JWT生成パラメータ */
export interface JwtParams {
  /** Client ID（Developer Console発行） */
  clientId: string;
  /** Service Account ID */
  serviceAccountId: string;
  /** Private Key（PEM形式） */
  privateKey: string;
  /** スコープ */
  scope: string[];
}

// ============================================================
// Bot (ボット)
// ============================================================

/** ボット情報 */
export interface Bot {
  /** Bot ID */
  botId: string;
  /** Bot名 */
  name: string;
  /** 説明 */
  description: string | null;
  /** Bot画像URL */
  photoUrl: string | null;
  /** ドメインID */
  domainId: number;
  /** 作成日時 */
  createdTime: string;
  /** 更新日時 */
  modifiedTime: string;
}

// ============================================================
// メッセージ (Messages)
// ============================================================

/** メッセージ送信パラメータ */
export interface SendMessageParams {
  /** 送信先（ユーザーID or チャンネルID） */
  to: string;
  /** メッセージコンテンツ */
  content: MessageContent;
}

/** メッセージコンテンツ */
export type MessageContent =
  | TextMessageContent
  | ImageMessageContent
  | FileMessageContent
  | TemplateMessageContent
  | FlexMessageContent;

/** テキストメッセージ */
export interface TextMessageContent {
  /** コンテンツ種別 */
  type: 'text';
  /** テキスト本文 */
  text: string;
}

/** 画像メッセージ */
export interface ImageMessageContent {
  /** コンテンツ種別 */
  type: 'image';
  /** プレビュー画像URL */
  previewImageUrl: string;
  /** オリジナル画像URL */
  originalContentUrl: string;
}

/** ファイルメッセージ */
export interface FileMessageContent {
  /** コンテンツ種別 */
  type: 'file';
  /** ファイルID */
  fileId: string;
}

/** テンプレートメッセージ */
export interface TemplateMessageContent {
  /** コンテンツ種別 */
  type: 'template';
  /** 代替テキスト */
  altText: string;
  /** テンプレート */
  template: {
    type: 'buttons' | 'confirm' | 'carousel' | 'list';
    [key: string]: unknown;
  };
}

/** Flexメッセージ */
export interface FlexMessageContent {
  /** コンテンツ種別 */
  type: 'flex';
  /** 代替テキスト */
  altText: string;
  /** Flexコンテンツ */
  contents: Record<string, unknown>;
}

/** メッセージ送信レスポンス */
export interface SendMessageResponse {
  /** メッセージID */
  messageId: string;
}

// ============================================================
// カレンダー (Calendar)
// ============================================================

/** カレンダー一覧レスポンス */
export interface CalendarsResponse {
  /** カレンダー一覧 */
  calendars: Calendar[];
}

/** カレンダー */
export interface Calendar {
  /** カレンダーID */
  calendarId: string;
  /** カレンダー名 */
  name: string;
  /** 説明 */
  description: string | null;
  /** カラーコード */
  color: string;
}

/** カレンダーイベント一覧レスポンス */
export interface CalendarEventsResponse {
  /** イベント一覧 */
  events: CalendarEvent[];
}

/** カレンダーイベント */
export interface CalendarEvent {
  /** イベントID */
  eventId: string;
  /** カレンダーID */
  calendarId: string;
  /** タイトル */
  summary: string;
  /** 説明 */
  description: string | null;
  /** 場所 */
  location: string | null;
  /** 開始日時 */
  start: EventDateTime;
  /** 終了日時 */
  end: EventDateTime;
  /** 終日イベントかどうか */
  isAllDay: boolean;
  /** 繰り返しルール */
  recurrence: string[] | null;
  /** 参加者 */
  attendees: EventAttendee[];
  /** 作成者 */
  creator: { userId: string; name: string };
  /** ステータス */
  status: 'confirmed' | 'tentative' | 'cancelled';
}

/** イベント日時 */
export interface EventDateTime {
  /** 日時 (ISO 8601) */
  dateTime?: string;
  /** 日付（終日イベント用、yyyy-MM-dd） */
  date?: string;
  /** タイムゾーン */
  timeZone: string;
}

/** イベント参加者 */
export interface EventAttendee {
  /** ユーザーID */
  userId: string;
  /** 表示名 */
  displayName: string;
  /** 参加ステータス */
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
}

/** イベント作成パラメータ */
export interface CalendarEventCreateParams {
  /** カレンダーID */
  calendarId: string;
  /** タイトル */
  summary: string;
  /** 説明 */
  description?: string;
  /** 場所 */
  location?: string;
  /** 開始日時 */
  start: EventDateTime;
  /** 終了日時 */
  end: EventDateTime;
  /** 終日イベント */
  isAllDay?: boolean;
  /** 参加者のユーザーID配列 */
  attendees?: string[];
}

// ============================================================
// アドレス帳 (Directory / Contacts)
// ============================================================

/** メンバー一覧レスポンス */
export interface MembersResponse {
  /** メンバー一覧 */
  members: Member[];
  /** 次ページカーソル */
  nextCursor: string | null;
}

/** メンバー（ユーザー）情報 */
export interface Member {
  /** ユーザーID */
  userId: string;
  /** 名前 */
  userName: {
    /** 姓 */
    lastName: string;
    /** 名 */
    firstName: string;
    /** フリガナ（姓） */
    lastNamePhonetic?: string;
    /** フリガナ（名） */
    firstNamePhonetic?: string;
  };
  /** メールアドレス */
  email: string;
  /** 電話番号 */
  cellPhone?: string;
  /** 部署名 */
  organizations?: Array<{
    /** 組織名 */
    orgName: string;
    /** 役職 */
    jobTitle?: string;
    /** 主務かどうか */
    primary: boolean;
  }>;
  /** アバターURL */
  avatarUrl?: string;
  /** 外線電話 */
  telephone?: string;
  /** ステータス (active, inactive, deleted) */
  status: 'active' | 'inactive' | 'deleted';
}

// ============================================================
// グループ (Groups)
// ============================================================

/** グループ一覧レスポンス */
export interface GroupsResponse {
  /** グループ一覧 */
  groups: LineWorksGroup[];
  /** 次ページカーソル */
  nextCursor: string | null;
}

/** グループ */
export interface LineWorksGroup {
  /** グループID */
  groupId: string;
  /** グループ名 */
  groupName: string;
  /** 説明 */
  description: string | null;
  /** メンバー数 */
  memberCount: number;
}
