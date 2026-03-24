# LINE WORKS API連携

## 公式ドキュメント
- 開発者ポータル: https://developers.worksmobile.com/jp/
- API一覧: https://developers.worksmobile.com/jp/docs/api
- 認証ガイド: https://developers.worksmobile.com/jp/docs/auth
- JWT認証: https://developers.worksmobile.com/jp/docs/auth-jwt
- コードサンプル: https://github.com/lineworks/works-api-code-samples

## 認証方式

### サービスアカウント認証（JWT）- 推奨
- RS256アルゴリズムでJWTを署名
- Developer ConsoleでService AccountとPrivate Keyを発行
- ユーザー認可不要でAPIアクセス可能（サーバー間連携向け）
- トークンURL: `https://auth.worksmobile.com/oauth2/v2.0/token`

### OAuth2認証
- Authorization Code Grant
- 認証URL: `https://auth.worksmobile.com/oauth2/v2.0/authorize`
- ユーザーの操作が必要な場合に使用

## Base URL
```
https://www.worksapis.com/v1.0
```

## エンドポイント一覧

### Bot API
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/bots/{botId}` | ボット情報取得 |
| POST | `/bots/{botId}/users/{userId}/messages` | ユーザーにメッセージ送信 |
| POST | `/bots/{botId}/channels/{channelId}/messages` | チャンネルにメッセージ送信 |

### Calendar API
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/users/{userId}/calendar/calendarList` | カレンダー一覧取得 |
| GET | `/users/{userId}/calendar/calendarList/{calendarId}/events` | イベント一覧取得 |
| POST | `/users/{userId}/calendar/calendarList/{calendarId}/events` | イベント作成 |
| PUT | `/users/{userId}/calendar/calendarList/{calendarId}/events/{eventId}` | イベント更新 |
| DELETE | `/users/{userId}/calendar/calendarList/{calendarId}/events/{eventId}` | イベント削除 |

### Directory API（アドレス帳）
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/users` | メンバー一覧取得 |
| GET | `/users/{userId}` | メンバー情報取得 |
| POST | `/users` | メンバー作成 |
| PUT | `/users/{userId}` | メンバー更新 |
| DELETE | `/users/{userId}` | メンバー削除 |
| GET | `/groups` | グループ一覧取得 |
| GET | `/groups/{groupId}/members` | グループメンバー取得 |

### Board API
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/boards` | 掲示板一覧取得 |
| POST | `/boards/{boardId}/posts` | 投稿作成 |

## レート制限
- 公式のレート制限値はAPI/プラン別に設定
- 超過時はHTTP 429を返却
- ページネーション: カーソルベース（`cursor` パラメータ）

## メッセージ形式
- Text: テキストメッセージ
- Image: 画像メッセージ
- File: ファイルメッセージ
- Template: ボタン、確認、カルーセル等のテンプレート
- Flex: 自由レイアウトのリッチメッセージ

## 注意事項・制約
- サービスアカウント認証にはRS256秘密鍵の管理が必要
- JWTの有効期限は最大3600秒（1時間）
- ボットからのメッセージ送信にはBot IDが必要（Developer Consoleで確認）
- カレンダーAPIはユーザーIDの指定が必須
- 組織同期やメンバー管理にはサービスアカウント認証が推奨
- 日本向けAPIとグローバルAPIでエンドポイントが異なる場合あり
