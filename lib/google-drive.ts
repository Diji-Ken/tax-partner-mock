/**
 * Google Drive クライアント - TAX PARTNER ビジネスロジック層
 *
 * lib/integrations/google-drive/client.ts の低レベルAPI関数を利用し、
 * TAX PARTNER固有のフォルダ構造・証憑管理のビジネスロジックを提供する。
 *
 * 使い方:
 *   const client = new GoogleDriveClient(accessToken);
 *   const folders = await client.createClientFolderStructure('事務所名', '顧問先名', 2026);
 */

import {
  createFolder as driveCreateFolder,
  uploadFileMultipart,
  listFiles,
  deleteFile as driveDeleteFile,
  createPermission,
  refreshAccessToken,
  getAuthorizationUrl as driveGetAuthorizationUrl,
  getAccessToken as driveGetAccessToken,
} from './integrations/google-drive/client';

import type { DriveFile, FileCreateMetadata } from './integrations/google-drive/types';
import { DRIVE_MIME_TYPES } from './integrations/google-drive/types';

// ============================================================
// 定数
// ============================================================

/** 証憑カテゴリの日本語マッピング */
const VOUCHER_FOLDER_NAMES: Record<string, string> = {
  receipt: '領収書',
  invoice: '請求書',
  bank_statement: '銀行明細',
  credit_card: 'クレカ明細',
  settlement: '決算書類',
  tax_return: '税務申告書',
  contract: '契約書',
  other: 'その他',
};

/** TAX PARTNERのルートフォルダ名 */
const ROOT_FOLDER_NAME = 'TAX PARTNER';

/** フォルダ構造のサブフォルダ一覧（デフォルト） */
const DEFAULT_SUBFOLDERS = [
  '領収書',
  '請求書',
  '銀行明細',
  'クレカ明細',
  '決算書類',
  '税務申告書',
];

// ============================================================
// ヘルパー: アクセストークン取得
// ============================================================

/**
 * 環境変数のリフレッシュトークンからアクセストークンを取得する。
 * 環境変数が未設定の場合はnullを返す（ビルド時エラー防止）。
 */
async function getValidAccessToken(): Promise<string | null> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken || refreshToken === 'placeholder') {
    console.warn('[GoogleDrive] GOOGLE_REFRESH_TOKEN が未設定です。Google Drive機能はスキップされます。');
    return null;
  }

  try {
    const tokenResponse = await refreshAccessToken(refreshToken);
    return tokenResponse.access_token;
  } catch (error) {
    console.error('[GoogleDrive] アクセストークンの取得に失敗:', error);
    return null;
  }
}

// ============================================================
// GoogleDriveClient クラス
// ============================================================

export class GoogleDriveClient {
  private accessToken: string;

  /**
   * @param accessToken - Google Drive APIのアクセストークン
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * 環境変数からクライアントを自動生成する。
   * リフレッシュトークンからアクセストークンを取得して初期化。
   * 環境変数が未設定の場合はnullを返す。
   */
  static async fromEnv(): Promise<GoogleDriveClient | null> {
    const token = await getValidAccessToken();
    if (!token) return null;
    return new GoogleDriveClient(token);
  }

  // ----------------------------------------------------------
  // フォルダ操作
  // ----------------------------------------------------------

  /**
   * フォルダを作成する。
   * 既に同名フォルダが存在する場合はそのIDを返す（重複作成しない）。
   *
   * @param name - フォルダ名
   * @param parentId - 親フォルダID（省略時はルート）
   * @returns 作成されたフォルダのID
   */
  async createFolder(name: string, parentId?: string): Promise<string> {
    // 既存フォルダの検索
    const existing = await this.findFolder(name, parentId);
    if (existing) {
      return existing;
    }

    const folder = await driveCreateFolder(this.accessToken, name, parentId);
    return folder.id;
  }

  /**
   * 同名フォルダが既に存在するか検索する。
   *
   * @param name - フォルダ名
   * @param parentId - 親フォルダID
   * @returns フォルダIDまたはnull
   */
  private async findFolder(name: string, parentId?: string): Promise<string | null> {
    const queryParts = [
      `name = '${name.replace(/'/g, "\\'")}'`,
      `mimeType = '${DRIVE_MIME_TYPES.FOLDER}'`,
      'trashed = false',
    ];
    if (parentId) {
      queryParts.push(`'${parentId}' in parents`);
    }

    const result = await listFiles(this.accessToken, {
      q: queryParts.join(' and '),
      pageSize: 1,
      fields: 'files(id,name)',
    });

    return result.files.length > 0 ? result.files[0].id : null;
  }

  /**
   * 顧問先のフォルダ構造を自動作成する。
   *
   * 構造:
   * ```
   * TAX PARTNER/
   *   └ [事務所名]/
   *       └ [顧問先名]/
   *           └ [年度]/
   *               ├ 領収書/
   *               ├ 請求書/
   *               ├ 銀行明細/
   *               ├ クレカ明細/
   *               ├ 決算書類/
   *               └ 税務申告書/
   * ```
   *
   * @param officeName - 事務所名
   * @param clientName - 顧問先名
   * @param fiscalYear - 年度
   * @param subfolders - サブフォルダ名の配列（省略時はデフォルト）
   * @returns 各フォルダのIDマップ（キー: フォルダ名, 値: フォルダID）
   */
  async createClientFolderStructure(
    officeName: string,
    clientName: string,
    fiscalYear: number,
    subfolders: string[] = DEFAULT_SUBFOLDERS
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    // ルートフォルダ: TAX PARTNER
    const rootId = await this.createFolder(ROOT_FOLDER_NAME);
    result['root'] = rootId;

    // 事務所フォルダ
    const officeId = await this.createFolder(officeName, rootId);
    result['office'] = officeId;

    // 顧問先フォルダ
    const clientId = await this.createFolder(clientName, officeId);
    result['client'] = clientId;

    // 年度フォルダ
    const yearFolderName = `${fiscalYear}年度`;
    const yearId = await this.createFolder(yearFolderName, clientId);
    result['year'] = yearId;

    // サブフォルダ（証憑カテゴリ）
    for (const subfolder of subfolders) {
      const subfolderId = await this.createFolder(subfolder, yearId);
      result[subfolder] = subfolderId;
    }

    return result;
  }

  // ----------------------------------------------------------
  // ファイル操作
  // ----------------------------------------------------------

  /**
   * ファイルをGoogle Driveにアップロードする。
   *
   * @param file - アップロードするファイルデータ（File or Buffer）
   * @param name - ファイル名
   * @param folderId - アップロード先フォルダID
   * @param mimeType - ファイルのMIMEタイプ
   * @param properties - カスタムプロパティ（電帳法対応の取引情報等）
   * @returns アップロードされたファイルのIDとURL
   */
  async uploadFile(
    file: Blob | ArrayBuffer,
    name: string,
    folderId: string,
    mimeType: string,
    properties?: Record<string, string>
  ): Promise<{ id: string; url: string }> {
    const metadata: FileCreateMetadata = {
      name,
      parents: [folderId],
      properties,
    };

    const uploaded = await uploadFileMultipart(
      this.accessToken,
      metadata,
      file,
      mimeType
    );

    return {
      id: uploaded.id,
      url: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
    };
  }

  /**
   * フォルダ内のファイル一覧を取得する。
   *
   * @param folderId - フォルダID
   * @param pageSize - 1ページあたりの件数（デフォルト: 100）
   * @param pageToken - ページネーショントークン
   * @returns ファイル一覧
   */
  async listFiles(
    folderId: string,
    pageSize: number = 100,
    pageToken?: string
  ): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
    const result = await listFiles(this.accessToken, {
      q: `'${folderId}' in parents and trashed = false`,
      pageSize,
      pageToken,
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,properties),nextPageToken',
      orderBy: 'modifiedTime desc',
    });

    return {
      files: result.files,
      nextPageToken: result.nextPageToken,
    };
  }

  /**
   * ファイルをメールアドレスで共有する。
   *
   * @param fileId - ファイルまたはフォルダのID
   * @param email - 共有先メールアドレス
   * @param role - 権限（reader: 閲覧者, writer: 編集者）
   */
  async shareWithEmail(
    fileId: string,
    email: string,
    role: 'reader' | 'writer'
  ): Promise<void> {
    await createPermission(this.accessToken, fileId, {
      type: 'user',
      role,
      emailAddress: email,
      sendNotificationEmail: true,
    });
  }

  /**
   * ファイルまたはフォルダを削除する。
   *
   * @param fileId - 削除するファイルまたはフォルダのID
   */
  async deleteFile(fileId: string): Promise<void> {
    await driveDeleteFile(this.accessToken, fileId);
  }

  // ----------------------------------------------------------
  // 証憑ヘルパー
  // ----------------------------------------------------------

  /**
   * 証憑タイプから適切なフォルダ名を取得する。
   *
   * @param voucherType - 証憑タイプ（receipt, invoice, bank_statement等）
   * @returns 日本語フォルダ名
   */
  static getVoucherFolderName(voucherType: string): string {
    return VOUCHER_FOLDER_NAMES[voucherType] || 'その他';
  }

  /**
   * 証憑タイプの一覧を取得する。
   * フロントエンドのセレクトボックス等で使用。
   */
  static getVoucherTypes(): Array<{ value: string; label: string }> {
    return Object.entries(VOUCHER_FOLDER_NAMES).map(([value, label]) => ({
      value,
      label,
    }));
  }
}

// ============================================================
// OAuth認証ヘルパー（API Route用）
// ============================================================

/**
 * Google OAuth2認証URLを生成する。
 * API Route `/api/auth/google/callback?setup=true` から呼び出す。
 */
export function getGoogleAuthUrl(): string {
  return driveGetAuthorizationUrl(
    'https://www.googleapis.com/auth/drive.file',
    'offline'
  );
}

/**
 * 認可コードからトークンを取得する。
 * API Route `/api/auth/google/callback` から呼び出す。
 */
export async function exchangeCodeForTokens(code: string) {
  return driveGetAccessToken(code);
}

// ============================================================
// エクスポート（定数）
// ============================================================

export { VOUCHER_FOLDER_NAMES, ROOT_FOLDER_NAME, DEFAULT_SUBFOLDERS };
export type { DriveFile };
