# Google Drive API セットアップ手順

TAX PARTNERでGoogle Driveを利用するための設定手順です。

---

## 1. Google Cloud Project の作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 左上の「プロジェクトを選択」→「新しいプロジェクト」をクリック
3. プロジェクト名: `tax-partner`（任意）
4. 「作成」をクリック

---

## 2. Google Drive API の有効化

1. 作成したプロジェクトを選択
2. 左メニュー「APIとサービス」→「ライブラリ」
3. 検索バーで「Google Drive API」と検索
4. 「Google Drive API」をクリック →「有効にする」

---

## 3. OAuth 同意画面の設定

1. 左メニュー「APIとサービス」→「OAuth 同意画面」
2. ユーザーの種類: **外部**（テスト段階では内部でもOK）
3. 以下を入力:
   - アプリ名: `TAX PARTNER`
   - ユーザーサポートメール: 自分のメールアドレス
   - デベロッパーの連絡先情報: 自分のメールアドレス
4. 「保存して次へ」
5. スコープの追加:
   - `https://www.googleapis.com/auth/drive.file`（このアプリで作成したファイルのみアクセス）
6. テストユーザーに自分のGoogleアカウントを追加
7. 「保存して次へ」→「ダッシュボードに戻る」

---

## 4. OAuth 2.0 クライアントIDの作成（フロントエンド/認証用）

1. 左メニュー「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類: **ウェブ アプリケーション**
4. 名前: `TAX PARTNER Web Client`
5. 承認済みのリダイレクト URI を追加:
   - **開発環境**: `http://localhost:3000/api/auth/google/callback`
   - **本番環境**: `https://your-domain.com/api/auth/google/callback`
6. 「作成」をクリック
7. 表示される **クライアント ID** と **クライアント シークレット** をメモ

---

## 5. サービスアカウントの作成（バックエンド用・オプション）

> サービスアカウントはバッチ処理やサーバー間通信で使用する場合に作成します。
> テスト段階ではOAuth2.0のリフレッシュトークンで十分です。

1. 左メニュー「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「サービス アカウント」
3. サービスアカウント名: `tax-partner-backend`
4. 「作成して続行」
5. 役割: 不要（スキップ可）
6. 「完了」
7. 作成されたサービスアカウントの行をクリック
8. 「キー」タブ →「鍵を追加」→「新しい鍵を作成」
9. キーのタイプ: **JSON**
10. ダウンロードされたJSONファイルを安全に保管

### サービスアカウントで共有ドライブを使う場合

サービスアカウントのメールアドレス（`xxx@xxx.iam.gserviceaccount.com`）に対して、
対象のGoogle Driveフォルダを「編集者」で共有する。

---

## 6. リフレッシュトークンの取得（テスト用）

開発サーバーを起動してOAuth認証フローを実行します。

### 手順

```bash
# 1. 開発サーバーを起動
npm run dev

# 2. ブラウザで以下にアクセス
# http://localhost:3000/api/auth/google/callback?setup=true
# → Google認証画面にリダイレクトされる

# 3. Googleアカウントでログイン・許可
# → コールバックでリフレッシュトークンが表示される

# 4. 表示されたリフレッシュトークンを .env.local にセット
```

### 手動でリフレッシュトークンを取得する場合

```bash
# 1. 認証URLをブラウザで開く
https://accounts.google.com/o/oauth2/v2/auth?\
client_id=YOUR_CLIENT_ID&\
redirect_uri=http://localhost:3000/api/auth/google/callback&\
response_type=code&\
scope=https://www.googleapis.com/auth/drive.file&\
access_type=offline&\
prompt=consent

# 2. 認可コードを使ってトークンを取得
curl -X POST https://oauth2.googleapis.com/token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=http://localhost:3000/api/auth/google/callback"

# 3. レスポンスの refresh_token を .env.local にセット
```

---

## 7. 環境変数の設定

`.env.local` に以下を追加:

```env
# Google Drive API
GOOGLE_CLIENT_ID=取得したクライアントID
GOOGLE_CLIENT_SECRET=取得したクライアントシークレット
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=取得したリフレッシュトークン
```

---

## 8. 必要なスコープ一覧

| スコープ | 説明 | 用途 | 推奨 |
|---------|------|------|------|
| `drive.file` | このアプリで作成・開いたファイルのみ | 証憑アップロード、フォルダ作成 | **推奨（最小権限）** |
| `drive` | すべてのファイルへのフルアクセス | 既存ファイルの検索・移動 | 必要時のみ |
| `drive.readonly` | すべてのファイルの読み取り専用 | ファイル一覧の閲覧 | 閲覧専用ユーザー用 |
| `drive.metadata` | メタデータの読み取り専用 | ファイル情報のみ取得 | 管理画面用 |
| `drive.appdata` | アプリデータフォルダのみ | アプリ設定の保存 | 未使用 |

### TAX PARTNERで使用するスコープ

```
https://www.googleapis.com/auth/drive.file
```

`drive.file` スコープを使用することで:
- このアプリが作成したフォルダ・ファイルのみアクセス可能
- ユーザーの他のDriveファイルには一切アクセスしない
- OAuth同意画面で「非センシティブ」に分類される（審査不要）
- フォルダ作成、ファイルアップロード、共有設定すべて可能

---

## 9. 動作確認

環境変数をセットしたら、以下のAPIで動作確認:

```bash
# フォルダ構造の自動作成（顧問先ID指定）
curl -X POST http://localhost:3000/api/clients/{client_id}/create-folders

# 証憑アップロード
curl -X POST http://localhost:3000/api/vouchers/upload \
  -F "file=@receipt.pdf" \
  -F "client_id=CLIENT_UUID" \
  -F "voucher_type=receipt" \
  -F "fiscal_year=2026"

# ドキュメント一覧取得
curl http://localhost:3000/api/clients/{client_id}/documents
```

---

## トラブルシューティング

### 「access_denied」エラー
- OAuth同意画面のテストユーザーに自分のアカウントが追加されているか確認
- スコープが正しいか確認

### 「invalid_grant」エラー
- リフレッシュトークンの有効期限切れ。再取得が必要
- テストモードでは7日間で失効する場合がある
- 対策: OAuth同意画面を「本番」に公開する

### 「file not found」エラー
- `drive.file` スコープでは、このアプリが作成したファイルのみアクセス可能
- 既存のファイルにアクセスする場合は `drive` スコープが必要

### CORS エラー
- Google Drive APIはサーバーサイドから呼び出す（フロントエンドから直接呼ばない）
- Next.js API Routeを経由する設計にしている
