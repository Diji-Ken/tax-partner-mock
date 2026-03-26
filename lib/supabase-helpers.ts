import { supabase } from './supabase';
import type { Client } from '@/data/clients';
import type { Task } from '@/data/tasks';

// ============================
// Status mapping: DB -> Frontend
// ============================
export const statusMap: Record<string, Task['status']> = {
  pending: '\u672A\u7740\u624B',
  in_progress: '\u9032\u884C\u4E2D',
  review: '\u78BA\u8A8D\u5F85\u3061',
  completed: '\u5B8C\u4E86',
};

export const reverseStatusMap: Record<string, string> = {
  '\u672A\u7740\u624B': 'pending',
  '\u9032\u884C\u4E2D': 'in_progress',
  '\u78BA\u8A8D\u5F85\u3061': 'review',
  '\u5B8C\u4E86': 'completed',
};

// Category mapping: DB -> Frontend
export const categoryMap: Record<string, Task['category']> = {
  monthly: '\u6708\u6B21\u51E6\u7406',
  annual: '\u6C7A\u7B97',
  corporate_tax: '\u6CD5\u4EBA\u7A0E\u7533\u544A',
  consumption_tax: '\u6D88\u8CBB\u7A0E\u7533\u544A',
  year_end: '\u5E74\u672B\u8ABF\u6574',
  payroll: '\u7D66\u4E0E\u8A08\u7B97',
};

export const reverseCategoryMap: Record<string, string> = {
  '\u6708\u6B21\u51E6\u7406': 'monthly',
  '\u6C7A\u7B97': 'annual',
  '\u6CD5\u4EBA\u7A0E\u7533\u544A': 'corporate_tax',
  '\u6D88\u8CBB\u7A0E\u7533\u544A': 'consumption_tax',
  '\u5E74\u672B\u8ABF\u6574': 'year_end',
  '\u7D66\u4E0E\u8A08\u7B97': 'payroll',
};

// Software mapping: DB -> Frontend
const softwareMap: Record<string, Client['accountingSoftware']> = {
  freee: 'freee',
  MF: 'MF',
  yayoi: 'yayoi',
  other: 'other',
};

const OFFICE_ID = '00000000-0000-0000-0000-000000000001';

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
// Fetch staff list
// ============================
export async function fetchStaff(): Promise<{ id: string; name: string }[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('staff')
    .select('id, name')
    .eq('office_id', OFFICE_ID)
    .order('name');
  if (error || !data) return [];
  return data;
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
    office_id: OFFICE_ID,
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

// ============================
// Update client
// ============================
export async function updateClient(clientId: string, updates: {
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

  const { error } = await supabase.from('clients').update({
    name: updates.name,
    representative: updates.representative,
    type: updates.type === 'individual' ? 'individual' : 'new_corporate',
    settlement_month: updates.settlementMonth,
    accounting_software: updates.accountingSoftware,
    monthly_fee: updates.monthlyFee,
    phone: updates.phone,
    email: updates.email,
    industry: updates.industry,
    updated_at: new Date().toISOString(),
  }).eq('id', clientId);

  if (error) {
    console.error('Failed to update client:', error);
    return false;
  }
  return true;
}

// ============================
// Delete client
// ============================
export async function deleteClient(clientId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('clients').delete().eq('id', clientId);
  if (error) {
    console.error('Failed to delete client:', error);
    return false;
  }
  return true;
}

// ============================
// Insert new task
// ============================
export async function insertTask(task: {
  title: string;
  clientId: string;
  assignedTo: string | null;
  dueDate: string;
  priority: string;
  category: string;
  description: string;
}): Promise<boolean> {
  if (!supabase) return false;

  const dbCategory = reverseCategoryMap[task.category] || task.category;
  const { error } = await supabase.from('tasks').insert({
    office_id: OFFICE_ID,
    client_id: task.clientId,
    title: task.title,
    assigned_to: task.assignedTo || null,
    due_date: task.dueDate || null,
    priority: task.priority,
    category: dbCategory,
    description: task.description,
    status: 'pending',
  });

  if (error) {
    console.error('Failed to insert task:', error);
    return false;
  }
  return true;
}

// ============================
// Delete task
// ============================
export async function deleteTask(taskId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) {
    console.error('Failed to delete task:', error);
    return false;
  }
  return true;
}

// ============================
// Bulk insert tasks from templates
// ============================
export async function generateTasksFromTemplates(
  clientId: string,
  templateCategory: string,
  settlementMonth: number,
): Promise<number> {
  if (!supabase) return 0;

  const { data: templates, error: fetchErr } = await supabase
    .from('task_templates')
    .select('*')
    .eq('office_id', OFFICE_ID)
    .eq('category', templateCategory)
    .order('sort_order');

  if (fetchErr || !templates || templates.length === 0) return 0;

  const now = new Date();
  const year = now.getFullYear();

  const rows = templates.map((tmpl: any) => {
    // Calculate due date based on settlement month + offsets
    let dueMonth = settlementMonth;
    if (tmpl.execution_month) {
      dueMonth = tmpl.execution_month;
    }
    const dueDateStr = tmpl.due_day_offset
      ? `${year}-${String(dueMonth).padStart(2, '0')}-${String(Math.min(tmpl.due_day_offset, 28)).padStart(2, '0')}`
      : `${year}-${String(dueMonth).padStart(2, '0')}-28`;

    return {
      office_id: OFFICE_ID,
      client_id: clientId,
      template_id: tmpl.template_id,
      title: tmpl.title,
      description: tmpl.description || '',
      category: tmpl.category,
      status: 'pending',
      priority: 'medium',
      due_date: dueDateStr,
    };
  });

  const { error: insertErr } = await supabase.from('tasks').insert(rows);
  if (insertErr) {
    console.error('Failed to generate tasks from templates:', insertErr);
    return 0;
  }
  return rows.length;
}

// ============================
// Invoice CRUD
// ============================
export async function insertInvoice(invoice: {
  clientId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}): Promise<boolean> {
  if (!supabase) return false;

  const amount = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.floor(amount * 0.1);
  const totalAmount = amount + taxAmount;

  // Generate invoice number
  const now = new Date();
  const invNum = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

  const { data: invData, error: invErr } = await supabase.from('invoices').insert({
    office_id: OFFICE_ID,
    client_id: invoice.clientId,
    invoice_number: invNum,
    period_start: invoice.periodStart || null,
    period_end: invoice.periodEnd || null,
    amount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    status: 'draft',
    due_date: invoice.dueDate || null,
  }).select('id').single();

  if (invErr || !invData) {
    console.error('Failed to insert invoice:', invErr);
    return false;
  }

  if (invoice.items.length > 0) {
    const itemRows = invoice.items.map((item) => ({
      invoice_id: invData.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }));
    const { error: itemErr } = await supabase.from('invoice_items').insert(itemRows);
    if (itemErr) {
      console.error('Failed to insert invoice items:', itemErr);
    }
  }

  return true;
}

export async function updateInvoiceStatus(invoiceId: string, newStatus: string): Promise<boolean> {
  if (!supabase) return false;

  const statusDbMap: Record<string, string> = {
    '\u4E0B\u66F8\u304D': 'draft',
    '\u9001\u4ED8\u6E08': 'sent',
    '\u5165\u91D1\u6E08': 'paid',
    '\u672A\u5165\u91D1': 'overdue',
  };
  const dbStatus = statusDbMap[newStatus] || newStatus;

  const { error } = await supabase.from('invoices').update({
    status: dbStatus,
    ...(dbStatus === 'paid' ? { paid_at: new Date().toISOString() } : {}),
  }).eq('id', invoiceId);

  if (error) {
    console.error('Failed to update invoice status:', error);
    return false;
  }
  return true;
}

// ============================
// Messages
// ============================
export async function sendMessage(clientId: string, content: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('messages').insert({
    client_id: clientId,
    sender_type: 'staff',
    content,
  });

  if (error) {
    console.error('Failed to send message:', error);
    return false;
  }
  return true;
}

// ============================
// Client Notes
// ============================
export async function insertClientNote(clientId: string, content: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('client_notes').insert({
    client_id: clientId,
    note_type: 'processing',
    content,
  });

  if (error) {
    console.error('Failed to insert client note:', error);
    return false;
  }
  return true;
}

// ============================
// AI Journal Rules
// ============================
export async function insertJournalRule(rule: {
  clientId: string;
  conditionType: string;
  conditionValue: string;
  debitAccount: string;
  confidence: number;
}): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('ai_journal_rules').insert({
    office_id: OFFICE_ID,
    client_id: rule.clientId,
    condition_type: rule.conditionType,
    condition_value: rule.conditionValue,
    debit_account: rule.debitAccount,
    confidence: rule.confidence / 100,
    status: 'candidate',
  });

  if (error) {
    console.error('Failed to insert journal rule:', error);
    return false;
  }
  return true;
}

// ============================
// Document Checklist
// ============================
export async function updateChecklistItem(itemId: string, isChecked: boolean): Promise<boolean> {
  if (!supabase) return false;

  // Note: the checklist table doesn't have is_checked column, it's on task_checklist_items
  // For client_document_checklist, we need to handle this differently
  // We'll use a metadata approach - toggle is_required as a proxy for demo
  const { error } = await supabase.from('client_document_checklist').update({
    is_required: isChecked,
  }).eq('id', itemId);

  if (error) {
    console.error('Failed to update checklist item:', error);
    return false;
  }
  return true;
}

export async function insertChecklistItem(clientId: string, label: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('client_document_checklist').insert({
    client_id: clientId,
    label,
    is_required: true,
    sort_order: 999,
  });

  if (error) {
    console.error('Failed to insert checklist item:', error);
    return false;
  }
  return true;
}

// ============================
// Subsidy Notifications
// ============================
export async function insertSubsidyNotification(clientId: string, subsidyName: string, subsidySource: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('subsidy_notifications').insert({
    client_id: clientId,
    subsidy_name: subsidyName,
    subsidy_source: subsidySource,
    status: 'notified',
    notified_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to insert subsidy notification:', error);
    return false;
  }
  return true;
}

export async function updateSubsidyNotificationStatus(notificationId: string, newStatus: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('subsidy_notifications').update({
    status: newStatus,
  }).eq('id', notificationId);

  if (error) {
    console.error('Failed to update subsidy notification status:', error);
    return false;
  }
  return true;
}

// ============================
// Consultation Templates
// ============================
export async function fetchConsultationTemplates(): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('consultation_templates')
    .select('*')
    .eq('office_id', OFFICE_ID)
    .eq('is_active', true)
    .order('sort_order');
  if (error || !data) return [];
  return data;
}

export async function insertConsultationTemplate(template: {
  category: string;
  title: string;
  description: string;
  sortOrder: number;
}): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('consultation_templates').insert({
    office_id: OFFICE_ID,
    category: template.category,
    title: template.title,
    description: template.description,
    sort_order: template.sortOrder,
  });
  if (error) { console.error('Failed to insert consultation template:', error); return false; }
  return true;
}

export async function updateConsultationTemplate(id: string, updates: {
  title?: string;
  description?: string;
  is_active?: boolean;
  category?: string;
  sort_order?: number;
}): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('consultation_templates').update(updates).eq('id', id);
  if (error) { console.error('Failed to update consultation template:', error); return false; }
  return true;
}

export async function deleteConsultationTemplate(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('consultation_templates').delete().eq('id', id);
  if (error) { console.error('Failed to delete consultation template:', error); return false; }
  return true;
}

// ============================
// Consultation Records
// ============================
export async function fetchConsultationRecords(clientId: string): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('consultation_records')
    .select('*, template:template_id(id, category, title, description, sort_order)')
    .eq('client_id', clientId);
  if (error || !data) return [];
  return data;
}

export async function upsertConsultationRecord(record: {
  clientId: string;
  templateId: string;
  isChecked: boolean;
  notes?: string;
}): Promise<boolean> {
  if (!supabase) return false;
  // Check if record exists
  const { data: existing } = await supabase
    .from('consultation_records')
    .select('id')
    .eq('client_id', record.clientId)
    .eq('template_id', record.templateId)
    .limit(1);

  if (existing && existing.length > 0) {
    const { error } = await supabase.from('consultation_records').update({
      is_checked: record.isChecked,
      notes: record.notes,
      checked_at: record.isChecked ? new Date().toISOString() : null,
    }).eq('id', existing[0].id);
    if (error) { console.error('Failed to update consultation record:', error); return false; }
  } else {
    const { error } = await supabase.from('consultation_records').insert({
      client_id: record.clientId,
      template_id: record.templateId,
      is_checked: record.isChecked,
      notes: record.notes,
      checked_at: record.isChecked ? new Date().toISOString() : null,
    });
    if (error) { console.error('Failed to insert consultation record:', error); return false; }
  }
  return true;
}

// ============================
// Form Responses
// ============================
export async function fetchFormResponses(clientId: string): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('client_id', clientId)
    .order('submitted_at');
  if (error || !data) return [];
  return data;
}

export async function submitFormResponses(responses: {
  clientId: string;
  templateId: string;
  fields: { fieldId: string | null; label: string; type: string; value: string; fileUrl?: string; fileName?: string }[];
}): Promise<boolean> {
  if (!supabase) return false;
  const rows = responses.fields.map((f) => ({
    client_id: responses.clientId,
    office_id: OFFICE_ID,
    template_id: responses.templateId,
    field_id: f.fieldId || null,
    field_label: f.label,
    field_type: f.type,
    response_text: f.value,
    response_file_url: f.fileUrl || null,
    response_file_name: f.fileName || null,
  }));
  const { error } = await supabase.from('form_responses').insert(rows);
  if (error) { console.error('Failed to submit form responses:', error); return false; }
  return true;
}

export async function markFormResponseReviewed(responseId: string, staffId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('form_responses').update({
    reviewed_by: staffId,
    reviewed_at: new Date().toISOString(),
  }).eq('id', responseId);
  if (error) { console.error('Failed to mark form response reviewed:', error); return false; }
  return true;
}

// ============================
// Message Templates
// ============================
export async function fetchMessageTemplates(): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('office_id', OFFICE_ID)
    .order('template_id');
  if (error || !data) return [];
  return data;
}

// ============================
// Form Fields
// ============================
export async function fetchFormFields(templateId: string): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('form_fields')
    .select('*')
    .eq('template_id', templateId)
    .eq('office_id', OFFICE_ID)
    .order('sort_order');
  if (error || !data) return [];
  return data;
}

// ============================
// Task Templates (full CRUD)
// ============================
export async function fetchTaskTemplates(): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('office_id', OFFICE_ID)
    .order('category')
    .order('sort_order');
  if (error || !data) return [];
  return data;
}

export async function insertTaskTemplate(template: {
  templateId: string;
  category: string;
  title: string;
  description: string;
  sendDayOffset?: number;
  dueDayOffset?: number;
  officeTodo?: string;
  sortOrder: number;
}): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('task_templates').insert({
    office_id: OFFICE_ID,
    template_id: template.templateId,
    category: template.category,
    title: template.title,
    description: template.description,
    send_day_offset: template.sendDayOffset || null,
    due_day_offset: template.dueDayOffset || null,
    office_todo: template.officeTodo || null,
    sort_order: template.sortOrder,
  });
  if (error) { console.error('Failed to insert task template:', error); return false; }
  return true;
}

export async function updateTaskTemplate(id: string, updates: {
  title?: string;
  description?: string;
  send_day_offset?: number;
  due_day_offset?: number;
  office_todo?: string;
}): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('task_templates').update(updates).eq('id', id);
  if (error) { console.error('Failed to update task template:', error); return false; }
  return true;
}

export async function deleteTaskTemplate(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('task_templates').delete().eq('id', id);
  if (error) { console.error('Failed to delete task template:', error); return false; }
  return true;
}
