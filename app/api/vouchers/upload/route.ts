/**
 * 証憑アップロード API Route
 *
 * POST /api/vouchers/upload
 *
 * multipart/form-dataでファイルを受け取り:
 * 1. Google Driveの適切なフォルダにアップロード
 * 2. Supabase vouchersテーブルにメタデータを保存
 *
 * リクエストパラメータ:
 * - file: アップロードファイル（必須）
 * - client_id: 顧問先ID（必須）
 * - voucher_type: 証憑タイプ（receipt, invoice, bank_statement等）（必須）
 * - fiscal_year: 年度（必須）
 * - fiscal_month: 月（任意）
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveClient } from '@/lib/google-drive';
import { supabase } from '@/lib/supabase';

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
        { status: 400 }
      );
    }
    if (!clientId) {
      return NextResponse.json(
        { error: '顧問先IDが指定されていません', field: 'client_id' },
        { status: 400 }
      );
    }
    if (!voucherType) {
      return NextResponse.json(
        { error: '証憑タイプが指定されていません', field: 'voucher_type' },
        { status: 400 }
      );
    }
    if (!fiscalYear) {
      return NextResponse.json(
        { error: '年度が指定されていません', field: 'fiscal_year' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（5MB以下）
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'ファイルサイズが大きすぎます',
          detail: `最大 ${MAX_FILE_SIZE / 1024 / 1024}MB まで対応しています。`,
          actual: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 2. 顧問先のフォルダIDを取得
    // ----------------------------------------------------------
    if (!supabase) {
      return NextResponse.json(
        { error: 'データベースに接続できません' },
        { status: 500 }
      );
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, google_drive_folder_id, office_id, offices:office_id(name, google_drive_folder_id)')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: '顧問先が見つかりません', client_id: clientId },
        { status: 404 }
      );
    }

    // ----------------------------------------------------------
    // 3. Google Driveにアップロード
    // ----------------------------------------------------------
    const driveClient = await GoogleDriveClient.fromEnv();

    let driveFileId: string | null = null;
    let driveFileUrl: string | null = null;

    if (driveClient) {
      // アップロード先フォルダを決定
      let targetFolderId = client.google_drive_folder_id;

      // フォルダIDが未設定の場合、フォルダ構造を自動作成
      if (!targetFolderId) {
        const officeName = (client as any).offices?.name || 'デフォルト事務所';
        const folders = await driveClient.createClientFolderStructure(
          officeName,
          client.name,
          parseInt(fiscalYear)
        );

        // 顧問先のフォルダIDをDBに保存
        await supabase
          .from('clients')
          .update({ google_drive_folder_id: folders['client'] })
          .eq('id', clientId);

        // 証憑タイプに対応するフォルダを取得
        const voucherFolderName = GoogleDriveClient.getVoucherFolderName(voucherType);
        targetFolderId = folders[voucherFolderName] || folders['year'];
      } else {
        // 既存フォルダの場合、年度 + 証憑タイプのサブフォルダを取得/作成
        const yearFolderName = `${fiscalYear}年度`;
        const yearFolderId = await driveClient.createFolder(yearFolderName, targetFolderId);

        const voucherFolderName = GoogleDriveClient.getVoucherFolderName(voucherType);
        targetFolderId = await driveClient.createFolder(voucherFolderName, yearFolderId);
      }

      // ファイルをGoogle Driveにアップロード
      const fileBuffer = await file.arrayBuffer();
      const result = await driveClient.uploadFile(
        fileBuffer,
        file.name,
        targetFolderId,
        file.type || 'application/octet-stream',
        {
          // 電帳法対応: カスタムプロパティに取引情報を保存
          client_id: clientId,
          voucher_type: voucherType,
          fiscal_year: fiscalYear,
          ...(fiscalMonth ? { fiscal_month: fiscalMonth } : {}),
          upload_date: new Date().toISOString().split('T')[0],
        }
      );

      driveFileId = result.id;
      driveFileUrl = result.url;
    } else {
      console.warn('[Upload] Google Drive未設定のため、メタデータのみ保存します');
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
        { status: 500 }
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
      { status: 500 }
    );
  }
}
