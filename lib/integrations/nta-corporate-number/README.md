# 国税庁 法人番号公表システム Web-API連携

## 公式ドキュメント
- Web-API概要: https://www.houjin-bangou.nta.go.jp/webapi/index.html
- 仕様書ダウンロード: https://www.houjin-bangou.nta.go.jp/webapi/kyuusiyousyo.html
- 概要編: https://www.houjin-bangou.nta.go.jp/documents/k-web-api-kinou-gaiyo.pdf
- Ver.4仕様: https://www.houjin-bangou.nta.go.jp/documents/k-web-api-kinou-ver4.pdf

## 認証方式
- **アプリケーションID認証**（APIキー方式）
- 無料で取得可能
- 国税庁に申請して発行
- インボイスAPI用IDとは別（2023年1月20日以降）

## Base URL
```
https://api.houjin-bangou.nta.go.jp
```

## APIバージョン
- Ver.1: 基本機能
- Ver.2: 英語表記対応
- Ver.3: フリガナ対応
- Ver.4: 最新（フリガナ + QRコードURL）

推奨: Ver.4（`/{version}/` の部分に `4` を指定）

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/{version}/num` | 法人番号による法人情報検索 |
| GET | `/{version}/name` | 法人名による法人情報検索 |
| GET | `/{version}/diff` | 期間指定による変更履歴取得 |

## リクエストパラメータ

### `/{version}/num` - 法人番号検索
| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `id` | Yes | アプリケーションID |
| `number` | Yes | 法人番号（13桁、カンマ区切りで複数指定可能） |
| `type` | Yes | レスポンス形式（01:CSV(SJIS), 02:CSV(UTF), 12:XML） |
| `history` | Yes | 変更履歴（0:なし, 1:あり） |

### `/{version}/name` - 法人名検索
| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `id` | Yes | アプリケーションID |
| `name` | Yes | 法人名（URLエンコード必須） |
| `type` | Yes | レスポンス形式 |
| `mode` | Yes | 検索方式（1:前方一致, 2:部分一致） |
| `target` | Yes | 検索対象（1:あいまい, 2:完全一致, 3:英語表記） |
| `address` | No | 都道府県コード（01-47） |
| `kind` | No | 法人種別 |
| `close` | No | 閉鎖法人（0:除外, 1:含む） |

### `/{version}/diff` - 期間差分検索
| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `id` | Yes | アプリケーションID |
| `from` | Yes | 開始日（yyyy-MM-dd） |
| `to` | Yes | 終了日（yyyy-MM-dd） |
| `type` | Yes | レスポンス形式 |

## レスポンス形式
- **XML** (`type=12`): 構造化データとして取得（推奨）
- **CSV** (`type=01/02`): テキストデータとして取得
- **JSON非対応**: JSONレスポンスは提供されていない

## レート制限
- 公式のレート制限値は非公開
- 大量リクエスト時はアクセス制限の可能性あり
- 全件ダウンロードは別途提供（月次更新CSV）

## 注意事項・制約
- 法人番号は13桁の数字のみ受け付け（12桁は不可）
- JSONレスポンスは非対応（XML/CSVのみ）
- XMLパースにはxml2jsやfast-xml-parser等のライブラリが必要
- 法人名検索の `mode=2&target=1`（部分一致+あいまい）が最も多くの結果を返す
- 閉鎖法人はデフォルトで除外される（`close=1` で含める）
- 全件データは国税庁サイトから別途CSV一括ダウンロード可能
