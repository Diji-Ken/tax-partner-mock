/**
 * Slack API クライアント
 *
 * 公式: https://api.slack.com/
 * Web API: https://api.slack.com/methods
 * Base URL: https://slack.com/api
 * OAuth2認証: Authorization Code Grant (V2)
 */

import type {
  SlackOAuthResponse,
  ChatPostMessageResponse,
  ChatPostMessageParams,
  ConversationsListResponse,
  FilesUploadResponse,
  IncomingWebhookParams,
  EventPayload,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  clientId: process.env.SLACK_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.SLACK_CLIENT_SECRET || 'demo_client_secret',
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'demo_signing_secret',
  botToken: process.env.SLACK_BOT_TOKEN || 'xoxb-demo-token',
  redirectUri: process.env.SLACK_REDIRECT_URI || 'http://localhost:3000/api/auth/slack/callback',
  baseUrl: 'https://slack.com/api',
  authorizationUrl: 'https://slack.com/oauth/v2/authorize',
  tokenUrl: 'https://slack.com/api/oauth.v2.access',
};

// ============================================================
// ヘルパー
// ============================================================

function getHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json; charset=utf-8',
  };
}

async function apiCall<T>(method: string, token: string, params?: Record<string, unknown>): Promise<T> {
  const url = `${config.baseUrl}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(token),
    body: params ? JSON.stringify(params) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Slack API HTTP error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json() as T & { ok: boolean; error?: string };
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }
  return data;
}

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2認証URL生成（V2） */
export function getAuthorizationUrl(
  scopes: string[] = ['chat:write', 'channels:read', 'files:write', 'commands'],
  userScopes: string[] = []
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    scope: scopes.join(','),
    redirect_uri: config.redirectUri,
  });
  if (userScopes.length > 0) {
    params.append('user_scope', userScopes.join(','));
  }
  return `${config.authorizationUrl}?${params.toString()}`;
}

/** 認証コードからアクセストークンを取得 */
export async function getAccessToken(code: string): Promise<SlackOAuthResponse> {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }).toString(),
  });
  if (!response.ok) {
    throw new Error(`Slack OAuth error: ${response.status}`);
  }
  const data = await response.json() as SlackOAuthResponse;
  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${(data as unknown as { error: string }).error}`);
  }
  return data;
}

// ============================================================
// メッセージ送信 (chat.postMessage)
// ============================================================

/** メッセージ送信 */
export async function postMessage(
  params: ChatPostMessageParams,
  token: string = config.botToken
): Promise<ChatPostMessageResponse> {
  return apiCall<ChatPostMessageResponse>('chat.postMessage', token, params as unknown as Record<string, unknown>);
}

/** エフェメラルメッセージ送信（送信者のみに見える） */
export async function postEphemeral(
  channel: string,
  user: string,
  text: string,
  token: string = config.botToken
): Promise<{ ok: boolean }> {
  return apiCall<{ ok: boolean }>('chat.postEphemeral', token, { channel, user, text });
}

// ============================================================
// Incoming Webhook
// ============================================================

/** Incoming Webhookでメッセージ送信 */
export async function sendWebhook(webhookUrl: string, params: IncomingWebhookParams): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Slack Webhook error: ${response.status} - ${errorBody}`);
  }
}

// ============================================================
// チャンネル管理 (conversations)
// ============================================================

/** チャンネル一覧取得 */
export async function listConversations(
  opts?: { types?: string; limit?: number; cursor?: string },
  token: string = config.botToken
): Promise<ConversationsListResponse> {
  return apiCall<ConversationsListResponse>('conversations.list', token, {
    types: opts?.types || 'public_channel,private_channel',
    limit: opts?.limit || 100,
    cursor: opts?.cursor,
  });
}

/** チャンネル作成 */
export async function createConversation(
  name: string,
  opts?: { is_private?: boolean },
  token: string = config.botToken
): Promise<{ ok: boolean; channel: { id: string; name: string } }> {
  return apiCall('conversations.create', token, { name, is_private: opts?.is_private || false });
}

/** チャンネルに参加 */
export async function joinConversation(
  channel: string,
  token: string = config.botToken
): Promise<{ ok: boolean }> {
  return apiCall('conversations.join', token, { channel });
}

/** チャンネル履歴取得 */
export async function getConversationHistory(
  channel: string,
  opts?: { limit?: number; cursor?: string; oldest?: string; latest?: string },
  token: string = config.botToken
): Promise<{ ok: boolean; messages: Array<Record<string, unknown>>; has_more: boolean }> {
  return apiCall('conversations.history', token, { channel, ...opts });
}

// ============================================================
// ファイルアップロード (files.uploadV2)
// ============================================================

/** ファイルアップロード（V2） */
export async function uploadFile(
  channels: string,
  file: Blob,
  filename: string,
  opts?: { title?: string; initial_comment?: string; thread_ts?: string },
  token: string = config.botToken
): Promise<FilesUploadResponse> {
  const formData = new FormData();
  formData.append('channels', channels);
  formData.append('file', file, filename);
  formData.append('filename', filename);
  if (opts?.title) formData.append('title', opts.title);
  if (opts?.initial_comment) formData.append('initial_comment', opts.initial_comment);
  if (opts?.thread_ts) formData.append('thread_ts', opts.thread_ts);

  const url = `${config.baseUrl}/files.upload`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Slack file upload error: ${response.status}`);
  }
  return response.json() as Promise<FilesUploadResponse>;
}

// ============================================================
// Events API / Slash Commands ヘルパー
// ============================================================

/** Events APIのURL検証チャレンジに応答 */
export function handleUrlVerification(payload: EventPayload): { challenge: string } | null {
  if (payload.type === 'url_verification' && payload.challenge) {
    return { challenge: payload.challenge };
  }
  return null;
}

/** Slash Commandレスポンスを送信 */
export async function respondToSlashCommand(
  responseUrl: string,
  text: string,
  opts?: { response_type?: 'in_channel' | 'ephemeral' }
): Promise<void> {
  await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, response_type: opts?.response_type || 'ephemeral' }),
  });
}
