/**
 * LINE WORKS API 2.0 クライアント
 *
 * 公式: https://developers.worksmobile.com/jp/docs/api
 * 認証ガイド: https://developers.worksmobile.com/jp/docs/auth
 * Base URL: https://www.worksapis.com/v1.0
 *
 * 認証方式: サービスアカウント認証（JWT）/ OAuth2
 */

import type {
  LineWorksTokenResponse,
  JwtParams,
  Bot,
  SendMessageParams,
  SendMessageResponse,
  CalendarsResponse,
  CalendarEventsResponse,
  CalendarEventCreateParams,
  CalendarEvent,
  MembersResponse,
  GroupsResponse,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.LINEWORKS_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.LINEWORKS_CLIENT_SECRET || 'demo_client_secret',
  serviceAccountId: process.env.LINEWORKS_SERVICE_ACCOUNT_ID || 'demo_service_account',
  privateKey: process.env.LINEWORKS_PRIVATE_KEY || 'demo_private_key',
  redirectUri: process.env.LINEWORKS_REDIRECT_URI || 'http://localhost:3000/api/auth/lineworks/callback',
  baseUrl: 'https://www.worksapis.com/v1.0',
  authUrl: 'https://auth.worksmobile.com/oauth2/v2.0/authorize',
  tokenUrl: 'https://auth.worksmobile.com/oauth2/v2.0/token',
};

// ============================================================
// ヘルパー
// ============================================================

function getHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function get<T>(path: string, token: string, params?: Record<string, string | number | undefined>): Promise<T> {
  let url = `${config.baseUrl}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.append(key, String(value));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LINE WORKS API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LINE WORKS API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

// ============================================================
// サービスアカウント認証（JWT）
// ============================================================

/**
 * JWTを生成してアクセストークンを取得
 *
 * Note: RS256署名にはNode.jsのcryptoモジュールまたは
 * jose/jsonwebtokenライブラリが必要。
 * 以下は概念的な実装で、実際にはJWTライブラリを使用すること。
 */
export async function getServiceAccountToken(
  scopes: string[] = ['bot', 'directory', 'calendar']
): Promise<LineWorksTokenResponse> {
  // JWT Header & Payload
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: config.clientId,
    sub: config.serviceAccountId,
    iat: now,
    exp: now + 3600,
  };

  // 実際の実装では jose/jsonwebtoken ライブラリでJWTを署名
  const jwtToken = `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.SIGNATURE_PLACEHOLDER`;

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      assertion: jwtToken,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: scopes.join(' '),
    }).toString(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LINE WORKS token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<LineWorksTokenResponse>;
}

/** OAuth2認証URL生成 */
export function getAuthorizationUrl(scope: string = 'bot directory calendar'): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope,
    response_type: 'code',
  });
  return `${config.authUrl}?${params.toString()}`;
}

/** 認証コードからアクセストークンを取得 */
export async function getAccessToken(code: string): Promise<LineWorksTokenResponse> {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }).toString(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LINE WORKS token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<LineWorksTokenResponse>;
}

// ============================================================
// ボット (Bot) - /bots
// ============================================================

/** ボット情報取得 */
export async function getBot(token: string, botId: string): Promise<Bot> {
  return get<Bot>(`/bots/${botId}`, token);
}

// ============================================================
// メッセージ送信 (Messages) - /bots/{botId}/users/{userId}/messages
// ============================================================

/** ユーザーにメッセージ送信 */
export async function sendMessageToUser(
  token: string,
  botId: string,
  userId: string,
  content: SendMessageParams['content']
): Promise<SendMessageResponse> {
  return post<SendMessageResponse>(`/bots/${botId}/users/${userId}/messages`, token, { content });
}

/** チャンネルにメッセージ送信 */
export async function sendMessageToChannel(
  token: string,
  botId: string,
  channelId: string,
  content: SendMessageParams['content']
): Promise<SendMessageResponse> {
  return post<SendMessageResponse>(`/bots/${botId}/channels/${channelId}/messages`, token, { content });
}

// ============================================================
// カレンダー (Calendar) - /calendar
// ============================================================

/** カレンダー一覧取得 */
export async function getCalendars(token: string, userId: string): Promise<CalendarsResponse> {
  return get<CalendarsResponse>(`/users/${userId}/calendar/calendarList`, token);
}

/** カレンダーイベント一覧取得 */
export async function getCalendarEvents(
  token: string,
  userId: string,
  calendarId: string,
  opts?: { fromDateTime?: string; toDateTime?: string }
): Promise<CalendarEventsResponse> {
  return get<CalendarEventsResponse>(`/users/${userId}/calendar/calendarList/${calendarId}/events`, token, opts);
}

/** カレンダーイベント作成 */
export async function createCalendarEvent(
  token: string,
  userId: string,
  params: CalendarEventCreateParams
): Promise<CalendarEvent> {
  return post<CalendarEvent>(
    `/users/${userId}/calendar/calendarList/${params.calendarId}/events`,
    token,
    params
  );
}

// ============================================================
// アドレス帳 (Directory) - /users
// ============================================================

/** メンバー一覧取得 */
export async function getMembers(
  token: string,
  opts?: { count?: number; cursor?: string }
): Promise<MembersResponse> {
  return get<MembersResponse>('/users', token, opts);
}

/** メンバー情報取得 */
export async function getMember(token: string, userId: string): Promise<{ user: import('./types').Member }> {
  return get<{ user: import('./types').Member }>(`/users/${userId}`, token);
}

// ============================================================
// グループ (Groups) - /groups
// ============================================================

/** グループ一覧取得 */
export async function getGroups(
  token: string,
  opts?: { count?: number; cursor?: string }
): Promise<GroupsResponse> {
  return get<GroupsResponse>('/groups', token, opts);
}
