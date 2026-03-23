# freee会計 API連携

## 公式ドキュメント

- [freee Developers Community](https://developer.freee.co.jp/)
- [会計APIリファレンス](https://developer.freee.co.jp/reference/accounting/reference)
- [APIクイックスタート](https://developer.freee.co.jp/startguide)
- [GET/POSTリクエスト送信ガイド](https://developer.freee.co.jp/startguide/getpost)
- [アクセストークン取得ガイド](https://developer.freee.co.jp/startguide/getting-access-token)
- [JavaScript SDK (参考)](https://github.com/freee/freee-accounting-sdk-javascript)
- [PHP SDK (参考)](https://github.com/freee/freee-accounting-sdk-php)

## 認証方式

### OAuth 2.0 (Authorization Code Grant)

| 項目 | URL |
|------|-----|
| 認証エンドポイント | `https://accounts.secure.freee.co.jp/public_api/authorize` |
| トークンエンドポイント | `https://accounts.secure.freee.co.jp/public_api/token` |

**認証フロー:**

1. ユーザーを認証URLへリダイレクト
   ```
   https://accounts.secure.freee.co.jp/public_api/authorize
     ?client_id={CLIENT_ID}
     &redirect_uri={REDIRECT_URI}
     &response_type=code
   ```

2. 認可コードでトークン取得 (POST)
   ```json
   {
     "grant_type": "authorization_code",
     "client_id": "{CLIENT_ID}",
     "client_secret": "{CLIENT_SECRET}",
     "code": "{AUTHORIZATION_CODE}",
     "redirect_uri": "{REDIRECT_URI}"
   }
   ```

3. リフレッシュトークンで更新 (POST)
   ```json
   {
     "grant_type": "refresh_token",
     "client_id": "{CLIENT_ID}",
     "client_secret": "{CLIENT_SECRET}",
     "refresh_token": "{REFRESH_TOKEN}"
   }
   ```

**スコープ:** `read write`

## Base URL

```
https://api.freee.co.jp/api/1
```

## 利用するエンドポイント一覧

### 事業所 (Companies)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/companies` | 事業所一覧取得 |
| GET | `/companies/{id}` | 事業所詳細取得 |
| PUT | `/companies/{id}` | 事業所情報更新 |

### 取引 (Deals)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/deals` | 取引（収入・支出）一覧取得 |
| GET | `/deals/{id}` | 取引詳細取得 |
| POST | `/deals` | 取引作成 |
| PUT | `/deals/{id}` | 取引更新 |
| DELETE | `/deals/{id}` | 取引削除 |

### 勘定科目 (Account Items)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/account_items` | 勘定科目一覧取得 |
| GET | `/account_items/{id}` | 勘定科目詳細取得 |
| POST | `/account_items` | 勘定科目作成 |
| PUT | `/account_items/{id}` | 勘定科目更新 |
| DELETE | `/account_items/{id}` | 勘定科目削除 |

### 取引先 (Partners)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/partners` | 取引先一覧取得 |
| GET | `/partners/{id}` | 取引先詳細取得 |
| POST | `/partners` | 取引先作成 |
| PUT | `/partners/{id}` | 取引先更新 |
| DELETE | `/partners/{id}` | 取引先削除 |

### 試算表・レポート (Reports)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/reports/trial_bs` | 貸借対照表(BS)取得 |
| GET | `/reports/trial_pl` | 損益計算書(PL)取得 |

### 仕訳帳 (Journals)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/journals` | 仕訳帳ダウンロードリクエスト（非同期） |
| GET | `/journals/reports/{id}/status` | ダウンロードステータス確認 |

### 振替伝票 (Manual Journals)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/manual_journals` | 振替伝票一覧取得 |
| GET | `/manual_journals/{id}` | 振替伝票詳細取得 |
| POST | `/manual_journals` | 振替伝票作成 |
| PUT | `/manual_journals/{id}` | 振替伝票更新 |
| DELETE | `/manual_journals/{id}` | 振替伝票削除 |

### ファイルボックス (Receipts)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/receipts` | ファイルボックス一覧取得 |
| GET | `/receipts/{id}` | ファイルボックス詳細取得 |
| POST | `/receipts` | ファイルアップロード（multipart/form-data） |
| PUT | `/receipts/{id}` | ファイル情報更新 |
| DELETE | `/receipts/{id}` | ファイル削除 |

### その他主要エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/taxes/codes` | 税区分一覧取得 |
| GET | `/sections` | 部門一覧取得 |
| GET | `/tags` | メモタグ一覧取得 |
| GET | `/items` | 品目一覧取得 |
| GET | `/walletables` | 口座一覧取得 |
| GET | `/users/me` | ログインユーザー情報取得 |

## レート制限

- **300リクエスト / 5分間**（同一アクセストークンあたり）
- 制限超過時は `429 Too Many Requests` が返却される

## 注意事項

- `company_id` は多くのエンドポイントで必須。まず `/companies` で事業所IDを取得すること
- 仕訳帳ダウンロードは非同期処理。リクエスト後にステータスをポーリングする
- 取引の `details` 配列は最低1行必須
- ファイルボックスへのアップロードは `multipart/form-data` 形式
- ページネーション: `offset` と `limit`（デフォルト20, 最大100）
- 日付フォーマット: `yyyy-mm-dd`
- freee JavaScript SDKは2024年9月にサポート終了済み。直接REST API呼び出しを推奨
