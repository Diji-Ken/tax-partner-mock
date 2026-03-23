"use client";

import React, { useMemo } from "react";
import { pipelineItems, PipelineItem } from "@/data/pipeline";
import { User, Calendar, TrendingUp } from "lucide-react";

const stages = ["問い合わせ", "ヒアリング", "提案", "契約交渉", "成約"] as const;

const stageColor: Record<string, string> = {
  "問い合わせ": "bg-gray-100",
  "ヒアリング": "bg-blue-50",
  "提案": "bg-yellow-50",
  "契約交渉": "bg-orange-50",
  "成約": "bg-green-50",
};

const probColor = (p: number) => {
  if (p >= 80) return "text-green-600";
  if (p >= 50) return "text-yellow-600";
  return "text-gray-500";
};

export default function PipelinePage() {
  const grouped = useMemo(() => {
    const map: Record<string, PipelineItem[]> = {};
    for (const s of stages) map[s] = [];
    for (const item of pipelineItems) {
      if (map[item.stage]) map[item.stage].push(item);
    }
    return map;
  }, []);

  const stageTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of stages) {
      map[s] = grouped[s].reduce((sum, item) => sum + item.estimatedMonthlyFee, 0);
    }
    return map;
  }, [grouped]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">パイプライン</h2>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage} className={`min-w-[260px] flex-1 rounded-xl p-3 ${stageColor[stage]}`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold">{stage}</h3>
              <div className="flex items-center gap-2">
                <span className="bg-white/80 rounded-full px-2 py-0.5 text-xs font-medium">
                  {grouped[stage].length}件
                </span>
              </div>
            </div>
            <p className="text-xs text-[#64748b] mb-3 px-1">
              見込み合計: {stageTotals[stage].toLocaleString()}円/月
            </p>
            <div className="space-y-2">
              {grouped[stage].map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <p className="text-sm font-medium mb-1">{item.companyName}</p>
                  <p className="text-xs text-[#64748b] mb-2">{item.contactPerson}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{item.estimatedMonthlyFee.toLocaleString()}円/月</span>
                    <span className={`font-medium ${probColor(item.probability)}`}>
                      <TrendingUp size={12} className="inline mr-0.5" />
                      {item.probability}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-[#64748b]">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{item.assignedStaff}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{item.lastContact}</span>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="mt-2 text-xs text-[#64748b] bg-gray-50 rounded p-1.5">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
