/**
 * 国税庁 法人番号公表システム Web-API クライアント
 *
 * 公式: https://www.houjin-bangou.nta.go.jp/webapi/
 * 仕様書: https://www.houjin-bangou.nta.go.jp/webapi/kyuusiyousyo.html
 * Base URL: https://api.houjin-bangou.nta.go.jp
 *
 * 認証: アプリケーションID（事前申請制・無料）
 * APIスタイル: REST（GETリクエストのみ）
 * レスポンス形式: XML / CSV（JSONは非対応）
 */

import type {
  CorporateNumResponse,
  CorporateNameResponse,
  CorporateDiffResponse,
  Corporation,
} from './types';

// ============================================================
// 設定
// ============================================================

const config = {
  /** アプリケーションID（国税庁に申請して取得） */
  applicationId: process.env.NTA_CORPORATE_APP_ID || 'demo_application_id',
  /** Base URL */
  baseUrl: 'https://api.houjin-bangou.nta.go.jp',
  /** APIバージョン (1, 2, 3, 4) */
  version: '4',
};

// ============================================================
// XMLパーサー（簡易版）
// ============================================================

/**
 * XMLレスポンスを法人情報オブジェクトにパース
 * 実運用ではxml2jsやfast-xml-parser等のライブラリ使用を推奨
 */
function parseXmlResponse(xml: string): { corporations: Corporation[]; count: number; lastUpdateDate: string } {
  // 簡易パース: 実運用ではXMLパーサーライブラリを使用
  const countMatch = xml.match(/<count>(\d+)<\/count>/);
  const lastUpdateMatch = xml.match(/<lastUpdateDate>([^<]+)<\/lastUpdateDate>/);
  const corporationBlocks = xml.match(/<corporation>[\s\S]*?<\/corporation>/g) || [];

  const corporations: Corporation[] = corporationBlocks.map((block) => {
    const getField = (tag: string): string | null => {
      const match = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1] || null : null;
    };
    return {
      sequenceNumber: parseInt(getField('sequenceNumber') || '0', 10),
      corporateNumber: getField('corporateNumber') || '',
      process: getField('process') || '',
      correct: (getField('correct') || '0') as '0' | '1',
      updateDate: getField('updateDate') || '',
      changeDate: getField('changeDate') || '',
      name: getField('name') || '',
      nameImageId: getField('nameImageId'),
      kind: getField('kind') || '',
      prefectureCode: getField('prefectureCode'),
      cityCode: getField('cityCode'),
      streetNumber: getField('streetNumber'),
      addressImageId: getField('addressImageId'),
      prefectureName: getField('prefectureName'),
      cityName: getField('cityName'),
      postCode: getField('postCode'),
      addressOutside: getField('addressOutside'),
      addressOutsideImageId: getField('addressOutsideImageId'),
      closeDate: getField('closeDate'),
      closeCause: getField('closeCause'),
      successorCorporateNumber: getField('successorCorporateNumber'),
      changeCause: getField('changeCause'),
      assignmentDate: getField('assignmentDate'),
      latest: (getField('latest') || '0') as '0' | '1',
      enName: getField('enName'),
      enPrefectureName: getField('enPrefectureName'),
      enCityName: getField('enCityName'),
      enAddressOutside: getField('enAddressOutside'),
      furigana: getField('furigana'),
      hpiUrl: getField('hpiUrl'),
    };
  });

  return {
    corporations,
    count: parseInt(countMatch?.[1] || '0', 10),
    lastUpdateDate: lastUpdateMatch?.[1] || '',
  };
}

// ============================================================
// ヘルパー
// ============================================================

function buildUrl(endpoint: string, params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  }
  return `${config.baseUrl}/${config.version}/${endpoint}?${searchParams.toString()}`;
}

async function fetchXml(url: string): Promise<string> {
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`NTA Corporate Number API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  return response.text();
}

// ============================================================
// 法人番号検索 (GET /{version}/num)
// ============================================================

/**
 * 法人番号で法人情報を検索
 *
 * @param numbers - 法人番号（13桁）の配列
 * @param opts - オプション（変更履歴の有無）
 * @returns 法人情報
 */
export async function searchByNumber(
  numbers: string[],
  opts?: { history?: boolean }
): Promise<CorporateNumResponse> {
  const url = buildUrl('num', {
    id: config.applicationId,
    number: numbers.join(','),
    type: '12', // XML形式
    history: opts?.history ? '1' : '0',
  });
  const xml = await fetchXml(url);
  const parsed = parseXmlResponse(xml);
  return {
    lastUpdateDate: parsed.lastUpdateDate,
    count: parsed.count,
    divideNumber: 1,
    divideSize: 1,
    corporations: parsed.corporations,
  };
}

// ============================================================
// 法人名検索 (GET /{version}/name)
// ============================================================

/**
 * 法人名で法人情報を検索
 *
 * @param name - 法人名（部分一致または前方一致）
 * @param opts - 検索オプション
 * @returns 法人情報一覧
 */
export async function searchByName(
  name: string,
  opts?: {
    mode?: '1' | '2'; // 1: 前方一致, 2: 部分一致
    target?: '1' | '2' | '3'; // 1: あいまい, 2: 完全一致, 3: 英語
    address?: string; // 都道府県コード (01-47)
    kind?: string; // 法人種別
    close?: boolean; // 閉鎖法人を含めるか
    history?: boolean;
    from?: number; // 取得開始件数
  }
): Promise<CorporateNameResponse> {
  const url = buildUrl('name', {
    id: config.applicationId,
    name: encodeURIComponent(name),
    type: '12',
    mode: opts?.mode || '2',
    target: opts?.target || '1',
    address: opts?.address,
    kind: opts?.kind,
    close: opts?.close ? '1' : '0',
    history: opts?.history ? '1' : '0',
    from: opts?.from?.toString(),
  });
  const xml = await fetchXml(url);
  const parsed = parseXmlResponse(xml);
  return {
    lastUpdateDate: parsed.lastUpdateDate,
    count: parsed.count,
    divideNumber: 1,
    divideSize: 1,
    corporations: parsed.corporations,
  };
}

// ============================================================
// 期間指定差分検索 (GET /{version}/diff)
// ============================================================

/**
 * 指定期間に変更があった法人情報を取得
 *
 * @param from - 取得開始日 (yyyy-MM-dd)
 * @param to - 取得終了日 (yyyy-MM-dd)
 * @param opts - オプション
 * @returns 変更された法人情報一覧
 */
export async function searchByDateRange(
  from: string,
  to: string,
  opts?: { address?: string; kind?: string; divide?: number }
): Promise<CorporateDiffResponse> {
  const url = buildUrl('diff', {
    id: config.applicationId,
    from,
    to,
    type: '12',
    address: opts?.address,
    kind: opts?.kind,
    divide: opts?.divide?.toString(),
  });
  const xml = await fetchXml(url);
  const parsed = parseXmlResponse(xml);
  return {
    lastUpdateDate: parsed.lastUpdateDate,
    count: parsed.count,
    divideNumber: 1,
    divideSize: 1,
    corporations: parsed.corporations,
  };
}

// ============================================================
// CSV/XMLダウンロード
// ============================================================

/**
 * 法人番号検索結果をCSV形式で取得
 * @param numbers - 法人番号の配列
 * @param encoding - 文字コード (01: Shift_JIS, 02: Unicode)
 */
export async function downloadCsv(
  numbers: string[],
  encoding: '01' | '02' = '02'
): Promise<string> {
  const url = buildUrl('num', {
    id: config.applicationId,
    number: numbers.join(','),
    type: encoding,
    history: '0',
  });
  return fetchXml(url); // CSVはテキストとして取得
}

/**
 * 法人名検索結果をCSV形式で取得
 */
export async function downloadCsvByName(
  name: string,
  encoding: '01' | '02' = '02'
): Promise<string> {
  const url = buildUrl('name', {
    id: config.applicationId,
    name: encodeURIComponent(name),
    type: encoding,
    mode: '2',
    target: '1',
  });
  return fetchXml(url);
}

// ============================================================
// ユーティリティ
// ============================================================

/** 法人番号の形式検証（13桁の数字） */
export function isValidCorporateNumber(number: string): boolean {
  return /^\d{13}$/.test(number);
}
