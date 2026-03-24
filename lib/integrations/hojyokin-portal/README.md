# 補助金ポータル 連携

## 公式情報（エビデンス）

| リソース | URL |
|---------|-----|
| 補助金ポータル（メイン） | https://hojyokin-portal.jp/ |
| 士業ポータル | https://shigyo-portal.jp/ |
| 補助金コモン | https://hojyokin-comon.jp/ |
| 補助金相談所 | https://hojyokin-soudanjyo.jp/ |
| 運営会社 | https://hojyokin-portal.co.jp/ |

## 運営

**株式会社補助金ポータル**

## サービス概要

補助金ポータルは、日本国内の補助金・助成金情報を集約したWebメディア。士業向けのパートナーポータル（shigyo-portal.jp）も運営。

### DB規模

| 指標 | 値 |
|------|-----|
| 補助金・助成金情報 | **3万件以上** |
| 月間利用者 | **約100万人** |
| コラム記事 | 多数（API提供あり） |

### 関連サービス

| サービス | URL | 概要 |
|---------|-----|------|
| 補助金ポータル | hojyokin-portal.jp | メインの補助金検索・情報メディア |
| 士業ポータル | shigyo-portal.jp | 士業向けクラウドプラットフォーム |
| 補助金コモン | hojyokin-comon.jp | 補助金に関するコミュニティ |
| 補助金相談所 | hojyokin-soudanjyo.jp | 補助金の専門家相談 |

## データ取得方式

### 1. 内部API（確認済み）

```
GET /api/columns/
```

- コラム記事一覧を取得
- データ形式: JSON
- 認証: 不要
- 用途: 補助金の解説記事・最新情報・申請ノウハウ

### 2. Webスクレイピング

補助金検索・詳細ページはHTMLからの取得が必要。

- フレームワーク: **Livewire**（Laravel）ベース
- Livewireコンポーネントを利用した動的データ取得も検討可能
- 検索URL: `/search?q={keyword}&prefecture={pref}`

### 3. 公開APIドキュメント

**公開APIドキュメントは存在しない。** `/api/columns/` はページソースのAJAXリクエストから確認。

## 士業パートナー連携

### 士業ポータル（shigyo-portal.jp）

士業（税理士・社労士・行政書士等）向けのクラウドプラットフォーム。

#### 主な機能

| 機能 | 説明 |
|------|------|
| マイページ | 専門家プロフィールページ（SEO最適化） |
| 記事投稿 | コラム記事の投稿・情報発信 |
| 顧客メッセージ管理 | クライアント別のメッセージ管理 |
| サービス・料金表示 | 専門分野・価格の公開 |
| 集客支援 | 月100万人の利用者からの集客 |

#### 登録フロー

1. `/register` からパートナー申請
2. プランを選択（`/plan`）
3. クレジットカード決済で有効化
4. プロフィールページ公開

#### 決済

- **クレジットカード決済のみ**
- プラン料金は `/plan` ページで確認

### 税理士事務所向けの活用ポイント

1. **集客チャネル**: 月100万人の利用者に自事務所をPR
2. **コンテンツマーケティング**: 補助金関連記事を投稿して専門性をアピール
3. **顧問先紹介**: 補助金申請のサポートを求める事業者とマッチング

## 更新方法

### コラム記事（日次）
1. `/api/columns/` APIで最新コラムを取得
2. 新着記事の補助金情報を抽出
3. 顧問先に関連する記事を自動通知

### 補助金情報（日次）
1. 検索ページをスクレイピングして最新データを取得
2. 前回取得分と比較し、新規・更新・終了を検出
3. 顧問先マッチングを実行

## 税理士CRMポータルでの活用方法

### 1. 補助金検索

```typescript
import { searchSubsidies } from './client';

const result = await searchSubsidies({
  keyword: 'IT導入',
  prefecture: '東京都',
  status: '募集中',
});
```

### 2. コラム記事活用

```typescript
import { getColumns } from './client';

// 最新のコラム記事を取得して顧問先に共有
const columns = await getColumns();
```

### 3. 士業パートナー連携

```typescript
import { getExpertSearchUrl, getPartnerRegistrationUrl } from './client';

// 補助金申請の専門家を検索
const url = getExpertSearchUrl('社会保険労務士', '東京都');

// パートナー登録ページ
const registerUrl = getPartnerRegistrationUrl();
```

## 注意事項

- コラムAPI以外の補助金データ取得にはスクレイピングが必要
- Livewireベースのため、従来型のHTMLスクレイピングが困難な場合あり
- 士業ポータルへの登録にはクレジットカード決済が必要
- 公式のデータ提供パートナーシップについては直接問い合わせが必要
