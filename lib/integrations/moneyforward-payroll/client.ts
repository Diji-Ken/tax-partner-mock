/**
 * MFクラウド給与 API クライアント
 *
 * 公式: https://developer.moneyforward.com/
 * 連携ページ: https://biz.moneyforward.com/integration/product/payroll-api/
 *
 * Note: MFクラウド給与のREST APIはパートナー企業向けに提供されており、
 * 一般公開されたAPIリファレンスは限定的。本クライアントは公開情報に基づく推定実装。
 * 勤怠データ連携はCSVインポートまたはAPI経由で対応。
 */

import type {
  MfPayrollTokenResponse,
  OfficesIndexResponse,
  EmployeesIndexResponse,
  EmployeeResponse,
  PayrollsIndexResponse,
  YearEndAdjustmentsIndexResponse,
  WithholdingTaxCertificatesIndexResponse,
  SocialInsurancesIndexResponse,
  AttendanceImportParams,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.MF_PAYROLL_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.MF_PAYROLL_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.MF_PAYROLL_REDIRECT_URI || 'http://localhost:3000/api/auth/mf-payroll/callback',
  baseUrl: 'https://payroll.moneyforward.com/api/v1',
  authorizationUrl: 'https://payroll.moneyforward.com/oauth/authorize',
  tokenUrl: 'https://payroll.moneyforward.com/oauth/token',
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
    throw new Error(`MF Payroll API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MF Payroll API error: ${response.status} ${response.statusText} - ${errorBody}`);
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
    scope: 'payroll',
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

/** 認証コードからアクセストークンを取得 */
export async function getAccessToken(code: string): Promise<MfPayrollTokenResponse> {
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
    throw new Error(`MF Payroll token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MfPayrollTokenResponse>;
}

/** リフレッシュトークンでアクセストークンを更新 */
export async function refreshAccessToken(refreshToken: string): Promise<MfPayrollTokenResponse> {
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
    throw new Error(`MF Payroll token refresh error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<MfPayrollTokenResponse>;
}

// ============================================================
// 事業所 (Offices)
// ============================================================

/** 事業所一覧取得 */
export async function getOffices(token: string): Promise<OfficesIndexResponse> {
  return get<OfficesIndexResponse>('/offices', token);
}

// ============================================================
// 従業員 (Employees)
// ============================================================

/** 従業員一覧取得 */
export async function getEmployees(
  token: string,
  officeId: string,
  opts?: { limit?: number; offset?: number; employment_status?: string; }
): Promise<EmployeesIndexResponse> {
  return get<EmployeesIndexResponse>(`/offices/${officeId}/employees`, token, opts);
}

/** 従業員詳細取得 */
export async function getEmployee(
  token: string,
  officeId: string,
  employeeId: string
): Promise<EmployeeResponse> {
  return get<EmployeeResponse>(`/offices/${officeId}/employees/${employeeId}`, token);
}

// ============================================================
// 給与計算 (Payroll)
// ============================================================

/** 給与明細一覧取得 */
export async function getPayrolls(
  token: string,
  officeId: string,
  year: number,
  month: number,
  opts?: { employee_id?: string; }
): Promise<PayrollsIndexResponse> {
  return get<PayrollsIndexResponse>(`/offices/${officeId}/payrolls`, token, { year, month, ...opts });
}

// ============================================================
// 年末調整 (Year-End Adjustment)
// ============================================================

/** 年末調整データ一覧取得 */
export async function getYearEndAdjustments(
  token: string,
  officeId: string,
  year: number
): Promise<YearEndAdjustmentsIndexResponse> {
  return get<YearEndAdjustmentsIndexResponse>(`/offices/${officeId}/year_end_adjustments`, token, { year });
}

// ============================================================
// 源泉徴収票 (Withholding Tax Certificate)
// ============================================================

/** 源泉徴収票一覧取得 */
export async function getWithholdingTaxCertificates(
  token: string,
  officeId: string,
  year: number
): Promise<WithholdingTaxCertificatesIndexResponse> {
  return get<WithholdingTaxCertificatesIndexResponse>(
    `/offices/${officeId}/withholding_tax_certificates`, token, { year }
  );
}

// ============================================================
// 社会保険料 (Social Insurance)
// ============================================================

/** 社会保険料一覧取得 */
export async function getSocialInsurances(
  token: string,
  officeId: string,
  year: number,
  month: number
): Promise<SocialInsurancesIndexResponse> {
  return get<SocialInsurancesIndexResponse>(`/offices/${officeId}/social_insurances`, token, { year, month });
}

// ============================================================
// 勤怠データ連携 (Attendance Data Import)
// ============================================================

/** 勤怠データインポート */
export async function importAttendance(
  token: string,
  params: AttendanceImportParams
): Promise<{ status: string }> {
  return post<{ status: string }>(
    `/offices/${params.office_id}/attendance_imports`,
    token,
    params
  );
}
