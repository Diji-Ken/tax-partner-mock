"use client";

import React, { useState } from "react";
import { Monitor, Upload, MessageSquare, Receipt, GitBranch, Building2, CheckCircle2, Clock, AlertCircle, Send } from "lucide-react";

const portalTabs = [
  { label: "マイページ", icon: Monitor },
  { label: "書類提出", icon: Upload },
  { label: "メッセージ", icon: MessageSquare },
  { label: "請求書", icon: Receipt },
  { label: "処理ルール", icon: GitBranch },
  { label: "補助金情報", icon: Building2 },
] as const;

type PortalTab = (typeof portalTabs)[number]["label"];

const messages = [
  { id: 1, from: "山田太郎（担当）", message: "3月度の月次処理が完了しました。試算表をご確認ください。", date: "2026-03-20 15:30", isMine: false },
  { id: 2, from: "田中一郎（お客様）", message: "確認しました。ありがとうございます。1点質問があります。", date: "2026-03-20 16:45", isMine: true },
  { id: 3, from: "山田太郎（担当）", message: "はい、ご質問をお聞かせください。", date: "2026-03-20 17:00", isMine: false },
];

const checklist = [
  { id: 1, label: "通帳コピー（3月分）", done: true },
  { id: 2, label: "領収書・レシート", done: true },
  { id: 3, label: "クレジットカード明細", done: false },
  { id: 4, label: "売上帳", done: false },
  { id: 5, label: "請求書控え", done: true },
];

const portalInvoices = [
  { id: "INV-2026-001", period: "2026年3月", amount: "55,000円", status: "入金済" },
  { id: "INV-2026-002", period: "2026年2月", amount: "55,000円", status: "入金済" },
  { id: "INV-2025-012", period: "2025年12月", amount: "55,000円", status: "入金済" },
];

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<PortalTab>("マイページ");

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">クライアントポータル</h2>
      <p className="text-sm text-[#64748b] mb-4">クライアントから見える画面のプレビューです</p>

      {/* Browser Frame */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Browser Bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-[#64748b]">
            https://portal.tax-partner.jp/client/sakura-tech
          </div>
        </div>

        {/* Portal Header */}
        <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: "#1a2744" }}>
          <p className="text-white text-lg font-bold">TAX PARTNER ポータル</p>
          <p className="text-gray-400 text-xs">株式会社サクラテック 様</p>
        </div>

        {/* Tab Bar */}
        <div className="border-b border-gray-200 px-6 flex gap-1 bg-gray-50">
          {portalTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.label ? "border-orange-600 text-orange-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[400px]">
          {activeTab === "マイページ" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">月次処理進捗</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">2026年3月度</span>
                    <span className="text-sm font-medium text-orange-600">75%完了</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">次の期限</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock size={16} className="text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">資料提出期限</p>
                      <p className="text-xs text-[#64748b]">2026年4月5日まで</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle size={16} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">決算申告期限</p>
                      <p className="text-xs text-[#64748b]">2026年5月31日</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">お知らせ</h3>
                <div className="p-3 bg-green-50 rounded-lg flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">2月度月次処理が完了しました</p>
                    <p className="text-xs text-[#64748b]">2026-03-10</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "書類提出" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">提出チェックリスト</h3>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.done ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                        {item.done && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm ${item.done ? "line-through text-[#64748b]" : ""}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium">ファイルをドラッグ&ドロップ</p>
                <p className="text-xs text-[#64748b]">PDF, JPG, PNG, Excel対応</p>
              </div>
            </div>
          )}

          {activeTab === "メッセージ" && (
            <div className="space-y-4">
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${m.isMine ? "bg-orange-50" : "bg-gray-50"}`}>
                      <p className="text-xs font-medium mb-1">{m.from}</p>
                      <p className="text-sm">{m.message}</p>
                      <p className="text-xs text-[#64748b] mt-1">{m.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="text" placeholder="メッセージを入力..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <button className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "請求書" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
                  <th className="px-4 py-3 font-medium">請求番号</th>
                  <th className="px-4 py-3 font-medium">対象期間</th>
                  <th className="px-4 py-3 font-medium">金額</th>
                  <th className="px-4 py-3 font-medium">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portalInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{inv.id}</td>
                    <td className="px-4 py-3 text-sm">{inv.period}</td>
                    <td className="px-4 py-3 text-sm font-medium">{inv.amount}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "処理ルール" && (
            <div className="space-y-3">
              <p className="text-sm text-[#64748b] mb-4">お客様の仕訳処理に適用されているルールです</p>
              {[
                { condition: '摘要に「AWS」を含む', action: '通信費に仕訳', confidence: 98 },
                { condition: '摘要に「Slack」「GitHub」を含む', action: '通信費に仕訳', confidence: 95 },
              ].map((rule, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm"><span className="font-medium">IF:</span> {rule.condition}</p>
                    <p className="text-sm"><span className="font-medium">THEN:</span> {rule.action}</p>
                  </div>
                  <span className="text-xs text-[#64748b]">確信度 {rule.confidence}%</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "補助金情報" && (
            <div className="space-y-3">
              <p className="text-sm text-[#64748b] mb-4">お客様に該当する可能性のある制度です</p>
              {[
                { name: "IT導入補助金2026", max: "最大450万円", deadline: "2026-06-30" },
                { name: "小規模事業者持続化補助金", max: "最大200万円", deadline: "2026-05-15" },
              ].map((s, i) => (
                <div key={i} className="p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-[#64748b] mt-1">上限: {s.max} / 期限: {s.deadline}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
