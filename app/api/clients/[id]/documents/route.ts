/**
 * ドキュメント一覧取得 API Route
 *
 * GET /api/clients/[id]/documents
 *
 * ストレージ統合レイヤーとSupabase vouchersテーブルのデータを統合して返す。
 *
 * クエリパラメータ:
 * - fiscal_year: 年度でフィルタ (任意)
 * - voucher_type: 証憑タイプでフィルタ (任意)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { listFiles } from '@/lib/storage';

/** レスポンス用のドキュメント型 */
interface DocumentItem {
  /** DB上のvoucher ID */
  id: string;
  /** ファイル名 */
  fileName: string;
  /** ファイルサイズ (バイト) */
  fileSize: number | null;
  /** 証憑タイプ */
  voucherType: string | null;
  /** ストレージプロバイダー */
  storageProvider: string | null;
  /** ストレージパス */
  storagePath: string | null;
  /** ダウンロード/プレビューURL */
  url: string | null;
  /** Google Drive URL (Driveの場合) */
  driveUrl: string | null;
  /** 年度 */
  fiscalYear: number | null;
  /** 月 */
  fiscalMonth: number | null;
  /** OCRステータス */
  ocrStatus: string | null;
  /** アップロード日時 */
  uploadedAt: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: clientId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fiscalYear = searchParams.get('fiscal_year');
    const voucherType = searchParams.get('voucher_type');

    if (!supabase) {
      return NextResponse.json(
        { error: 'データベースに接続できません' },
        { status: 500 },
      );
    }

    // ----------------------------------------------------------
    // 1. 顧問先情報の取得
    // ----------------------------------------------------------
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: '顧問先が見つかりません', client_id: clientId },
        { status: 404 },
      );
    }

    // ----------------------------------------------------------
    // 2. Supabase vouchersテーブルからデータ取得
    // ----------------------------------------------------------
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

    const documents: DocumentItem[] = [];

    if (!voucherError && vouchers) {
      for (const v of vouchers) {
        // Supabase Storage の場合、Signed URL を生成
        let url: string | null = v.google_drive_url || null;
        if (v.storage_provider === 'supabase' && v.storage_path) {
          const { data: signedData } = await supabase.storage
            .from('vouchers')
            .createSignedUrl(v.storage_path, 60 * 60);
          url = signedData?.signedUrl || null;
        }

        documents.push({
          id: v.id,
          fileName: v.file_name || '(不明)',
          fileSize: null,
          voucherType: v.voucher_type,
          storageProvider: v.storage_provider || null,
          storagePath: v.storage_path || null,
          url,
          driveUrl: v.google_drive_url || null,
          fiscalYear: v.fiscal_year,
          fiscalMonth: v.fiscal_month,
          ocrStatus: v.ocr_status,
          uploadedAt: v.uploaded_at || v.created_at,
        });
      }
    }

    // ----------------------------------------------------------
    // 3. レスポンス
    // ----------------------------------------------------------
    return NextResponse.json({
      client_id: clientId,
      client_name: client.name,
      total_count: documents.length,
      filters: {
        fiscal_year: fiscalYear || null,
        voucher_type: voucherType || null,
      },
      documents,
    });
  } catch (error) {
    console.error('[Documents] 予期しないエラー:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: 'ドキュメント一覧の取得に失敗しました', detail: message },
      { status: 500 },
    );
  }
}
