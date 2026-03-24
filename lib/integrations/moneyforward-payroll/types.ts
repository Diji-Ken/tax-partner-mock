/**
 * MFクラウド給与 API 型定義
 * 公式: https://developer.moneyforward.com/
 * 公式連携ページ: https://biz.moneyforward.com/integration/product/payroll-api/
 *
 * Note: MFクラウド給与APIは一般公開のREST APIドキュメントが限定的であり、
 * パートナー企業向けに提供されている。以下の型定義はAPI連携機能の公開情報と
 * 勤怠API連携仕様に基づく。
 */

// ============================================================
// OAuth2 認証
// ============================================================

/** OAuth2 トークンレスポンス */
export interface MfPayrollTokenResponse {
  /** アクセストークン */
  access_token: string;
  /** トークン種別 (Bearer) */
  token_type: string;
  /** 有効期限（秒） */
  expires_in: number;
  /** リフレッシュトークン */
  refresh_token: string;
  /** スコープ */
  scope: string;
}

// ============================================================
// 事業所 (Offices)
// ============================================================

/** 事業所一覧レスポンス */
export interface OfficesIndexResponse {
  offices: Office[];
}

/** 事業所 */
export interface Office {
  /** 事業所ID */
  id: string;
  /** 事業所名 */
  name: string;
  /** 法人番号 */
  corporate_number: string | null;
  /** 郵便番号 */
  zipcode: string | null;
  /** 住所 */
  address: string | null;
  /** 電話番号 */
  phone: string | null;
}

// ============================================================
// 従業員 (Employees)
// ============================================================

/** 従業員一覧レスポンス */
export interface EmployeesIndexResponse {
  employees: MfEmployee[];
}

/** 従業員詳細レスポンス */
export interface EmployeeResponse {
  employee: MfEmployee;
}

/** 従業員 */
export interface MfEmployee {
  /** 従業員ID */
  id: string;
  /** 事業所ID */
  office_id: string;
  /** 従業員番号 */
  employee_number: string | null;
  /** 姓 */
  last_name: string;
  /** 名 */
  first_name: string;
  /** 姓カナ */
  last_name_kana: string | null;
  /** 名カナ */
  first_name_kana: string | null;
  /** 表示名 */
  display_name: string | null;
  /** メールアドレス */
  email: string | null;
  /** 生年月日 (yyyy-MM-dd) */
  birthday: string | null;
  /** 性別 (male, female) */
  gender: 'male' | 'female' | null;
  /** 入社日 (yyyy-MM-dd) */
  joined_date: string | null;
  /** 退職日 (yyyy-MM-dd) */
  retired_date: string | null;
  /** 在職状況 */
  employment_status: 'active' | 'retired' | 'on_leave' | null;
  /** 雇用形態 */
  employment_type: string | null;
  /** 部署名 */
  department_name: string | null;
  /** 役職名 */
  position_name: string | null;
  /** 銀行口座情報 */
  bank_account: MfBankAccount | null;
}

/** 銀行口座情報 */
export interface MfBankAccount {
  /** 銀行名 */
  bank_name: string | null;
  /** 銀行コード */
  bank_code: string | null;
  /** 支店名 */
  branch_name: string | null;
  /** 支店コード */
  branch_code: string | null;
  /** 口座種別 */
  account_type: 'ordinary' | 'checking' | null;
  /** 口座番号 */
  account_number: string | null;
  /** 口座名義 */
  account_holder: string | null;
}

// ============================================================
// 給与計算 (Payroll)
// ============================================================

/** 給与明細一覧レスポンス */
export interface PayrollsIndexResponse {
  payrolls: Payroll[];
}

/** 給与明細 */
export interface Payroll {
  /** 給与明細ID */
  id: string;
  /** 従業員ID */
  employee_id: string;
  /** 支給年月 (yyyy-MM) */
  pay_period: string;
  /** 支給日 (yyyy-MM-dd) */
  pay_date: string;
  /** ステータス (draft: 下書き, calculated: 計算済, fixed: 確定) */
  status: 'draft' | 'calculated' | 'fixed';
  /** 基本給 */
  base_salary: number;
  /** 支給合計 */
  total_payment: number;
  /** 控除合計 */
  total_deduction: number;
  /** 差引支給額 */
  net_payment: number;
  /** 支給項目一覧 */
  payment_items: PayrollItem[];
  /** 控除項目一覧 */
  deduction_items: PayrollItem[];
}

/** 給与・控除項目 */
export interface PayrollItem {
  /** 項目名 */
  name: string;
  /** 金額 */
  amount: number;
}

// ============================================================
// 年末調整 (Year-End Adjustment)
// ============================================================

/** 年末調整一覧レスポンス */
export interface YearEndAdjustmentsIndexResponse {
  year_end_adjustments: MfYearEndAdjustment[];
}

/** 年末調整データ */
export interface MfYearEndAdjustment {
  /** ID */
  id: string;
  /** 従業員ID */
  employee_id: string;
  /** 対象年度 */
  year: number;
  /** ステータス */
  status: 'not_started' | 'in_progress' | 'completed' | 'fixed';
  /** 給与所得控除後の金額 */
  employment_income_after_deduction: number | null;
  /** 源泉徴収税額 */
  withholding_tax_amount: number | null;
  /** 差引過不足額 */
  difference_amount: number | null;
}

// ============================================================
// 源泉徴収票 (Withholding Tax Certificate)
// ============================================================

/** 源泉徴収票一覧レスポンス */
export interface WithholdingTaxCertificatesIndexResponse {
  withholding_tax_certificates: WithholdingTaxCertificate[];
}

/** 源泉徴収票 */
export interface WithholdingTaxCertificate {
  /** ID */
  id: string;
  /** 従業員ID */
  employee_id: string;
  /** 対象年度 */
  year: number;
  /** 支払金額 */
  payment_amount: number;
  /** 給与所得控除後の金額 */
  income_after_deduction: number;
  /** 所得控除の額の合計額 */
  total_deduction: number;
  /** 源泉徴収税額 */
  tax_amount: number;
  /** 社会保険料等の金額 */
  social_insurance_amount: number;
  /** 生命保険料の控除額 */
  life_insurance_deduction: number | null;
  /** 地震保険料の控除額 */
  earthquake_insurance_deduction: number | null;
  /** 住宅借入金等特別控除の額 */
  housing_loan_deduction: number | null;
}

// ============================================================
// 社会保険料 (Social Insurance)
// ============================================================

/** 社会保険料一覧レスポンス */
export interface SocialInsurancesIndexResponse {
  social_insurances: SocialInsurance[];
}

/** 社会保険料 */
export interface SocialInsurance {
  /** 従業員ID */
  employee_id: string;
  /** 対象年月 (yyyy-MM) */
  period: string;
  /** 健康保険料（被保険者負担） */
  health_insurance_employee: number;
  /** 健康保険料（事業主負担） */
  health_insurance_employer: number;
  /** 介護保険料（被保険者負担） */
  nursing_care_insurance_employee: number;
  /** 介護保険料（事業主負担） */
  nursing_care_insurance_employer: number;
  /** 厚生年金保険料（被保険者負担） */
  welfare_pension_employee: number;
  /** 厚生年金保険料（事業主負担） */
  welfare_pension_employer: number;
  /** 雇用保険料（被保険者負担） */
  employment_insurance_employee: number;
  /** 雇用保険料（事業主負担） */
  employment_insurance_employer: number;
  /** 標準報酬月額 */
  standard_monthly_remuneration: number | null;
}

// ============================================================
// 勤怠データ連携 (Attendance Data Import)
// ============================================================

/** 勤怠データインポートパラメータ */
export interface AttendanceImportParams {
  /** 事業所ID */
  office_id: string;
  /** 対象年月 (yyyy-MM) */
  period: string;
  /** 従業員ごとの勤怠データ */
  attendance_records: AttendanceRecord[];
}

/** 勤怠レコード */
export interface AttendanceRecord {
  /** 従業員番号 */
  employee_number: string;
  /** 出勤日数 */
  work_days: number;
  /** 所定労働時間（10進数表記、例: 160.00） */
  scheduled_work_hours: number;
  /** 実労働時間 */
  actual_work_hours: number;
  /** 残業時間 */
  overtime_hours: number;
  /** 深夜残業時間 */
  late_night_hours: number;
  /** 法定休日労働時間 */
  holiday_work_hours: number;
  /** 有給休暇日数 */
  paid_leave_days: number;
  /** 欠勤日数 */
  absence_days: number;
}
