/**
 * マネーフォワード クラウド会計 API クライアント
 *
 * 公式ドキュメント:
 * - 会計API: https://developer.moneyforward.com/
 * - 請求書API: https://invoice.moneyforward.com/docs/api/v3/index.html
 * - 経費API: https://expense.moneyforward.com/api/index.html
 *
 * 認証: OAuth 2.0 (Authorization Code Grant)
 */

import type {
  MFTokenResponse,
  MFOfficesResponse,
  MFJournalEntriesResponse,
  MFJournalEntryResponse,
  MFJournalEntryCreateParams,
  MFAccountItemsResponse,
  MFPartnersResponse,
  MFDepartmentsResponse,
  MFTrialBsResponse,
  MFTrialPlResponse,
  MFBillingsResponse,
  MFBillingResponse,
  MFBillingCreateParams,
  MFExpenseApplicationsResponse,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.MF_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.MF_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.MF_REDIRECT_URI || 'http://localhost:3000/api/auth/moneyforward/callback',
  /** 会計API Base URL */
  accountingBaseUrl: 'https://api.moneyforward.com/api/v3',
  /** 請求書API Base URL */
  invoiceBaseUrl: 'https://invoice.moneyforward.com/api/v3',
  /** 経費API Base URL */
  expenseBaseUrl: 'https://expense.moneyforward.com/api/external/v1',
  /** OAuth2認証エンドポイント */
  authorizationUrl: 'https://expense.moneyforward.com/oauth/authorize',
  /** OAuth2トークンエンドポイント */
  tokenUrl: 'https://expense.moneyforward.com/oauth/token',
  /** トークン取り消しエンドポイント */
  revokeUrl: 'https://expense.moneyforward.com/oauth/revoke',
  /** トークン情報エンドポイント */
  tokenInfoUrl: 'https://expense.moneyforward.com/oauth/token/info',
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

async function apiGet<T>(baseUrl: string, path: string, token: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const qs = params ? buildQueryString(params) : '';
  const url = `${baseUrl}${path}${qs}`;
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MoneyForward API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function apiPost<T>(baseUrl: string, path: string, token: string, body: unknown): Promise<T> {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MoneyForward API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function apiPut<T>(baseUrl: string, path: string, token: string, body: unknown): Promise<T> {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MoneyForward API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function apiDelete(baseUrl: string, path: string, token: string): Promise<void> {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { method: 'DELETE', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MoneyForward API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
}

// ============================================================
// OAuth2 認証
// ============================================================

/**
 * OAuth2認証URL生成
 * @param scope - スコープ（例: "read write"）
 */
export function getAuthorizationUrl(scope = 'read write'): string {
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
 * @param code - OAuth2認可コード
 */
export async function getAccessToken(code: string): Promise<MFTokenResponse> {
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
    throw new Error(`MoneyForward token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MFTokenResponse>;
}

/**
 * リフレッシュトークンでアクセストークンを更新
 * @param refreshToken - リフレッシュトークン
 */
export async function refreshAccessToken(refreshToken: string): Promise<MFTokenResponse> {
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
    throw new Error(`MoneyForward token refresh error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MFTokenResponse>;
}

/**
 * アクセストークンを取り消し
 * @param token - 取り消すトークン
 */
export async function revokeToken(token: string): Promise<void> {
  await fetch(config.revokeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

// ============================================================
// 事業所 (Offices) - 会計API
// ============================================================

/** 事業所一覧取得 */
export async function getOffices(token: string): Promise<MFOfficesResponse> {
  return apiGet<MFOfficesResponse>(config.accountingBaseUrl, '/offices', token);
}

// ============================================================
// 仕訳 (Journal Entries) - 会計API
// ============================================================

/** 仕訳一覧取得 */
export async function getJournalEntries(
  token: string,
  officeId: string,
  opts?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }
): Promise<MFJournalEntriesResponse> {
  return apiGet<MFJournalEntriesResponse>(config.accountingBaseUrl, `/office/${officeId}/journal_entries`, token, opts);
}

/** 仕訳詳細取得 */
export async function getJournalEntry(token: string, officeId: string, id: string): Promise<MFJournalEntryResponse> {
  return apiGet<MFJournalEntryResponse>(config.accountingBaseUrl, `/office/${officeId}/journal_entries/${id}`, token);
}

/** 仕訳の作成 */
export async function createJournalEntry(token: string, params: MFJournalEntryCreateParams): Promise<MFJournalEntryResponse> {
  return apiPost<MFJournalEntryResponse>(
    config.accountingBaseUrl,
    `/office/${params.office_id}/journal_entries`,
    token,
    { journal_entry: params }
  );
}

// ============================================================
// 勘定科目 (Account Items) - 会計API
// ============================================================

/** 勘定科目一覧取得 */
export async function getAccountItems(token: string, officeId: string): Promise<MFAccountItemsResponse> {
  return apiGet<MFAccountItemsResponse>(config.accountingBaseUrl, `/office/${officeId}/account_items`, token);
}

// ============================================================
// 取引先 (Partners) - 会計API
// ============================================================

/** 取引先一覧取得 */
export async function getPartners(
  token: string,
  officeId: string,
  opts?: { page?: number; per_page?: number; keyword?: string }
): Promise<MFPartnersResponse> {
  return apiGet<MFPartnersResponse>(config.accountingBaseUrl, `/office/${officeId}/partners`, token, opts);
}

// ============================================================
// 部門 (Departments) - 会計API
// ============================================================

/** 部門一覧取得 */
export async function getDepartments(token: string, officeId: string): Promise<MFDepartmentsResponse> {
  return apiGet<MFDepartmentsResponse>(config.accountingBaseUrl, `/office/${officeId}/departments`, token);
}

// ============================================================
// 試算表 (Trial Balance) - 会計API
// ============================================================

/** 貸借対照表(BS)取得 */
export async function getTrialBs(
  token: string,
  officeId: string,
  opts?: { start_date?: string; end_date?: string }
): Promise<MFTrialBsResponse> {
  return apiGet<MFTrialBsResponse>(config.accountingBaseUrl, `/office/${officeId}/trial_bs`, token, opts);
}

/** 損益計算書(PL)取得 */
export async function getTrialPl(
  token: string,
  officeId: string,
  opts?: { start_date?: string; end_date?: string }
): Promise<MFTrialPlResponse> {
  return apiGet<MFTrialPlResponse>(config.accountingBaseUrl, `/office/${officeId}/trial_pl`, token, opts);
}

// ============================================================
// 請求書 (Billings) - 請求書API v3
// ============================================================

/** 請求書一覧取得 */
export async function getBillings(
  token: string,
  opts?: {
    page?: number;
    per_page?: number;
    status?: 'draft' | 'submitted' | 'paid' | 'cancelled';
    partner_id?: string;
    billing_date_from?: string;
    billing_date_to?: string;
  }
): Promise<MFBillingsResponse> {
  return apiGet<MFBillingsResponse>(config.invoiceBaseUrl, '/billings', token, opts);
}

/** 請求書詳細取得 */
export async function getBilling(token: string, id: string): Promise<MFBillingResponse> {
  return apiGet<MFBillingResponse>(config.invoiceBaseUrl, `/billings/${id}`, token);
}

/** 請求書の作成 */
export async function createBilling(token: string, params: MFBillingCreateParams): Promise<MFBillingResponse> {
  return apiPost<MFBillingResponse>(config.invoiceBaseUrl, '/billings', token, { billing: params });
}

/** 請求書の更新 */
export async function updateBilling(token: string, id: string, params: Partial<MFBillingCreateParams>): Promise<MFBillingResponse> {
  return apiPut<MFBillingResponse>(config.invoiceBaseUrl, `/billings/${id}`, token, { billing: params });
}

/** 請求書の削除 */
export async function deleteBilling(token: string, id: string): Promise<void> {
  return apiDelete(config.invoiceBaseUrl, `/billings/${id}`, token);
}

/** 請求書の送付 */
export async function sendBilling(token: string, id: string): Promise<void> {
  await apiPost<unknown>(config.invoiceBaseUrl, `/billings/${id}/send`, token, {});
}

// ============================================================
// 経費精算 (Expense Applications) - 経費API
// ============================================================

/** 経費申請一覧取得 */
export async function getExpenseApplications(
  token: string,
  opts?: {
    page?: number;
    per_page?: number;
    status?: string;
  }
): Promise<MFExpenseApplicationsResponse> {
  return apiGet<MFExpenseApplicationsResponse>(config.expenseBaseUrl, '/expense_applications', token, opts);
}
