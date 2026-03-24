/**
 * freee人事労務 API クライアント
 *
 * 公式ドキュメント: https://developer.freee.co.jp/reference/hr/reference
 * Base URL: https://api.freee.co.jp/hr/api/v1
 * OAuth2認証: Authorization Code Grant（freee会計と共通のOAuth2認証基盤）
 */

import type {
  FreeeHrTokenResponse,
  UsersMeResponse,
  EmployeesIndexResponse,
  EmployeeResponse,
  PayrollStatementsIndexResponse,
  PayrollStatementResponse,
  BonusStatementsIndexResponse,
  BonusStatementResponse,
  WorkRecordResponse,
  WorkRecordSummaryResponse,
  WorkRecordUpdateParams,
  TimeClocksIndexResponse,
  TimeClockResponse,
  TimeClockCreateParams,
  YearEndAdjustmentsIndexResponse,
  GroupsIndexResponse,
  EmployeeGroupMembershipsIndexResponse,
  PositionsIndexResponse,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.FREEE_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.FREEE_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.FREEE_REDIRECT_URI || 'http://localhost:3000/api/auth/freee/callback',
  baseUrl: 'https://api.freee.co.jp/hr/api/v1',
  authorizationUrl: 'https://accounts.secure.freee.co.jp/public_api/authorize',
  tokenUrl: 'https://accounts.secure.freee.co.jp/public_api/token',
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
    throw new Error(`freee HR API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`freee HR API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function put<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`freee HR API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function del(path: string, token: string): Promise<void> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'DELETE', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`freee HR API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
}

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2認証URL生成（freee会計と共通の認証基盤） */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

/** 認証コードからアクセストークンを取得 */
export async function getAccessToken(code: string): Promise<FreeeHrTokenResponse> {
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
    throw new Error(`freee HR token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<FreeeHrTokenResponse>;
}

/** リフレッシュトークンでアクセストークンを更新 */
export async function refreshAccessToken(refreshToken: string): Promise<FreeeHrTokenResponse> {
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
    throw new Error(`freee HR token refresh error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<FreeeHrTokenResponse>;
}

// ============================================================
// ユーザー (Users) - GET /users/me
// ============================================================

/** ログインユーザー情報取得 */
export async function getMe(token: string): Promise<UsersMeResponse> {
  return get<UsersMeResponse>('/users/me', token);
}

// ============================================================
// 従業員 (Employees) - /companies/{company_id}/employees, /employees
// ============================================================

/** 従業員一覧取得（事業所指定） */
export async function getEmployeesByCompany(
  token: string,
  companyId: number,
  opts?: { limit?: number; offset?: number; }
): Promise<EmployeesIndexResponse> {
  return get<EmployeesIndexResponse>(`/companies/${companyId}/employees`, token, opts);
}

/** 従業員一覧取得（年月指定） */
export async function getEmployees(
  token: string,
  companyId: number,
  year: number,
  month: number,
  opts?: { limit?: number; offset?: number; }
): Promise<EmployeesIndexResponse> {
  return get<EmployeesIndexResponse>('/employees', token, { company_id: companyId, year, month, ...opts });
}

/** 従業員詳細取得 */
export async function getEmployee(
  token: string,
  companyId: number,
  employeeId: number,
  year: number,
  month: number
): Promise<EmployeeResponse> {
  return get<EmployeeResponse>(`/employees/${employeeId}`, token, { company_id: companyId, year, month });
}

// ============================================================
// 給与明細 (Payroll Statements) - /salaries/employee_payroll_statements
// ============================================================

/** 給与明細一覧取得 */
export async function getPayrollStatements(
  token: string,
  companyId: number,
  year: number,
  month: number,
  opts?: { employee_id?: number; }
): Promise<PayrollStatementsIndexResponse> {
  return get<PayrollStatementsIndexResponse>('/salaries/employee_payroll_statements', token, {
    company_id: companyId, year, month, ...opts,
  });
}

/** 従業員の給与明細取得 */
export async function getPayrollStatement(
  token: string,
  companyId: number,
  employeeId: number,
  year: number,
  month: number
): Promise<PayrollStatementResponse> {
  return get<PayrollStatementResponse>(`/salaries/employee_payroll_statements/${employeeId}`, token, {
    company_id: companyId, year, month,
  });
}

// ============================================================
// 賞与明細 (Bonus Statements) - /bonuses/employee_payroll_statements
// ============================================================

/** 賞与明細一覧取得 */
export async function getBonusStatements(
  token: string,
  companyId: number,
  year: number,
  month: number,
  opts?: { employee_id?: number; }
): Promise<BonusStatementsIndexResponse> {
  return get<BonusStatementsIndexResponse>('/bonuses/employee_payroll_statements', token, {
    company_id: companyId, year, month, ...opts,
  });
}

/** 従業員の賞与明細取得 */
export async function getBonusStatement(
  token: string,
  companyId: number,
  employeeId: number,
  year: number,
  month: number
): Promise<BonusStatementResponse> {
  return get<BonusStatementResponse>(`/bonuses/employee_payroll_statements/${employeeId}`, token, {
    company_id: companyId, year, month,
  });
}

// ============================================================
// 勤怠データ (Work Records) - /employees/{employee_id}/work_records
// ============================================================

/** 日次勤怠データ取得 */
export async function getWorkRecord(
  token: string,
  companyId: number,
  employeeId: number,
  date: string
): Promise<WorkRecordResponse> {
  return get<WorkRecordResponse>(`/employees/${employeeId}/work_records/${date}`, token, { company_id: companyId });
}

/** 日次勤怠データ更新 */
export async function updateWorkRecord(
  token: string,
  employeeId: number,
  date: string,
  params: WorkRecordUpdateParams
): Promise<WorkRecordResponse> {
  return put<WorkRecordResponse>(`/employees/${employeeId}/work_records/${date}`, token, params);
}

/** 日次勤怠データ削除 */
export async function deleteWorkRecord(
  token: string,
  employeeId: number,
  date: string,
  companyId: number
): Promise<void> {
  return del(`/employees/${employeeId}/work_records/${date}?company_id=${companyId}`, token);
}

/** 月次勤怠サマリー取得 */
export async function getWorkRecordSummary(
  token: string,
  companyId: number,
  employeeId: number,
  year: number,
  month: number,
  opts?: { work_records?: boolean; }
): Promise<WorkRecordSummaryResponse> {
  return get<WorkRecordSummaryResponse>(
    `/employees/${employeeId}/work_record_summaries/${year}/${month}`,
    token,
    { company_id: companyId, ...opts }
  );
}

// ============================================================
// 打刻 (Time Clocks) - /employees/{employee_id}/time_clocks
// ============================================================

/** 打刻一覧取得 */
export async function getTimeClocks(
  token: string,
  companyId: number,
  employeeId: number,
  opts?: { from_date?: string; to_date?: string; }
): Promise<TimeClocksIndexResponse> {
  return get<TimeClocksIndexResponse>(`/employees/${employeeId}/time_clocks`, token, {
    company_id: companyId, ...opts,
  });
}

/** 打刻詳細取得 */
export async function getTimeClock(
  token: string,
  companyId: number,
  employeeId: number,
  id: number
): Promise<TimeClockResponse> {
  return get<TimeClockResponse>(`/employees/${employeeId}/time_clocks/${id}`, token, { company_id: companyId });
}

/** 打刻登録 */
export async function createTimeClock(
  token: string,
  employeeId: number,
  params: TimeClockCreateParams
): Promise<TimeClockResponse> {
  return post<TimeClockResponse>(`/employees/${employeeId}/time_clocks`, token, params);
}

// ============================================================
// 年末調整 (Year-End Adjustments) - /year_end_adjustments
// ============================================================

/** 年末調整データ一覧取得 */
export async function getYearEndAdjustments(
  token: string,
  companyId: number,
  year: number,
  opts?: { employee_id?: number; }
): Promise<YearEndAdjustmentsIndexResponse> {
  return get<YearEndAdjustmentsIndexResponse>('/year_end_adjustments', token, {
    company_id: companyId, year, ...opts,
  });
}

// ============================================================
// 部署 (Groups / Departments) - /groups, /employee_group_memberships
// ============================================================

/** 部署一覧取得 */
export async function getGroups(
  token: string,
  companyId: number
): Promise<GroupsIndexResponse> {
  return get<GroupsIndexResponse>('/groups', token, { company_id: companyId });
}

/** 従業員の部署所属情報一覧取得 */
export async function getEmployeeGroupMemberships(
  token: string,
  companyId: number,
  opts?: { employee_id?: number; }
): Promise<EmployeeGroupMembershipsIndexResponse> {
  return get<EmployeeGroupMembershipsIndexResponse>('/employee_group_memberships', token, {
    company_id: companyId, ...opts,
  });
}

// ============================================================
// 役職 (Positions) - /positions
// ============================================================

/** 役職一覧取得 */
export async function getPositions(
  token: string,
  companyId: number
): Promise<PositionsIndexResponse> {
  return get<PositionsIndexResponse>('/positions', token, { company_id: companyId });
}
