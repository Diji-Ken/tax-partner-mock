/**
 * Google OAuth2 コールバック API Route
 *
 * GET /api/auth/google/callback
 *
 * 使い方:
 * 1. ?setup=true でアクセス → Google認証画面にリダイレクト
 * 2. Google認証後、認可コードと共にここにリダイレクトされる
 * 3. リフレッシュトークンを表示（.env.localにセットする）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl, exchangeCodeForTokens } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const setup = searchParams.get('setup');
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // エラーハンドリング（ユーザーが認証を拒否した場合等）
  if (error) {
    return NextResponse.json(
      {
        error: 'Google認証エラー',
        detail: error,
        description: searchParams.get('error_description') || '',
      },
      { status: 400 }
    );
  }

  // セットアップモード: Google認証画面にリダイレクト
  if (setup === 'true') {
    // 環境変数チェック
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'placeholder') {
      return NextResponse.json(
        {
          error: '環境変数が未設定です',
          message: '.env.local に GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET を設定してください。',
          guide: '/docs/google-drive-setup.md を参照',
        },
        { status: 500 }
      );
    }

    const authUrl = getGoogleAuthUrl();
    return NextResponse.redirect(authUrl);
  }

  // 認可コードを受け取ってトークンを取得
  if (code) {
    try {
      const tokens = await exchangeCodeForTokens(code);

      // セキュリティ上、本番環境ではトークンを画面に表示しない
      // 開発環境でのみリフレッシュトークンを表示する
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        return NextResponse.json({
          message: 'Google Drive認証が完了しました',
          instructions: '以下のリフレッシュトークンを .env.local の GOOGLE_REFRESH_TOKEN にセットしてください。',
          refresh_token: tokens.refresh_token || '(リフレッシュトークンが返されませんでした。access_type=offlineかつprompt=consentで再認証してください)',
          access_token_preview: tokens.access_token.substring(0, 20) + '...',
          expires_in: tokens.expires_in,
          scope: tokens.scope,
        });
      }

      // 本番環境では成功メッセージのみ
      return NextResponse.json({
        message: 'Google Drive認証が完了しました',
        success: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      return NextResponse.json(
        {
          error: 'トークンの取得に失敗しました',
          detail: errorMessage,
        },
        { status: 500 }
      );
    }
  }

  // パラメータ不足
  return NextResponse.json(
    {
      error: 'パラメータが不足しています',
      usage: {
        setup: 'GET /api/auth/google/callback?setup=true でGoogle認証を開始',
        callback: 'Google認証後、認可コードと共に自動リダイレクトされます',
      },
    },
    { status: 400 }
  );
}
