"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, Receipt, CheckSquare, AlertTriangle, Lightbulb, ArrowUpRight, Clock, Send, Upload, PlusCircle, CheckCircle2 } from "lucide-react";
import { activities } from "@/data/activities";

const kpis = [
  { label: "顧問先数", value: "48", sub: "法人42 / 個人6", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "月次進捗率", value: "72%", sub: "3月度 完了35/48件", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  { label: "請求額", value: "¥4.2M", sub: "今月確定分", icon: Receipt, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "未完了タスク", value: "12", sub: "期限超過3件", icon: CheckSquare, color: "text-red-600", bg: "bg-red-50" },
];

const monthlyData = [
  { month: "10月", "完了": 42, "進行中": 4, "未着手": 2 },
  { month: "11月", "完了": 40, "進行中": 5, "未着手": 3 },
  { month: "12月", "完了": 44, "進行中": 3, "未着手": 1 },
  { month: "1月", "完了": 38, "進行中": 6, "未着手": 4 },
  { month: "2月", "完了": 41, "進行中": 5, "未着手": 2 },
  { month: "3月", "完了": 35, "進行中": 8, "未着手": 5 },
];

const deadlines = [
  { title: "3月度月次処理 - 株式会社サクラテック", date: "4/10", status: "進行中" },
  { title: "3月決算 - 株式会社ヤマダHD", date: "5/31", status: "未着手" },
  { title: "法人税申告 - 株式会社サクラテック", date: "5/31", status: "未着手" },
  { title: "消費税申告 - 株式会社フジタ建設", date: "8/31", status: "確認待ち" },
  { title: "法人税中間申告 - 株式会社アオゾラ", date: "4/30", status: "未着手" },
];

const aiInsights = [
  { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", message: "株式会社ヤマダHDの3月決算期限まで残り68日です。早期着手を推奨します。" },
  { icon: Lightbulb, color: "text-blue-600", bg: "bg-blue-50", message: "株式会社タナカ物産の月次処理パターンから、消耗品費の仕訳ルールを自動化できる可能性があります。" },
  { icon: ArrowUpRight, color: "text-green-600", bg: "bg-green-50", message: "合同会社ミライの顧問料は業界平均より15%低い水準です。契約更新時の見直しを提案します。" },
];

const statusColor: Record<string, string> = {
  "進行中": "bg-blue-100 text-blue-700",
  "未着手": "bg-gray-100 text-gray-700",
  "確認待ち": "bg-yellow-100 text-yellow-700",
  "完了": "bg-green-100 text-green-700",
};

const activityIcon: Record<string, React.ElementType> = {
  send: Send,
  complete: CheckCircle2,
  update: Clock,
  upload: Upload,
  create: PlusCircle,
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">ダッシュボード</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#64748b]">{kpi.label}</span>
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={20} className={kpi.color} />
              </div>
            </div>
            <p className="text-3xl font-bold">{kpi.value}</p>
            <p className="text-xs text-[#64748b] mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        {/* Monthly Chart */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">月次進捗</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="完了" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="進行中" stackId="a" fill="#3b82f6" />
              <Bar dataKey="未着手" stackId="a" fill="#d1d5db" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">今月の期限</h3>
          <div className="space-y-3">
            {deadlines.map((d, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="text-sm font-mono text-[#64748b] w-10 shrink-0">{d.date}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{d.title}</p>
                  <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[d.status]}`}>
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">AIインサイト</h3>
          <div className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${insight.bg}`}>
                <insight.icon size={18} className={`${insight.color} mt-0.5 shrink-0`} />
                <p className="text-sm">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">最近のアクティビティ</h3>
          <div className="space-y-3">
            {activities.map((a) => {
              const Icon = activityIcon[a.type] || Clock;
              return (
                <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-[#64748b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{a.user}</span>が{a.action}
                    </p>
                    <p className="text-xs text-[#64748b]">
                      {a.target} - {a.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
