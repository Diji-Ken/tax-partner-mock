# ChatWork API連携

## 公式ドキュメント
- APIリファレンス: https://developer.chatwork.com/reference
- エンドポイント一覧: https://developer.chatwork.com/docs/endpoints
- OAuth2ガイド: https://developer.chatwork.com/docs/oauth

## 認証方式

### APIトークン認証
- HTTPヘッダー `X-ChatWorkToken` にAPIトークンを設定
- トークンは「サービス連携」画面から取得
- **注意**: APIトークンはURLクエリストリングではなくHTTPヘッダーで送信すること

### OAuth2認証
- Authorization Code Grant
- 認証URL: `https://www.chatwork.com/packages/oauth2/authorize`
- トークンURL: `https://oauth.chatwork.com/token`
- スコープ: `rooms.all:read_write`, `contacts.all:read_write` 等

## Base URL
```
https://api.chatwork.com/v2
```

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/me` | 自分の情報取得 |
| GET | `/my/status` | 自分のステータス取得 |
| GET | `/my/tasks` | 自分のタスク一覧 |
| GET | `/contacts` | コンタクト一覧 |
| GET | `/rooms` | ルーム一覧 |
| POST | `/rooms` | ルーム作成 |
| GET | `/rooms/{room_id}` | ルーム情報取得 |
| PUT | `/rooms/{room_id}` | ルーム情報更新 |
| DELETE | `/rooms/{room_id}` | ルーム退出/削除 |
| GET | `/rooms/{room_id}/members` | メンバー一覧 |
| PUT | `/rooms/{room_id}/members` | メンバー更新 |
| GET | `/rooms/{room_id}/messages` | メッセージ一覧 |
| POST | `/rooms/{room_id}/messages` | メッセージ送信 |
| GET | `/rooms/{room_id}/messages/{message_id}` | メッセージ取得 |
| PUT | `/rooms/{room_id}/messages/{message_id}` | メッセージ編集 |
| DELETE | `/rooms/{room_id}/messages/{message_id}` | メッセージ削除 |
| PUT | `/rooms/{room_id}/messages/read` | 既読にする |
| PUT | `/rooms/{room_id}/messages/unread` | 未読にする |
| GET | `/rooms/{room_id}/tasks` | タスク一覧 |
| POST | `/rooms/{room_id}/tasks` | タスク作成 |
| GET | `/rooms/{room_id}/tasks/{task_id}` | タスク詳細 |
| PUT | `/rooms/{room_id}/tasks/{task_id}/status` | タスクステータス更新 |
| GET | `/rooms/{room_id}/files` | ファイル一覧 |
| POST | `/rooms/{room_id}/files` | ファイルアップロード |
| GET | `/rooms/{room_id}/files/{file_id}` | ファイル情報取得 |
| GET | `/rooms/{room_id}/link` | 招待リンク取得 |
| POST | `/rooms/{room_id}/link` | 招待リンク作成 |
| PUT | `/rooms/{room_id}/link` | 招待リンク更新 |
| DELETE | `/rooms/{room_id}/link` | 招待リンク削除 |
| GET | `/incoming_requests` | 承認待ちリクエスト一覧 |
| PUT | `/incoming_requests/{request_id}` | リクエスト承認 |
| DELETE | `/incoming_requests/{request_id}` | リクエスト拒否 |

## レート制限
- **300リクエスト / 5分間**（全エンドポイント共通）
- メッセージ/タスク投稿: **10リクエスト / 10秒**（ルームごと）
- 超過時: HTTP 429 (Too Many Requests)
- レスポンスヘッダーで残量確認:
  - `X-RateLimit-Limit`: 上限値
  - `X-RateLimit-Remaining`: 残りリクエスト数
  - `X-RateLimit-Reset`: リセット時刻（UNIX timestamp）

## Webhook
- 対応イベント: `message_created`, `message_updated`, `message_deleted`
- Webhook URLにPOSTリクエストで通知
- ペイロードにルームID、メッセージID、本文等を含む

## 注意事項・制約
- APIトークンは必ずHTTPヘッダーで送信（URLパラメータは不可）
- ファイルアップロードはmultipart/form-data形式
- メッセージ取得は最新100件まで（`force=1` で未取得メッセージを強制取得）
- 管理者権限がないルームでの操作は制限される
