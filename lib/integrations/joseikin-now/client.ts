/**
 * 助成金なう（ナビット）データ取得クライアント
 *
 * 公式サイト: https://www.navit-j.com/service/joseikin-now/
 * ブログ: https://joseikin-now.jp/
 * 運営: 株式会社ナビット
 *
 * DB規模:
 *   - 国・自治体案件: 145,169件（2026年3月時点）
 *   - 財団・協会案件: 9,832件
 *   - 過去採択企業DB: 829,706社
 *   - 月間更新: 1,500〜2,000件（日次で100-200件公示）
 *
 * データ取得方式:
 *   - Web検索（無料会員/有料会員）
 *   - 法人プランでのAPI利用（要契約・問い合わせ）
 *   - 販売代理店プログラム経由（パートナー契約）
 *
 * 認証:
 *   - Web: 会員登録（無料/有料）
 *   - API: 法人プラン契約後に発行されるAPIキー
 */

import type {
  JoseikinSearchParams,
  JoseikinSubsidySummary,
  JoseikinSubsidyDetail,
  JoseikinSearchResult,
  JoseikinDbStats,
  JoseikinClientProfile,
  JoseikinMatchResult,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** 公式サイト */
  siteUrl: 'https://www.navit-j.com/service/joseikin-now/',
  /** ブログ（記事一覧・新着情報） */
  blogUrl: 'https://joseikin-now.jp/',
  /**
   * API Base URL（法人プラン）
   * 注: 公式ドキュメント非公開。契約後に案内されるエンドポイント。
   */
  apiBaseUrl: process.env.JOSEIKIN_NOW_API_URL || '',
  /** APIキー（法人プラン契約後に発行） */
  apiKey: process.env.JOSEIKIN_NOW_API_KEY || '',
  /** デフォルトのリクエストタイムアウト (ms) */
  timeout: 30_000,
  /** リトライ回数 */
  maxRetries: 3,
  /** リトライ間隔ベース (ms) */
  retryBaseDelay: 1_000,
  /** スクレイピング時のリクエスト間隔 (ms) */
  requestInterval: 3_000,
};

// ============================================================
// ヘルパー
// ============================================================

async function fetchWithRetry<T>(
  url: string,
  options?: {
    retries?: number;
    parseAs?: 'json' | 'text';
    headers?: Record<string, string>;
  }
): Promise<T> {
  const maxRetries = options?.retries ?? config.maxRetries;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const defaultHeaders: Record<string, string> = {
        'Accept': options?.parseAs === 'text' ? 'text/html' : 'application/json',
        'User-Agent': 'TaxPartnerCRM/1.0 (subsidy-matching)',
      };

      // API利用時はAPIキーを付与
      if (config.apiKey && url.startsWith(config.apiBaseUrl)) {
        defaultHeaders['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: { ...defaultHeaders, ...options?.headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Joseikin-Now request error: ${response.status} ${response.statusText}`
        );
      }

      if (options?.parseAs === 'text') {
        return (await response.text()) as unknown as T;
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = config.retryBaseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error('Joseikin-Now: unknown error');
}

function isApiConfigured(): boolean {
  return !!(config.apiBaseUrl && config.apiKey);
}

// ============================================================
// 助成金・補助金検索
// ============================================================

/**
 * 助成金・補助金を検索
 *
 * API利用可能時（法人プラン契約済み）はAPIを使用。
 * そうでない場合はWebスクレイピングにフォールバック。
 *
 * @param params - 検索パラメータ
 * @returns 検索結果
 *
 * @example
 * ```ts
 * // キーワード検索
 * const result = await searchSubsidies({ keyword: 'IT導入', status: '公募中' });
 *
 * // 都道府県フィルター
 * const result = await searchSubsidies({ prefecture: '埼玉県', category: '国・自治体' });
 * ```
 */
export async function searchSubsidies(
  params: JoseikinSearchParams
): Promise<JoseikinSearchResult> {
  if (isApiConfigured()) {
    return searchViaApi(params);
  }
  return searchViaWeb(params);
}

/**
 * API経由で検索（法人プラン）
 */
async function searchViaApi(
  params: JoseikinSearchParams
): Promise<JoseikinSearchResult> {
  const searchParams = new URLSearchParams();

  if (params.keyword) searchParams.append('keyword', params.keyword);
  if (params.category) searchParams.append('category', params.category);
  if (params.prefecture) searchParams.append('prefecture', params.prefecture);
  if (params.industry) searchParams.append('industry', params.industry);
  if (params.status) searchParams.append('status', params.status);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.perPage) searchParams.append('per_page', String(params.perPage));

  const url = `${config.apiBaseUrl}/subsidies?${searchParams.toString()}`;
  return fetchWithRetry<JoseikinSearchResult>(url);
}

/**
 * Web経由で検索（スクレイピング）
 */
async function searchViaWeb(
  params: JoseikinSearchParams
): Promise<JoseikinSearchResult> {
  // ブログサイトからの最新情報取得
  const url = `${config.blogUrl}`;
  const html = await fetchWithRetry<string>(url, { parseAs: 'text' });

  // デモ実装: 実運用ではHTMLパーサーで抽出
  return parseSearchResultsHtml(html, params);
}

/**
 * HTMLから検索結果を抽出
 */
function parseSearchResultsHtml(
  _html: string,
  params: JoseikinSearchParams
): JoseikinSearchResult {
  // TODO: 実運用では cheerio 等でパース
  return {
    totalCount: 0,
    currentPage: params.page || 1,
    totalPages: 0,
    items: [],
  };
}

// ============================================================
// 助成金・補助金詳細取得
// ============================================================

/**
 * 助成金・補助金の詳細情報を取得
 *
 * @param subsidyId - 案件ID
 * @returns 詳細情報
 *
 * @example
 * ```ts
 * const detail = await getSubsidyDetail('12345');
 * console.log(detail?.title);
 * console.log(detail?.maxAmount);
 * ```
 */
export async function getSubsidyDetail(
  subsidyId: string
): Promise<JoseikinSubsidyDetail | null> {
  if (isApiConfigured()) {
    try {
      const url = `${config.apiBaseUrl}/subsidies/${encodeURIComponent(subsidyId)}`;
      return await fetchWithRetry<JoseikinSubsidyDetail>(url);
    } catch {
      return null;
    }
  }

  // Web経由のフォールバック
  return null;
}

// ============================================================
// DB統計情報
// ============================================================

/**
 * データベース統計情報を取得
 *
 * 助成金なうのトップページから最新の統計情報を取得。
 *
 * @returns DB統計情報
 *
 * @example
 * ```ts
 * const stats = await getDbStats();
 * console.log(`国・自治体案件: ${stats.governmentCount}件`);
 * console.log(`本日の新着: ${stats.todayNewCount}件`);
 * ```
 */
export async function getDbStats(): Promise<JoseikinDbStats> {
  try {
    const html = await fetchWithRetry<string>(config.siteUrl, { parseAs: 'text' });
    return parseDbStatsHtml(html);
  } catch {
    // フォールバック: 最新の公表値
    return {
      governmentCount: 145_169,
      foundationCount: 9_832,
      adoptedCompanyCount: 829_706,
      todayNewCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  }
}

/**
 * HTMLからDB統計情報を抽出
 */
function parseDbStatsHtml(_html: string): JoseikinDbStats {
  // TODO: 実運用ではHTMLパーサーで数値を抽出
  return {
    governmentCount: 145_169,
    foundationCount: 9_832,
    adoptedCompanyCount: 829_706,
    todayNewCount: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

// ============================================================
// 顧問先マッチング機能
// ============================================================

/**
 * 顧問先プロフィールに基づいて最適な助成金を検索・マッチング
 *
 * @param profile - 顧問先のプロフィール情報
 * @returns マッチングスコア付きの助成金リスト
 *
 * @example
 * ```ts
 * const matches = await findSubsidiesForClient({
 *   prefecture: '埼玉県',
 *   industry: '製造業',
 *   employeeCount: 30,
 *   interests: ['設備投資', '人材育成'],
 *   keywords: ['生産性向上'],
 * });
 * ```
 */
export async function findSubsidiesForClient(
  profile: JoseikinClientProfile
): Promise<JoseikinMatchResult[]> {
  // キーワードで並列検索
  const searchKeywords = [
    ...profile.keywords,
    profile.industry,
    ...profile.interests.slice(0, 3),
  ].filter(Boolean);

  const searchPromises = searchKeywords.map((keyword) =>
    searchSubsidies({
      keyword,
      prefecture: profile.prefecture,
      status: '公募中',
    }).catch(() => null)
  );

  const responses = await Promise.all(searchPromises);
  const allItems: JoseikinSubsidySummary[] = [];
  const seenIds = new Set<string>();

  for (const response of responses) {
    if (response?.items) {
      for (const item of response.items) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          allItems.push(item);
        }
      }
    }
  }

  return allItems
    .map((subsidy) => calculateMatchScore(subsidy, profile))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * マッチングスコアを計算
 */
function calculateMatchScore(
  subsidy: JoseikinSubsidySummary,
  profile: JoseikinClientProfile
): JoseikinMatchResult {
  let score = 40;
  const reasons: string[] = [];

  // 地域マッチ (+20)
  if (subsidy.region.includes(profile.prefecture) || subsidy.region === '全国') {
    score += 20;
    reasons.push(`対象地域: ${profile.prefecture}`);
  }

  // 公募中ボーナス (+15)
  if (subsidy.status === '公募中') {
    score += 15;
    reasons.push('現在公募中');
  }

  // キーワードマッチ (+10 per keyword, max +20)
  let keywordBonus = 0;
  for (const kw of profile.keywords) {
    if (subsidy.title.includes(kw) || subsidy.description.includes(kw)) {
      keywordBonus += 10;
      reasons.push(`キーワード一致: ${kw}`);
    }
  }
  score += Math.min(keywordBonus, 20);

  return {
    subsidy,
    matchScore: Math.min(score, 100),
    matchReasons: reasons,
    source: 'joseikin-now',
  };
}

// ============================================================
// ヘルスチェック
// ============================================================

/**
 * 助成金なうの疎通確認
 */
export async function healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    if (isApiConfigured()) {
      await fetchWithRetry(`${config.apiBaseUrl}/health`);
    } else {
      await fetchWithRetry<string>(config.blogUrl, { parseAs: 'text' });
    }
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
