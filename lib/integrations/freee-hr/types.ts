/**
 * freee人事労務 API 型定義
 * 公式リファレンス: https://developer.freee.co.jp/reference/hr/reference
 * Base URL: https://api.freee.co.jp/hr/api/v1
 *
 * フィールド名は公式APIレスポンスに準拠（snake_case）
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface FreeeHrTokenResponse {
  /** アクセストークン */
  access_token: string;
  /** トークン種別 (bearer) */
  token_type: string;
  /** 有効期限（秒） */
  expires_in: number;
  /** リフレッシュトークン */
  refresh_token: string;
  /** スコープ */
  scope: string;
  /** トークン発行時刻（UNIX timestamp） */
  created_at: number;
}

// ============================================================
// ユーザー (Users)
// ============================================================

/** ログインユーザー情報レスポンス */
export interface UsersMeResponse {
  /** ユーザーID */
  id: number;
  /** 事業所一覧 */
  companies: UserCompany[];
}

/** ユーザーが所属する事業所 */
export interface UserCompany {
  /** 事業所ID */
  id: number;
  /** 事業所名 */
  name: string;
  /** 権限 (company_admin: 管理者, self_only: 本人のみ) */
  role: 'company_admin' | 'self_only';
  /** 外部CID */
  external_cid: string | null;
  /** 従業員ID */
  employee_id: number | null;
  /** 表示名 */
  display_name: string | null;
}

// ============================================================
// 従業員 (Employees)
// ============================================================

/** 従業員一覧レスポンス */
export interface EmployeesIndexResponse {
  employees: Employee[];
}

/** 従業員詳細レスポンス */
export interface EmployeeResponse {
  employee: EmployeeDetail;
}

/** 従業員（一覧） */
export interface Employee {
  /** 従業員ID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** 従業員番号 */
  num: string | null;
  /** 表示名 */
  display_name: string | null;
  /** 姓 */
  last_name: string;
  /** 名 */
  first_name: string;
  /** 姓カナ */
  last_name_kana: string | null;
  /** 名カナ */
  first_name_kana: string | null;
  /** メールアドレス */
  email: string | null;
  /** 入社日 (yyyy-MM-dd) */
  entry_date: string | null;
  /** 退社日 (yyyy-MM-dd) */
  retire_date: string | null;
  /** 生年月日 (yyyy-MM-dd) */
  birth_date: string | null;
  /** 性別 (male, female) */
  gender: 'male' | 'female' | null;
  /** 在籍状況 (working: 在職, retired: 退職) */
  employment_status: 'working' | 'retired' | null;
}

/** 従業員（詳細） */
export interface EmployeeDetail extends Employee {
  /** 住所（郵便番号） */
  zipcode: string | null;
  /** 住所（都道府県コード） */
  prefecture_code: number | null;
  /** 住所1 */
  address: string | null;
  /** 住所2 */
  address_kana: string | null;
  /** 電話番号 */
  phone: string | null;
  /** 配偶者の有無 */
  married: boolean | null;
  /** 世帯主かどうか */
  household_head: boolean | null;
  /** 扶養人数 */
  dependent_count: number | null;
  /** 銀行口座情報 */
  bank_account: EmployeeBankAccount | null;
  /** 社会保険情報 */
  social_insurance: EmployeeSocialInsurance | null;
  /** プロフィール画像URL */
  profile_image_url: string | null;
  /** 所属部門 */
  department: string | null;
  /** 役職 */
  position: string | null;
  /** 雇用形態 */
  employment_type: string | null;
}

/** 従業員銀行口座情報 */
export interface EmployeeBankAccount {
  /** 銀行名 */
  bank_name: string | null;
  /** 銀行コード */
  bank_code: string | null;
  /** 支店名 */
  branch_name: string | null;
  /** 支店コード */
  branch_code: string | null;
  /** 口座種別 (ordinary: 普通, checking: 当座) */
  account_type: 'ordinary' | 'checking' | null;
  /** 口座番号 */
  account_number: string | null;
  /** 口座名義 */
  account_name: string | null;
}

/** 従業員社会保険情報 */
export interface EmployeeSocialInsurance {
  /** 健康保険番号 */
  health_insurance_number: string | null;
  /** 厚生年金番号 */
  welfare_pension_number: string | null;
  /** 雇用保険番号 */
  employment_insurance_number: string | null;
}

// ============================================================
// 給与明細 (Payroll Statements / Salary Statements)
// ============================================================

/** 給与明細一覧レスポンス */
export interface PayrollStatementsIndexResponse {
  employee_payroll_statements: PayrollStatement[];
}

/** 給与明細詳細レスポンス */
export interface PayrollStatementResponse {
  employee_payroll_statement: PayrollStatement;
}

/** 給与明細 */
export interface PayrollStatement {
  /** 従業員ID */
  employee_id: number;
  /** 従業員番号 */
  employee_num: string | null;
  /** 従業員名 */
  employee_name: string;
  /** 支給年月 (yyyy-MM) */
  pay_period: string;
  /** 支給日 (yyyy-MM-dd) */
  pay_date: string;
  /** 計算ステータス (calculated: 計算済, fixed: 確定) */
  status: 'calculated' | 'fixed';
  /** 支給合計額 */
  total_payment: number;
  /** 控除合計額 */
  total_deduction: number;
  /** 差引支給額（手取り額） */
  net_payment: number;
  /** 総支給額（課税対象額） */
  gross_payment: number;
  /** 支給項目一覧 */
  payment_items: PayrollItem[];
  /** 控除項目一覧 */
  deduction_items: PayrollItem[];
  /** 勤怠項目一覧 */
  attendance_items: AttendanceItem[];
}

/** 給与明細の支給・控除項目 */
export interface PayrollItem {
  /** 項目名 */
  name: string;
  /** 金額 */
  amount: number;
}

/** 給与明細の勤怠項目 */
export interface AttendanceItem {
  /** 項目名 */
  name: string;
  /** 値（日数・時間数等） */
  value: number;
  /** 単位 (days, hours, times) */
  unit: string | null;
}

// ============================================================
// 賞与明細 (Bonus Statements)
// ============================================================

/** 賞与明細一覧レスポンス */
export interface BonusStatementsIndexResponse {
  employee_payroll_statements: BonusStatement[];
}

/** 賞与明細詳細レスポンス */
export interface BonusStatementResponse {
  employee_payroll_statement: BonusStatement;
}

/** 賞与明細 */
export interface BonusStatement {
  /** 従業員ID */
  employee_id: number;
  /** 従業員番号 */
  employee_num: string | null;
  /** 従業員名 */
  employee_name: string;
  /** 支給年月 (yyyy-MM) */
  pay_period: string;
  /** 支給日 (yyyy-MM-dd) */
  pay_date: string;
  /** 計算ステータス (calculated: 計算済, fixed: 確定) */
  status: 'calculated' | 'fixed';
  /** 支給合計額 */
  total_payment: number;
  /** 控除合計額 */
  total_deduction: number;
  /** 差引支給額（手取り額） */
  net_payment: number;
  /** 支給項目一覧 */
  payment_items: PayrollItem[];
  /** 控除項目一覧 */
  deduction_items: PayrollItem[];
}

// ============================================================
// 勤怠データ (Work Records / Attendance)
// ============================================================

/** 日次勤怠データレスポンス */
export interface WorkRecordResponse {
  /** 従業員ID */
  employee_id: number;
  /** 日付 (yyyy-MM-dd) */
  date: string;
  /** 出勤時刻 (HH:mm) */
  clock_in_at: string | null;
  /** 退勤時刻 (HH:mm) */
  clock_out_at: string | null;
  /** 勤務パターン名 */
  work_pattern_name: string | null;
  /** 通常勤務時間（分） */
  normal_work_mins: number;
  /** 所定内残業時間（分） */
  normal_work_overtime_mins: number;
  /** 法定外残業時間（分） */
  overtime_mins: number;
  /** 深夜残業時間（分） */
  late_night_overtime_mins: number;
  /** 休憩時間（分） */
  break_mins: number;
  /** 遅刻フラグ */
  is_late: boolean;
  /** 早退フラグ */
  is_early_leave: boolean;
  /** 欠勤フラグ */
  is_absence: boolean;
  /** 有給休暇使用フラグ */
  is_paid_holiday: boolean;
  /** 備考 */
  note: string | null;
}

/** 月次勤怠サマリーレスポンス */
export interface WorkRecordSummaryResponse {
  /** 年 */
  year: number;
  /** 月 */
  month: number;
  /** 従業員ID */
  employee_id: number;
  /** 出勤日数 */
  work_days: number;
  /** 総労働時間（分） */
  total_work_mins: number;
  /** 総残業時間（分） */
  total_overtime_mins: number;
  /** 総深夜残業時間（分） */
  total_late_night_overtime_mins: number;
  /** 有給休暇使用日数 */
  paid_holiday_days: number;
  /** 欠勤日数 */
  absence_days: number;
  /** 遅刻回数 */
  late_count: number;
  /** 早退回数 */
  early_leave_count: number;
  /** 日次勤怠データ一覧（includeオプション時） */
  work_records?: WorkRecordResponse[];
}

/** 勤怠データ更新パラメータ */
export interface WorkRecordUpdateParams {
  /** 事業所ID */
  company_id: number;
  /** 出勤時刻 (HH:mm) */
  clock_in_at?: string;
  /** 退勤時刻 (HH:mm) */
  clock_out_at?: string;
  /** 休憩記録 */
  break_records?: BreakRecord[];
  /** 通常勤務時間（分） */
  normal_work_mins?: number;
  /** 備考 */
  note?: string;
}

/** 休憩記録 */
export interface BreakRecord {
  /** 休憩開始時刻 (HH:mm) */
  clock_in_at: string;
  /** 休憩終了時刻 (HH:mm) */
  clock_out_at: string;
}

// ============================================================
// 打刻 (Time Clocks)
// ============================================================

/** 打刻一覧レスポンス */
export interface TimeClocksIndexResponse {
  time_clocks: TimeClock[];
}

/** 打刻レスポンス */
export interface TimeClockResponse {
  time_clock: TimeClock;
}

/** 打刻データ */
export interface TimeClock {
  /** 打刻ID */
  id: number;
  /** 従業員ID */
  employee_id: number;
  /** 打刻種別 (clock_in: 出勤, clock_out: 退勤, break_begin: 休憩開始, break_end: 休憩終了) */
  type: 'clock_in' | 'clock_out' | 'break_begin' | 'break_end';
  /** 打刻日時 (ISO 8601) */
  datetime: string;
  /** 元の打刻日時（修正前） */
  original_datetime: string | null;
}

/** 打刻作成パラメータ */
export interface TimeClockCreateParams {
  /** 事業所ID */
  company_id: number;
  /** 打刻種別 */
  type: 'clock_in' | 'clock_out' | 'break_begin' | 'break_end';
  /** 打刻日時 (ISO 8601、省略時はサーバー時刻) */
  datetime?: string;
}

// ============================================================
// 年末調整 (Year-End Adjustments)
// ============================================================

/** 年末調整一覧レスポンス */
export interface YearEndAdjustmentsIndexResponse {
  year_end_adjustments: YearEndAdjustment[];
}

/** 年末調整データ */
export interface YearEndAdjustment {
  /** 従業員ID */
  employee_id: number;
  /** 従業員名 */
  employee_name: string;
  /** 対象年度 */
  year: number;
  /** ステータス (not_started: 未開始, in_progress: 進行中, completed: 完了, fixed: 確定) */
  status: 'not_started' | 'in_progress' | 'completed' | 'fixed';
  /** 給与所得控除後の金額 */
  employment_income_after_deduction: number | null;
  /** 所得控除の額の合計額 */
  total_income_deduction: number | null;
  /** 源泉徴収税額 */
  withholding_tax_amount: number | null;
  /** 差引過不足額（還付・徴収額） */
  difference_amount: number | null;
  /** 配偶者控除額 */
  spouse_deduction: number | null;
  /** 扶養控除額 */
  dependent_deduction: number | null;
  /** 基礎控除額 */
  basic_deduction: number | null;
  /** 生命保険料控除額 */
  life_insurance_deduction: number | null;
  /** 地震保険料控除額 */
  earthquake_insurance_deduction: number | null;
  /** 社会保険料控除額 */
  social_insurance_deduction: number | null;
  /** 住宅借入金等特別控除額 */
  housing_loan_deduction: number | null;
}

// ============================================================
// 部署 (Groups / Departments)
// ============================================================

/** 部署一覧レスポンス */
export interface GroupsIndexResponse {
  groups: Group[];
}

/** 部署 */
export interface Group {
  /** 部署ID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** 部署名 */
  name: string;
  /** 部署コード */
  code: string | null;
  /** 親部署ID */
  parent_group_id: number | null;
  /** 階層レベル (1〜) */
  level: number;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/** 従業員の部署所属情報一覧レスポンス */
export interface EmployeeGroupMembershipsIndexResponse {
  employee_group_memberships: EmployeeGroupMembership[];
}

/** 従業員の部署所属情報 */
export interface EmployeeGroupMembership {
  /** 所属ID */
  id: number;
  /** 従業員ID */
  employee_id: number;
  /** 部署ID */
  group_id: number;
  /** 主務かどうか */
  is_main: boolean;
  /** 開始日 (yyyy-MM-dd) */
  start_date: string | null;
  /** 終了日 (yyyy-MM-dd) */
  end_date: string | null;
}

// ============================================================
// 役職 (Positions)
// ============================================================

/** 役職一覧レスポンス */
export interface PositionsIndexResponse {
  positions: Position[];
}

/** 役職 */
export interface Position {
  /** 役職ID */
  id: number;
  /** 事業所ID */
  company_id: number;
  /** 役職名 */
  name: string;
  /** 役職コード */
  code: string | null;
  /** 並び順 */
  sort_order: number | null;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}
