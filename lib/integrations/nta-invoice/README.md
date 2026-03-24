# 国税庁 適格請求書発行事業者公表システム Web-API連携

## 公式ドキュメント
- Web-API概要: https://www.invoice-kohyo.nta.go.jp/web-api/index.html
- 仕様書ダウンロード: https://www.invoice-kohyo.nta.go.jp/web-api/web-api-download.html
- 利用手続: https://www.invoice-kohyo.nta.go.jp/web-api/shinsei-invoice.html
- FAQ: https://www.invoice-kohyo.nta.go.jp/files/web-api_faq.pdf

## 認証方式
- **アプリケーションID認証**（APIキー方式）
- 無料で取得可能
- 国税庁に申請書を提出して発行（法人番号公表APIとは別のID）
- 問い合わせ先: invoice-web-api@nta.go.jp

## Base URL
```
https://web-api.invoice-kohyo.nta.go.jp
```
※グローバルIPアドレスが予告なく変更される場合があるため、ドメイン名でアクセスすること

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/1/num` | 登録番号による事業者検索（最大10件一括） |
| GET | `/1/diff` | 期間指定による差分データ取得 |
| GET | `/1/valid` | 登録番号＋日付指定による有効性確認 |

## リクエストパラメータ

### `/1/num` - 登録番号検索
| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `id` | Yes | アプリケーションID |
| `number` | Yes | 登録番号（T+13桁、カンマ区切りで最大10件） |
| `type` | Yes | レスポンス形式（01:CSV(SJIS), 02:CSV(UTF), 12:XML, 21:JSON） |
| `history` | Yes | 変更履歴（0:なし, 1:あり） |

### `/1/diff` - 期間指定差分検索
| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `id` | Yes | アプリケーションID |
| `from` | Yes | 開始日（yyyy-MM-dd） |
| `to` | Yes | 終了日（yyyy-MM-dd） |
| `type` | Yes | レスポンス形式 |
| `division` | Yes | 事業者種別（1:個人, 2:法人, 3:全て） |
| `divide` | No | 分割番号（大量データ時） |

### `/1/valid` - 有効性確認
| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `id` | Yes | アプリケーションID |
| `number` | Yes | 登録番号（カンマ区切りで最大10件） |
| `day` | Yes | 判定日（yyyy-MM-dd） |
| `type` | Yes | レスポンス形式 |

## レート制限
- 公式のレート制限値は非公開
- 大量リクエスト時はアクセス制限が発生する可能性あり
- 全件ダウンロードは別途提供（CSV形式）

## 注意事項・制約
- 登録番号は「T」+13桁の数字形式（法人番号の先頭にTを付与）
- 一括検索は最大10件まで
- 個人事業者の氏名は公表選択制のため、取得できない場合がある
- JSONレスポンス（type=21）はVer.1.0以降で利用可能
- 全件データのダウンロードは月次更新（別途ダウンロード機能を利用）
- 2023年1月20日以降、法人番号公表API用のIDとは別にインボイスAPI用のID発行申請が必要
