"use client";

import React, { useState, useMemo } from "react";
import { subsidies } from "@/data/subsidies";
import { Search, ExternalLink, Send, X, Star, Clock } from "lucide-react";

const statusColor: Record<string, string> = {
  "募集中": "border-l-green-500",
  "近日公開": "border-l-yellow-500",
  "税制": "border-l-blue-500",
  "共済": "border-l-purple-500",
};

const statusBadge: Record<string, string> = {
  "募集中": "bg-green-100 text-green-700",
  "近日公開": "bg-yellow-100 text-yellow-700",
  "税制": "bg-blue-100 text-blue-700",
  "共済": "bg-purple-100 text-purple-700",
};

export default function SubsidyPage() {
  const [filterRegion, setFilterRegion] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterScale, setFilterScale] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showGuideModal, setShowGuideModal] = useState(false);

  const filtered = useMemo(() => {
    return subsidies.filter((s) => {
      if (filterRegion && s.region !== filterRegion) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      return true;
    });
  }, [filterRegion, filterStatus]);

  const featured = subsidies.filter((s) => s.status === "募集中").slice(0, 3);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">補助金・支援制度</h2>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-5 flex items-center gap-3 flex-wrap">
        <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">地域</option>
          <option value="全国">全国</option>
          <option value="埼玉県">埼玉県</option>
        </select>
        <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">業種</option>
          <option value="全業種">全業種</option>
          <option value="製造業">製造業</option>
        </select>
        <select value={filterScale} onChange={(e) => setFilterScale(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">規模</option>
          <option value="小規模">小規模</option>
          <option value="中小企業">中小企業</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">ステータス</option>
          <option value="募集中">募集中</option>
          <option value="近日公開">近日公開</option>
          <option value="税制">税制優遇</option>
          <option value="共済">共済</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="col-span-2 space-y-4">
          {filtered.map((s) => (
            <div key={s.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 ${statusColor[s.status]}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold">{s.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[s.status]}`}>{s.status}</span>
                  </div>
                  <p className="text-sm text-[#64748b] mb-3">{s.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <p className="text-xs text-[#64748b]">上限額</p>
                  <p className="text-sm font-medium">{s.maxAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">対象</p>
                  <p className="text-sm">{s.eligibility}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">地域</p>
                  <p className="text-sm">{s.region}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">期限</p>
                  <p className="text-sm">{s.deadline}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 flex items-center gap-1.5"
                >
                  <Send size={12} />
                  顧問先に案内
                </button>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5">
                    <ExternalLink size={12} />
                    公式サイト
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-orange-600" />
              <h3 className="text-sm font-semibold">注目の制度</h3>
            </div>
            <div className="space-y-3">
              {featured.map((s) => (
                <div key={s.id} className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-[#64748b] mt-1">{s.maxAmount}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-yellow-600" />
              <h3 className="text-sm font-semibold">期限が近い</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium">小規模事業者持続化補助金</p>
                <p className="text-xs text-yellow-700 mt-1">期限: 2026-05-15</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium">IT導入補助金2026</p>
                <p className="text-xs text-yellow-700 mt-1">期限: 2026-06-30</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowGuideModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-[480px]">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">顧問先に案内</h3>
              <button onClick={() => setShowGuideModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">送信先顧問先</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option>対象顧問先を選択...</option>
                  <option>株式会社サクラテック</option>
                  <option>株式会社マルハシ商事</option>
                  <option>合同会社ミライ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">送信方法</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option>メール</option>
                  <option>ChatWork</option>
                  <option>クライアントポータル</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">メッセージ</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-24" defaultValue="該当する補助金制度のご案内です。詳細をご確認ください。" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowGuideModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">キャンセル</button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">送信</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
