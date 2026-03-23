# クラウドサイン Web API連携

## 公式ドキュメント

- [クラウドサイン Web API](https://help.cloudsign.jp/ja/articles/936884)
- [Web API 利用ガイド](https://help.cloudsign.jp/ja/articles/2681259)
- [Web APIアップデート情報](https://help.cloudsign.jp/ja/articles/2570946)
- [Swagger仕様](https://app.swaggerhub.com/apis/CloudSign/cloudsign-web_api/)
- [API連携ガイド (Qiita)](https://qiita.com/t_yano/items/76cc2569acfa083abc23)

## 認証方式

### Client ID ベースのトークン認証

クラウドサインはOAuth2ではなく、Client IDを送信してアクセストークンを取得する方式。

| 項目 | URL |
|------|-----|
| トークンエンドポイント | `https://api.cloudsign.jp/token` |

**トークン取得:**

```http
POST https://api.cloudsign.jp/token
Content-Type: application/json

{
  "client_id": "{CLIENT_ID}"
}
```

**レスポンス:**
```json
{
  "access_token": "4c59ab2e-b34b-4985-893a-afce2b07f503",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**リクエストヘッダー:**
```
Authorization: Bearer {ACCESS_TOKEN}
```

**Client ID取得方法:** Web API クライアントID管理画面から取得（36文字の英数字・ハイフン）

**トークン有効期限:** 3600秒（1時間）

## Base URL

| 環境 | URL |
|------|-----|
| 本番 | `https://api.cloudsign.jp` |
| サンドボックス | `https://api-sandbox.cloudsign.jp` |

## 利用するエンドポイント一覧

### 書類管理 (Documents)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/documents` | 書類一覧取得（100件/ページ） |
| GET | `/documents/{documentID}` | 書類詳細取得 |
| POST | `/documents` | 書類作成（下書き） |
| PUT | `/documents/{documentID}` | 書類タイトル・備考更新（下書きのみ） |
| POST | `/documents/{documentID}` | 書類送信 / リマインド |
| PUT | `/documents/{documentID}/decline` | 書類キャンセル |

### ファイル (Files)

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/documents/{documentID}/files` | ファイル追加（下書きのみ） |
| GET | `/documents/{documentID}/files/{fileID}` | ファイルダウンロード |
| DELETE | `/documents/{documentID}/files/{fileID}` | ファイル削除（下書きのみ） |

### 宛先・署名者 (Participants)

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/documents/{documentID}/participants` | 宛先追加 |
| PUT | `/documents/{documentID}/participants/{participantID}` | 宛先更新 |
| DELETE | `/documents/{documentID}/participants/{participantID}` | 宛先削除 |

### 入力項目 (Widgets)

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/documents/{documentID}/files/{fileID}/widgets` | 入力項目追加 |
| PUT | `/documents/{documentID}/files/{fileID}/widgets/{widgetID}` | 入力項目更新 |
| DELETE | `/documents/{documentID}/files/{fileID}/widgets/{widgetID}` | 入力項目削除 |

### 書類属性・証明書

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/documents/{documentID}/attribute` | 書類属性取得 |
| PUT | `/documents/{documentID}/attribute` | 書類属性更新 |
| GET | `/documents/{documentID}/certificate` | 締結証明書取得 |

### キャビネット (Enterpriseプラン)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/cabinets` | キャビネット一覧取得 |
| GET | `/cabinet_documents` | キャビネット内書類取得 |

### インポート書類

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/imported_documents` | PDF書類インポート |

### チーム書類

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/team_documents` | チーム全書類取得（管理者のみ） |

## 書類作成フロー

```
1. POST /documents                                    → 書類作成（下書き）
2. POST /documents/{id}/files                         → PDFファイル添付
3. POST /documents/{id}/participants                  → 宛先追加
4. POST /documents/{id}/files/{fileId}/widgets        → 入力項目設定（任意）
5. POST /documents/{id}                               → 送信（署名依頼）
```

## Webhook

Web APIを有効化するとWebhookも設定可能。チーム設定画面から設定する。

主なイベント:
- `document.created` - 書類作成
- `document.sent` - 書類送信
- `document.confirmed` - 署名完了（宛先単位）
- `document.completed` - 締結完了
- `document.declined` - 辞退
- `document.expired` - 期限切れ

## レート制限

- **800リクエスト / 分**（同一アクセストークンあたり）
- 超過時: `429 Too Many Requests` → 1分待機で自動解除
- 接続タイムアウト: **180秒**（超過時 `504 Gateway Timeout`）

## 注意事項

- ファイル追加・削除・入力項目変更は**下書き状態**の書類でのみ可能
- 書類作成・変更・削除後、3〜10秒の伝播遅延がある。後続API呼び出しは間隔を空ける
- Enterpriseプランでは `/team_documents` と `/me` エンドポイントが利用不可
- IP制限（Enterprise/Business）が有効な場合、API呼び出し元IPも認証対象
- UTF-8エンコーディング必須
- ページネーション: 100件/ページ
- 対応プラン: Standard, Business, Corporate, Enterprise
