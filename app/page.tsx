'use client';

import React from 'react';
import {
  Users,
  TrendingUp,
  Receipt,
  Sparkles,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Clock,
  Lightbulb,
} from 'lucide-react';
import { tasks } from '@/data/tasks';
import { activities } from '@/data/activities';
import { clients } from '@/data/clients';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const kpis = [
  {
    label: '\u9867\u554F\u5148\u6570',
    value: '48',
    sub: '\u6CD5\u4EBA 42 / \u500B\u4EBA 6',
    icon: Users,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    label: '\u6708\u6B21\u9032\u6357\u7387',
    value: '72%',
    sub: '35/48\u793E \u5B8C\u4E86',
    icon: TrendingUp,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    label: '\u4ECA\u6708\u8ACB\u6C42\u984D',
    value: '\u00A54.2M',
    sub: '\u5165\u91D1\u6E08 68%',
    icon: Receipt,
    color: 'bg-violet-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    label: '\u7D39\u4ECB\u53CE\u76CA',
    value: '\u00A5180K',
    sub: '\u524D\u6708\u6BD4 +23%',
    icon: Sparkles,
    color: 'bg-[#ea580c]',
    bgColor: 'bg-orange-50',
    textColor: 'text-[#ea580c]',
  },
];

const aiAlerts = [
  {
    type: 'warning',
    icon: AlertTriangle,
    title: '\u8CC7\u6599\u672A\u56DE\u53CE\u30A2\u30E9\u30FC\u30C8',
    description: '\u682A\u5F0F\u4F1A\u793E\u30D5\u30B8\u30BF\u5EFA\u8A2D\u306E3\u6708\u5206\u8CC7\u6599\u304C\u672A\u56DE\u53CE\u3067\u3059\u3002\u671F\u9650\u307E\u3067\u3042\u30685\u65E5\u3002',
    color: 'border-amber-400 bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    type: 'opportunity',
    icon: Lightbulb,
    title: '\u88DC\u52A9\u91D1\u30C1\u30E3\u30F3\u30B9',
    description: '\u682A\u5F0F\u4F1A\u793E\u30A2\u30AA\u30BE\u30E9\u304CIT\u5C0E\u5165\u88DC\u52A9\u91D1\u306E\u5BFE\u8C61\u3068\u306A\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002',
    color: 'border-[#ea580c] bg-[#fff7ed]',
    iconColor: 'text-[#ea580c]',
  },
  {
    type: 'insight',
    icon: TrendingUp,
    title: '\u9867\u554F\u6599\u9069\u6B63\u5316\u63D0\u6848',
    description: '\u682A\u5F0F\u4F1A\u793E\u30DE\u30EB\u30CF\u30B7\u5546\u4E8B\u306E\u696D\u52D9\u91CF\u304C\u5897\u52A0\u3002\u9867\u554F\u6599\u306E\u898B\u76F4\u3057\u3092\u63D0\u6848\u3057\u307E\u3059\u3002',
    color: 'border-[#ea580c] bg-[#fff7ed]',
    iconColor: 'text-[#ea580c]',
  },
];

const monthlyProgress = [
  { month: '10\u6708', completed: 40, inProgress: 5, notStarted: 3 },
  { month: '11\u6708', completed: 42, inProgress: 4, notStarted: 2 },
  { month: '12\u6708', completed: 38, inProgress: 6, notStarted: 4 },
  { month: '1\u6708', completed: 44, inProgress: 3, notStarted: 1 },
  { month: '2\u6708', completed: 41, inProgress: 5, notStarted: 2 },
  { month: '3\u6708', completed: 35, inProgress: 8, notStarted: 5 },
];

const revenueData = [
  { month: '10\u6708', front: 3800000, back: 120000 },
  { month: '11\u6708', front: 3900000, back: 180000 },
  { month: '12\u6708', front: 4100000, back: 250000 },
  { month: '1\u6708', front: 4000000, back: 310000 },
  { month: '2\u6708', front: 4200000, back: 420000 },
  { month: '3\u6708', front: 4200000, back: 180000 },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

const priorityLabels: Record<string, string> = {
  high: '\u9AD8',
  medium: '\u4E2D',
  low: '\u4F4E',
};

const typeIcons: Record<string, string> = {
  create: '\u2795',
  update: '\u270F\uFE0F',
  complete: '\u2705',
  upload: '\u{1F4C1}',
  send: '\u{1F4E8}',
};

export default function HomePage() {
  const todayTasks = tasks
    .filter((t) => t.status !== '\u5B8C\u4E86')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{'\u30DB\u30FC\u30E0'}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {'\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059\u3001\u5C71\u7530\u3055\u3093\u3002\u4ECA\u65E5\u306E\u696D\u52D9\u72B6\u6CC1\u3067\u3059\u3002'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2 Column */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        {/* Left: 60% */}
        <div className="col-span-3 space-y-6">
          {/* Today's Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700">{'\u4ECA\u65E5\u306E\u30BF\u30B9\u30AF'}</h2>
              </div>
              <span className="text-xs text-slate-400">{todayTasks.length}{'\u4EF6'}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityColors[task.priority]}`}
                  >
                    {priorityLabels[task.priority]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.clientName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500">{task.dueDate}</p>
                    <p className="text-[11px] text-slate-400">{task.assignedStaff}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ea580c]" />
              <h2 className="text-sm font-bold text-slate-700">{'AI\u30A2\u30E9\u30FC\u30C8'}</h2>
            </div>
            <div className="p-4 space-y-3">
              {aiAlerts.map((alert, idx) => {
                const Icon = alert.icon;
                return (
                  <div
                    key={idx}
                    className={`border-l-4 rounded-r-lg p-4 ${alert.color} cursor-pointer hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${alert.iconColor}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-700">{alert.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: 40% */}
        <div className="col-span-2 space-y-6">
          {/* Revenue Mini */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">{'\u4ECA\u6708\u306E\u53CE\u76CA'}</h2>
              <span className="text-xs text-slate-400">{'\u30D5\u30ED\u30F3\u30C8 + \u30D0\u30C3\u30AF\u30A8\u30F3\u30C9'}</span>
            </div>
            <div className="p-4" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    tickFormatter={(v) => `${(Number(v) / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value) => `\u00A5${Number(value).toLocaleString()}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="front" name={'\u30D5\u30ED\u30F3\u30C8\u53CE\u76CA'} fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="back" name={'\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u53CE\u76CA'} fill="#ea580c" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">{'\u6700\u8FD1\u306E\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3'}</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {activities.map((act) => (
                <div key={act.id} className="px-5 py-3 flex items-start gap-3">
                  <span className="text-base mt-0.5">{typeIcons[act.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{act.action}</p>
                    <p className="text-xs text-slate-400">
                      {act.target} - {act.user}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0 whitespace-nowrap">
                    {act.timestamp.split(' ')[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Progress Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700">{'\u6708\u6B21\u9032\u6357\u63A8\u79FB'}</h2>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              {'\u5B8C\u4E86'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              {'\u9032\u884C\u4E2D'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              {'\u672A\u7740\u624B'}
            </span>
          </div>
        </div>
        <div className="p-5" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyProgress} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="completed" name={'\u5B8C\u4E86'} stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="inProgress" name={'\u9032\u884C\u4E2D'} stackId="a" fill="#fbbf24" />
              <Bar dataKey="notStarted" name={'\u672A\u7740\u624B'} stackId="a" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
