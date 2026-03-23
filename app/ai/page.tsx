"use client";

import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { staff } from "@/data/staff";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

const salesData = [
  { month: "10月", "サクラテック": 1200, "ヤマダHD": 2800, "アオゾラ": 1800 },
  { month: "11月", "サクラテック": 1350, "ヤマダHD": 2600, "アオゾラ": 1900 },
  { month: "12月", "サクラテック": 1400, "ヤマダHD": 3100, "アオゾラ": 2100 },
  { month: "1月", "サクラテック": 1250, "ヤマダHD": 2700, "アオゾラ": 1750 },
  { month: "2月", "サクラテック": 1380, "ヤマダHD": 2900, "アオゾラ": 2000 },
  { month: "3月", "サクラテック": 1500, "ヤマダHD": 3200, "アオゾラ": 2200 },
];

const rankData = [
  { name: "Aランク", value: 5, color: "#ea580c" },
  { name: "Bランク", value: 4, color: "#3b82f6" },
  { name: "Cランク", value: 3, color: "#9ca3af" },
];

const contractSummary = [
  { type: "月次顧問", count: 11, total: "¥553,000/月" },
  { type: "決算申告", count: 12, total: "¥2,400,000/年" },
  { type: "年末調整", count: 8, total: "¥640,000/年" },
  { type: "記帳代行", count: 5, total: "¥250,000/月" },
];

const recommendations = [
  { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", title: "アップセル候補", message: "株式会社コスモスは月次データの増加傾向から、記帳代行オプションの追加提案が有効です。" },
  { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", title: "解約リスク", message: "有限会社太陽は3ヶ月間コミュニケーションがありません。フォローアップを推奨します。" },
  { icon: Lightbulb, color: "text-blue-600", bg: "bg-blue-50", title: "効率化提案", message: "freee利用の5社に対してAPI連携の一括設定を行うことで月4時間の工数削減が見込めます。" },
];

export default function AiPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">AI分析</h2>

      <div className="grid grid-cols-3 gap-5 mb-8">
        {/* Sales Line Chart */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">売上推移（3社比較）</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `${v}万`} />
              <Tooltip formatter={(value) => [`${value}万円`, ""]} />
              <Legend />
              <Line type="monotone" dataKey="サクラテック" stroke="#ea580c" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="ヤマダHD" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="アオゾラ" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rank Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">顧問先ランク分布</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={rankData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {rankData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {rankData.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span>{r.name}: {r.value}社</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        {/* Staff Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">担当者別工数分析</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
                <th className="px-4 py-3 font-medium">担当者</th>
                <th className="px-4 py-3 font-medium">顧問先数</th>
                <th className="px-4 py-3 font-medium">平均工数/月</th>
                <th className="px-4 py-3 font-medium">生産性</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-sm">{s.clientCount}社</td>
                  <td className="px-4 py-3 text-sm">{s.averageHours}h</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.productivity === "A" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {s.productivity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contract Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">契約金額サマリー</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
                <th className="px-4 py-3 font-medium">案件種別</th>
                <th className="px-4 py-3 font-medium">件数</th>
                <th className="px-4 py-3 font-medium">合計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contractSummary.map((c) => (
                <tr key={c.type} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{c.type}</td>
                  <td className="px-4 py-3 text-sm">{c.count}件</td>
                  <td className="px-4 py-3 text-sm font-medium">{c.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">AIレコメンデーション</h3>
        <div className="grid grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className={`rounded-lg p-4 ${rec.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <rec.icon size={16} className={rec.color} />
                <span className={`text-sm font-semibold ${rec.color}`}>{rec.title}</span>
              </div>
              <p className="text-sm">{rec.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
