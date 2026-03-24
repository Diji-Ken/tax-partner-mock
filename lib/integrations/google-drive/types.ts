/**
 * Google Drive API v3 型定義
 *
 * 公式ドキュメント:
 * - APIリファレンス: https://developers.google.com/workspace/drive/api/reference/rest/v3
 * - ファイルアップロード: https://developers.google.com/workspace/drive/api/guides/manage-uploads
 * - 検索クエリ: https://developers.google.com/workspace/drive/api/guides/ref-search-terms
 * - OAuth2スコープ: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
 *
 * Base URL: https://www.googleapis.com/drive/v3
 * Upload URL: https://www.googleapis.com/upload/drive/v3
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface GoogleTokenResponse {
  /** アクセストークン */
  access_token: string;
  /** 有効期限（秒）。通常3600 */
  expires_in: number;
  /** トークン種別 (Bearer) */
  token_type: string;
  /** リフレッシュトークン（初回認証時のみ） */
  refresh_token?: string;
  /** スコープ */
  scope: string;
  /** IDトークン（openidスコープ時） */
  id_token?: string;
}

// ============================================================
// ファイル (Files)
// ============================================================

/** ファイル一覧レスポンス */
export interface FileListResponse {
  /** ファイル一覧 */
  files: DriveFile[];
  /** 次ページトークン */
  nextPageToken?: string;
  /** 不完全な検索かどうか */
  incompleteSearch?: boolean;
  /** リソース種別 */
  kind: string;
}

/** Google Drive ファイル */
export interface DriveFile {
  /** ファイルID */
  id: string;
  /** ファイル名 */
  name: string;
  /** MIMEタイプ */
  mimeType: string;
  /** 説明 */
  description?: string;
  /** スター付きかどうか */
  starred?: boolean;
  /** ゴミ箱に入っているかどうか */
  trashed?: boolean;
  /** 親フォルダID配列 */
  parents?: string[];
  /** バージョン番号 */
  version?: string;
  /** WebコンテンツURL */
  webContentLink?: string;
  /** WebビューURL */
  webViewLink?: string;
  /** アイコンURL */
  iconLink?: string;
  /** サムネイルURL */
  thumbnailLink?: string;
  /** ファイルサイズ（バイト） */
  size?: string;
  /** MD5チェックサム */
  md5Checksum?: string;
  /** 作成日時 (ISO 8601) */
  createdTime?: string;
  /** 更新日時 (ISO 8601) */
  modifiedTime?: string;
  /** 閲覧日時 */
  viewedByMeTime?: string;
  /** 共有日時 */
  sharedWithMeTime?: string;
  /** オーナー情報 */
  owners?: DriveUser[];
  /** 最終更新者 */
  lastModifyingUser?: DriveUser;
  /** 共有ユーザー */
  sharingUser?: DriveUser;
  /** 権限一覧 */
  permissions?: Permission[];
  /** ファイルプロパティ（カスタムメタデータ） */
  properties?: Record<string, string>;
  /** アプリプロパティ */
  appProperties?: Record<string, string>;
  /** エクスポート可能なMIMEタイプ */
  exportLinks?: Record<string, string>;
  /** フォルダのカラー */
  folderColorRgb?: string;
  /** 容量を消費するかどうか */
  quotaBytesUsed?: string;
  /** ファイル拡張子 */
  fileExtension?: string;
  /** フルファイル拡張子 */
  fullFileExtension?: string;
  /** 元のファイル名 */
  originalFilename?: string;
  /** コンテンツ制約 */
  contentRestrictions?: ContentRestriction[];
  /** 書き込み可能かどうか */
  writersCanShare?: boolean;
  /** 閲覧者・コメント者が共有可能か */
  viewersCanCopyContent?: boolean;
}

/** コンテンツ制約 */
export interface ContentRestriction {
  /** 読み取り専用かどうか */
  readOnly: boolean;
  /** 理由 */
  reason?: string;
  /** 制約タイプ */
  type?: string;
}

/** ファイル作成（メタデータ）パラメータ */
export interface FileCreateMetadata {
  /** ファイル名 */
  name: string;
  /** MIMEタイプ */
  mimeType?: string;
  /** 説明 */
  description?: string;
  /** 親フォルダID配列 */
  parents?: string[];
  /** ファイルプロパティ */
  properties?: Record<string, string>;
  /** アプリプロパティ */
  appProperties?: Record<string, string>;
  /** スター付きにするか */
  starred?: boolean;
  /** フォルダのカラー */
  folderColorRgb?: string;
}

// ============================================================
// ユーザー (Users)
// ============================================================

/** Google Drive ユーザー */
export interface DriveUser {
  /** ユーザーの表示名 */
  displayName: string;
  /** メールアドレス */
  emailAddress?: string;
  /** プロフィール写真URL */
  photoLink?: string;
  /** 自分自身かどうか */
  me?: boolean;
  /** 権限ID */
  permissionId?: string;
  /** リソース種別 */
  kind: string;
}

// ============================================================
// 権限 (Permissions)
// ============================================================

/** 権限 */
export interface Permission {
  /** 権限ID */
  id: string;
  /** 権限種別 */
  type: PermissionType;
  /** ロール */
  role: PermissionRole;
  /** メールアドレス（user/group タイプ時） */
  emailAddress?: string;
  /** ドメイン（domain タイプ時） */
  domain?: string;
  /** 表示名 */
  displayName?: string;
  /** プロフィール写真URL */
  photoLink?: string;
  /** 有効期限 (ISO 8601) */
  expirationTime?: string;
  /** 削除済みかどうか */
  deleted?: boolean;
  /** 権限の詳細 */
  permissionDetails?: PermissionDetail[];
  /** 継承権限かどうか */
  inherited?: boolean;
  /** リソース種別 */
  kind: string;
}

/** 権限種別 */
export type PermissionType =
  | 'user'     // 特定ユーザー
  | 'group'    // グループ
  | 'domain'   // ドメイン
  | 'anyone';  // 全員（リンク共有）

/** 権限ロール */
export type PermissionRole =
  | 'owner'           // オーナー
  | 'organizer'       // 管理者（共有ドライブ）
  | 'fileOrganizer'   // ファイル整理担当者
  | 'writer'          // 編集者
  | 'commenter'       // コメント可
  | 'reader';         // 閲覧者

/** 権限詳細 */
export interface PermissionDetail {
  /** 権限種別 */
  permissionType: string;
  /** 継承元 */
  inheritedFrom?: string;
  /** ロール */
  role: string;
  /** 継承かどうか */
  inherited: boolean;
}

/** 権限作成パラメータ */
export interface PermissionCreateParams {
  /** 権限種別 */
  type: PermissionType;
  /** ロール */
  role: PermissionRole;
  /** メールアドレス（user/group） */
  emailAddress?: string;
  /** ドメイン（domain） */
  domain?: string;
  /** 有効期限 */
  expirationTime?: string;
  /** 通知メールを送信するか（デフォルト: true） */
  sendNotificationEmail?: boolean;
  /** 通知メッセージ */
  emailMessage?: string;
  /** 所有権の移転を許可するか */
  transferOwnership?: boolean;
}

/** 権限一覧レスポンス */
export interface PermissionListResponse {
  /** 権限一覧 */
  permissions: Permission[];
  /** 次ページトークン */
  nextPageToken?: string;
  /** リソース種別 */
  kind: string;
}

// ============================================================
// About (アバウト情報)
// ============================================================

/** About情報レスポンス */
export interface AboutResponse {
  /** ユーザー情報 */
  user: DriveUser;
  /** ストレージ容量 */
  storageQuota: {
    /** 上限（バイト） */
    limit?: string;
    /** 使用量（バイト） */
    usage: string;
    /** Drive使用量 */
    usageInDrive: string;
    /** ゴミ箱使用量 */
    usageInDriveTrash: string;
  };
  /** エクスポート可能なMIMEタイプマッピング */
  exportFormats: Record<string, string[]>;
  /** インポート可能なMIMEタイプマッピング */
  importFormats: Record<string, string[]>;
  /** 最大インポートサイズ */
  maxImportSizes: Record<string, string>;
  /** 最大アップロードサイズ（バイト） */
  maxUploadSize: string;
  /** リソース種別 */
  kind: string;
}

// ============================================================
// 変更通知 (Changes)
// ============================================================

/** 変更一覧レスポンス */
export interface ChangeListResponse {
  /** 変更一覧 */
  changes: Change[];
  /** 次ページトークン */
  nextPageToken?: string;
  /** 新しい開始トークン */
  newStartPageToken?: string;
  /** リソース種別 */
  kind: string;
}

/** 変更 */
export interface Change {
  /** 変更種別 */
  changeType: string;
  /** ファイルID */
  fileId?: string;
  /** ファイル情報 */
  file?: DriveFile;
  /** 削除されたかどうか */
  removed: boolean;
  /** 変更時刻 */
  time: string;
  /** リソース種別 */
  kind: string;
}

// ============================================================
// 検索クエリ (電帳法対応)
// ============================================================

/**
 * 電子帳簿保存法の検索要件に対応するための検索パラメータ
 *
 * 電帳法では以下の検索条件が求められる:
 * 1. 日付（取引年月日）
 * 2. 金額
 * 3. 取引先
 *
 * Google Driveではファイルプロパティ(properties)にこれらを格納し、
 * 検索クエリで検索可能にする。
 */
export interface DenchohoSearchParams {
  /** 取引年月日（開始） */
  dateFrom?: string;
  /** 取引年月日（終了） */
  dateTo?: string;
  /** 金額（下限） */
  amountFrom?: number;
  /** 金額（上限） */
  amountTo?: number;
  /** 取引先名 */
  partnerName?: string;
  /** ドキュメントの種類 */
  documentType?: string;
}

/**
 * 電帳法対応のファイルプロパティキー
 * Google Driveのプロパティに設定するキー名
 */
export const DENCHOHO_PROPERTY_KEYS = {
  /** 取引年月日 */
  TRANSACTION_DATE: 'transaction_date',
  /** 金額 */
  AMOUNT: 'amount',
  /** 取引先名 */
  PARTNER_NAME: 'partner_name',
  /** ドキュメント種類 */
  DOCUMENT_TYPE: 'document_type',
  /** 保存者 */
  SAVED_BY: 'saved_by',
  /** 保存日時 */
  SAVED_AT: 'saved_at',
} as const;

/**
 * Google Drive MIMEタイプ定数
 */
export const DRIVE_MIME_TYPES = {
  FOLDER: 'application/vnd.google-apps.folder',
  DOCUMENT: 'application/vnd.google-apps.document',
  SPREADSHEET: 'application/vnd.google-apps.spreadsheet',
  PRESENTATION: 'application/vnd.google-apps.presentation',
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
} as const;
