'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  Filter,
  Plus,
  Calendar,
  User,
  ChevronRight,
  Loader2,
  X,
  Trash2,
} from 'lucide-react';
import { tasks as demoTasks, type Task } from '@/data/tasks';
import { clients as demoClients } from '@/data/clients';
import {
  fetchTasks,
  fetchClients,
  fetchStaff,
  updateTaskStatus,
  insertTask,
  deleteTask,
  generateTasksFromTemplates,
  reverseCategoryMap,
} from '@/lib/supabase-helpers';
import type { Client } from '@/data/clients';

type ViewMode = 'kanban' | 'list';

const statusColumns: { key: Task['status']; label: string; color: string; dotColor: string }[] = [
  { key: '\u672A\u7740\u624B', label: '\u672A\u7740\u624B', color: 'bg-slate-50', dotColor: 'bg-slate-400' },
  { key: '\u9032\u884C\u4E2D', label: '\u9032\u884C\u4E2D', color: 'bg-blue-50', dotColor: 'bg-blue-500' },
  { key: '\u78BA\u8A8D\u5F85\u3061', label: '\u78BA\u8A8D\u5F85\u3061', color: 'bg-amber-50', dotColor: 'bg-amber-500' },
  { key: '\u5B8C\u4E86', label: '\u5B8C\u4E86', color: 'bg-emerald-50', dotColor: 'bg-emerald-500' },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};
const priorityLabels: Record<string, string> = {
  high: '\u9AD8',
  medium: '\u4E2D',
  low: '\u4F4E',
};
const priorityBorderColors: Record<string, string> = {
  high: 'border-l-red-400',
  medium: 'border-l-amber-400',
  low: 'border-l-slate-300',
};

const categoryOptions = ['\u6708\u6B21\u51E6\u7406', '\u6C7A\u7B97', '\u6CD5\u4EBA\u7A0E\u7533\u544A', '\u6D88\u8CBB\u7A0E\u7533\u544A', '\u5E74\u672B\u8ABF\u6574', '\u7D66\u4E0E\u8A08\u7B97'];

const initialNewTask = {
  title: '',
  clientId: '',
  assignedTo: '',
  dueDate: '',
  priority: 'medium',
  category: '\u6708\u6B21\u51E6\u7406',
  description: '',
};

export default function TasksPage() {
  const [tasksData, setTasksData] = useState<Task[]>(demoTasks);
  const [clientsData, setClientsData] = useState<Client[]>(demoClients);
  const [staffData, setStaffData] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'demo' | 'supabase'>('demo');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterClient, setFilterClient] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTask, setNewTask] = useState(initialNewTask);
  const [saving, setSaving] = useState(false);

  // Template generation state
  const [templateClientId, setTemplateClientId] = useState('');
  const [templateCategory, setTemplateCategory] = useState('monthly');
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [dbTasks, dbClients, dbStaff] = await Promise.all([
          fetchTasks(),
          fetchClients(),
          fetchStaff(),
        ]);
        if (dbTasks.length > 0) {
          setTasksData(dbTasks);
          setDataSource('supabase');
        }
        if (dbClients.length > 0) {
          setClientsData(dbClients);
        }
        if (dbStaff.length > 0) {
          setStaffData(dbStaff);
        }
      } catch (err) {
        console.error('Supabase fetch failed, using demo data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const staffList = [...new Set(tasksData.map((t) => t.assignedStaff))];
  const categoryList = [...new Set(tasksData.map((t) => t.category))];
  const clientList = [...new Set(tasksData.map((t) => t.clientName))];

  const filtered = useMemo(() => {
    return tasksData.filter((t) => {
      if (filterStaff && t.assignedStaff !== filterStaff) return false;
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterClient && t.clientName !== filterClient) return false;
      return true;
    });
  }, [tasksData, filterStaff, filterCategory, filterClient]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    // Optimistic update
    setTasksData((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    if (dataSource === 'supabase') {
      const success = await updateTaskStatus(taskId, newStatus);
      if (!success) {
        // Rollback
        const dbTasks = await fetchTasks();
        if (dbTasks.length > 0) setTasksData(dbTasks);
        alert('\u30B9\u30C6\u30FC\u30BF\u30B9\u306E\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F');
      }
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.clientId) return;
    setSaving(true);
    try {
      if (dataSource === 'supabase') {
        const success = await insertTask({
          title: newTask.title,
          clientId: newTask.clientId,
          assignedTo: newTask.assignedTo || null,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
          category: newTask.category,
          description: newTask.description,
        });
        if (success) {
          const dbTasks = await fetchTasks();
          if (dbTasks.length > 0) setTasksData(dbTasks);
        } else {
          alert('\u30BF\u30B9\u30AF\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F');
        }
      } else {
        const client = clientsData.find((c) => c.id === newTask.clientId);
        const localTask: Task = {
          id: String(tasksData.length + 1),
          title: newTask.title,
          clientId: newTask.clientId,
          clientName: client?.name || '',
          category: newTask.category as Task['category'],
          status: '\u672A\u7740\u624B',
          priority: newTask.priority as Task['priority'],
          assignedStaff: '\u5C71\u7530\u592A\u90CE',
          dueDate: newTask.dueDate,
          description: newTask.description,
        };
        setTasksData((prev) => [...prev, localTask]);
      }
      setShowAddModal(false);
      setNewTask(initialNewTask);
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`\u300C${taskTitle}\u300D\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\u3053\u306E\u64CD\u4F5C\u306F\u53D6\u308A\u6D88\u305B\u307E\u305B\u3093\u3002`)) return;

    // Optimistic
    setTasksData((prev) => prev.filter((t) => t.id !== taskId));

    if (dataSource === 'supabase') {
      const success = await deleteTask(taskId);
      if (!success) {
        const dbTasks = await fetchTasks();
        if (dbTasks.length > 0) setTasksData(dbTasks);
        alert('\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F');
      }
    }
  };

  const handleGenerateFromTemplate = async () => {
    if (!templateClientId || !templateCategory) return;
    setGenerating(true);
    setGeneratedCount(null);
    try {
      const client = clientsData.find((c) => c.id === templateClientId);
      const count = await generateTasksFromTemplates(
        templateClientId,
        templateCategory,
        client?.settlementMonth || 3,
      );
      setGeneratedCount(count);
      if (count > 0) {
        const dbTasks = await fetchTasks();
        if (dbTasks.length > 0) setTasksData(dbTasks);
      }
    } catch (err) {
      console.error('Failed to generate tasks:', err);
      alert('\u30BF\u30B9\u30AF\u306E\u81EA\u52D5\u751F\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{'\u696D\u52D9\u30DC\u30FC\u30C9'}</h1>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <span className={`text-xs px-2 py-0.5 rounded-full ${dataSource === 'supabase' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {dataSource === 'supabase' ? 'Supabase' : '\u30C7\u30E2'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            {'\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304B\u3089\u81EA\u52D5\u751F\u6210'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {'\u65B0\u898F\u30BF\u30B9\u30AF'}
          </button>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
              viewMode === 'kanban' ? 'bg-[#ea580c] text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            {'\u30AB\u30F3\u30D0\u30F3'}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
              viewMode === 'list' ? 'bg-[#ea580c] text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            {'\u30EA\u30B9\u30C8'}
          </button>
        </div>
        <select
          value={filterStaff}
          onChange={(e) => setFilterStaff(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
        >
          <option value="">{'\u62C5\u5F53\u8005'}</option>
          {staffList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
        >
          <option value="">{'\u30BF\u30B9\u30AF\u7A2E\u5225'}</option>
          {categoryList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
        >
          <option value="">{'\u9867\u554F\u5148'}</option>
          {clientList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="min-h-[400px]">
                <div className={`rounded-lg ${col.color} p-3`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="text-xs font-bold text-slate-600">{col.label}</h3>
                    <span className="text-xs text-slate-400 ml-auto">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-white rounded-lg p-3.5 shadow-sm border border-slate-100 border-l-4 ${priorityBorderColors[task.priority]} hover:shadow-md transition-shadow group`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs text-slate-400">{task.clientName}</p>
                          <div className="flex items-center gap-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                              {priorityLabels[task.priority]}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id, task.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5 transition-opacity"
                              title={'\u524A\u9664'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-2">{task.title}</p>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px] text-slate-400">{task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                              {task.assignedStaff.slice(0, 1)}
                            </div>
                          </div>
                        </div>
                        {/* Status change dropdown */}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-[10px] bg-slate-50 border border-slate-200 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ea580c]/30"
                        >
                          {statusColumns.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['\u512A\u5148\u5EA6', '\u30BF\u30B9\u30AF', '\u9867\u554F\u5148', '\u30AB\u30C6\u30B4\u30EA', '\u62C5\u5F53', '\u671F\u9650', '\u30B9\u30C6\u30FC\u30BF\u30B9', '\u64CD\u4F5C'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{task.title}</td>
                  <td className="py-3 px-4 text-slate-500">{task.clientName}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{task.category}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{task.assignedStaff}</td>
                  <td className="py-3 px-4 text-slate-500">{task.dueDate}</td>
                  <td className="py-3 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border-0 cursor-pointer ${
                        task.status === '\u5B8C\u4E86'
                          ? 'bg-emerald-100 text-emerald-700'
                          : task.status === '\u9032\u884C\u4E2D'
                          ? 'bg-blue-100 text-blue-700'
                          : task.status === '\u78BA\u8A8D\u5F85\u3061'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {statusColumns.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title={'\u524A\u9664'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========= ADD TASK MODAL ========= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{'\u65B0\u898F\u30BF\u30B9\u30AF\u4F5C\u6210'}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">{'\u30BF\u30A4\u30C8\u30EB'} *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  placeholder={'\u4F8B: 3\u6708\u5EA6\u6708\u6B21\u51E6\u7406'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u9867\u554F\u5148'} *</label>
                  <select
                    value={newTask.clientId}
                    onChange={(e) => setNewTask({ ...newTask, clientId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  >
                    <option value="">{'\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044'}</option>
                    {clientsData.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u62C5\u5F53\u8005'}</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  >
                    <option value="">{'\u672A\u5272\u5F53'}</option>
                    {staffData.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u671F\u9650'}</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u512A\u5148\u5EA6'}</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  >
                    <option value="high">{'\u9AD8'}</option>
                    <option value="medium">{'\u4E2D'}</option>
                    <option value="low">{'\u4F4E'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">{'\u30AB\u30C6\u30B4\u30EA'}</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">{'\u8AAC\u660E'}</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30 resize-none"
                  placeholder={'\u30BF\u30B9\u30AF\u306E\u8AAC\u660E...'}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">{'\u30AD\u30E3\u30F3\u30BB\u30EB'}</button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title || !newTask.clientId || saving}
                className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? '\u4F5C\u6210\u4E2D...' : '\u4F5C\u6210'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========= TEMPLATE GENERATION MODAL ========= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setShowTemplateModal(false); setGeneratedCount(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[480px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{'\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304B\u3089\u81EA\u52D5\u751F\u6210'}</h2>
              <button onClick={() => { setShowTemplateModal(false); setGeneratedCount(null); }} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">{'\u9867\u554F\u5148'} *</label>
                <select
                  value={templateClientId}
                  onChange={(e) => setTemplateClientId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                >
                  <option value="">{'\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044'}</option>
                  {clientsData.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({'\u6C7A\u7B97'}{c.settlementMonth}{'\u6708'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">{'\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u30AB\u30C6\u30B4\u30EA'}</label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30"
                >
                  <option value="monthly">{'\u6708\u6B21\u51E6\u7406'}</option>
                  <option value="annual">{'\u5E74\u6B21\u51E6\u7406'}</option>
                  <option value="initial">{'\u521D\u56DE\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7'}</option>
                </select>
              </div>
              {generatedCount !== null && (
                <div className={`p-3 rounded-lg text-sm ${generatedCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {generatedCount > 0
                    ? `${generatedCount}\u4EF6\u306E\u30BF\u30B9\u30AF\u3092\u81EA\u52D5\u751F\u6210\u3057\u307E\u3057\u305F`
                    : '\u8A72\u5F53\u3059\u308B\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F'}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => { setShowTemplateModal(false); setGeneratedCount(null); }} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">{'\u9589\u3058\u308B'}</button>
              <button
                onClick={handleGenerateFromTemplate}
                disabled={!templateClientId || generating}
                className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {generating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {generating ? '\u751F\u6210\u4E2D...' : '\u81EA\u52D5\u751F\u6210'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
