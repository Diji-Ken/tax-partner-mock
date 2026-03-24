/**
 * ミラサポplus 型定義
 *
 * 公式: https://mirasapo-plus.go.jp/
 * 運営: 経済産業省 中小企業庁
 *
 * ミラサポplusは公開REST APIを提供していない。
 * データ取得手段:
 *   1. RSSフィード（WordPress標準、カテゴリ別4種類）
 *   2. jGrants API連携（補助金の詳細検索はjGrantsで実施）
 *   3. Webスクレイピング（補助金ページの構造化データ抽出）
 *
 * WordPress REST API (wp-json) は存在するが、
 * 外部からの利用は想定されていないため使用しない。
 */

// ============================================================
// RSSフィード構造
// ============================================================

/**
 * RSSフィードアイテム（WordPress RSS 2.0準拠）
 *
 * フィードURL例: https://mirasapo-plus.go.jp/category/infomation/subsidy/feed/
 *
 * 拡張namespace:
 *   - content: (RSS Content Module)
 *   - wfw: (Well Formed Web)
 *   - dc: (Dublin Core)
 *   - atom: (Atom Protocol)
 *   - sy: (Syndication)
 *   - slash: (Slash Module)
 */
export interface MirasapoRssItem {
  /** 記事タイトル */
  title: string;
  /** 記事URL（パターン: /infomation/{5桁ID}/） */
  link: string;
  /** コメントURL */
  commentsUrl: string | null;
  /** 投稿者（"ミラサポplus運営事務局"） */
  creator: string;
  /** 公開日時 (RFC 2822) */
  pubDate: string;
  /**
   * カテゴリタグ（複数可）
   *
   * 主要カテゴリ:
   * - "お知らせ"
   * - "補助金・助成金"
   * - "イベント"
   * - "災害支援"
   *
   * サブカテゴリ（補助金系）:
   * - "持続化補助金"
   * - "省力化投資補助金" / "省力化補助金"
   * - "ものづくり補助金"
   * - "デジタル化・AI導入補助金"
   * - "IT導入補助金"
   * - "新事業進出補助金"
   * - "成長加速化補助金"
   * - "事業承継・M&A補助金"
   *
   * 横断カテゴリ:
   * - "賃上げ"
   * - "設備投資"
   * - "販路開拓"
   * - "資金繰り"
   * - "金融・税制"
   * - "相談・情報提供"
   * - "商店街・まちづくり"
   */
  categories: string[];
  /** 記事の永続的識別子 */
  guid: string;
  /** 概要テキスト（末尾 "[...]" で省略） */
  description: string;
  /** 記事全文（HTML形式） */
  contentEncoded: string;
  /** コメント数 */
  commentCount: number;
}

/** RSSフィードチャンネル情報 */
export interface MirasapoRssFeed {
  /** チャンネルタイトル */
  title: string;
  /** サイトURL */
  link: string;
  /** 説明 */
  description: string;
  /** 言語 ("ja") */
  language: string;
  /** 最終ビルド日時 */
  lastBuildDate: string;
  /** 記事一覧 */
  items: MirasapoRssItem[];
}

// ============================================================
// RSSフィード種別
// ============================================================

/**
 * 利用可能なRSSフィード
 *
 * URLパターン: https://mirasapo-plus.go.jp/category/{category}/feed/
 */
export type MirasapoFeedType = 'all' | 'subsidy' | 'event' | 'disaster';

/** フィードURLマッピング */
export const FEED_URLS: Record<MirasapoFeedType, string> = {
  /** お知らせ（全カテゴリ） */
  all: 'https://mirasapo-plus.go.jp/category/infomation/feed/',
  /** 補助金・助成金 */
  subsidy: 'https://mirasapo-plus.go.jp/category/infomation/subsidy/feed/',
  /** イベント */
  event: 'https://mirasapo-plus.go.jp/category/infomation/event/feed/',
  /** 災害支援 */
  disaster: 'https://mirasapo-plus.go.jp/category/infomation/disaster/feed/',
};

// ============================================================
// 構造化データ
// ============================================================

/** 補助金ページ情報（Webスクレイピング用） */
export interface SubsidyPageInfo {
  /** 補助金名称 */
  name: string;
  /** ページURL */
  url: string;
  /** URLスラッグ */
  slug: string;
  /** 公募要領公開日 */
  guidelinesDate: string | null;
  /** 申請受付期間 */
  applicationPeriod: string | null;
  /** 概要説明 */
  description: string | null;
  /** jGrantsポータルへのリンク */
  jgrantsUrl: string | null;
}

/**
 * ミラサポplus 主要補助金一覧
 *
 * ミラサポplusで特集されている主要補助金のURLスラッグとjGrants連携情報。
 * /subsidy/{slug}/ のパターンでアクセス可能。
 */
export const MAJOR_SUBSIDIES: SubsidyPageInfo[] = [
  {
    name: '省力化投資補助金',
    url: 'https://mirasapo-plus.go.jp/subsidy/shoryokuka/',
    slug: 'shoryokuka',
    guidelinesDate: null,
    applicationPeriod: null,
    description: '人手不足に悩む中小企業等に対して、IoT、ロボット等の効果的な汎用製品の導入を支援',
    jgrantsUrl: 'https://www.jgrants-portal.go.jp/',
  },
  {
    name: 'ものづくり・商業・サービス生産性向上促進補助金',
    url: 'https://mirasapo-plus.go.jp/subsidy/monodukuri/',
    slug: 'monodukuri',
    guidelinesDate: null,
    applicationPeriod: null,
    description: '革新的サービス開発・試作品開発・生産プロセスの改善を行うための設備投資等を支援',
    jgrantsUrl: 'https://www.jgrants-portal.go.jp/',
  },
  {
    name: '小規模事業者持続化補助金',
    url: 'https://mirasapo-plus.go.jp/subsidy/jizokuka/',
    slug: 'jizokuka',
    guidelinesDate: null,
    applicationPeriod: null,
    description: '小規模事業者が経営計画を策定して取り組む販路開拓等を支援',
    jgrantsUrl: 'https://www.jgrants-portal.go.jp/',
  },
  {
    name: 'IT導入補助金',
    url: 'https://mirasapo-plus.go.jp/subsidy/it-hojo/',
    slug: 'it-hojo',
    guidelinesDate: null,
    applicationPeriod: null,
    description: 'ITツールの導入に活用できる補助金。通常枠、セキュリティ対策推進枠等',
    jgrantsUrl: 'https://www.jgrants-portal.go.jp/',
  },
  {
    name: '新事業進出補助金',
    url: 'https://mirasapo-plus.go.jp/subsidy/shinjigyou/',
    slug: 'shinjigyou',
    guidelinesDate: null,
    applicationPeriod: null,
    description: '新たな事業分野への進出等のための新たな取組を支援',
    jgrantsUrl: 'https://www.jgrants-portal.go.jp/',
  },
  {
    name: '中小企業成長加速化補助金',
    url: 'https://mirasapo-plus.go.jp/subsidy/seichokasokuka/',
    slug: 'seichokasokuka',
    guidelinesDate: null,
    applicationPeriod: null,
    description: '売上100億円を目指す中小企業の成長を加速化するための取組を支援',
    jgrantsUrl: 'https://www.jgrants-portal.go.jp/',
  },
  {
    name: '事業承継・M&A補助金',
    url: 'https://mirasapo-plus.go.jp/subsidy/jigyoshokei/',
    slug: 'jigyoshokei',
    guidelinesDate: null,
    applicationPeriod: null,
    description: '事業承継・M&Aを契機とした新たな取組を支援',
    jgrantsUrl: 'https://www.jgrants-portal.go.jp/',
  },
];

// ============================================================
// ミラサポplus 他機能URL
// ============================================================

/** ミラサポplusの主要ページURL */
export const MIRASAPO_URLS = {
  /** トップ */
  top: 'https://mirasapo-plus.go.jp/',
  /** 補助金一覧 */
  subsidies: 'https://mirasapo-plus.go.jp/subsidy/',
  /** 支援者を探す */
  supporter: 'https://mirasapo-plus.go.jp/supporter/',
  /** 事例を探す */
  caseStudies: 'https://mirasapo-plus.go.jp/jirei-navi',
  /** 経営のヒント */
  hints: 'https://mirasapo-plus.go.jp/category/hint/',
  /** 経営診断（ローカルベンチマーク） */
  benchmarking: 'https://mirasapo-plus.go.jp/report/top',
  /** 財務分析 */
  finance: 'https://mirasapo-plus.go.jp/biz/finance/menu',
  /** ログイン */
  login: 'https://mirasapo-plus.go.jp/login/',
  /** ヘルプ */
  help: 'https://mirasapo-plus.go.jp/help/',
  /** RSSフィード一覧 */
  rssFeeds: 'https://mirasapo-plus.go.jp/rss_feed/',
} as const;

// ============================================================
// 統合型
// ============================================================

/** ミラサポ支援情報（統一フォーマット） */
export interface MirasapoSupportInfo {
  /** 記事タイトル */
  title: string;
  /** 記事URL */
  url: string;
  /** 概要 */
  description: string;
  /** カテゴリ一覧 */
  categories: string[];
  /** 主要カテゴリ */
  primaryCategory: 'subsidy' | 'event' | 'disaster' | 'other';
  /** 公開日時 (ISO 8601) */
  publishDate: string;
  /** 投稿者 */
  author: string;
  /** jGrants連携URL（あれば） */
  jgrantsUrl: string | null;
  /** データソース */
  source: 'rss' | 'web';
}

/** ミラサポ検索結果 */
export interface MirasapoSearchResult {
  /** 検索結果一覧 */
  items: MirasapoSupportInfo[];
  /** 総件数 */
  totalCount: number;
  /** データ取得日時 */
  fetchedAt: string;
  /** データソース */
  source: string;
}
