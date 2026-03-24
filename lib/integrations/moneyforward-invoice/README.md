# MFクラウド請求書 API連携

## 公式ドキュメント
- APIリファレンス: https://invoice.moneyforward.com/docs/api/v3/index.html
- 開発者向け: https://biz.moneyforward.com/invoice/developer/
- スタートアップガイド: https://biz.moneyforward.com/support/invoice/guide/api-guide/a04.html
- 利用規約: https://biz.moneyforward.com/invoice/developer_terms/

## 認証方式
- **OAuth2 Authorization Code Grant**
- 認証URL: `https://invoice.moneyforward.com/oauth/authorize`
- トークンURL: `https://invoice.moneyforward.com/oauth/token`
- スコープ:
  - `mfc/invoice/data.read` - 読み取り専用
  - `mfc/invoice/data.write` - 読み書き

## Base URL
```
https://invoice.moneyforward.com/api/v3
```

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/office` | 事業所情報取得 |
| PUT | `/office/registration_code` | 適格請求書発行事業者登録番号の設定 |
| GET | `/billings` | 請求書一覧取得 |
| GET | `/billings/{id}` | 請求書詳細取得 |
| POST | `/invoice_template_billings` | 請求書作成（インボイス制度対応） |
| POST | `/billings/{id}/items` | 請求書に明細行を追加 |
| POST | `/billings/{id}/sending` | 請求書の送付 |
| GET | `/quotes` | 見積書一覧取得 |
| GET | `/partners` | 取引先一覧取得 |
| POST | `/partners` | 取引先作成 |
| POST | `/partners/{id}/departments` | 取引先部門の作成 |
| GET | `/items` | 品目一覧取得 |

## レート制限
- 高頻度アクセス検出時にHTTP 429（Too Many Requests）を返却
- 具体的な制限値は非公開
- 適切な間隔（1秒以上）を空けてリクエストすることを推奨

## 注意事項・制約
- API v3.1.0からインボイス制度に対応した請求書作成が可能
- 請求書作成は `POST /invoice_template_billings` を使用（新テンプレート形式）
- 納品書のAPI作成は現在非対応（Web UIからのみ作成可能）
- クラウド請求書の契約プランによって利用可能なAPI機能が異なる
- PDFダウンロードURLは一時的なもの（有効期限あり）
