# freee人事労務 API連携

## 公式ドキュメント
- API概要: https://developer.freee.co.jp/reference/hr
- APIリファレンス: https://developer.freee.co.jp/reference/hr/reference
- OpenAPIスキーマ: https://github.com/freee/freee-api-schema/tree/main/hr/open-api-3

## 認証方式
- **OAuth2 Authorization Code Grant**
- freee会計と共通の認証基盤（accounts.secure.freee.co.jp）を使用
- 認証URL: `https://accounts.secure.freee.co.jp/public_api/authorize`
- トークンURL: `https://accounts.secure.freee.co.jp/public_api/token`
- スコープ: `read` / `write`
- 権限レベル: `company_admin`（全従業員データ）/ `self_only`（本人データのみ）

## Base URL
```
https://api.freee.co.jp/hr/api/v1
```

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/users/me` | ログインユーザー情報取得 |
| GET | `/companies/{company_id}/employees` | 従業員一覧取得（事業所指定） |
| GET | `/employees` | 従業員一覧取得（年月指定） |
| GET | `/employees/{id}` | 従業員詳細取得 |
| POST | `/employees` | 従業員作成 |
| PUT | `/employees/{id}` | 従業員更新 |
| DELETE | `/employees/{id}` | 従業員削除 |
| GET | `/salaries/employee_payroll_statements` | 給与明細一覧取得 |
| GET | `/salaries/employee_payroll_statements/{employee_id}` | 給与明細詳細取得 |
| GET | `/bonuses/employee_payroll_statements` | 賞与明細一覧取得 |
| GET | `/bonuses/employee_payroll_statements/{employee_id}` | 賞与明細詳細取得 |
| GET | `/employees/{employee_id}/work_records/{date}` | 日次勤怠データ取得 |
| PUT | `/employees/{employee_id}/work_records/{date}` | 日次勤怠データ更新 |
| DELETE | `/employees/{employee_id}/work_records/{date}` | 日次勤怠データ削除 |
| GET | `/employees/{employee_id}/work_record_summaries/{year}/{month}` | 月次勤怠サマリー取得 |
| GET | `/employees/{employee_id}/time_clocks` | 打刻一覧取得 |
| GET | `/employees/{employee_id}/time_clocks/{id}` | 打刻詳細取得 |
| POST | `/employees/{employee_id}/time_clocks` | 打刻登録 |
| GET | `/year_end_adjustments` | 年末調整データ一覧取得 |
| GET | `/groups` | 部署一覧取得 |
| GET | `/employee_group_memberships` | 従業員の部署所属情報一覧取得 |
| GET | `/positions` | 役職一覧取得 |

## レート制限
- **5,000リクエスト/時間**（freee全APIで共通）
- レスポンスヘッダーで残量確認:
  - `X-Ratelimit-Limit`: 上限値
  - `X-Ratelimit-Remaining`: 残りリクエスト数
  - `X-Ratelimit-Reset`: リセット時刻（ISO 8601）
- 超過時は HTTP 429 を返却
- 短期間に過剰アクセスが検出された場合、HTTP 403 で最大約10分間アクセスが制限される

## 注意事項・制約
- freee会計APIとOAuth2アプリケーション（client_id/client_secret）は共通だが、人事労務APIのアクセスには別途権限申請が必要な場合がある
- 従業員一覧は年月指定が必須（在籍状況が年月によって変わるため）
- マイナンバー取得は管理者権限（company_admin）が必要
- 給与明細・賞与明細は「確定」ステータスのもののみAPI取得可能
- 打刻（Time Clock）APIはfreee勤怠管理Plusとは別のAPI体系
