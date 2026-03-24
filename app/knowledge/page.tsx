'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Calendar,
  FileText,
  Receipt,
  ClipboardList,
  Building2,
  Layers,
  GraduationCap,
  Settings,
  Bell,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  X,
  Sparkles,
  Play,
} from 'lucide-react';
import { accounts } from '@/data/knowledge/accounts';
import { taxCalendar } from '@/data/knowledge/tax-calendar';
import { officeRules } from '@/data/knowledge/office-rules';
import { aiLearningRules } from '@/data/ai-learning-rules';

type Tab = 'tax' | 'rules' | 'learning';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'tax', label: '\u7A0E\u52D9\u30CA\u30EC\u30C3\u30B8', icon: BookOpen },
  { key: 'rules', label: '\u4E8B\u52D9\u6240\u30EB\u30FC\u30EB', icon: Settings },
  { key: 'learning', label: '\u30E9\u30FC\u30CB\u30F3\u30B0', icon: GraduationCap },
];

const knowledgeCards = [
  { title: '\u52D8\u5B9A\u79D1\u76EE', icon: Calculator, description: '\u6A19\u6E96\u52D8\u5B9A\u79D1\u76EE\u4E00\u89A7\u3068\u7A0E\u533A\u5206', category: 'accounts' },
  { title: '\u7A0E\u52D9\u30AB\u30EC\u30F3\u30C0\u30FC', icon: Calendar, description: '\u6708\u5225\u306E\u7A0E\u52D9\u30A4\u30D9\u30F3\u30C8\u3068\u671F\u9650', category: 'calendar' },
  { title: '\u96FB\u5E33\u6CD5', icon: FileText, description: '\u96FB\u5B50\u5E33\u7C3F\u4FDD\u5B58\u6CD5\u5BFE\u5FDC\u30AC\u30A4\u30C9', category: 'ebook' },
  { title: '\u30A4\u30F3\u30DC\u30A4\u30B9', icon: Receipt, description: '\u30A4\u30F3\u30DC\u30A4\u30B9\u5236\u5EA6\u5BFE\u5FDC\u30C1\u30A7\u30C3\u30AF', category: 'invoice' },
  { title: '\u6708\u6B21\u51E6\u7406', icon: ClipboardList, description: '\u6708\u6B21\u51E6\u7406\u306E\u6A19\u6E96\u30D5\u30ED\u30FC', category: 'monthly' },
  { title: '\u6C7A\u7B97', icon: Building2, description: '\u6C7A\u7B97\u624B\u7D9A\u304D\u306E\u6A19\u6E96\u30D5\u30ED\u30FC', category: 'settlement' },
  { title: '\u5E74\u672B\u8ABF\u6574', icon: Layers, description: '\u5E74\u672B\u8ABF\u6574\u306E\u624B\u9806\u3068\u30C1\u30A7\u30C3\u30AF', category: 'yearend' },
  { title: '\u4ED5\u8A33\u30EB\u30FC\u30EB', icon: Sparkles, description: 'AI\u5B66\u7FD2\u6E08\u307F\u4ED5\u8A33\u30EB\u30FC\u30EB\u4E00\u89A7', category: 'rules' },
];

const courses = [
  { title: '\u65B0\u4EBA\u30B9\u30BF\u30C3\u30D5\u7814\u4FEE', progress: 100, lessons: 12, description: '\u57FA\u672C\u7684\u306A\u7A0E\u52D9\u77E5\u8B58\u3068\u4E8B\u52D9\u6240\u306E\u30EB\u30FC\u30EB' },
  { title: '\u6708\u6B21\u51E6\u7406\u30DE\u30B9\u30BF\u30FC', progress: 75, lessons: 8, description: '\u52B9\u7387\u7684\u306A\u6708\u6B21\u51E6\u7406\u306E\u30D5\u30ED\u30FC' },
  { title: '\u6C7A\u7B97\u30FB\u7533\u544A\u5B9F\u52D9', progress: 40, lessons: 15, description: '\u6C7A\u7B97\u66F8\u4F5C\u6210\u304B\u3089\u7533\u544A\u307E\u3067' },
  { title: '\u96FB\u5E33\u6CD5\u5BFE\u5FDC\u8B1B\u5EA7', progress: 60, lessons: 6, description: '\u96FB\u5B50\u5E33\u7C3F\u4FDD\u5B58\u6CD5\u306E\u5B9F\u52D9\u5BFE\u5FDC' },
  { title: 'AI\u6D3B\u7528\u8B1B\u5EA7', progress: 20, lessons: 10, description: 'OCR\u30FBAI\u4ED5\u8A33\u306E\u52B9\u679C\u7684\u306A\u904B\u7528' },
  { title: '\u88DC\u52A9\u91D1\u30FB\u52A9\u6210\u91D1\u5165\u9580', progress: 0, lessons: 8, description: '\u9867\u554F\u5148\u3078\u306E\u88DC\u52A9\u91D1\u63D0\u6848\u30B9\u30AD\u30EB' },
];

/* Reporting fee table */
const feeTable = [
  { service: '\u6708\u6B21\u9867\u554F\u6599\uFF08\u500B\u4EBA\uFF09', price: '\u00A520,000\uFF5E' },
  { service: '\u6708\u6B21\u9867\u554F\u6599\uFF08\u6CD5\u4EBA\uFF09', price: '\u00A530,000\uFF5E' },
  { service: '\u8A18\u5E33\u4EE3\u884C', price: '\u00A510,000\uFF5E' },
  { service: '\u6C7A\u7B97\u6599', price: '\u6708\u984D\u00D75\uFF5E6' },
  { service: '\u5E74\u672B\u8ABF\u6574', price: '\u00A510,000/\u4EBA' },
];

type ModalContent = string | null;

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<Tab>('tax');
  const [modalContent, setModalContent] = useState<ModalContent>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{'\u30CA\u30EC\u30C3\u30B8'}</h1>

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

      {/* ========= TAX KNOWLEDGE TAB ========= */}
      {activeTab === 'tax' && (
        <div className="grid grid-cols-4 gap-4">
          {knowledgeCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onClick={() => setModalContent(card.category)}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-[#ea580c]/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-[#ea580c]/10 flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-[#ea580c] transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">{card.title}</h3>
                <p className="text-xs text-slate-400">{card.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ========= OFFICE RULES TAB ========= */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Custom accounts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{'\u30AB\u30B9\u30BF\u30E0\u52D8\u5B9A\u79D1\u76EE'}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['\u30B3\u30FC\u30C9', '\u79D1\u76EE\u540D', '\u533A\u5206', '\u7A0E\u533A\u5206', '\u8AAC\u660E'].map((h) => (
                      <th key={h} className="text-left py-2 text-xs font-medium text-slate-400 px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.slice(0, 8).map((acc) => (
                    <tr key={acc.code} className="border-b border-slate-50">
                      <td className="py-2 px-2 text-slate-500 font-mono text-xs">{acc.code}</td>
                      <td className="py-2 px-2 text-slate-700 font-medium">{acc.name}</td>
                      <td className="py-2 px-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{acc.category}</span>
                      </td>
                      <td className="py-2 px-2 text-xs text-slate-400">{acc.taxType}</td>
                      <td className="py-2 px-2 text-xs text-slate-400">{acc.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Journaling rules */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{'\u4ED5\u8A33\u30EB\u30FC\u30EB\u30A8\u30F3\u30B8\u30F3'}</h3>
            <div className="space-y-2">
              {officeRules.filter((r) => r.category === '\u4ED5\u8A33\u30EB\u30FC\u30EB').map((rule) => (
                <div key={rule.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{rule.title}</p>
                    {rule.condition && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        IF: {rule.condition} {'\u2192'} THEN: {rule.action}
                      </p>
                    )}
                  </div>
                  {rule.enabled ? (
                    <ToggleRight className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fee table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{'\u5831\u916C\u30C6\u30FC\u30D6\u30EB'}</h3>
            <table className="w-full text-sm">
              <tbody>
                {feeTable.map((row) => (
                  <tr key={row.service} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-700">{row.service}</td>
                    <td className="py-2.5 text-right text-slate-600 font-medium">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notification rules */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{'\u901A\u77E5\u30EB\u30FC\u30EB'}</h3>
            <div className="space-y-2">
              {officeRules.filter((r) => r.category === '\u901A\u77E5').map((rule) => (
                <div key={rule.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-700">{rule.title}</p>
                      <p className="text-xs text-slate-400">{rule.description}</p>
                    </div>
                  </div>
                  {rule.enabled ? (
                    <ToggleRight className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========= LEARNING TAB ========= */}
      {activeTab === 'learning' && (
        <div className="grid grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.title} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">{course.title}</h3>
                {course.progress === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : course.progress > 0 ? (
                  <Play className="w-5 h-5 text-[#ea580c] flex-shrink-0" />
                ) : (
                  <Play className="w-5 h-5 text-slate-300 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">{course.description}</p>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400">{course.lessons}{'\u30EC\u30C3\u30B9\u30F3'}</span>
                <span className="text-[11px] font-medium text-slate-600">{course.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-[#ea580c]'}`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========= MODAL ========= */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalContent(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-[700px] max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {modalContent === 'accounts' && '\u52D8\u5B9A\u79D1\u76EE\u4E00\u89A7'}
                {modalContent === 'calendar' && '\u7A0E\u52D9\u30AB\u30EC\u30F3\u30C0\u30FC'}
                {modalContent === 'ebook' && '\u96FB\u5B50\u5E33\u7C3F\u4FDD\u5B58\u6CD5\u5BFE\u5FDC\u30AC\u30A4\u30C9'}
                {modalContent === 'invoice' && '\u30A4\u30F3\u30DC\u30A4\u30B9\u5236\u5EA6\u5BFE\u5FDC'}
                {modalContent === 'monthly' && '\u6708\u6B21\u51E6\u7406\u30D5\u30ED\u30FC'}
                {modalContent === 'settlement' && '\u6C7A\u7B97\u624B\u7D9A\u304D\u30D5\u30ED\u30FC'}
                {modalContent === 'yearend' && '\u5E74\u672B\u8ABF\u6574\u624B\u9806'}
                {modalContent === 'rules' && 'AI\u4ED5\u8A33\u30EB\u30FC\u30EB'}
              </h2>
              <button onClick={() => setModalContent(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              {modalContent === 'accounts' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['\u30B3\u30FC\u30C9', '\u79D1\u76EE\u540D', '\u533A\u5206', '\u7A0E\u533A\u5206'].map((h) => (
                        <th key={h} className="text-left py-2 text-xs font-medium text-slate-400 px-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc) => (
                      <tr key={acc.code} className="border-b border-slate-50">
                        <td className="py-2 px-2 text-slate-500 font-mono text-xs">{acc.code}</td>
                        <td className="py-2 px-2 text-slate-700">{acc.name}</td>
                        <td className="py-2 px-2 text-xs text-slate-400">{acc.category}</td>
                        <td className="py-2 px-2 text-xs text-slate-400">{acc.taxType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {modalContent === 'calendar' && (
                <div className="space-y-2">
                  {taxCalendar.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-3 px-4 bg-slate-50 rounded-lg">
                      <span className="text-xs font-bold text-slate-500 w-12">{item.month}{'\u6708'}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.description}</p>
                        <p className="text-xs text-[#ea580c] mt-0.5">{'\u671F\u9650'}: {item.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {modalContent === 'rules' && (
                <div className="space-y-2">
                  {aiLearningRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm text-slate-700">{rule.clientName}: {rule.condition} {'\u2192'} {rule.account}</p>
                        <p className="text-xs text-slate-400">{'\u9069\u7528'}: {rule.appliedCount}{'\u56DE'} | {'\u78BA\u4FE1\u5EA6'}: {rule.confidence}%</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        rule.status === '\u627F\u8A8D\u6E08' ? 'bg-emerald-100 text-emerald-700' : rule.status === '\u8981\u78BA\u8A8D' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rule.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {modalContent !== 'accounts' && modalContent !== 'calendar' && modalContent !== 'rules' && (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{'\u8A73\u7D30\u30B3\u30F3\u30C6\u30F3\u30C4\u306F\u958B\u767A\u4E2D\u3067\u3059'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
