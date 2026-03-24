# Google Drive API v3 連携

## 公式ドキュメント

- [API v3 リファレンス](https://developers.google.com/workspace/drive/api/reference/rest/v3)
- [ファイルアップロードガイド](https://developers.google.com/workspace/drive/api/guides/manage-uploads)
- [検索クエリ構文](https://developers.google.com/workspace/drive/api/guides/ref-search-terms)
- [ファイル検索ガイド](https://developers.google.com/drive/api/guides/search-files)
- [OAuth2スコープ一覧](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [権限管理](https://developers.google.com/workspace/drive/api/reference/rest/v3/permissions)

## 認証方式

### OAuth 2.0 (Authorization Code Grant)

| 項目 | URL |
|------|-----|
| 認証エンドポイント | `https://accounts.google.com/o/oauth2/v2/auth` |
| トークンエンドポイント | `https://oauth2.googleapis.com/token` |

**認証フロー:**

1. ユーザーを認証URLへリダイレクト
   ```
   https://accounts.google.com/o/oauth2/v2/auth
     ?client_id={CLIENT_ID}
     &redirect_uri={REDIRECT_URI}
     &response_type=code
     &scope=https://www.googleapis.com/auth/drive.file
     &access_type=offline
     &prompt=consent
   ```

2. 認可コードでトークン取得 (POST, application/x-www-form-urlencoded)
   ```
   grant_type=authorization_code
   &client_id={CLIENT_ID}
   &client_secret={CLIENT_SECRET}
   &code={CODE}
   &redirect_uri={REDIRECT_URI}
   ```

3. リフレッシュトークンで更新
   ```
   grant_type=refresh_token
   &client_id={CLIENT_ID}
   &client_secret={CLIENT_SECRET}
   &refresh_token={REFRESH_TOKEN}
   ```

### 利用可能なスコープ

| スコープ | 種別 | 説明 |
|---------|------|------|
| `drive.file` | 非センシティブ | アプリで開いた/作成したファイルのみ |
| `drive.appdata` | 非センシティブ | アプリ固有データフォルダのみ |
| `drive.install` | 非センシティブ | 「アプリで開く」メニュー追加 |
| `drive.readonly` | 制限付き | 全ファイル読み取り |
| `drive` | 制限付き | 全ファイル読み書き |
| `drive.metadata` | 制限付き | メタデータのみ |
| `drive.metadata.readonly` | 制限付き | メタデータ読み取り |

**推奨:** `drive.file` スコープ（非センシティブ、審査が簡易）

## Base URL

| 用途 | URL |
|------|-----|
| 通常API | `https://www.googleapis.com/drive/v3` |
| アップロード | `https://www.googleapis.com/upload/drive/v3` |

## 利用するエンドポイント一覧

### ファイル (Files)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/files` | ファイル一覧取得・検索 |
| GET | `/files/{fileId}` | ファイル詳細取得 |
| POST | `/files` | ファイル作成（メタデータのみ。フォルダ作成に使用） |
| PATCH | `/files/{fileId}` | ファイルメタデータ更新 |
| DELETE | `/files/{fileId}` | ファイル削除 |
| POST | `/files/{fileId}/copy` | ファイルコピー |
| GET | `/files/{fileId}/export` | ファイルエクスポート（Google形式→他形式） |
| GET | `/files/{fileId}?alt=media` | ファイルダウンロード |

### ファイルアップロード

| メソッド | パス | 説明 | サイズ上限 |
|---------|------|------|-----------|
| POST | `/upload/drive/v3/files?uploadType=media` | シンプルアップロード | 5MB |
| POST | `/upload/drive/v3/files?uploadType=multipart` | マルチパートアップロード | 5MB |
| POST | `/upload/drive/v3/files?uploadType=resumable` | レジュマブルアップロード | 5GB+ |

### 権限 (Permissions)

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/files/{fileId}/permissions` | 権限一覧取得 |
| POST | `/files/{fileId}/permissions` | 権限追加（共有設定） |
| GET | `/files/{fileId}/permissions/{permissionId}` | 権限詳細取得 |
| PATCH | `/files/{fileId}/permissions/{permissionId}` | 権限更新 |
| DELETE | `/files/{fileId}/permissions/{permissionId}` | 権限削除（共有解除） |

### その他

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/about` | ユーザー・ストレージ情報取得 |
| GET | `/changes` | 変更一覧取得 |
| GET | `/changes/startPageToken` | 変更追跡開始トークン取得 |

## 検索クエリ構文

`files.list` の `q` パラメータで使用する検索構文:

| 演算子 | 例 | 説明 |
|--------|-----|------|
| `=` | `mimeType = 'application/pdf'` | 完全一致 |
| `!=` | `mimeType != 'application/vnd.google-apps.folder'` | 不一致 |
| `contains` | `name contains 'report'` | 部分一致（前方一致） |
| `in` | `'folderId' in parents` | 親フォルダ指定 |
| `and` | 複数条件の組み合わせ | AND条件 |
| `or` | 複数条件の組み合わせ | OR条件 |
| `not` | `not name contains 'draft'` | 否定 |
| `has` | `properties has { key='x' and value='y' }` | プロパティ検索 |

### 使用例

```
# フォルダ内のPDFファイルを検索
'parent-folder-id' in parents and mimeType = 'application/pdf' and trashed = false

# 名前に「請求書」を含むファイル
name contains '請求書' and trashed = false

# 特定日以降に更新されたファイル
modifiedTime > '2026-01-01T00:00:00' and trashed = false

# カスタムプロパティで検索（電帳法対応）
properties has { key='partner_name' and value='株式会社デジタルツール研究所' }
```

## 電子帳簿保存法（電帳法）対応

Google Driveを電帳法のスキャナ保存・電子取引データ保存に使用する場合の設計:

### 検索要件への対応

電帳法では以下3項目での検索を義務付けている:
1. **取引年月日** → `properties.transaction_date`
2. **金額** → `properties.amount`
3. **取引先** → `properties.partner_name`

これらをGoogle Driveの `properties`（カスタムメタデータ）に格納し、
`properties has` クエリで検索可能にする。

### 推奨フォルダ構成

```
[ルートフォルダ]
  └ [年度] (例: 2026年度)
      ├ 01月/
      │   ├ 請求書/
      │   ├ 領収書/
      │   ├ 契約書/
      │   └ その他/
      ├ 02月/
      ...
```

## レート制限

Google Drive APIのレート制限はプロジェクト単位で管理される。

- デフォルト: **12,000リクエスト/分/プロジェクト**
- ユーザーあたり: **1,200リクエスト/60秒/ユーザー**
- 超過時: `403 Rate Limit Exceeded` または `429 Too Many Requests`
- エクスポネンシャルバックオフで再試行を推奨

## 注意事項

- フォルダ作成は `mimeType: 'application/vnd.google-apps.folder'` でファイル作成
- 同一ファイルへの同時並行権限操作は非対応（最後の更新のみ反映）
- レジュマブルアップロード推奨（ネットワーク不安定でも再開可能）
- `properties` は最大100個、各キー/値は124バイト以内
- `appProperties` はアプリ固有（他アプリからは不可視）
- ファイルダウンロードは `alt=media` パラメータを使用
- Google Workspace形式のファイルはエクスポートAPI経由でPDF等に変換
