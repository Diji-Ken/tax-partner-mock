/**
 * 証憑アップロード API Route
 *
 * POST /api/vouchers/upload
 *
 * multipart/form-dataでファイルを受け取り:
 * 1. ストレージ統合レイヤー経由でアップロード (Supabase Storage or Google Drive)
 * 2. Supabase vouchersテーブルにメタデータを保存
 *
 * リクエストパラメータ:
 * - file: アップロードファイル (必須)
 * - client_id: 顧問先ID (必須)
 * - voucher_type: 証憑タイプ (receipt, invoice, bank_statement等) (必須)
 * - fiscal_year: 年度 (必須)
 * - fiscal_month: 月 (任意)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uploadFile, buildVoucherPath, getStorageProvider } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    // ----------------------------------------------------------
    // 1. リクエストのパース
    // ----------------------------------------------------------
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('client_id') as string | null;
    const voucherType = formData.get('voucher_type') as string | null;
    const fiscalYear = formData.get('fiscal_year') as string | null;
    const fiscalMonth = formData.get('fiscal_month') as string | null;

    // バリデーション
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません', field: 'file' },
        { status: 400 },
      );
    }
    if (!clientId) {
      return NextResponse.json(
        { error: '顧問先IDが指定されていません', field: 'client_id' },
        { status: 400 },
      );
    }
    if (!voucherType) {
      return NextResponse.json(
        { error: '証憑タイプが指定されていません', field: 'voucher_type' },
        { status: 400 },
      );
    }
    if (!fiscalYear) {
      return NextResponse.json(
        { error: '年度が指定されていません', field: 'fiscal_year' },
        { status: 400 },
      );
    }

    // ファイルサイズチェック (10MB以下)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'ファイルサイズが大きすぎます',
          detail: `最大 ${MAX_FILE_SIZE / 1024 / 1024}MB まで対応しています。`,
          actual: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        },
        { status: 400 },
      );
    }

    // ----------------------------------------------------------
    // 2. 顧問先の存在確認
    // ----------------------------------------------------------
    if (!supabase) {
      return NextResponse.json(
        { error: 'データベースに接続できません' },
        { status: 500 },
      );
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, office_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: '顧問先が見つかりません', client_id: clientId },
        { status: 404 },
      );
    }

    // ----------------------------------------------------------
    // 3. ストレージ統合レイヤーでアップロード
    // ----------------------------------------------------------
    const storagePath = buildVoucherPath(
      clientId,
      parseInt(fiscalYear),
      voucherType,
      file.name,
    );

    const provider = getStorageProvider();
    let storageUrl: string | null = null;
    let storedPath: string | null = null;
    let driveFileId: string | null = null;
    let driveFileUrl: string | null = null;

    try {
      const result = await uploadFile(file, storagePath, {
        contentType: file.type || 'application/octet-stream',
      });

      if (result.provider === 'supabase') {
        storageUrl = result.url;
        storedPath = result.path;
      } else {
        // Google Drive の場合
        driveFileId = result.path;
        driveFileUrl = result.url;
      }
    } catch (uploadError) {
      console.error('[Upload] ストレージアップロード失敗:', uploadError);
      // アップロードが失敗してもメタデータのみ保存を続行
      console.warn('[Upload] メタデータのみ保存します');
    }

    // ----------------------------------------------------------
    // 4. Supabase vouchersテーブルにメタデータを保存
    // ----------------------------------------------------------
    const { data: voucher, error: insertError } = await supabase
      .from('vouchers')
      .insert({
        client_id: clientId,
        office_id: client.office_id,
        voucher_type: voucherType,
        file_name: file.name,
        google_drive_file_id: driveFileId,
        google_drive_url: driveFileUrl,
        storage_provider: provider,
        storage_path: storedPath,
        upload_source: 'web',
        ocr_status: 'pending',
        fiscal_year: parseInt(fiscalYear),
        fiscal_month: fiscalMonth ? parseInt(fiscalMonth) : null,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Upload] Supabase INSERT失敗:', insertError);
      return NextResponse.json(
        { error: '証憑メタデータの保存に失敗しました', detail: insertError.message },
        { status: 500 },
      );
    }

    // ----------------------------------------------------------
    // 5. レスポンス
    // ----------------------------------------------------------
    return NextResponse.json({
      success: true,
      voucher: {
        id: voucher.id,
        file_name: file.name,
        voucher_type: voucherType,
        fiscal_year: fiscalYear,
        storage_provider: provider,
        storage_path: storedPath,
        storage_url: storageUrl,
        google_drive_file_id: driveFileId,
        google_drive_url: driveFileUrl,
        uploaded_at: voucher.uploaded_at,
      },
    });
  } catch (error) {
    console.error('[Upload] 予期しないエラー:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: 'アップロードに失敗しました', detail: message },
      { status: 500 },
    );
  }
}
