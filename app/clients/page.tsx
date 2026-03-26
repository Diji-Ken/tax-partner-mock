'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText,
  Receipt,
  BookOpen,
  Gift,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Circle,
  Upload,
  Send,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  FolderOpen,
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
  ClipboardList,
  FileInput,
} from 'lucide-react';
import { clients as demoClients, type Client } from '@/data/clients';
import { tasks as demoTasks } from '@/data/tasks';
import { ocrResults } from '@/data/ocr-results';
import { invoices as demoInvoices } from '@/data/invoices';
import { aiLearningRules } from '@/data/ai-learning-rules';
import { subsidies as demoSubsidies } from '@/data/subsidies';
import {
  fetchClients,
  fetchTasks,
  insertClient,
  updateClient,
  deleteClient,
  insertInvoice,
  updateInvoiceStatus,
  sendMessage,
  insertClientNote,
  insertJournalRule,
  insertChecklistItem,
  insertSubsidyNotification,
  updateSubsidyNotificationStatus,
  generateTasksFromTemplates,
  fetchConsultationTemplates,
  fetchConsultationRecords,
  upsertConsultationRecord,
  fetchFormResponses,
  submitFormResponses,
  markFormResponseReviewed,
  fetchMessageTemplates,
  fetchFormFields,
} from '@/lib/supabase-helpers';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/data/tasks';

const softwareLabels: Record<string, string> = {
  freee: 'freee',
  MF: 'MF',
  yayoi: '\u5F25\u751F',
  other: '\u305D\u306E\u4ED6',
};
const softwareColors: Record<string, string> = {
  freee: 'bg-purple-100 text-purple-700',
  MF: 'bg-blue-100 text-blue-700',
  yayoi: 'bg-green-100 text-green-700',
  other: 'bg-slate-100 text-slate-600',
};
const rankColors: Record<string, string> = {
  A: 'bg-amber-400 text-white',
  B: 'bg-slate-400 text-white',
  C: 'bg-slate-300 text-white',
};

const clientTypeLabels: Record<string, string> = {
  new_corporate: '\u65B0\u898F\u6CD5\u4EBA',
  existing_corporate: '\u65E2\u5B58\u6CD5\u4EBA',
  individual: '\u500B\u4EBA\u4E8B\u696D\u4E3B',
  corporate: '\u6CD5\u4EBA',
};

const clientTypeToTemplateCategory: Record<string, string> = {
  new_corporate: 'init_new_corporate',
  existing_corporate: 'init_existing_corporate',
  individual: 'init_individual',
};

// New client form initial state
const initialNewClient = {
  name: '',
  representative: '',
  type: 'new_corporate',
  settlementMonth: 3,
  accountingSoftware: 'freee',
  monthlyFee: 30000,
  phone: '',
  email: '',
  industry: '',
};

type DetailTab = 'overview' | 'monthly' | 'documents' | 'billing' | 'knowledge' | 'subsidy' | 'contact';

const detailTabs: { key: DetailTab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: '\u6982\u8981', icon: Building2 },
  { key: 'monthly', label: '\u6708\u6B21\u51E6\u7406', icon: Calendar },
  { key: 'documents', label: '\u66F8\u985E', icon: FileText },
  { key: 'billing', label: '\u8ACB\u6C42', icon: Receipt },
  { key: 'knowledge', label: '\u30CA\u30EC\u30C3\u30B8', icon: BookOpen },
  { key: 'subsidy', label: '\u88DC\u52A9\u91D1\u30FB\u63D0\u6848', icon: Gift },
  { key: 'contact', label: '\u9023\u7D61', icon: MessageSquare },
];

const consultationCategoryLabels: Record<string, string> = {
  common: '\u5171\u901A',
  new_corporate: '\u65B0\u8A2D\u6CD5\u4EBA',
  existing_corporate: '\u65E2\u5B58\u6CD5\u4EBA',
  individual: '\u500B\u4EBA\u4E8B\u696D\u4E3B',
  discussion: '\u691C\u8A0E\u4E8B\u9805',
};

// DB types for detail panel
interface DbContract {
  id: string;
  contract_type: string;
  fee: number | null;
  is_active: boolean;
}
interface DbDocument {
  id: string;
  name: string;
  document_type: string | null;
  fiscal_year: number | null;
  file_size: number | null;
  e_bookkeeping_compliant: boolean;
  created_at: string;
}
interface DbInvoice {
  id: string;
  invoice_number: string | null;
  amount: number;
  tax_amount: number | null;
  total_amount: number | null;
  status: string;
  due_date: string | null;
  created_at: string;
}
interface DbNote {
  id: string;
  note_type: string | null;
  title: string | null;
  content: string;
  created_at: string;
}
interface DbJournalRule {
  id: string;
  condition_type: string;
  condition_value: string;
  debit_account: string;
  confidence: number;
  applied_count: number;
  status: string;
}
interface DbChecklist {
  id: string;
  label: string;
  is_required: boolean;
  sort_order: number | null;
}
interface DbSubsidyNotification {
  id: string;
  subsidy_name: string;
  subsidy_source: string | null;
  status: string;
  amount: number | null;
  commission: number | null;
  notified_at: string | null;
  created_at: string;
}
interface DbMessage {
  id: string;
  sender_type: string;
  sender_id: string | null;
  content: string;
  created_at: string;
}
interface DbTaskTemplate {
  id: string;
  template_id: string;
  category: string;
  title: string;
  description: string | null;
}
interface DbTaskChecklist {
  id: string;
  label: string;
  is_checked: boolean;
  sort_order: number | null;
}
interface ConsultationTemplateItem {
  id: string;
  category: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}
interface ConsultationRecordItem {
  id: string;
  client_id: string;
  template_id: string;
  is_checked: boolean;
  notes: string | null;
  checked_at: string | null;
}
interface FormResponseItem {
  id: string;
  template_id: string;
  field_label: string;
  field_type: string;
  response_text: string | null;
  response_file_url: string | null;
  response_file_name: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string;
}
interface MessageTemplateItem {
  id: string;
  template_id: string;
  type: string;
  title: string | null;
  body: string;
  form_url: string | null;
}

export default function ClientsPage() {
  const [clientsData, setClientsData] = useState<Client[]>(demoClients);
  const [tasksData, setTasksData] = useState<Task[]>(demoTasks);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'demo' | 'supabase'>('demo');

  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterStaff, setFilterStaff] = useState<string>('');
  const [filterSoftware, setFilterSoftware] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newClient, setNewClient] = useState(initialNewClient);
  const [editClient, setEditClient] = useState(initialNewClient);
  const [saving, setSaving] = useState(false);
  const [autoGenMessage, setAutoGenMessage] = useState<string | null>(null);

  // Detail panel DB state
  const [detailLoading, setDetailLoading] = useState(false);
  const [dbContracts, setDbContracts] = useState<DbContract[]>([]);
  const [dbDocuments, setDbDocuments] = useState<DbDocument[]>([]);
  const [dbInvoices, setDbInvoices] = useState<DbInvoice[]>([]);
  const [dbNotes, setDbNotes] = useState<DbNote[]>([]);
  const [dbJournalRules, setDbJournalRules] = useState<DbJournalRule[]>([]);
  const [dbChecklist, setDbChecklist] = useState<DbChecklist[]>([]);
  const [dbSubsidyNotifications, setDbSubsidyNotifications] = useState<DbSubsidyNotification[]>([]);
  const [dbMessages, setDbMessages] = useState<DbMessage[]>([]);
  const [dbTaskTemplates, setDbTaskTemplates] = useState<DbTaskTemplate[]>([]);
  const [dbTaskChecklist, setDbTaskChecklist] = useState<DbTaskChecklist[]>([]);
  const [clientTasksFromDb, setClientTasksFromDb] = useState<Task[]>([]);

  // Consultation checklist state
  const [consultationTemplates, setConsultationTemplates] = useState<ConsultationTemplateItem[]>([]);
  const [consultationRecords, setConsultationRecords] = useState<ConsultationRecordItem[]>([]);
  const [consultationNotes, setConsultationNotes] = useState<Record<string, string>>({});

  // Form responses state
  const [formResponses, setFormResponses] = useState<FormResponseItem[]>([]);

  // Message templates state
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplateItem[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // CRUD UI state
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({ conditionType: '', conditionValue: '', debitAccount: '', confidence: 70 });
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const [checklistInput, setChecklistInput] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Voucher upload state
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadVoucherType, setUploadVoucherType] = useState('receipt');
  interface VoucherFile {
    id: string;
    file_name: string;
    voucher_type: string;
    fiscal_year: number | null;
    uploaded_at: string | null;
    storage_provider: string | null;
    storage_path: string | null;
  }
  const [dbVouchers, setDbVouchers] = useState<VoucherFile[]>([]);
  const [newInvoice, setNewInvoice] = useState({
    periodStart: '',
    periodEnd: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }] as { description: string; quantity: number; unitPrice: number }[],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [dbClients, dbTasks] = await Promise.all([
          fetchClients(),
          fetchTasks(),
        ]);
        if (dbClients.length > 0) {
          setClientsData(dbClients);
          setDataSource('supabase');
        }
        if (dbTasks.length > 0) {
          setTasksData(dbTasks);
        }
      } catch (err) {
        console.error('Supabase fetch failed, using demo data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load detail panel data when client is selected
  const loadClientDetail = useCallback(async (clientId: string) => {
    if (!supabase || dataSource !== 'supabase') return;
    setDetailLoading(true);
    try {
      const [
        contractsRes,
        documentsRes,
        invoicesRes,
        notesRes,
        rulesRes,
        checklistRes,
        subsidyRes,
        messagesRes,
        templatesRes,
      ] = await Promise.all([
        supabase.from('client_contracts').select('*').eq('client_id', clientId).order('created_at'),
        supabase.from('documents').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('client_notes').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('ai_journal_rules').select('*').eq('client_id', clientId).order('created_at'),
        supabase.from('client_document_checklist').select('*').eq('client_id', clientId).order('sort_order'),
        supabase.from('subsidy_notifications').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('messages').select('*').eq('client_id', clientId).order('created_at'),
        supabase.from('task_templates').select('*').eq('office_id', '00000000-0000-0000-0000-000000000001').order('sort_order'),
      ]);
      setDbContracts(contractsRes.data || []);
      setDbDocuments(documentsRes.data || []);
      setDbInvoices(invoicesRes.data || []);
      setDbNotes(notesRes.data || []);
      setDbJournalRules(rulesRes.data || []);
      setDbChecklist(checklistRes.data || []);
      setDbSubsidyNotifications(subsidyRes.data || []);
      setDbMessages(messagesRes.data || []);
      setDbTaskTemplates(templatesRes.data || []);

      // Load consultation templates + records
      const [ctRes, crRes] = await Promise.all([
        fetchConsultationTemplates(),
        fetchConsultationRecords(clientId),
      ]);
      setConsultationTemplates(ctRes);
      setConsultationRecords(crRes);

      // Load form responses
      const frRes = await fetchFormResponses(clientId);
      setFormResponses(frRes);

      // Load message templates
      const mtRes = await fetchMessageTemplates();
      setMessageTemplates(mtRes);

      // Load vouchers for this client
      const vouchersRes = await supabase.from('vouchers').select('id, file_name, voucher_type, fiscal_year, uploaded_at, storage_provider, storage_path').eq('client_id', clientId).order('uploaded_at', { ascending: false });
      setDbVouchers(vouchersRes.data || []);

      // Load tasks for this client
      const tasksRes = await supabase.from('tasks').select('*, staff:assigned_to(id, name)').eq('client_id', clientId).order('due_date');
      if (tasksRes.data) {
        const statusMap: Record<string, Task['status']> = { pending: '\u672A\u7740\u624B', in_progress: '\u9032\u884C\u4E2D', review: '\u78BA\u8A8D\u5F85\u3061', completed: '\u5B8C\u4E86' };
        const categoryMap: Record<string, Task['category']> = { monthly: '\u6708\u6B21\u51E6\u7406', annual: '\u6C7A\u7B97', corporate_tax: '\u6CD5\u4EBA\u7A0E\u7533\u544A', consumption_tax: '\u6D88\u8CBB\u7A0E\u7533\u544A', year_end: '\u5E74\u672B\u8ABF\u6574', payroll: '\u7D66\u4E0E\u8A08\u7B97' };
        setClientTasksFromDb(tasksRes.data.map((t: any) => ({
          id: t.id,
          title: t.title,
          clientId: t.client_id,
          clientName: '',
          category: categoryMap[t.category] || '\u6708\u6B21\u51E6\u7406',
          status: statusMap[t.status] || '\u672A\u7740\u624B',
          priority: (t.priority || 'medium') as Task['priority'],
          assignedStaff: t.staff?.name || '\u672A\u5272\u5F53',
          dueDate: t.due_date || '',
          description: t.description || '',
        })));

        // Load task checklist for the first task
        if (tasksRes.data.length > 0) {
          const checkRes = await supabase.from('task_checklist_items').select('*').eq('task_id', tasksRes.data[0].id).order('sort_order');
          setDbTaskChecklist(checkRes.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load client detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    if (selectedClient) {
      loadClientDetail(selectedClient.id);
    }
  }, [selectedClient, loadClientDetail]);

  // Setup Supabase Realtime for messages
  useEffect(() => {
    if (!supabase || !selectedClient || dataSource !== 'supabase') return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `client_id=eq.${selectedClient.id}` },
        (payload) => {
          const newMsg = payload.new as DbMessage;
          setDbMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [selectedClient, dataSource]);

  const filtered = useMemo(() => {
    return clientsData.filter((c) => {
      if (search && !c.name.includes(search) && !c.representative.includes(search)) return false;
      if (filterMonth && c.settlementMonth !== Number(filterMonth)) return false;
      if (filterStaff && c.assignedStaff !== filterStaff) return false;
      if (filterSoftware && c.accountingSoftware !== filterSoftware) return false;
      return true;
    });
  }, [clientsData, search, filterMonth, filterStaff, filterSoftware]);

  const staffList = [...new Set(clientsData.map((c) => c.assignedStaff))];

  // For detail panel - use DB data if from supabase, else demo data
  const clientTasks = selectedClient
    ? (dataSource === 'supabase' ? clientTasksFromDb : tasksData.filter((t) => t.clientId === selectedClient.id))
    : [];
  const clientInvoicesDemo = selectedClient ? demoInvoices.filter((i) => i.clientId === selectedClient.id) : [];
  const clientOcr = selectedClient ? ocrResults.filter((o) => o.clientName === selectedClient?.name) : [];
  const clientRulesDemo = selectedClient ? aiLearningRules.filter((r) => r.clientName === selectedClient?.name) : [];

  // Monthly progress - from DB checklist or demo
  const monthlySteps = dataSource === 'supabase' && dbTaskChecklist.length > 0
    ? dbTaskChecklist.map((c) => ({ label: c.label, done: c.is_checked }))
    : [
        { label: '\u8CC7\u6599\u56DE\u53CE', done: true },
        { label: '\u4ED5\u8A33\u5165\u529B', done: true },
        { label: '\u6B8B\u9AD8\u78BA\u8A8D', done: true },
        { label: '\u8A66\u7B97\u8868', done: false },
        { label: '\u5831\u544A', done: false },
      ];

  const completedMonthlySteps = monthlySteps.filter((s) => s.done).length;
  const progressPercent = monthlySteps.length > 0 ? Math.round((completedMonthlySteps / monthlySteps.length) * 100) : 0;

  // Contract types - from DB or demo
  const contractTypes = dataSource === 'supabase' && dbContracts.length > 0
    ? dbContracts.map((c) => ({ label: c.contract_type, active: c.is_active }))
    : [
        { label: '\u7A0E\u52D9\u9867\u554F', active: true },
        { label: '\u8A18\u5E33\u4EE3\u884C', active: true },
        { label: '\u7D66\u4E0E\u8A08\u7B97', active: false },
        { label: '\u6C7A\u7B97\u6599', active: true },
        { label: '\u5E74\u672B\u8ABF\u6574', active: false },
      ];

  const resourceChecklist = dataSource === 'supabase' && dbChecklist.length > 0
    ? dbChecklist.map((c) => ({ id: c.id, label: c.label, collected: c.is_required }))
    : [
        { id: 'd1', label: '\u9818\u53CE\u66F8\u30FB\u30EC\u30B7\u30FC\u30C8', collected: true },
        { id: 'd2', label: '\u8ACB\u6C42\u66F8', collected: true },
        { id: 'd3', label: '\u9280\u884C\u901A\u5E33\u30B3\u30D4\u30FC', collected: false },
        { id: 'd4', label: '\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9\u660E\u7D30', collected: false },
        { id: 'd5', label: '\u7D66\u4E0E\u53F0\u5E33', collected: true },
        { id: 'd6', label: '\u793E\u4F1A\u4FDD\u967A\u6599\u901A\u77E5', collected: true },
      ];

  const processingNotes = dataSource === 'supabase' && dbNotes.length > 0
    ? dbNotes.map((n) => ({ id: n.id, content: n.content }))
    : [
        { id: 'n1', content: '\u5F79\u54E1\u5831\u916C\u306F\u6BCF\u6708\u5B9A\u984D500,000\u5186\u3002\u5909\u66F4\u6642\u306F\u5148\u65B9\u306B\u78BA\u8A8D\u8981\u3002' },
        { id: 'n2', content: '\u6C7A\u7B97\u8CDE\u4E0E\u306F12\u6708\u652F\u7D66\u3002\u640D\u91D1\u7B97\u5165\u6642\u671F\u306B\u6CE8\u610F\u3002' },
      ];

  const journalRules = dataSource === 'supabase' && dbJournalRules.length > 0
    ? dbJournalRules.map((r) => ({
        id: r.id,
        condition: `${r.condition_type}: ${r.condition_value}`,
        account: r.debit_account,
        confidence: Math.round(r.confidence * 100),
        appliedCount: r.applied_count,
        status: r.status === 'approved' ? '\u627F\u8A8D\u6E08' : r.status === 'review' ? '\u8981\u78BA\u8A8D' : '\u65B0\u898F\u5019\u88DC',
      }))
    : clientRulesDemo.map((r) => ({
        id: r.id,
        condition: r.condition,
        account: r.account,
        confidence: r.confidence,
        appliedCount: r.appliedCount,
        status: r.status,
      }));

  // Consultation checklist progress
  const consultationCheckedCount = useMemo(() => {
    return consultationRecords.filter((r) => r.is_checked).length;
  }, [consultationRecords]);

  // Grouped form responses by template_id
  const groupedFormResponses = useMemo(() => {
    const groups: Record<string, FormResponseItem[]> = {};
    formResponses.forEach((r) => {
      if (!groups[r.template_id]) groups[r.template_id] = [];
      groups[r.template_id].push(r);
    });
    return groups;
  }, [formResponses]);

  // Grouped message templates
  const groupedMessageTemplates = useMemo(() => {
    const groups: Record<string, MessageTemplateItem[]> = {};
    messageTemplates.forEach((t) => {
      const key = t.type || '\u305D\u306E\u4ED6';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [messageTemplates]);

  const handleAddClient = async () => {
    setSaving(true);
    setAutoGenMessage(null);
    try {
      if (dataSource === 'supabase') {
        const success = await insertClient(newClient);
        if (success) {
          const dbClients = await fetchClients();
          if (dbClients.length > 0) {
            setClientsData(dbClients);
            // Auto-generate initial tasks based on type
            const templateCategory = clientTypeToTemplateCategory[newClient.type];
            if (templateCategory) {
              const newlyCreated = dbClients.find((c) => c.name === newClient.name);
              if (newlyCreated) {
                const count = await generateTasksFromTemplates(newlyCreated.id, templateCategory, newClient.settlementMonth);
                if (count > 0) {
                  setAutoGenMessage(`\u521D\u56DE\u696D\u52D9\u30BF\u30B9\u30AF ${count}\u4EF6\u3092\u81EA\u52D5\u751F\u6210\u3057\u307E\u3057\u305F`);
                }
              }
            }
          }
        }
      } else {
        const localClient: Client = {
          id: String(clientsData.length + 1),
          name: newClient.name,
          representative: newClient.representative,
          settlementMonth: newClient.settlementMonth,
          accountingSoftware: newClient.accountingSoftware as Client['accountingSoftware'],
          monthlyFee: newClient.monthlyFee,
          assignedStaff: '\u5C71\u7530\u592A\u90CE',
          status: 'active',
          rank: 'B',
          type: newClient.type === 'individual' ? 'individual' : 'corporate',
          phone: newClient.phone,
          email: newClient.email,
          industry: newClient.industry,
          registeredDate: new Date().toISOString().split('T')[0],
        };
        setClientsData((prev) => [...prev, localClient]);
      }
      setShowAddModal(false);
      setNewClient(initialNewClient);
    } catch (err) {
      console.error('Failed to add client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      if (dataSource === 'supabase') {
        const success = await updateClient(selectedClient.id, editClient);
        if (success) {
          const dbClients = await fetchClients();
          if (dbClients.length > 0) {
            setClientsData(dbClients);
            const updated = dbClients.find((c) => c.id === selectedClient.id);
            if (updated) setSelectedClient(updated);
          }
        } else {
          alert('\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F');
        }
      } else {
        setClientsData((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? { ...c, name: editClient.name, representative: editClient.representative, type: editClient.type as Client['type'], settlementMonth: editClient.settlementMonth, accountingSoftware: editClient.accountingSoftware as Client['accountingSoftware'], monthlyFee: editClient.monthlyFee, phone: editClient.phone, email: editClient.email, industry: editClient.industry }
              : c
          )
        );
      }
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to edit client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    if (!confirm(`\u300C${selectedClient.name}\u300D\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\u3053\u306E\u64CD\u4F5C\u306F\u53D6\u308A\u6D88\u305B\u307E\u305B\u3093\u3002`)) return;
    try {
      if (dataSource === 'supabase') {
        const success = await deleteClient(selectedClient.id);
        if (success) {
          const dbClients = await fetchClients();
          setClientsData(dbClients.length > 0 ? dbClients : []);
          setSelectedClient(null);
        } else {
          alert('\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F');
        }
      } else {
        setClientsData((prev) => prev.filter((c) => c.id !== selectedClient.id));
        setSelectedClient(null);
      }
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  const openEditModal = () => {
    if (!selectedClient) return;
    setEditClient({
      name: selectedClient.name,
      representative: selectedClient.representative,
      type: selectedClient.type === 'individual' ? 'individual' : 'new_corporate',
      settlementMonth: selectedClient.settlementMonth,
      accountingSoftware: selectedClient.accountingSoftware,
      monthlyFee: selectedClient.monthlyFee,
      phone: selectedClient.phone,
      email: selectedClient.email,
      industry: selectedClient.industry,
    });
    setShowEditModal(true);
  };

  const handleSendMessage = async () => {
    if (!selectedClient || !messageInput.trim()) return;
    setSendingMessage(true);
    try {
      if (dataSource === 'supabase') {
        const success = await sendMessage(selectedClient.id, messageInput.trim());
        if (success && supabase) {
          const { data } = await supabase.from('messages').select('*').eq('client_id', selectedClient.id).order('created_at');
          if (data) setDbMessages(data);
        }
      }
      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedClient || !noteInput.trim()) return;
    try {
      if (dataSource === 'supabase') {
        const success = await insertClientNote(selectedClient.id, noteInput.trim());
        if (success && supabase) {
          const { data } = await supabase.from('client_notes').select('*').eq('client_id', selectedClient.id).order('created_at', { ascending: false });
          if (data) setDbNotes(data);
        }
      }
      setNoteInput('');
      setShowNoteInput(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleAddRule = async () => {
    if (!selectedClient || !newRule.conditionType || !newRule.conditionValue || !newRule.debitAccount) return;
    try {
      if (dataSource === 'supabase') {
        const success = await insertJournalRule({ clientId: selectedClient.id, conditionType: newRule.conditionType, conditionValue: newRule.conditionValue, debitAccount: newRule.debitAccount, confidence: newRule.confidence });
        if (success && supabase) {
          const { data } = await supabase.from('ai_journal_rules').select('*').eq('client_id', selectedClient.id).order('created_at');
          if (data) setDbJournalRules(data);
        }
      }
      setNewRule({ conditionType: '', conditionValue: '', debitAccount: '', confidence: 70 });
      setShowRuleModal(false);
    } catch (err) {
      console.error('Failed to add rule:', err);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!selectedClient || !checklistInput.trim()) return;
    try {
      if (dataSource === 'supabase') {
        const success = await insertChecklistItem(selectedClient.id, checklistInput.trim());
        if (success && supabase) {
          const { data } = await supabase.from('client_document_checklist').select('*').eq('client_id', selectedClient.id).order('sort_order');
          if (data) setDbChecklist(data);
        }
      }
      setChecklistInput('');
      setShowChecklistInput(false);
    } catch (err) {
      console.error('Failed to add checklist item:', err);
    }
  };

  const invoiceTotal = useMemo(() => {
    const amount = newInvoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = Math.floor(amount * 0.1);
    return { amount, tax, total: amount + tax };
  }, [newInvoice.items]);

  const handleCreateInvoice = async () => {
    if (!selectedClient || newInvoice.items.every((i) => !i.description)) return;
    setSaving(true);
    try {
      if (dataSource === 'supabase') {
        const success = await insertInvoice({ clientId: selectedClient.id, periodStart: newInvoice.periodStart, periodEnd: newInvoice.periodEnd, dueDate: newInvoice.dueDate, items: newInvoice.items.filter((i) => i.description) });
        if (success && supabase) {
          const { data } = await supabase.from('invoices').select('*').eq('client_id', selectedClient.id).order('created_at', { ascending: false });
          if (data) setDbInvoices(data);
        }
      }
      setNewInvoice({ periodStart: '', periodEnd: '', dueDate: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] });
      setShowInvoiceModal(false);
    } catch (err) {
      console.error('Failed to create invoice:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInvoiceStatusChange = async (invoiceId: string, newStatus: string) => {
    if (dataSource === 'supabase') {
      setDbInvoices((prev) => prev.map((inv) => inv.id === invoiceId ? { ...inv, status: newStatus === '\u4E0B\u66F8\u304D' ? 'draft' : newStatus === '\u9001\u4ED8\u6E08' ? 'sent' : newStatus === '\u5165\u91D1\u6E08' ? 'paid' : 'overdue' } : inv));
      const success = await updateInvoiceStatus(invoiceId, newStatus);
      if (!success && supabase && selectedClient) {
        const { data } = await supabase.from('invoices').select('*').eq('client_id', selectedClient.id).order('created_at', { ascending: false });
        if (data) setDbInvoices(data);
      }
    }
  };

  const handleNotifySubsidy = async (subsidyName: string, subsidySource: string) => {
    if (!selectedClient) return;
    try {
      if (dataSource === 'supabase') {
        const success = await insertSubsidyNotification(selectedClient.id, subsidyName, subsidySource);
        if (success && supabase) {
          const { data } = await supabase.from('subsidy_notifications').select('*').eq('client_id', selectedClient.id).order('created_at', { ascending: false });
          if (data) setDbSubsidyNotifications(data);
        }
      }
    } catch (err) {
      console.error('Failed to send subsidy notification:', err);
    }
  };

  const handleSubsidyStatusChange = async (notificationId: string, newStatus: string) => {
    if (dataSource === 'supabase') {
      setDbSubsidyNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, status: newStatus } : n));
      const success = await updateSubsidyNotificationStatus(notificationId, newStatus);
      if (!success && supabase && selectedClient) {
        const { data } = await supabase.from('subsidy_notifications').select('*').eq('client_id', selectedClient.id).order('created_at', { ascending: false });
        if (data) setDbSubsidyNotifications(data);
      }
    }
  };

  // Consultation checklist toggle
  const handleConsultationToggle = async (templateId: string, currentChecked: boolean) => {
    if (!selectedClient) return;
    const success = await upsertConsultationRecord({ clientId: selectedClient.id, templateId, isChecked: !currentChecked, notes: consultationNotes[templateId] || '' });
    if (success) {
      const records = await fetchConsultationRecords(selectedClient.id);
      setConsultationRecords(records);
    }
  };

  const handleConsultationNoteUpdate = async (templateId: string, notes: string) => {
    if (!selectedClient) return;
    setConsultationNotes((prev) => ({ ...prev, [templateId]: notes }));
    const record = consultationRecords.find((r) => r.template_id === templateId);
    await upsertConsultationRecord({ clientId: selectedClient.id, templateId, isChecked: record?.is_checked || false, notes });
    const records = await fetchConsultationRecords(selectedClient.id);
    setConsultationRecords(records);
  };

  // Message template selection
  const handleSelectMessageTemplate = (template: MessageTemplateItem) => {
    let body = template.body;
    if (selectedClient) {
      body = body.replace(/\{会社名\}/g, selectedClient.name);
      body = body.replace(/\{代表者名\}/g, selectedClient.representative);
      body = body.replace(/\{担当者名\}/g, selectedClient.assignedStaff);
    }
    setMessageInput(body);
    setShowTemplateSelector(false);
  };

  // Form response review
  const handleMarkReviewed = async (responseId: string) => {
    const success = await markFormResponseReviewed(responseId, '00000000-0000-0000-0000-000000000001');
    if (success && selectedClient) {
      const frRes = await fetchFormResponses(selectedClient.id);
      setFormResponses(frRes);
    }
  };

  // Voucher upload handlers
  const handleVoucherUpload = async (files: FileList | File[]) => {
    if (!selectedClient || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const currentYear = new Date().getFullYear();
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('client_id', selectedClient.id);
        formData.append('voucher_type', uploadVoucherType);
        formData.append('fiscal_year', String(currentYear));
        const res = await fetch('/api/vouchers/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (!res.ok) { setUploadError(json.error || 'Upload failed'); return; }
      }
      if (supabase) {
        const { data } = await supabase.from('vouchers').select('id, file_name, voucher_type, fiscal_year, uploaded_at, storage_provider, storage_path').eq('client_id', selectedClient.id).order('uploaded_at', { ascending: false });
        if (data) setDbVouchers(data);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleVoucherDrop = (e: React.DragEvent) => { e.preventDefault(); setUploadDragOver(false); if (e.dataTransfer.files.length > 0) handleVoucherUpload(e.dataTransfer.files); };
  const handleVoucherDragOver = (e: React.DragEvent) => { e.preventDefault(); setUploadDragOver(true); };
  const handleVoucherDragLeave = () => { setUploadDragOver(false); };
  const handleVoucherFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) { handleVoucherUpload(e.target.files); e.target.value = ''; } };

  const voucherTypeLabels: Record<string, string> = {
    receipt: '\u9818\u53CE\u66F8',
    invoice: '\u8ACB\u6C42\u66F8',
    bank_statement: '\u9280\u884C\u660E\u7D30',
    credit_card: '\u30AF\u30EC\u30AB\u660E\u7D30',
    settlement: '\u6C7A\u7B97\u66F8\u985E',
    tax_return: '\u7A0E\u52D9\u7533\u544A\u66F8',
    contract: '\u5951\u7D04\u66F8',
    other: '\u305D\u306E\u4ED6',
  };

  const renderClientFormFields = (formData: typeof initialNewClient, setFormData: (data: typeof initialNewClient) => void, showTypeField?: boolean) => (
    <div className="p-6 space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">{'\u4F1A\u793E\u540D'} *</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" placeholder={'\u682A\u5F0F\u4F1A\u793E\u25CB\u25CB'} />
      </div>
      {showTypeField && (
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">{'\u9867\u554F\u5148\u30BF\u30A4\u30D7'} *</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
            <option value="new_corporate">{'\u65B0\u898F\u6CD5\u4EBA'}</option>
            <option value="existing_corporate">{'\u65E2\u5B58\u6CD5\u4EBA'}</option>
            <option value="individual">{'\u500B\u4EBA\u4E8B\u696D\u4E3B'}</option>
          </select>
          <p className="text-[10px] text-slate-400 mt-1">{'\u30BF\u30A4\u30D7\u306B\u5FDC\u3058\u305F\u521D\u56DE\u696D\u52D9\u30BF\u30B9\u30AF\u304C\u81EA\u52D5\u751F\u6210\u3055\u308C\u307E\u3059'}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">{'\u4EE3\u8868\u8005\u540D'}</label>
          <input type="text" value={formData.representative} onChange={(e) => setFormData({ ...formData, representative: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">{'\u696D\u7A2E'}</label>
          <input type="text" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">{'\u6C7A\u7B97\u6708'}</label>
          <select value={formData.settlementMonth} onChange={(e) => setFormData({ ...formData, settlementMonth: Number(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (<option key={m} value={m}>{m}{'\u6708'}</option>))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">{'\u4F1A\u8A08\u30BD\u30D5\u30C8'}</label>
          <select value={formData.accountingSoftware} onChange={(e) => setFormData({ ...formData, accountingSoftware: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
            <option value="freee">freee</option>
            <option value="MF">MF</option>
            <option value="yayoi">{'\u5F25\u751F'}</option>
            <option value="other">{'\u305D\u306E\u4ED6'}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">{'\u6708\u984D\u9867\u554F\u6599'}</label>
          <input type="number" value={formData.monthlyFee} onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">{'\u96FB\u8A71\u756A\u53F7'}</label>
          <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">{'\u30E1\u30FC\u30EB'}</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{'\u9867\u554F\u5148'}</h1>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <span className={`text-xs px-2 py-0.5 rounded-full ${dataSource === 'supabase' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {dataSource === 'supabase' ? `Supabase (${clientsData.length}\u4EF6)` : `\u30C7\u30E2 (${clientsData.length}\u4EF6)`}
            </span>
          )}
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          {'\u65B0\u898F\u767B\u9332'}
        </button>
      </div>

      {/* Auto-gen message */}
      {autoGenMessage && (
        <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{autoGenMessage}</span>
          <button onClick={() => setAutoGenMessage(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder={'\u4F1A\u793E\u540D\u30FB\u4EE3\u8868\u8005\u540D\u3067\u691C\u7D22...'} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30 focus:border-[#ea580c]" />
        </div>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
          <option value="">{'\u6C7A\u7B97\u6708'}</option>
          {[3, 6, 9, 12].map((m) => (<option key={m} value={m}>{m}{'\u6708'}</option>))}
        </select>
        <select value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
          <option value="">{'\u62C5\u5F53\u8005'}</option>
          {staffList.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <select value={filterSoftware} onChange={(e) => setFilterSoftware(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
          <option value="">{'\u4F1A\u8A08\u30BD\u30D5\u30C8'}</option>
          {['freee', 'MF', 'yayoi'].map((s) => (<option key={s} value={s}>{softwareLabels[s]}</option>))}
        </select>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((client) => {
          const clientTasksForCard = tasksData.filter((t) => t.clientId === client.id && t.status !== '\u5B8C\u4E86');
          const hasAlert = clientTasksForCard.some((t) => t.priority === 'high');
          return (
            <div key={client.id} onClick={() => { setSelectedClient(client); setActiveTab('overview'); }} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-[#ea580c] transition-colors">{client.name}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rankColors[client.rank]}`}>{client.rank}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{client.representative}</p>
                </div>
                {hasAlert && <span className="flex-shrink-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">{'\u8981\u5BFE\u5FDC'}</span>}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${softwareColors[client.accountingSoftware]}`}>{softwareLabels[client.accountingSoftware]}</span>
                <span className="text-[10px] text-slate-400">{'\u6C7A\u7B97'} {client.settlementMonth}{'\u6708'}</span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">{'\u6708\u6B21\u9032\u6357'}</span>
                  <span className="text-[10px] font-medium text-slate-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">{client.assignedStaff.slice(0, 1)}</div>
                  <span className="text-[11px] text-slate-500">{client.assignedStaff}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#ea580c] transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ========= ADD CLIENT MODAL ========= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{'\u65B0\u898F\u9867\u554F\u5148\u767B\u9332'}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {renderClientFormFields(newClient, setNewClient, true)}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">{'\u30AD\u30E3\u30F3\u30BB\u30EB'}</button>
              <button onClick={handleAddClient} disabled={!newClient.name || saving} className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? '\u4FDD\u5B58\u4E2D...' : '\u767B\u9332'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========= EDIT CLIENT MODAL ========= */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{'\u9867\u554F\u5148\u7DE8\u96C6'}</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {renderClientFormFields(editClient, setEditClient)}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">{'\u30AD\u30E3\u30F3\u30BB\u30EB'}</button>
              <button onClick={handleEditClient} disabled={!editClient.name || saving} className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? '\u4FDD\u5B58\u4E2D...' : '\u4FDD\u5B58'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========= INVOICE MODAL ========= */}
      {showInvoiceModal && selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowInvoiceModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[640px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{'\u65B0\u898F\u8ACB\u6C42\u66F8\u4F5C\u6210'}</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">{'\u9867\u554F\u5148'}: <span className="font-medium">{selectedClient.name}</span></p>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-medium text-slate-500 block mb-1">{'\u5BFE\u8C61\u671F\u9593\uFF08\u958B\u59CB\uFF09'}</label><input type="date" value={newInvoice.periodStart} onChange={(e) => setNewInvoice({ ...newInvoice, periodStart: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" /></div>
                <div><label className="text-xs font-medium text-slate-500 block mb-1">{'\u5BFE\u8C61\u671F\u9593\uFF08\u7D42\u4E86\uFF09'}</label><input type="date" value={newInvoice.periodEnd} onChange={(e) => setNewInvoice({ ...newInvoice, periodEnd: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" /></div>
                <div><label className="text-xs font-medium text-slate-500 block mb-1">{'\u652F\u6255\u671F\u9650'}</label><input type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-500">{'\u660E\u7D30'}</label>
                  <button onClick={() => setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { description: '', quantity: 1, unitPrice: 0 }] })} className="text-xs text-[#ea580c] hover:underline">+ {'\u884C\u3092\u8FFD\u52A0'}</button>
                </div>
                <div className="space-y-2">
                  {newInvoice.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_80px_120px_30px] gap-2 items-center">
                      <input type="text" placeholder={'\u54C1\u76EE'} value={item.description} onChange={(e) => { const items = [...newInvoice.items]; items[idx] = { ...items[idx], description: e.target.value }; setNewInvoice({ ...newInvoice, items }); }} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                      <input type="number" placeholder={'\u6570\u91CF'} value={item.quantity} onChange={(e) => { const items = [...newInvoice.items]; items[idx] = { ...items[idx], quantity: Number(e.target.value) }; setNewInvoice({ ...newInvoice, items }); }} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                      <input type="number" placeholder={'\u5358\u4FA1'} value={item.unitPrice || ''} onChange={(e) => { const items = [...newInvoice.items]; items[idx] = { ...items[idx], unitPrice: Number(e.target.value) }; setNewInvoice({ ...newInvoice, items }); }} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                      {newInvoice.items.length > 1 && <button onClick={() => setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">{'\u5C0F\u8A08'}</span><span className="text-slate-700">{'\u00A5'}{invoiceTotal.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">{'\u6D88\u8CBB\u7A0E\uFF0810%\uFF09'}</span><span className="text-slate-700">{'\u00A5'}{invoiceTotal.tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1"><span className="text-slate-700">{'\u5408\u8A08'}</span><span className="text-[#ea580c]">{'\u00A5'}{invoiceTotal.total.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowInvoiceModal(false)} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">{'\u30AD\u30E3\u30F3\u30BB\u30EB'}</button>
              <button onClick={handleCreateInvoice} disabled={saving} className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? '\u4F5C\u6210\u4E2D...' : '\u8ACB\u6C42\u66F8\u3092\u4F5C\u6210'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========= JOURNAL RULE MODAL ========= */}
      {showRuleModal && selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowRuleModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[480px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{'\u4ED5\u8A33\u30EB\u30FC\u30EB\u8FFD\u52A0'}</h2>
              <button onClick={() => setShowRuleModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-medium text-slate-500 block mb-1">{'\u6761\u4EF6\u30BF\u30A4\u30D7'}</label><input type="text" value={newRule.conditionType} onChange={(e) => setNewRule({ ...newRule, conditionType: e.target.value })} placeholder={'\u4F8B: \u6458\u8981\u542B\u3080'} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" /></div>
              <div><label className="text-xs font-medium text-slate-500 block mb-1">{'\u6761\u4EF6\u5024'}</label><input type="text" value={newRule.conditionValue} onChange={(e) => setNewRule({ ...newRule, conditionValue: e.target.value })} placeholder={'\u4F8B: AWS, GitHub'} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" /></div>
              <div><label className="text-xs font-medium text-slate-500 block mb-1">{'\u52D8\u5B9A\u79D1\u76EE'}</label><input type="text" value={newRule.debitAccount} onChange={(e) => setNewRule({ ...newRule, debitAccount: e.target.value })} placeholder={'\u4F8B: \u901A\u4FE1\u8CBB'} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" /></div>
              <div><label className="text-xs font-medium text-slate-500 block mb-1">{'\u78BA\u4FE1\u5EA6'} ({newRule.confidence}%)</label><input type="range" min={10} max={100} value={newRule.confidence} onChange={(e) => setNewRule({ ...newRule, confidence: Number(e.target.value) })} className="w-full" /></div>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowRuleModal(false)} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">{'\u30AD\u30E3\u30F3\u30BB\u30EB'}</button>
              <button onClick={handleAddRule} disabled={!newRule.conditionType || !newRule.debitAccount} className="bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">{'\u8FFD\u52A0'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Slide Panel */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedClient(null)} />
          <div className="relative w-[800px] max-w-full bg-white h-full overflow-y-auto shadow-2xl">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-slate-100">
              <div className="p-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-800">{selectedClient.name}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${rankColors[selectedClient.rank]}`}>{selectedClient.rank}</span>
                    {detailLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  </div>
                  <p className="text-sm text-slate-500">{selectedClient.representative}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-slate-500">
                    <p>{'\u6C7A\u7B97'} {selectedClient.settlementMonth}{'\u6708'} | {softwareLabels[selectedClient.accountingSoftware]}</p>
                    <p>{'\u6708\u984D'} {'\u00A5'}{selectedClient.monthlyFee.toLocaleString()}</p>
                  </div>
                  <button className="text-xs text-[#ea580c] border border-[#ea580c] rounded-lg px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors whitespace-nowrap">
                    <ExternalLink className="w-3 h-3 inline mr-1" />{'\u30DE\u30A4\u30DA\u30FC\u30B8'}
                  </button>
                  <button onClick={() => setSelectedClient(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
              </div>
              <div className="px-5 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{'\u6708\u6B21\u9032\u6357'}</span>
                  <span className="text-xs font-medium text-emerald-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="px-5 flex gap-1 overflow-x-auto">
                {detailTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-[#ea580c]/10 text-[#ea580c] border-b-2 border-[#ea580c]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-5">
              {/* ========= OVERVIEW TAB ========= */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={openEditModal} className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"><Pencil className="w-3 h-3" />{'\u7DE8\u96C6'}</button>
                    <button onClick={handleDeleteClient} className="flex items-center gap-1.5 text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"><Trash2 className="w-3 h-3" />{'\u524A\u9664'}</button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u57FA\u672C\u60C5\u5831'}</h3>
                      <table className="w-full text-sm"><tbody>
                        {[['\u4EE3\u8868\u8005', selectedClient.representative], ['\u696D\u7A2E', selectedClient.industry], ['\u96FB\u8A71', selectedClient.phone], ['\u30E1\u30FC\u30EB', selectedClient.email], ['\u767B\u9332\u65E5', selectedClient.registeredDate]].map(([k, v]) => (
                          <tr key={k} className="border-b border-slate-50"><td className="py-2 text-slate-400 w-24">{k}</td><td className="py-2 text-slate-700">{v}</td></tr>
                        ))}
                      </tbody></table>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u5951\u7D04\u60C5\u5831'}</h3>
                      <div className="space-y-2">
                        {contractTypes.map((ct) => (
                          <div key={ct.label} className="flex items-center gap-2">
                            {ct.active ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-300" />}
                            <span className={`text-sm ${ct.active ? 'text-slate-700' : 'text-slate-400'}`}>{ct.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400">{'\u62C5\u5F53\u8005'}</p>
                        <p className="text-sm text-slate-700">{selectedClient.assignedStaff}{'\uFF08\u4E8B\u52D9\u6240\u5074\uFF09'}</p>
                        <p className="text-sm text-slate-500">{selectedClient.representative}{'\uFF08\u5148\u65B9\u7A93\u53E3\uFF09'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Checklist Section */}
                  {consultationTemplates.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-[#ea580c]" />
                          <h3 className="text-sm font-bold text-slate-700">{'\u521D\u56DE\u9762\u8AC7\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8'}</h3>
                        </div>
                        <span className="text-xs text-slate-500">{consultationCheckedCount}/{consultationTemplates.length}{'\u5B8C\u4E86'}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-[#ea580c] rounded-full transition-all" style={{ width: `${consultationTemplates.length > 0 ? Math.round((consultationCheckedCount / consultationTemplates.length) * 100) : 0}%` }} />
                      </div>
                      {Object.entries(
                        consultationTemplates.reduce<Record<string, ConsultationTemplateItem[]>>((acc, t) => {
                          if (!acc[t.category]) acc[t.category] = [];
                          acc[t.category].push(t);
                          return acc;
                        }, {})
                      ).map(([category, templates]) => (
                        <div key={category} className="mb-3">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">{consultationCategoryLabels[category] || category}</p>
                          <div className="space-y-1">
                            {templates.map((tmpl) => {
                              const record = consultationRecords.find((r) => r.template_id === tmpl.id);
                              const isChecked = record?.is_checked || false;
                              return (
                                <div key={tmpl.id} className="flex items-start gap-2 py-2 px-3 bg-slate-50 rounded-lg group">
                                  <button onClick={() => handleConsultationToggle(tmpl.id, isChecked)} className="mt-0.5 flex-shrink-0">
                                    {isChecked ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${isChecked ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{tmpl.title}</p>
                                    {tmpl.description && <p className="text-[10px] text-slate-400 mt-0.5">{tmpl.description}</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form Responses Section */}
                  {formResponses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileInput className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-bold text-slate-700">{'\u30D5\u30A9\u30FC\u30E0\u56DE\u7B54'}</h3>
                      </div>
                      {Object.entries(groupedFormResponses).map(([templateId, responses]) => (
                        <div key={templateId} className="mb-3 bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-600 mb-2">{templateId}</p>
                          <div className="space-y-1.5">
                            {responses.map((r) => (
                              <div key={r.id} className="flex items-center justify-between text-sm">
                                <div className="flex-1">
                                  <span className="text-slate-500">{r.field_label}: </span>
                                  <span className="text-slate-700">{r.response_text || (r.response_file_name ? r.response_file_name : '-')}</span>
                                </div>
                                {r.reviewed_at ? (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">{'\u78BA\u8A8D\u6E08'}</span>
                                ) : (
                                  <button onClick={() => handleMarkReviewed(r.id)} className="text-[10px] text-[#ea580c] border border-[#ea580c] px-1.5 py-0.5 rounded hover:bg-[#ea580c] hover:text-white">{'\u78BA\u8A8D'}</button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {clientTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u30BF\u30B9\u30AF\u4E00\u89A7'}</h3>
                      <div className="space-y-1.5">
                        {clientTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${task.status === '\u5B8C\u4E86' ? 'bg-emerald-100 text-emerald-700' : task.status === '\u9032\u884C\u4E2D' ? 'bg-blue-100 text-blue-700' : task.status === '\u78BA\u8A8D\u5F85\u3061' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{task.status}</span>
                            <span className="text-sm text-slate-700 flex-1">{task.title}</span>
                            <span className="text-xs text-slate-400">{task.dueDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="border-l-4 border-[#ea580c] bg-[#fff7ed] rounded-r-lg p-4">
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-[#ea580c]" /><h3 className="text-sm font-bold text-slate-700">{'AI\u63D0\u6848'}</h3></div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2"><Lightbulb className="w-4 h-4 text-[#ea580c] mt-0.5 flex-shrink-0" /><p className="text-sm text-slate-600">{'IT\u5C0E\u5165\u88DC\u52A9\u91D1\u306E\u5BFE\u8C61\u3068\u306A\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002\u696D\u7A2E\u30FB\u898F\u6A21\u304B\u3089\u6700\u5927450\u4E07\u5186\u306E\u88DC\u52A9\u304C\u53D7\u3051\u3089\u308C\u307E\u3059\u3002'}</p></div>
                      <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-slate-600">{'\u6C7A\u7B97\u6708\u304C\u8FD1\u3065\u3044\u3066\u3044\u307E\u3059\u3002\u7BC0\u7A0E\u5BFE\u7B56\uFF08\u5C0F\u898F\u6A21\u4F01\u696D\u5171\u6E08\u30FB\u7D4C\u55B6\u30BB\u30FC\u30D5\u30C6\u30A3\u5171\u6E08\uFF09\u306E\u63D0\u6848\u3092\u63A8\u5968\u3057\u307E\u3059\u3002'}</p></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========= MONTHLY TAB ========= */}
              {activeTab === 'monthly' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-4">{'\u6708\u6B21\u51E6\u7406\u30B9\u30C6\u30C3\u30D7'}</h3>
                    <div className="flex items-center gap-2">
                      {monthlySteps.map((step, i) => (
                        <React.Fragment key={i}>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{step.done ? '\u2713' : i + 1}</div>
                            <span className="text-[10px] text-slate-500 text-center whitespace-nowrap">{step.label}</span>
                          </div>
                          {i < monthlySteps.length - 1 && <div className={`flex-1 h-0.5 ${step.done ? 'bg-emerald-400' : 'bg-slate-200'} mt-[-18px]`} />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u4ECA\u6708\u306E\u30BF\u30B9\u30AF'}</h3>
                    {clientTasks.length > 0 ? (
                      <div className="space-y-2">{clientTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
                          {task.status === '\u5B8C\u4E86' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                          <span className={`text-sm ${task.status === '\u5B8C\u4E86' ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{task.title}</span>
                          <span className="text-xs text-slate-400 ml-auto">{task.dueDate}</span>
                        </div>
                      ))}</div>
                    ) : (
                      <div className="text-center py-8 text-slate-400"><Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">{'\u30BF\u30B9\u30AF\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093'}</p></div>
                    )}
                  </div>
                  {dbTaskTemplates.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u696D\u52D9\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8'}</h3>
                      <div className="space-y-1.5">{dbTaskTemplates.slice(0, 5).map((tmpl) => (
                        <div key={tmpl.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{tmpl.category}</span>
                          <span className="text-sm text-slate-700">{tmpl.title}</span>
                        </div>
                      ))}</div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u8A18\u5E33OCR'}</h3>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center mb-4 hover:border-[#ea580c] transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">{'\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30ED\u30C3\u30D7\u307E\u305F\u306F\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9'}</p>
                    </div>
                  </div>
                  {journalRules.length > 0 && (
                    <div className="border-l-4 border-[#ea580c] bg-[#fff7ed] rounded-r-lg p-4">
                      <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-[#ea580c]" /><h3 className="text-sm font-bold text-slate-700">{'AI\u5B66\u7FD2\u30EB\u30FC\u30EB'}</h3></div>
                      <div className="space-y-2">{journalRules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{rule.condition} {'\u2192'} {rule.account}</span>
                          <span className="text-xs text-slate-400">{rule.confidence}%</span>
                        </div>
                      ))}</div>
                    </div>
                  )}
                </div>
              )}

              {/* ========= DOCUMENTS TAB ========= */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700">{'\u66F8\u985E\u30FB\u8A3C\u6191'}</h3>
                    <select value={uploadVoucherType} onChange={(e) => setUploadVoucherType(e.target.value)} className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
                      {Object.entries(voucherTypeLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                    </select>
                  </div>
                  <div onDrop={handleVoucherDrop} onDragOver={handleVoucherDragOver} onDragLeave={handleVoucherDragLeave} className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploadDragOver ? 'border-[#ea580c] bg-[#fff7ed]' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}`}>
                    {uploading ? (<div className="flex flex-col items-center gap-2"><Loader2 className="w-8 h-8 text-[#ea580c] animate-spin" /><p className="text-sm text-slate-500">{'\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u4E2D...'}</p></div>) : (
                      <><Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500 mb-1">{'\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30E9\u30C3\u30B0\uFF06\u30C9\u30ED\u30C3\u30D7\u3001\u307E\u305F\u306F'}<label className="text-[#ea580c] cursor-pointer hover:underline ml-1">{'\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E'}<input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv" onChange={handleVoucherFileSelect} className="hidden" /></label></p><p className="text-xs text-slate-400">PDF, JPG, PNG, Excel (10MB{'\u4EE5\u4E0B'})</p></>
                    )}
                  </div>
                  {uploadError && (<div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600"><AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{uploadError}</span><button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button></div>)}
                  {dbVouchers.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{'\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u6E08\u307F\u8A3C\u6191'} ({dbVouchers.length})</h4>
                      <div className="space-y-1.5">{dbVouchers.map((v) => (
                        <div key={v.id} className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-lg hover:bg-slate-100 group">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="flex-1 text-sm text-slate-700 truncate">{v.file_name || '(unknown)'}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">{voucherTypeLabels[v.voucher_type] || v.voucher_type}</span>
                          {v.fiscal_year && <span className="text-xs text-slate-400">{v.fiscal_year}</span>}
                          <span className="text-xs text-slate-400">{v.uploaded_at?.slice(0, 10) || '-'}</span>
                        </div>
                      ))}</div>
                    </div>
                  ) : dataSource === 'supabase' && dbDocuments.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{'\u66F8\u985E\u4E00\u89A7'}</h4>
                      <div className="space-y-1.5">{dbDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="flex-1 text-sm text-slate-700">{doc.name}</span>
                          {doc.file_size && <span className="text-xs text-slate-400">{(doc.file_size / 1024).toFixed(0)}KB</span>}
                          <span className="text-xs text-slate-400">{doc.created_at?.slice(0, 10)}</span>
                          {doc.e_bookkeeping_compliant && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">{'\u96FB\u5E33\u6CD5'}</span>}
                        </div>
                      ))}</div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* ========= BILLING TAB ========= */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700">{'\u8ACB\u6C42\u66F8\u4E00\u89A7'}</h3>
                    <button onClick={() => setShowInvoiceModal(true)} className="text-xs text-[#ea580c] border border-[#ea580c] rounded px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors">{'\u65B0\u898F\u8ACB\u6C42\u66F8\u4F5C\u6210'}</button>
                  </div>
                  {dataSource === 'supabase' && dbInvoices.length > 0 ? (
                    <div className="space-y-2">{dbInvoices.map((inv) => {
                      const statusLabel = inv.status === 'paid' ? '\u5165\u91D1\u6E08' : inv.status === 'sent' ? '\u9001\u4ED8\u6E08' : inv.status === 'overdue' ? '\u672A\u5165\u91D1' : '\u4E0B\u66F8\u304D';
                      const statusColor = inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'sent' ? 'bg-blue-100 text-blue-700' : inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600';
                      return (
                        <div key={inv.id} className="flex items-center gap-4 py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100">
                          <Receipt className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{inv.invoice_number || '-'}</span>
                          <span className="flex-1 text-sm text-slate-500">{'\u00A5'}{(inv.total_amount || inv.amount).toLocaleString()}</span>
                          <span className="text-xs text-slate-400">{inv.created_at?.slice(0, 10)}</span>
                          <select value={statusLabel} onChange={(e) => handleInvoiceStatusChange(inv.id, e.target.value)} className={`text-[10px] font-medium px-2 py-0.5 rounded border-0 cursor-pointer ${statusColor}`}>
                            {['\u4E0B\u66F8\u304D', '\u9001\u4ED8\u6E08', '\u5165\u91D1\u6E08', '\u672A\u5165\u91D1'].map((s) => (<option key={s} value={s}>{s}</option>))}
                          </select>
                        </div>
                      );
                    })}</div>
                  ) : dataSource === 'supabase' ? (
                    <div className="text-center py-12 text-slate-400"><Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">{'\u307E\u3060\u8ACB\u6C42\u66F8\u304C\u3042\u308A\u307E\u305B\u3093'}</p></div>
                  ) : (
                    <p className="text-sm text-slate-400 py-8 text-center">{'\u8ACB\u6C42\u66F8\u304C\u3042\u308A\u307E\u305B\u3093'}</p>
                  )}
                </div>
              )}

              {/* ========= KNOWLEDGE TAB ========= */}
              {activeTab === 'knowledge' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-slate-700">{'\u4ED5\u8A33\u30EB\u30FC\u30EB'}</h3><button onClick={() => setShowRuleModal(true)} className="text-xs text-[#ea580c] border border-[#ea580c] rounded px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors">+ {'\u30EB\u30FC\u30EB\u3092\u8FFD\u52A0'}</button></div>
                    {journalRules.length > 0 ? (
                      <div className="space-y-2">{journalRules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg">
                          <div><p className="text-sm text-slate-700">{rule.condition} {'\u2192'} {rule.account}</p><p className="text-xs text-slate-400">{'\u9069\u7528\u56DE\u6570'}: {rule.appliedCount}{'\u56DE'} | {'\u78BA\u4FE1\u5EA6'}: {rule.confidence}%</p></div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${rule.status === '\u627F\u8A8D\u6E08' ? 'bg-emerald-100 text-emerald-700' : rule.status === '\u8981\u78BA\u8A8D' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{rule.status}</span>
                        </div>
                      ))}</div>
                    ) : (<div className="text-center py-8 text-slate-400"><Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">{'\u30EB\u30FC\u30EB\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093'}</p></div>)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-slate-700">{'\u51E6\u7406\u30E1\u30E2\u30FB\u6CE8\u610F\u4E8B\u9805'}</h3><button onClick={() => setShowNoteInput(true)} className="text-xs text-[#ea580c] border border-[#ea580c] rounded px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors">+ {'\u30E1\u30E2\u3092\u8FFD\u52A0'}</button></div>
                    {showNoteInput && (<div className="mb-3 flex gap-2"><input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder={'\u51E6\u7406\u30E1\u30E2\u3092\u5165\u529B...'} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }} /><button onClick={handleAddNote} className="bg-[#ea580c] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#c2410c]">{'\u8FFD\u52A0'}</button><button onClick={() => { setShowNoteInput(false); setNoteInput(''); }} className="text-slate-400 text-sm px-2">{'\u00D7'}</button></div>)}
                    {processingNotes.length > 0 ? (<div className="space-y-2">{processingNotes.map((note) => (<div key={note.id} className="py-2.5 px-3 bg-amber-50 border-l-3 border-amber-400 rounded-r-lg text-sm text-slate-700">{note.content}</div>))}</div>) : !showNoteInput && (<div className="text-center py-6 text-slate-400"><p className="text-sm">{'\u30E1\u30E2\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093'}</p></div>)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-slate-700">{'\u8CC7\u6599\u56DE\u53CE\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8'}</h3><button onClick={() => setShowChecklistInput(true)} className="text-xs text-[#ea580c] border border-[#ea580c] rounded px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors">+ {'\u9805\u76EE\u3092\u8FFD\u52A0'}</button></div>
                    {showChecklistInput && (<div className="mb-3 flex gap-2"><input type="text" value={checklistInput} onChange={(e) => setChecklistInput(e.target.value)} placeholder={'\u65B0\u3057\u3044\u30C1\u30A7\u30C3\u30AF\u9805\u76EE...'} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" onKeyDown={(e) => { if (e.key === 'Enter') handleAddChecklistItem(); }} /><button onClick={handleAddChecklistItem} className="bg-[#ea580c] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#c2410c]">{'\u8FFD\u52A0'}</button><button onClick={() => { setShowChecklistInput(false); setChecklistInput(''); }} className="text-slate-400 text-sm px-2">{'\u00D7'}</button></div>)}
                    {resourceChecklist.length > 0 ? (<div className="space-y-1.5">{resourceChecklist.map((item) => (<div key={item.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">{item.collected ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-300" />}<span className={`text-sm ${item.collected ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{item.label}</span></div>))}</div>) : !showChecklistInput && (<div className="text-center py-6 text-slate-400"><p className="text-sm">{'\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093'}</p></div>)}
                  </div>
                </div>
              )}

              {/* ========= SUBSIDY TAB ========= */}
              {activeTab === 'subsidy' && (
                <div className="space-y-6">
                  {dataSource === 'supabase' && dbSubsidyNotifications.length > 0 && (
                    <><h3 className="text-sm font-bold text-slate-700">{'\u88DC\u52A9\u91D1\u6848\u5185\u5C65\u6B74'}</h3><div className="space-y-3">{dbSubsidyNotifications.map((n) => (
                      <div key={n.id} className="border border-slate-200 rounded-lg p-4"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-slate-700">{n.subsidy_name}</p><p className="text-xs text-slate-400 mt-1">{'\u6848\u5185\u65E5'}: {n.notified_at?.slice(0, 10) || n.created_at?.slice(0, 10)}</p>{n.amount && <p className="text-xs text-slate-500 mt-0.5">{'\u91D1\u984D'}: {'\u00A5'}{n.amount.toLocaleString()}</p>}</div><select value={n.status} onChange={(e) => handleSubsidyStatusChange(n.id, e.target.value)} className="text-[10px] font-medium px-2 py-1 rounded border border-slate-200 bg-white cursor-pointer">{['\u6848\u5185\u6E08', '\u8208\u5473\u3042\u308A', '\u7533\u8ACB\u4E2D', '\u63A1\u629E', '\u4E0D\u63A1\u629E'].map((s) => (<option key={s} value={s}>{s}</option>))}</select></div></div>
                    ))}</div></>
                  )}
                  <h3 className="text-sm font-bold text-slate-700">{'\u8A72\u5F53\u88DC\u52A9\u91D1\uFF08AI\u30DE\u30C3\u30C1\u30F3\u30B0\uFF09'}</h3>
                  <div className="space-y-3">{demoSubsidies.filter(s => s.status === '\u52DF\u96C6\u4E2D').slice(0, 3).map((sub) => (
                    <div key={sub.id} className="border border-slate-200 rounded-lg p-4 hover:border-[#ea580c] transition-colors"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><p className="text-sm font-bold text-slate-700">{sub.name}</p><span className="text-[10px] bg-[#ea580c]/10 text-[#ea580c] font-medium px-2 py-0.5 rounded">{'\u30DE\u30C3\u30C1\u5EA6 85%'}</span></div><p className="text-xs text-slate-500 mb-2">{sub.description}</p><p className="text-xs text-slate-400">{'\u4E0A\u9650'}: {sub.maxAmount} | {'\u7DE0\u5207'}: {sub.deadline}</p></div><button onClick={() => handleNotifySubsidy(sub.name, sub.source)} className="text-xs text-white bg-[#ea580c] rounded px-3 py-1.5 hover:bg-[#c2410c] transition-colors whitespace-nowrap">{'\u6848\u5185\u3059\u308B'}</button></div></div>
                  ))}</div>
                </div>
              )}

              {/* ========= CONTACT TAB ========= */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  {dataSource === 'supabase' && dbMessages.length > 0 ? (
                    <div className="space-y-3">{dbMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_type === 'staff' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${msg.sender_type === 'staff' ? 'bg-slate-100 text-slate-700' : 'bg-[#ea580c] text-white'}`}>
                          <p className="text-xs font-medium mb-0.5 opacity-70">{msg.sender_type === 'staff' ? '\u30B9\u30BF\u30C3\u30D5' : '\u9867\u554F\u5148'}</p>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-[10px] opacity-50 mt-1 text-right">{msg.created_at?.slice(5, 16).replace('T', ' ')}</p>
                        </div>
                      </div>
                    ))}</div>
                  ) : dataSource === 'supabase' ? (
                    <div className="text-center py-12 text-slate-400"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">{'\u30E1\u30C3\u30BB\u30FC\u30B8\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093'}</p></div>
                  ) : (
                    <div className="space-y-3">
                      {[{ from: 'staff', name: '\u5C71\u7530\u592A\u90CE', text: '3\u6708\u5206\u306E\u8CC7\u6599\u63D0\u51FA\u3092\u304A\u9858\u3044\u3044\u305F\u3057\u307E\u3059\u3002\u671F\u9650\u306F4/5\u3067\u3059\u3002', time: '03/20 10:00' },
                       { from: 'client', name: '\u7530\u4E2D\u4E00\u90CE', text: '\u627F\u77E5\u3057\u307E\u3057\u305F\u3002\u6765\u9031\u4E2D\u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002', time: '03/20 14:30' },
                       { from: 'staff', name: '\u5C71\u7530\u592A\u90CE', text: '\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u4F55\u304B\u3054\u4E0D\u660E\u70B9\u304C\u3042\u308C\u3070\u304A\u6C17\u8EFD\u306B\u3054\u9023\u7D61\u304F\u3060\u3055\u3044\u3002', time: '03/20 14:35' }
                      ].map((msg, i) => (
                        <div key={i} className={`flex ${msg.from === 'staff' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${msg.from === 'staff' ? 'bg-slate-100 text-slate-700' : 'bg-[#ea580c] text-white'}`}>
                            <p className="text-xs font-medium mb-0.5 opacity-70">{msg.name}</p><p className="text-sm">{msg.text}</p><p className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message template selector */}
                  <div className="relative">
                    <button onClick={() => setShowTemplateSelector(!showTemplateSelector)} className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 mb-2">
                      <FileText className="w-3 h-3" />{'\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304B\u3089\u9078\u629E'}
                    </button>
                    {showTemplateSelector && messageTemplates.length > 0 && (
                      <div className="absolute bottom-full left-0 mb-1 w-[400px] max-h-[300px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-20">
                        <div className="sticky top-0 bg-white px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-700">{'\u30E1\u30C3\u30BB\u30FC\u30B8\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8'}</span>
                          <button onClick={() => setShowTemplateSelector(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                        </div>
                        {Object.entries(groupedMessageTemplates).map(([type, templates]) => (
                          <div key={type}>
                            <div className="px-4 py-1.5 bg-slate-50 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{type}</div>
                            {templates.map((t) => (
                              <button key={t.id} onClick={() => handleSelectMessageTemplate(t)} className="w-full text-left px-4 py-2 hover:bg-[#fff7ed] transition-colors border-b border-slate-50">
                                <p className="text-sm text-slate-700 truncate">{t.title || t.template_id}</p>
                                <p className="text-[10px] text-slate-400 truncate">{t.body.slice(0, 60)}...</p>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input type="text" placeholder={'\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...'} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                    <button onClick={handleSendMessage} disabled={sendingMessage || !messageInput.trim()} className="bg-[#ea580c] text-white rounded-lg px-4 py-2.5 hover:bg-[#c2410c] transition-colors disabled:opacity-50">
                      {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u9023\u7D61\u5148\u4E00\u89A7'}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-lg"><User className="w-4 h-4 text-slate-400" /><div><p className="text-sm text-slate-700">{selectedClient.representative}{'\uFF08\u793E\u9577\uFF09'}</p><p className="text-xs text-slate-400">{selectedClient.email}</p></div></div>
                      <div className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-lg"><User className="w-4 h-4 text-slate-400" /><div><p className="text-sm text-slate-700">{'\u7D4C\u7406\u62C5\u5F53\u8005'}</p><p className="text-xs text-slate-400">keiri@example.co.jp</p></div></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
