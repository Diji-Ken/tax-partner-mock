# jGrants API 連携（デジタル庁 補助金申請システム）

## 公式ドキュメント（エビデンス）

| リソース | URL |
|---------|-----|
| APIドキュメント | https://developers.digital.go.jp/documents/jgrants/api/ |
| OpenAPI仕様書 (YAML) | jgrants-api.yaml (38.4KB) ※上記ページからダウンロード |
| jGrants ポータル | https://www.jgrants-portal.go.jp/ |
| jGrants サービス案内 | https://services.digital.go.jp/jgrants/ |
| MCP Server (GitHub) | https://github.com/digital-go-jp/jgrants-mcp-server |
| MCP Server解説 (note) | https://digital-gov.note.jp/n/n09dfb9fa4e8e |

## 認証方式

**認証不要（公開API）**

jGrants の補助金検索APIは公開APIであり、APIキーやOAuth2トークンは不要です。
誰でも直接HTTPリクエストで補助金情報を取得できます。

※ 補助金の「申請」にはGビズID（gBizID）によるログインが必要ですが、
  検索・閲覧APIは認証不要です。

## Base URL

```
https://api.jgrants-portal.go.jp/exp
```

## エンドポイント一覧

### V1 エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/v1/public/subsidies` | 補助金一覧検索 |
| GET | `/v1/public/subsidies/id/{id}` | 補助金詳細取得 |

### V2 エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/v2/public/subsidies/id/{id}` | 補助金詳細取得（ワークフロー情報付き） |

## リクエストパラメータ

### `/v1/public/subsidies` - 補助金一覧検索

| パラメータ | 必須 | 型 | 説明 |
|-----------|------|------|------|
| `keyword` | Yes | string | 検索キーワード（2文字以上） |
| `industry` | No | string | 業種フィルター |
| `target_area_search` | No | string | 対象地域（都道府県名） |
| `target_number_of_employees` | No | string | 対象従業員数 |
| `sort` | No | string | ソート項目（`acceptance_end_datetime`, `acceptance_start_datetime`, `created_date`） |
| `order` | No | string | ソート順（`ASC`, `DESC`） |
| `acceptance` | No | integer | 受付状態（0: 全件, 1: 受付中のみ） |
| `use_purpose` | No | string | 利用目的 |

### `/v1/public/subsidies/id/{id}` - 補助金詳細取得

| パラメータ | 必須 | 型 | 説明 |
|-----------|------|------|------|
| `id` | Yes | string | 補助金ID（パスパラメータ、最大18文字） |

### `/v2/public/subsidies/id/{id}` - 補助金詳細取得 (V2)

V1と同じパスパラメータ。レスポンスにworkflow（公募回次）情報が追加される。

## レスポンス例

### 補助金一覧

```json
{
  "metadata": {
    "type": "https://developers.digital.go.jp/documents/jgrants/api/",
    "resultset": {
      "count": 42
    }
  },
  "result": [
    {
      "id": "S-01100011",
      "name": "S-01100011",
      "title": "ものづくり・商業・サービス生産性向上促進補助金",
      "target_area_search": "全国",
      "subsidy_max_limit": 10000000,
      "acceptance_start_datetime": "2026-01-15T00:00:00+09:00",
      "acceptance_end_datetime": "2026-03-31T23:59:59+09:00",
      "target_number_of_employees": "5人以下,6～20人,21～50人,51～100人,101～300人,301人以上"
    }
  ]
}
```

### 補助金詳細 (V2)

```json
{
  "metadata": { ... },
  "result": {
    "id": "S-01100011",
    "title": "ものづくり・商業・サービス生産性向上促進補助金",
    "subsidy_catch_phrase": "革新的サービス開発・試作品開発...",
    "detail": "中小企業・小規模事業者等が...",
    "use_purpose": "設備投資,生産性向上",
    "industry": "製造業,情報通信業,サービス業",
    "subsidy_max_limit": 10000000,
    "subsidy_rate": "2/3",
    "granttype": "補助金",
    "workflow": [
      {
        "id": "WF-001",
        "fiscal_year_round": "令和7年度 第1回",
        "acceptance_start_datetime": "2026-01-15T00:00:00+09:00",
        "acceptance_end_datetime": "2026-03-31T23:59:59+09:00"
      }
    ]
  }
}
```

## レート制限

- 公式ドキュメントにレート制限の明示的な記載なし
- 大量リクエスト時はリトライ（指数バックオフ）を実装済み
- 本クライアントでは3回までリトライ（1秒 → 2秒 → 4秒）

## HTTPステータスコード

| コード | 説明 |
|-------|------|
| 200 | 正常 |
| 400 | リクエストパラメータ不正 |
| 401 | 認証エラー（将来的にキー認証が導入された場合） |
| 404 | 指定IDの補助金が存在しない |
| 405 | 許可されていないHTTPメソッド |
| 406 | 受付不可能なContent-Type |
| 415 | サポートされていないメディアタイプ |
| 500 | サーバー内部エラー |
| 501 | 未実装 |

## 税理士CRMポータルでの活用方法

### 1. 顧問先への補助金マッチング提案

```typescript
import { findSubsidiesForClient } from './client';

const matches = await findSubsidiesForClient({
  industry: '製造業',
  prefecture: '埼玉県',
  employeeCount: 30,
  purposes: ['設備投資', 'DX推進'],
  keywords: ['生産性向上', 'デジタル化'],
});

// スコア上位を顧問先に提案
for (const match of matches.slice(0, 5)) {
  console.log(`[${match.matchScore}点] ${match.subsidy.title}`);
  console.log(`  理由: ${match.matchReasons.join(', ')}`);
}
```

### 2. 締切アラート

受付終了日が近い補助金を自動通知（例: 30日以内に締め切りの補助金を毎週チェック）

### 3. 申請ステータス管理

jGrants APIは閲覧専用のため、申請ステータスは税理士CRM側のDBで管理します。
jGrants ポータル上での申請にはGビズIDによるログインが必要です。

## 注意事項

- キーワードは2文字以上で指定する必要がある
- 添付PDFファイルはBase64エンコードされており、詳細取得レスポンスに含まれる
- V2エンドポイントではworkflow（公募回次）情報が追加されるため、複数回公募の管理にはV2を推奨
- GビズIDの認証連携は本APIの範囲外（申請フローはjGrantsポータルで実施）
