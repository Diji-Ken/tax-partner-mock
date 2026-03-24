# MFクラウド給与 API連携

## 公式ドキュメント
- 開発者向け: https://developer.moneyforward.com/
- API連携サービス一覧: https://biz.moneyforward.com/integration/product/payroll-api/
- サポート: https://biz.moneyforward.com/support/payroll/

## 認証方式
- **OAuth2 Authorization Code Grant**
- 認証URL: `https://payroll.moneyforward.com/oauth/authorize`
- トークンURL: `https://payroll.moneyforward.com/oauth/token`

## Base URL
```
https://payroll.moneyforward.com/api/v1
```

## 重要な制約
MFクラウド給与のREST APIは**パートナー企業向け**に提供されており、一般公開されたAPIリファレンスは限定的です。API利用にはMoneyForwardとのパートナー契約が必要となる場合があります。

## エンドポイント一覧（推定）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/offices` | 事業所一覧取得 |
| GET | `/offices/{office_id}/employees` | 従業員一覧取得 |
| GET | `/offices/{office_id}/employees/{id}` | 従業員詳細取得 |
| GET | `/offices/{office_id}/payrolls` | 給与明細一覧取得 |
| GET | `/offices/{office_id}/year_end_adjustments` | 年末調整データ取得 |
| GET | `/offices/{office_id}/withholding_tax_certificates` | 源泉徴収票取得 |
| GET | `/offices/{office_id}/social_insurances` | 社会保険料一覧取得 |
| POST | `/offices/{office_id}/attendance_imports` | 勤怠データインポート |

## 勤怠データ連携
- 外部勤怠管理システム（KING OF TIME、ジョブカン等）からAPI経由でデータ取込が可能
- 勤怠データは10進数表記で連携（例: 8時間30分 = 8.50）
- CSVインポートも対応

## レート制限
- 公式のレート制限値は非公開
- 短時間の大量リクエストに対してHTTP 429が返却される可能性あり

## 注意事項・制約
- APIはパートナー企業向けに限定公開されているため、利用にはMoneyForward社への申請が必要
- 従業員データの取得には事業所IDの指定が必須
- 給与明細は「確定」ステータスのもののみ正確なデータを返却
- 勤怠データの10進数/60進数変換に注意（APIは10進数、画面表示は60進数）
- CSVインポート時のファイルエンコーディングはUTF-8
