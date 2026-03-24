# MFクラウド経費 API連携

## 公式ドキュメント
- APIリファレンス: https://expense.moneyforward.com/api/index.html
- GitHub: https://github.com/moneyforward/expense-api-doc
- クラウド債務支払API: https://payable.moneyforward.com/api/index.html

## 認証方式
- **OAuth2 Authorization Code Grant**
- 認証URL: `https://expense.moneyforward.com/oauth/authorize`
- トークンURL: `https://expense.moneyforward.com/oauth/token`
- トークン取消: `https://expense.moneyforward.com/oauth/revoke`
- トークン情報: `https://expense.moneyforward.com/oauth/token/info`
- 認証コード有効期限: 10分

## Base URL
```
https://expense.moneyforward.com/api/external/v1
```

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/offices` | 事業所一覧取得 |
| GET | `/offices/{office_id}/ex_reports` | 経費申請一覧取得（全組織） |
| GET | `/offices/{office_id}/ex_reports/{id}` | 経費申請詳細取得（全組織） |
| GET | `/offices/{office_id}/me/ex_reports` | 自分の経費申請一覧取得 |
| GET | `/offices/{office_id}/me/ex_reports/{id}` | 自分の経費申請詳細取得 |
| GET | `/offices/{office_id}/approving_ex_reports` | 承認待ち経費一覧取得（全組織） |
| GET | `/offices/{office_id}/me/approving_ex_reports` | 自分の承認待ち経費一覧取得 |
| GET | `/offices/{office_id}/ex_journals_by_ex_reports` | 経費申請紐づき仕訳一覧取得 |
| GET | `/offices/{office_id}/ex_reports/{id}/ex_journal` | 特定経費申請の仕訳取得 |
| GET | `/offices/{office_id}/ex_journals_by_ex_invoice_transactions` | 支払明細紐づき仕訳一覧取得 |
| POST | `/offices/{office_id}/receipts` | 領収書アップロード |

## レート制限
- 公式のレート制限値は非公開
- 高頻度アクセス時にHTTP 429が返却される可能性あり

## 注意事項・制約
- 経費申請の「全組織」エンドポイントは管理者権限が必要
- 「me」エンドポイントは自分のデータのみ取得可能
- 仕訳データは承認済み経費のみ取得可能
- 領収書アップロードはmultipart/form-dataで送信
- クラウド債務支払のAPIは別Base URL（payable.moneyforward.com）
