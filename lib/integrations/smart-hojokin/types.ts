/**
 * スマート補助金 型定義
 *
 * 公式サイト: https://www.smart-hojokin.jp/
 * 内部API: /api/v1/public/areas（都道府県→市区町村取得）
 * DB規模: 75,818件以上の補助金情報
 *
 * 認証: 不要（公開Webサイト）
 * データ取得方式: Web スクレイピング + 内部API
 */

// ============================================================
// 都道府県・地域
// ============================================================

/** 都道府県 */
export interface SmartHojokinPrefecture {
  /** 都道府県ID (1-47, 48=全国, 49=その他) */
  id: number;
  /** 都道府県名 */
  name: string;
}

/** 市区町村（/api/v1/public/areas レスポンス） */
export interface SmartHojokinArea {
  /** 市区町村ID */
  id: number;
  /** 市区町村名 */
  name: string;
  /** 所属都道府県ID */
  prefecture_id: number;
}

/** 地域一覧レスポンス */
export interface AreasResponse {
  areas: SmartHojokinArea[];
}

// ============================================================
// 補助金分類
// ============================================================

/** 補助金分類ID */
export type SubsidyClassifyId = 1 | 2 | 3;

/** 補助金分類 */
export interface SubsidyClassify {
  /** 分類ID: 1=補助金, 2=助成金, 3=給付金 */
  id: SubsidyClassifyId;
  /** 分類名 */
  name: string;
}

/** 対象者区分 */
export type TargetAudience = '企業' | '団体' | '個人' | 'その他';

// ============================================================
// 補助金情報
// ============================================================

/** 補助金検索パラメータ */
export interface SmartHojokinSearchParams {
  /** 都道府県ID (1-47, 48=全国) */
  prefectureId?: number;
  /** 市区町村ID */
  areaId?: number;
  /** 補助金分類 (1=補助金, 2=助成金, 3=給付金) */
  classifyId?: SubsidyClassifyId;
  /** 対象者区分 */
  targetAudience?: TargetAudience;
  /** キーワード */
  keyword?: string;
  /** 業種カテゴリ */
  industry?: string;
  /** 利用目的カテゴリ */
  purpose?: string;
  /** ページ番号 */
  page?: number;
}

/** 補助金サマリー（一覧表示用） */
export interface SmartHojokinSubsidySummary {
  /** 補助金ID（サイト内） */
  id: string;
  /** 補助金名称 */
  title: string;
  /** 概要説明 */
  description: string;
  /** 対象地域（都道府県名） */
  prefecture: string;
  /** 対象市区町村 */
  area?: string;
  /** 補助金分類 */
  classify: '補助金' | '助成金' | '給付金';
  /** 上限金額（テキスト） */
  maxAmount?: string;
  /** 補助率 */
  subsidyRate?: string;
  /** 募集期限 */
  deadline?: string;
  /** 募集ステータス */
  status: '募集中' | '募集終了' | '近日公開' | '不明';
  /** 詳細ページURL */
  detailUrl: string;
}

/** 補助金詳細情報 */
export interface SmartHojokinSubsidyDetail extends SmartHojokinSubsidySummary {
  /** 対象業種 */
  targetIndustries: string[];
  /** 対象者条件 */
  eligibility: string;
  /** 対象経費 */
  targetExpenses?: string;
  /** 利用目的 */
  purposes: string[];
  /** 公募要領URL */
  guidelinesUrl?: string;
  /** 問い合わせ先 */
  contactInfo?: string;
  /** 管轄機関 */
  managingOrganization?: string;
}

/** 検索結果 */
export interface SmartHojokinSearchResult {
  /** 検索結果件数 */
  totalCount: number;
  /** 現在のページ */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** 補助金一覧 */
  items: SmartHojokinSubsidySummary[];
}

// ============================================================
// 業種カテゴリ
// ============================================================

/** 業種カテゴリ一覧（サイト上で確認された12カテゴリ） */
export const SMART_HOJOKIN_INDUSTRIES = [
  '農業・林業・漁業',
  '製造業',
  '情報通信業',
  '建設業',
  '卸売業・小売業',
  '宿泊業・飲食業',
  '医療・福祉',
  '教育・学習支援',
  '運輸業・郵便業',
  '不動産業',
  'サービス業',
  'その他',
] as const;

/** 利用目的カテゴリ一覧（14カテゴリ） */
export const SMART_HOJOKIN_PURPOSES = [
  '経営改善',
  '販路開拓',
  '設備投資',
  '人材育成',
  '研究開発',
  '創業・起業',
  'IT導入',
  '事業承継',
  '海外展開',
  '環境対策',
  '防災・BCP',
  '雇用・採用',
  '働き方改革',
  'その他',
] as const;

// ============================================================
// 税理士CRM向けユーティリティ型
// ============================================================

/** 顧問先マッチング条件 */
export interface SmartHojokinClientProfile {
  /** 所在地（都道府県名） */
  prefecture: string;
  /** 所在地（市区町村名） */
  area?: string;
  /** 業種 */
  industry: string;
  /** 従業員数 */
  employeeCount: number;
  /** 資本金（万円） */
  capital?: number;
  /** 関心のある利用目的 */
  purposes: string[];
  /** 追加キーワード */
  keywords?: string[];
}

/** マッチング結果 */
export interface SmartHojokinMatchResult {
  /** 補助金情報 */
  subsidy: SmartHojokinSubsidySummary;
  /** マッチングスコア (0-100) */
  matchScore: number;
  /** マッチ理由 */
  matchReasons: string[];
  /** データソース */
  source: 'smart-hojokin';
}
