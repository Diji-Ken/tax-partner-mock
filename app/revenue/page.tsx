'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Handshake,
  Award,
  Building2,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  BadgeJapaneseYen,
  Sparkles,
  Users,
  Target,
  Loader2,
} from 'lucide-react';
import {
  referralPartners as demoPartners,
  referralDeals as demoDeals,
  categoryLabels,
  monthlyReferralRevenue,
  categoryRevenue,
  type ReferralCategory,
} from '@/data/referrals';
import { subsidies as demoSubsidies, sourceLabels, sourceBadgeColors, sourceDbCounts, type SubsidySource } from '@/data/subsidies';
import { pipelineItems } from '@/data/pipeline';
import { supabase } from '@/lib/supabase';
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
} from 'recharts';

type Tab = 'dashboard' | 'subsidy' | 'referral' | 'pipeline';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: '\u53CE\u76CA\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9', icon: TrendingUp },
  { key: 'subsidy', label: '\u88DC\u52A9\u91D1\u30DD\u30FC\u30BF\u30EB', icon: Award },
  { key: 'referral', label: '\u7D39\u4ECB\u7BA1\u7406', icon: Handshake },
  { key: 'pipeline', label: '\u30D1\u30A4\u30D7\u30E9\u30A4\u30F3', icon: Target },
];

const dashboardKpis = [
  { label: '\u7D2F\u8A08\u7D39\u4ECB\u53CE\u76CA', value: '\u00A52.14M', icon: BadgeJapaneseYen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: '\u4ECA\u6708\u7D39\u4ECB\u4EF6\u6570', value: '3\u4EF6', icon: Handshake, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '\u6210\u7D04\u7387', value: '68%', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: '\u30D1\u30FC\u30C8\u30CA\u30FC', value: '8\u793E', icon: Users, color: 'text-[#ea580c]', bg: 'bg-orange-50' },
];

const pipelineStages = ['\u554F\u3044\u5408\u308F\u305B', '\u30D2\u30A2\u30EA\u30F3\u30B0', '\u63D0\u6848', '\u5951\u7D04\u4EA4\u6E09', '\u6210\u7D04'] as const;
const stageColors: Record<string, string> = {
  '\u554F\u3044\u5408\u308F\u305B': 'bg-slate-100',
  '\u30D2\u30A2\u30EA\u30F3\u30B0': 'bg-blue-50',
  '\u63D0\u6848': 'bg-amber-50',
  '\u5951\u7D04\u4EA4\u6E09': 'bg-violet-50',
  '\u6210\u7D04': 'bg-emerald-50',
};
const stageDotColors: Record<string, string> = {
  '\u554F\u3044\u5408\u308F\u305B': 'bg-slate-400',
  '\u30D2\u30A2\u30EA\u30F3\u30B0': 'bg-blue-500',
  '\u63D0\u6848': 'bg-amber-500',
  '\u5951\u7D04\u4EA4\u6E09': 'bg-violet-500',
  '\u6210\u7D04': 'bg-emerald-500',
};

const dealStatusLabels: Record<string, string> = {
  introduced: '\u7D39\u4ECB\u6E08',
  in_progress: '\u9032\u884C\u4E2D',
  closed_won: '\u6210\u7D04',
  closed_lost: '\u5931\u6CE8',
};
const dealStatusColors: Record<string, string> = {
  introduced: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  closed_won: 'bg-emerald-100 text-emerald-700',
  closed_lost: 'bg-red-100 text-red-700',
};

const sourceSummary: { source: SubsidySource; label: string; count: string }[] = [
  { source: 'jgrants', label: 'jGrants', count: sourceDbCounts['jgrants'] },
  { source: 'smart-hojokin', label: '\u30B9\u30DE\u30FC\u30C8\u88DC\u52A9\u91D1', count: sourceDbCounts['smart-hojokin'] },
  { source: 'joseikin-now', label: '\u52A9\u6210\u91D1\u306A\u3046', count: sourceDbCounts['joseikin-now'] },
];

interface DbPartner {
  id: string;
  name: string;
  category: string | null;
  commission_type: string | null;
  commission_value: string | null;
  status: string;
}
interface DbDeal {
  id: string;
  client_id: string;
  partner_id: string;
  status: string;
  amount: number | null;
  commission: number | null;
  note: string | null;
  created_at: string;
  clients?: { name: string };
  partner?: { name: string; category: string | null };
}

export default function RevenuePage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [subsidyRegion, setSubsidyRegion] = useState('');
  const [subsidyStatus, setSubsidyStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'demo' | 'supabase'>('demo');

  const [partners, setPartners] = useState(demoPartners);
  const [deals, setDeals] = useState(demoDeals);

  useEffect(() => {
    async function loadData() {
      if (!supabase) { setLoading(false); return; }
      try {
        const [partnersRes, dealsRes] = await Promise.all([
          supabase.from('referral_partners').select('*').order('created_at'),
          supabase.from('referral_deals').select('*, clients:client_id(name), partner:partner_id(name, category)').order('created_at', { ascending: false }),
        ]);

        if (partnersRes.data && partnersRes.data.length > 0) {
          setPartners(partnersRes.data.map((p: DbPartner) => ({
            id: p.id,
            name: p.name,
            category: (p.category || 'business_match') as ReferralCategory,
            description: '',
            commission: p.commission_value || '-',
            status: p.status as any,
            deals: 0,
            totalRevenue: 0,
          })));
          setDataSource('supabase');
        }

        if (dealsRes.data && dealsRes.data.length > 0) {
          setDeals(dealsRes.data.map((d: DbDeal) => ({
            id: d.id,
            clientName: d.clients?.name || '-',
            partnerName: d.partner?.name || '-',
            category: (d.partner?.category || 'business_match') as ReferralCategory,
            status: d.status as any,
            amount: d.amount || 0,
            commission: d.commission || 0,
            date: d.created_at?.slice(0, 10) || '',
            note: d.note || '',
          })));
        }
      } catch (err) {
        console.error('Revenue data fetch failed, using demo:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredSubsidies = demoSubsidies.filter((s) => {
    if (subsidyRegion && s.region !== subsidyRegion) return false;
    if (subsidyStatus && s.status !== subsidyStatus) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{'\u53CE\u76CA\u30FB\u30DE\u30C3\u30C1\u30F3\u30B0'}</h1>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full ${dataSource === 'supabase' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {dataSource === 'supabase' ? 'Supabase' : '\u30C7\u30E2'}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#ea580c] border-b-2 border-[#ea580c]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========= DASHBOARD TAB ========= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {dashboardKpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
                      <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">{'\u6708\u5225\u7D39\u4ECB\u53CE\u76CA'}</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyReferralRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => `\u00A5${Number(v).toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="revenue" name={'\u53CE\u76CA'} fill="#ea580c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">{'\u30AB\u30C6\u30B4\u30EA\u5225\u53CE\u76CA'}</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryRevenue.filter((c) => c.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={10}
                    >
                      {categoryRevenue.filter((c) => c.value > 0).map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `\u00A5${Number(v).toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========= SUBSIDY TAB ========= */}
      {activeTab === 'subsidy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {sourceSummary.map((src) => (
              <div key={src.source} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${sourceBadgeColors[src.source]}`}>{src.label}</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{src.count}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <select value={subsidyRegion} onChange={(e) => setSubsidyRegion(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
              <option value="">{'\u5730\u57DF'}</option>
              {['\u5168\u56FD', '\u57FC\u7389\u770C', '\u6771\u4EAC\u90FD', '\u5927\u962A\u5E9C', '\u611B\u77E5\u770C', '\u798F\u5CA1\u770C'].map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
            <select value={subsidyStatus} onChange={(e) => setSubsidyStatus(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
              <option value="">{'\u30B9\u30C6\u30FC\u30BF\u30B9'}</option>
              {['\u52DF\u96C6\u4E2D', '\u8FD1\u65E5\u516C\u958B', '\u7A0E\u5236', '\u5171\u6E08'].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filteredSubsidies.slice(0, 8).map((sub) => (
              <div key={sub.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${sourceBadgeColors[sub.source]}`}>{sourceLabels[sub.source]}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${sub.status === '\u52DF\u96C6\u4E2D' ? 'bg-emerald-100 text-emerald-700' : sub.status === '\u8FD1\u65E5\u516C\u958B' ? 'bg-blue-100 text-blue-700' : sub.status === '\u7A0E\u5236' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>{sub.status}</span>
                    <span className="text-[10px] text-slate-400">{sub.region}</span>
                  </div>
                  <button className="text-xs text-[#ea580c] border border-[#ea580c] rounded px-2.5 py-1 hover:bg-[#ea580c] hover:text-white transition-colors whitespace-nowrap">{'\u9867\u554F\u5148\u306B\u6848\u5185'}</button>
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">{sub.name}</h3>
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">{sub.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{'\u4E0A\u9650'}: {sub.maxAmount}</span>
                  <span>{'\u7DE0\u5207'}: {sub.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========= REFERRAL TAB ========= */}
      {activeTab === 'referral' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700">{'\u30D1\u30FC\u30C8\u30CA\u30FC\u4E00\u89A7'}</h3>
              <button className="text-xs text-[#ea580c] border border-[#ea580c] rounded px-3 py-1.5 hover:bg-[#ea580c] hover:text-white transition-colors">{'\u65B0\u898F\u7D39\u4ECB'}</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {partners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="text-sm font-bold text-slate-700 truncate mb-1">{partner.name}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{categoryLabels[partner.category] || partner.category}</span>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{partner.deals}{'\u4EF6'}</span>
                    <span>{partner.totalRevenue > 0 ? `\u00A5${partner.totalRevenue.toLocaleString()}` : '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-700">{'\u7D39\u4ECB\u6848\u4EF6'}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['\u9867\u554F\u5148', '\u30D1\u30FC\u30C8\u30CA\u30FC', '\u30AB\u30C6\u30B4\u30EA', '\u91D1\u984D', '\u624B\u6570\u6599', '\u65E5\u4ED8', '\u30B9\u30C6\u30FC\u30BF\u30B9'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-xs font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                    <td className="py-2.5 px-4 text-slate-700">{deal.clientName}</td>
                    <td className="py-2.5 px-4 text-slate-500">{deal.partnerName}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{categoryLabels[deal.category] || deal.category}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{'\u00A5'}{deal.amount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-slate-500">{deal.commission > 0 ? `\u00A5${deal.commission.toLocaleString()}` : '-'}</td>
                    <td className="py-2.5 px-4 text-slate-400">{deal.date}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${dealStatusColors[deal.status] || 'bg-slate-100 text-slate-600'}`}>{dealStatusLabels[deal.status] || deal.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========= PIPELINE TAB ========= */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-5 gap-3">
          {pipelineStages.map((stage) => {
            const stageItems = pipelineItems.filter((p) => p.stage === stage);
            return (
              <div key={stage}>
                <div className={`rounded-lg ${stageColors[stage]} p-3 min-h-[400px]`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${stageDotColors[stage]}`} />
                    <h3 className="text-xs font-bold text-slate-600">{stage}</h3>
                    <span className="text-xs text-slate-400 ml-auto">{stageItems.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg p-3.5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                        <p className="text-sm font-bold text-slate-700 mb-1">{item.companyName}</p>
                        <p className="text-xs text-slate-400 mb-2">{item.contactPerson}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{'\u00A5'}{item.estimatedMonthlyFee.toLocaleString()}/\u6708</span>
                          <span className="text-slate-400">{item.probability}%</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">{item.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
