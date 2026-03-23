"use client";

import React from "react";
import { integrations } from "@/data/integrations";
import { CheckCircle2, Circle, RefreshCw, Calculator, HardDrive, FileSignature, CreditCard, MessageSquare } from "lucide-react";

const categoryIcon: Record<string, React.ElementType> = {
  "会計ソフト": Calculator,
  "ストレージ": HardDrive,
  "契約管理": FileSignature,
  "決済": CreditCard,
  "コミュニケーション": MessageSquare,
};

export default function IntegrationsPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">連携管理</h2>

      <div className="grid grid-cols-3 gap-5">
        {integrations.map((integ) => {
          const CategoryIcon = categoryIcon[integ.category] || Circle;
          return (
            <div key={integ.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integ.connected ? "bg-green-50" : "bg-gray-100"}`}>
                    <CategoryIcon size={20} className={integ.connected ? "text-green-600" : "text-gray-400"} />
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
              {integ.connected && (
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
              <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
                integ.connected
                  ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}>
                {integ.connected ? "設定" : "接続"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
