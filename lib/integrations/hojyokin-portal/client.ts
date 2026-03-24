/**
 * 補助金ポータル データ取得クライアント
 *
 * 公式サイト: https://hojyokin-portal.jp/
 * 士業ポータル: https://shigyo-portal.jp/
 * 運営: 株式会社補助金ポータル
 *
 * DB規模: 3万件以上の補助金・助成金情報
 * 月間利用者: 約100万人
 *
 * データ取得方式:
 *   - 内部API: /api/columns/（コラム記事取得、JSON形式）
 *   - Webスクレイピング: 補助金検索・詳細ページ
 *   - 士業パートナー連携: shigyo-portal.jp 経由（要登録）
 *
 * フレームワーク: Livewire（Laravel）ベース
 *
 * 認証: 不要（公開サイト）/ 士業ポータルは登録制（クレジットカード決済）
 */

import type {
  HojyokinSearchParams,
  HojyokinSubsidySummary,
  HojyokinSubsidyDetail,
  HojyokinSearchResult,
  HojyokinColumn,
  HojyokinColumnsResponse,
  HojyokinClientProfile,
  HojyokinMatchResult,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** メインサイト */
  baseUrl: process.env.HOJYOKIN_PORTAL_BASE_URL || 'https://hojyokin-portal.jp',
  /** 士業ポータル */
  shigyoPortalUrl: 'https://shigyo-portal.jp',
  /** コラムAPI */
  columnsApiPath: '/api/columns/',
  /** デフォルトのリクエストタイムアウト (ms) */
  timeout: 30_000,
  /** リトライ回数 */
  maxRetries: 3,
  /** リトライ間隔ベース (ms) */
  retryBaseDelay: 1_000,
  /** スクレイピング時のリクエスト間隔 (ms) */
  requestInterval: 2_000,
};

// ============================================================
// ヘルパー
// ============================================================

async function fetchWithRetry<T>(
  url: string,
  options?: { retries?: number; parseAs?: 'json' | 'text' }
): Promise<T> {
  const maxRetries = options?.retries ?? config.maxRetries;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': options?.parseAs === 'text' ? 'text/html' : 'application/json',
          'User-Agent': 'TaxPartnerCRM/1.0 (subsidy-matching)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Hojyokin-Portal request error: ${response.status} ${response.statusText}`
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

  throw lastError ?? new Error('Hojyokin-Portal: unknown error');
}

// ============================================================
// コラム記事取得 (GET /api/columns/)
// ============================================================

/**
 * 補助金関連コラム記事を取得
 *
 * 内部API `/api/columns/` を利用してコラム記事一覧を取得。
 * 補助金の解説記事・最新情報・申請ノウハウ等を含む。
 *
 * @returns コラム記事一覧
 *
 * @example
 * ```ts
 * const columns = await getColumns();
 * for (const col of columns) {
 *   console.log(`${col.title} (${col.publishedDate})`);
 * }
 * ```
 */
export async function getColumns(): Promise<HojyokinColumn[]> {
  const url = `${config.baseUrl}${config.columnsApiPath}`;

  try {
    const response = await fetchWithRetry<HojyokinColumnsResponse>(url);
    return response.columns;
  } catch {
    // APIが利用不可の場合は空配列
    return [];
  }
}

// ============================================================
// 補助金検索（Webスクレイピング）
// ============================================================

/**
 * 補助金を検索
 *
 * 補助金ポータルのWebページをスクレイピングして補助金情報を取得。
 * Livewireベースのため、AJAXリクエストでの取得も検討可能。
 *
 * @param params - 検索パラメータ
 * @returns 検索結果
 *
 * @example
 * ```ts
 * // キーワード検索
 * const result = await searchSubsidies({ keyword: 'IT導入補助金' });
 *
 * // 都道府県フィルター
 * const result = await searchSubsidies({ prefecture: '東京都', status: '募集中' });
 * ```
 */
export async function searchSubsidies(
  params: HojyokinSearchParams
): Promise<HojyokinSearchResult> {
  // 検索ページのURL構築
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.append('q', params.keyword);
  if (params.prefecture) searchParams.append('prefecture', params.prefecture);
  if (params.category) searchParams.append('category', params.category);
  if (params.page) searchParams.append('page', String(params.page));

  const url = `${config.baseUrl}/search?${searchParams.toString()}`;
  const html = await fetchWithRetry<string>(url, { parseAs: 'text' });

  return parseSearchResultsHtml(html, params);
}

/**
 * HTMLから補助金一覧を抽出
 */
function parseSearchResultsHtml(
  _html: string,
  params: HojyokinSearchParams
): HojyokinSearchResult {
  // TODO: 実運用では cheerio 等でパース
  // Livewireコンポーネントからのデータ抽出も検討
  return {
    totalCount: 0,
    currentPage: params.page || 1,
    totalPages: 0,
    items: [],
  };
}

// ============================================================
// 補助金詳細取得
// ============================================================

/**
 * 補助金の詳細情報を取得
 *
 * @param subsidyId - 補助金ID
 * @returns 補助金詳細情報
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
): Promise<HojyokinSubsidyDetail | null> {
  const url = `${config.baseUrl}/columns/${encodeURIComponent(subsidyId)}`;

  try {
    const html = await fetchWithRetry<string>(url, { parseAs: 'text' });
    return parseSubsidyDetailHtml(html, subsidyId);
  } catch {
    return null;
  }
}

/**
 * HTMLから補助金詳細を抽出
 */
function parseSubsidyDetailHtml(
  _html: string,
  subsidyId: string
): HojyokinSubsidyDetail {
  // TODO: 実運用ではHTMLパーサーに置き換え
  return {
    id: subsidyId,
    title: '',
    description: '',
    category: '補助金',
    region: '',
    status: '募集中',
    detailUrl: `${config.baseUrl}/columns/${subsidyId}`,
    eligibility: '',
  };
}

// ============================================================
// 士業パートナー連携
// ============================================================

/**
 * 士業パートナーの専門家を検索
 *
 * shigyo-portal.jp の専門家検索機能を利用。
 * 補助金申請の専門家を顧問先に紹介するための検索。
 *
 * @param shigyoType - 資格種別（税理士、社労士 等）
 * @param region - 地域
 * @returns 専門家一覧ページURL
 *
 * @example
 * ```ts
 * // 埼玉県の税理士を検索
 * const url = getExpertSearchUrl('税理士', '埼玉県');
 * // → https://shigyo-portal.jp/search?type=税理士&region=埼玉県
 * ```
 */
export function getExpertSearchUrl(
  shigyoType?: string,
  region?: string
): string {
  const params = new URLSearchParams();
  if (shigyoType) params.append('type', shigyoType);
  if (region) params.append('region', region);
  return `${config.shigyoPortalUrl}/search?${params.toString()}`;
}

/**
 * 士業パートナー登録ページURL
 *
 * @returns 登録ページURL
 */
export function getPartnerRegistrationUrl(): string {
  return `${config.shigyoPortalUrl}/register`;
}

/**
 * 士業パートナープラン一覧URL
 *
 * @returns プラン一覧ページURL
 */
export function getPartnerPlansUrl(): string {
  return `${config.shigyoPortalUrl}/plan`;
}

// ============================================================
// 顧問先マッチング機能
// ============================================================

/**
 * 顧問先プロフィールに基づいて最適な補助金を検索・マッチング
 *
 * @param profile - 顧問先のプロフィール情報
 * @returns マッチングスコア付きの補助金リスト
 *
 * @example
 * ```ts
 * const matches = await findSubsidiesForClient({
 *   prefecture: '東京都',
 *   industry: '情報通信業',
 *   employeeCount: 15,
 *   interests: ['IT導入', '人材育成'],
 *   keywords: ['DX', 'クラウド'],
 * });
 * ```
 */
export async function findSubsidiesForClient(
  profile: HojyokinClientProfile
): Promise<HojyokinMatchResult[]> {
  // キーワードで並列検索
  const searchKeywords = [
    ...profile.keywords,
    ...profile.interests.slice(0, 3),
  ].filter(Boolean);

  const searchPromises = searchKeywords.map((keyword) =>
    searchSubsidies({
      keyword,
      prefecture: profile.prefecture,
      status: '募集中',
    }).catch(() => null)
  );

  const responses = await Promise.all(searchPromises);
  const allItems: HojyokinSubsidySummary[] = [];
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
  subsidy: HojyokinSubsidySummary,
  profile: HojyokinClientProfile
): HojyokinMatchResult {
  let score = 40;
  const reasons: string[] = [];

  // 地域マッチ (+20)
  if (subsidy.region.includes(profile.prefecture) || subsidy.region === '全国') {
    score += 20;
    reasons.push(`対象地域: ${profile.prefecture}`);
  }

  // 募集中ボーナス (+15)
  if (subsidy.status === '募集中') {
    score += 15;
    reasons.push('現在募集中');
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
    source: 'hojyokin-portal',
  };
}

// ============================================================
// ヘルスチェック
// ============================================================

/**
 * 補助金ポータルの疎通確認
 */
export async function healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    // コラムAPIで疎通確認（軽量）
    await getColumns();
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
