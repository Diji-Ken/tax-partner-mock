/**
 * Google Drive API v3 クライアント
 *
 * 公式ドキュメント:
 * - リファレンス: https://developers.google.com/workspace/drive/api/reference/rest/v3
 * - アップロード: https://developers.google.com/workspace/drive/api/guides/manage-uploads
 * - 検索: https://developers.google.com/workspace/drive/api/guides/ref-search-terms
 * - スコープ: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
 *
 * OAuth2認証: Authorization Code Grant
 * Base URL: https://www.googleapis.com/drive/v3
 * Upload URL: https://www.googleapis.com/upload/drive/v3
 */

import type {
  GoogleTokenResponse,
  FileListResponse,
  DriveFile,
  FileCreateMetadata,
  Permission,
  PermissionCreateParams,
  PermissionListResponse,
  AboutResponse,
  ChangeListResponse,
  DenchohoSearchParams,
  DENCHOHO_PROPERTY_KEYS,
} from './types';
import { DRIVE_MIME_TYPES } from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
  baseUrl: 'https://www.googleapis.com/drive/v3',
  uploadUrl: 'https://www.googleapis.com/upload/drive/v3',
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  /** 推奨スコープ: per-file アクセス（非センシティブ） */
  defaultScope: 'https://www.googleapis.com/auth/drive.file',
};

// ============================================================
// ヘルパー
// ============================================================

function getHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

async function get<T>(path: string, token: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const qs = params ? buildQueryString(params) : '';
  const url = `${config.baseUrl}${path}${qs}`;
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...getHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function patch<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { ...getHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function del(path: string, token: string): Promise<void> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'DELETE', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
}

// ============================================================
// OAuth2 認証
// ============================================================

/**
 * OAuth2認証URL生成
 *
 * @param scope - OAuth2スコープ。デフォルトは drive.file（per-fileアクセス、非センシティブ）
 * @param accessType - アクセスタイプ。'offline'でリフレッシュトークン取得
 *
 * 利用可能なスコープ:
 * - https://www.googleapis.com/auth/drive.file (推奨: per-fileアクセス)
 * - https://www.googleapis.com/auth/drive (全ファイルアクセス)
 * - https://www.googleapis.com/auth/drive.readonly (読み取り専用)
 * - https://www.googleapis.com/auth/drive.metadata (メタデータのみ)
 * - https://www.googleapis.com/auth/drive.appdata (アプリデータのみ)
 */
export function getAuthorizationUrl(
  scope?: string,
  accessType: 'online' | 'offline' = 'offline'
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scope || config.defaultScope,
    access_type: accessType,
    prompt: 'consent',
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * 認証コードからアクセストークンを取得
 * @param code - OAuth2認可コード
 */
export async function getAccessToken(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }).toString(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google OAuth2 token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<GoogleTokenResponse>;
}

/**
 * リフレッシュトークンでアクセストークンを更新
 * @param refreshToken - リフレッシュトークン
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }).toString(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google OAuth2 refresh error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<GoogleTokenResponse>;
}

// ============================================================
// ファイル操作 (Files)
// ============================================================

/**
 * ファイル一覧取得
 * GET /drive/v3/files
 *
 * @param token - アクセストークン
 * @param opts - 検索オプション
 */
export async function listFiles(
  token: string,
  opts?: {
    q?: string;
    pageSize?: number;
    pageToken?: string;
    fields?: string;
    orderBy?: string;
    spaces?: string;
  }
): Promise<FileListResponse> {
  return get<FileListResponse>('/files', token, {
    ...opts,
    fields: opts?.fields || 'files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,properties),nextPageToken',
  });
}

/**
 * ファイル詳細取得
 * GET /drive/v3/files/{fileId}
 */
export async function getFile(
  token: string,
  fileId: string,
  fields?: string
): Promise<DriveFile> {
  return get<DriveFile>(`/files/${fileId}`, token, {
    fields: fields || 'id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners,permissions,properties',
  });
}

/**
 * ファイルメタデータのみで作成（フォルダ作成等）
 * POST /drive/v3/files
 */
export async function createFileMetadata(token: string, metadata: FileCreateMetadata): Promise<DriveFile> {
  return post<DriveFile>('/files', token, metadata);
}

/**
 * フォルダを作成
 *
 * @param token - アクセストークン
 * @param name - フォルダ名
 * @param parentId - 親フォルダID（省略時はルート）
 */
export async function createFolder(token: string, name: string, parentId?: string): Promise<DriveFile> {
  const metadata: FileCreateMetadata = {
    name,
    mimeType: DRIVE_MIME_TYPES.FOLDER,
    parents: parentId ? [parentId] : undefined,
  };
  return createFileMetadata(token, metadata);
}

/**
 * ファイルアップロード（マルチパート）
 * POST /upload/drive/v3/files?uploadType=multipart
 *
 * 5MB以下のファイル向け。メタデータとファイルデータを一度に送信。
 *
 * @param token - アクセストークン
 * @param metadata - ファイルメタデータ
 * @param fileContent - ファイルデータ
 * @param mimeType - ファイルのMIMEタイプ
 */
export async function uploadFileMultipart(
  token: string,
  metadata: FileCreateMetadata,
  fileContent: Blob | ArrayBuffer,
  mimeType: string
): Promise<DriveFile> {
  const boundary = '---tax-partner-boundary-' + Date.now();

  const metadataStr = JSON.stringify(metadata);
  const bodyParts = [
    `--${boundary}\r\n`,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    metadataStr,
    `\r\n--${boundary}\r\n`,
    `Content-Type: ${mimeType}\r\n\r\n`,
  ];

  // Blob/Buffer対応
  const metaBlob = new Blob(bodyParts, { type: 'text/plain' });
  const endBlob = new Blob([`\r\n--${boundary}--`], { type: 'text/plain' });
  const body = new Blob([metaBlob, fileContent, endBlob]);

  const url = `${config.uploadUrl}/files?uploadType=multipart`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Drive upload error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<DriveFile>;
}

/**
 * レジュマブルアップロードの開始
 * POST /upload/drive/v3/files?uploadType=resumable
 *
 * 5MB超のファイル向け。セッションURIを取得後、チャンク送信。
 *
 * @param token - アクセストークン
 * @param metadata - ファイルメタデータ
 * @param fileSize - ファイルサイズ（バイト）
 * @param mimeType - ファイルのMIMEタイプ
 * @returns セッションURI（PUTでチャンクデータを送信）
 */
export async function initiateResumableUpload(
  token: string,
  metadata: FileCreateMetadata,
  fileSize: number,
  mimeType: string
): Promise<string> {
  const url = `${config.uploadUrl}/files?uploadType=resumable`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType,
      'X-Upload-Content-Length': String(fileSize),
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Drive resumable upload init error: ${response.status} - ${errorBody}`);
  }

  const sessionUri = response.headers.get('Location');
  if (!sessionUri) {
    throw new Error('Google Drive resumable upload: No session URI returned');
  }
  return sessionUri;
}

/**
 * ファイルメタデータの更新
 * PATCH /drive/v3/files/{fileId}
 */
export async function updateFileMetadata(
  token: string,
  fileId: string,
  metadata: Partial<FileCreateMetadata>
): Promise<DriveFile> {
  return patch<DriveFile>(`/files/${fileId}`, token, metadata);
}

/**
 * ファイルの削除
 * DELETE /drive/v3/files/{fileId}
 */
export async function deleteFile(token: string, fileId: string): Promise<void> {
  return del(`/files/${fileId}`, token);
}

/**
 * ファイルのコピー
 * POST /drive/v3/files/{fileId}/copy
 */
export async function copyFile(
  token: string,
  fileId: string,
  metadata?: Partial<FileCreateMetadata>
): Promise<DriveFile> {
  return post<DriveFile>(`/files/${fileId}/copy`, token, metadata || {});
}

/**
 * ファイルのダウンロード
 * GET /drive/v3/files/{fileId}?alt=media
 */
export async function downloadFile(token: string, fileId: string): Promise<Blob> {
  const url = `${config.baseUrl}/files/${fileId}?alt=media`;
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    throw new Error(`Google Drive download error: ${response.status}`);
  }
  return response.blob();
}

/**
 * ファイルのエクスポート（Google Workspace形式 → 他形式）
 * GET /drive/v3/files/{fileId}/export
 *
 * @param token - アクセストークン
 * @param fileId - ファイルID
 * @param exportMimeType - エクスポート先MIMEタイプ (例: 'application/pdf')
 */
export async function exportFile(token: string, fileId: string, exportMimeType: string): Promise<Blob> {
  const url = `${config.baseUrl}/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    throw new Error(`Google Drive export error: ${response.status}`);
  }
  return response.blob();
}

// ============================================================
// 権限・共有 (Permissions)
// ============================================================

/**
 * ファイルの権限一覧取得
 * GET /drive/v3/files/{fileId}/permissions
 */
export async function listPermissions(token: string, fileId: string): Promise<PermissionListResponse> {
  return get<PermissionListResponse>(`/files/${fileId}/permissions`, token, {
    fields: 'permissions(id,type,role,emailAddress,displayName,expirationTime,deleted),nextPageToken',
  });
}

/**
 * ファイルに権限を追加（共有設定）
 * POST /drive/v3/files/{fileId}/permissions
 *
 * 注意: 同一ファイルへの同時並行権限操作は非対応。最後の更新のみ反映される
 */
export async function createPermission(
  token: string,
  fileId: string,
  params: PermissionCreateParams
): Promise<Permission> {
  const { sendNotificationEmail, emailMessage, transferOwnership, ...permissionBody } = params;
  const queryParams: Record<string, string | boolean | undefined> = {};
  if (sendNotificationEmail !== undefined) queryParams.sendNotificationEmail = sendNotificationEmail;
  if (emailMessage) queryParams.emailMessage = emailMessage;
  if (transferOwnership !== undefined) queryParams.transferOwnership = transferOwnership;

  const qs = buildQueryString(queryParams);
  const url = `${config.baseUrl}/files/${fileId}/permissions${qs}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { ...getHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(permissionBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Drive permission error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<Permission>;
}

/**
 * 権限の削除（共有解除）
 * DELETE /drive/v3/files/{fileId}/permissions/{permissionId}
 */
export async function deletePermission(
  token: string,
  fileId: string,
  permissionId: string
): Promise<void> {
  return del(`/files/${fileId}/permissions/${permissionId}`, token);
}

// ============================================================
// About情報
// ============================================================

/**
 * ドライブ情報取得（ユーザー・容量等）
 * GET /drive/v3/about
 */
export async function getAbout(token: string): Promise<AboutResponse> {
  return get<AboutResponse>('/about', token, {
    fields: 'user,storageQuota,exportFormats,importFormats,maxUploadSize',
  });
}

// ============================================================
// ファイル検索 (電帳法対応)
// ============================================================

/**
 * 電子帳簿保存法の検索要件に対応したファイル検索
 *
 * Google Driveのpropertiesに保存された取引情報を検索する。
 * properties はファイル作成時にappPropertiesまたはpropertiesに設定しておく。
 *
 * @param token - アクセストークン
 * @param folderId - 検索対象フォルダID
 * @param searchParams - 電帳法検索パラメータ
 */
export async function searchByDenchoho(
  token: string,
  folderId: string,
  searchParams: DenchohoSearchParams
): Promise<FileListResponse> {
  const queryParts: string[] = [];

  // 親フォルダ指定
  queryParts.push(`'${folderId}' in parents`);
  queryParts.push('trashed = false');

  // 取引先名で検索（properties使用）
  if (searchParams.partnerName) {
    queryParts.push(`properties has { key='partner_name' and value='${searchParams.partnerName}' }`);
  }

  // ドキュメント種類で検索
  if (searchParams.documentType) {
    queryParts.push(`properties has { key='document_type' and value='${searchParams.documentType}' }`);
  }

  // 日付範囲はpropertiesで直接フィルタできないため、
  // 取得後にクライアント側でフィルタする必要がある。
  // ここではcreatedTime/modifiedTimeで近似検索を行う。
  if (searchParams.dateFrom) {
    queryParts.push(`modifiedTime >= '${searchParams.dateFrom}T00:00:00'`);
  }
  if (searchParams.dateTo) {
    queryParts.push(`modifiedTime <= '${searchParams.dateTo}T23:59:59'`);
  }

  const q = queryParts.join(' and ');

  return listFiles(token, {
    q,
    fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,properties,appProperties),nextPageToken',
    pageSize: 100,
  });
}

/**
 * 電帳法対応のフォルダ構成を作成
 *
 * 推奨構成:
 * [ルート]
 *   └ [年度] (例: 2026年度)
 *       ├ [月] (例: 01月)
 *       │   ├ 請求書/
 *       │   ├ 領収書/
 *       │   ├ 契約書/
 *       │   └ その他/
 *       ├ [月] (例: 02月)
 *       ...
 *
 * @param token - アクセストークン
 * @param rootFolderId - ルートフォルダID
 * @param fiscalYear - 年度
 * @param months - 作成する月の配列（デフォルト: 1〜12）
 * @param categories - カテゴリ配列（デフォルト: 請求書,領収書,契約書,その他）
 */
export async function createDenchohoFolderStructure(
  token: string,
  rootFolderId: string,
  fiscalYear: number,
  months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  categories: string[] = ['請求書', '領収書', '契約書', 'その他']
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {};

  // 年度フォルダ作成
  const yearFolder = await createFolder(token, `${fiscalYear}年度`, rootFolderId);

  for (const month of months) {
    const monthStr = String(month).padStart(2, '0');
    const monthFolder = await createFolder(token, `${monthStr}月`, yearFolder.id);

    result[monthStr] = {};
    for (const category of categories) {
      const catFolder = await createFolder(token, category, monthFolder.id);
      result[monthStr][category] = catFolder.id;
    }
  }

  return result;
}
