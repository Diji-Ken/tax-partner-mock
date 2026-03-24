/**
 * J-Net21 支援情報ヘッドライン 型定義
 *
 * データソース:
 *   - RSS: https://j-net21.smrj.go.jp/snavi/support/support.xml (補助金・助成金・融資)
 *   - RSS: https://j-net21.smrj.go.jp/snavi/event/event.xml (セミナー・イベント)
 *   - RSS: https://j-net21.smrj.go.jp/snavi/public/public.xml (その他の支援情報)
 *   - Web: https://j-net21.smrj.go.jp/snavi/articles (検索ページ)
 *
 * 運営: 独立行政法人 中小企業基盤整備機構 (SMRJ)
 * 公式: https://j-net21.smrj.go.jp/
 *
 * 注意: 公開APIは提供されていない。RSSフィード + Webスクレイピングでデータ取得。
 */

// ============================================================
// RSS フィード構造
// ============================================================

/**
 * RSSフィードのチャンネル情報
 * フィード形式: RSS 2.0 (rdf, dc, grant namespace拡張)
 */
export interface JNet21RssFeed {
  /** チャンネルタイトル（例: "補助金・助成金・融資 ｜J-Net21"） */
  title: string;
  /** サイトURL */
  link: string;
  /** 説明 */
  description: string;
  /** 発行者（"中小企業基盤整備機構"） */
  publisher: string;
  /** 最終更新日時 (ISO 8601, 例: "2026-03-23T18:30:00+09:00") */
  lastUpdated: string;
  /** 言語 ("ja") */
  language: string;
  /** フィードアイテム一覧 */
  items: JNet21RssItem[];
}

/**
 * RSSフィードの個別アイテム
 *
 * RSS XMLの各<item>要素に対応。
 * dc:coverage で都道府県コード (JP-13 = 東京都) を含む。
 */
export interface JNet21RssItem {
  /** 支援制度名 */
  title: string;
  /** 詳細ページURL */
  link: string;
  /**
   * 説明（HTML含む）
   * 対象者、申請期限、概要等を含むCDATAセクション
   */
  description: string;
  /**
   * カテゴリ
   * "support": 補助金・助成金・融資
   * "event": セミナー・イベント
   * "public": その他
   */
  category: 'support' | 'event' | 'public';
  /** 発行者 (dc:creator, 例: "中小企業基盤整備機構") */
  creator: string;
  /**
   * 分類 (dc:subject)
   * 例: "補助金・助成金・融資 - 補助金・助成金"
   * 例: "セミナー・イベント - セミナー"
   */
  subject: string;
  /**
   * 地域情報 (dc:coverage)
   * rdf:value: ISO 3166-2:JP コード (例: "JP-13")
   * rdf:label: 都道府県名 (例: "東京都")
   */
  coverage: JNet21Coverage | null;
  /** 公開日時 (dc:date, ISO 8601) */
  date: string;
}

/** 地域情報 (dc:coverage の構造) */
export interface JNet21Coverage {
  /** ISO 3166-2:JP 都道府県コード (例: "JP-13", "JP-27") */
  code: string;
  /** 都道府県名 (例: "東京都", "大阪府") */
  label: string;
}

// ============================================================
// 検索パラメータ
// ============================================================

/**
 * Webスクレイピング用検索パラメータ
 *
 * URLパターン: https://j-net21.smrj.go.jp/snavi/articles?category[]=1&prefecture[]=13
 *
 * @see https://j-net21.smrj.go.jp/snavi2/
 */
export interface JNet21SearchParams {
  /**
   * カテゴリフィルター（配列指定可能）
   * 1: 補助金・助成金・融資
   * 2: セミナー・イベント
   * 3: その他
   */
  category?: JNet21Category[];
  /**
   * 都道府県フィルター（配列指定可能）
   * "00": 全国
   * "01"〜"47": 都道府県コード（JISコード）
   */
  prefecture?: string[];
  /** キーワード検索 */
  keyword?: string;
  /** ソート順 */
  order?: 'DESC' | 'ASC';
  /** 1ページあたりの表示件数 */
  perPage?: number;
  /** ページ番号 */
  page?: number;
}

/** カテゴリ値 */
export type JNet21Category = 1 | 2 | 3;

/** カテゴリ名のマッピング */
export const CATEGORY_NAMES: Record<JNet21Category, string> = {
  1: '補助金・助成金・融資',
  2: 'セミナー・イベント',
  3: 'その他',
};

// ============================================================
// パース後の構造化データ
// ============================================================

/** 支援情報（パース後の統一フォーマット） */
export interface SupportInfo {
  /** 制度名 / イベント名 */
  title: string;
  /** 詳細ページURL */
  url: string;
  /** 概要説明 */
  description: string;
  /** カテゴリ */
  category: string;
  /** サブカテゴリ（例: "補助金・助成金", "融資", "セミナー"） */
  subCategory: string;
  /** 対象地域 */
  region: string | null;
  /** 都道府県コード (ISO 3166-2:JP) */
  prefectureCode: string | null;
  /** 公開日 */
  publishDate: string;
  /** 申請期限（パース可能な場合） */
  deadline: string | null;
  /** 実施機関 */
  organization: string;
  /** データソース */
  source: 'rss_support' | 'rss_event' | 'rss_public' | 'web_scrape';
}

/** 支援情報の検索結果 */
export interface SupportInfoSearchResult {
  /** 検索結果一覧 */
  items: SupportInfo[];
  /** 総件数 */
  totalCount: number;
  /** 現在のページ */
  currentPage: number;
  /** データ取得日時 */
  fetchedAt: string;
  /** データソース */
  source: string;
}

// ============================================================
// 都道府県マッピング
// ============================================================

/**
 * ISO 3166-2:JP 都道府県コードマッピング
 * RSSフィードの dc:coverage で使用される
 */
export const PREFECTURE_CODES: Record<string, string> = {
  'JP-01': '北海道',
  'JP-02': '青森県', 'JP-03': '岩手県', 'JP-04': '宮城県',
  'JP-05': '秋田県', 'JP-06': '山形県', 'JP-07': '福島県',
  'JP-08': '茨城県', 'JP-09': '栃木県', 'JP-10': '群馬県',
  'JP-11': '埼玉県', 'JP-12': '千葉県', 'JP-13': '東京都',
  'JP-14': '神奈川県',
  'JP-15': '新潟県', 'JP-16': '富山県', 'JP-17': '石川県',
  'JP-18': '福井県', 'JP-19': '山梨県', 'JP-20': '長野県',
  'JP-21': '岐阜県', 'JP-22': '静岡県', 'JP-23': '愛知県',
  'JP-24': '三重県',
  'JP-25': '滋賀県', 'JP-26': '京都府', 'JP-27': '大阪府',
  'JP-28': '兵庫県', 'JP-29': '奈良県', 'JP-30': '和歌山県',
  'JP-31': '鳥取県', 'JP-32': '島根県', 'JP-33': '岡山県',
  'JP-34': '広島県', 'JP-35': '山口県',
  'JP-36': '徳島県', 'JP-37': '香川県', 'JP-38': '愛媛県',
  'JP-39': '高知県',
  'JP-40': '福岡県', 'JP-41': '佐賀県', 'JP-42': '長崎県',
  'JP-43': '熊本県', 'JP-44': '大分県', 'JP-45': '宮崎県',
  'JP-46': '鹿児島県', 'JP-47': '沖縄県',
};

/**
 * JISコード → 都道府県名マッピング（検索パラメータ用）
 * URL: ?prefecture[]=13 (東京都)
 */
export const JIS_PREFECTURE_CODES: Record<string, string> = {
  '00': '全国',
  '01': '北海道',
  '02': '青森県', '03': '岩手県', '04': '宮城県',
  '05': '秋田県', '06': '山形県', '07': '福島県',
  '08': '茨城県', '09': '栃木県', '10': '群馬県',
  '11': '埼玉県', '12': '千葉県', '13': '東京都',
  '14': '神奈川県',
  '15': '新潟県', '16': '富山県', '17': '石川県',
  '18': '福井県', '19': '山梨県', '20': '長野県',
  '21': '岐阜県', '22': '静岡県', '23': '愛知県',
  '24': '三重県',
  '25': '滋賀県', '26': '京都府', '27': '大阪府',
  '28': '兵庫県', '29': '奈良県', '30': '和歌山県',
  '31': '鳥取県', '32': '島根県', '33': '岡山県',
  '34': '広島県', '35': '山口県',
  '36': '徳島県', '37': '香川県', '38': '愛媛県',
  '39': '高知県',
  '40': '福岡県', '41': '佐賀県', '42': '長崎県',
  '43': '熊本県', '44': '大分県', '45': '宮崎県',
  '46': '鹿児島県', '47': '沖縄県',
};
