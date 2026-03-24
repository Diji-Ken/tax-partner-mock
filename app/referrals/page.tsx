"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Handshake,
  TrendingUp,
  Users,
  DollarSign,
  PlusCircle,
  Filter,
} from "lucide-react";
import {
  referralPartners,
  referralDeals,
  categoryLabels,
  monthlyReferralRevenue,
  categoryRevenue,
  type ReferralCategory,
  type ReferralDeal,
} from "@/data/referrals";

const tabs = ["紹介案件", "パートナー管理", "収益レポート"] as const;
type Tab = (typeof tabs)[number];

const dealStatusConfig: Record<
  ReferralDeal["status"],
  { label: string; className: string }
> = {
  introduced: {
    label: "紹介済",
    className: "bg-blue-100 text-blue-700",
  },
  in_progress: {
    label: "進行中",
    className: "bg-yellow-100 text-yellow-700",
  },
  closed_won: {
    label: "成約",
    className: "bg-green-100 text-green-700",
  },
  closed_lost: {
    label: "失注",
    className: "bg-gray-100 text-gray-500",
  },
};

const partnerStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: "アクティブ",
    className: "bg-green-100 text-green-700",
  },
  pending: {
    label: "準備中",
    className: "bg-yellow-100 text-yellow-700",
  },
  inactive: {
    label: "停止中",
    className: "bg-gray-100 text-gray-500",
  },
};

const formatCurrency = (value: number): string => {
  if (value === 0) return "-";
  return `¥${value.toLocaleString()}`;
};

const kpis = [
  {
    label: "累計紹介収益",
    value: "¥2,140,000",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "今月の紹介件数",
    value: "3件",
    icon: Handshake,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "成約率",
    value: "68%",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "アクティブパートナー",
    value: "8社",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

// Group partners by category
const groupedPartners = referralPartners.reduce(
  (acc, partner) => {
    const cat = partner.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(partner);
    return acc;
  },
  {} as Record<ReferralCategory, typeof referralPartners>,
);

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("紹介案件");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredDeals = useMemo(() => {
    if (categoryFilter === "all") return referralDeals;
    return referralDeals.filter((d) => d.category === categoryFilter);
  }, [categoryFilter]);

  // Partner conversion rate table
  const partnerStats = useMemo(() => {
    return referralPartners.map((partner) => {
      const partnerDeals = referralDeals.filter(
        (d) => d.partnerName === partner.name,
      );
      const won = partnerDeals.filter(
        (d) => d.status === "closed_won",
      ).length;
      const total = partnerDeals.length;
      const rate = total > 0 ? Math.round((won / total) * 100) : 0;
      return {
        name: partner.name,
        category: categoryLabels[partner.category],
        total,
        won,
        rate,
        revenue: partner.totalRevenue,
      };
    });
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">紹介・マッチング管理</h2>
        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <PlusCircle size={16} />
          新規紹介
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#64748b]">{kpi.label}</span>
              <div
                className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}
              >
                <kpi.icon size={20} className={kpi.color} />
              </div>
            </div>
            <p className="text-3xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "紹介案件" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Filter */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Filter size={16} className="text-[#64748b]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-[#0f172a] bg-white"
            >
              <option value="all">全カテゴリ</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                    日付
                  </th>
                  <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                    顧問先
                  </th>
                  <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                    紹介先
                  </th>
                  <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                    カテゴリ
                  </th>
                  <th className="text-right text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                    案件金額
                  </th>
                  <th className="text-right text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                    紹介手数料
                  </th>
                  <th className="text-center text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => {
                  const statusCfg = dealStatusConfig[deal.status];
                  return (
                    <tr
                      key={deal.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-[#64748b] whitespace-nowrap">
                        {deal.date}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {deal.clientName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {deal.partnerName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-gray-100 text-[#64748b] rounded-full px-2.5 py-0.5 text-xs font-medium">
                          {categoryLabels[deal.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-mono">
                        {formatCurrency(deal.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-mono">
                        {formatCurrency(deal.commission)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.className}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "パートナー管理" && (
        <div className="space-y-8">
          {Object.entries(groupedPartners).map(([category, partners]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                {categoryLabels[category as ReferralCategory]}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {partners.map((partner) => {
                  const sCfg = partnerStatusConfig[partner.status];
                  return (
                    <div
                      key={partner.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-sm">
                            {partner.name}
                          </h4>
                          <p className="text-xs text-[#64748b] mt-0.5">
                            {partner.description}
                          </p>
                        </div>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${sCfg.className}`}
                        >
                          {sCfg.label}
                        </span>
                      </div>
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <p className="text-xs text-[#64748b] mb-2">
                          手数料体系: {partner.commission}
                        </p>
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs text-[#64748b]">成約件数</p>
                            <p className="text-lg font-bold">
                              {partner.deals}
                              <span className="text-xs font-normal text-[#64748b] ml-0.5">
                                件
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#64748b]">累計収益</p>
                            <p className="text-lg font-bold">
                              {partner.totalRevenue > 0
                                ? `¥${partner.totalRevenue.toLocaleString()}`
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "収益レポート" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            {/* Monthly Revenue Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">月別紹介収益</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyReferralRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `¥${Number(value).toLocaleString()}`,
                      "紹介収益",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Revenue Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">カテゴリ別収益</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryRevenue.filter((c) => c.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={true}
                  >
                    {categoryRevenue
                      .filter((c) => c.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `¥${Number(value).toLocaleString()}`,
                      "収益",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Partner Conversion Rate Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">パートナー別成約率</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                      パートナー名
                    </th>
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                      カテゴリ
                    </th>
                    <th className="text-center text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                      紹介件数
                    </th>
                    <th className="text-center text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                      成約件数
                    </th>
                    <th className="text-center text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                      成約率
                    </th>
                    <th className="text-right text-xs font-medium text-[#64748b] uppercase tracking-wider px-6 py-3">
                      累計収益
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {partnerStats.map((stat) => (
                    <tr
                      key={stat.name}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {stat.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-gray-100 text-[#64748b] rounded-full px-2.5 py-0.5 text-xs font-medium">
                          {stat.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {stat.total}件
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {stat.won}件
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            stat.rate >= 70
                              ? "bg-green-100 text-green-700"
                              : stat.rate >= 40
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {stat.total > 0 ? `${stat.rate}%` : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-mono">
                        {stat.revenue > 0
                          ? `¥${stat.revenue.toLocaleString()}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
