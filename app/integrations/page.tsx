"use client";

import React from "react";
import { integrations, Integration } from "@/data/integrations";
import {
  CheckCircle2,
  Circle,
  RefreshCw,
  Calculator,
  HardDrive,
  FileSignature,
  CreditCard,
  MessageSquare,
  Users,
  Receipt,
  Landmark,
  ScanLine,
  Globe,
  Database,
} from "lucide-react";

const categoryIcon: Record<string, React.ElementType> = {
  "会計ソフト": Calculator,
  "給与・労務": Users,
  "請求・経費": Receipt,
  "公的API": Globe,
  "補助金DB": Database,
  "税務申告": Landmark,
  "記帳・OCR": ScanLine,
  "ストレージ": HardDrive,
  "契約管理": FileSignature,
  "決済": CreditCard,
  "コミュニケーション": MessageSquare,
};

const categoryOrder = [
  "会計ソフト",
  "給与・労務",
  "請求・経費",
  "公的API",
  "補助金DB",
  "税務申告",
  "記帳・OCR",
  "ストレージ",
  "契約管理",
  "決済",
  "コミュニケーション",
];

function IntegrationCard({ integ }: { integ: Integration }) {
  const CategoryIcon = categoryIcon[integ.category] || Circle;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              integ.connected ? "bg-green-50" : "bg-gray-100"
            }`}
          >
            <CategoryIcon
              size={20}
              className={integ.connected ? "text-green-600" : "text-gray-400"}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{integ.name}</h3>
            <p className="text-xs text-[#64748b]">{integ.category}</p>
          </div>
        </div>
        {integ.connected ? (
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 size={10} />
            接続済み
          </span>
        ) : (
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
            未接続
          </span>
        )}
      </div>
      <p className="text-xs text-[#64748b] mb-3">{integ.description}</p>
      {integ.connected && integ.lastSync && (
        <div className="flex items-center justify-between text-xs text-[#64748b] mb-3 p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-1">
            <RefreshCw size={10} />
            <span>最終同期: {integ.lastSync}</span>
          </div>
          {integ.connectedClients > 0 && (
            <span>{integ.connectedClients}社連携</span>
          )}
        </div>
      )}
      <button
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
          integ.connected
            ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
            : "bg-orange-600 text-white hover:bg-orange-700"
        }`}
      >
        {integ.connected ? "設定" : "接続"}
      </button>
    </div>
  );
}

export default function IntegrationsPage() {
  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      items: integrations.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">連携管理</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#64748b]">
            {connectedCount}/{integrations.length} サービス接続済み
          </span>
        </div>
      </div>

      {grouped.map((group) => {
        const Icon = categoryIcon[group.category] || Circle;
        return (
          <div key={group.category} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Icon size={18} className="text-orange-600" />
              <h3 className="text-base font-semibold text-[#0f172a]">
                {group.category}
              </h3>
              <span className="text-xs text-[#64748b]">
                ({group.items.filter((i) => i.connected).length}/
                {group.items.length})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {group.items.map((integ) => (
                <IntegrationCard key={integ.id} integ={integ} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
