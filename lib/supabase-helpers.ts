import { supabase } from './supabase';
import type { Client } from '@/data/clients';
import type { Task } from '@/data/tasks';

// ============================
// Status mapping: DB -> Frontend
// ============================
const statusMap: Record<string, Task['status']> = {
  pending: '\u672A\u7740\u624B',
  in_progress: '\u9032\u884C\u4E2D',
  review: '\u78BA\u8A8D\u5F85\u3061',
  completed: '\u5B8C\u4E86',
};

const reverseStatusMap: Record<string, string> = {
  '\u672A\u7740\u624B': 'pending',
  '\u9032\u884C\u4E2D': 'in_progress',
  '\u78BA\u8A8D\u5F85\u3061': 'review',
  '\u5B8C\u4E86': 'completed',
};

// Category mapping: DB -> Frontend
const categoryMap: Record<string, Task['category']> = {
  monthly: '\u6708\u6B21\u51E6\u7406',
  annual: '\u6C7A\u7B97',
  corporate_tax: '\u6CD5\u4EBA\u7A0E\u7533\u544A',
  consumption_tax: '\u6D88\u8CBB\u7A0E\u7533\u544A',
  year_end: '\u5E74\u672B\u8ABF\u6574',
  payroll: '\u7D66\u4E0E\u8A08\u7B97',
};

// Software mapping: DB -> Frontend
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
  if (!supabase) return [];

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
    assignedStaff: c.staff?.name || '\u672A\u5272\u5F53',
    status: (c.status === 'active' ? 'active' : 'inactive') as Client['status'],
    rank: (c.rank || 'B') as Client['rank'],
    type: (c.type?.includes('individual') ? 'individual' : 'corporate') as Client['type'],
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
  if (!supabase) return [];

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
    clientName: t.clients?.name || '\u4E0D\u660E',
    category: categoryMap[t.category] || '\u6708\u6B21\u51E6\u7406',
    status: statusMap[t.status] || '\u672A\u7740\u624B',
    priority: (t.priority || 'medium') as Task['priority'],
    assignedStaff: t.staff?.name || '\u672A\u5272\u5F53',
    dueDate: t.due_date || '',
    description: t.description || '',
  }));
}

// ============================
// Update task status
// ============================
export async function updateTaskStatus(taskId: string, newStatus: string): Promise<boolean> {
  if (!supabase) return false;

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
  if (!supabase) return false;

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
