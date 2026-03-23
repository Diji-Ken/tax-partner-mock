# 弥生会計 / Misoca API連携

## 公式ドキュメント

- [Misoca API v3 リファレンス](https://doc.misoca.jp/v3/)
- [Misoca API について](https://doc.misoca.jp/)
- [弥生サポート - 外部API](https://support.yayoi-kk.co.jp/faq_Subcontents.html?page_id=22266)
- [YAYOI SMART CONNECT](https://www.yayoi-kk.co.jp/smart/)
- [Misoca API 利用例 (Zenn)](https://zenn.dev/trustart_dev/articles/ef4a4ffbf386b4)

## 重要：弥生会計の連携方式

弥生会計本体には**公開REST APIが存在しない**。連携は以下の方式で行う：

| 方式 | 用途 | 説明 |
|------|------|------|
| **Misoca API v3** | 請求書・見積書・納品書 | REST API。OAuth2認証 |
| **YAYOI SMART CONNECT** | 銀行・クレカ明細取込 | 弥生側の自動連携機能（1,100以上の金融機関対応） |
| **CSVインポート** | 仕訳データ取込 | 弥生会計のCSVインポート機能でデータ投入 |
| **Anyflow連携** | 外部サービス連携 | iPaaS経由でのデータ連携 |

## 認証方式 (Misoca API)

### OAuth 2.0 (Authorization Code Grant)

| 項目 | URL |
|------|-----|
| アプリ登録 | `https://app.misoca.jp/oauth2/applications` |
| 認証エンドポイント | `https://app.misoca.jp/oauth2/authorize` |
| トークンエンドポイント | `https://app.misoca.jp/oauth2/token` |

**認証フロー:**

1. ユーザーを認証URLへリダイレクト
   ```
   https://app.misoca.jp/oauth2/authorize
     ?client_id={CLIENT_ID}
     &redirect_uri={REDIRECT_URI}
     &response_type=code
     &scope=write
   ```

2. 認可コードでトークン取得（HTTP Basic認証）
   ```http
   POST https://app.misoca.jp/oauth2/token
   Authorization: Basic {base64(client_id:client_secret)}
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code&code={CODE}&redirect_uri={REDIRECT_URI}
   ```

3. リフレッシュトークンで更新
   ```http
   POST https://app.misoca.jp/oauth2/token
   Authorization: Basic {base64(client_id:client_secret)}
   Content-Type: application/x-www-form-urlencoded

   grant_type=refresh_token&refresh_token={REFRESH_TOKEN}
   ```

**スコープ:**

| スコープ | 説明 |
|---------|------|
| `read` | 読み取り専用 |
| `write` | 読み書き（readを含む） |

**トークン有効期限:** 1日（86400秒）。リフレッシュトークンで更新可能

## Base URL (Misoca)

```
https://app.misoca.jp/api/v3
```

## 利用するエンドポイント一覧

### 請求書 (Invoices)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/invoices` | 請求書一覧取得 |
| GET | `/invoice/{id}` | 請求書詳細取得 |
| POST | `/invoice` | 請求書作成 |
| GET | `/invoice/{id}/pdf` | 請求書PDFダウンロード |
| PUT | `/invoice/{id}/submitted` | 請求済みにする |
| DELETE | `/invoice/{id}/submitted` | 未請求に戻す |
| PUT | `/invoice/{id}/paid` | 入金済みにする |
| DELETE | `/invoice/{id}/paid` | 未入金に戻す |
| PUT | `/invoice/{id}/trashed` | ゴミ箱に移動 |
| DELETE | `/invoice/{id}/trashed` | ゴミ箱から復元 |
| POST | `/invoice/{id}/send_by_postal_mail` | 郵送依頼 |

### 見積書 (Estimates)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/estimates` | 見積書一覧取得 |
| GET | `/estimate/{id}` | 見積書詳細取得 |
| POST | `/estimates` | 見積書作成 |

### 納品書 (Delivery Slips)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/delivery_slips` | 納品書一覧取得 |
| GET | `/delivery_slip/{id}` | 納品書詳細取得 |
| POST | `/delivery_slip` | 納品書作成 |
| GET | `/delivery_slip/{id}/pdf` | 納品書PDFダウンロード |

### 取引先 (Contact Groups / Contacts)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/contact_groups` | 取引先グループ一覧取得 |
| POST | `/contact_group` | 取引先グループ作成 |
| GET | `/contact_group/{id}` | 取引先グループ詳細取得 |
| GET | `/contacts` | 送付先一覧取得 |
| POST | `/contact` | 送付先作成 |
| GET | `/contact/{id}` | 送付先詳細取得 |

### 品目マスタ (Dealing Items)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/dealing_items` | 品目マスタ一覧取得 |
| GET | `/dealing_item/{id}` | 品目マスタ詳細取得 |
| POST | `/dealing_item` | 品目マスタ作成 |

### ユーザー情報

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/user/me` | ログインユーザー情報取得 |

## ページネーション

- RFC5988準拠（Linkヘッダーで次ページ情報を返却）
- デフォルト: `page=1`, `per_page=25`
- 最大: `per_page=100`

## レート制限

- 公式ドキュメントに明示的な記載なし
- 常識的な範囲（秒間数リクエスト程度）での利用を推奨

## 弥生会計 CSVインポート仕様

弥生会計本体への仕訳データ投入はCSVインポートを使用する。

### カラム構成

| # | カラム名 | 説明 |
|---|---------|------|
| 1 | 仕訳区分 | "仕訳" or "決算仕訳" |
| 2 | 伝票番号 | 任意の番号 |
| 3 | 日付 | yyyy/mm/dd形式 |
| 4 | 借方勘定科目 | 勘定科目名 |
| 5 | 借方補助科目 | 補助科目名 |
| 6 | 借方部門 | 部門名 |
| 7 | 借方税区分 | 税区分名 |
| 8 | 借方金額 | 金額 |
| 9 | 借方税額 | 消費税額 |
| 10 | 貸方勘定科目 | 勘定科目名 |
| 11 | 貸方補助科目 | 補助科目名 |
| 12 | 貸方部門 | 部門名 |
| 13 | 貸方税区分 | 税区分名 |
| 14 | 貸方金額 | 金額 |
| 15 | 貸方税額 | 消費税額 |
| 16 | 摘要 | 取引の説明 |
| 17 | 取引先 | 取引先名 |
| 18 | メモ | メモ |

### 注意事項

- 文字コード: **Shift_JIS** (弥生会計の標準)
- 改行コード: CRLF
- 勘定科目名・税区分名は弥生会計のマスタと完全一致させる必要がある
- インポート前にバックアップを取ることを推奨
