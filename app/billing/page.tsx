"use client";

import React, { useMemo } from "react";
import { invoices } from "@/data/invoices";
import { Receipt, CheckCircle2, AlertTriangle, Clock, RefreshCw } from "lucide-react";

const statusBadge: Record<string, string> = {
  "下書き": "bg-gray-100 text-gray-600",
  "送付済": "bg-blue-100 text-blue-700",
  "入金済": "bg-green-100 text-green-700",
  "未入金": "bg-red-100 text-red-700",
};

export default function BillingPage() {
  const totals = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const paid = invoices.filter((i) => i.status === "入金済").reduce((s, i) => s + i.totalAmount, 0);
    const unpaid = invoices.filter((i) => i.status === "未入金").reduce((s, i) => s + i.totalAmount, 0);
    return { total, paid, unpaid };
  }, []);

  const kpis = [
    { label: "請求総額", value: `¥${totals.total.toLocaleString()}`, icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "入金済", value: `¥${totals.paid.toLocaleString()}`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "未入金", value: `¥${totals.unpaid.toLocaleString()}`, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">請求管理</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#64748b]">{kpi.label}</span>
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={20} className={kpi.color} />
              </div>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
              <th className="px-4 py-3 font-medium">請求番号</th>
              <th className="px-4 py-3 font-medium">顧問先</th>
              <th className="px-4 py-3 font-medium">金額（税込）</th>
              <th className="px-4 py-3 font-medium">発行日</th>
              <th className="px-4 py-3 font-medium">支払期限</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-sm font-medium">{inv.clientName}</td>
                <td className="px-4 py-3 text-sm font-medium">{inv.totalAmount.toLocaleString()}円</td>
                <td className="px-4 py-3 text-sm">{inv.issueDate}</td>
                <td className="px-4 py-3 text-sm">{inv.dueDate}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[inv.status]}`}>{inv.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-[#64748b] mb-4">会計ソフト連携ステータス</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                <RefreshCw size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">freee会計</p>
                <p className="text-xs text-[#64748b]">最終同期: 2026-03-24 09:30</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">同期済</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                <RefreshCw size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">マネーフォワード</p>
                <p className="text-xs text-[#64748b]">最終同期: 2026-03-24 09:15</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">同期済</span>
          </div>
        </div>
      </div>
    </div>
  );
}
