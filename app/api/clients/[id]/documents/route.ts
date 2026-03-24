/**
 * ドキュメント一覧取得 API Route
 *
 * GET /api/clients/[id]/documents
 *
 * Google DriveのフォルダIDからファイル一覧を取得し、
 * Supabase vouchersテーブルのデータと合わせて返す。
 *
 * クエリパラメータ:
 * - fiscal_year: 年度でフィルタ（任意）
 * - voucher_type: 証憑タイプでフィルタ（任意）
 * - source: データソース drive | db | both（デフォルト: both）
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveClient } from '@/lib/google-drive';
import { supabase } from '@/lib/supabase';

/** レスポンス用のドキュメント型 */
interface DocumentItem {
  /** DB上のvoucher ID（DB由来の場合） */
  id: string | null;
  /** ファイル名 */
  fileName: string;
  /** ファイルサイズ（バイト） */
  fileSize: string | null;
  /** MIMEタイプ */
  mimeType: string;
  /** 証憑タイプ */
  voucherType: string | null;
  /** Google Drive ファイルID */
  driveFileId: string | null;
  /** Google Drive URL */
  driveUrl: string | null;
  /** サムネイルURL */
  thumbnailUrl: string | null;
  /** 年度 */
  fiscalYear: number | null;
  /** 月 */
  fiscalMonth: number | null;
  /** OCRステータス */
  ocrStatus: string | null;
  /** アップロード日時 */
  uploadedAt: string | null;
  /** データソース */
  source: 'drive' | 'db' | 'both';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fiscalYear = searchParams.get('fiscal_year');
    const voucherType = searchParams.get('voucher_type');
    const source = (searchParams.get('source') || 'both') as 'drive' | 'db' | 'both';

    if (!supabase) {
      return NextResponse.json(
        { error: 'データベースに接続できません' },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // 1. 顧問先情報の取得
    // ----------------------------------------------------------
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, google_drive_folder_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: '顧問先が見つかりません', client_id: clientId },
        { status: 404 }
      );
    }

    const documents: DocumentItem[] = [];
    const driveFileIds = new Set<string>();

    // ----------------------------------------------------------
    // 2. Google Driveからファイル一覧を取得
    // ----------------------------------------------------------
    if ((source === 'drive' || source === 'both') && client.google_drive_folder_id) {
      const driveClient = await GoogleDriveClient.fromEnv();

      if (driveClient) {
        try {
          // 顧問先フォルダ配下の全ファイルを再帰的に取得
          const driveFiles = await fetchDriveFilesRecursive(
            driveClient,
            client.google_drive_folder_id,
            fiscalYear ? parseInt(fiscalYear) : undefined,
            voucherType || undefined
          );

          for (const file of driveFiles) {
            driveFileIds.add(file.id);
            documents.push({
              id: null,
              fileName: file.name,
              fileSize: file.size || null,
              mimeType: file.mimeType,
              voucherType: file.properties?.voucher_type || null,
              driveFileId: file.id,
              driveUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
              thumbnailUrl: file.thumbnailLink || null,
              fiscalYear: file.properties?.fiscal_year ? parseInt(file.properties.fiscal_year) : null,
              fiscalMonth: file.properties?.fiscal_month ? parseInt(file.properties.fiscal_month) : null,
              ocrStatus: null,
              uploadedAt: file.createdTime || null,
              source: 'drive',
            });
          }
        } catch (driveError) {
          console.error('[Documents] Google Driveからの取得失敗:', driveError);
          // Driveエラーは無視してDBデータのみ返す
        }
      }
    }

    // ----------------------------------------------------------
    // 3. Supabase vouchersテーブルからデータ取得
    // ----------------------------------------------------------
    if (source === 'db' || source === 'both') {
      let query = supabase
        .from('vouchers')
        .select('*')
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false });

      if (fiscalYear) {
        query = query.eq('fiscal_year', parseInt(fiscalYear));
      }
      if (voucherType) {
        query = query.eq('voucher_type', voucherType);
      }

      const { data: vouchers, error: voucherError } = await query;

      if (!voucherError && vouchers) {
        for (const v of vouchers) {
          // Drive由来のデータと重複する場合はマージ
          if (v.google_drive_file_id && driveFileIds.has(v.google_drive_file_id)) {
            // 既存のDriveデータにDB情報をマージ
            const existingIndex = documents.findIndex(
              (d) => d.driveFileId === v.google_drive_file_id
            );
            if (existingIndex >= 0) {
              documents[existingIndex].id = v.id;
              documents[existingIndex].voucherType = v.voucher_type;
              documents[existingIndex].ocrStatus = v.ocr_status;
              documents[existingIndex].fiscalYear = v.fiscal_year;
              documents[existingIndex].fiscalMonth = v.fiscal_month;
              documents[existingIndex].source = 'both';
            }
          } else {
            // DBのみに存在するデータ
            documents.push({
              id: v.id,
              fileName: v.file_name || '(不明)',
              fileSize: null,
              mimeType: 'application/octet-stream',
              voucherType: v.voucher_type,
              driveFileId: v.google_drive_file_id,
              driveUrl: v.google_drive_url,
              thumbnailUrl: null,
              fiscalYear: v.fiscal_year,
              fiscalMonth: v.fiscal_month,
              ocrStatus: v.ocr_status,
              uploadedAt: v.uploaded_at || v.created_at,
              source: 'db',
            });
          }
        }
      }
    }

    // ----------------------------------------------------------
    // 4. レスポンス
    // ----------------------------------------------------------
    return NextResponse.json({
      client_id: clientId,
      client_name: client.name,
      google_drive_folder_id: client.google_drive_folder_id,
      total_count: documents.length,
      filters: {
        fiscal_year: fiscalYear || null,
        voucher_type: voucherType || null,
        source,
      },
      documents,
    });
  } catch (error) {
    console.error('[Documents] 予期しないエラー:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: 'ドキュメント一覧の取得に失敗しました', detail: message },
      { status: 500 }
    );
  }
}

// ============================================================
// ヘルパー: Google Driveからファイルを再帰取得
// ============================================================

import type { DriveFile } from '@/lib/google-drive';

/**
 * フォルダ内のファイルを再帰的に取得する。
 * フォルダ自体はスキップし、ファイルのみを返す。
 * 最大2階層まで探索（パフォーマンス対策）。
 */
async function fetchDriveFilesRecursive(
  client: GoogleDriveClient,
  folderId: string,
  fiscalYear?: number,
  voucherType?: string,
  depth: number = 0,
  maxDepth: number = 3
): Promise<DriveFile[]> {
  if (depth >= maxDepth) return [];

  const { files } = await client.listFiles(folderId);
  const result: DriveFile[] = [];

  for (const file of files) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      // フォルダの場合は再帰探索
      // 年度フィルタ: フォルダ名に年度が含まれる場合のみ
      if (fiscalYear && depth === 0) {
        const yearStr = `${fiscalYear}`;
        if (!file.name.includes(yearStr)) continue;
      }
      // 証憑タイプフィルタ: 対応するフォルダ名の場合のみ
      if (voucherType && depth === 1) {
        const voucherFolderName = GoogleDriveClient.getVoucherFolderName(voucherType);
        if (file.name !== voucherFolderName) continue;
      }

      const subFiles = await fetchDriveFilesRecursive(
        client,
        file.id,
        fiscalYear,
        voucherType,
        depth + 1,
        maxDepth
      );
      result.push(...subFiles);
    } else {
      // ファイルの場合はそのまま追加
      result.push(file);
    }
  }

  return result;
}
