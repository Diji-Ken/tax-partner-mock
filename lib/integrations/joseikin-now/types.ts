/**
 * 助成金なう（ナビット）型定義
 *
 * 公式サイト: https://www.navit-j.com/service/joseikin-now/
 * ブログ: https://joseikin-now.jp/
 * 運営: 株式会社ナビット
 *
 * DB規模:
 *   - 国・自治体案件: 145,169件
 *   - 財団・協会案件: 9,832件
 *   - 過去採択企業DB: 829,706社
 *   - 月間更新: 1,500〜2,000件（日次で100-200件の公示あり）
 *
 * データ取得方式: Web検索 + パートナーAPI（要契約）
 */

// ============================================================
// 補助金・助成金情報
// ============================================================

/** 案件カテゴリ */
export type JoseikinCategory = '国・自治体' | '財団・協会';

/** 案件ステータス */
export type JoseikinStatus = '公募中' | '公募予定' | '公募終了';

/** 助成金・補助金検索パラメータ */
export interface JoseikinSearchParams {
  /** 検索キーワード */
  keyword?: string;
  /** カテゴリ */
  category?: JoseikinCategory;
  /** 都道府県 */
  prefecture?: string;
  /** 対象業種 */
  industry?: string;
  /** 対象者区分 */
  targetType?: string;
  /** 助成金種別 */
  subsidyType?: string;
  /** ステータスフィルター */
  status?: JoseikinStatus;
  /** ページ番号 */
  page?: number;
  /** 1ページあたりの件数 */
  perPage?: number;
}

/** 助成金・補助金サマリー */
export interface JoseikinSubsidySummary {
  /** 案件ID */
  id: string;
  /** 案件名 */
  title: string;
  /** 概要 */
  description: string;
  /** カテゴリ */
  category: JoseikinCategory;
  /** 対象地域 */
  region: string;
  /** 上限金額 */
  maxAmount?: string;
  /** 募集期間（開始） */
  startDate?: string;
  /** 募集期間（終了） */
  endDate?: string;
  /** ステータス */
  status: JoseikinStatus;
  /** 管轄機関 */
  organization?: string;
  /** 詳細URL */
  detailUrl: string;
  /** 公示日 */
  publishedDate: string;
}

/** 助成金・補助金詳細 */
export interface JoseikinSubsidyDetail extends JoseikinSubsidySummary {
  /** 対象者 */
  eligibility: string;
  /** 対象経費 */
  targetExpenses?: string;
  /** 補助率 */
  subsidyRate?: string;
  /** 申請方法 */
  applicationMethod?: string;
  /** 問い合わせ先 */
  contactInfo?: string;
  /** 公募要領URL */
  guidelinesUrl?: string;
  /** 備考 */
  notes?: string;
}

/** 検索結果 */
export interface JoseikinSearchResult {
  /** 総件数 */
  totalCount: number;
  /** 現在のページ */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** 結果一覧 */
  items: JoseikinSubsidySummary[];
}

// ============================================================
// 過去採択企業DB
// ============================================================

/** 過去採択企業情報 */
export interface JoseikinAdoptedCompany {
  /** 企業名 */
  companyName: string;
  /** 所在地 */
  location: string;
  /** 採択された補助金名 */
  subsidyName: string;
  /** 採択年度 */
  fiscalYear: string;
  /** 事業概要 */
  projectSummary?: string;
}

// ============================================================
// パートナー連携
// ============================================================

/** パートナープラン */
export type JoseikinPlan =
  | 'free'           // 無料会員（基本検索のみ）
  | 'standard'       // 月額1,000円（強化検索）
  | 'unlimited'      // 申請し放題プラン
  | 'expansion'      // 事業拡大プラン
  | 'mega'           // メガプラン
  | 'corporate';     // 法人プラン

/** 販売代理店パートナー情報 */
export interface JoseikinPartnerInfo {
  /** パートナー名 */
  name: string;
  /** パートナーID */
  partnerId: string;
  /** プラン */
  plan: JoseikinPlan;
  /** API利用可否（法人プラン以上） */
  apiAccess: boolean;
}

// ============================================================
// DB統計
// ============================================================

/** データベース統計情報 */
export interface JoseikinDbStats {
  /** 国・自治体案件数 */
  governmentCount: number;
  /** 財団・協会案件数 */
  foundationCount: number;
  /** 過去採択企業数 */
  adoptedCompanyCount: number;
  /** 本日の新着件数 */
  todayNewCount: number;
  /** 最終更新日 */
  lastUpdated: string;
}

// ============================================================
// 税理士CRM向けユーティリティ型
// ============================================================

/** 顧問先マッチング条件 */
export interface JoseikinClientProfile {
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
export interface JoseikinMatchResult {
  /** 助成金情報 */
  subsidy: JoseikinSubsidySummary;
  /** マッチングスコア (0-100) */
  matchScore: number;
  /** マッチ理由 */
  matchReasons: string[];
  /** データソース */
  source: 'joseikin-now';
}
