"use client";

import React, { useState } from "react";
import { accounts } from "@/data/knowledge/accounts";
import { taxCalendar } from "@/data/knowledge/tax-calendar";
import { officeRules } from "@/data/knowledge/office-rules";
import { clients } from "@/data/clients";
import { BookOpen, Calendar, Shield, Receipt, FileText, CheckSquare, ClipboardList, GitBranch, X, Bell } from "lucide-react";

const tabs = ["システム共通", "事務所ルール", "企業別ルール"] as const;

const knowledgeCards = [
  { title: "勘定科目マスタ", icon: BookOpen, count: "15科目", key: "accounts" },
  { title: "税務カレンダー", icon: Calendar, count: "10項目", key: "calendar" },
  { title: "電帳法対応", icon: Shield, count: "要件一覧", key: "ebook" },
  { title: "インボイス制度", icon: Receipt, count: "ガイド", key: "invoice" },
  { title: "月次テンプレート", icon: FileText, count: "チェック", key: "monthly" },
  { title: "決算テンプレート", icon: ClipboardList, count: "チェック", key: "settlement" },
  { title: "年末調整", icon: CheckSquare, count: "手順", key: "yearend" },
  { title: "仕訳ルール", icon: GitBranch, count: "5件", key: "rules" },
];

const journalRules = [
  { id: 1, condition: "摘要に「タクシー」を含む", account: "旅費交通費", tax: "課税10%" },
  { id: 2, condition: "取引先「東京電力」", account: "水道光熱費", tax: "課税10%" },
  { id: 3, condition: "摘要に「AWS」「GCP」を含む", account: "通信費", tax: "課税10%" },
  { id: 4, condition: "金額5万円以上 AND 取引先「飲食店」", account: "交際費", tax: "課税10%" },
  { id: 5, condition: "摘要に「ガソリン」を含む", account: "車両費", tax: "課税10%" },
];

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("システム共通");
  const [modalKey, setModalKey] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState(clients[0].id);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">ナレッジ管理</h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg border border-gray-200 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab ? "bg-orange-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "システム共通" && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {knowledgeCards.map((card) => (
              <button
                key={card.key}
                onClick={() => setModalKey(card.key)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left hover:border-orange-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                  <card.icon size={20} className="text-orange-600" />
                </div>
                <p className="text-sm font-semibold mb-1">{card.title}</p>
                <p className="text-xs text-[#64748b]">{card.count}</p>
              </button>
            ))}
          </div>

          {/* Modal */}
          {modalKey && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={() => setModalKey(null)} />
              <div className="relative bg-white rounded-xl shadow-xl w-[640px] max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {knowledgeCards.find((c) => c.key === modalKey)?.title}
                  </h3>
                  <button onClick={() => setModalKey(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  {modalKey === "accounts" && (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-[#64748b]">
                          <th className="px-3 py-2 font-medium">コード</th>
                          <th className="px-3 py-2 font-medium">科目名</th>
                          <th className="px-3 py-2 font-medium">区分</th>
                          <th className="px-3 py-2 font-medium">税区分</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {accounts.map((a) => (
                          <tr key={a.code}>
                            <td className="px-3 py-2 font-mono">{a.code}</td>
                            <td className="px-3 py-2">{a.name}</td>
                            <td className="px-3 py-2">{a.category}</td>
                            <td className="px-3 py-2">{a.taxType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modalKey === "calendar" && (
                    <div className="space-y-3">
                      {taxCalendar.map((t) => (
                        <div key={t.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-orange-600">{t.month}月</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{t.title}</p>
                            <p className="text-xs text-[#64748b]">{t.description}</p>
                            <p className="text-xs text-orange-600 mt-1">期限: {t.deadline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!["accounts", "calendar"].includes(modalKey) && (
                    <p className="text-sm text-[#64748b] text-center py-8">詳細データは準備中です</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "事務所ルール" && (
        <div className="space-y-6">
          {/* Journal Rules Engine */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">仕訳ルールエンジン（IF/THEN）</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[#64748b]">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">IF（条件）</th>
                  <th className="px-4 py-3 font-medium">THEN（勘定科目）</th>
                  <th className="px-4 py-3 font-medium">税区分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {journalRules.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-[#64748b]">{r.id}</td>
                    <td className="px-4 py-3 font-mono text-xs bg-gray-50">{r.condition}</td>
                    <td className="px-4 py-3 font-medium">{r.account}</td>
                    <td className="px-4 py-3">{r.tax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom Accounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">カスタム勘定科目</h3>
            <div className="grid grid-cols-3 gap-3">
              {accounts.filter((a) => a.category === "費用").map((a) => (
                <div key={a.code} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-[#64748b] font-mono">{a.code}</p>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-[#64748b]">{a.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">通知ルール</h3>
            <div className="space-y-3">
              {officeRules.filter((r) => r.category === "通知").map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell size={16} className="text-[#64748b]" />
                    <div>
                      <p className="text-sm font-medium">{rule.title}</p>
                      <p className="text-xs text-[#64748b]">{rule.description}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer ${rule.enabled ? "bg-orange-600" : "bg-gray-300"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${rule.enabled ? "right-0.5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "企業別ルール" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">顧問先を選択</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64"
              >
                {clients.filter((c) => c.status === "active").map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {["仕訳ルール", "処理メモ", "資料回収リスト", "連絡先", "税務調査履歴", "カスタムフィールド"].map((item) => (
                <div key={item} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">{item}</p>
                  <p className="text-xs text-[#64748b]">
                    {clients.find((c) => c.id === selectedClient)?.name}の{item}データは準備中です
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
