# マネーフォワード クラウド会計 API連携

## 公式ドキュメント

- [マネーフォワード クラウド デベロッパー](https://developer.moneyforward.com/)
- [請求書API v3 ドキュメント](https://invoice.moneyforward.com/docs/api/v3/index.html)
- [請求書API 開発者向け情報](https://biz.moneyforward.com/invoice/developer/)
- [経費APIドキュメント](https://expense.moneyforward.com/api/index.html)
- [経費API GitHubリポジトリ](https://github.com/moneyforward/expense-api-doc)

## 認証方式

### OAuth 2.0 (Authorization Code Grant)

| 項目 | URL |
|------|-----|
| 認証エンドポイント | `https://expense.moneyforward.com/oauth/authorize` |
| トークンエンドポイント | `https://expense.moneyforward.com/oauth/token` |
| トークン情報 | `https://expense.moneyforward.com/oauth/token/info` |
| トークン取り消し | `https://expense.moneyforward.com/oauth/revoke` |

**認証フロー:**

1. ユーザーを認証URLへリダイレクト
   ```
   https://expense.moneyforward.com/oauth/authorize
     ?client_id={CLIENT_ID}
     &redirect_uri={REDIRECT_URI}  (HTTPS必須)
     &response_type=code
     &scope={SCOPE}
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

**注意:** `redirect_uri` はHTTPS必須（本番環境）

## Base URL

| API | Base URL |
|-----|----------|
| 会計API | `https://api.moneyforward.com/api/v3` |
| 請求書API | `https://invoice.moneyforward.com/api/v3` |
| 経費API | `https://expense.moneyforward.com/api/external/v1` |

## 利用するエンドポイント一覧

### 事業所 (Offices) - 会計API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/offices` | 事業所一覧取得 |

### 仕訳 (Journal Entries) - 会計API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/office/{office_id}/journal_entries` | 仕訳一覧取得 |
| GET | `/office/{office_id}/journal_entries/{id}` | 仕訳詳細取得 |
| POST | `/office/{office_id}/journal_entries` | 仕訳作成 |
| PUT | `/office/{office_id}/journal_entries/{id}` | 仕訳更新 |
| DELETE | `/office/{office_id}/journal_entries/{id}` | 仕訳削除 |

### 勘定科目 (Account Items) - 会計API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/office/{office_id}/account_items` | 勘定科目一覧取得 |

### 取引先 (Partners) - 会計API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/office/{office_id}/partners` | 取引先一覧取得 |

### 部門 (Departments) - 会計API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/office/{office_id}/departments` | 部門一覧取得 |

### 試算表 (Trial Balance) - 会計API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/office/{office_id}/trial_bs` | 貸借対照表(BS)取得 |
| GET | `/office/{office_id}/trial_pl` | 損益計算書(PL)取得 |

### 請求書 (Billings) - 請求書API v3

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/billings` | 請求書一覧取得 |
| GET | `/billings/{id}` | 請求書詳細取得 |
| POST | `/billings` | 請求書作成 |
| PUT | `/billings/{id}` | 請求書更新 |
| DELETE | `/billings/{id}` | 請求書削除 |
| POST | `/billings/{id}/send` | 請求書送付 |

### 経費精算 (Expense Applications) - 経費API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/expense_applications` | 経費申請一覧取得 |

## レート制限

- **500リクエスト / 5分間**（同一アクセストークンあたり）
- 制限超過時は `429 Too Many Requests` が返却される

## 注意事項

- マネーフォワードは複数のAPI製品（会計、請求書、経費等）に分かれており、それぞれBase URLが異なる
- 会計APIは事業所ID（`office_id`）がパスに含まれる設計
- 請求書APIのバージョニングはセマンティックバージョニングを採用（v3.x.x）
- インボイス制度（適格請求書等保存方式）に対応した請求書の作成が可能
- 2025年12月にクラウド連結会計の更新系APIが追加されている
- 会計Plus WebAPI連携は特定パートナー向けのクローズドAPIの可能性がある
