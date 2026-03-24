# Slack API連携

## 公式ドキュメント
- Slack API: https://api.slack.com/
- Web APIメソッド一覧: https://api.slack.com/methods
- OAuth2: https://api.slack.com/authentication/oauth-v2
- Block Kit: https://api.slack.com/block-kit
- Events API: https://api.slack.com/events-api
- Incoming Webhooks: https://api.slack.com/messaging/webhooks

## 認証方式

### OAuth2 (V2)
- 認証URL: `https://slack.com/oauth/v2/authorize`
- トークンURL: `https://slack.com/api/oauth.v2.access`
- Bot Token Scopes（アプリの権限）
- User Token Scopes（ユーザー権限で実行する場合）

### Bot Token
- `xoxb-` プレフィックスのトークン
- アプリインストール時に発行

## Base URL
```
https://slack.com/api
```

## 主要エンドポイント一覧

### メッセージ
| メソッド | 説明 | レート制限 |
|---------|------|-----------|
| `chat.postMessage` | メッセージ送信 | 1回/秒/チャンネル |
| `chat.postEphemeral` | エフェメラルメッセージ送信 | 100回/分 |
| `chat.update` | メッセージ更新 | Tier 3 |
| `chat.delete` | メッセージ削除 | Tier 3 |

### チャンネル
| メソッド | 説明 | レート制限 |
|---------|------|-----------|
| `conversations.list` | チャンネル一覧 | Tier 2 |
| `conversations.create` | チャンネル作成 | Tier 2 |
| `conversations.join` | チャンネル参加 | Tier 3 |
| `conversations.history` | メッセージ履歴 | Tier 3 |
| `conversations.replies` | スレッド返信取得 | Tier 3 |

### ファイル
| メソッド | 説明 | レート制限 |
|---------|------|-----------|
| `files.upload` | ファイルアップロード | 20回/分 |
| `files.list` | ファイル一覧 | Tier 3 |
| `files.info` | ファイル情報取得 | Tier 4 |

### ユーザー
| メソッド | 説明 | レート制限 |
|---------|------|-----------|
| `users.list` | ユーザー一覧 | Tier 2 |
| `users.info` | ユーザー情報取得 | Tier 4 |

## レート制限

Slack APIは**メソッド単位・ワークスペース単位**でレート制限を適用。

| Tier | 制限 |
|------|------|
| Tier 1 | 1リクエスト/分 |
| Tier 2 | 20リクエスト/分 |
| Tier 3 | 50リクエスト/分 |
| Tier 4 | 100リクエスト/分 |
| Special | メソッドごとに個別設定 |

超過時: HTTP 429 + `Retry-After` ヘッダー

## Incoming Webhook
- Slack Appの設定で生成されるURL
- POSTリクエストでJSON送信するだけでメッセージ投稿可能
- 認証不要（URLが秘密情報として機能）

## Slash Commands
- ユーザーが `/command` を入力するとPOSTリクエストが送信される
- Response URLに返信を送信
- `response_type`: `ephemeral`（送信者のみ）or `in_channel`（全員に表示）

## Events API
- URL検証: `url_verification` イベントに `challenge` を返す
- イベント配信: `event_callback` タイプでイベントデータが送信される
- 対応イベント: `message`, `app_mention`, `member_joined_channel` 等

## 注意事項・制約
- `chat:write.public` スコープで未参加のパブリックチャンネルにも投稿可能
- Marketplace未承認アプリは `conversations.history` 等に追加のレート制限あり
- ファイルアップロードは20回/分の制限
- Block Kitのブロック数は最大50個/メッセージ
