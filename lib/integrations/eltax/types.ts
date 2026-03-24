/**
 * eLTAX連携 型定義
 *
 * eLTAXは通常のREST APIを公開していない。
 * 連携方式:
 * 1. PCdesk（eLTAXソフト）のXMLインポート/エクスポート
 * 2. eLTAX対応ソフトウェアのAPI方式（仕様書は申請制）
 *
 * 公式: https://www.eltax.lta.go.jp/
 * 開発者向け: https://www.eltax.lta.go.jp/support/software/
 */

// ============================================================
// 申告データ（XMLインポート用）
// ============================================================

/** 地方税申告データ */
export interface EltaxDeclaration {
  /** 申告種別 */
  declarationType: EltaxDeclarationType;
  /** 事業年度開始日 (yyyy-MM-dd) */
  fiscalYearStart: string;
  /** 事業年度終了日 (yyyy-MM-dd) */
  fiscalYearEnd: string;
  /** 法人番号（13桁） */
  corporateNumber: string;
  /** 法人名 */
  corporateName: string;
  /** 代表者名 */
  representativeName: string;
  /** 提出先地方自治体コード */
  localGovernmentCode: string;
  /** 提出先自治体名 */
  localGovernmentName: string;
  /** XMLデータ（PCdeskインポート形式） */
  xmlContent: string;
}

/** eLTAX申告種別 */
export type EltaxDeclarationType =
  | 'corporate_inhabitant_tax'  // 法人住民税
  | 'corporate_enterprise_tax'  // 法人事業税
  | 'special_corporate_tax'     // 特別法人事業税
  | 'withholding_report'        // 給与支払報告書（特別徴収）
  | 'fixed_asset_tax'           // 固定資産税（償却資産）
  | 'business_office_tax';      // 事業所税

// ============================================================
// 特別徴収関連
// ============================================================

/** 特別徴収税額通知データ */
export interface SpecialCollectionNotice {
  /** 通知年度 */
  year: number;
  /** 特別徴収義務者（事業者）情報 */
  employer: SpecialCollectionEmployer;
  /** 従業員ごとの税額 */
  employees: SpecialCollectionEmployee[];
}

/** 特別徴収義務者（事業者） */
export interface SpecialCollectionEmployer {
  /** 法人番号 */
  corporateNumber: string;
  /** 法人名 */
  name: string;
  /** 指定番号 */
  designationNumber: string;
  /** 所在地 */
  address: string;
}

/** 特別徴収対象従業員 */
export interface SpecialCollectionEmployee {
  /** 従業員番号 */
  employeeNumber: string | null;
  /** 氏名 */
  name: string;
  /** 住所 */
  address: string;
  /** 年税額 */
  annualTaxAmount: number;
  /** 月別税額（6月〜翌5月の12ヶ月分） */
  monthlyTaxAmounts: MonthlyTax[];
  /** 市区町村コード */
  municipalityCode: string;
  /** 市区町村名 */
  municipalityName: string;
}

/** 月別特別徴収税額 */
export interface MonthlyTax {
  /** 月 (6月=6, 7月=7, ..., 翌5月=5) */
  month: number;
  /** 税額 */
  amount: number;
}

// ============================================================
// 地方税共通納税
// ============================================================

/** 地方税共通納税データ */
export interface CommonTaxPayment {
  /** 納付種別 */
  paymentType: 'corporate_inhabitant_tax' | 'corporate_enterprise_tax' | 'withholding_tax';
  /** 納付対象期間（開始） */
  periodFrom: string;
  /** 納付対象期間（終了） */
  periodTo: string;
  /** 納付先自治体コード */
  localGovernmentCode: string;
  /** 納付先自治体名 */
  localGovernmentName: string;
  /** 納付金額 */
  amount: number;
  /** 法人番号 */
  corporateNumber: string;
  /** 指定番号 */
  designationNumber: string | null;
}

// ============================================================
// PCdesk連携
// ============================================================

/** PCdeskインポート用XMLファイル情報 */
export interface PcdeskXmlFile {
  /** ファイル名 */
  fileName: string;
  /** ファイルパス */
  filePath: string;
  /** 申告種別 */
  declarationType: EltaxDeclarationType;
  /** XML内容 */
  content: string;
  /** 文字コード (UTF-8) */
  encoding: 'UTF-8';
}

/** PCdeskエクスポートデータ */
export interface PcdeskExportData {
  /** 受付番号 */
  receiptNumber: string;
  /** 提出日時 */
  submissionDate: string;
  /** ステータス */
  status: 'submitted' | 'accepted' | 'rejected';
  /** 申告種別 */
  declarationType: EltaxDeclarationType;
  /** メッセージ */
  message: string | null;
}

// ============================================================
// API方式（対応ソフトウェア向け）
// ============================================================

/**
 * eLTAX API方式のリクエスト
 * Note: API方式の仕様書は地方税共同機構への申請制。
 * 同意書への押印とPDF形式での申請が必要。
 */
export interface EltaxApiRequest {
  /** ソフトウェアID（登録済みソフトウェアのID） */
  softwareId: string;
  /** 利用者ID */
  userId: string;
  /** 申告データ（XML形式、Base64エンコード） */
  declarationData: string;
  /** 電子署名データ（Base64エンコード） */
  signatureData: string;
  /** 提出先自治体コード */
  localGovernmentCode: string;
}

/** eLTAX API方式のレスポンス */
export interface EltaxApiResponse {
  /** 処理結果 */
  result: 'success' | 'error';
  /** 受付番号 */
  receiptNumber: string | null;
  /** メッセージ */
  message: string;
  /** エラー詳細 */
  errors: Array<{ code: string; message: string }>;
}
