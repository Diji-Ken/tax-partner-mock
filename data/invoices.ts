export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  tax: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: '下書き' | '送付済' | '入金済' | '未入金';
  items: { description: string; amount: number }[];
};

export const invoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2026-001', clientId: '1', clientName: '株式会社サクラテック', amount: 50000, tax: 5000, totalAmount: 55000, issueDate: '2026-03-01', dueDate: '2026-03-31', status: '入金済', items: [{ description: '3月度顧問料', amount: 50000 }] },
  { id: '2', invoiceNumber: 'INV-2026-002', clientId: '2', clientName: '株式会社ヤマダHD', amount: 80000, tax: 8000, totalAmount: 88000, issueDate: '2026-03-01', dueDate: '2026-03-31', status: '送付済', items: [{ description: '3月度顧問料', amount: 80000 }] },
  { id: '3', invoiceNumber: 'INV-2026-003', clientId: '4', clientName: '株式会社フジタ建設', amount: 60000, tax: 6000, totalAmount: 66000, issueDate: '2026-03-01', dueDate: '2026-03-31', status: '入金済', items: [{ description: '3月度顧問料', amount: 60000 }] },
  { id: '4', invoiceNumber: 'INV-2026-004', clientId: '7', clientName: '株式会社アオゾラ', amount: 70000, tax: 7000, totalAmount: 77000, issueDate: '2026-03-01', dueDate: '2026-03-31', status: '未入金', items: [{ description: '3月度顧問料', amount: 70000 }] },
  { id: '5', invoiceNumber: 'INV-2026-005', clientId: '11', clientName: '株式会社グローバルIT', amount: 90000, tax: 9000, totalAmount: 99000, issueDate: '2026-03-01', dueDate: '2026-03-31', status: '送付済', items: [{ description: '3月度顧問料', amount: 90000 }] },
  { id: '6', invoiceNumber: 'INV-2026-006', clientId: '3', clientName: '株式会社マルハシ商事', amount: 35000, tax: 3500, totalAmount: 38500, issueDate: '2026-03-01', dueDate: '2026-03-31', status: '入金済', items: [{ description: '3月度顧問料', amount: 35000 }] },
  { id: '7', invoiceNumber: 'INV-2026-007', clientId: '8', clientName: '医療法人さくら', amount: 45000, tax: 4500, totalAmount: 49500, issueDate: '2026-03-01', dueDate: '2026-03-31', status: '下書き', items: [{ description: '3月度顧問料', amount: 45000 }] },
  { id: '8', invoiceNumber: 'INV-2026-008', clientId: '6', clientName: '合同会社ミライ', amount: 25000, tax: 2500, totalAmount: 27500, issueDate: '2026-03-01', dueDate: '2026-03-31', status: '送付済', items: [{ description: '3月度顧問料', amount: 25000 }] },
];
