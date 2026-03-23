/**
 * 弥生会計 / Misoca API クライアント
 *
 * 弥生会計本体には公開REST APIが存在しないため、以下の連携方式を提供:
 * 1. Misoca API v3（請求書・見積書・納品書のCRUD）
 * 2. 弥生会計CSVインポート形式の生成ユーティリティ
 *
 * Misoca API v3: https://doc.misoca.jp/v3/
 * OAuth2: https://app.misoca.jp/oauth2/
 * Base URL: https://app.misoca.jp/api/v3
 */

import type {
  MisocaTokenResponse,
  InvoicesResponse,
  MisocaInvoice,
  MisocaInvoiceCreateParams,
  EstimatesResponse,
  MisocaEstimate,
  DeliverySlipsResponse,
  MisocaDeliverySlip,
  ContactGroupsResponse,
  ContactsResponse,
  MisocaContact,
  DealingItemsResponse,
  MisocaDealingItem,
  MisocaUserResponse,
  YayoiJournalCsvRow,
  YAYOI_CSV_HEADERS,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.MISOCA_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.MISOCA_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.MISOCA_REDIRECT_URI || 'http://localhost:3000/api/auth/misoca/callback',
  baseUrl: 'https://app.misoca.jp/api/v3',
  authorizationUrl: 'https://app.misoca.jp/oauth2/authorize',
  tokenUrl: 'https://app.misoca.jp/oauth2/token',
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
    throw new Error(`Misoca API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Misoca API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function put<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Misoca API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function del(path: string, token: string): Promise<void> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'DELETE', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Misoca API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
}

// ============================================================
// OAuth2 認証 (Misoca)
// ============================================================

/**
 * OAuth2認証URL生成
 * @param scope - スコープ ("read" or "write")。writeはread権限を含む
 */
export function getAuthorizationUrl(scope: 'read' | 'write' = 'write'): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope,
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * 認証コードからアクセストークンを取得
 * Misocaは HTTP Basic認証でclient_id:client_secretを送信
 * @param code - OAuth2認可コード
 */
export async function getAccessToken(code: string): Promise<MisocaTokenResponse> {
  const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Misoca token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MisocaTokenResponse>;
}

/**
 * リフレッシュトークンでアクセストークンを更新
 * @param refreshToken - リフレッシュトークン
 */
export async function refreshAccessToken(refreshToken: string): Promise<MisocaTokenResponse> {
  const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Misoca token refresh error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MisocaTokenResponse>;
}

// ============================================================
// 請求書 (Invoices) - Misoca API v3
// ============================================================

/** 請求書一覧取得 */
export async function getInvoices(
  token: string,
  opts?: { page?: number; per_page?: number }
): Promise<InvoicesResponse> {
  return get<InvoicesResponse>('/invoices', token, opts);
}

/** 請求書詳細取得 */
export async function getInvoice(token: string, id: string): Promise<MisocaInvoice> {
  return get<MisocaInvoice>(`/invoice/${id}`, token);
}

/** 請求書の作成 */
export async function createInvoice(token: string, params: MisocaInvoiceCreateParams): Promise<MisocaInvoice> {
  return post<MisocaInvoice>('/invoice', token, params);
}

/** 請求書PDFダウンロードURLを取得 */
export async function getInvoicePdf(token: string, id: string): Promise<Blob> {
  const url = `${config.baseUrl}/invoice/${id}/pdf`;
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    throw new Error(`Misoca PDF download error: ${response.status}`);
  }
  return response.blob();
}

/** 請求書を「請求済み」にする */
export async function markInvoiceSubmitted(token: string, id: string): Promise<void> {
  await put<unknown>(`/invoice/${id}/submitted`, token, {});
}

/** 請求書を「未請求」に戻す */
export async function unmarkInvoiceSubmitted(token: string, id: string): Promise<void> {
  await del(`/invoice/${id}/submitted`, token);
}

/** 請求書を「入金済み」にする */
export async function markInvoicePaid(token: string, id: string): Promise<void> {
  await put<unknown>(`/invoice/${id}/paid`, token, {});
}

/** 請求書を「未入金」に戻す */
export async function unmarkInvoicePaid(token: string, id: string): Promise<void> {
  await del(`/invoice/${id}/paid`, token);
}

/** 請求書をゴミ箱に移動 */
export async function trashInvoice(token: string, id: string): Promise<void> {
  await put<unknown>(`/invoice/${id}/trashed`, token, {});
}

/** 請求書をゴミ箱から復元 */
export async function untrashInvoice(token: string, id: string): Promise<void> {
  await del(`/invoice/${id}/trashed`, token);
}

/** 請求書を郵送依頼 */
export async function sendInvoiceByPostalMail(token: string, id: string): Promise<void> {
  await post<unknown>(`/invoice/${id}/send_by_postal_mail`, token, {});
}

// ============================================================
// 見積書 (Estimates) - Misoca API v3
// ============================================================

/** 見積書一覧取得 */
export async function getEstimates(
  token: string,
  opts?: { page?: number; per_page?: number }
): Promise<EstimatesResponse> {
  return get<EstimatesResponse>('/estimates', token, opts);
}

/** 見積書詳細取得 */
export async function getEstimate(token: string, id: string): Promise<MisocaEstimate> {
  return get<MisocaEstimate>(`/estimate/${id}`, token);
}

/** 見積書の作成 */
export async function createEstimate(token: string, params: MisocaInvoiceCreateParams): Promise<MisocaEstimate> {
  return post<MisocaEstimate>('/estimates', token, params);
}

// ============================================================
// 納品書 (Delivery Slips) - Misoca API v3
// ============================================================

/** 納品書一覧取得 */
export async function getDeliverySlips(
  token: string,
  opts?: { page?: number; per_page?: number }
): Promise<DeliverySlipsResponse> {
  return get<DeliverySlipsResponse>('/delivery_slips', token, opts);
}

/** 納品書詳細取得 */
export async function getDeliverySlip(token: string, id: string): Promise<MisocaDeliverySlip> {
  return get<MisocaDeliverySlip>(`/delivery_slip/${id}`, token);
}

/** 納品書の作成 */
export async function createDeliverySlip(token: string, params: MisocaInvoiceCreateParams): Promise<MisocaDeliverySlip> {
  return post<MisocaDeliverySlip>('/delivery_slip', token, params);
}

/** 納品書PDFダウンロード */
export async function getDeliverySlipPdf(token: string, id: string): Promise<Blob> {
  const url = `${config.baseUrl}/delivery_slip/${id}/pdf`;
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    throw new Error(`Misoca PDF download error: ${response.status}`);
  }
  return response.blob();
}

// ============================================================
// 取引先 (Contacts / Contact Groups) - Misoca API v3
// ============================================================

/** 取引先グループ一覧取得 */
export async function getContactGroups(token: string): Promise<ContactGroupsResponse> {
  return get<ContactGroupsResponse>('/contact_groups', token);
}

/** 送付先一覧取得 */
export async function getContacts(token: string): Promise<ContactsResponse> {
  return get<ContactsResponse>('/contacts', token);
}

/** 送付先詳細取得 */
export async function getContact(token: string, id: string): Promise<MisocaContact> {
  return get<MisocaContact>(`/contact/${id}`, token);
}

// ============================================================
// 品目マスタ (Dealing Items) - Misoca API v3
// ============================================================

/** 品目一覧取得 */
export async function getDealingItems(token: string): Promise<DealingItemsResponse> {
  return get<DealingItemsResponse>('/dealing_items', token);
}

/** 品目詳細取得 */
export async function getDealingItem(token: string, id: string): Promise<MisocaDealingItem> {
  return get<MisocaDealingItem>(`/dealing_item/${id}`, token);
}

// ============================================================
// ユーザー情報 - Misoca API v3
// ============================================================

/** ログインユーザー情報取得 */
export async function getMe(token: string): Promise<MisocaUserResponse> {
  return get<MisocaUserResponse>('/user/me', token);
}

// ============================================================
// 弥生会計 CSVインポートユーティリティ
// ============================================================

/**
 * 弥生会計仕訳CSVデータを生成
 *
 * 弥生会計本体にはREST APIがないため、CSV形式で仕訳データを出力し、
 * 弥生会計にインポートする方式で連携する。
 *
 * @param rows - 仕訳データ行
 * @returns CSV文字列（Shift_JIS変換は呼び出し側で行う）
 */
export function generateYayoiJournalCsv(rows: YayoiJournalCsvRow[]): string {
  const headers = [
    '仕訳区分', '伝票番号', '日付',
    '借方勘定科目', '借方補助科目', '借方部門', '借方税区分', '借方金額', '借方税額',
    '貸方勘定科目', '貸方補助科目', '貸方部門', '貸方税区分', '貸方金額', '貸方税額',
    '摘要', '取引先', 'メモ',
  ];

  const csvLines = [headers.join(',')];

  for (const row of rows) {
    const values = [
      escapeCsvField(row.journal_type),
      escapeCsvField(row.slip_number),
      escapeCsvField(row.date),
      escapeCsvField(row.debit_account),
      escapeCsvField(row.debit_sub_account),
      escapeCsvField(row.debit_department),
      escapeCsvField(row.debit_tax_type),
      String(row.debit_amount),
      String(row.debit_tax),
      escapeCsvField(row.credit_account),
      escapeCsvField(row.credit_sub_account),
      escapeCsvField(row.credit_department),
      escapeCsvField(row.credit_tax_type),
      String(row.credit_amount),
      String(row.credit_tax),
      escapeCsvField(row.description),
      escapeCsvField(row.partner),
      escapeCsvField(row.memo),
    ];
    csvLines.push(values.join(','));
  }

  return csvLines.join('\r\n') + '\r\n';
}

/**
 * CSVフィールドのエスケープ処理
 */
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
