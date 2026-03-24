/**
 * jGrants API クライアント（デジタル庁 補助金申請システム）
 *
 * 公式ドキュメント: https://developers.digital.go.jp/documents/jgrants/api/
 * GitHub (MCP Server): https://github.com/digital-go-jp/jgrants-mcp-server
 * Base URL: https://api.jgrants-portal.go.jp/exp
 *
 * 認証: 不要（公開API）
 * 特徴: GビズIDと連携した補助金電子申請システムの公開検索API
 */

import type {
  SubsidiesSearchRequest,
  SubsidiesSearchResponse,
  SubsidyDetailResponse,
  SubsidyDetailV2Response,
  SubsidySummary,
  SubsidyMatchResult,
  ClientSubsidyProfile,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /**
   * Base URL
   * 公式ドキュメント記載のエンドポイント
   * 認証不要のため、APIキーは不要
   */
  baseUrl: process.env.JGRANTS_BASE_URL || 'https://api.jgrants-portal.go.jp/exp',
  /** デフォルトのリクエストタイムアウト (ms) */
  timeout: 30_000,
  /** リトライ回数 */
  maxRetries: 3,
  /** リトライ間隔ベース (ms) */
  retryBaseDelay: 1_000,
};

// ============================================================
// ヘルパー
// ============================================================

function buildSearchParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}

async function fetchWithRetry<T>(
  url: string,
  options?: { retries?: number }
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
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(
          `jGrants API error: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 最後のリトライでなければ待機してリトライ
      if (attempt < maxRetries) {
        const delay = config.retryBaseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error('jGrants API: unknown error');
}

// ============================================================
// 補助金一覧検索 (GET /v1/public/subsidies)
// ============================================================

/**
 * 補助金を検索
 *
 * キーワード（2文字以上）を必須パラメータとして、業種・地域・従業員数等で絞り込み可能。
 * 認証は不要で、誰でも利用可能な公開APIです。
 *
 * @param params - 検索パラメータ
 * @returns 補助金一覧（メタデータ含む）
 *
 * @example
 * ```ts
 * // IT導入に関する補助金を検索（受付中のみ）
 * const result = await searchSubsidies({
 *   keyword: 'IT導入',
 *   acceptance: 1,
 *   sort: 'acceptance_end_datetime',
 *   order: 'ASC',
 * });
 * console.log(`${result.metadata.resultset.count}件の補助金が見つかりました`);
 * ```
 *
 * @example
 * ```ts
 * // 東京都の製造業向け補助金を検索
 * const result = await searchSubsidies({
 *   keyword: '設備投資',
 *   industry: '製造業',
 *   target_area_search: '東京都',
 *   target_number_of_employees: '21～50人',
 *   acceptance: 1,
 * });
 * ```
 */
export async function searchSubsidies(
  params: SubsidiesSearchRequest
): Promise<SubsidiesSearchResponse> {
  if (!params.keyword || params.keyword.length < 2) {
    throw new Error('keyword は2文字以上で指定してください');
  }

  const queryString = buildSearchParams({
    keyword: params.keyword,
    industry: params.industry,
    target_area_search: params.target_area_search,
    target_number_of_employees: params.target_number_of_employees,
    sort: params.sort,
    order: params.order,
    acceptance: params.acceptance,
    use_purpose: params.use_purpose,
  });

  const url = `${config.baseUrl}/v1/public/subsidies?${queryString}`;
  return fetchWithRetry<SubsidiesSearchResponse>(url);
}

// ============================================================
// 補助金詳細取得 V1 (GET /v1/public/subsidies/id/{id})
// ============================================================

/**
 * 補助金の詳細情報を取得（V1）
 *
 * IDには補助金一覧検索で取得したidを指定します。
 * 公募要領・概要・申請書のPDFがBase64で含まれる場合があります。
 *
 * @param subsidyId - 補助金ID（最大18文字）
 * @returns 補助金詳細情報
 *
 * @example
 * ```ts
 * const detail = await getSubsidyDetail('S-01100011');
 * console.log(detail.result.title);       // 補助金名
 * console.log(detail.result.subsidy_rate); // 補助率 (例: "2/3")
 * ```
 */
export async function getSubsidyDetail(
  subsidyId: string
): Promise<SubsidyDetailResponse> {
  if (!subsidyId || subsidyId.length > 18) {
    throw new Error('subsidyId は1〜18文字で指定してください');
  }

  const url = `${config.baseUrl}/v1/public/subsidies/id/${encodeURIComponent(subsidyId)}`;
  return fetchWithRetry<SubsidyDetailResponse>(url);
}

// ============================================================
// 補助金詳細取得 V2 (GET /v2/public/subsidies/id/{id})
// ============================================================

/**
 * 補助金の詳細情報を取得（V2 - ワークフロー情報付き）
 *
 * V2では公募回次（workflow）情報が追加されます。
 * 同一補助金で複数回公募がある場合、各回次の受付期間・地域が取得できます。
 *
 * @param subsidyId - 補助金ID（最大18文字）
 * @returns 補助金詳細情報（V2 ワークフロー付き）
 *
 * @example
 * ```ts
 * const detail = await getSubsidyDetailV2('S-01100011');
 * for (const wf of detail.result.workflow) {
 *   console.log(`${wf.fiscal_year_round}: ${wf.acceptance_start_datetime} ～ ${wf.acceptance_end_datetime}`);
 * }
 * ```
 */
export async function getSubsidyDetailV2(
  subsidyId: string
): Promise<SubsidyDetailV2Response> {
  if (!subsidyId || subsidyId.length > 18) {
    throw new Error('subsidyId は1〜18文字で指定してください');
  }

  const url = `${config.baseUrl}/v2/public/subsidies/id/${encodeURIComponent(subsidyId)}`;
  return fetchWithRetry<SubsidyDetailV2Response>(url);
}

// ============================================================
// 税理士CRM向けユーティリティ
// ============================================================

/**
 * 顧問先プロフィールに基づいて最適な補助金を検索・マッチング
 *
 * 複数のキーワードで検索し、業種・地域・従業員数の一致度に基づいてスコアリング。
 * 税理士が顧問先に補助金を提案する際のワークフローを想定。
 *
 * @param profile - 顧問先の情報
 * @returns マッチングスコア付きの補助金リスト
 *
 * @example
 * ```ts
 * const matches = await findSubsidiesForClient({
 *   industry: '製造業',
 *   prefecture: '埼玉県',
 *   employeeCount: 30,
 *   purposes: ['設備投資', 'DX推進'],
 *   keywords: ['生産性向上', 'デジタル化'],
 * });
 * // スコアの高い順に顧問先へ提案
 * ```
 */
export async function findSubsidiesForClient(
  profile: ClientSubsidyProfile
): Promise<SubsidyMatchResult[]> {
  const allResults: SubsidySummary[] = [];

  // 複数キーワードで並列検索
  const searchPromises = profile.keywords.map((keyword) =>
    searchSubsidies({
      keyword,
      industry: profile.industry,
      target_area_search: profile.prefecture,
      acceptance: 1, // 受付中のみ
      sort: 'acceptance_end_datetime',
      order: 'ASC',
    }).catch(() => null)
  );

  const responses = await Promise.all(searchPromises);
  const seenIds = new Set<string>();

  for (const response of responses) {
    if (response?.result) {
      for (const subsidy of response.result) {
        if (!seenIds.has(subsidy.id)) {
          seenIds.add(subsidy.id);
          allResults.push(subsidy);
        }
      }
    }
  }

  // マッチングスコア計算
  return allResults
    .map((subsidy) => calculateMatchScore(subsidy, profile))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * マッチングスコアを計算
 */
function calculateMatchScore(
  subsidy: SubsidySummary,
  profile: ClientSubsidyProfile
): SubsidyMatchResult {
  let score = 50; // 基本スコア（検索にヒットした時点で50点）
  const reasons: string[] = [];

  // 地域マッチ (+20)
  if (subsidy.target_area_search) {
    const areas = subsidy.target_area_search.split(',').map((a) => a.trim());
    if (areas.includes(profile.prefecture) || areas.includes('全国')) {
      score += 20;
      reasons.push(`対象地域: ${profile.prefecture}`);
    }
  }

  // 従業員数マッチ (+15)
  if (subsidy.target_number_of_employees) {
    const empRange = subsidy.target_number_of_employees;
    if (isEmployeeCountInRange(profile.employeeCount, empRange)) {
      score += 15;
      reasons.push(`従業員数: ${profile.employeeCount}人が対象範囲内`);
    }
  }

  // 締切が近い (+15: 30日以内)
  let daysUntilDeadline: number | null = null;
  if (subsidy.acceptance_end_datetime) {
    const deadline = new Date(subsidy.acceptance_end_datetime);
    const now = new Date();
    daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
      score += 15;
      reasons.push(`締切まで${daysUntilDeadline}日`);
    } else if (daysUntilDeadline > 30) {
      score += 5;
    }
  }

  return {
    subsidy,
    matchScore: Math.min(score, 100),
    matchReasons: reasons,
    daysUntilDeadline,
  };
}

/**
 * 従業員数が対象範囲内かチェック
 */
function isEmployeeCountInRange(count: number, rangeStr: string): boolean {
  if (rangeStr.includes('以下')) {
    const max = parseInt(rangeStr, 10);
    return !isNaN(max) && count <= max;
  }
  if (rangeStr.includes('以上')) {
    const min = parseInt(rangeStr, 10);
    return !isNaN(min) && count >= min;
  }
  // "21～50人" のようなパターン
  const match = rangeStr.match(/(\d+)[～〜\-](\d+)/);
  if (match) {
    const min = parseInt(match[1], 10);
    const max = parseInt(match[2], 10);
    return count >= min && count <= max;
  }
  return true; // パースできない場合は対象とみなす
}

// ============================================================
// ヘルスチェック
// ============================================================

/**
 * jGrants APIの疎通確認
 *
 * @returns 疎通確認結果
 */
export async function healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    // 最小限のリクエストで疎通確認
    await searchSubsidies({ keyword: 'テスト', acceptance: 0 });
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
