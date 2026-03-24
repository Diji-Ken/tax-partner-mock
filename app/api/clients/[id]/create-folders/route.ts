/**
 * 顧問先フォルダ構造自動作成 API Route
 *
 * POST /api/clients/[id]/create-folders
 *
 * 顧問先を新規登録した際にGoogle Driveにフォルダ構造を自動作成する。
 *
 * 構造:
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
 *
 * リクエストボディ（任意）:
 * - fiscal_year: 年度（省略時は今年度）
 * - share_email: 共有先メールアドレス（省略可）
 * - share_role: 共有権限 reader | writer（デフォルト: writer）
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveClient } from '@/lib/google-drive';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;

    // ----------------------------------------------------------
    // 1. リクエストボディの取得（任意パラメータ）
    // ----------------------------------------------------------
    let fiscalYear = new Date().getFullYear();
    let shareEmail: string | undefined;
    let shareRole: 'reader' | 'writer' = 'writer';

    try {
      const body = await request.json();
      if (body.fiscal_year) fiscalYear = parseInt(body.fiscal_year);
      if (body.share_email) shareEmail = body.share_email;
      if (body.share_role) shareRole = body.share_role;
    } catch {
      // ボディなしでもOK
    }

    // ----------------------------------------------------------
    // 2. 顧問先情報の取得
    // ----------------------------------------------------------
    if (!supabase) {
      return NextResponse.json(
        { error: 'データベースに接続できません' },
        { status: 500 }
      );
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, google_drive_folder_id, office_id, offices:office_id(name)')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: '顧問先が見つかりません', client_id: clientId },
        { status: 404 }
      );
    }

    // 既にフォルダが作成済みの場合
    if (client.google_drive_folder_id) {
      return NextResponse.json({
        success: true,
        message: 'フォルダは既に作成済みです',
        google_drive_folder_id: client.google_drive_folder_id,
        already_exists: true,
      });
    }

    // ----------------------------------------------------------
    // 3. Google Driveクライアントの初期化
    // ----------------------------------------------------------
    const driveClient = await GoogleDriveClient.fromEnv();

    if (!driveClient) {
      return NextResponse.json(
        {
          error: 'Google Drive APIが設定されていません',
          message: '.env.local のGOOGLE_REFRESH_TOKEN等を設定してください。',
          guide: '/docs/google-drive-setup.md を参照',
        },
        { status: 503 }
      );
    }

    // ----------------------------------------------------------
    // 4. フォルダ構造の作成
    // ----------------------------------------------------------
    const officeName = (client as any).offices?.name || 'デフォルト事務所';
    const folders = await driveClient.createClientFolderStructure(
      officeName,
      client.name,
      fiscalYear
    );

    // ----------------------------------------------------------
    // 5. 顧問先のフォルダIDをDBに保存
    // ----------------------------------------------------------
    const { error: updateError } = await supabase
      .from('clients')
      .update({ google_drive_folder_id: folders['client'] })
      .eq('id', clientId);

    if (updateError) {
      console.error('[CreateFolders] DB更新失敗:', updateError);
      // フォルダは作成済みなのでエラーにしない（ワーニングとして返す）
    }

    // ----------------------------------------------------------
    // 6. 共有設定（指定がある場合）
    // ----------------------------------------------------------
    if (shareEmail) {
      try {
        await driveClient.shareWithEmail(folders['client'], shareEmail, shareRole);
      } catch (shareError) {
        console.error('[CreateFolders] 共有設定失敗:', shareError);
        // 共有失敗はエラーにしない（フォルダ作成は成功しているため）
      }
    }

    // ----------------------------------------------------------
    // 7. レスポンス
    // ----------------------------------------------------------
    return NextResponse.json({
      success: true,
      message: 'フォルダ構造を作成しました',
      client_name: client.name,
      fiscal_year: fiscalYear,
      folders: {
        root: folders['root'],
        office: folders['office'],
        client: folders['client'],
        year: folders['year'],
        subfolders: Object.entries(folders)
          .filter(([key]) => !['root', 'office', 'client', 'year'].includes(key))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      },
      shared_with: shareEmail || null,
    });
  } catch (error) {
    console.error('[CreateFolders] 予期しないエラー:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: 'フォルダ作成に失敗しました', detail: message },
      { status: 500 }
    );
  }
}
