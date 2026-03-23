/**
 * クラウドサイン Web API クライアント
 *
 * 公式ドキュメント:
 * - https://help.cloudsign.jp/ja/articles/936884
 * - https://help.cloudsign.jp/ja/articles/2681259
 * - https://app.swaggerhub.com/apis/CloudSign/cloudsign-web_api/
 *
 * 認証: Client ID ベースのトークン認証
 * Base URL (本番): https://api.cloudsign.jp
 * Base URL (サンドボックス): https://api-sandbox.cloudsign.jp
 */

import type {
  CloudSignTokenResponse,
  DocumentsListResponse,
  CloudSignDocument,
  DocumentCreateParams,
  CloudSignFile,
  CloudSignParticipant,
  ParticipantCreateParams,
  ParticipantUpdateParams,
  CloudSignWidget,
  WidgetCreateParams,
  DocumentAttribute,
  CertificateResponse,
  CabinetsListResponse,
  ImportedDocument,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.CLOUDSIGN_CLIENT_ID || 'demo_client_id',
  /** 本番環境URL */
  baseUrl: process.env.CLOUDSIGN_BASE_URL || 'https://api.cloudsign.jp',
  /** サンドボックス環境URL */
  sandboxBaseUrl: 'https://api-sandbox.cloudsign.jp',
  /** トークンエンドポイント */
  tokenUrl: 'https://api.cloudsign.jp/token',
};

// ============================================================
// ヘルパー
// ============================================================

function getHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

async function get<T>(path: string, token: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const qs = params ? buildQueryString(params) : '';
  const url = `${config.baseUrl}${path}${qs}`;
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CloudSign API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CloudSign API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function putRequest<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CloudSign API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function del(path: string, token: string): Promise<void> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'DELETE', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CloudSign API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
}

// ============================================================
// 認証（トークン取得）
// ============================================================

/**
 * アクセストークンを取得
 * POST /token にclient_idを送信してアクセストークンを受け取る
 *
 * トークン有効期限: 3600秒（1時間）
 * @param clientId - クライアントID（省略時は環境変数から取得）
 */
export async function getAccessToken(clientId?: string): Promise<CloudSignTokenResponse> {
  const id = clientId || config.clientId;
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: id }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CloudSign token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<CloudSignTokenResponse>;
}

// ============================================================
// 書類 (Documents)
// ============================================================

/**
 * 書類一覧取得
 * GET /documents
 *
 * 100件/ページ。ページネーションはpage パラメータで制御
 */
export async function getDocuments(
  token: string,
  opts?: { page?: number; per_page?: number }
): Promise<DocumentsListResponse> {
  return get<DocumentsListResponse>('/documents', token, opts);
}

/**
 * 書類詳細取得
 * GET /documents/{documentID}
 */
export async function getDocument(token: string, documentId: string): Promise<CloudSignDocument> {
  return get<CloudSignDocument>(`/documents/${documentId}`, token);
}

/**
 * 書類の作成（下書き）
 * POST /documents
 *
 * @param token - アクセストークン
 * @param params - 書類作成パラメータ
 */
export async function createDocument(token: string, params: DocumentCreateParams): Promise<CloudSignDocument> {
  return post<CloudSignDocument>('/documents', token, params);
}

/**
 * 書類タイトル・備考の更新（下書き状態のみ）
 * PUT /documents/{documentID}
 */
export async function updateDocument(
  token: string,
  documentId: string,
  params: { title?: string; note?: string }
): Promise<CloudSignDocument> {
  return putRequest<CloudSignDocument>(`/documents/${documentId}`, token, params);
}

/**
 * 書類の送信（署名依頼）
 * POST /documents/{documentID}
 *
 * 下書き状態の書類を宛先に送信する。
 * 送信済みの書類に対して呼び出すとリマインドとなる。
 */
export async function sendDocument(token: string, documentId: string): Promise<CloudSignDocument> {
  return post<CloudSignDocument>(`/documents/${documentId}`, token, {});
}

/**
 * 書類のキャンセル（送信済み書類の取り消し）
 * PUT /documents/{documentID}/decline
 */
export async function cancelDocument(token: string, documentId: string): Promise<CloudSignDocument> {
  return putRequest<CloudSignDocument>(`/documents/${documentId}/decline`, token, {});
}

// ============================================================
// ファイル (Files)
// ============================================================

/**
 * 書類にファイルを追加（下書き状態のみ）
 * POST /documents/{documentID}/files
 *
 * @param token - アクセストークン
 * @param documentId - 書類ID
 * @param file - PDFファイル
 * @param fileName - ファイル名
 */
export async function addFile(
  token: string,
  documentId: string,
  file: File | Blob,
  fileName: string
): Promise<CloudSignFile> {
  const formData = new FormData();
  formData.append('file', file, fileName);

  const response = await fetch(`${config.baseUrl}/documents/${documentId}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CloudSign file upload error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<CloudSignFile>;
}

/**
 * ファイルのダウンロード
 * GET /documents/{documentID}/files/{fileID}
 */
export async function downloadFile(token: string, documentId: string, fileId: string): Promise<Blob> {
  const url = `${config.baseUrl}/documents/${documentId}/files/${fileId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`CloudSign file download error: ${response.status}`);
  }
  return response.blob();
}

/**
 * ファイルの削除（下書き状態のみ）
 * DELETE /documents/{documentID}/files/{fileID}
 */
export async function deleteFile(token: string, documentId: string, fileId: string): Promise<void> {
  return del(`/documents/${documentId}/files/${fileId}`, token);
}

// ============================================================
// 宛先・署名者 (Participants)
// ============================================================

/**
 * 宛先の追加
 * POST /documents/{documentID}/participants
 */
export async function addParticipant(
  token: string,
  documentId: string,
  params: ParticipantCreateParams
): Promise<CloudSignParticipant> {
  return post<CloudSignParticipant>(`/documents/${documentId}/participants`, token, params);
}

/**
 * 宛先の更新
 * PUT /documents/{documentID}/participants/{participantID}
 */
export async function updateParticipant(
  token: string,
  documentId: string,
  participantId: string,
  params: ParticipantUpdateParams
): Promise<CloudSignParticipant> {
  return putRequest<CloudSignParticipant>(
    `/documents/${documentId}/participants/${participantId}`,
    token,
    params
  );
}

/**
 * 宛先の削除
 * DELETE /documents/{documentID}/participants/{participantID}
 */
export async function deleteParticipant(
  token: string,
  documentId: string,
  participantId: string
): Promise<void> {
  return del(`/documents/${documentId}/participants/${participantId}`, token);
}

// ============================================================
// 入力項目 (Widgets)
// ============================================================

/**
 * 入力項目の追加
 * POST /documents/{documentID}/files/{fileID}/widgets
 */
export async function addWidget(
  token: string,
  documentId: string,
  fileId: string,
  params: WidgetCreateParams
): Promise<CloudSignWidget> {
  return post<CloudSignWidget>(`/documents/${documentId}/files/${fileId}/widgets`, token, params);
}

/**
 * 入力項目の更新
 * PUT /documents/{documentID}/files/{fileID}/widgets/{widgetID}
 */
export async function updateWidget(
  token: string,
  documentId: string,
  fileId: string,
  widgetId: string,
  params: Partial<WidgetCreateParams>
): Promise<CloudSignWidget> {
  return putRequest<CloudSignWidget>(
    `/documents/${documentId}/files/${fileId}/widgets/${widgetId}`,
    token,
    params
  );
}

/**
 * 入力項目の削除
 * DELETE /documents/{documentID}/files/{fileID}/widgets/{widgetID}
 */
export async function deleteWidget(
  token: string,
  documentId: string,
  fileId: string,
  widgetId: string
): Promise<void> {
  return del(`/documents/${documentId}/files/${fileId}/widgets/${widgetId}`, token);
}

// ============================================================
// 書類属性 (Document Attributes)
// ============================================================

/**
 * 書類属性の取得
 * GET /documents/{documentID}/attribute
 */
export async function getDocumentAttribute(token: string, documentId: string): Promise<DocumentAttribute[]> {
  return get<DocumentAttribute[]>(`/documents/${documentId}/attribute`, token);
}

/**
 * 書類属性の作成・更新
 * PUT /documents/{documentID}/attribute
 */
export async function updateDocumentAttribute(
  token: string,
  documentId: string,
  attributes: DocumentAttribute[]
): Promise<DocumentAttribute[]> {
  return putRequest<DocumentAttribute[]>(`/documents/${documentId}/attribute`, token, { attributes });
}

// ============================================================
// 締結証明書
// ============================================================

/**
 * 締結証明書の取得
 * GET /documents/{documentID}/certificate
 *
 * 締結完了した書類のみ取得可能
 */
export async function getCertificate(token: string, documentId: string): Promise<CertificateResponse> {
  return get<CertificateResponse>(`/documents/${documentId}/certificate`, token);
}

// ============================================================
// キャビネット (Enterprise)
// ============================================================

/**
 * キャビネット一覧取得
 * GET /cabinets
 *
 * Enterpriseプラン専用
 */
export async function getCabinets(token: string): Promise<CabinetsListResponse> {
  return get<CabinetsListResponse>('/cabinets', token);
}

// ============================================================
// インポート書類
// ============================================================

/**
 * PDF書類のインポート
 * POST /imported_documents
 *
 * 署名不要のPDFをクラウドサインで管理するためにインポート
 */
export async function importDocument(
  token: string,
  file: File | Blob,
  title: string
): Promise<ImportedDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const response = await fetch(`${config.baseUrl}/imported_documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CloudSign import error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<ImportedDocument>;
}

// ============================================================
// 書類作成の完全フロー（ヘルパー）
// ============================================================

/**
 * 書類作成から送信までの一括フロー
 *
 * 1. 書類作成（下書き）
 * 2. PDFファイル添付
 * 3. 宛先追加
 * 4. 入力項目設定（任意）
 * 5. 送信
 *
 * @param token - アクセストークン
 * @param title - 書類タイトル
 * @param pdfFile - PDFファイル
 * @param fileName - ファイル名
 * @param participants - 宛先一覧
 * @param widgets - 入力項目一覧（任意）
 */
export async function createAndSendDocument(
  token: string,
  title: string,
  pdfFile: File | Blob,
  fileName: string,
  participants: ParticipantCreateParams[],
  widgets?: WidgetCreateParams[]
): Promise<CloudSignDocument> {
  // 1. 書類作成
  const document = await createDocument(token, { title });

  // 2. ファイル添付
  const file = await addFile(token, document.id, pdfFile, fileName);

  // 3. 宛先追加
  const addedParticipants: CloudSignParticipant[] = [];
  for (const p of participants) {
    const participant = await addParticipant(token, document.id, p);
    addedParticipants.push(participant);
  }

  // 4. 入力項目設定（任意）
  if (widgets && widgets.length > 0) {
    for (const w of widgets) {
      await addWidget(token, document.id, file.id, w);
    }
  }

  // 5. 送信
  const sentDocument = await sendDocument(token, document.id);
  return sentDocument;
}
