/**
 * ChatWork API v2 クライアント
 *
 * 公式リファレンス: https://developer.chatwork.com/reference
 * Base URL: https://api.chatwork.com/v2
 * 認証: APIトークン or OAuth2
 */

import type {
  ChatworkTokenResponse,
  Me,
  MyStatus,
  Contact,
  Room,
  RoomCreateParams,
  Message,
  MessageCreateParams,
  Task,
  TaskCreateParams,
  ChatworkFile,
  RoomLink,
  IncomingRequest,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  apiToken: process.env.CHATWORK_API_TOKEN || 'demo_api_token',
  clientId: process.env.CHATWORK_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.CHATWORK_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.CHATWORK_REDIRECT_URI || 'http://localhost:3000/api/auth/chatwork/callback',
  baseUrl: 'https://api.chatwork.com/v2',
  oauthBaseUrl: 'https://www.chatwork.com/packages/oauth2',
  tokenUrl: 'https://oauth.chatwork.com/token',
};

// ============================================================
// ヘルパー
// ============================================================

function getHeaders(token?: string): Record<string, string> {
  return {
    'X-ChatWorkToken': token || config.apiToken,
    Accept: 'application/json',
  };
}

function getOAuthHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };
}

async function get<T>(path: string, token?: string): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'GET', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ChatWork API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(path: string, body: Record<string, string | number | undefined>, token?: string): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) formData.append(key, String(value));
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...getHeaders(token), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ChatWork API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function put<T>(path: string, body: Record<string, string | number | undefined>, token?: string): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) formData.append(key, String(value));
  }
  const response = await fetch(url, {
    method: 'PUT',
    headers: { ...getHeaders(token), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ChatWork API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

async function del(path: string, token?: string): Promise<void> {
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, { method: 'DELETE', headers: getHeaders(token) });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ChatWork API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
}

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2認証URL生成 */
export function getAuthorizationUrl(scope: string = 'rooms.all:read_write contacts.all:read_write'): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope,
  });
  return `${config.oauthBaseUrl}/authorize?${params.toString()}`;
}

/** 認証コードからアクセストークンを取得 */
export async function getAccessToken(code: string): Promise<ChatworkTokenResponse> {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
    }).toString(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ChatWork token error: ${response.status} - ${errorBody}`);
  }
  return response.json() as Promise<ChatworkTokenResponse>;
}

// ============================================================
// ユーザー (Me) - GET /me
// ============================================================

/** 自分自身の情報を取得 */
export async function getMe(token?: string): Promise<Me> {
  return get<Me>('/me', token);
}

/** 自分のステータスを取得 */
export async function getMyStatus(token?: string): Promise<MyStatus> {
  return get<MyStatus>('/my/status', token);
}

/** 自分のタスク一覧を取得 */
export async function getMyTasks(token?: string): Promise<Task[]> {
  return get<Task[]>('/my/tasks', token);
}

// ============================================================
// コンタクト (Contacts) - GET /contacts
// ============================================================

/** コンタクト一覧取得 */
export async function getContacts(token?: string): Promise<Contact[]> {
  return get<Contact[]>('/contacts', token);
}

// ============================================================
// ルーム (Rooms)
// ============================================================

/** ルーム一覧取得 */
export async function getRooms(token?: string): Promise<Room[]> {
  return get<Room[]>('/rooms', token);
}

/** ルーム作成 */
export async function createRoom(params: RoomCreateParams, token?: string): Promise<{ room_id: number }> {
  return post<{ room_id: number }>('/rooms', {
    name: params.name,
    description: params.description,
    icon_preset: params.icon_preset,
    link: params.link,
    link_code: params.link_code,
    link_need_acceptance: params.link_need_acceptance,
    members_admin_ids: params.members_admin_ids.join(','),
    members_member_ids: params.members_member_ids?.join(','),
    members_readonly_ids: params.members_readonly_ids?.join(','),
  } as Record<string, string | number | undefined>, token);
}

/** ルーム情報取得 */
export async function getRoom(roomId: number, token?: string): Promise<Room> {
  return get<Room>(`/rooms/${roomId}`, token);
}

/** ルーム退出/削除 */
export async function deleteRoom(roomId: number, actionType: 'leave' | 'delete', token?: string): Promise<void> {
  return del(`/rooms/${roomId}?action_type=${actionType}`, token);
}

// ============================================================
// メッセージ (Messages)
// ============================================================

/** メッセージ一覧取得 */
export async function getMessages(roomId: number, opts?: { force?: 0 | 1 }, token?: string): Promise<Message[]> {
  const forceParam = opts?.force ? `?force=${opts.force}` : '';
  return get<Message[]>(`/rooms/${roomId}/messages${forceParam}`, token);
}

/** メッセージ送信 */
export async function sendMessage(roomId: number, params: MessageCreateParams, token?: string): Promise<{ message_id: string }> {
  return post<{ message_id: string }>(`/rooms/${roomId}/messages`, params as unknown as Record<string, string | number | undefined>, token);
}

/** メッセージ取得 */
export async function getMessage(roomId: number, messageId: string, token?: string): Promise<Message> {
  return get<Message>(`/rooms/${roomId}/messages/${messageId}`, token);
}

/** メッセージ既読にする */
export async function readMessages(roomId: number, messageId?: string, token?: string): Promise<{ unread_num: number; mention_num: number }> {
  return put<{ unread_num: number; mention_num: number }>(
    `/rooms/${roomId}/messages/read`,
    messageId ? { message_id: messageId } : {},
    token
  );
}

// ============================================================
// タスク (Tasks)
// ============================================================

/** タスク一覧取得 */
export async function getTasks(roomId: number, token?: string): Promise<Task[]> {
  return get<Task[]>(`/rooms/${roomId}/tasks`, token);
}

/** タスク作成 */
export async function createTask(roomId: number, params: TaskCreateParams, token?: string): Promise<{ task_ids: number[] }> {
  return post<{ task_ids: number[] }>(`/rooms/${roomId}/tasks`, {
    body: params.body,
    to_ids: params.to_ids.join(','),
    limit: params.limit,
    limit_type: params.limit_type,
  } as Record<string, string | number | undefined>, token);
}

/** タスクステータス更新 */
export async function updateTaskStatus(roomId: number, taskId: number, status: 'open' | 'done', token?: string): Promise<{ task_id: number }> {
  return put<{ task_id: number }>(`/rooms/${roomId}/tasks/${taskId}/status`, { body: status }, token);
}

// ============================================================
// ファイル (Files)
// ============================================================

/** ファイル一覧取得 */
export async function getFiles(roomId: number, token?: string): Promise<ChatworkFile[]> {
  return get<ChatworkFile[]>(`/rooms/${roomId}/files`, token);
}

/** ファイル情報取得 */
export async function getFile(roomId: number, fileId: number, createDownloadUrl: boolean = false, token?: string): Promise<ChatworkFile> {
  const param = createDownloadUrl ? '?create_download_url=1' : '';
  return get<ChatworkFile>(`/rooms/${roomId}/files/${fileId}${param}`, token);
}

// ============================================================
// 招待リンク (Room Link)
// ============================================================

/** 招待リンク取得 */
export async function getRoomLink(roomId: number, token?: string): Promise<RoomLink> {
  return get<RoomLink>(`/rooms/${roomId}/link`, token);
}

// ============================================================
// 承認待ちリクエスト (Incoming Requests)
// ============================================================

/** 承認待ちリクエスト一覧取得 */
export async function getIncomingRequests(token?: string): Promise<IncomingRequest[]> {
  return get<IncomingRequest[]>('/incoming_requests', token);
}

/** コンタクト申請を承認 */
export async function acceptIncomingRequest(requestId: number, token?: string): Promise<Contact> {
  return put<Contact>(`/incoming_requests/${requestId}`, {}, token);
}

/** コンタクト申請を拒否 */
export async function rejectIncomingRequest(requestId: number, token?: string): Promise<void> {
  return del(`/incoming_requests/${requestId}`, token);
}
