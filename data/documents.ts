export type DocumentFolder = {
  id: string;
  name: string;
  type: 'client' | 'year' | 'category';
  parentId: string | null;
  children?: DocumentFolder[];
};

export type DocumentFile = {
  id: string;
  name: string;
  folderId: string;
  type: 'pdf' | 'xlsx' | 'csv' | 'doc';
  size: string;
  updatedAt: string;
  electronicBookCompliant: boolean;
  category: '決算書' | '申告書' | '月次報告' | '契約書' | '届出書' | '給与関連' | 'その他';
};

export const folders: DocumentFolder[] = [
  { id: 'c1', name: '株式会社サクラテック', type: 'client', parentId: null },
  { id: 'c1-2025', name: '2025年度', type: 'year', parentId: 'c1' },
  { id: 'c1-2025-kessan', name: '決算書類', type: 'category', parentId: 'c1-2025' },
  { id: 'c1-2025-monthly', name: '月次報告', type: 'category', parentId: 'c1-2025' },
  { id: 'c1-2026', name: '2026年度', type: 'year', parentId: 'c1' },
  { id: 'c1-2026-monthly', name: '月次報告', type: 'category', parentId: 'c1-2026' },
  { id: 'c2', name: '株式会社ヤマダHD', type: 'client', parentId: null },
  { id: 'c2-2025', name: '2025年度', type: 'year', parentId: 'c2' },
  { id: 'c2-2025-kessan', name: '決算書類', type: 'category', parentId: 'c2-2025' },
  { id: 'c3', name: '株式会社マルハシ商事', type: 'client', parentId: null },
  { id: 'c3-2025', name: '2025年度', type: 'year', parentId: 'c3' },
  { id: 'c3-2025-monthly', name: '月次報告', type: 'category', parentId: 'c3-2025' },
  { id: 'c4', name: '株式会社フジタ建設', type: 'client', parentId: null },
  { id: 'c4-2025', name: '2025年度', type: 'year', parentId: 'c4' },
  { id: 'c4-2025-kessan', name: '決算書類', type: 'category', parentId: 'c4-2025' },
];

export const files: DocumentFile[] = [
  { id: 'f1', name: '決算報告書_2025.pdf', folderId: 'c1-2025-kessan', type: 'pdf', size: '2.4MB', updatedAt: '2025-06-15', electronicBookCompliant: true, category: '決算書' },
  { id: 'f2', name: '法人税申告書_2025.pdf', folderId: 'c1-2025-kessan', type: 'pdf', size: '1.8MB', updatedAt: '2025-06-20', electronicBookCompliant: true, category: '申告書' },
  { id: 'f3', name: '月次試算表_2025_12.xlsx', folderId: 'c1-2025-monthly', type: 'xlsx', size: '450KB', updatedAt: '2026-01-10', electronicBookCompliant: true, category: '月次報告' },
  { id: 'f4', name: '月次試算表_2026_01.xlsx', folderId: 'c1-2026-monthly', type: 'xlsx', size: '420KB', updatedAt: '2026-02-10', electronicBookCompliant: true, category: '月次報告' },
  { id: 'f5', name: '月次試算表_2026_02.xlsx', folderId: 'c1-2026-monthly', type: 'xlsx', size: '430KB', updatedAt: '2026-03-10', electronicBookCompliant: true, category: '月次報告' },
  { id: 'f6', name: '決算報告書_2025.pdf', folderId: 'c2-2025-kessan', type: 'pdf', size: '3.1MB', updatedAt: '2025-06-30', electronicBookCompliant: true, category: '決算書' },
  { id: 'f7', name: '顧問契約書.pdf', folderId: 'c2-2025-kessan', type: 'pdf', size: '890KB', updatedAt: '2023-10-01', electronicBookCompliant: false, category: '契約書' },
  { id: 'f8', name: '月次試算表_2025_12.xlsx', folderId: 'c3-2025-monthly', type: 'xlsx', size: '380KB', updatedAt: '2026-01-08', electronicBookCompliant: true, category: '月次報告' },
  { id: 'f9', name: '決算報告書_2025.pdf', folderId: 'c4-2025-kessan', type: 'pdf', size: '2.8MB', updatedAt: '2025-09-15', electronicBookCompliant: true, category: '決算書' },
  { id: 'f10', name: '消費税申告書_2025.pdf', folderId: 'c4-2025-kessan', type: 'pdf', size: '1.2MB', updatedAt: '2025-09-20', electronicBookCompliant: true, category: '申告書' },
];
