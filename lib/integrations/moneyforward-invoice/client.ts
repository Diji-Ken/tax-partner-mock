/**
 * MFクラウド請求書 API v3 クライアント
 *
 * 公式ドキュメント: https://invoice.moneyforward.com/docs/api/v3/index.html
 * スタートアップガイド: https://biz.moneyforward.com/support/invoice/guide/api-guide/a04.html
 * Base URL: https://invoice.moneyforward.com/api/v3
 * OAuth2認証: Authorization Code Grant
 */

import type {
  MfInvoiceTokenResponse,
  OfficeResponse,
  BillingsIndexResponse,
  BillingResponse,
  BillingCreateParams,
  BillingItemCreateParams,
  QuotesIndexResponse,
  PartnersIndexResponse,
  PartnerResponse,
  PartnerCreateParams,
  ItemsIndexResponse,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.MF_INVOICE_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.MF_INVOICE_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.MF_INVOICE_REDIRECT_URI || 'http://localhost:3000/api/auth/mf-invoice/callback',
  baseUrl: 'https://invoice.moneyforward.com/api/v3',
  authorizationUrl: 'https://invoice.moneyforward.com/oauth/authorize',
  tokenUrl: 'https://invoice.moneyforward.com/oauth/token',
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
    throw new Error(`MF Invoice API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MF Invoice API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function put<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MF Invoice API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2認証URL生成 */
export function getAuthorizationUrl(scope: 'mfc/invoice/data.read' | 'mfc/invoice/data.write' = 'mfc/invoice/data.write'): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope,
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

/** 認証コードからアクセストークンを取得 */
export async function getAccessToken(code: string): Promise<MfInvoiceTokenResponse> {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MF Invoice token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MfInvoiceTokenResponse>;
}

/** リフレッシュトークンでアクセストークンを更新 */
export async function refreshAccessToken(refreshToken: string): Promise<MfInvoiceTokenResponse> {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MF Invoice token refresh error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MfInvoiceTokenResponse>;
}

// ============================================================
// 事業所 (Office) - /office
// ============================================================

/** 事業所情報取得 */
export async function getOffice(token: string): Promise<OfficeResponse> {
  return get<OfficeResponse>('/office', token);
}

/** 適格請求書発行事業者登録番号の設定 */
export async function setRegistrationCode(token: string, registrationCode: string): Promise<OfficeResponse> {
  return put<OfficeResponse>('/office/registration_code', token, { registration_code: registrationCode });
}

// ============================================================
// 請求書 (Billings) - /billings, /invoice_template_billings
// ============================================================

/** 請求書一覧取得 */
export async function getBillings(
  token: string,
  opts?: { page?: number; per_page?: number; status?: string; from_date?: string; to_date?: string; }
): Promise<BillingsIndexResponse> {
  return get<BillingsIndexResponse>('/billings', token, opts);
}

/** 請求書詳細取得 */
export async function getBilling(token: string, id: string): Promise<BillingResponse> {
  return get<BillingResponse>(`/billings/${id}`, token);
}

/** 請求書作成（インボイス制度対応テンプレート） */
export async function createBilling(token: string, params: BillingCreateParams): Promise<BillingResponse> {
  return post<BillingResponse>('/invoice_template_billings', token, params);
}

/** 請求書に明細行を追加 */
export async function addBillingItem(token: string, billingId: string, item: BillingItemCreateParams): Promise<BillingResponse> {
  return post<BillingResponse>(`/billings/${billingId}/items`, token, item);
}

/** 請求書の送付 */
export async function sendBilling(token: string, billingId: string): Promise<BillingResponse> {
  return post<BillingResponse>(`/billings/${billingId}/sending`, token, {});
}

// ============================================================
// 見積書 (Quotes) - /quotes
// ============================================================

/** 見積書一覧取得 */
export async function getQuotes(
  token: string,
  opts?: { page?: number; per_page?: number; }
): Promise<QuotesIndexResponse> {
  return get<QuotesIndexResponse>('/quotes', token, opts);
}

// ============================================================
// 取引先 (Partners) - /partners
// ============================================================

/** 取引先一覧取得 */
export async function getPartners(
  token: string,
  opts?: { page?: number; per_page?: number; }
): Promise<PartnersIndexResponse> {
  return get<PartnersIndexResponse>('/partners', token, opts);
}

/** 取引先作成 */
export async function createPartner(token: string, params: PartnerCreateParams): Promise<PartnerResponse> {
  return post<PartnerResponse>('/partners', token, params);
}

/** 取引先に部門を追加 */
export async function createPartnerDepartment(
  token: string,
  partnerId: string,
  name: string
): Promise<PartnerResponse> {
  return post<PartnerResponse>(`/partners/${partnerId}/departments`, token, { name });
}

// ============================================================
// 品目 (Items) - /items
// ============================================================

/** 品目一覧取得 */
export async function getItems(
  token: string,
  opts?: { page?: number; per_page?: number; }
): Promise<ItemsIndexResponse> {
  return get<ItemsIndexResponse>('/items', token, opts);
}
