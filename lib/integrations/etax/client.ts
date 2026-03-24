/**
 * e-Tax連携 クライアント
 *
 * e-Taxは通常のREST APIを公開していないため、本モジュールは以下の機能を提供:
 * 1. XBRL形式の申告データ作成ヘルパー
 * 2. 受付番号の管理
 * 3. クラウドサービス連携APIの呼び出し（デジタル庁仕様準拠）
 *
 * 公式: https://www.e-tax.nta.go.jp/
 * ソフトウェア開発者向け: https://www.e-tax.nta.go.jp/shiyo/index.htm
 * クラウドサービスAPI仕様: デジタル庁公開（認定クラウドサービス向け）
 */

import type {
  XbrlDocument,
  FinancialStatementXbrl,
  FinancialStatementCsv,
  EtaxSubmissionResult,
  EtaxReceiptRecord,
  CloudServiceApiRequest,
  CloudServiceApiResponse,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** e-Tax利用者識別番号 */
  userId: process.env.ETAX_USER_ID || 'demo_user_id',
  /** クラウドサービス連携API Base URL（認定クラウド向け） */
  cloudApiBaseUrl: process.env.ETAX_CLOUD_API_URL || 'https://uketsuke.e-tax.nta.go.jp/api',
};

// ============================================================
// XBRL申告データ作成ヘルパー
// ============================================================

/**
 * XBRL申告データのXMLテンプレートを生成
 *
 * @param doc - 申告データのメタ情報
 * @returns XBRL形式のXMLテキスト
 *
 * Note: 実際のXBRLデータ作成には国税庁が公開するタクソノミに準拠する必要がある。
 * このヘルパーはテンプレートの骨格のみ生成する。
 */
export function generateXbrlTemplate(doc: Omit<XbrlDocument, 'xbrlContent'>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xbrli:xbrl
  xmlns:xbrli="http://www.xbrl.org/2003/instance"
  xmlns:link="http://www.xbrl.org/2003/linkbase"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:iso4217="http://www.xbrl.org/2003/iso4217">
  <link:schemaRef xlink:type="simple" xlink:href="etax_taxonomy.xsd"/>
  <xbrli:context id="CurrentYearDuration">
    <xbrli:entity>
      <xbrli:identifier scheme="http://www.e-tax.nta.go.jp">${doc.corporateNumber}</xbrli:identifier>
    </xbrli:entity>
    <xbrli:period>
      <xbrli:startDate>${doc.fiscalYearStart}</xbrli:startDate>
      <xbrli:endDate>${doc.fiscalYearEnd}</xbrli:endDate>
    </xbrli:period>
  </xbrli:context>
  <xbrli:unit id="JPY">
    <xbrli:measure>iso4217:JPY</xbrli:measure>
  </xbrli:unit>
  <!-- 申告データ本体はここに挿入 -->
</xbrli:xbrl>`;
}

/**
 * 財務諸表XBRL文書のテンプレートを生成
 */
export function generateFinancialStatementXbrl(
  documentType: FinancialStatementXbrl['documentType'],
  fiscalYear: string,
  corporateNumber: string
): FinancialStatementXbrl {
  const typeNames: Record<string, string> = {
    bs: 'BalanceSheet',
    pl: 'ProfitAndLossStatement',
    ss: 'StatementOfChangesInEquity',
    cf: 'CashFlowStatement',
    notes: 'NotesToFinancialStatements',
  };
  const fileName = `${typeNames[documentType]}_${fiscalYear}.xbrl`;

  return {
    documentType,
    fiscalYear,
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${typeNames[documentType]} XBRL Template -->
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance">
  <xbrli:context id="CurrentYearDuration">
    <xbrli:entity>
      <xbrli:identifier scheme="http://www.e-tax.nta.go.jp">${corporateNumber}</xbrli:identifier>
    </xbrli:entity>
    <xbrli:period>
      <xbrli:startDate>${fiscalYear}-04-01</xbrli:startDate>
      <xbrli:endDate>${parseInt(fiscalYear) + 1}-03-31</xbrli:endDate>
    </xbrli:period>
  </xbrli:context>
  <!-- 財務諸表データをここに挿入 -->
</xbrli:xbrl>`,
    fileName,
  };
}

/**
 * CSV形式の財務諸表データを生成（2020年4月以降対応）
 */
export function generateFinancialStatementCsv(
  documentType: FinancialStatementCsv['documentType'],
  data: Array<{ accountName: string; amount: number }>
): FinancialStatementCsv {
  const header = '勘定科目,金額';
  const rows = data.map(d => `"${d.accountName}",${d.amount}`).join('\n');

  return {
    documentType,
    content: `${header}\n${rows}`,
    fileName: `${documentType}_financial_statement.csv`,
    encoding: 'UTF-8',
  };
}

// ============================================================
// 受付番号管理
// ============================================================

/** 受付番号レコードの保存（ローカルストレージ用ヘルパー） */
export function createReceiptRecord(
  result: EtaxSubmissionResult,
  taxType: string,
  fiscalYear: string,
  corporateNumber: string,
  corporateName: string
): EtaxReceiptRecord {
  return {
    receiptNumber: result.receiptNumber,
    submissionDate: result.receiptDate,
    taxType,
    fiscalYear,
    corporateNumber,
    corporateName,
    status: result.status === 'accepted' ? 'accepted' : 'rejected',
    memo: null,
  };
}

// ============================================================
// クラウドサービス連携API（デジタル庁仕様）
// ============================================================

/**
 * クラウドサービス連携APIで申告データを送信
 *
 * Note: このAPIは「認定クラウドサービス」事業者のみ利用可能。
 * デジタル庁が公開する「クラウドサービス等を利用した法定調書の提出を行うAPI仕様書」に準拠。
 * 一般の税理士事務所が直接利用する場合はe-Taxソフト(WEB版)またはe-Taxソフトを使用する。
 */
export async function submitViaCloudApi(
  request: CloudServiceApiRequest
): Promise<CloudServiceApiResponse> {
  const url = `${config.cloudApiBaseUrl}/submit`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`e-Tax Cloud API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.json() as Promise<CloudServiceApiResponse>;
}

// ============================================================
// e-Taxソフト(WEB版) URL生成
// ============================================================

/** e-Taxソフト(WEB版)のログインURL */
export function getEtaxWebUrl(): string {
  return 'https://clientweb.e-tax.nta.go.jp/UF_WEB/WP000/FCSE00001/SE00S010SCR.do';
}

/** e-Tax受付システムのURL */
export function getEtaxReceptionUrl(): string {
  return 'https://uketsuke.e-tax.nta.go.jp/';
}
