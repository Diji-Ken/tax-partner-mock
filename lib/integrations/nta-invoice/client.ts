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
  BulkValidationRequest,
  BulkValidationResult,
  ValidationResult,
  CachedValidation,
  CacheStats,
  DiffUpdateResult,
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

// ============================================================
// バルク検証（税理士CRM向け拡張）
// ============================================================

/**
 * 複数の登録番号を一括検証
 *
 * APIの制約（1リクエスト最大10件）に対応し、自動的にバッチ分割して検証。
 * キャッシュを活用し、既に検証済みの番号はAPIリクエストをスキップ。
 * 並列リクエスト数を制限してAPI負荷を軽減。
 *
 * @param request - バルク検証リクエスト
 * @returns 全件の検証結果
 *
 * @example
 * ```ts
 * // 顧問先の取引先50件を一括検証
 * const result = await bulkValidate({
 *   numbers: ['T1234567890123', 'T2345678901234', ...],
 *   day: '2026-03-24',
 *   concurrency: 3,
 * });
 * console.log(`有効: ${result.validCount}, 無効: ${result.invalidCount}`);
 * ```
 */
export async function bulkValidate(
  request: BulkValidationRequest
): Promise<BulkValidationResult> {
  const startTime = Date.now();
  const day = request.day || new Date().toISOString().split('T')[0];
  const concurrency = request.concurrency || 3;

  // フォーマット検証
  const validNumbers: string[] = [];
  const invalidFormatResults: ValidationResult[] = [];

  for (const num of request.numbers) {
    if (isValidRegistrationNumber(num)) {
      validNumbers.push(num);
    } else {
      invalidFormatResults.push({
        registrationNumber: num,
        isValid: false,
        name: null,
        registrationDate: null,
        disposalDate: null,
        expireDate: null,
        validatedAt: day,
        error: 'Invalid format: must be T + 13 digits',
      });
    }
  }

  // キャッシュからヒットするものを抽出
  const uncachedNumbers: string[] = [];
  const cachedResults: ValidationResult[] = [];

  for (const num of validNumbers) {
    const cached = getFromCache(num);
    if (cached) {
      cachedResults.push(cached.result);
      validationCache.stats.hits++;
    } else {
      uncachedNumbers.push(num);
      validationCache.stats.misses++;
    }
  }

  // 10件ずつバッチに分割
  const batches: string[][] = [];
  for (let i = 0; i < uncachedNumbers.length; i += 10) {
    batches.push(uncachedNumbers.slice(i, i + 10));
  }

  // 並列リクエスト（concurrency制限付き）
  const apiResults: ValidationResult[] = [];
  for (let i = 0; i < batches.length; i += concurrency) {
    const chunk = batches.slice(i, i + concurrency);
    const batchPromises = chunk.map((batch) =>
      validateBatch(batch, day).catch((error) =>
        batch.map((num) => ({
          registrationNumber: num,
          isValid: false,
          name: null,
          registrationDate: null,
          disposalDate: null,
          expireDate: null,
          validatedAt: day,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      )
    );

    const batchResults = await Promise.all(batchPromises);
    for (const results of batchResults) {
      apiResults.push(...results);

      // キャッシュに保存
      for (const result of results) {
        if (!result.error) {
          setToCache(result);
        }
      }
    }
  }

  // 全結果を統合
  const allResults = [...invalidFormatResults, ...cachedResults, ...apiResults];

  const successCount = allResults.filter((r) => !r.error).length;
  const errorCount = allResults.filter((r) => r.error).length;
  const validCount = allResults.filter((r) => r.isValid).length;
  const invalidCount = allResults.filter((r) => !r.isValid && !r.error).length;

  return {
    results: allResults,
    successCount,
    errorCount,
    validCount,
    invalidCount,
    validatedAt: day,
    durationMs: Date.now() - startTime,
  };
}

/**
 * 10件以内のバッチを検証（内部用）
 */
async function validateBatch(
  numbers: string[],
  day: string
): Promise<ValidationResult[]> {
  const response = await validateRegistration(numbers, day);
  return response.announcement.map((ann) => ({
    registrationNumber: ann.registratedNumber,
    isValid: ann.valid === '1',
    name: ann.name,
    registrationDate: ann.registrationDate,
    disposalDate: ann.disposalDate,
    expireDate: ann.expireDate,
    validatedAt: day,
    error: null,
  }));
}

// ============================================================
// 検証結果キャッシュ
// ============================================================

const validationCache = {
  /** キャッシュストレージ */
  entries: new Map<string, CachedValidation>(),
  /** デフォルトの有効時間: 24時間 */
  defaultTtlMs: 24 * 60 * 60 * 1000,
  /** 統計情報 */
  stats: { hits: 0, misses: 0 },
};

function getFromCache(registrationNumber: string): CachedValidation | null {
  const entry = validationCache.entries.get(registrationNumber);
  if (entry && Date.now() < entry.expiresAt) {
    return entry;
  }
  // 期限切れの場合はクリーンアップ
  if (entry) {
    validationCache.entries.delete(registrationNumber);
  }
  return null;
}

function setToCache(result: ValidationResult): void {
  const now = Date.now();
  validationCache.entries.set(result.registrationNumber, {
    registrationNumber: result.registrationNumber,
    result,
    cachedAt: now,
    expiresAt: now + validationCache.defaultTtlMs,
  });
}

/**
 * キャッシュ統計を取得
 *
 * @returns キャッシュの統計情報
 */
export function getCacheStats(): CacheStats {
  const totalRequests = validationCache.stats.hits + validationCache.stats.misses;
  return {
    size: validationCache.entries.size,
    hits: validationCache.stats.hits,
    misses: validationCache.stats.misses,
    hitRate: totalRequests > 0 ? validationCache.stats.hits / totalRequests : 0,
  };
}

/**
 * キャッシュをクリア
 */
export function clearValidationCache(): void {
  validationCache.entries.clear();
  validationCache.stats = { hits: 0, misses: 0 };
}

/**
 * キャッシュの有効時間を設定
 *
 * @param ttlMs - キャッシュ有効時間（ミリ秒）
 *
 * @example
 * ```ts
 * // キャッシュを12時間に設定
 * setCacheTtl(12 * 60 * 60 * 1000);
 * ```
 */
export function setCacheTtl(ttlMs: number): void {
  validationCache.defaultTtlMs = ttlMs;
}

/**
 * 期限切れキャッシュを一括クリーンアップ
 *
 * @returns 削除されたエントリ数
 */
export function cleanupExpiredCache(): number {
  const now = Date.now();
  let removedCount = 0;

  for (const [key, entry] of validationCache.entries) {
    if (now >= entry.expiresAt) {
      validationCache.entries.delete(key);
      removedCount++;
    }
  }

  return removedCount;
}

// ============================================================
// 更新情報の定期取得（税理士CRM向け拡張）
// ============================================================

/**
 * 直近の更新情報を取得（差分データ）
 *
 * 顧問先の取引先が取消・変更されていないかを定期チェックするための関数。
 * 指定期間内の新規・変更・削除を分類して返す。
 *
 * @param from - 取得開始日 (yyyy-MM-dd)
 * @param to - 取得終了日 (yyyy-MM-dd)、省略時は本日
 * @returns 差分更新結果（新規・変更・削除に分類済み）
 *
 * @example
 * ```ts
 * // 過去1週間の更新を取得
 * const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
 *   .toISOString().split('T')[0];
 * const updates = await fetchRecentUpdates(oneWeekAgo);
 * console.log(`新規: ${updates.newRegistrations.length}`);
 * console.log(`変更: ${updates.updatedRegistrations.length}`);
 * console.log(`取消: ${updates.deletedRegistrations.length}`);
 * ```
 */
export async function fetchRecentUpdates(
  from: string,
  to?: string
): Promise<DiffUpdateResult> {
  const toDate = to || new Date().toISOString().split('T')[0];

  // 全ページ取得（分割データに対応）
  const allAnnouncements = await fetchAllDiffPages(from, toDate);

  // 処理区分で分類
  const newRegistrations = allAnnouncements.filter((a) => a.process === '01');
  const updatedRegistrations = allAnnouncements.filter((a) => a.process === '02');
  const deletedRegistrations = allAnnouncements.filter((a) => a.process === '99');

  return {
    from,
    to: toDate,
    newRegistrations,
    updatedRegistrations,
    deletedRegistrations,
    totalCount: allAnnouncements.length,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * 差分データの全ページを取得（分割データ対応）
 *
 * diff APIは大量データ時に分割レスポンスを返すため、
 * divideSize > 1 の場合は全ページを取得する。
 */
async function fetchAllDiffPages(
  from: string,
  to: string
): Promise<import('./types').InvoiceAnnouncement[]> {
  // 最初のページを取得
  const firstPage = await searchByDateRange(from, to, { division: '3' });
  const allAnnouncements = [...(firstPage.announcement || [])];

  const totalPages = parseInt(firstPage.divideSize, 10) || 1;

  // 残りのページを取得（2ページ目以降）
  if (totalPages > 1) {
    for (let page = 2; page <= totalPages; page++) {
      try {
        const pageData = await searchByDateRange(from, to, {
          division: '3',
          divide: page,
        });
        if (pageData.announcement) {
          allAnnouncements.push(...pageData.announcement);
        }
      } catch (error) {
        console.error(`Failed to fetch diff page ${page}/${totalPages}:`, error);
      }
    }
  }

  return allAnnouncements;
}

/**
 * 顧問先の取引先リストと差分データを突合
 *
 * 顧問先がインボイス番号を管理している取引先リストに対して、
 * 差分データの取消・変更を突合し、影響のある取引先を抽出する。
 *
 * @param watchedNumbers - 監視対象の登録番号一覧
 * @param updates - 差分更新結果（fetchRecentUpdatesの戻り値）
 * @returns 影響のある取引先の変更情報
 *
 * @example
 * ```ts
 * const clientNumbers = ['T1234567890123', 'T2345678901234', ...];
 * const updates = await fetchRecentUpdates('2026-03-17');
 * const alerts = checkWatchedNumbers(clientNumbers, updates);
 * if (alerts.length > 0) {
 *   // 顧問先に通知
 * }
 * ```
 */
export function checkWatchedNumbers(
  watchedNumbers: string[],
  updates: DiffUpdateResult
): Array<{
  registrationNumber: string;
  changeType: 'updated' | 'deleted';
  announcement: import('./types').InvoiceAnnouncement;
}> {
  const watchedSet = new Set(watchedNumbers);
  const alerts: Array<{
    registrationNumber: string;
    changeType: 'updated' | 'deleted';
    announcement: import('./types').InvoiceAnnouncement;
  }> = [];

  // 変更された事業者
  for (const ann of updates.updatedRegistrations) {
    if (watchedSet.has(ann.registratedNumber)) {
      alerts.push({
        registrationNumber: ann.registratedNumber,
        changeType: 'updated',
        announcement: ann,
      });
    }
  }

  // 取消された事業者
  for (const ann of updates.deletedRegistrations) {
    if (watchedSet.has(ann.registratedNumber)) {
      alerts.push({
        registrationNumber: ann.registratedNumber,
        changeType: 'deleted',
        announcement: ann,
      });
    }
  }

  return alerts;
}
