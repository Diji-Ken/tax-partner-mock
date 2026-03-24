/**
 * eLTAX連携 クライアント
 *
 * eLTAXは通常のREST APIを公開していない。本モジュールは以下の機能を提供:
 * 1. PCdeskインポート用XMLデータの生成ヘルパー
 * 2. 特別徴収税額通知データの管理
 * 3. 地方税共通納税データの管理
 *
 * 公式: https://www.eltax.lta.go.jp/
 * PCdesk: https://www.eltax.lta.go.jp/eltax/software/
 * 開発者向け: https://www.eltax.lta.go.jp/support/software/
 */

import type {
  EltaxDeclaration,
  EltaxDeclarationType,
  SpecialCollectionNotice,
  SpecialCollectionEmployee,
  CommonTaxPayment,
  PcdeskXmlFile,
  PcdeskExportData,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** PCdeskのXMLエクスポート先ディレクトリ */
  exportDir: process.env.ELTAX_EXPORT_DIR || './eltax-export',
  /** eLTAXポータルURL */
  portalUrl: 'https://www.portal.eltax.lta.go.jp/',
  /** PCdesk(WEB版) URL */
  pcdeskWebUrl: 'https://www.portal.eltax.lta.go.jp/apa/web/webindexb',
};

// ============================================================
// PCdesk用XMLデータ生成
// ============================================================

/**
 * 法人住民税申告用のXMLテンプレートを生成
 * PCdeskにインポート可能な形式で出力
 */
export function generateCorporateInhabitantTaxXml(declaration: Omit<EltaxDeclaration, 'xmlContent' | 'declarationType'>): PcdeskXmlFile {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eLTAX>
  <header>
    <declarationType>corporate_inhabitant_tax</declarationType>
    <fiscalYearStart>${declaration.fiscalYearStart}</fiscalYearStart>
    <fiscalYearEnd>${declaration.fiscalYearEnd}</fiscalYearEnd>
    <localGovernmentCode>${declaration.localGovernmentCode}</localGovernmentCode>
    <localGovernmentName>${declaration.localGovernmentName}</localGovernmentName>
  </header>
  <body>
    <corporation>
      <corporateNumber>${declaration.corporateNumber}</corporateNumber>
      <corporateName>${declaration.corporateName}</corporateName>
      <representativeName>${declaration.representativeName}</representativeName>
    </corporation>
    <!-- 申告データ本体はここに挿入 -->
  </body>
</eLTAX>`;

  return {
    fileName: `corporate_inhabitant_tax_${declaration.corporateNumber}_${declaration.fiscalYearEnd}.xml`,
    filePath: `${config.exportDir}/corporate_inhabitant_tax_${declaration.corporateNumber}_${declaration.fiscalYearEnd}.xml`,
    declarationType: 'corporate_inhabitant_tax',
    content: xml,
    encoding: 'UTF-8',
  };
}

/**
 * 給与支払報告書（特別徴収）用XMLを生成
 */
export function generateWithholdingReportXml(
  employer: { corporateNumber: string; name: string; designationNumber: string; address: string },
  employees: SpecialCollectionEmployee[],
  year: number
): PcdeskXmlFile {
  const employeeXml = employees.map(emp => `
    <employee>
      <employeeNumber>${emp.employeeNumber || ''}</employeeNumber>
      <name>${emp.name}</name>
      <address>${emp.address}</address>
      <annualTaxAmount>${emp.annualTaxAmount}</annualTaxAmount>
      <municipalityCode>${emp.municipalityCode}</municipalityCode>
    </employee>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eLTAX>
  <header>
    <declarationType>withholding_report</declarationType>
    <year>${year}</year>
  </header>
  <body>
    <employer>
      <corporateNumber>${employer.corporateNumber}</corporateNumber>
      <name>${employer.name}</name>
      <designationNumber>${employer.designationNumber}</designationNumber>
      <address>${employer.address}</address>
    </employer>
    <employees>${employeeXml}
    </employees>
  </body>
</eLTAX>`;

  return {
    fileName: `withholding_report_${employer.corporateNumber}_${year}.xml`,
    filePath: `${config.exportDir}/withholding_report_${employer.corporateNumber}_${year}.xml`,
    declarationType: 'withholding_report',
    content: xml,
    encoding: 'UTF-8',
  };
}

// ============================================================
// 特別徴収税額管理
// ============================================================

/**
 * 特別徴収税額通知データを解析
 * eLTAXから電子データで受信した特別徴収税額通知を管理用オブジェクトに変換
 */
export function parseSpecialCollectionNotice(xmlContent: string): SpecialCollectionNotice {
  // 簡易パース（実運用ではXMLパーサーライブラリを使用）
  const yearMatch = xmlContent.match(/<year>(\d+)<\/year>/);
  return {
    year: parseInt(yearMatch?.[1] || '0', 10),
    employer: {
      corporateNumber: '',
      name: '',
      designationNumber: '',
      address: '',
    },
    employees: [],
  };
}

/**
 * 従業員の月別特別徴収税額を計算
 * 年税額を12分割（6月は端数調整）
 */
export function calculateMonthlyTax(annualAmount: number): Array<{ month: number; amount: number }> {
  const baseAmount = Math.floor(annualAmount / 12);
  const remainder = annualAmount - baseAmount * 12;

  return Array.from({ length: 12 }, (_, i) => {
    const month = ((i + 5) % 12) + 1; // 6月始まり
    return {
      month,
      amount: month === 6 ? baseAmount + remainder : baseAmount,
    };
  });
}

// ============================================================
// 地方税共通納税
// ============================================================

/**
 * 地方税共通納税システムのURL取得
 * PCdesk(WEB版)経由で電子納税を行う
 */
export function getCommonTaxPaymentUrl(): string {
  return config.pcdeskWebUrl;
}

/**
 * 地方税共通納税データのサマリーを生成
 */
export function summarizeCommonTaxPayments(payments: CommonTaxPayment[]): {
  totalAmount: number;
  byType: Record<string, number>;
  byGovernment: Record<string, number>;
} {
  const byType: Record<string, number> = {};
  const byGovernment: Record<string, number> = {};
  let totalAmount = 0;

  for (const payment of payments) {
    totalAmount += payment.amount;
    byType[payment.paymentType] = (byType[payment.paymentType] || 0) + payment.amount;
    byGovernment[payment.localGovernmentName] = (byGovernment[payment.localGovernmentName] || 0) + payment.amount;
  }

  return { totalAmount, byType, byGovernment };
}

// ============================================================
// PCdesk URL
// ============================================================

/** eLTAXポータルURL */
export function getPortalUrl(): string {
  return config.portalUrl;
}

/** PCdesk(WEB版) URL */
export function getPcdeskWebUrl(): string {
  return config.pcdeskWebUrl;
}

/** PCdesk(DL版)ダウンロードページURL */
export function getPcdeskDownloadUrl(): string {
  return 'https://www.eltax.lta.go.jp/eltax/software/';
}
