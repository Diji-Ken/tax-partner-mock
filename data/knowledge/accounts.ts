export type AccountItem = {
  code: string;
  name: string;
  category: '資産' | '負債' | '純資産' | '収益' | '費用';
  taxType: '課税' | '非課税' | '不課税' | '対象外';
  description: string;
};

export const accounts: AccountItem[] = [
  { code: '1100', name: '現金', category: '資産', taxType: '対象外', description: '手許現金' },
  { code: '1110', name: '普通預金', category: '資産', taxType: '対象外', description: '普通預金口座' },
  { code: '1120', name: '当座預金', category: '資産', taxType: '対象外', description: '当座預金口座' },
  { code: '1300', name: '売掛金', category: '資産', taxType: '対象外', description: '売上に係る債権' },
  { code: '2100', name: '買掛金', category: '負債', taxType: '対象外', description: '仕入に係る債務' },
  { code: '2200', name: '未払金', category: '負債', taxType: '対象外', description: '営業外の未払金' },
  { code: '4100', name: '売上高', category: '収益', taxType: '課税', description: '本業の売上' },
  { code: '5100', name: '仕入高', category: '費用', taxType: '課税', description: '商品・原材料の仕入' },
  { code: '6100', name: '給料手当', category: '費用', taxType: '不課税', description: '従業員給与' },
  { code: '6200', name: '通信費', category: '費用', taxType: '課税', description: '電話・インターネット等' },
  { code: '6300', name: '消耗品費', category: '費用', taxType: '課税', description: '事務用品等' },
  { code: '6400', name: '旅費交通費', category: '費用', taxType: '課税', description: '出張・交通費' },
  { code: '6500', name: '水道光熱費', category: '費用', taxType: '課税', description: '電気・ガス・水道' },
  { code: '6600', name: '車両費', category: '費用', taxType: '課税', description: 'ガソリン・車両関連' },
  { code: '6700', name: '地代家賃', category: '費用', taxType: '課税', description: '事務所家賃等' },
];
