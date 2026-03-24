import { supabase } from './supabase';
import type { Client } from '@/data/clients';
import type { Task } from '@/data/tasks';

// ============================
// Status mapping: DB → Frontend
// ============================
const statusMap: Record<string, Task['status']> = {
  pending: '未着手',
  in_progress: '進行中',
  review: '確認待ち',
  completed: '完了',
};

const reverseStatusMap: Record<string, string> = {
  '未着手': 'pending',
  '進行中': 'in_progress',
  '確認待ち': 'review',
  '完了': 'completed',
};

// Category mapping: DB → Frontend
const categoryMap: Record<string, Task['category']> = {
  monthly: '月次処理',
  annual: '決算',
  corporate_tax: '法人税申告',
  consumption_tax: '消費税申告',
  year_end: '年末調整',
  payroll: '給与計算',
};

// Software mapping: DB → Frontend
const softwareMap: Record<string, Client['accountingSoftware']> = {
  freee: 'freee',
  MF: 'MF',
  yayoi: 'yayoi',
  other: 'other',
};

// ============================
// Fetch clients with staff name join
// ============================
export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*, staff:assigned_staff_id(id, name)')
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.error('Failed to fetch clients:', error);
    return [];
  }

  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    representative: c.representative || '',
    settlementMonth: c.settlement_month || 3,
    accountingSoftware: softwareMap[c.accounting_software] || 'other',
    monthlyFee: c.monthly_fee || 0,
    assignedStaff: c.staff?.name || '未割当',
    status: (c.status === 'active' ? 'active' : 'inactive') as Client['status'],
    rank: (c.rank || 'B') as Client['rank'],
    type: c.type?.includes('individual') ? 'individual' : 'corporate' as Client['type'],
    phone: c.phone || '',
    email: c.email || '',
    industry: c.industry || '',
    registeredDate: c.registration_date || '',
  }));
}

// ============================
// Fetch tasks with client name + staff name join
// ============================
export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, clients:client_id(id, name), staff:assigned_to(id, name)')
    .order('due_date', { ascending: true });

  if (error || !data) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }

  return data.map((t: any) => ({
    id: t.id,
    title: t.title,
    clientId: t.client_id,
    clientName: t.clients?.name || '不明',
    category: categoryMap[t.category] || '月次処理',
    status: statusMap[t.status] || '未着手',
    priority: (t.priority || 'medium') as Task['priority'],
    assignedStaff: t.staff?.name || '未割当',
    dueDate: t.due_date || '',
    description: t.description || '',
  }));
}

// ============================
// Update task status
// ============================
export async function updateTaskStatus(taskId: string, newStatus: string): Promise<boolean> {
  const dbStatus = reverseStatusMap[newStatus] || newStatus;
  const { error } = await supabase
    .from('tasks')
    .update({
      status: dbStatus,
      ...(dbStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', taskId);

  if (error) {
    console.error('Failed to update task status:', error);
    return false;
  }
  return true;
}

// ============================
// Insert new client
// ============================
export async function insertClient(client: {
  name: string;
  representative: string;
  type: string;
  settlementMonth: number;
  accountingSoftware: string;
  monthlyFee: number;
  phone: string;
  email: string;
  industry: string;
}): Promise<boolean> {
  const { error } = await supabase.from('clients').insert({
    office_id: '00000000-0000-0000-0000-000000000001',
    name: client.name,
    representative: client.representative,
    type: client.type === 'individual' ? 'individual' : 'new_corporate',
    settlement_month: client.settlementMonth,
    accounting_software: client.accountingSoftware,
    monthly_fee: client.monthlyFee,
    phone: client.phone,
    email: client.email,
    industry: client.industry,
    rank: 'B',
    status: 'active',
    registration_date: new Date().toISOString().split('T')[0],
  });

  if (error) {
    console.error('Failed to insert client:', error);
    return false;
  }
  return true;
}
