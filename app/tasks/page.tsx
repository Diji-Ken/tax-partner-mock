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
} from 'lucide-react';
import { tasks as demoTasks, type Task } from '@/data/tasks';
import { fetchTasks, updateTaskStatus } from '@/lib/supabase-helpers';

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

export default function TasksPage() {
  const [tasksData, setTasksData] = useState<Task[]>(demoTasks);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'demo' | 'supabase'>('demo');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterClient, setFilterClient] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const dbTasks = await fetchTasks();
        if (dbTasks.length > 0) {
          setTasksData(dbTasks);
          setDataSource('supabase');
        }
      } catch (err) {
        console.error('Supabase fetch failed, using demo data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
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
    if (dataSource === 'supabase') {
      const success = await updateTaskStatus(taskId, newStatus);
      if (success) {
        setTasksData((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } else {
      setTasksData((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
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
          <button className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            {'\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304B\u3089\u81EA\u52D5\u751F\u6210'}
          </button>
          <button className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
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
                        className={`bg-white rounded-lg p-3.5 shadow-sm border border-slate-100 border-l-4 ${priorityBorderColors[task.priority]} hover:shadow-md transition-shadow cursor-pointer`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs text-slate-400">{task.clientName}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                            {priorityLabels[task.priority]}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-2">{task.title}</p>
                        <div className="flex items-center justify-between">
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
                {['\u512A\u5148\u5EA6', '\u30BF\u30B9\u30AF', '\u9867\u554F\u5148', '\u30AB\u30C6\u30B4\u30EA', '\u62C5\u5F53', '\u671F\u9650', '\u30B9\u30C6\u30FC\u30BF\u30B9'].map((h) => (
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
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
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
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        task.status === '\u5B8C\u4E86'
                          ? 'bg-emerald-100 text-emerald-700'
                          : task.status === '\u9032\u884C\u4E2D'
                          ? 'bg-blue-100 text-blue-700'
                          : task.status === '\u78BA\u8A8D\u5F85\u3061'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
