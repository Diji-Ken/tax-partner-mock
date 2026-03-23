/**
 * freee会計 API クライアント
 *
 * 公式ドキュメント: https://developer.freee.co.jp/reference/accounting/reference
 * Base URL: https://api.freee.co.jp/api/1
 * OAuth2認証: Authorization Code Grant
 */

import type {
  FreeeTokenResponse,
  CompaniesIndexResponse,
  CompaniesShowResponse,
  DealsIndexResponse,
  DealResponse,
  DealCreateResponse,
  DealCreateParams,
  AccountItemsIndexResponse,
  AccountItemResponse,
  AccountItemCreateParams,
  PartnersIndexResponse,
  PartnerResponse,
  TrialBsResponse,
  TrialPlResponse,
  JournalsDownloadResponse,
  JournalsStatusResponse,
  ManualJournalsIndexResponse,
  ManualJournalResponse,
  ReceiptsIndexResponse,
  ReceiptResponse,
  ReceiptCreateParams,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.FREEE_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.FREEE_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.FREEE_REDIRECT_URI || 'http://localhost:3000/api/auth/freee/callback',
  baseUrl: 'https://api.freee.co.jp/api/1',
  authorizationUrl: 'https://accounts.secure.freee.co.jp/public_api/authorize',
  tokenUrl: 'https://accounts.secure.freee.co.jp/public_api/token',
};

// ============================================================
// ヘルパー
// ============================================================

function getHeaders(token: string, contentType = 'application/json'): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': contentType,
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
    throw new Error(`freee API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`freee API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function put<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`freee API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function del(path: string, token: string, params?: Record<string, string | number | boolean | undefined>): Promise<void> {
  const qs = params ? buildQueryString(params) : '';
  const url = `${config.baseUrl}${path}${qs}`;
  const response = await fetch(url, { method: 'DELETE', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`freee API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
}

// ============================================================
// OAuth2 認証
// ============================================================

/**
 * OAuth2認証URL生成
 * ユーザーをこのURLにリダイレクトして認可コードを取得する
 */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * 認証コードからアクセストークンを取得
 * @param code - OAuth2認可コード（コールバックURLから取得）
 */
export async function getAccessToken(code: string): Promise<FreeeTokenResponse> {
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
    throw new Error(`freee token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<FreeeTokenResponse>;
}

/**
 * リフレッシュトークンでアクセストークンを更新
 * @param refreshToken - リフレッシュトークン
 */
export async function refreshAccessToken(refreshToken: string): Promise<FreeeTokenResponse> {
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
    throw new Error(`freee token refresh error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<FreeeTokenResponse>;
}

// ============================================================
// 事業所 (Companies) - GET /api/1/companies
// ============================================================

/** 事業所一覧取得 */
export async function getCompanies(token: string): Promise<CompaniesIndexResponse> {
  return get<CompaniesIndexResponse>('/companies', token);
}

/** 事業所詳細取得 */
export async function getCompany(
  token: string,
  id: number,
  opts?: {
    details?: boolean;
    account_items?: boolean;
    taxes?: boolean;
    items?: boolean;
    partners?: boolean;
    sections?: boolean;
    tags?: boolean;
    walletables?: boolean;
  }
): Promise<CompaniesShowResponse> {
  return get<CompaniesShowResponse>(`/companies/${id}`, token, opts as Record<string, boolean | undefined>);
}

// ============================================================
// 取引 (Deals) - /api/1/deals
// ============================================================

/** 取引（収入・支出）一覧取得 */
export async function getDeals(
  token: string,
  companyId: number,
  opts?: {
    partner_id?: number;
    account_item_id?: number;
    partner_code?: string;
    status?: 'unsettled' | 'settled';
    type?: 'income' | 'expense';
    start_issue_date?: string;
    end_issue_date?: string;
    start_due_date?: string;
    end_due_date?: string;
    offset?: number;
    limit?: number;
    accruals?: 'without' | 'with';
  }
): Promise<DealsIndexResponse> {
  return get<DealsIndexResponse>('/deals', token, { company_id: companyId, ...opts });
}

/** 取引詳細取得 */
export async function getDeal(token: string, companyId: number, id: number): Promise<DealResponse> {
  return get<DealResponse>(`/deals/${id}`, token, { company_id: companyId });
}

/** 取引（収入・支出）の作成 */
export async function createDeal(token: string, params: DealCreateParams): Promise<DealCreateResponse> {
  return post<DealCreateResponse>('/deals', token, params);
}

/** 取引（収入・支出）の更新 */
export async function updateDeal(token: string, id: number, params: Partial<DealCreateParams>): Promise<DealResponse> {
  return put<DealResponse>(`/deals/${id}`, token, params);
}

/** 取引（収入・支出）の削除 */
export async function deleteDeal(token: string, id: number, companyId: number): Promise<void> {
  return del(`/deals/${id}`, token, { company_id: companyId });
}

// ============================================================
// 勘定科目 (Account Items) - /api/1/account_items
// ============================================================

/** 勘定科目一覧取得 */
export async function getAccountItems(token: string, companyId: number): Promise<AccountItemsIndexResponse> {
  return get<AccountItemsIndexResponse>('/account_items', token, { company_id: companyId });
}

/** 勘定科目詳細取得 */
export async function getAccountItem(token: string, id: number, companyId: number): Promise<AccountItemResponse> {
  return get<AccountItemResponse>(`/account_items/${id}`, token, { company_id: companyId });
}

/** 勘定科目の作成 */
export async function createAccountItem(token: string, params: AccountItemCreateParams): Promise<AccountItemResponse> {
  return post<AccountItemResponse>('/account_items', token, { account_item: params });
}

// ============================================================
// 取引先 (Partners) - /api/1/partners
// ============================================================

/** 取引先一覧取得 */
export async function getPartners(
  token: string,
  companyId: number,
  opts?: { offset?: number; limit?: number; keyword?: string }
): Promise<PartnersIndexResponse> {
  return get<PartnersIndexResponse>('/partners', token, { company_id: companyId, ...opts });
}

/** 取引先詳細取得 */
export async function getPartner(token: string, id: number, companyId: number): Promise<PartnerResponse> {
  return get<PartnerResponse>(`/partners/${id}`, token, { company_id: companyId });
}

// ============================================================
// 試算表 (Trial Balance) - /api/1/reports/trial_bs, trial_pl
// ============================================================

/** 貸借対照表(BS)取得 */
export async function getTrialBs(
  token: string,
  companyId: number,
  opts?: {
    fiscal_year?: number;
    start_month?: number;
    end_month?: number;
    start_date?: string;
    end_date?: string;
    account_item_display_type?: 'account_item' | 'group';
    breakdown_display_type?: 'partner' | 'item' | 'section' | 'account_item';
  }
): Promise<TrialBsResponse> {
  return get<TrialBsResponse>('/reports/trial_bs', token, { company_id: companyId, ...opts });
}

/** 損益計算書(PL)取得 */
export async function getTrialPl(
  token: string,
  companyId: number,
  opts?: {
    fiscal_year?: number;
    start_month?: number;
    end_month?: number;
    start_date?: string;
    end_date?: string;
    account_item_display_type?: 'account_item' | 'group';
    breakdown_display_type?: 'partner' | 'item' | 'section' | 'account_item';
  }
): Promise<TrialPlResponse> {
  return get<TrialPlResponse>('/reports/trial_pl', token, { company_id: companyId, ...opts });
}

// ============================================================
// 仕訳帳 (Journals) - /api/1/journals
// ============================================================

/**
 * 仕訳帳ダウンロードリクエスト（非同期処理）
 * ステータスをポーリングしてダウンロードURLを取得する
 */
export async function requestJournalsDownload(
  token: string,
  companyId: number,
  opts?: { download_type?: 'csv' | 'pdf' | 'yayoi' | 'generic'; start_date?: string; end_date?: string }
): Promise<JournalsDownloadResponse> {
  return get<JournalsDownloadResponse>('/journals', token, { company_id: companyId, ...opts });
}

/** 仕訳帳ダウンロードステータス確認 */
export async function getJournalsStatus(token: string, id: number, companyId: number): Promise<JournalsStatusResponse> {
  return get<JournalsStatusResponse>(`/journals/reports/${id}/status`, token, { company_id: companyId });
}

// ============================================================
// 振替伝票 (Manual Journals) - /api/1/manual_journals
// ============================================================

/** 振替伝票一覧取得 */
export async function getManualJournals(
  token: string,
  companyId: number,
  opts?: { start_issue_date?: string; end_issue_date?: string; offset?: number; limit?: number }
): Promise<ManualJournalsIndexResponse> {
  return get<ManualJournalsIndexResponse>('/manual_journals', token, { company_id: companyId, ...opts });
}

/** 振替伝票詳細取得 */
export async function getManualJournal(token: string, id: number, companyId: number): Promise<ManualJournalResponse> {
  return get<ManualJournalResponse>(`/manual_journals/${id}`, token, { company_id: companyId });
}

// ============================================================
// ファイルボックス (Receipts) - /api/1/receipts
// ============================================================

/** ファイルボックス一覧取得 */
export async function getReceipts(
  token: string,
  companyId: number,
  opts?: { start_date?: string; end_date?: string; user_name?: string; offset?: number; limit?: number }
): Promise<ReceiptsIndexResponse> {
  return get<ReceiptsIndexResponse>('/receipts', token, { company_id: companyId, ...opts });
}

/** ファイルボックス詳細取得 */
export async function getReceipt(token: string, id: number, companyId: number): Promise<ReceiptResponse> {
  return get<ReceiptResponse>(`/receipts/${id}`, token, { company_id: companyId });
}

/** ファイルボックスにファイルをアップロード */
export async function createReceipt(token: string, params: ReceiptCreateParams): Promise<ReceiptResponse> {
  const formData = new FormData();
  formData.append('company_id', String(params.company_id));
  formData.append('receipt', params.receipt);
  if (params.description) formData.append('description', params.description);
  if (params.issue_date) formData.append('issue_date', params.issue_date);

  const response = await fetch(`${config.baseUrl}/receipts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`freee API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<ReceiptResponse>;
}
