"use client";

import React, { useState, useMemo } from "react";
import { tasks, Task } from "@/data/tasks";
import { LayoutGrid, List, Plus, X, Calendar, User, Flag } from "lucide-react";

const statusColumns = ["未着手", "進行中", "確認待ち", "完了"] as const;

const priorityColor: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

const priorityBadge: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const priorityLabel: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const statusColor: Record<string, string> = {
  "未着手": "bg-gray-100 text-gray-700",
  "進行中": "bg-blue-100 text-blue-700",
  "確認待ち": "bg-yellow-100 text-yellow-700",
  "完了": "bg-green-100 text-green-700",
};

export default function TasksPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const s of statusColumns) map[s] = [];
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">タスク管理</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 ${view === "kanban" ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <LayoutGrid size={14} />
              カンバン
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 ${view === "list" ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <List size={14} />
              リスト
            </button>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-orange-700 text-sm"
          >
            <Plus size={16} />
            テンプレートから自動生成
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-4 gap-4">
          {statusColumns.map((status) => (
            <div key={status} className="bg-gray-50 rounded-xl p-3 min-h-[500px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold text-[#64748b]">{status}</h3>
                <span className="bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium">
                  {grouped[status].length}
                </span>
              </div>
              <div className="space-y-2">
                {grouped[status].map((t) => (
                  <div
                    key={t.id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 border-l-4 ${priorityColor[t.priority]}`}
                  >
                    <p className="text-xs text-[#64748b] mb-1">{t.clientName}</p>
                    <p className="text-sm font-medium mb-2">{t.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-[#64748b]">
                        <Calendar size={12} />
                        <span>{t.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${priorityBadge[t.priority]}`}>
                          {priorityLabel[t.priority]}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600">
                          {t.assignedStaff.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
                <th className="px-4 py-3 font-medium">タスク名</th>
                <th className="px-4 py-3 font-medium">顧問先</th>
                <th className="px-4 py-3 font-medium">カテゴリ</th>
                <th className="px-4 py-3 font-medium">ステータス</th>
                <th className="px-4 py-3 font-medium">優先度</th>
                <th className="px-4 py-3 font-medium">担当者</th>
                <th className="px-4 py-3 font-medium">期限</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-sm">{t.clientName}</td>
                  <td className="px-4 py-3 text-sm">{t.category}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadge[t.priority]}`}>{priorityLabel[t.priority]}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{t.assignedStaff}</td>
                  <td className="px-4 py-3 text-sm">{t.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowTemplateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-[480px]">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">テンプレートからタスク生成</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">テンプレート</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option>月次処理テンプレート</option>
                  <option>決算テンプレート</option>
                  <option>年末調整テンプレート</option>
                  <option>法人税申告テンプレート</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">対象顧問先</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option>全顧問先</option>
                  <option>3月決算法人のみ</option>
                  <option>選択した顧問先</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">対象月</label>
                <input type="month" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue="2026-04" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">キャンセル</button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">生成</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
