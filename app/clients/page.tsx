"use client";

import React, { useState, useMemo, useCallback } from "react";
import { clients, Client } from "@/data/clients";
import { Search, Plus, X, Phone, Mail, Building2, Calendar } from "lucide-react";

const rankColor: Record<string, string> = {
  A: "bg-orange-100 text-orange-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-gray-100 text-gray-600",
};

const softwareLabel: Record<string, string> = {
  freee: "freee",
  MF: "MF",
  yayoi: "弥生",
  other: "その他",
};

const detailTabs = ["基本情報", "契約・案件", "連絡履歴", "ドキュメント", "請求履歴"] as const;

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStaff, setFilterStaff] = useState("");
  const [filterSoftware, setFilterSoftware] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [detailTab, setDetailTab] = useState<(typeof detailTabs)[number]>("基本情報");
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search && !c.name.includes(search) && !c.representative.includes(search)) return false;
      if (filterMonth && c.settlementMonth !== Number(filterMonth)) return false;
      if (filterStaff && c.assignedStaff !== filterStaff) return false;
      if (filterSoftware && c.accountingSoftware !== filterSoftware) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterMonth, filterStaff, filterSoftware, filterStatus]);

  const openDetail = useCallback((c: Client) => {
    setSelected(c);
    setDetailTab("基本情報");
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">顧客管理</h2>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-orange-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-orange-700 transition-colors"
        >
          <Plus size={16} />
          新規顧客
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-5 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="顧問先名・代表者名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">決算月</option>
          {[3, 6, 9, 12].map((m) => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>
        <select value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">担当者</option>
          <option value="山田太郎">山田太郎</option>
          <option value="佐藤花子">佐藤花子</option>
          <option value="鈴木一郎">鈴木一郎</option>
        </select>
        <select value={filterSoftware} onChange={(e) => setFilterSoftware(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">会計ソフト</option>
          <option value="freee">freee</option>
          <option value="MF">MF</option>
          <option value="yayoi">弥生</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">ステータス</option>
          <option value="active">有効</option>
          <option value="inactive">無効</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
              <th className="px-4 py-3 font-medium">ランク</th>
              <th className="px-4 py-3 font-medium">会社名</th>
              <th className="px-4 py-3 font-medium">代表者</th>
              <th className="px-4 py-3 font-medium">決算月</th>
              <th className="px-4 py-3 font-medium">会計ソフト</th>
              <th className="px-4 py-3 font-medium">月額顧問料</th>
              <th className="px-4 py-3 font-medium">担当者</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => openDetail(c)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${rankColor[c.rank]}`}>{c.rank}</span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                <td className="px-4 py-3 text-sm">{c.representative}</td>
                <td className="px-4 py-3 text-sm">{c.settlementMonth}月</td>
                <td className="px-4 py-3 text-sm">{softwareLabel[c.accountingSoftware]}</td>
                <td className="px-4 py-3 text-sm">{c.monthlyFee.toLocaleString()}円</td>
                <td className="px-4 py-3 text-sm">{c.assignedStaff}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {c.status === "active" ? "有効" : "無効"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelected(null)} />
          <div className="relative w-[520px] bg-white shadow-xl overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="border-b border-gray-200 px-6 flex gap-1">
              {detailTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    detailTab === tab ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {detailTab === "基本情報" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${rankColor[selected.rank]}`}>ランク {selected.rank}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${selected.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {selected.status === "active" ? "有効" : "無効"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">代表者</p>
                      <p className="text-sm font-medium">{selected.representative}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">業種</p>
                      <p className="text-sm font-medium">{selected.industry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">決算月</p>
                      <p className="text-sm font-medium">{selected.settlementMonth}月</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">会計ソフト</p>
                      <p className="text-sm font-medium">{softwareLabel[selected.accountingSoftware]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">月額顧問料</p>
                      <p className="text-sm font-medium">{selected.monthlyFee.toLocaleString()}円</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">担当者</p>
                      <p className="text-sm font-medium">{selected.assignedStaff}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-[#64748b]" />
                      <span>{selected.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-[#64748b]" />
                      <span>{selected.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 size={14} className="text-[#64748b]" />
                      <span>{selected.type === "corporate" ? "法人" : "個人"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-[#64748b]" />
                      <span>登録日: {selected.registeredDate}</span>
                    </div>
                  </div>
                </div>
              )}
              {detailTab === "契約・案件" && (
                <div className="text-sm text-[#64748b]">
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="font-medium text-[#0f172a] mb-2">顧問契約</p>
                    <p>月額顧問料: {selected.monthlyFee.toLocaleString()}円</p>
                    <p>契約開始日: {selected.registeredDate}</p>
                  </div>
                  <p className="text-center py-8">契約詳細データは準備中です</p>
                </div>
              )}
              {detailTab === "連絡履歴" && (
                <p className="text-sm text-[#64748b] text-center py-8">連絡履歴データは準備中です</p>
              )}
              {detailTab === "ドキュメント" && (
                <p className="text-sm text-[#64748b] text-center py-8">ドキュメントデータは準備中です</p>
              )}
              {detailTab === "請求履歴" && (
                <p className="text-sm text-[#64748b] text-center py-8">請求履歴データは準備中です</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowNewModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-[560px] max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">新規顧客登録</h3>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">会社名</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="株式会社..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">代表者名</label>
                  <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">業種</label>
                  <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">決算月</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{m}月</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">会計ソフト</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="freee">freee</option>
                    <option value="MF">マネーフォワード</option>
                    <option value="yayoi">弥生</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">電話番号</label>
                  <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">メール</label>
                  <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">担当者</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="山田太郎">山田太郎</option>
                  <option value="佐藤花子">佐藤花子</option>
                  <option value="鈴木一郎">鈴木一郎</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowNewModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">キャンセル</button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">登録</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
