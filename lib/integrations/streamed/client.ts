/**
 * STREAMED連携 クライアント
 *
 * STREAMEDは一般公開のREST APIを提供していないため、
 * 本モジュールはCSV連携のヘルパー関数を提供する。
 *
 * 連携方式:
 * 1. freee会計とのAPI連携（STREAMED管理画面から設定）
 * 2. MFクラウド会計とのAPI連携（STREAMED管理画面から設定）
 * 3. CSVエクスポート → 各会計ソフトにインポート
 * 4. CSVインポート（過去仕訳参照用）
 *
 * 公式: https://streamedup.com/
 * 連携ヘルプ: https://streamedup.com/help/10581
 */

import type {
  StreamedJournalEntry,
  StreamedAccountItem,
  SupportedAccountingSoftware,
  StreamedCsvExport,
  StreamedCsvImport,
} from './types';

// ============================================================
// CSV生成ヘルパー（仕訳データ → CSV）
// ============================================================

/**
 * 汎用CSV形式で仕訳データをエクスポート
 *
 * @param entries - 仕訳データ配列
 * @param encoding - 文字コード（デフォルト: UTF-8）
 * @returns CSVテキスト
 */
export function exportGenericCsv(entries: StreamedJournalEntry[], encoding: 'Shift_JIS' | 'UTF-8' = 'UTF-8'): string {
  const headers = [
    '日付',
    '借方勘定科目コード', '借方勘定科目', '借方補助科目コード', '借方補助科目',
    '借方部門コード', '借方部門', '借方税区分', '借方金額', '借方消費税額',
    '貸方勘定科目コード', '貸方勘定科目', '貸方補助科目コード', '貸方補助科目',
    '貸方部門コード', '貸方部門', '貸方税区分', '貸方金額', '貸方消費税額',
    '摘要', '伝票番号', 'メモ',
  ];

  const rows = entries.map(e => [
    e.date,
    e.debitAccountCode, e.debitAccountName, e.debitSubAccountCode || '', e.debitSubAccountName || '',
    e.debitDepartmentCode || '', e.debitDepartmentName || '', e.debitTaxCategory || '',
    String(e.debitAmount), e.debitTaxAmount != null ? String(e.debitTaxAmount) : '',
    e.creditAccountCode, e.creditAccountName, e.creditSubAccountCode || '', e.creditSubAccountName || '',
    e.creditDepartmentCode || '', e.creditDepartmentName || '', e.creditTaxCategory || '',
    String(e.creditAmount), e.creditTaxAmount != null ? String(e.creditTaxAmount) : '',
    `"${e.description.replace(/"/g, '""')}"`,
    e.voucherNumber || '', e.memo || '',
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * freee会計向けCSV形式で仕訳データをエクスポート
 *
 * freee会計のCSVインポート形式に準拠
 */
export function exportFreeeCsv(entries: StreamedJournalEntry[]): string {
  const headers = [
    '収支区分', '管理番号', '発生日', '決済期日', '取引先', '勘定科目', '税区分',
    '金額', '税計算区分', '税額', '備考', '品目', 'メモタグ', '部門',
    '決済口座', '決済金額',
  ];

  const rows = entries.map(e => [
    '', '', // 収支区分, 管理番号
    e.date,
    '', '', // 決済期日, 取引先
    e.debitAccountName,
    e.debitTaxCategory || '',
    String(e.debitAmount),
    '', // 税計算区分
    e.debitTaxAmount != null ? String(e.debitTaxAmount) : '',
    `"${e.description.replace(/"/g, '""')}"`,
    '', '', // 品目, メモタグ
    e.debitDepartmentName || '',
    '', '', // 決済口座, 決済金額
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * MFクラウド会計向けCSV形式で仕訳データをエクスポート
 *
 * MFクラウド会計のCSVインポート形式に準拠
 */
export function exportMoneyForwardCsv(entries: StreamedJournalEntry[]): string {
  const headers = [
    '取引No', '取引日', '借方勘定科目', '借方補助科目', '借方税区分',
    '借方部門', '借方金額', '借方税額', '貸方勘定科目', '貸方補助科目',
    '貸方税区分', '貸方部門', '貸方金額', '貸方税額', '摘要',
  ];

  const rows = entries.map((e, i) => [
    String(i + 1),
    e.date,
    e.debitAccountName, e.debitSubAccountName || '', e.debitTaxCategory || '',
    e.debitDepartmentName || '', String(e.debitAmount),
    e.debitTaxAmount != null ? String(e.debitTaxAmount) : '',
    e.creditAccountName, e.creditSubAccountName || '', e.creditTaxCategory || '',
    e.creditDepartmentName || '', String(e.creditAmount),
    e.creditTaxAmount != null ? String(e.creditTaxAmount) : '',
    `"${e.description.replace(/"/g, '""')}"`,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * 弥生会計向けCSV形式で仕訳データをエクスポート
 */
export function exportYayoiCsv(entries: StreamedJournalEntry[]): string {
  const headers = [
    '識別フラグ', '伝票No.', '決算', '取引日付', '借方勘定科目', '借方補助科目',
    '借方部門', '借方税区分', '借方金額', '借方税金額',
    '貸方勘定科目', '貸方補助科目', '貸方部門', '貸方税区分', '貸方金額', '貸方税金額',
    '摘要', '番号', '期日', 'タイプ', '生成元', '仕訳メモ',
  ];

  const rows = entries.map((e, i) => [
    '2000', // 識別フラグ（仕訳データ）
    e.voucherNumber || String(i + 1),
    '', // 決算
    e.date,
    e.debitAccountName, e.debitSubAccountName || '',
    e.debitDepartmentName || '', e.debitTaxCategory || '',
    String(e.debitAmount), e.debitTaxAmount != null ? String(e.debitTaxAmount) : '',
    e.creditAccountName, e.creditSubAccountName || '',
    e.creditDepartmentName || '', e.creditTaxCategory || '',
    String(e.creditAmount), e.creditTaxAmount != null ? String(e.creditTaxAmount) : '',
    `"${e.description.replace(/"/g, '""')}"`,
    '', '', '0', '0', e.memo || '',
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

// ============================================================
// CSVパースヘルパー（CSV → 仕訳データ）
// ============================================================

/**
 * 汎用CSVを仕訳データにパース
 *
 * @param csvContent - CSVテキスト
 * @returns 仕訳データ配列
 */
export function parseGenericCsv(csvContent: string): StreamedJournalEntry[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // ヘッダー行をスキップ
  return lines.slice(1).map(line => {
    const fields = parseCsvLine(line);
    return {
      date: fields[0] || '',
      debitAccountCode: fields[1] || '',
      debitAccountName: fields[2] || '',
      debitSubAccountCode: fields[3] || null,
      debitSubAccountName: fields[4] || null,
      debitDepartmentCode: fields[5] || null,
      debitDepartmentName: fields[6] || null,
      debitTaxCategory: fields[7] || null,
      debitAmount: parseInt(fields[8] || '0', 10),
      debitTaxAmount: fields[9] ? parseInt(fields[9], 10) : null,
      creditAccountCode: fields[10] || '',
      creditAccountName: fields[11] || '',
      creditSubAccountCode: fields[12] || null,
      creditSubAccountName: fields[13] || null,
      creditDepartmentCode: fields[14] || null,
      creditDepartmentName: fields[15] || null,
      creditTaxCategory: fields[16] || null,
      creditAmount: parseInt(fields[17] || '0', 10),
      creditTaxAmount: fields[18] ? parseInt(fields[18], 10) : null,
      description: fields[19] || '',
      voucherNumber: fields[20] || null,
      memo: fields[21] || null,
    };
  });
}

/** CSVの1行をパース（ダブルクォート対応） */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ============================================================
// 勘定科目マスタ（インポート/エクスポート）
// ============================================================

/** 勘定科目マスタをCSVにエクスポート */
export function exportAccountItemsCsv(items: StreamedAccountItem[]): string {
  const headers = ['科目コード', '科目名', 'カテゴリ', '税区分'];
  const rows = items.flatMap(item => {
    const mainRow = [item.code, item.name, item.category, item.taxCategory || ''];
    const subRows = item.subAccounts.map(sub => [
      `${item.code}-${sub.code}`, sub.name, item.category, '',
    ]);
    return [mainRow, ...subRows];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** 勘定科目マスタCSVをパース */
export function parseAccountItemsCsv(csvContent: string): StreamedAccountItem[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const items: Map<string, StreamedAccountItem> = new Map();

  for (const line of lines.slice(1)) {
    const fields = parseCsvLine(line);
    const code = fields[0] || '';
    const name = fields[1] || '';
    const category = (fields[2] || 'expense') as StreamedAccountItem['category'];

    if (code.includes('-')) {
      // 補助科目
      const [parentCode, subCode] = code.split('-');
      const parent = items.get(parentCode);
      if (parent) {
        parent.subAccounts.push({ code: subCode, name });
      }
    } else {
      items.set(code, {
        code,
        name,
        category,
        taxCategory: fields[3] || null,
        subAccounts: [],
      });
    }
  }

  return Array.from(items.values());
}

// ============================================================
// エクスポート情報生成
// ============================================================

/**
 * 会計ソフト別のCSVエクスポート情報を生成
 */
export function createCsvExport(
  entries: StreamedJournalEntry[],
  targetSoftware: SupportedAccountingSoftware,
  periodFrom: string,
  periodTo: string
): StreamedCsvExport {
  let content: string;
  let fileExtension: StreamedCsvExport['fileExtension'] = 'csv';
  let encoding: StreamedCsvExport['encoding'] = 'UTF-8';

  switch (targetSoftware) {
    case 'freee':
      content = exportFreeeCsv(entries);
      break;
    case 'moneyforward':
      content = exportMoneyForwardCsv(entries);
      break;
    case 'yayoi':
      content = exportYayoiCsv(entries);
      encoding = 'Shift_JIS';
      break;
    default:
      content = exportGenericCsv(entries);
      break;
  }

  return {
    fileName: `streamed_${targetSoftware}_${periodFrom}_${periodTo}.${fileExtension}`,
    targetSoftware,
    fileExtension,
    encoding,
    periodFrom,
    periodTo,
    entryCount: entries.length,
    content,
  };
}
