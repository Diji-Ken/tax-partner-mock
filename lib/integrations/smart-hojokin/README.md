# スマート補助金 連携

## 公式情報（エビデンス）

| リソース | URL |
|---------|-----|
| 公式サイト | https://www.smart-hojokin.jp/ |
| 都道府県一覧 | https://www.smart-hojokin.jp/subsidy/prefectures |
| 内部API（地域取得） | `GET /api/v1/public/areas?prefecture_id={id}` |

## サービス概要

スマート補助金は、日本全国の補助金・助成金・給付金を横断検索できるポータルサイト。

- **DB規模**: 75,818件以上（2026年3月時点）
- **対象制度**: 補助金、助成金、給付金の3分類
- **地域**: 47都道府県 + 全国 + その他（ID: 1-49）
- **業種**: 12カテゴリ（製造業、情報通信業、宿泊業・飲食業 等）
- **利用目的**: 14カテゴリ（設備投資、IT導入、販路開拓 等）
- **対象者**: 企業、団体、個人、その他

## データ取得方式

### 1. 内部API（確認済み）

```
GET /api/v1/public/areas?prefecture_id={id}
```

- 都道府県IDを指定して市区町村一覧を取得
- 認証不要（公開API）
- JavaScriptのAJAXリクエストで呼び出し（`$.get`）
- レスポンス: JSON

### 2. Webスクレイピング

補助金一覧・詳細はHTMLページからの取得が必要。

**URL パターン:**

| パターン | 説明 |
|---------|------|
| `/subsidy/prefectures/{id}` | 都道府県別の補助金一覧 |
| `/subsidy/prefectures/{id}/classifies/{type}` | 分類別（1=補助金, 2=助成金, 3=給付金） |
| `/subsidy/prefectures/{id}/areas/{areaId}` | 市区町村別 |

### 3. 公開APIドキュメント

**公開APIドキュメントは存在しない。** 内部APIの `/api/v1/public/areas` はページソースのJavaScriptから確認。

## 都道府県ID一覧

| ID | 都道府県 | ID | 都道府県 | ID | 都道府県 |
|----|---------|-----|---------|-----|---------|
| 1 | 北海道 | 17 | 石川県 | 33 | 岡山県 |
| 2 | 青森県 | 18 | 福井県 | 34 | 広島県 |
| 3 | 岩手県 | 19 | 山梨県 | 35 | 山口県 |
| ... | ... | ... | ... | ... | ... |
| 11 | 埼玉県 | 27 | 大阪府 | 47 | 沖縄県 |
| 13 | 東京都 | 40 | 福岡県 | 48 | 全国 |

## 分類ID

| ID | 分類名 |
|----|-------|
| 1 | 補助金 |
| 2 | 助成金 |
| 3 | 給付金 |

## 技術的な注意事項

- **reCAPTCHA保護**: Google reCAPTCHAが導入されているため、大量アクセス時はブロックされる可能性あり
- **New Relic監視**: 本番環境はNew Relicで監視されている（Agent ID: 1303038292）
- **レート制限**: 明示的なドキュメントはないが、スクレイピング時は2秒以上の間隔を推奨
- **HTMLパーサー**: 実運用ではCheerio等のHTMLパーサーが必要

## 更新方法

1. **日次バッチ**: 毎朝6:00にスクレイピングで最新データを取得
2. **差分チェック**: 前回取得分と比較し、新規・更新・終了を検出
3. **通知**: 顧問先にマッチする新着補助金があれば自動通知

## 税理士CRMポータルでの活用方法

### 1. 顧問先への補助金マッチング

```typescript
import { findSubsidiesForClient } from './client';

const matches = await findSubsidiesForClient({
  prefecture: '埼玉県',
  industry: '製造業',
  employeeCount: 30,
  purposes: ['設備投資', 'IT導入'],
  keywords: ['生産性向上'],
});
```

### 2. 地域フィルタリング

```typescript
import { getAreasByPrefecture } from './client';

// 埼玉県の市区町村一覧を取得
const areas = await getAreasByPrefecture(11);
```

### 3. 自治体独自制度の発掘

全国制度（jGrants等）では網羅できない自治体独自の補助金・助成金を発掘可能。
75,818件のDBには市区町村レベルの制度も含まれる。
