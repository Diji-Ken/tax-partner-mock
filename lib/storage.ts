/**
 * Storage Integration Layer
 *
 * Supabase Storage をデフォルトのストレージプロバイダーとして使用し、
 * Google Drive が設定されている場合はそちらを優先する統合レイヤー。
 *
 * 使い方:
 *   import { uploadFile, listFiles, deleteFile, getStorageProvider } from '@/lib/storage';
 *
 *   const result = await uploadFile(file, 'clients/サクラテック/2026/領収書/receipt.pdf');
 *   const files = await listFiles('clients/サクラテック/2026/領収書');
 */

import { supabase } from './supabase';

// ============================================================
// Types
// ============================================================

export type StorageProvider = 'supabase' | 'google-drive';

export interface UploadResult {
  /** ストレージ上のパス or Google Drive ファイルID */
  path: string;
  /** ダウンロード/プレビュー用URL */
  url: string;
  /** 使用されたプロバイダー */
  provider: StorageProvider;
}

export interface StorageFile {
  /** ファイル名 */
  name: string;
  /** ファイルサイズ (bytes) */
  size: number;
  /** 作成日時 (ISO string) */
  created_at: string;
  /** ダウンロード/プレビュー用URL */
  url: string;
  /** ストレージパス */
  path: string;
  /** MIMEタイプ */
  mimeType?: string;
}

// ============================================================
// Provider Detection
// ============================================================

/**
 * 現在の環境設定に基づいてストレージプロバイダーを判定する。
 * GOOGLE_REFRESH_TOKEN が設定されている場合は Google Drive を優先。
 */
export function getStorageProvider(): StorageProvider {
  if (
    typeof process !== 'undefined' &&
    process.env?.GOOGLE_REFRESH_TOKEN &&
    process.env?.GOOGLE_CLIENT_ID &&
    process.env?.GOOGLE_CLIENT_SECRET
  ) {
    return 'google-drive';
  }
  return 'supabase';
}

// ============================================================
// Upload
// ============================================================

/**
 * ファイルをストレージにアップロードする。
 *
 * @param file - アップロード対象のファイル (File or Blob)
 * @param path - 保存先パス (例: "clients/サクラテック/2026/領収書/receipt_001.pdf")
 * @param options - 追加オプション
 * @returns アップロード結果 (URL, パス, プロバイダー)
 */
export async function uploadFile(
  file: File | Blob,
  path: string,
  options?: {
    /** 既存ファイルを上書きするか (デフォルト: true) */
    upsert?: boolean;
    /** Content-Type (未指定時はfileから推定) */
    contentType?: string;
  },
): Promise<UploadResult> {
  const provider = getStorageProvider();

  if (provider === 'google-drive') {
    // Google Drive 実装 (環境変数が揃っている場合のみ到達)
    // 将来的に lib/google-drive.ts の GoogleDriveClient を利用
    throw new Error(
      'Google Drive ストレージは未実装です。GOOGLE_REFRESH_TOKEN を削除してSupabase Storageをご利用ください。',
    );
  }

  // ----- Supabase Storage -----
  const sb = supabase;
  if (!sb) {
    throw new Error('Supabase が設定されていません。NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を確認してください。');
  }

  const { data, error } = await sb.storage
    .from('vouchers')
    .upload(path, file, {
      upsert: options?.upsert ?? true,
      contentType: options?.contentType || (file instanceof File ? file.type : undefined),
    });

  if (error) {
    throw new Error(`ファイルのアップロードに失敗しました: ${error.message}`);
  }

  // Signed URL を生成 (private bucket なので getPublicUrl は使えない)
  const { data: signedData, error: signedError } = await sb.storage
    .from('vouchers')
    .createSignedUrl(data.path, 60 * 60); // 1時間有効

  const url = signedError
    ? sb.storage.from('vouchers').getPublicUrl(data.path).data.publicUrl
    : signedData.signedUrl;

  return {
    path: data.path,
    url,
    provider: 'supabase',
  };
}

// ============================================================
// List Files
// ============================================================

/**
 * 指定フォルダ内のファイル一覧を取得する。
 *
 * @param folder - フォルダパス (例: "clients/サクラテック/2026/領収書")
 * @returns ファイル一覧
 */
export async function listFiles(folder: string): Promise<StorageFile[]> {
  const sb = supabase;
  if (!sb) return [];

  const { data, error } = await sb.storage
    .from('vouchers')
    .list(folder, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error || !data) return [];

  // .emptyFolderPlaceholder を除外
  const files = data.filter((f) => f.name !== '.emptyFolderPlaceholder');

  return Promise.all(
    files.map(async (f) => {
      const filePath = `${folder}/${f.name}`;
      const { data: signedData } = await sb.storage
        .from('vouchers')
        .createSignedUrl(filePath, 60 * 60);

      const url = signedData?.signedUrl
        || sb.storage.from('vouchers').getPublicUrl(filePath).data.publicUrl;

      return {
        name: f.name,
        size: f.metadata?.size || 0,
        created_at: f.created_at || new Date().toISOString(),
        url,
        path: filePath,
        mimeType: f.metadata?.mimetype || undefined,
      };
    }),
  );
}

// ============================================================
// Delete
// ============================================================

/**
 * ファイルを削除する。
 *
 * @param path - 削除対象のファイルパス
 */
export async function deleteFile(path: string): Promise<void> {
  const sb = supabase;
  if (!sb) return;

  const { error } = await sb.storage.from('vouchers').remove([path]);
  if (error) {
    throw new Error(`ファイルの削除に失敗しました: ${error.message}`);
  }
}

// ============================================================
// Utility: Generate storage path for vouchers
// ============================================================

/**
 * 証憑用のストレージパスを生成する。
 *
 * @param clientId - 顧問先ID
 * @param fiscalYear - 年度
 * @param voucherType - 証憑タイプ (receipt, invoice, bank_statement等)
 * @param fileName - ファイル名
 * @returns ストレージパス
 */
export function buildVoucherPath(
  clientId: string,
  fiscalYear: number,
  voucherType: string,
  fileName: string,
): string {
  return `${clientId}/${fiscalYear}/${voucherType}/${fileName}`;
}
