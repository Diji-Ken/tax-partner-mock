/**
 * J-Net21 支援情報ヘッドライン クライアント
 *
 * データソース:
 *   - RSS 2.0フィード（3種類: support, event, public）
 *   - Webスクレイピング（検索ページ）
 *
 * 公式: https://j-net21.smrj.go.jp/
 * 支援情報ヘッドライン: https://j-net21.smrj.go.jp/snavi2/
 * 運営: 独立行政法人 中小企業基盤整備機構 (SMRJ)
 *
 * 注意: J-Net21は公開APIを提供していない。
 *       RSSフィード（公式提供）を主たるデータソースとし、
 *       Webスクレイピングは補助的に使用する。
 *
 * 参考実装: https://github.com/code4fukui/JNet21 (Deno版CSVエクスポート)
 * 参考記事: https://fukuno.jig.jp/3388
 */

import type {
  JNet21RssFeed,
  JNet21RssItem,
  JNet21Coverage,
  JNet21SearchParams,
  SupportInfo,
  SupportInfoSearchResult,
  JNet21Category,
} from './types';
import { PREFECTURE_CODES, CATEGORY_NAMES } from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** RSSフィードのベースURL */
  rssBaseUrl: 'https://j-net21.smrj.go.jp/snavi',
  /** Web検索のベースURL */
  webBaseUrl: 'https://j-net21.smrj.go.jp/snavi/articles',
  /** レガシー支援情報ページ（スクレイピング用） */
  legacyUrl: 'https://j-net21.smrj.go.jp/snavi2/',
  /** リクエストタイムアウト (ms) */
  timeout: 15_000,
  /** RSSフィードのキャッシュ有効時間 (ms) - 30分 */
  cacheTtlMs: 30 * 60 * 1000,
  /** User-Agent */
  userAgent: 'TaxPartnerCRM/1.0 (Support Info Aggregator)',
};

/**
 * RSSフィードの種別と対応URL
 *
 * RSS 2.0形式（拡張namespace: rdf, dc, grant）
 * 各フィードは約20〜60件のアイテムを含む
 */
const RSS_FEEDS = {
  /** 補助金・助成金・融資 */
  support: `${config.rssBaseUrl}/support/support.xml`,
  /** セミナー・イベント */
  event: `${config.rssBaseUrl}/event/event.xml`,
  /** その他の支援情報 */
  public: `${config.rssBaseUrl}/public/public.xml`,
} as const;

type FeedType = keyof typeof RSS_FEEDS;

// ============================================================
// キャッシュ
// ============================================================

interface CacheEntry {
  data: JNet21RssFeed;
  timestamp: number;
}

const feedCache = new Map<string, CacheEntry>();

function getCachedFeed(url: string): JNet21RssFeed | null {
  const entry = feedCache.get(url);
  if (entry && Date.now() - entry.timestamp < config.cacheTtlMs) {
    return entry.data;
  }
  return null;
}

function setCachedFeed(url: string, data: JNet21RssFeed): void {
  feedCache.set(url, { data, timestamp: Date.now() });
}

/** キャッシュをクリア */
export function clearCache(): void {
  feedCache.clear();
}

// ============================================================
// RSS フィード取得・パース
// ============================================================

/**
 * RSSフィードを取得してパース
 *
 * J-Net21のRSSフィードはRSS 2.0形式（XMLベース）。
 * パースには正規表現ベースの軽量パーサーを使用
 * （DOMParser不要でNode.js/エッジランタイム互換）。
 *
 * @param feedType - フィード種別 (support | event | public)
 * @returns パース済みフィードデータ
 */
export async function fetchRssFeed(feedType: FeedType): Promise<JNet21RssFeed> {
  const url = RSS_FEEDS[feedType];

  // キャッシュチェック
  const cached = getCachedFeed(url);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'User-Agent': config.userAgent,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`J-Net21 RSS fetch error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const feed = parseRssXml(xml, feedType);

    // キャッシュに保存
    setCachedFeed(url, feed);

    return feed;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * RSS XMLをパース（正規表現ベース）
 *
 * XML構造:
 * ```xml
 * <rss xmlns:rdf="..." xmlns:dc="..." xmlns:grant="...">
 *   <channel>
 *     <title>補助金・助成金・融資 ｜J-Net21</title>
 *     <item>
 *       <title>...</title>
 *       <link>...</link>
 *       <description><![CDATA[...]]></description>
 *       <category>support</category>
 *       <dc:creator>中小企業基盤整備機構</dc:creator>
 *       <dc:subject>補助金・助成金・融資 - 補助金・助成金</dc:subject>
 *       <dc:coverage rdf:value="JP-13" rdf:label="東京都"/>
 *       <dc:date>2026-03-23T18:30:00+09:00</dc:date>
 *     </item>
 *   </channel>
 * </rss>
 * ```
 */
function parseRssXml(xml: string, feedType: FeedType): JNet21RssFeed {
  const channelTitle = extractTag(xml, 'title') || '';
  const channelLink = extractTag(xml, 'link') || '';
  const channelDesc = extractTag(xml, 'description') || '';
  const publisher = extractTag(xml, 'dc:publisher') || '中小企業基盤整備機構';
  const lastUpdated = extractTag(xml, 'dc:date') || new Date().toISOString();

  // <item>...</item> を全て抽出
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items: JNet21RssItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push(parseRssItem(itemXml, feedType));
  }

  return {
    title: channelTitle,
    link: channelLink,
    description: channelDesc,
    publisher,
    lastUpdated,
    language: 'ja',
    items,
  };
}

function parseRssItem(itemXml: string, feedType: FeedType): JNet21RssItem {
  const title = extractTag(itemXml, 'title') || '';
  const link = extractTag(itemXml, 'link') || '';
  const description = extractCdata(itemXml, 'description') || extractTag(itemXml, 'description') || '';
  const categoryRaw = extractTag(itemXml, 'category') || feedType;
  const creator = extractTag(itemXml, 'dc:creator') || '中小企業基盤整備機構';
  const subject = extractTag(itemXml, 'dc:subject') || '';
  const date = extractTag(itemXml, 'dc:date') || '';
  const coverage = extractCoverage(itemXml);

  const category = (['support', 'event', 'public'].includes(categoryRaw)
    ? categoryRaw
    : feedType) as 'support' | 'event' | 'public';

  return { title, link, description, category, creator, subject, coverage, date };
}

// ============================================================
// XML パーサーヘルパー
// ============================================================

function extractTag(xml: string, tag: string): string | null {
  // ネストしたタグを回避するため、最初のマッチのみ
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

function extractCdata(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

function extractCoverage(xml: string): JNet21Coverage | null {
  // <dc:coverage rdf:value="JP-13" rdf:label="東京都"/>
  // or <dc:coverage><rdf:value>JP-13</rdf:value><rdf:label>東京都</rdf:label></dc:coverage>
  const attrRegex = /dc:coverage[^>]*rdf:value="([^"]*)"[^>]*rdf:label="([^"]*)"/i;
  const attrMatch = attrRegex.exec(xml);
  if (attrMatch) {
    return { code: attrMatch[1], label: attrMatch[2] };
  }

  // 逆順の属性パターンにも対応
  const attrRegex2 = /dc:coverage[^>]*rdf:label="([^"]*)"[^>]*rdf:value="([^"]*)"/i;
  const attrMatch2 = attrRegex2.exec(xml);
  if (attrMatch2) {
    return { code: attrMatch2[2], label: attrMatch2[1] };
  }

  return null;
}

// ============================================================
// 統合検索機能
// ============================================================

/**
 * 全RSSフィードを統合して支援情報を検索
 *
 * 3つのRSSフィード（support, event, public）を並列取得し、
 * フィルター条件に基づいて絞り込む。
 *
 * @param params - 検索パラメータ
 * @returns 検索結果
 *
 * @example
 * ```ts
 * // 東京都の補助金・助成金を検索
 * const result = await searchSupportInfo({
 *   category: [1],
 *   prefecture: ['13'],
 *   keyword: 'DX',
 * });
 * ```
 */
export async function searchSupportInfo(
  params: JNet21SearchParams = {}
): Promise<SupportInfoSearchResult> {
  // 対象フィードを決定
  const feedTypes = determineFeedTypes(params.category);

  // 並列でフィード取得
  const feeds = await Promise.all(
    feedTypes.map((type) => fetchRssFeed(type).catch(() => null))
  );

  // フィード→SupportInfo変換
  let allItems: SupportInfo[] = [];
  for (const feed of feeds) {
    if (feed) {
      allItems.push(...feed.items.map(rssItemToSupportInfo));
    }
  }

  // フィルタリング
  allItems = filterItems(allItems, params);

  // ソート
  if (params.order === 'ASC') {
    allItems.sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  } else {
    allItems.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  }

  // ページネーション
  const perPage = params.perPage || 20;
  const page = params.page || 1;
  const startIndex = (page - 1) * perPage;
  const pagedItems = allItems.slice(startIndex, startIndex + perPage);

  return {
    items: pagedItems,
    totalCount: allItems.length,
    currentPage: page,
    fetchedAt: new Date().toISOString(),
    source: 'J-Net21 RSS Feeds',
  };
}

/**
 * カテゴリに基づいてフィード種別を決定
 */
function determineFeedTypes(categories?: JNet21Category[]): FeedType[] {
  if (!categories || categories.length === 0) {
    return ['support', 'event', 'public'];
  }

  const types: FeedType[] = [];
  if (categories.includes(1)) types.push('support');
  if (categories.includes(2)) types.push('event');
  if (categories.includes(3)) types.push('public');
  return types.length > 0 ? types : ['support', 'event', 'public'];
}

/**
 * RSSアイテムを統一フォーマットに変換
 */
function rssItemToSupportInfo(item: JNet21RssItem): SupportInfo {
  // dc:subject から カテゴリ / サブカテゴリを分離
  const [cat, subCat] = item.subject.split(' - ').map((s) => s.trim());

  // description からデッドラインを抽出（パターンマッチ）
  const deadline = extractDeadline(item.description);

  return {
    title: item.title,
    url: item.link,
    description: stripHtml(item.description),
    category: cat || CATEGORY_NAMES[categoryToNumber(item.category)],
    subCategory: subCat || '',
    region: item.coverage?.label || null,
    prefectureCode: item.coverage?.code || null,
    publishDate: item.date,
    deadline,
    organization: item.creator,
    source: `rss_${item.category}` as SupportInfo['source'],
  };
}

/**
 * フィルタリング
 */
function filterItems(items: SupportInfo[], params: JNet21SearchParams): SupportInfo[] {
  let filtered = items;

  // 都道府県フィルター
  if (params.prefecture && params.prefecture.length > 0) {
    const targetCodes = new Set(
      params.prefecture.map((code) => `JP-${code.padStart(2, '0')}`)
    );
    // "00" (全国) が含まれる場合はフィルターしない
    if (!params.prefecture.includes('00')) {
      filtered = filtered.filter(
        (item) => !item.prefectureCode || targetCodes.has(item.prefectureCode)
      );
    }
  }

  // キーワードフィルター
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
    );
  }

  return filtered;
}

// ============================================================
// カテゴリ別取得（便利関数）
// ============================================================

/**
 * 補助金・助成金・融資の新着情報を取得
 *
 * @returns 補助金・助成金・融資の支援情報一覧
 */
export async function fetchSubsidies(): Promise<SupportInfo[]> {
  const feed = await fetchRssFeed('support');
  return feed.items.map(rssItemToSupportInfo);
}

/**
 * セミナー・イベントの新着情報を取得
 *
 * @returns セミナー・イベントの支援情報一覧
 */
export async function fetchEvents(): Promise<SupportInfo[]> {
  const feed = await fetchRssFeed('event');
  return feed.items.map(rssItemToSupportInfo);
}

/**
 * その他の支援情報の新着情報を取得
 *
 * @returns その他の支援情報一覧
 */
export async function fetchOtherSupport(): Promise<SupportInfo[]> {
  const feed = await fetchRssFeed('public');
  return feed.items.map(rssItemToSupportInfo);
}

/**
 * 指定都道府県の支援情報をすべて取得
 *
 * @param prefectureCode - JIS都道府県コード (例: "13" = 東京都)
 * @returns 該当都道府県の支援情報
 *
 * @example
 * ```ts
 * const saitamaSupport = await fetchByPrefecture('11'); // 埼玉県
 * ```
 */
export async function fetchByPrefecture(prefectureCode: string): Promise<SupportInfo[]> {
  const result = await searchSupportInfo({
    prefecture: [prefectureCode],
  });
  return result.items;
}

// ============================================================
// ユーティリティ
// ============================================================

function categoryToNumber(cat: string): JNet21Category {
  switch (cat) {
    case 'support': return 1;
    case 'event': return 2;
    case 'public': return 3;
    default: return 1;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 説明文から申請期限を抽出
 * パターン: "令和X年X月X日まで", "20XX年XX月XX日", "XX/XX/XXXX" 等
 */
function extractDeadline(description: string): string | null {
  // 西暦パターン: 2026年3月31日
  const westernMatch = description.match(/(\d{4})[年/\-](\d{1,2})[月/\-](\d{1,2})[日]?\s*(?:まで|締[切め]|必着)/);
  if (westernMatch) {
    const [, year, month, day] = westernMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // 令和パターン: 令和8年3月31日
  const reiwMatch = description.match(/令和(\d{1,2})[年](\d{1,2})[月](\d{1,2})[日]/);
  if (reiwMatch) {
    const [, reiwaYear, month, day] = reiwMatch;
    const year = 2018 + parseInt(reiwaYear, 10);
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
}

/**
 * ヘルスチェック
 * supportフィードの取得を試みて疎通確認
 */
export async function healthCheck(): Promise<{ ok: boolean; latencyMs: number; itemCount: number }> {
  const start = Date.now();
  try {
    const feed = await fetchRssFeed('support');
    return {
      ok: true,
      latencyMs: Date.now() - start,
      itemCount: feed.items.length,
    };
  } catch {
    return { ok: false, latencyMs: Date.now() - start, itemCount: 0 };
  }
}
