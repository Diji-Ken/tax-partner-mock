# J-Net21 支援情報ヘッドライン連携

## データソース（エビデンス）

| リソース | URL |
|---------|-----|
| J-Net21 トップ | https://j-net21.smrj.go.jp/ |
| 支援情報ヘッドライン | https://j-net21.smrj.go.jp/snavi2/ |
| 支援情報検索ページ | https://j-net21.smrj.go.jp/snavi/articles |
| ヘッドラインアプリ | https://j-net21.smrj.go.jp/snavi/etc/app.html |
| 参考: code4fukui/JNet21 | https://github.com/code4fukui/JNet21 |
| 参考: スクレイピング事例 | https://fukuno.jig.jp/3388 |

## 運営組織

独立行政法人 中小企業基盤整備機構 (SMRJ: Small and Medium Enterprise Agency)

## 認証方式

**認証不要**

J-Net21は公開APIを提供していないが、以下のデータ取得手段が利用可能:

1. **RSSフィード（推奨）** - 公式提供。認証不要。
2. **Webスクレイピング** - 検索ページのHTMLをパース。利用規約に注意。

本クライアントはRSSフィードを主たるデータソースとして使用しています。

## RSSフィード一覧

J-Net21は3種類のRSSフィードを公式に提供:

| フィード | URL | 内容 | 件数目安 |
|---------|-----|------|---------|
| 補助金・助成金・融資 | `/snavi/support/support.xml` | 各種補助金、助成金、融資制度 | 約24件 |
| セミナー・イベント | `/snavi/event/event.xml` | セミナー、研修、展示会等 | 約60件 |
| その他 | `/snavi/public/public.xml` | 上記以外の支援情報 | 約20件 |

### RSSフィード形式

- **フォーマット**: RSS 2.0
- **拡張namespace**:
  - `rdf` (http://www.w3.org/1999/02/22-rdf-syntax-ns#)
  - `dc` (http://purl.org/dc/elements/1.1/) - Dublin Core
  - `grant` (https://j-net21.smrj.go.jp/headline/rdf-syntax/1.0/) - 独自拡張
- **文字コード**: UTF-8
- **更新頻度**: 毎日更新（最終更新時刻はフィード内に記載）

### RSSアイテムのフィールド

| XMLタグ | フィールド名 | 説明 |
|--------|------------|------|
| `<title>` | title | 支援制度名 / イベント名 |
| `<link>` | link | 詳細ページURL |
| `<description>` | description | 概要（CDATA形式、HTML含む） |
| `<category>` | category | "support" / "event" / "public" |
| `<dc:creator>` | creator | 発行組織名 |
| `<dc:subject>` | subject | 分類（例: "補助金・助成金・融資 - 補助金・助成金"） |
| `<dc:coverage>` | coverage | 地域情報（rdf:value=都道府県コード, rdf:label=都道府県名） |
| `<dc:date>` | date | 公開日時 (ISO 8601) |

### 地域コード (dc:coverage)

ISO 3166-2:JP 準拠の都道府県コード:

| コード | 都道府県 | コード | 都道府県 |
|-------|---------|-------|---------|
| JP-01 | 北海道 | JP-13 | 東京都 |
| JP-11 | 埼玉県 | JP-14 | 神奈川県 |
| JP-23 | 愛知県 | JP-27 | 大阪府 |
| JP-40 | 福岡県 | JP-47 | 沖縄県 |

（全47都道府県対応。types.ts の `PREFECTURE_CODES` に完全な定義あり）

## Web検索のURLパターン

検索ページ: `https://j-net21.smrj.go.jp/snavi/articles`

### クエリパラメータ

| パラメータ | 型 | 説明 | 例 |
|-----------|------|------|------|
| `category[]` | integer[] | カテゴリ (1: 補助金, 2: セミナー, 3: その他) | `category[]=1` |
| `prefecture[]` | string[] | 都道府県コード ("00": 全国, "13": 東京都) | `prefecture[]=13` |
| `keyword` | string | キーワード検索 | `keyword=DX` |
| `order` | string | ソート順 (DESC / ASC) | `order=DESC` |
| `perPage` | integer | 表示件数 | `perPage=10` |
| `page` | integer | ページ番号 | `page=1` |

### URLの例

```
# 補助金カテゴリ＋東京都
https://j-net21.smrj.go.jp/snavi/articles?category%5B%5D=1&prefecture%5B%5D=13

# 全カテゴリ＋全国
https://j-net21.smrj.go.jp/snavi/articles?category%5B%5D=1&category%5B%5D=2&category%5B%5D=3&prefecture%5B%5D=00

# 滋賀県の全カテゴリ
https://j-net21.smrj.go.jp/snavi/articles?category%5B%5D=2&category%5B%5D=1&category%5B%5D=3&prefecture%5B%5D=25
```

## レート制限

- 公式のレート制限は明示されていない
- RSSフィードは静的XMLファイルのため負荷は低い
- 本クライアントではRSSフィードを30分間キャッシュして過度なアクセスを防止
- Webスクレイピングを行う場合は1秒以上の間隔を空けること

## キャッシュ戦略

| データソース | キャッシュ時間 | 理由 |
|------------|-------------|------|
| RSSフィード | 30分 | フィードは毎日更新だが日中にも追加あり |
| 検索結果 | 実装者に委任 | 検索条件ごとに異なるため |

## 税理士CRMポータルでの活用方法

### 1. 顧問先エリアの補助金情報自動収集

```typescript
import { fetchByPrefecture } from './client';

// 埼玉県の支援情報を取得
const saitamaSupport = await fetchByPrefecture('11');

// 補助金のみ抽出
const subsidies = saitamaSupport.filter(
  item => item.source === 'rss_support'
);
```

### 2. キーワード横断検索

```typescript
import { searchSupportInfo } from './client';

const result = await searchSupportInfo({
  category: [1],          // 補助金・助成金
  prefecture: ['11'],     // 埼玉県
  keyword: 'IT導入',
});
```

### 3. 新着アラート

RSSフィードの `dc:date` を前回取得日時と比較し、新着情報のみを通知。

### 4. jGrants連携

J-Net21で発見した補助金情報を、jGrants APIで詳細検索するワークフロー:
1. J-Net21 RSSで新着補助金を検出
2. 補助金名をキーワードにjGrants APIで詳細検索
3. 申請期限・補助率等の詳細を取得
4. 顧問先にマッチングして提案

## 注意事項

- J-Net21は公開APIを提供していないため、RSSフィードの形式が予告なく変更される可能性がある
- Webスクレイピングはサイト利用規約を確認の上、節度あるアクセス頻度で実施すること
- RSSフィードには全件が含まれるわけではなく、直近の新着情報のみ（support: 約24件、event: 約60件）
- 過去の支援情報の網羅的な取得にはWebスクレイピングが必要
- code4fukui/JNet21プロジェクト（参考実装）ではDeno + GitHub Actionsで日次CSV更新を実現している
