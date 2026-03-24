'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import { clients as demoClients, type Client } from '@/data/clients';
import { tasks as demoTasks } from '@/data/tasks';
import { ocrResults } from '@/data/ocr-results';
import { invoices } from '@/data/invoices';
import { aiLearningRules } from '@/data/ai-learning-rules';
import { subsidies } from '@/data/subsidies';
import { fetchClients, fetchTasks, insertClient } from '@/lib/supabase-helpers';
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

/* Monthly progress steps for the detail panel */
const monthlySteps = [
  { label: '\u8CC7\u6599\u56DE\u53CE', done: true },
  { label: '\u4ED5\u8A33\u5165\u529B', done: true },
  { label: '\u6B8B\u9AD8\u78BA\u8A8D', done: true },
  { label: '\u8A66\u7B97\u8868', done: false },
  { label: '\u5831\u544A', done: false },
];

/* Sample task checklist for the detail panel */
const monthlyChecklist = [
  { label: '\u9818\u53CE\u66F8\u30FB\u8ACB\u6C42\u66F8\u306E\u56DE\u53CE\u78BA\u8A8D', done: true },
  { label: '\u9280\u884C\u660E\u7D30\u306E\u53D6\u8FBC', done: true },
  { label: '\u30AF\u30EC\u30AB\u660E\u7D30\u306E\u7167\u5408', done: false },
  { label: '\u8A66\u7B97\u8868\u306E\u78BA\u8A8D\u30FB\u5831\u544A', done: false },
];

/* Documents sample */
const sampleFolders = [
  { name: '2025\u5E74\u5EA6', items: ['\u9818\u53CE\u66F8', '\u8ACB\u6C42\u66F8', '\u9280\u884C\u660E\u7D30', '\u30AF\u30EC\u30AB\u660E\u7D30', '\u6C7A\u7B97\u66F8\u985E'] },
  { name: '2026\u5E74\u5EA6', items: ['\u9818\u53CE\u66F8', '\u8ACB\u6C42\u66F8', '\u9280\u884C\u660E\u7D30', '\u30AF\u30EC\u30AB\u660E\u7D30'] },
];
const sampleFiles = [
  { name: '\u6C7A\u7B97\u5831\u544A\u66F8_2025.pdf', size: '2.4MB', date: '2025-06-15', compliant: true },
  { name: '\u6CD5\u4EBA\u7A0E\u7533\u544A\u66F8_2025.pdf', size: '1.8MB', date: '2025-06-20', compliant: true },
  { name: '\u6708\u6B21\u8A66\u7B97\u8868_2026_02.xlsx', size: '430KB', date: '2026-03-10', compliant: true },
  { name: '\u9867\u554F\u5951\u7D04\u66F8.pdf', size: '890KB', date: '2023-10-01', compliant: false },
  { name: '\u6E90\u6CC9\u5FB4\u53CE\u7968_2025.pdf', size: '1.1MB', date: '2026-01-31', compliant: true },
];

/* Sample chat messages */
const chatMessages = [
  { from: 'staff', name: '\u5C71\u7530\u592A\u90CE', text: '3\u6708\u5206\u306E\u8CC7\u6599\u63D0\u51FA\u3092\u304A\u9858\u3044\u3044\u305F\u3057\u307E\u3059\u3002\u671F\u9650\u306F4/5\u3067\u3059\u3002', time: '03/20 10:00' },
  { from: 'client', name: '\u7530\u4E2D\u4E00\u90CE', text: '\u627F\u77E5\u3057\u307E\u3057\u305F\u3002\u6765\u9031\u4E2D\u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002', time: '03/20 14:30' },
  { from: 'staff', name: '\u5C71\u7530\u592A\u90CE', text: '\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u4F55\u304B\u3054\u4E0D\u660E\u70B9\u304C\u3042\u308C\u3070\u304A\u6C17\u8EFD\u306B\u3054\u9023\u7D61\u304F\u3060\u3055\u3044\u3002', time: '03/20 14:35' },
];

/* Contract types */
const contractTypes = [
  { label: '\u7A0E\u52D9\u9867\u554F', active: true },
  { label: '\u8A18\u5E33\u4EE3\u884C', active: true },
  { label: '\u7D66\u4E0E\u8A08\u7B97', active: false },
  { label: '\u6C7A\u7B97\u6599', active: true },
  { label: '\u5E74\u672B\u8ABF\u6574', active: false },
];

/* Resources checklist */
const resourceChecklist = [
  { label: '\u9818\u53CE\u66F8\u30FB\u30EC\u30B7\u30FC\u30C8', collected: true },
  { label: '\u8ACB\u6C42\u66F8', collected: true },
  { label: '\u9280\u884C\u901A\u5E33\u30B3\u30D4\u30FC', collected: false },
  { label: '\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9\u660E\u7D30', collected: false },
  { label: '\u7D66\u4E0E\u53F0\u5E33', collected: true },
  { label: '\u793E\u4F1A\u4FDD\u967A\u6599\u901A\u77E5', collected: true },
];

/* Processing notes */
const processingNotes = [
  '\u5F79\u54E1\u5831\u916C\u306F\u6BCB\u6708\u5B9A\u984D500,000\u5186\u3002\u5909\u66F4\u6642\u306F\u5148\u65B9\u306B\u78BA\u8A8D\u8981\u3002',
  '\u6C7A\u7B97\u8CDE\u4E0E\u306F12\u6708\u652F\u7D66\u3002\u640D\u91D1\u7B97\u5165\u6642\u671F\u306B\u6CE8\u610F\u3002',
];

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

// New client form initial state
const initialNewClient = {
  name: '',
  representative: '',
  type: 'corporate',
  settlementMonth: 3,
  accountingSoftware: 'freee',
  monthlyFee: 30000,
  phone: '',
  email: '',
  industry: '',
};

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
  const [newClient, setNewClient] = useState(initialNewClient);
  const [saving, setSaving] = useState(false);

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

  const clientTasks = selectedClient ? tasksData.filter((t) => t.clientId === selectedClient.id) : [];
  const clientInvoices = selectedClient ? invoices.filter((i) => i.clientId === selectedClient.id) : [];
  const clientOcr = selectedClient ? ocrResults.filter((o) => o.clientName === selectedClient?.name) : [];
  const clientRules = selectedClient ? aiLearningRules.filter((r) => r.clientName === selectedClient?.name) : [];

  const completedMonthlySteps = monthlySteps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedMonthlySteps / monthlySteps.length) * 100);

  const handleAddClient = async () => {
    setSaving(true);
    try {
      if (dataSource === 'supabase') {
        const success = await insertClient(newClient);
        if (success) {
          // Reload clients from DB
          const dbClients = await fetchClients();
          if (dbClients.length > 0) {
            setClientsData(dbClients);
          }
        }
      } else {
        // Demo mode: add locally
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
          type: newClient.type as Client['type'],
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
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {'\u65B0\u898F\u767B\u9332'}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={'\u4F1A\u793E\u540D\u30FB\u4EE3\u8868\u8005\u540D\u3067\u691C\u7D22...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30 focus:border-[#ea580c]"
          />
        </div>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
        >
          <option value="">{'\u6C7A\u7B97\u6708'}</option>
          {[3, 6, 9, 12].map((m) => (
            <option key={m} value={m}>
              {m}{'\u6708'}
            </option>
          ))}
        </select>
        <select
          value={filterStaff}
          onChange={(e) => setFilterStaff(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
        >
          <option value="">{'\u62C5\u5F53\u8005'}</option>
          {staffList.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterSoftware}
          onChange={(e) => setFilterSoftware(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
        >
          <option value="">{'\u4F1A\u8A08\u30BD\u30D5\u30C8'}</option>
          {['freee', 'MF', 'yayoi'].map((s) => (
            <option key={s} value={s}>
              {softwareLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((client) => {
          const clientTasksForCard = tasksData.filter(
            (t) => t.clientId === client.id && t.status !== '\u5B8C\u4E86'
          );
          const hasAlert = clientTasksForCard.some((t) => t.priority === 'high');
          return (
            <div
              key={client.id}
              onClick={() => {
                setSelectedClient(client);
                setActiveTab('overview');
              }}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-[#ea580c] transition-colors">
                      {client.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rankColors[client.rank]}`}
                    >
                      {client.rank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{client.representative}</p>
                </div>
                {hasAlert && (
                  <span className="flex-shrink-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                    {'\u8981\u5BFE\u5FDC'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${softwareColors[client.accountingSoftware]}`}
                >
                  {softwareLabels[client.accountingSoftware]}
                </span>
                <span className="text-[10px] text-slate-400">
                  {'\u6C7A\u7B97'} {client.settlementMonth}{'\u6708'}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">{'\u6708\u6B21\u9032\u6357'}</span>
                  <span className="text-[10px] font-medium text-slate-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                    {client.assignedStaff.slice(0, 1)}
                  </div>
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
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">{'\u4F1A\u793E\u540D'} *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  placeholder={'\u682A\u5F0F\u4F1A\u793E\u25CB\u25CB'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u4EE3\u8868\u8005\u540D'}</label>
                  <input
                    type="text"
                    value={newClient.representative}
                    onChange={(e) => setNewClient({ ...newClient, representative: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u696D\u7A2E'}</label>
                  <input
                    type="text"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u6C7A\u7B97\u6708'}</label>
                  <select
                    value={newClient.settlementMonth}
                    onChange={(e) => setNewClient({ ...newClient, settlementMonth: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{m}{'\u6708'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u4F1A\u8A08\u30BD\u30D5\u30C8'}</label>
                  <select
                    value={newClient.accountingSoftware}
                    onChange={(e) => setNewClient({ ...newClient, accountingSoftware: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  >
                    <option value="freee">freee</option>
                    <option value="MF">MF</option>
                    <option value="yayoi">{'\u5F25\u751F'}</option>
                    <option value="other">{'\u305D\u306E\u4ED6'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u6708\u984D\u9867\u554F\u6599'}</label>
                  <input
                    type="number"
                    value={newClient.monthlyFee}
                    onChange={(e) => setNewClient({ ...newClient, monthlyFee: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u96FB\u8A71\u756A\u53F7'}</label>
                  <input
                    type="text"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u30E1\u30FC\u30EB'}</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50"
              >
                {'\u30AD\u30E3\u30F3\u30BB\u30EB'}
              </button>
              <button
                onClick={handleAddClient}
                disabled={!newClient.name || saving}
                className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? '\u4FDD\u5B58\u4E2D...' : '\u767B\u9332'}
              </button>
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
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${rankColors[selectedClient.rank]}`}>
                      {selectedClient.rank}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{selectedClient.representative}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-slate-500">
                    <p>{'\u6C7A\u7B97'} {selectedClient.settlementMonth}{'\u6708'} | {softwareLabels[selectedClient.accountingSoftware]}</p>
                    <p>{'\u6708\u984D'} {'\u00A5'}{selectedClient.monthlyFee.toLocaleString()}</p>
                  </div>
                  <button className="text-xs text-[#ea580c] border border-[#ea580c] rounded-lg px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors whitespace-nowrap">
                    <ExternalLink className="w-3 h-3 inline mr-1" />
                    {'\u30DE\u30A4\u30DA\u30FC\u30B8'}
                  </button>
                  <button onClick={() => setSelectedClient(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              <div className="px-5 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{'\u6708\u6B21\u9032\u6357'}</span>
                  <span className="text-xs font-medium text-emerald-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              {/* Tabs */}
              <div className="px-5 flex gap-1 overflow-x-auto">
                {detailTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                        activeTab === tab.key
                          ? 'bg-[#ea580c]/10 text-[#ea580c] border-b-2 border-[#ea580c]'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
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
                  <div className="grid grid-cols-2 gap-6">
                    {/* Basic info */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u57FA\u672C\u60C5\u5831'}</h3>
                      <table className="w-full text-sm">
                        <tbody>
                          {[
                            ['\u4EE3\u8868\u8005', selectedClient.representative],
                            ['\u696D\u7A2E', selectedClient.industry],
                            ['\u96FB\u8A71', selectedClient.phone],
                            ['\u30E1\u30FC\u30EB', selectedClient.email],
                            ['\u767B\u9332\u65E5', selectedClient.registeredDate],
                          ].map(([k, v]) => (
                            <tr key={k} className="border-b border-slate-50">
                              <td className="py-2 text-slate-400 w-24">{k}</td>
                              <td className="py-2 text-slate-700">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Contract info */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u5951\u7D04\u60C5\u5831'}</h3>
                      <div className="space-y-2">
                        {contractTypes.map((ct) => (
                          <div key={ct.label} className="flex items-center gap-2">
                            {ct.active ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300" />
                            )}
                            <span className={`text-sm ${ct.active ? 'text-slate-700' : 'text-slate-400'}`}>
                              {ct.label}
                            </span>
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
                  {/* Active tasks for this client */}
                  {clientTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u30BF\u30B9\u30AF\u4E00\u89A7'}</h3>
                      <div className="space-y-1.5">
                        {clientTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              task.status === '\u5B8C\u4E86' ? 'bg-emerald-100 text-emerald-700' :
                              task.status === '\u9032\u884C\u4E2D' ? 'bg-blue-100 text-blue-700' :
                              task.status === '\u78BA\u8A8D\u5F85\u3061' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-sm text-slate-700 flex-1">{task.title}</span>
                            <span className="text-xs text-slate-400">{task.dueDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* AI Suggestions */}
                  <div className="border-l-4 border-[#ea580c] bg-[#fff7ed] rounded-r-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#ea580c]" />
                      <h3 className="text-sm font-bold text-slate-700">{'AI\u63D0\u6848'}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-[#ea580c] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600">
                          {'IT\u5C0E\u5165\u88DC\u52A9\u91D1\u306E\u5BFE\u8C61\u3068\u306A\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002\u696D\u7A2E\u30FB\u898F\u6A21\u304B\u3089\u6700\u5927450\u4E07\u5186\u306E\u88DC\u52A9\u304C\u53D7\u3051\u3089\u308C\u307E\u3059\u3002'}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600">
                          {'\u6C7A\u7B97\u6708\u304C\u8FD1\u3065\u3044\u3066\u3044\u307E\u3059\u3002\u7BC0\u7A0E\u5BFE\u7B56\uFF08\u5C0F\u898F\u6A21\u4F01\u696D\u5171\u6E08\u30FB\u7D4C\u55B6\u30BB\u30FC\u30D5\u30C6\u30A3\u5171\u6E08\uFF09\u306E\u63D0\u6848\u3092\u63A8\u5968\u3057\u307E\u3059\u3002'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========= MONTHLY TAB ========= */}
              {activeTab === 'monthly' && (
                <div className="space-y-6">
                  {/* Stepper */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-4">{'\u6708\u6B21\u51E6\u7406\u30B9\u30C6\u30C3\u30D7'}</h3>
                    <div className="flex items-center gap-2">
                      {monthlySteps.map((step, i) => (
                        <React.Fragment key={i}>
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                step.done
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {step.done ? '\u2713' : i + 1}
                            </div>
                            <span className="text-[10px] text-slate-500 text-center whitespace-nowrap">
                              {step.label}
                            </span>
                          </div>
                          {i < monthlySteps.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 ${
                                step.done ? 'bg-emerald-400' : 'bg-slate-200'
                              } mt-[-18px]`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  {/* Checklist */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u4ECA\u6708\u306E\u30BF\u30B9\u30AF'}</h3>
                    <div className="space-y-2">
                      {monthlyChecklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
                          {item.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${item.done ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* OCR */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u8A18\u5E33OCR'}</h3>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center mb-4 hover:border-[#ea580c] transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">{'\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30ED\u30C3\u30D7\u307E\u305F\u306F\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9'}</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <button className="text-xs text-slate-500 border border-slate-200 rounded px-3 py-1 hover:bg-slate-50">
                          {'Google Drive\u304B\u3089\u9078\u629E'}
                        </button>
                        <button className="text-xs text-slate-500 border border-slate-200 rounded px-3 py-1 hover:bg-slate-50">
                          {'\u30B9\u30AD\u30E3\u30CA\u30FC\u9023\u643A'}
                        </button>
                      </div>
                    </div>
                    {clientOcr.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-100">
                              {['\u30B9\u30C6\u30FC\u30BF\u30B9', '\u8A3C\u6191\u7A2E\u5225', '\u53D6\u5F15\u5148', '\u91D1\u984D', '\u52D8\u5B9A\u79D1\u76EE', '\u64CD\u4F5C'].map((h) => (
                                <th key={h} className="text-left py-2 text-slate-400 font-medium px-2">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {clientOcr.map((ocr) => (
                              <tr key={ocr.id} className="border-b border-slate-50">
                                <td className="py-2 px-2">
                                  <span
                                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                                      ocr.status === '\u78BA\u8A8D\u6E08'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : ocr.status === '\u8981\u78BA\u8A8D'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {ocr.status}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-slate-700">{ocr.documentType}</td>
                                <td className="py-2 px-2 text-slate-700">{ocr.vendor}</td>
                                <td className="py-2 px-2 text-slate-700">{'\u00A5'}{ocr.amount.toLocaleString()}</td>
                                <td className="py-2 px-2 text-slate-700">{ocr.account}</td>
                                <td className="py-2 px-2">
                                  <button className="text-[#ea580c] hover:underline">{'\u78BA\u8A8D'}</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  {/* AI Learning Rules */}
                  {clientRules.length > 0 && (
                    <div className="border-l-4 border-[#ea580c] bg-[#fff7ed] rounded-r-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#ea580c]" />
                        <h3 className="text-sm font-bold text-slate-700">{'AI\u5B66\u7FD2\u30EB\u30FC\u30EB'}</h3>
                      </div>
                      <div className="space-y-2">
                        {clientRules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                              {rule.condition} {'\u2192'} {rule.account}
                            </span>
                            <span className="text-xs text-slate-400">{rule.confidence}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========= DOCUMENTS TAB ========= */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700">{'\u30D5\u30A9\u30EB\u30C0'}</h3>
                    <div className="flex gap-2">
                      <button className="text-xs text-slate-500 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50">
                        {'Google Drive\u3067\u958B\u304F'}
                      </button>
                      <button className="text-xs text-[#ea580c] border border-[#ea580c] rounded px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors">
                        {'\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u4F9D\u983C\u3092\u9001\u308B'}
                      </button>
                    </div>
                  </div>
                  {/* Folder tree */}
                  <div className="space-y-2">
                    {sampleFolders.map((folder) => (
                      <div key={folder.name} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FolderOpen className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium text-slate-700">{folder.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-6">
                          {folder.items.map((item) => (
                            <span key={item} className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-600">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* File list */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u30D5\u30A1\u30A4\u30EB\u4E00\u89A7'}</h3>
                    <div className="space-y-1.5">
                      {sampleFiles.map((file) => (
                        <div key={file.name} className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="flex-1 text-sm text-slate-700">{file.name}</span>
                          <span className="text-xs text-slate-400">{file.size}</span>
                          <span className="text-xs text-slate-400">{file.date}</span>
                          {file.compliant && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">{'\u96FB\u5E33\u6CD5'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========= BILLING TAB ========= */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700">{'\u8ACB\u6C42\u66F8\u4E00\u89A7'}</h3>
                    <button className="text-xs text-[#ea580c] border border-[#ea580c] rounded px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors">
                      {'\u65B0\u898F\u8ACB\u6C42\u66F8\u4F5C\u6210'}
                    </button>
                  </div>
                  {clientInvoices.length > 0 ? (
                    <div className="space-y-2">
                      {clientInvoices.map((inv) => (
                        <div key={inv.id} className="flex items-center gap-4 py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                          <Receipt className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{inv.invoiceNumber}</span>
                          <span className="flex-1 text-sm text-slate-500">{'\u00A5'}{inv.totalAmount.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">{inv.issueDate}</span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                              inv.status === '\u5165\u91D1\u6E08'
                                ? 'bg-emerald-100 text-emerald-700'
                                : inv.status === '\u9001\u4ED8\u6E08'
                                ? 'bg-blue-100 text-blue-700'
                                : inv.status === '\u672A\u5165\u91D1'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-8 text-center">{'\u8ACB\u6C42\u66F8\u304C\u3042\u308A\u307E\u305B\u3093'}</p>
                  )}
                </div>
              )}

              {/* ========= KNOWLEDGE TAB ========= */}
              {activeTab === 'knowledge' && (
                <div className="space-y-6">
                  {/* Rules */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u4ED5\u8A33\u30EB\u30FC\u30EB'}</h3>
                    {clientRules.length > 0 ? (
                      <div className="space-y-2">
                        {clientRules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="text-sm text-slate-700">{rule.condition} {'\u2192'} {rule.account}</p>
                              <p className="text-xs text-slate-400">{'\u9069\u7528\u56DE\u6570'}: {rule.appliedCount}{'\u56DE'} | {'\u78BA\u4FE1\u5EA6'}: {rule.confidence}%</p>
                            </div>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                                rule.status === '\u627F\u8A8D\u6E08' ? 'bg-emerald-100 text-emerald-700' : rule.status === '\u8981\u78BA\u8A8D' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {rule.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">{'\u30EB\u30FC\u30EB\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093'}</p>
                    )}
                  </div>
                  {/* Processing notes */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u51E6\u7406\u30E1\u30E2\u30FB\u6CE8\u610F\u4E8B\u9805'}</h3>
                    <div className="space-y-2">
                      {processingNotes.map((note, i) => (
                        <div key={i} className="py-2.5 px-3 bg-amber-50 border-l-3 border-amber-400 rounded-r-lg text-sm text-slate-700">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Resource checklist */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u8CC7\u6599\u56DE\u53CE\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8'}</h3>
                    <div className="space-y-1.5">
                      {resourceChecklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
                          {item.collected ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                          <span className={`text-sm ${item.collected ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Tax audit history */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u7A0E\u52D9\u8ABF\u67FB\u5C65\u6B74'}</h3>
                    <div className="py-2.5 px-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">{'2024\u5E742\u6708 \u6CD5\u4EBA\u7A0E\u8ABF\u67FB\uFF08\u4FEE\u6B63\u7533\u544A\u306A\u3057\uFF09'}</p>
                      <p className="text-xs text-slate-400">{'\u8ABF\u67FB\u5B98: \u7A0E\u52D9\u7F72\u7B2C\u4E00\u90E8\u9580'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ========= SUBSIDY TAB ========= */}
              {activeTab === 'subsidy' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-700">{'\u8A72\u5F53\u88DC\u52A9\u91D1\uFF08AI\u30DE\u30C3\u30C1\u30F3\u30B0\uFF09'}</h3>
                  <div className="space-y-3">
                    {subsidies.filter(s => s.status === '\u52DF\u96C6\u4E2D').slice(0, 3).map((sub) => (
                      <div key={sub.id} className="border border-slate-200 rounded-lg p-4 hover:border-[#ea580c] transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-slate-700">{sub.name}</p>
                              <span className="text-[10px] bg-[#ea580c]/10 text-[#ea580c] font-medium px-2 py-0.5 rounded">
                                {'\u30DE\u30C3\u30C1\u5EA6 85%'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{sub.description}</p>
                            <p className="text-xs text-slate-400">{'\u4E0A\u9650'}: {sub.maxAmount} | {'\u7DE0\u5207'}: {sub.deadline}</p>
                          </div>
                          <button className="text-xs text-white bg-[#ea580c] rounded px-3 py-1.5 hover:bg-[#c2410c] transition-colors whitespace-nowrap">
                            {'\u6848\u5185\u3059\u308B'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Referred services */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u7D39\u4ECB\u6E08\u307F\u30B5\u30FC\u30D3\u30B9'}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm text-slate-700">{'\u793E\u4F1A\u4FDD\u967A\u52B4\u52D9\u58EB\u6CD5\u4EBA\u307F\u3089\u3044'}</p>
                          <p className="text-xs text-slate-400">{'\u52A9\u6210\u91D1\u7533\u8ACB\u30B5\u30DD\u30FC\u30C8'}</p>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{'\u6210\u7D04'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm text-slate-700">{'\u30C7\u30B8\u30BF\u30EB\u30C4\u30FC\u30EB\u7814\u7A76\u6240'}</p>
                          <p className="text-xs text-slate-400">{'IT\u5C0E\u5165\u88DC\u52A9\u91D1\u652F\u63F4'}</p>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{'\u9032\u884C\u4E2D'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========= CONTACT TAB ========= */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.from === 'staff' ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                            msg.from === 'staff'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-[#ea580c] text-white'
                          }`}
                        >
                          <p className="text-xs font-medium mb-0.5 opacity-70">{msg.name}</p>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={'\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...'}
                      className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                    />
                    <button className="bg-[#ea580c] text-white rounded-lg px-4 py-2.5 hover:bg-[#c2410c] transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Contact list */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{'\u9023\u7D61\u5148\u4E00\u89A7'}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-lg">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-700">{selectedClient.representative}{'\uFF08\u793E\u9577\uFF09'}</p>
                          <p className="text-xs text-slate-400">{selectedClient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-lg">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-700">{'\u7D4C\u7406\u62C5\u5F53\u8005'}</p>
                          <p className="text-xs text-slate-400">{'keiri@example.co.jp'}</p>
                        </div>
                      </div>
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
