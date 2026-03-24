/**
 * 国税庁 適格請求書発行事業者公表システム Web-API クライアント
 *
 * 公式: https://www.invoice-kohyo.nta.go.jp/web-api/index.html
 * 仕様書DL: https://www.invoice-kohyo.nta.go.jp/web-api/web-api-download.html
 * Base URL: https://web-api.invoice-kohyo.nta.go.jp
 *
 * 認証: アプリケーションID（事前申請制・無料）
 * APIスタイル: REST（GETリクエストのみ）
 */

import type {
  InvoiceNumRequest,
  InvoiceDiffRequest,
  InvoiceValidRequest,
  InvoiceNumResponse,
  InvoiceDiffResponse,
  InvoiceValidResponse,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** アプリケーションID（国税庁に申請して取得） */
  applicationId: process.env.NTA_INVOICE_APP_ID || 'demo_application_id',
  /** Base URL（グローバルIPが変わる可能性があるためドメインで指定） */
  baseUrl: 'https://web-api.invoice-kohyo.nta.go.jp',
  /** APIバージョン */
  version: '1',
};

// ============================================================
// ヘルパー
// ============================================================

function buildUrl(endpoint: string, params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  }
  return `${config.baseUrl}/${config.version}/${endpoint}?${searchParams.toString()}`;
}

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`NTA Invoice API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

// ============================================================
// 登録番号検索 (GET /1/num)
// ============================================================

/**
 * 登録番号で適格請求書発行事業者を検索
 *
 * @param numbers - 登録番号（T+13桁）の配列。最大10件まで一括検索可能
 * @param opts - オプション（変更履歴の有無）
 * @returns 公表情報
 *
 * @example
 * ```ts
 * const result = await searchByNumber(['T1234567890123']);
 * console.log(result.announcement[0].name); // 事業者名
 * ```
 */
export async function searchByNumber(
  numbers: string[],
  opts?: { history?: boolean }
): Promise<InvoiceNumResponse> {
  const url = buildUrl('num', {
    id: config.applicationId,
    number: numbers.join(','),
    type: '21', // JSON形式
    history: opts?.history ? '1' : '0',
  });
  return fetchApi<InvoiceNumResponse>(url);
}

/**
 * 登録番号検索（rawパラメータ指定）
 * CSV/XML形式で取得したい場合に使用
 */
export async function searchByNumberRaw(params: Omit<InvoiceNumRequest, 'id'>): Promise<string> {
  const url = buildUrl('num', {
    id: config.applicationId,
    ...params,
  });
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`NTA Invoice API error: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

// ============================================================
// 期間指定差分検索 (GET /1/diff)
// ============================================================

/**
 * 指定期間に更新された事業者情報を取得
 *
 * @param from - 取得開始日 (yyyy-MM-dd)
 * @param to - 取得終了日 (yyyy-MM-dd)
 * @param opts - オプション（事業者種別、分割番号）
 * @returns 更新された公表情報一覧
 */
export async function searchByDateRange(
  from: string,
  to: string,
  opts?: { division?: '1' | '2' | '3'; divide?: number }
): Promise<InvoiceDiffResponse> {
  const url = buildUrl('diff', {
    id: config.applicationId,
    from,
    to,
    type: '21',
    division: opts?.division || '3',
    divide: opts?.divide?.toString(),
  });
  return fetchApi<InvoiceDiffResponse>(url);
}

// ============================================================
// 登録番号＋日付指定検索 (GET /1/valid)
// ============================================================

/**
 * 指定日時点での登録番号の有効性を確認
 *
 * @param numbers - 登録番号の配列（最大10件）
 * @param day - 判定日 (yyyy-MM-dd)
 * @returns 有効性を含む公表情報
 */
export async function validateRegistration(
  numbers: string[],
  day: string
): Promise<InvoiceValidResponse> {
  const url = buildUrl('valid', {
    id: config.applicationId,
    number: numbers.join(','),
    day,
    type: '21',
  });
  return fetchApi<InvoiceValidResponse>(url);
}

// ============================================================
// ユーティリティ
// ============================================================

/**
 * 登録番号のフォーマット検証
 * 形式: T + 13桁の数字
 */
export function isValidRegistrationNumber(number: string): boolean {
  return /^T\d{13}$/.test(number);
}

/**
 * 法人番号から登録番号を生成
 * 法人番号（13桁）の先頭に"T"を付与
 */
export function corporateNumberToRegistrationNumber(corporateNumber: string): string {
  if (!/^\d{13}$/.test(corporateNumber)) {
    throw new Error('法人番号は13桁の数字である必要があります');
  }
  return `T${corporateNumber}`;
}
