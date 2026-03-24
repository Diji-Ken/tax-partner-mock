/**
 * 補助金ポータル 型定義
 *
 * 公式サイト: https://hojyokin-portal.jp/
 * 士業ポータル: https://shigyo-portal.jp/
 * 運営: 株式会社補助金ポータル
 *
 * DB規模: 3万件以上の補助金・助成金情報
 * 月間利用者: 約100万人
 *
 * 関連サービス:
 *   - https://hojyokin-comon.jp （補助金コモン）
 *   - https://hojyokin-soudanjyo.jp （補助金相談所）
 *
 * データ取得方式:
 *   - 内部API: /api/columns/（コラム記事）
 *   - Webスクレイピング
 *   - 士業パートナー連携（要登録）
 */

// ============================================================
// 補助金情報
// ============================================================

/** 補助金カテゴリ */
export type HojyokinCategory =
  | '補助金'
  | '助成金'
  | '融資'
  | '税制優遇'
  | 'その他';

/** 補助金ステータス */
export type HojyokinStatus = '募集中' | '募集予定' | '募集終了';

/** 補助金検索パラメータ */
export interface HojyokinSearchParams {
  /** 検索キーワード */
  keyword?: string;
  /** カテゴリ */
  category?: HojyokinCategory;
  /** 都道府県 */
  prefecture?: string;
  /** 対象業種 */
  industry?: string;
  /** ステータス */
  status?: HojyokinStatus;
  /** ページ番号 */
  page?: number;
}

/** 補助金サマリー（一覧表示用） */
export interface HojyokinSubsidySummary {
  /** 補助金ID */
  id: string;
  /** 補助金名称 */
  title: string;
  /** 概要 */
  description: string;
  /** カテゴリ */
  category: HojyokinCategory;
  /** 対象地域 */
  region: string;
  /** 上限金額 */
  maxAmount?: string;
  /** 補助率 */
  subsidyRate?: string;
  /** 募集期限 */
  deadline?: string;
  /** ステータス */
  status: HojyokinStatus;
  /** 管轄機関 */
  organization?: string;
  /** 詳細ページURL */
  detailUrl: string;
}

/** 補助金詳細情報 */
export interface HojyokinSubsidyDetail extends HojyokinSubsidySummary {
  /** 対象者 */
  eligibility: string;
  /** 対象経費 */
  targetExpenses?: string;
  /** 申請方法 */
  applicationMethod?: string;
  /** 問い合わせ先 */
  contactInfo?: string;
  /** 公募要領URL */
  guidelinesUrl?: string;
  /** 関連コラム */
  relatedColumns?: HojyokinColumn[];
}

/** 検索結果 */
export interface HojyokinSearchResult {
  /** 総件数 */
  totalCount: number;
  /** 現在のページ */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** 結果一覧 */
  items: HojyokinSubsidySummary[];
}

// ============================================================
// コラム記事（/api/columns/）
// ============================================================

/** コラム記事 */
export interface HojyokinColumn {
  /** 記事ID */
  id: string;
  /** タイトル */
  title: string;
  /** 概要 */
  excerpt: string;
  /** 本文 */
  content?: string;
  /** カテゴリ */
  category: string;
  /** 公開日 */
  publishedDate: string;
  /** URL */
  url: string;
}

/** コラム一覧レスポンス */
export interface HojyokinColumnsResponse {
  columns: HojyokinColumn[];
  totalCount: number;
}

// ============================================================
// 士業パートナー連携
// ============================================================

/** 士業パートナー種別 */
export type ShigyoType =
  | '税理士'
  | '公認会計士'
  | '社会保険労務士'
  | '行政書士'
  | '司法書士'
  | '弁護士'
  | '中小企業診断士'
  | 'その他';

/** 士業パートナー登録情報 */
export interface ShigyoPartnerProfile {
  /** パートナーID */
  id: string;
  /** 事務所名 */
  officeName: string;
  /** 資格種別 */
  shigyoType: ShigyoType;
  /** 専門分野 */
  specialties: string[];
  /** 対応地域 */
  regions: string[];
  /** プロフィールURL（shigyo-portal.jp内） */
  profileUrl: string;
}

/** 士業ポータル料金プラン */
export interface ShigyoPlan {
  /** プラン名 */
  name: string;
  /** 月額料金 */
  monthlyPrice: number | null; // null = 要問合せ
  /** 機能一覧 */
  features: string[];
}

// ============================================================
// 専門家検索
// ============================================================

/** 専門家検索パラメータ */
export interface ExpertSearchParams {
  /** 資格種別 */
  shigyoType?: ShigyoType;
  /** 地域 */
  region?: string;
  /** 専門分野 */
  specialty?: string;
  /** キーワード */
  keyword?: string;
}

// ============================================================
// 税理士CRM向けユーティリティ型
// ============================================================

/** 顧問先マッチング条件 */
export interface HojyokinClientProfile {
  /** 所在地（都道府県名） */
  prefecture: string;
  /** 業種 */
  industry: string;
  /** 従業員数 */
  employeeCount: number;
  /** 関心のある分野 */
  interests: string[];
  /** キーワード */
  keywords: string[];
}

/** マッチング結果 */
export interface HojyokinMatchResult {
  /** 補助金情報 */
  subsidy: HojyokinSubsidySummary;
  /** マッチングスコア (0-100) */
  matchScore: number;
  /** マッチ理由 */
  matchReasons: string[];
  /** データソース */
  source: 'hojyokin-portal';
}
