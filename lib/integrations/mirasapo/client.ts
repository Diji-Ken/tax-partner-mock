/**
 * ミラサポplus クライアント（経済産業省 / 中小企業庁）
 *
 * 公式: https://mirasapo-plus.go.jp/
 * RSSフィード: https://mirasapo-plus.go.jp/rss_feed/
 * 運営: 経済産業省 中小企業庁
 *
 * ミラサポplusは公開REST APIを提供していない。
 * データ取得手段:
 *   1. RSSフィード（WordPress RSS 2.0、カテゴリ別4種類）← 主要データソース
 *   2. jGrants APIとの連携（補助金の詳細検索・申請はjGrantsで実施）
 *   3. 補助金ページのスクレイピング（補助的利用）
 *
 * jGrantsとの関係:
 *   ミラサポplusは「補助金の情報ポータル」、jGrantsは「補助金の電子申請システム」。
 *   ミラサポplusの補助金ページからjGrantsポータルへのリンクが設置されている。
 *   詳細な補助金検索にはjGrants APIを使用することを推奨。
 */

import type {
  MirasapoRssFeed,
  MirasapoRssItem,
  MirasapoFeedType,
  MirasapoSupportInfo,
  MirasapoSearchResult,
  SubsidyPageInfo,
} from './types';
import { FEED_URLS, MAJOR_SUBSIDIES, MIRASAPO_URLS } from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** リクエストタイムアウト (ms) */
  timeout: 15_000,
  /** RSSフィードのキャッシュ有効時間 (ms) - 1時間 */
  cacheTtlMs: 60 * 60 * 1000,
  /** User-Agent */
  userAgent: 'TaxPartnerCRM/1.0 (Subsidy Info Aggregator)',
};

// ============================================================
// キャッシュ
// ============================================================

interface CacheEntry {
  data: MirasapoRssFeed;
  timestamp: number;
}

const feedCache = new Map<string, CacheEntry>();

function getCached(url: string): MirasapoRssFeed | null {
  const entry = feedCache.get(url);
  if (entry && Date.now() - entry.timestamp < config.cacheTtlMs) {
    return entry.data;
  }
  return null;
}

function setCache(url: string, data: MirasapoRssFeed): void {
  feedCache.set(url, { data, timestamp: Date.now() });
}

/** キャッシュをクリア */
export function clearCache(): void {
  feedCache.clear();
}

// ============================================================
// RSSフィード取得・パース
// ============================================================

/**
 * RSSフィードを取得してパース
 *
 * ミラサポplusのRSSフィードはWordPress標準のRSS 2.0形式。
 * 1フィードあたり約20件のアイテムを含む。
 *
 * @param feedType - フィード種別
 * @returns パース済みフィードデータ
 *
 * @example
 * ```ts
 * const feed = await fetchRssFeed('subsidy');
 * for (const item of feed.items) {
 *   console.log(`${item.title} (${item.pubDate})`);
 *   console.log(`カテゴリ: ${item.categories.join(', ')}`);
 * }
 * ```
 */
export async function fetchRssFeed(
  feedType: MirasapoFeedType = 'subsidy'
): Promise<MirasapoRssFeed> {
  const url = FEED_URLS[feedType];

  // キャッシュチェック
  const cached = getCached(url);
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
      throw new Error(
        `ミラサポplus RSS fetch error: ${response.status} ${response.statusText}`
      );
    }

    const xml = await response.text();
    const feed = parseRssXml(xml);

    // キャッシュに保存
    setCache(url, feed);

    return feed;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * RSS XMLをパース
 *
 * WordPress RSS 2.0 構造:
 * ```xml
 * <rss xmlns:content="..." xmlns:dc="..." xmlns:atom="...">
 *   <channel>
 *     <item>
 *       <title>...</title>
 *       <link>...</link>
 *       <dc:creator>ミラサポplus運営事務局</dc:creator>
 *       <pubDate>Tue, 17 Mar 2026 ...</pubDate>
 *       <category>補助金・助成金</category>
 *       <category>持続化補助金</category>
 *       <description>...</description>
 *       <content:encoded><![CDATA[...]]></content:encoded>
 *     </item>
 *   </channel>
 * </rss>
 * ```
 */
function parseRssXml(xml: string): MirasapoRssFeed {
  const title = extractTag(xml, 'title') || 'ミラサポplus';
  const link = extractTag(xml, 'link') || 'https://mirasapo-plus.go.jp/';
  const description = extractTag(xml, 'description') || '';
  const language = extractTag(xml, 'language') || 'ja';
  const lastBuildDate = extractTag(xml, 'lastBuildDate') || '';

  // <item>...</item> を全て抽出
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items: MirasapoRssItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    items.push(parseRssItem(match[1]));
  }

  return { title, link, description, language, lastBuildDate, items };
}

function parseRssItem(itemXml: string): MirasapoRssItem {
  const title = extractTag(itemXml, 'title') || '';
  const link = extractTag(itemXml, 'link') || '';
  const commentsUrl = extractTag(itemXml, 'comments') || null;
  const creator = extractTag(itemXml, 'dc:creator') || 'ミラサポplus運営事務局';
  const pubDate = extractTag(itemXml, 'pubDate') || '';
  const guid = extractTag(itemXml, 'guid') || '';
  const description = extractTag(itemXml, 'description') || '';
  const contentEncoded =
    extractCdata(itemXml, 'content:encoded') ||
    extractTag(itemXml, 'content:encoded') || '';
  const commentCountStr = extractTag(itemXml, 'slash:comments') || '0';
  const commentCount = parseInt(commentCountStr, 10) || 0;

  // 全<category>タグを抽出
  const categories = extractAllTags(itemXml, 'category');

  return {
    title,
    link,
    commentsUrl,
    creator,
    pubDate,
    categories,
    guid,
    description,
    contentEncoded,
    commentCount,
  };
}

// ============================================================
// 統合検索
// ============================================================

/**
 * 補助金・助成金の最新情報を取得
 *
 * RSSフィード（subsidyカテゴリ）から最新の補助金情報を取得。
 * キーワードフィルタリングが可能。
 *
 * @param keyword - 検索キーワード（省略時は全件）
 * @returns 検索結果
 *
 * @example
 * ```ts
 * // IT導入補助金の最新情報
 * const result = await searchSubsidyNews('IT導入');
 * ```
 */
export async function searchSubsidyNews(
  keyword?: string
): Promise<MirasapoSearchResult> {
  const feed = await fetchRssFeed('subsidy');
  let items = feed.items.map(rssItemToSupportInfo);

  if (keyword) {
    const kw = keyword.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw) ||
        item.categories.some((c) => c.toLowerCase().includes(kw))
    );
  }

  return {
    items,
    totalCount: items.length,
    fetchedAt: new Date().toISOString(),
    source: 'ミラサポplus RSS (subsidy)',
  };
}

/**
 * 全カテゴリの最新情報を横断検索
 *
 * @param keyword - 検索キーワード（省略時は全件）
 * @param feedTypes - 対象フィード種別（省略時は全種別）
 * @returns 検索結果
 *
 * @example
 * ```ts
 * // 全カテゴリから「DX」関連情報を検索
 * const result = await searchAllNews('DX');
 * ```
 */
export async function searchAllNews(
  keyword?: string,
  feedTypes?: MirasapoFeedType[]
): Promise<MirasapoSearchResult> {
  const types = feedTypes || (['all', 'subsidy', 'event', 'disaster'] as MirasapoFeedType[]);

  // 並列でフィード取得
  const feeds = await Promise.all(
    types.map((type) => fetchRssFeed(type).catch(() => null))
  );

  // 重複排除（guidベースで）
  const seenGuids = new Set<string>();
  let allItems: MirasapoSupportInfo[] = [];

  for (const feed of feeds) {
    if (!feed) continue;
    for (const item of feed.items) {
      if (!seenGuids.has(item.guid)) {
        seenGuids.add(item.guid);
        allItems.push(rssItemToSupportInfo(item));
      }
    }
  }

  // キーワードフィルター
  if (keyword) {
    const kw = keyword.toLowerCase();
    allItems = allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw) ||
        item.categories.some((c) => c.toLowerCase().includes(kw))
    );
  }

  // 日付順ソート（新しい順）
  allItems.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  return {
    items: allItems,
    totalCount: allItems.length,
    fetchedAt: new Date().toISOString(),
    source: `ミラサポplus RSS (${types.join(', ')})`,
  };
}

// ============================================================
// 主要補助金情報
// ============================================================

/**
 * ミラサポplusの主要補助金一覧を取得
 *
 * ミラサポplusで特集されている主要な中小企業向け補助金の一覧を返す。
 * これらの補助金はjGrants APIで詳細検索が可能。
 *
 * @returns 主要補助金一覧
 *
 * @example
 * ```ts
 * const subsidies = getMajorSubsidies();
 * for (const s of subsidies) {
 *   console.log(`${s.name}: ${s.url}`);
 * }
 * ```
 */
export function getMajorSubsidies(): SubsidyPageInfo[] {
  return [...MAJOR_SUBSIDIES];
}

/**
 * ミラサポplusの各種ページURLを取得
 *
 * 顧問先への情報提供用にURLを取得。
 *
 * @returns ページURL一覧
 */
export function getServiceUrls(): typeof MIRASAPO_URLS {
  return MIRASAPO_URLS;
}

// ============================================================
// jGrants連携
// ============================================================

/**
 * ミラサポplusの補助金名からjGrants検索用キーワードを生成
 *
 * ミラサポplusで見つけた補助金を、jGrants APIで詳細検索するための
 * キーワード変換を行う。
 *
 * @param subsidyTitle - ミラサポplusの補助金タイトル
 * @returns jGrants検索用キーワード
 *
 * @example
 * ```ts
 * const keyword = extractJGrantsKeyword('【公募開始】小規模事業者持続化補助金（第16回）の公募を開始しました');
 * // => "小規模事業者持続化補助金"
 * ```
 */
export function extractJGrantsKeyword(subsidyTitle: string): string {
  // 【...】を除去
  let cleaned = subsidyTitle.replace(/【[^】]*】/g, '').trim();

  // （第X回）等の回次情報を除去
  cleaned = cleaned.replace(/（第?\d+回?）/g, '').trim();

  // 「の公募を開始しました」等の動詞部分を除去
  cleaned = cleaned
    .replace(/の公募.*$/g, '')
    .replace(/を.*$/, '')
    .replace(/について.*$/, '')
    .trim();

  // 先頭・末尾の不要文字を除去
  cleaned = cleaned.replace(/^[、。\s]+|[、。\s]+$/g, '');

  return cleaned || subsidyTitle;
}

// ============================================================
// RSS→統一フォーマット変換
// ============================================================

function rssItemToSupportInfo(item: MirasapoRssItem): MirasapoSupportInfo {
  return {
    title: item.title,
    url: item.link,
    description: stripHtml(item.description),
    categories: item.categories,
    primaryCategory: categorizePrimary(item.categories),
    publishDate: parseRfc2822ToIso(item.pubDate),
    author: item.creator,
    jgrantsUrl: extractJGrantsLink(item.contentEncoded),
    source: 'rss',
  };
}

function categorizePrimary(
  categories: string[]
): 'subsidy' | 'event' | 'disaster' | 'other' {
  for (const cat of categories) {
    if (cat.includes('補助金') || cat.includes('助成金') || cat.includes('融資')) {
      return 'subsidy';
    }
    if (cat.includes('イベント') || cat.includes('セミナー')) {
      return 'event';
    }
    if (cat.includes('災害')) {
      return 'disaster';
    }
  }
  return 'other';
}

// ============================================================
// XMLパーサーヘルパー
// ============================================================

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

function extractCdata(xml: string, tag: string): string | null {
  const regex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    'i'
  );
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

function extractAllTags(xml: string, tag: string): string[] {
  const regex = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`,
    'gi'
  );
  const results: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const value = match[1].trim();
    if (value) results.push(value);
  }
  return results;
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

function parseRfc2822ToIso(rfc2822: string): string {
  try {
    return new Date(rfc2822).toISOString();
  } catch {
    return rfc2822;
  }
}

function extractJGrantsLink(html: string): string | null {
  const match = html.match(/https?:\/\/(?:www\.)?jgrants-portal\.go\.jp[^\s"']*/i);
  return match ? match[0] : null;
}

// ============================================================
// ヘルスチェック
// ============================================================

/**
 * ミラサポplus RSSフィードの疎通確認
 */
export async function healthCheck(): Promise<{
  ok: boolean;
  latencyMs: number;
  itemCount: number;
}> {
  const start = Date.now();
  try {
    const feed = await fetchRssFeed('subsidy');
    return {
      ok: true,
      latencyMs: Date.now() - start,
      itemCount: feed.items.length,
    };
  } catch {
    return { ok: false, latencyMs: Date.now() - start, itemCount: 0 };
  }
}
