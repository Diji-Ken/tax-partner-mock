'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plug,
  Users,
  Shield,
  Bell,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { integrations } from '@/data/integrations';
import { staff as demoStaff } from '@/data/staff';
import { supabase } from '@/lib/supabase';

type Tab = 'integrations' | 'staff' | 'settings';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'integrations', label: '\u9023\u643A\u7BA1\u7406', icon: Plug },
  { key: 'staff', label: '\u30B9\u30BF\u30C3\u30D5\u7BA1\u7406', icon: Users },
  { key: 'settings', label: '\u8A2D\u5B9A', icon: Settings },
];

const categories = [...new Set(integrations.map((i) => i.category))];

const roleColors: Record<string, string> = {
  '\u7BA1\u7406\u8005': 'bg-[#ea580c]/10 text-[#ea580c]',
  '\u30B9\u30BF\u30C3\u30D5': 'bg-blue-100 text-blue-700',
  '\u95B2\u89A7\u8005': 'bg-slate-100 text-slate-600',
  admin: 'bg-[#ea580c]/10 text-[#ea580c]',
  member: 'bg-blue-100 text-blue-700',
  viewer: 'bg-slate-100 text-slate-600',
};
const productivityColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-amber-100 text-amber-700',
  C: 'bg-red-100 text-red-700',
};

const roleLabels: Record<string, string> = {
  admin: '\u7BA1\u7406\u8005',
  member: '\u30B9\u30BF\u30C3\u30D5',
  viewer: '\u95B2\u89A7\u8005',
  '\u7BA1\u7406\u8005': '\u7BA1\u7406\u8005',
  '\u30B9\u30BF\u30C3\u30D5': '\u30B9\u30BF\u30C3\u30D5',
  '\u95B2\u89A7\u8005': '\u95B2\u89A7\u8005',
};

interface DbStaff {
  id: string;
  name: string;
  email: string | null;
  role: string;
}

interface DbOffice {
  id: string;
  name: string;
  representative: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('integrations');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'demo' | 'supabase'>('demo');

  const [staffData, setStaffData] = useState(demoStaff);
  const [officeData, setOfficeData] = useState<DbOffice | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!supabase) { setLoading(false); return; }
      try {
        const [staffRes, officeRes] = await Promise.all([
          supabase.from('staff').select('*').order('created_at'),
          supabase.from('offices').select('*').limit(1).single(),
        ]);

        if (staffRes.data && staffRes.data.length > 0) {
          setStaffData(staffRes.data.map((s: DbStaff) => ({
            id: s.id,
            name: s.name,
            email: s.email || '',
            role: (roleLabels[s.role] || s.role) as '\u7BA1\u7406\u8005' | '\u30B9\u30BF\u30C3\u30D5' | '\u95B2\u89A7\u8005',
            status: 'active' as const,
            clientCount: 0,
            averageHours: 0,
            productivity: 'B' as const,
          })));
          setDataSource('supabase');
        }

        if (officeRes.data) {
          setOfficeData(officeRes.data);
        }
      } catch (err) {
        console.error('Admin data fetch failed, using demo:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{'\u7BA1\u7406'}</h1>
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

      {/* ========= INTEGRATIONS TAB ========= */}
      {activeTab === 'integrations' && (
        <div className="space-y-8">
          {categories.map((cat) => {
            const catIntegrations = integrations.filter((i) => i.category === cat);
            return (
              <div key={cat}>
                <h3 className="text-sm font-bold text-slate-700 mb-3">{cat}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {catIntegrations.map((integ) => (
                    <div key={integ.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{integ.name.slice(0, 2)}</div>
                          <h4 className="text-sm font-bold text-slate-700">{integ.name}</h4>
                        </div>
                        {integ.connected ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-slate-300 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{integ.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        {integ.connected ? (
                          <>
                            <span className="text-emerald-600 font-medium">{'\u63A5\u7D9A\u6E08'}</span>
                            <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{integ.lastSync}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400">{'\u672A\u63A5\u7D9A'}</span>
                            <button className="text-[#ea580c] hover:underline">{'\u63A5\u7D9A'}</button>
                          </>
                        )}
                      </div>
                      {integ.connected && integ.connectedClients > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-50 text-xs text-slate-400">{integ.connectedClients}{'\u793E\u306E\u9867\u554F\u5148\u3067\u5229\u7528\u4E2D'}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========= STAFF TAB ========= */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['\u540D\u524D', '\u30E1\u30FC\u30EB', '\u5F79\u5272', '\u30B9\u30C6\u30FC\u30BF\u30B9', '\u62C5\u5F53\u6570', '\u5E73\u5747\u7A3C\u50CDH', '\u751F\u7523\u6027'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffData.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{s.name.slice(0, 1)}</div>
                      {s.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{s.email}</td>
                  <td className="py-3 px-4"><span className={`text-[10px] font-medium px-2 py-0.5 rounded ${roleColors[s.role] || 'bg-slate-100 text-slate-600'}`}>{s.role}</span></td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.status === 'active' ? '\u30A2\u30AF\u30C6\u30A3\u30D6' : '\u975E\u30A2\u30AF\u30C6\u30A3\u30D6'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{s.clientCount}{'\u793E'}</td>
                  <td className="py-3 px-4 text-slate-700">{s.averageHours}h</td>
                  <td className="py-3 px-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${productivityColors[s.productivity]}`}>{s.productivity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========= SETTINGS TAB ========= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">{'\u4E8B\u52D9\u6240\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u4E8B\u52D9\u6240\u540D'}</label>
                <input type="text" defaultValue={officeData?.name || '\u30B5\u30F3\u30D7\u30EB\u4F1A\u8A08\u4E8B\u52D9\u6240'} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u4EE3\u8868\u8005'}</label>
                <input type="text" defaultValue={officeData?.representative || '\u5C71\u7530\u592A\u90CE'} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u96FB\u8A71\u756A\u53F7'}</label>
                <input type="text" defaultValue={officeData?.phone || '048-xxx-xxxx'} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{'\u30E1\u30FC\u30EB'}</label>
                <input type="text" defaultValue={officeData?.email || 'info@sample-tax.co.jp'} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">{'\u901A\u77E5\u8A2D\u5B9A'}</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: '\u30BF\u30B9\u30AF\u671F\u9650\u901A\u77E5', desc: '\u671F\u9650\u306E3\u65E5\u524D\u306B\u30EA\u30DE\u30A4\u30F3\u30C9', enabled: true },
                { label: '\u672A\u5165\u91D1\u30A2\u30E9\u30FC\u30C8', desc: '\u652F\u6255\u671F\u9650\u8D85\u904E\u6642\u306B\u901A\u77E5', enabled: true },
                { label: '\u65B0\u898F\u554F\u3044\u5408\u308F\u305B', desc: 'HP\u304B\u3089\u306E\u65B0\u898F\u554F\u3044\u5408\u308F\u305B\u6642', enabled: true },
                { label: '\u6708\u6B21\u5B8C\u4E86\u5831\u544A', desc: '\u6708\u6B21\u51E6\u7406\u5B8C\u4E86\u6642\u306B\u9867\u554F\u5148\u3078\u81EA\u52D5\u901A\u77E5', enabled: false },
                { label: 'OCR\u78BA\u8A8D\u901A\u77E5', desc: '\u78BA\u4FE1\u5EA680%\u672A\u6E80\u306E\u4ED5\u8A33\u901A\u77E5', enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer ${item.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${item.enabled ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">{'\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3'}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-700">{'\u4E8C\u8981\u7D20\u8A8D\u8A3C'}</p>
                  <p className="text-xs text-slate-400">{'\u30ED\u30B0\u30A4\u30F3\u6642\u306B\u8A8D\u8A3C\u30A2\u30D7\u30EA\u3092\u4F7F\u7528'}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{'\u6709\u52B9'}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-700">{'IP\u30A2\u30C9\u30EC\u30B9\u5236\u9650'}</p>
                  <p className="text-xs text-slate-400">{'\u7279\u5B9A\u306EIP\u30A2\u30C9\u30EC\u30B9\u304B\u3089\u306E\u307F\u30A2\u30AF\u30BB\u30B9\u8A31\u53EF'}</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{'\u7121\u52B9'}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-700">{'\u76E3\u67FB\u30ED\u30B0'}</p>
                  <p className="text-xs text-slate-400">{'\u5168\u64CD\u4F5C\u306E\u76E3\u67FB\u30ED\u30B0\u3092\u8A18\u9332'}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{'\u6709\u52B9'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
