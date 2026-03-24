/**
 * MFクラウド経費 API クライアント
 *
 * 公式: https://expense.moneyforward.com/api/index.html
 * GitHub: https://github.com/moneyforward/expense-api-doc
 * Base URL: https://expense.moneyforward.com/api/external/v1
 * OAuth2認証: Authorization Code Grant
 */

import type {
  MfExpenseTokenResponse,
  OfficesIndexResponse,
  ExReportsIndexResponse,
  ExReportResponse,
  ApprovingExReportsIndexResponse,
  ExJournalsIndexResponse,
  ReceiptUploadResponse,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.MF_EXPENSE_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.MF_EXPENSE_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.MF_EXPENSE_REDIRECT_URI || 'http://localhost:3000/api/auth/mf-expense/callback',
  baseUrl: 'https://expense.moneyforward.com/api/external/v1',
  authorizationUrl: 'https://expense.moneyforward.com/oauth/authorize',
  tokenUrl: 'https://expense.moneyforward.com/oauth/token',
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
    throw new Error(`MF Expense API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2認証URL生成 */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

/** 認証コードからアクセストークンを取得 */
export async function getAccessToken(code: string): Promise<MfExpenseTokenResponse> {
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
    throw new Error(`MF Expense token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MfExpenseTokenResponse>;
}

/** リフレッシュトークンでアクセストークンを更新 */
export async function refreshAccessToken(refreshToken: string): Promise<MfExpenseTokenResponse> {
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
    throw new Error(`MF Expense token refresh error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MfExpenseTokenResponse>;
}

/** トークン取消 */
export async function revokeToken(token: string): Promise<void> {
  const response = await fetch('https://expense.moneyforward.com/oauth/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MF Expense token revoke error: ${response.status} - ${errorBody}`);
  }
}

// ============================================================
// 事業所 (Offices) - GET /offices
// ============================================================

/** 事業所一覧取得 */
export async function getOffices(token: string): Promise<OfficesIndexResponse> {
  return get<OfficesIndexResponse>('/offices', token);
}

// ============================================================
// 経費申請 (Expense Reports) - /offices/{office_id}/ex_reports
// ============================================================

/** 経費申請一覧取得（全組織） */
export async function getExReports(
  token: string,
  officeId: string,
  opts?: { page?: number; per_page?: number; }
): Promise<ExReportsIndexResponse> {
  return get<ExReportsIndexResponse>(`/offices/${officeId}/ex_reports`, token, opts);
}

/** 経費申請詳細取得（全組織） */
export async function getExReport(
  token: string,
  officeId: string,
  reportId: string
): Promise<ExReportResponse> {
  return get<ExReportResponse>(`/offices/${officeId}/ex_reports/${reportId}`, token);
}

/** 自分の経費申請一覧取得 */
export async function getMyExReports(
  token: string,
  officeId: string,
  opts?: { page?: number; per_page?: number; }
): Promise<ExReportsIndexResponse> {
  return get<ExReportsIndexResponse>(`/offices/${officeId}/me/ex_reports`, token, opts);
}

/** 自分の経費申請詳細取得 */
export async function getMyExReport(
  token: string,
  officeId: string,
  reportId: string
): Promise<ExReportResponse> {
  return get<ExReportResponse>(`/offices/${officeId}/me/ex_reports/${reportId}`, token);
}

// ============================================================
// 承認待ち経費 (Approving Reports)
// ============================================================

/** 承認待ち経費一覧取得（全組織） */
export async function getApprovingExReports(
  token: string,
  officeId: string
): Promise<ApprovingExReportsIndexResponse> {
  return get<ApprovingExReportsIndexResponse>(`/offices/${officeId}/approving_ex_reports`, token);
}

/** 自分の承認待ち経費一覧取得 */
export async function getMyApprovingExReports(
  token: string,
  officeId: string
): Promise<ApprovingExReportsIndexResponse> {
  return get<ApprovingExReportsIndexResponse>(`/offices/${officeId}/me/approving_ex_reports`, token);
}

// ============================================================
// 仕訳連携 (Journals) - /offices/{office_id}/ex_journals_by_ex_reports
// ============================================================

/** 経費申請に紐づく仕訳データ一覧取得 */
export async function getExJournalsByExReports(
  token: string,
  officeId: string,
  opts?: { page?: number; per_page?: number; }
): Promise<ExJournalsIndexResponse> {
  return get<ExJournalsIndexResponse>(`/offices/${officeId}/ex_journals_by_ex_reports`, token, opts);
}

/** 特定の経費申請の仕訳データ取得 */
export async function getExJournalByExReport(
  token: string,
  officeId: string,
  exReportId: string
): Promise<ExJournalsIndexResponse> {
  return get<ExJournalsIndexResponse>(`/offices/${officeId}/ex_reports/${exReportId}/ex_journal`, token);
}

/** 支払明細に紐づく仕訳データ一覧取得 */
export async function getExJournalsByInvoiceTransactions(
  token: string,
  officeId: string,
  opts?: { page?: number; per_page?: number; }
): Promise<ExJournalsIndexResponse> {
  return get<ExJournalsIndexResponse>(`/offices/${officeId}/ex_journals_by_ex_invoice_transactions`, token, opts);
}

// ============================================================
// 領収書アップロード
// ============================================================

/** 領収書アップロード（FormDataで送信） */
export async function uploadReceipt(
  token: string,
  officeId: string,
  file: File | Blob,
  fileName: string
): Promise<ReceiptUploadResponse> {
  const formData = new FormData();
  formData.append('file', file, fileName);

  const url = `${config.baseUrl}/offices/${officeId}/receipts`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MF Expense API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<ReceiptUploadResponse>;
}
