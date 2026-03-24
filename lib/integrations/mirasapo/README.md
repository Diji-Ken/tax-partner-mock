# ミラサポplus 連携（経済産業省 / 中小企業庁）

## 公式ドキュメント（エビデンス）

| リソース | URL |
|---------|-----|
| ミラサポplus トップ | https://mirasapo-plus.go.jp/ |
| 補助金一覧 | https://mirasapo-plus.go.jp/subsidy/ |
| RSSフィード案内 | https://mirasapo-plus.go.jp/rss_feed/ |
| ヘルプ・使い方 | https://mirasapo-plus.go.jp/help/ |
| jGrants ポータル（連携先） | https://www.jgrants-portal.go.jp/ |

## 運営組織

経済産業省 中小企業庁

## API の有無

**公開REST APIは提供されていない。**

ミラサポplusはWordPressベースのCMSで構築されており、WordPress REST API (`/wp-json/`) は存在するが、
外部開発者向けの公開APIとしては提供されていない。

### 利用可能なデータ取得手段

| 手段 | 推奨度 | 説明 |
|------|-------|------|
| **RSSフィード** | 推奨 | WordPress標準RSS 2.0。カテゴリ別4種類 |
| **jGrants API連携** | 推奨 | 補助金の詳細検索はjGrants公開APIで実施 |
| Webスクレイピング | 非推奨 | 構造変更リスクが高い |

## RSSフィード一覧

ミラサポplusは4種類のRSSフィードを提供:

| フィード | URL | 説明 | 件数目安 |
|---------|-----|------|---------|
| お知らせ（全体） | `/category/infomation/feed/` | 全カテゴリ | 約20件 |
| 補助金・助成金 | `/category/infomation/subsidy/feed/` | 補助金関連のみ | 約20件 |
| イベント | `/category/infomation/event/feed/` | セミナー・イベント | 約20件 |
| 災害支援 | `/category/infomation/disaster/feed/` | 災害関連支援 | 件数変動 |

### RSSフィード形式

- **フォーマット**: RSS 2.0（WordPress標準）
- **拡張namespace**:
  - `content:` (RSS Content Module) - 全文HTML
  - `wfw:` (Well Formed Web) - コメントフィード
  - `dc:` (Dublin Core) - 投稿者情報
  - `atom:` (Atom Protocol) - セルフリンク
  - `sy:` (Syndication) - 更新頻度
  - `slash:` (Slash Module) - コメント数
- **文字コード**: UTF-8
- **投稿者**: "ミラサポplus運営事務局"

### RSSアイテムのフィールド

| XMLタグ | 説明 | 例 |
|--------|------|------|
| `<title>` | 記事タイトル | "【公募開始】小規模事業者持続化補助金..." |
| `<link>` | 記事URL | `https://mirasapo-plus.go.jp/infomation/12345/` |
| `<dc:creator>` | 投稿者 | "ミラサポplus運営事務局" |
| `<pubDate>` | 公開日時 (RFC 2822) | "Tue, 17 Mar 2026 04:49:26 +0000" |
| `<category>` | カテゴリ（複数可） | "補助金・助成金", "持続化補助金" |
| `<description>` | 概要（プレーンテキスト） | 末尾 "[...]" で省略 |
| `<content:encoded>` | 全文HTML (CDATA) | 画像・リンク含むフルHTML |
| `<guid>` | 記事の永続ID | `?p=12345` |
| `<slash:comments>` | コメント数 | "0" |

### カテゴリ体系

**主要カテゴリ:**
- お知らせ
- 補助金・助成金
- イベント
- 災害支援

**補助金サブカテゴリ:**
- 持続化補助金
- 省力化投資補助金 / 省力化補助金
- ものづくり補助金
- デジタル化・AI導入補助金
- IT導入補助金
- 新事業進出補助金
- 成長加速化補助金
- 事業承継・M&A補助金

**横断カテゴリ:**
- 賃上げ, 設備投資, 販路開拓, 資金繰り
- 金融・税制, 相談・情報提供, 商店街・まちづくり

## jGrants との連携方式

ミラサポplusとjGrantsは以下の関係にある:

| サービス | 役割 | データ取得 |
|---------|------|----------|
| ミラサポplus | 補助金の情報ポータル（概要・ニュース） | RSS フィード |
| jGrants | 補助金の電子申請システム（検索・申請） | 公開 API |

### 連携ワークフロー

1. **ミラサポplus RSS** で最新の補助金ニュースを検出
2. `extractJGrantsKeyword()` でタイトルから検索キーワードを抽出
3. **jGrants API** (`searchSubsidies()`) で補助金の詳細情報を取得
4. 顧問先の条件にマッチングして提案

```typescript
import { searchSubsidyNews, extractJGrantsKeyword } from './mirasapo/client';
import { searchSubsidies } from './jgrants/client';

// Step 1: ミラサポplusの最新情報を取得
const news = await searchSubsidyNews();

// Step 2-3: jGrantsで詳細検索
for (const item of news.items) {
  const keyword = extractJGrantsKeyword(item.title);
  if (keyword.length >= 2) {
    const detail = await searchSubsidies({ keyword, acceptance: 1 });
    console.log(`${item.title} → jGrants ${detail.metadata.resultset.count}件`);
  }
}
```

## 補助金ページのURLパターン

| パターン | 説明 | 例 |
|---------|------|------|
| `/subsidy/{slug}/` | 主要補助金の特集ページ | `/subsidy/shoryokuka/` |
| `/infomation/{id}/` | お知らせ記事 | `/infomation/30803/` |
| `/category/{cat}/` | カテゴリ別一覧 | `/category/infomation/subsidy/` |
| `/category/{cat}/feed/` | カテゴリ別RSSフィード | `/category/infomation/subsidy/feed/` |

### 主要補助金スラッグ

| スラッグ | 補助金名 |
|---------|---------|
| `shoryokuka` | 省力化投資補助金 |
| `monodukuri` | ものづくり・商業・サービス生産性向上促進補助金 |
| `jizokuka` | 小規模事業者持続化補助金 |
| `it-hojo` | IT導入補助金 |
| `shinjigyou` | 新事業進出補助金 |
| `seichokasokuka` | 中小企業成長加速化補助金 |
| `jigyoshokei` | 事業承継・M&A補助金 |

## レート制限

- 公式のレート制限は明示されていない
- WordPress標準のRSSフィードはサーバー負荷が低い
- 本クライアントでは1時間のキャッシュを適用
- 過度なアクセスは控えること

## 税理士CRMポータルでの活用方法

### 1. 補助金ニュースの自動収集・顧問先通知

```typescript
import { searchSubsidyNews } from './client';

// 最新の補助金ニュースを取得
const news = await searchSubsidyNews();

// 24時間以内の新着のみ抽出
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const recentNews = news.items.filter(
  item => new Date(item.publishDate) > oneDayAgo
);
```

### 2. 主要補助金の一覧ダッシュボード

```typescript
import { getMajorSubsidies } from './client';

const subsidies = getMajorSubsidies();
// 各補助金の概要とjGrants検索リンクを表示
```

### 3. 経営診断ツールへのリンク

ミラサポplusの経営診断機能（ローカルベンチマーク）を顧問先に案内:
- 財務分析: https://mirasapo-plus.go.jp/biz/finance/menu
- 経営診断: https://mirasapo-plus.go.jp/report/top

## 注意事項

- ミラサポplusは公開APIを提供していないため、RSSフィードの形式変更リスクがある
- WordPress REST API (`/wp-json/`) は外部利用を想定していないため使用しないこと
- 補助金の詳細検索・電子申請はjGrants APIおよびjGrantsポータルで実施
- RSSフィードには直近の更新情報のみ含まれる（過去の全履歴は取得不可）
- ミラサポplusへのログイン（GビズID連携）は本クライアントの範囲外
