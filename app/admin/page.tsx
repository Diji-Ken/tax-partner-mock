'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  Plug,
  Users,
  Shield,
  Bell,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  ListChecks,
} from 'lucide-react';
import { integrations } from '@/data/integrations';
import { staff as demoStaff } from '@/data/staff';
import { supabase } from '@/lib/supabase';

type Tab = 'integrations' | 'staff' | 'settings' | 'consultation' | 'task_templates';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'integrations', label: '\u9023\u643A\u7BA1\u7406', icon: Plug },
  { key: 'staff', label: '\u30B9\u30BF\u30C3\u30D5\u7BA1\u7406', icon: Users },
  { key: 'consultation', label: '\u521D\u56DE\u9762\u8AC7\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8', icon: ClipboardList },
  { key: 'task_templates', label: '\u696D\u52D9\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8', icon: ListChecks },
  { key: 'settings', label: '\u8A2D\u5B9A', icon: Settings },
];

const categories = [...new Set(integrations.map((i) => i.category))];

const roleColors: Record<string, string> = {
  '\u7BA1\u7406\u8005': 'bg-[#ea580c]/10 text-[#ea580c]',
  '\u30B9\u30BF\u30C3\u30D5': 'bg-blue-100 text-blue-700',
  '\u95B2\u89A7\u8005': 'bg-slate-100 text-slate-600',
  admin: 'bg-[#ea580c]/10 text-[#ea580c]',
  member: 'bg-blue-100 text-blue-700',
  viewer: 'bg-slate-100 text-slate-600',
};
const productivityColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-amber-100 text-amber-700',
  C: 'bg-red-100 text-red-700',
};

const roleLabels: Record<string, string> = {
  admin: '\u7BA1\u7406\u8005',
  member: '\u30B9\u30BF\u30C3\u30D5',
  viewer: '\u95B2\u89A7\u8005',
  '\u7BA1\u7406\u8005': '\u7BA1\u7406\u8005',
  '\u30B9\u30BF\u30C3\u30D5': '\u30B9\u30BF\u30C3\u30D5',
  '\u95B2\u89A7\u8005': '\u95B2\u89A7\u8005',
};

interface DbStaff {
  id: string;
  name: string;
  email: string | null;
  role: string;
}

interface DbOffice {
  id: string;
  name: string;
  representative: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface ConsultationTemplate {
  id: string;
  category: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface TaskTemplate {
  id: string;
  template_id: string;
  category: string;
  title: string;
  description: string | null;
  send_day_offset: number | null;
  due_day_offset: number | null;
  office_todo: string | null;
  sort_order: number | null;
}

const consultationCategoryLabels: Record<string, string> = {
  common: '\u5171\u901A',
  new_corporate: '\u65B0\u8A2D\u6CD5\u4EBA',
  existing_corporate: '\u65E2\u5B58\u6CD5\u4EBA',
  individual: '\u500B\u4EBA\u4E8B\u696D\u4E3B',
  discussion: '\u691C\u8A0E\u4E8B\u9805',
};

const taskCategoryLabels: Record<string, string> = {
  init_new_corporate: '\u521D\u56DE\u65B0\u898F\u6CD5\u4EBA',
  init_existing_corporate: '\u521D\u56DE\u65E2\u5B58\u6CD5\u4EBA',
  init_individual: '\u521D\u56DE\u500B\u4EBA',
  monthly: '\u6708\u6B21',
  annual: '\u5E74\u6B21',
};

const OFFICE_ID = '00000000-0000-0000-0000-000000000001';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('integrations');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'demo' | 'supabase'>('demo');

  const [staffData, setStaffData] = useState(demoStaff);
  const [officeData, setOfficeData] = useState<DbOffice | null>(null);

  // Consultation templates state
  const [consultationTemplates, setConsultationTemplates] = useState<ConsultationTemplate[]>([]);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [showAddConsultation, setShowAddConsultation] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<string | null>(null);
  const [newConsultation, setNewConsultation] = useState({ category: 'common', title: '', description: '' });
  const [editConsultation, setEditConsultation] = useState({ title: '', description: '' });

  // Task templates state
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [taskTemplatesLoading, setTaskTemplatesLoading] = useState(false);
  const [activeTaskCategory, setActiveTaskCategory] = useState('init_new_corporate');
  const [showAddTaskTemplate, setShowAddTaskTemplate] = useState(false);
  const [editingTaskTemplate, setEditingTaskTemplate] = useState<string | null>(null);
  const [newTaskTemplate, setNewTaskTemplate] = useState({ templateId: '', title: '', description: '', sendDay: '', dueDay: '', officeTodo: '' });
  const [editTaskTemplate, setEditTaskTemplate] = useState({ title: '', description: '', officeTodo: '' });

  useEffect(() => {
    async function loadData() {
      if (!supabase) { setLoading(false); return; }
      try {
        const [staffRes, officeRes] = await Promise.all([
          supabase.from('staff').select('*').order('created_at'),
          supabase.from('offices').select('*').limit(1).single(),
        ]);

        if (staffRes.data && staffRes.data.length > 0) {
          setStaffData(staffRes.data.map((s: DbStaff) => ({
            id: s.id,
            name: s.name,
            email: s.email || '',
            role: (roleLabels[s.role] || s.role) as '\u7BA1\u7406\u8005' | '\u30B9\u30BF\u30C3\u30D5' | '\u95B2\u89A7\u8005',
            status: 'active' as const,
            clientCount: 0,
            averageHours: 0,
            productivity: 'B' as const,
          })));
          setDataSource('supabase');
        }

        if (officeRes.data) {
          setOfficeData(officeRes.data);
        }
      } catch (err) {
        console.error('Admin data fetch failed, using demo:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load consultation templates
  useEffect(() => {
    if (activeTab === 'consultation') {
      loadConsultationTemplates();
    }
  }, [activeTab]);

  // Load task templates
  useEffect(() => {
    if (activeTab === 'task_templates') {
      loadTaskTemplates();
    }
  }, [activeTab]);

  const loadConsultationTemplates = async () => {
    if (!supabase) return;
    setConsultationLoading(true);
    try {
      const { data } = await supabase
        .from('consultation_templates')
        .select('*')
        .eq('office_id', OFFICE_ID)
        .order('sort_order');
      if (data) setConsultationTemplates(data);
    } catch (err) {
      console.error('Failed to load consultation templates:', err);
    } finally {
      setConsultationLoading(false);
    }
  };

  const loadTaskTemplates = async () => {
    if (!supabase) return;
    setTaskTemplatesLoading(true);
    try {
      const { data } = await supabase
        .from('task_templates')
        .select('*')
        .eq('office_id', OFFICE_ID)
        .order('category')
        .order('sort_order');
      if (data) setTaskTemplates(data);
    } catch (err) {
      console.error('Failed to load task templates:', err);
    } finally {
      setTaskTemplatesLoading(false);
    }
  };

  // Consultation CRUD
  const handleAddConsultation = async () => {
    if (!supabase || !newConsultation.title) return;
    const maxOrder = consultationTemplates
      .filter((t) => t.category === newConsultation.category)
      .reduce((max, t) => Math.max(max, t.sort_order), 0);
    const { error } = await supabase.from('consultation_templates').insert({
      office_id: OFFICE_ID,
      category: newConsultation.category,
      title: newConsultation.title,
      description: newConsultation.description,
      sort_order: maxOrder + 1,
    });
    if (!error) {
      setNewConsultation({ category: 'common', title: '', description: '' });
      setShowAddConsultation(false);
      loadConsultationTemplates();
    }
  };

  const handleUpdateConsultation = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('consultation_templates').update({
      title: editConsultation.title,
      description: editConsultation.description,
    }).eq('id', id);
    if (!error) {
      setEditingConsultation(null);
      loadConsultationTemplates();
    }
  };

  const handleToggleConsultation = async (id: string, isActive: boolean) => {
    if (!supabase) return;
    await supabase.from('consultation_templates').update({ is_active: !isActive }).eq('id', id);
    loadConsultationTemplates();
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!supabase || !confirm('\u3053\u306E\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F')) return;
    await supabase.from('consultation_templates').delete().eq('id', id);
    loadConsultationTemplates();
  };

  // Task template CRUD
  const handleAddTaskTemplate = async () => {
    if (!supabase || !newTaskTemplate.title) return;
    const catTemplates = taskTemplates.filter((t) => t.category === activeTaskCategory);
    const maxOrder = catTemplates.reduce((max, t) => Math.max(max, t.sort_order || 0), 0);
    const { error } = await supabase.from('task_templates').insert({
      office_id: OFFICE_ID,
      template_id: newTaskTemplate.templateId || `CUSTOM-${Date.now()}`,
      category: activeTaskCategory,
      title: newTaskTemplate.title,
      description: newTaskTemplate.description,
      send_day_offset: newTaskTemplate.sendDay ? Number(newTaskTemplate.sendDay) : null,
      due_day_offset: newTaskTemplate.dueDay ? Number(newTaskTemplate.dueDay) : null,
      office_todo: newTaskTemplate.officeTodo || null,
      sort_order: maxOrder + 1,
    });
    if (!error) {
      setNewTaskTemplate({ templateId: '', title: '', description: '', sendDay: '', dueDay: '', officeTodo: '' });
      setShowAddTaskTemplate(false);
      loadTaskTemplates();
    }
  };

  const handleUpdateTaskTemplate = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('task_templates').update({
      title: editTaskTemplate.title,
      description: editTaskTemplate.description,
      office_todo: editTaskTemplate.officeTodo,
    }).eq('id', id);
    if (!error) {
      setEditingTaskTemplate(null);
      loadTaskTemplates();
    }
  };

  const handleDeleteTaskTemplate = async (id: string) => {
    if (!supabase || !confirm('\u3053\u306E\u696D\u52D9\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F')) return;
    await supabase.from('task_templates').delete().eq('id', id);
    loadTaskTemplates();
  };

  // Grouped consultation templates
  const groupedConsultation = useMemo(() => {
    const groups: Record<string, ConsultationTemplate[]> = {};
    consultationTemplates.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [consultationTemplates]);

  // Filtered task templates
  const filteredTaskTemplates = useMemo(() => {
    return taskTemplates.filter((t) => t.category === activeTaskCategory);
  }, [taskTemplates, activeTaskCategory]);

  // Get unique task categories from data
  const taskCategories = useMemo(() => {
    const cats = [...new Set(taskTemplates.map((t) => t.category))];
    return cats.length > 0 ? cats : Object.keys(taskCategoryLabels);
  }, [taskTemplates]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{'\u7BA1\u7406'}</h1>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full ${dataSource === 'supabase' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {dataSource === 'supabase' ? 'Supabase' : '\u30C7\u30E2'}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-[#ea580c] border-b-2 border-[#ea580c]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========= INTEGRATIONS TAB ========= */}
      {activeTab === 'integrations' && (
        <div className="space-y-8">
          {categories.map((cat) => {
            const catIntegrations = integrations.filter((i) => i.category === cat);
            return (
              <div key={cat}>
                <h3 className="text-sm font-bold text-slate-700 mb-3">{cat}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {catIntegrations.map((integ) => (
                    <div key={integ.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{integ.name.slice(0, 2)}</div>
                          <h4 className="text-sm font-bold text-slate-700">{integ.name}</h4>
                        </div>
                        {integ.connected ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-slate-300 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{integ.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        {integ.connected ? (
                          <>
                            <span className="text-emerald-600 font-medium">{'\u63A5\u7D9A\u6E08'}</span>
                            <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{integ.lastSync}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400">{'\u672A\u63A5\u7D9A'}</span>
                            <button className="text-[#ea580c] hover:underline">{'\u63A5\u7D9A'}</button>
                          </>
                        )}
                      </div>
                      {integ.connected && integ.connectedClients > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-50 text-xs text-slate-400">{integ.connectedClients}{'\u793E\u306E\u9867\u554F\u5148\u3067\u5229\u7528\u4E2D'}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========= STAFF TAB ========= */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['\u540D\u524D', '\u30E1\u30FC\u30EB', '\u5F79\u5272', '\u30B9\u30C6\u30FC\u30BF\u30B9', '\u62C5\u5F53\u6570', '\u5E73\u5747\u7A3C\u50CDH', '\u751F\u7523\u6027'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffData.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{s.name.slice(0, 1)}</div>
                      {s.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{s.email}</td>
                  <td className="py-3 px-4"><span className={`text-[10px] font-medium px-2 py-0.5 rounded ${roleColors[s.role] || 'bg-slate-100 text-slate-600'}`}>{s.role}</span></td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.status === 'active' ? '\u30A2\u30AF\u30C6\u30A3\u30D6' : '\u975E\u30A2\u30AF\u30C6\u30A3\u30D6'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{s.clientCount}{'\u793E'}</td>
                  <td className="py-3 px-4 text-slate-700">{s.averageHours}h</td>
                  <td className="py-3 px-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${productivityColors[s.productivity]}`}>{s.productivity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========= CONSULTATION TEMPLATES TAB ========= */}
      {activeTab === 'consultation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{'\u521D\u56DE\u9762\u8AC7\u6642\u306E\u30C1\u30A7\u30C3\u30AF\u9805\u76EE\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u7BA1\u7406\u3057\u307E\u3059'}</p>
            <button
              onClick={() => setShowAddConsultation(true)}
              className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {'\u8FFD\u52A0'}
            </button>
          </div>

          {consultationLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            Object.entries(groupedConsultation).map(([category, templates]) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                  <h3 className="text-sm font-bold text-slate-700">
                    {consultationCategoryLabels[category] || category}
                    <span className="ml-2 text-xs font-normal text-slate-400">({templates.length}{'\u4EF6'})</span>
                  </h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {templates.map((tmpl) => (
                    <div key={tmpl.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50">
                      {editingConsultation === tmpl.id ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editConsultation.title}
                            onChange={(e) => setEditConsultation({ ...editConsultation, title: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                          />
                          <textarea
                            value={editConsultation.description}
                            onChange={(e) => setEditConsultation({ ...editConsultation, description: e.target.value })}
                            rows={2}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateConsultation(tmpl.id)} className="text-xs bg-[#ea580c] text-white px-3 py-1.5 rounded-lg hover:bg-[#c2410c]">{'\u4FDD\u5B58'}</button>
                            <button onClick={() => setEditingConsultation(null)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">{'\u30AD\u30E3\u30F3\u30BB\u30EB'}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${tmpl.is_active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{tmpl.title}</p>
                              {!tmpl.is_active && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">{'\u7121\u52B9'}</span>}
                            </div>
                            {tmpl.description && <p className="text-xs text-slate-400 mt-0.5">{tmpl.description}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleToggleConsultation(tmpl.id, tmpl.is_active)}
                              className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${tmpl.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${tmpl.is_active ? 'left-[18px]' : 'left-[3px]'}`} />
                            </button>
                            <button
                              onClick={() => { setEditingConsultation(tmpl.id); setEditConsultation({ title: tmpl.title, description: tmpl.description || '' }); }}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConsultation(tmpl.id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Add consultation template inline */}
          {showAddConsultation && (
            <div className="bg-white rounded-xl shadow-sm border border-[#ea580c]/30 p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-700">{'\u65B0\u898F\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u8FFD\u52A0'}</h4>
              <div className="grid grid-cols-[160px_1fr] gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{'\u30AB\u30C6\u30B4\u30EA'}</label>
                  <select
                    value={newConsultation.category}
                    onChange={(e) => setNewConsultation({ ...newConsultation, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  >
                    {Object.entries(consultationCategoryLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{'\u30BF\u30A4\u30C8\u30EB'}</label>
                  <input
                    type="text"
                    value={newConsultation.title}
                    onChange={(e) => setNewConsultation({ ...newConsultation, title: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                    placeholder={'\u30C1\u30A7\u30C3\u30AF\u9805\u76EE\u540D'}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u8AAC\u660E'}</label>
                <textarea
                  value={newConsultation.description}
                  onChange={(e) => setNewConsultation({ ...newConsultation, description: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  placeholder={'\u8AAC\u660E\u6587\uFF08\u4EFB\u610F\uFF09'}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddConsultation(false)} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">{'\u30AD\u30E3\u30F3\u30BB\u30EB'}</button>
                <button onClick={handleAddConsultation} disabled={!newConsultation.title} className="bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">{'\u8FFD\u52A0'}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========= TASK TEMPLATES TAB ========= */}
      {activeTab === 'task_templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{'\u696D\u52D9\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u7BA1\u7406\u3057\u307E\u3059\uFF08\u5168'}{taskTemplates.length}{'\u4EF6\uFF09'}</p>
            <button
              onClick={() => setShowAddTaskTemplate(true)}
              className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {'\u8FFD\u52A0'}
            </button>
          </div>

          {/* Category sub-tabs */}
          <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
            {taskCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTaskCategory(cat)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTaskCategory === cat
                    ? 'text-[#ea580c] border-b-2 border-[#ea580c]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {taskCategoryLabels[cat] || cat}
                <span className="ml-1 text-slate-400">({taskTemplates.filter((t) => t.category === cat).length})</span>
              </button>
            ))}
          </div>

          {taskTemplatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['\u696D\u52D9ID', '\u30BF\u30A4\u30C8\u30EB', '\u9001\u4ED8\u65E5', '\u671F\u9650', 'ToDo', '\u64CD\u4F5C'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTaskTemplates.map((tmpl) => (
                    <tr key={tmpl.id} className="border-b border-slate-50 hover:bg-slate-50">
                      {editingTaskTemplate === tmpl.id ? (
                        <>
                          <td className="py-3 px-4 text-xs text-slate-400">{tmpl.template_id}</td>
                          <td className="py-3 px-4">
                            <input type="text" value={editTaskTemplate.title} onChange={(e) => setEditTaskTemplate({ ...editTaskTemplate, title: e.target.value })} className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400">{tmpl.send_day_offset || '-'}</td>
                          <td className="py-3 px-4 text-xs text-slate-400">{tmpl.due_day_offset || '-'}</td>
                          <td className="py-3 px-4">
                            <input type="text" value={editTaskTemplate.officeTodo} onChange={(e) => setEditTaskTemplate({ ...editTaskTemplate, officeTodo: e.target.value })} className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <button onClick={() => handleUpdateTaskTemplate(tmpl.id)} className="text-xs bg-[#ea580c] text-white px-2 py-1 rounded hover:bg-[#c2410c]">{'\u4FDD\u5B58'}</button>
                              <button onClick={() => setEditingTaskTemplate(null)} className="text-xs text-slate-400 px-2 py-1 rounded hover:bg-slate-100">{'\u00D7'}</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-xs text-slate-400 font-mono">{tmpl.template_id}</td>
                          <td className="py-3 px-4 text-slate-700">{tmpl.title}</td>
                          <td className="py-3 px-4 text-xs text-slate-500">{tmpl.send_day_offset ? `${tmpl.send_day_offset}\u65E5` : '-'}</td>
                          <td className="py-3 px-4 text-xs text-slate-500">{tmpl.due_day_offset ? `${tmpl.due_day_offset}\u65E5` : '-'}</td>
                          <td className="py-3 px-4 text-xs text-slate-500 max-w-[200px] truncate">{tmpl.office_todo || '-'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setEditingTaskTemplate(tmpl.id); setEditTaskTemplate({ title: tmpl.title, description: tmpl.description || '', officeTodo: tmpl.office_todo || '' }); }}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTaskTemplate(tmpl.id)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add task template inline */}
          {showAddTaskTemplate && (
            <div className="bg-white rounded-xl shadow-sm border border-[#ea580c]/30 p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-700">{'\u65B0\u898F\u696D\u52D9\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u8FFD\u52A0'} ({taskCategoryLabels[activeTaskCategory] || activeTaskCategory})</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{'\u696D\u52D9ID'}</label>
                  <input type="text" value={newTaskTemplate.templateId} onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, templateId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" placeholder="INIT-NEW-999" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{'\u30BF\u30A4\u30C8\u30EB'}</label>
                  <input type="text" value={newTaskTemplate.title} onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, title: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" placeholder={'\u696D\u52D9\u540D'} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u8AAC\u660E'}</label>
                <textarea value={newTaskTemplate.description} onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, description: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{'\u9001\u4ED8\u65E5\uFF08\u65E5\u6570\uFF09'}</label>
                  <input type="number" value={newTaskTemplate.sendDay} onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, sendDay: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{'\u671F\u9650\uFF08\u65E5\u6570\uFF09'}</label>
                  <input type="number" value={newTaskTemplate.dueDay} onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, dueDay: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">ToDo</label>
                  <input type="text" value={newTaskTemplate.officeTodo} onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, officeTodo: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddTaskTemplate(false)} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">{'\u30AD\u30E3\u30F3\u30BB\u30EB'}</button>
                <button onClick={handleAddTaskTemplate} disabled={!newTaskTemplate.title} className="bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">{'\u8FFD\u52A0'}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========= SETTINGS TAB ========= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">{'\u4E8B\u52D9\u6240\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u4E8B\u52D9\u6240\u540D'}</label>
                <input type="text" defaultValue={officeData?.name || '\u30B5\u30F3\u30D7\u30EB\u4F1A\u8A08\u4E8B\u52D9\u6240'} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u4EE3\u8868\u8005'}</label>
                <input type="text" defaultValue={officeData?.representative || '\u5C71\u7530\u592A\u90CE'} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u96FB\u8A71\u756A\u53F7'}</label>
                <input type="text" defaultValue={officeData?.phone || '048-xxx-xxxx'} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u30E1\u30FC\u30EB'}</label>
                <input type="text" defaultValue={officeData?.email || 'info@sample-tax.co.jp'} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">{'\u901A\u77E5\u8A2D\u5B9A'}</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: '\u30BF\u30B9\u30AF\u671F\u9650\u901A\u77E5', desc: '\u671F\u9650\u306E3\u65E5\u524D\u306B\u30EA\u30DE\u30A4\u30F3\u30C9', enabled: true },
                { label: '\u672A\u5165\u91D1\u30A2\u30E9\u30FC\u30C8', desc: '\u652F\u6255\u671F\u9650\u8D85\u904E\u6642\u306B\u901A\u77E5', enabled: true },
                { label: '\u65B0\u898F\u554F\u3044\u5408\u308F\u305B', desc: 'HP\u304B\u3089\u306E\u65B0\u898F\u554F\u3044\u5408\u308F\u305B\u6642', enabled: true },
                { label: '\u6708\u6B21\u5B8C\u4E86\u5831\u544A', desc: '\u6708\u6B21\u51E6\u7406\u5B8C\u4E86\u6642\u306B\u9867\u554F\u5148\u3078\u81EA\u52D5\u901A\u77E5', enabled: false },
                { label: 'OCR\u78BA\u8A8D\u901A\u77E5', desc: '\u78BA\u4FE1\u5EA680%\u672A\u6E80\u306E\u4ED5\u8A33\u901A\u77E5', enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer ${item.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${item.enabled ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">{'\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3'}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-700">{'\u4E8C\u8981\u7D20\u8A8D\u8A3C'}</p>
                  <p className="text-xs text-slate-400">{'\u30ED\u30B0\u30A4\u30F3\u6642\u306B\u8A8D\u8A3C\u30A2\u30D7\u30EA\u3092\u4F7F\u7528'}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{'\u6709\u52B9'}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-700">{'IP\u30A2\u30C9\u30EC\u30B9\u5236\u9650'}</p>
                  <p className="text-xs text-slate-400">{'\u7279\u5B9A\u306EIP\u30A2\u30C9\u30EC\u30B9\u304B\u3089\u306E\u307F\u30A2\u30AF\u30BB\u30B9\u8A31\u53EF'}</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{'\u7121\u52B9'}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-700">{'\u76E3\u67FB\u30ED\u30B0'}</p>
                  <p className="text-xs text-slate-400">{'\u5168\u64CD\u4F5C\u306E\u76E3\u67FB\u30ED\u30B0\u3092\u8A18\u9332'}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{'\u6709\u52B9'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
