/**
 * スマート補助金 API/スクレイピングクライアント
 *
 * 公式サイト: https://www.smart-hojokin.jp/
 * DB規模: 75,818件以上の補助金・助成金・給付金情報
 *
 * データ取得方式:
 *   - 内部API: /api/v1/public/areas（都道府県→市区町村取得）
 *   - Webスクレイピング: 補助金一覧・詳細ページ
 *
 * 認証: 不要（公開サイト）
 * 注意: reCAPTCHA保護あり。大量アクセス時はレート制限に注意。
 */

import type {
  SmartHojokinPrefecture,
  SmartHojokinArea,
  AreasResponse,
  SmartHojokinSearchParams,
  SmartHojokinSubsidySummary,
  SmartHojokinSubsidyDetail,
  SmartHojokinSearchResult,
  SmartHojokinClientProfile,
  SmartHojokinMatchResult,
  SubsidyClassifyId,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** ベースURL */
  baseUrl: process.env.SMART_HOJOKIN_BASE_URL || 'https://www.smart-hojokin.jp',
  /** 内部API パス */
  areasApiPath: '/api/v1/public/areas',
  /** デフォルトのリクエストタイムアウト (ms) */
  timeout: 30_000,
  /** リトライ回数 */
  maxRetries: 3,
  /** リトライ間隔ベース (ms) */
  retryBaseDelay: 1_000,
  /** リクエスト間隔 (ms) - スクレイピング時のレート制限 */
  requestInterval: 2_000,
};

// ============================================================
// 都道府県マスタ（ID: 1-47 + 48=全国, 49=その他）
// ============================================================

const PREFECTURES: SmartHojokinPrefecture[] = [
  { id: 1, name: '北海道' }, { id: 2, name: '青森県' }, { id: 3, name: '岩手県' },
  { id: 4, name: '宮城県' }, { id: 5, name: '秋田県' }, { id: 6, name: '山形県' },
  { id: 7, name: '福島県' }, { id: 8, name: '茨城県' }, { id: 9, name: '栃木県' },
  { id: 10, name: '群馬県' }, { id: 11, name: '埼玉県' }, { id: 12, name: '千葉県' },
  { id: 13, name: '東京都' }, { id: 14, name: '神奈川県' }, { id: 15, name: '新潟県' },
  { id: 16, name: '富山県' }, { id: 17, name: '石川県' }, { id: 18, name: '福井県' },
  { id: 19, name: '山梨県' }, { id: 20, name: '長野県' }, { id: 21, name: '岐阜県' },
  { id: 22, name: '静岡県' }, { id: 23, name: '愛知県' }, { id: 24, name: '三重県' },
  { id: 25, name: '滋賀県' }, { id: 26, name: '京都府' }, { id: 27, name: '大阪府' },
  { id: 28, name: '兵庫県' }, { id: 29, name: '奈良県' }, { id: 30, name: '和歌山県' },
  { id: 31, name: '鳥取県' }, { id: 32, name: '島根県' }, { id: 33, name: '岡山県' },
  { id: 34, name: '広島県' }, { id: 35, name: '山口県' }, { id: 36, name: '徳島県' },
  { id: 37, name: '香川県' }, { id: 38, name: '愛媛県' }, { id: 39, name: '高知県' },
  { id: 40, name: '福岡県' }, { id: 41, name: '佐賀県' }, { id: 42, name: '長崎県' },
  { id: 43, name: '熊本県' }, { id: 44, name: '大分県' }, { id: 45, name: '宮崎県' },
  { id: 46, name: '鹿児島県' }, { id: 47, name: '沖縄県' },
  { id: 48, name: '全国' }, { id: 49, name: 'その他' },
];

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
          `Smart-Hojokin request error: ${response.status} ${response.statusText}`
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

  throw lastError ?? new Error('Smart-Hojokin: unknown error');
}

function prefectureNameToId(name: string): number | undefined {
  return PREFECTURES.find((p) => p.name === name)?.id;
}

// ============================================================
// 都道府県一覧取得
// ============================================================

/**
 * 都道府県一覧を取得
 *
 * スマート補助金のマスタデータに基づく47都道府県 + 全国 + その他。
 *
 * @returns 都道府県一覧
 *
 * @example
 * ```ts
 * const prefectures = getPrefectures();
 * // [{ id: 1, name: '北海道' }, { id: 2, name: '青森県' }, ...]
 * ```
 */
export function getPrefectures(): SmartHojokinPrefecture[] {
  return [...PREFECTURES];
}

// ============================================================
// 市区町村一覧取得 (GET /api/v1/public/areas)
// ============================================================

/**
 * 指定都道府県の市区町村一覧を取得
 *
 * 内部API `/api/v1/public/areas` を利用。
 * 都道府県を選択した際に市区町村のドロップダウンを動的に生成するために使用。
 *
 * @param prefectureId - 都道府県ID (1-47)
 * @returns 市区町村一覧
 *
 * @example
 * ```ts
 * // 埼玉県（ID: 11）の市区町村を取得
 * const areas = await getAreasByPrefecture(11);
 * // [{ id: 101, name: 'さいたま市', prefecture_id: 11 }, ...]
 * ```
 */
export async function getAreasByPrefecture(
  prefectureId: number
): Promise<SmartHojokinArea[]> {
  if (prefectureId < 1 || prefectureId > 47) {
    throw new Error('prefectureId は 1〜47 の範囲で指定してください');
  }

  const url = `${config.baseUrl}${config.areasApiPath}?prefecture_id=${prefectureId}`;
  const response = await fetchWithRetry<AreasResponse>(url);
  return response.areas;
}

// ============================================================
// 補助金検索（Webスクレイピング）
// ============================================================

/**
 * 補助金を検索
 *
 * スマート補助金のWebページをスクレイピングして補助金情報を取得。
 * 都道府県・分類・キーワード等で絞り込み可能。
 *
 * URL パターン:
 *   - 都道府県別: /subsidy/prefectures/{prefectureId}
 *   - 分類別: /subsidy/prefectures/{prefectureId}/classifies/{classifyId}
 *   - 地域別: /subsidy/prefectures/{prefectureId}/areas/{areaId}
 *
 * @param params - 検索パラメータ
 * @returns 検索結果（補助金一覧）
 *
 * @example
 * ```ts
 * // 埼玉県の補助金を検索
 * const result = await searchSubsidies({ prefectureId: 11 });
 *
 * // 東京都の助成金のみ
 * const result = await searchSubsidies({ prefectureId: 13, classifyId: 2 });
 *
 * // キーワード検索
 * const result = await searchSubsidies({ keyword: 'IT導入' });
 * ```
 */
export async function searchSubsidies(
  params: SmartHojokinSearchParams
): Promise<SmartHojokinSearchResult> {
  let url: string;

  if (params.prefectureId && params.classifyId) {
    url = `${config.baseUrl}/subsidy/prefectures/${params.prefectureId}/classifies/${params.classifyId}`;
  } else if (params.prefectureId && params.areaId) {
    url = `${config.baseUrl}/subsidy/prefectures/${params.prefectureId}/areas/${params.areaId}`;
  } else if (params.prefectureId) {
    url = `${config.baseUrl}/subsidy/prefectures/${params.prefectureId}`;
  } else {
    url = `${config.baseUrl}/subsidy/prefectures/48`; // 全国
  }

  if (params.page && params.page > 1) {
    url += `?page=${params.page}`;
  }

  const html = await fetchWithRetry<string>(url, { parseAs: 'text' });

  // HTMLからデータを抽出（実運用ではCheerio等を使用）
  return parseSearchResultsHtml(html, params);
}

/**
 * HTMLから補助金一覧を抽出
 * 注: 実運用では cheerio や JSDOM でパースする
 */
function parseSearchResultsHtml(
  html: string,
  params: SmartHojokinSearchParams
): SmartHojokinSearchResult {
  // デモ実装: 実際のHTMLパーサーに置き換えること
  // ここでは構造のみ定義し、実運用でCheerio等を導入
  const items: SmartHojokinSubsidySummary[] = [];

  // TODO: 実運用実装
  // const $ = cheerio.load(html);
  // $('.subsidy-card').each((_, el) => {
  //   items.push({
  //     id: $(el).attr('data-id') || '',
  //     title: $(el).find('.title').text(),
  //     description: $(el).find('.description').text(),
  //     prefecture: getPrefectureName(params.prefectureId),
  //     ...
  //   });
  // });

  return {
    totalCount: 0,
    currentPage: params.page || 1,
    totalPages: 0,
    items,
  };
}

// ============================================================
// 補助金詳細取得
// ============================================================

/**
 * 補助金の詳細情報を取得
 *
 * 個別の補助金詳細ページをスクレイピングして情報を取得。
 *
 * @param subsidyId - 補助金ID（サイト内ID）
 * @returns 補助金詳細情報
 *
 * @example
 * ```ts
 * const detail = await getSubsidyDetail('12345');
 * console.log(detail.title);          // 補助金名
 * console.log(detail.maxAmount);      // 上限額
 * console.log(detail.subsidyRate);    // 補助率
 * ```
 */
export async function getSubsidyDetail(
  subsidyId: string
): Promise<SmartHojokinSubsidyDetail | null> {
  const url = `${config.baseUrl}/subsidy/${encodeURIComponent(subsidyId)}`;

  try {
    const html = await fetchWithRetry<string>(url, { parseAs: 'text' });
    return parseSubsidyDetailHtml(html, subsidyId);
  } catch {
    return null;
  }
}

/**
 * HTMLから補助金詳細を抽出
 * 注: 実運用では cheerio や JSDOM でパースする
 */
function parseSubsidyDetailHtml(
  html: string,
  subsidyId: string
): SmartHojokinSubsidyDetail {
  // デモ実装: 実運用ではHTMLパーサーに置き換え
  return {
    id: subsidyId,
    title: '',
    description: '',
    prefecture: '',
    classify: '補助金',
    status: '不明',
    detailUrl: `${config.baseUrl}/subsidy/${subsidyId}`,
    targetIndustries: [],
    eligibility: '',
    purposes: [],
  };
}

// ============================================================
// 顧問先マッチング機能
// ============================================================

/**
 * 顧問先プロフィールに基づいて最適な補助金を検索・マッチング
 *
 * 業種 x 地域 x 規模でフィルタリングし、マッチングスコアを計算。
 * 税理士が顧問先に補助金を提案する際のワークフローを想定。
 *
 * @param profile - 顧問先のプロフィール情報
 * @returns マッチングスコア付きの補助金リスト
 *
 * @example
 * ```ts
 * const matches = await findSubsidiesForClient({
 *   prefecture: '埼玉県',
 *   industry: '製造業',
 *   employeeCount: 30,
 *   purposes: ['設備投資', 'IT導入'],
 *   keywords: ['生産性向上'],
 * });
 *
 * for (const match of matches.slice(0, 5)) {
 *   console.log(`[${match.matchScore}点] ${match.subsidy.title}`);
 *   console.log(`  理由: ${match.matchReasons.join(', ')}`);
 * }
 * ```
 */
export async function findSubsidiesForClient(
  profile: SmartHojokinClientProfile
): Promise<SmartHojokinMatchResult[]> {
  const prefectureId = prefectureNameToId(profile.prefecture);
  if (!prefectureId) {
    throw new Error(`都道府県名が不正です: ${profile.prefecture}`);
  }

  // 3種類の分類で並列検索
  const classifyIds: SubsidyClassifyId[] = [1, 2, 3];
  const searchPromises = classifyIds.map((classifyId) =>
    searchSubsidies({
      prefectureId,
      classifyId,
    }).catch(() => null)
  );

  const responses = await Promise.all(searchPromises);
  const allItems: SmartHojokinSubsidySummary[] = [];
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

  // マッチングスコア計算
  return allItems
    .map((subsidy) => calculateMatchScore(subsidy, profile))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * マッチングスコアを計算
 */
function calculateMatchScore(
  subsidy: SmartHojokinSubsidySummary,
  profile: SmartHojokinClientProfile
): SmartHojokinMatchResult {
  let score = 40; // 基本スコア（同一都道府県の時点で40点）
  const reasons: string[] = [];

  // 地域マッチ (+20)
  if (subsidy.prefecture === profile.prefecture) {
    score += 20;
    reasons.push(`対象地域: ${profile.prefecture}`);
  }

  // 募集中ボーナス (+15)
  if (subsidy.status === '募集中') {
    score += 15;
    reasons.push('現在募集中');
  }

  // キーワードマッチ (+10 per keyword, max +20)
  if (profile.keywords) {
    let keywordBonus = 0;
    for (const kw of profile.keywords) {
      if (
        subsidy.title.includes(kw) ||
        subsidy.description.includes(kw)
      ) {
        keywordBonus += 10;
        reasons.push(`キーワード一致: ${kw}`);
      }
    }
    score += Math.min(keywordBonus, 20);
  }

  // 利用目的マッチ (+5 per purpose, max +15)
  // 注: 詳細情報取得後に精密マッチング可能
  let purposeBonus = 0;
  for (const purpose of profile.purposes) {
    if (subsidy.title.includes(purpose) || subsidy.description.includes(purpose)) {
      purposeBonus += 5;
      reasons.push(`利用目的一致: ${purpose}`);
    }
  }
  score += Math.min(purposeBonus, 15);

  return {
    subsidy,
    matchScore: Math.min(score, 100),
    matchReasons: reasons,
    source: 'smart-hojokin',
  };
}

// ============================================================
// ヘルスチェック
// ============================================================

/**
 * スマート補助金サイトの疎通確認
 *
 * @returns 疎通確認結果
 */
export async function healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    // 内部APIで疎通確認（軽量）
    await getAreasByPrefecture(13); // 東京都
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
