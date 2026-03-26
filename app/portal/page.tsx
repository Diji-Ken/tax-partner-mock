'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Upload,
  MessageSquare,
  FileCheck,
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  User,
  Send,
  FileText,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  FileInput,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Tab = 'home' | 'upload' | 'message' | 'forms';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'home', label: '\u30DB\u30FC\u30E0', icon: Home },
  { key: 'upload', label: '\u66F8\u985E\u63D0\u51FA', icon: Upload },
  { key: 'message', label: '\u30E1\u30C3\u30BB\u30FC\u30B8', icon: MessageSquare },
  { key: 'forms', label: '\u30D5\u30A9\u30FC\u30E0\u30FB\u78BA\u8A8D', icon: FileInput },
];

const requiredDocs = [
  { label: '\u9818\u53CE\u66F8\u30FB\u30EC\u30B7\u30FC\u30C8', done: true },
  { label: '\u8ACB\u6C42\u66F8', done: true },
  { label: '\u9280\u884C\u901A\u5E33\u30B3\u30D4\u30FC\uFF08\u307E\u305F\u306FEB\u660E\u7D30\uFF09', done: false },
  { label: '\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9\u660E\u7D30', done: false },
  { label: '\u7D66\u4E0E\u53F0\u5E33', done: true },
  { label: '\u793E\u4F1A\u4FDD\u967A\u6599\u901A\u77E5\u66F8', done: true },
];

const uploadedFiles = [
  { name: '\u9818\u53CE\u66F8_2026\u5E743\u6708\u5206.pdf', size: '1.2MB', date: '2026-03-18', status: '\u78BA\u8A8D\u6E08' },
  { name: '\u8ACB\u6C42\u66F8_\u30AA\u30D5\u30A3\u30B9\u30C7\u30DD.pdf', size: '450KB', date: '2026-03-15', status: '\u78BA\u8A8D\u6E08' },
  { name: '\u7D66\u4E0E\u53F0\u5E33_3\u6708.xlsx', size: '320KB', date: '2026-03-20', status: '\u78BA\u8A8D\u4E2D' },
];

const chatMessages = [
  { from: 'staff', name: '\u5C71\u7530\u592A\u90CE', text: '3\u6708\u5206\u306E\u8CC7\u6599\u63D0\u51FA\u3092\u304A\u9858\u3044\u3044\u305F\u3057\u307E\u3059\u3002\u671F\u9650\u306F4\u67085\u65E5\u3067\u3059\u3002', time: '03/20 10:00' },
  { from: 'client', name: '\u7530\u4E2D\u4E00\u90CE', text: '\u627F\u77E5\u3057\u307E\u3057\u305F\u3002\u6765\u9031\u4E2D\u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002', time: '03/20 14:30' },
  { from: 'staff', name: '\u5C71\u7530\u592A\u90CE', text: '\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u9280\u884C\u660E\u7D30\u3068\u30AF\u30EC\u30AB\u660E\u7D30\u3082\u5FD8\u308C\u305A\u306B\u304A\u9858\u3044\u3044\u305F\u3057\u307E\u3059\u3002', time: '03/20 14:35' },
];

const portalInvoices = [
  { number: 'INV-2026-001', amount: 55000, date: '2026-03-01', status: '\u5165\u91D1\u6E08' },
  { number: 'INV-2026-002', amount: 55000, date: '2026-02-01', status: '\u5165\u91D1\u6E08' },
];

const processingRules = [
  { condition: 'Amazon\u3067\u306E\u8CFC\u5165', account: '\u6D88\u8017\u54C1\u8CBB', confidence: 95 },
  { condition: 'AWS\u5229\u7528\u6599', account: '\u901A\u4FE1\u8CBB', confidence: 98 },
  { condition: '\u30BF\u30AF\u30B7\u30FC\u4EE3', account: '\u65C5\u8CBB\u4EA4\u901A\u8CBB', confidence: 85 },
  { condition: '\u30AC\u30BD\u30EA\u30F3\u4EE3', account: '\u8ECA\u4E21\u8CBB', confidence: 96 },
];

const relevantSubsidies = [
  { name: 'IT\u5C0E\u5165\u88DC\u52A9\u91D1', maxAmount: '\u6700\u5927450\u4E07\u5186', deadline: '2026-06-30' },
  { name: '\u5C0F\u898F\u6A21\u4E8B\u696D\u8005\u6301\u7D9A\u5316\u88DC\u52A9\u91D1', maxAmount: '\u6700\u5927200\u4E07\u5186', deadline: '2026-05-15' },
];

// Form field type mapping for portal rendering
interface FormField {
  id: string;
  template_id: string;
  label: string;
  field_type: string;
  is_required: boolean;
  options: string | null;
  description: string | null;
}

// Mock client type (in real app, get from auth)
const MOCK_CLIENT_TYPE = 'new_corporate';
const MOCK_CLIENT_ID = ''; // Will be loaded from first client

// Template IDs per client type
const formTemplatesByType: Record<string, string[]> = {
  new_corporate: ['INIT-NEW-001', 'INIT-NEW-002', 'INIT-NEW-003'],
  existing_corporate: ['INIT-EXIST-001', 'INIT-EXIST-002'],
  individual: ['INIT-INDIVIDUAL-001'],
};

const OFFICE_ID = '00000000-0000-0000-0000-000000000001';

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Form state
  const [formFields, setFormFields] = useState<Record<string, FormField[]>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState<Record<string, boolean>>({});
  const [existingResponses, setExistingResponses] = useState<any[]>([]);

  const doneCount = requiredDocs.filter((d) => d.done).length;
  const progressPercent = Math.round((doneCount / requiredDocs.length) * 100);

  // Load form fields when forms tab is selected
  useEffect(() => {
    if (activeTab === 'forms' && supabase) {
      loadFormData();
    }
  }, [activeTab]);

  const loadFormData = async () => {
    if (!supabase) return;
    setFormLoading(true);
    try {
      const templateIds = formTemplatesByType[MOCK_CLIENT_TYPE] || [];
      const fieldsMap: Record<string, FormField[]> = {};

      for (const tid of templateIds) {
        const { data } = await supabase
          .from('form_fields')
          .select('*')
          .eq('template_id', tid)
          .eq('office_id', OFFICE_ID)
          .order('sort_order');
        if (data && data.length > 0) {
          fieldsMap[tid] = data;
        }
      }
      setFormFields(fieldsMap);

      // Load existing responses (if any client)
      // In production, the client ID would come from auth
    } catch (err) {
      console.error('Failed to load form fields:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async (templateId: string) => {
    if (!supabase) return;
    setFormSubmitting(true);
    try {
      const fields = formFields[templateId] || [];
      const responses = fields.map((f) => ({
        client_id: MOCK_CLIENT_ID || null,
        office_id: OFFICE_ID,
        template_id: templateId,
        field_id: f.id,
        field_label: f.label,
        field_type: f.field_type,
        response_text: formValues[f.id] || '',
      })).filter((r) => r.response_text);

      if (responses.length > 0) {
        await supabase.from('form_responses').insert(responses);
      }

      setFormSubmitted((prev) => ({ ...prev, [templateId]: true }));
    } catch (err) {
      console.error('Failed to submit form:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formValues[field.id] || '';
    const onChange = (val: string) => setFormValues((prev) => ({ ...prev, [field.id]: val }));

    switch (field.field_type) {
      case 'TEXT':
        return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />;
      case 'PARAGRAPH':
        return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />;
      case 'FILE':
        return (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-[#ea580c] transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-500">{'\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E'}</p>
          </div>
        );
      case 'DROPDOWN':
        const options = field.options ? field.options.split(',').map((o) => o.trim()) : [];
        return (
          <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30">
            <option value="">{'\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044'}</option>
            {options.map((o) => (<option key={o} value={o}>{o}</option>))}
          </select>
        );
      case 'DATE':
        return <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />;
      case 'CHECKBOX':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : 'false')} className="rounded border-slate-300 text-[#ea580c] focus:ring-[#ea580c]" />
            <span className="text-sm text-slate-700">{field.description || ''}</span>
          </label>
        );
      case 'RADIO':
        const radioOptions = field.options ? field.options.split(',').map((o) => o.trim()) : [];
        return (
          <div className="space-y-2">
            {radioOptions.map((o) => (
              <label key={o} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={field.id} value={o} checked={value === o} onChange={() => onChange(o)} className="border-slate-300 text-[#ea580c] focus:ring-[#ea580c]" />
                <span className="text-sm text-slate-700">{o}</span>
              </label>
            ))}
          </div>
        );
      default:
        return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Portal Header (no sidebar) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">{'\u682A\u5F0F\u4F1A\u793E\u30B5\u30AF\u30E9\u30C6\u30C3\u30AF'}</h1>
              <p className="text-[10px] text-slate-400">{'\u9867\u554F\u5148\u30DE\u30A4\u30DA\u30FC\u30B8'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Bell className="w-4 h-4" />
            <User className="w-4 h-4" />
            <span>{'\u7530\u4E2D\u4E00\u90CE'}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[900px] mx-auto flex gap-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
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
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-6">
        {/* ========= HOME TAB ========= */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-700">{'\u4ECA\u6708\u306E\u51E6\u7406\u9032\u6357'}</h2>
                <span className="text-lg font-bold text-emerald-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs text-slate-400">{requiredDocs.length}{'\u4EF6\u4E2D'}{doneCount}{'\u4EF6\u63D0\u51FA\u6E08\u307F'}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-500" /></div>
                <div>
                  <p className="text-xs text-slate-400">{'\u6B21\u306E\u671F\u9650'}</p>
                  <p className="text-sm font-bold text-slate-800">{'4\u67085\u65E5: \u8CC7\u6599\u63D0\u51FA\u671F\u9650'}</p>
                  <p className="text-xs text-slate-400">{'\u9280\u884C\u660E\u7D30\u30FB\u30AF\u30EC\u30AB\u660E\u7D30\u304C\u672A\u63D0\u51FA\u3067\u3059'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-sm font-bold text-slate-700">{'\u304A\u77E5\u3089\u305B'}</h2></div>
              <div className="divide-y divide-slate-50">
                <div className="px-6 py-4 flex items-start gap-3 hover:bg-slate-50 cursor-pointer"><div className="w-2 h-2 rounded-full bg-[#ea580c] mt-1.5 flex-shrink-0" /><div><p className="text-sm text-slate-700">{'IT\u5C0E\u5165\u88DC\u52A9\u91D1\u306E\u52DF\u96C6\u304C\u59CB\u307E\u308A\u307E\u3057\u305F'}</p><p className="text-xs text-slate-400">{'2026-03-20 | \u6700\u5927450\u4E07\u5186\u306E\u88DC\u52A9\u304C\u53D7\u3051\u3089\u308C\u307E\u3059\u3002'}</p></div></div>
                <div className="px-6 py-4 flex items-start gap-3 hover:bg-slate-50 cursor-pointer"><div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><div><p className="text-sm text-slate-700">{'3\u6708\u5206\u306E\u6708\u6B21\u5831\u544A\u66F8\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u307E\u3057\u305F'}</p><p className="text-xs text-slate-400">{'2026-03-15 | \u300C\u30D5\u30A9\u30FC\u30E0\u30FB\u78BA\u8A8D\u300D\u30BF\u30D6\u304B\u3089\u3054\u78BA\u8A8D\u3044\u305F\u3060\u3051\u307E\u3059\u3002'}</p></div></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold text-slate-700 mb-3">{'\u62C5\u5F53\u8005\u60C5\u5831'}</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ea580c]/10 flex items-center justify-center text-sm font-bold text-[#ea580c]">{'\u5C71\u7530'}</div>
                <div><p className="text-sm font-medium text-slate-700">{'\u5C71\u7530 \u592A\u90CE'}</p><p className="text-xs text-slate-400">{'\u30B5\u30F3\u30D7\u30EB\u4F1A\u8A08\u4E8B\u52D9\u6240'}</p><p className="text-xs text-slate-400">yamada@sample-tax.co.jp</p></div>
              </div>
            </div>
          </div>
        )}

        {/* ========= UPLOAD TAB ========= */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-sm font-bold text-slate-700">{'\u4ECA\u6708\u63D0\u51FA\u304C\u5FC5\u8981\u306A\u66F8\u985E'}</h2></div>
              <div className="p-4 space-y-2">{requiredDocs.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 px-4 bg-slate-50 rounded-lg">
                  {doc.done ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />}
                  <span className={`text-sm ${doc.done ? 'text-slate-500 line-through' : 'text-slate-700 font-medium'}`}>{doc.label}</span>
                  {!doc.done && <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{'\u672A\u63D0\u51FA'}</span>}
                </div>
              ))}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[#ea580c] transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600 mb-1">{'\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30E9\u30C3\u30B0&\u30C9\u30ED\u30C3\u30D7\u3001\u307E\u305F\u306F\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9'}</p>
                <p className="text-xs text-slate-400">{'PDF, XLSX, CSV, JPG, PNG\u306B\u5BFE\u5FDC'}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-sm font-bold text-slate-700">{'\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u6E08\u307F\u30D5\u30A1\u30A4\u30EB'}</h2></div>
              <div className="divide-y divide-slate-50">{uploadedFiles.map((file) => (
                <div key={file.name} className="px-6 py-3.5 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="flex-1 text-sm text-slate-700">{file.name}</span>
                  <span className="text-xs text-slate-400">{file.size}</span>
                  <span className="text-xs text-slate-400">{file.date}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${file.status === '\u78BA\u8A8D\u6E08' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{file.status}</span>
                </div>
              ))}</div>
            </div>
          </div>
        )}

        {/* ========= MESSAGE TAB ========= */}
        {activeTab === 'message' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="space-y-3 mb-4">{chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${msg.from === 'client' ? 'bg-[#ea580c] text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <p className="text-xs font-medium mb-0.5 opacity-70">{msg.name}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</p>
                </div>
              </div>
            ))}</div>
            <div className="flex gap-2">
              <input type="text" placeholder={'\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...'} className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30" />
              <button className="bg-[#ea580c] text-white rounded-lg px-4 py-2.5 hover:bg-[#c2410c] transition-colors"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* ========= FORMS & CONFIRM TAB ========= */}
        {activeTab === 'forms' && (
          <div className="space-y-6">
            {/* Forms Section */}
            {formLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : Object.keys(formFields).length > 0 ? (
              Object.entries(formFields).map(([templateId, fields]) => (
                <div key={templateId} className="bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-700">{templateId}</h2>
                      <p className="text-xs text-slate-400">{fields.length}{'\u9805\u76EE'}</p>
                    </div>
                    {formSubmitted[templateId] && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{'\u63D0\u51FA\u6E08'}</span>}
                  </div>
                  {formSubmitted[templateId] ? (
                    <div className="p-6 text-center text-emerald-600">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">{'\u56DE\u7B54\u3092\u63D0\u51FA\u3057\u307E\u3057\u305F'}</p>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {fields.map((field) => (
                        <div key={field.id}>
                          <label className="text-xs font-medium text-slate-500 block mb-1">
                            {field.label}
                            {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
                          </label>
                          {field.description && <p className="text-[10px] text-slate-400 mb-1">{field.description}</p>}
                          {renderFormField(field)}
                        </div>
                      ))}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleFormSubmit(templateId)}
                          disabled={formSubmitting}
                          className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                        >
                          {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {formSubmitting ? '\u63D0\u51FA\u4E2D...' : '\u63D0\u51FA'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center text-slate-400">
                <FileInput className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{'\u73FE\u5728\u56DE\u7B54\u304C\u5FC5\u8981\u306A\u30D5\u30A9\u30FC\u30E0\u306F\u3042\u308A\u307E\u305B\u3093'}</p>
              </div>
            )}

            {/* Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-sm font-bold text-slate-700">{'\u8ACB\u6C42\u66F8'}</h2></div>
              <div className="divide-y divide-slate-50">{portalInvoices.map((inv) => (
                <div key={inv.number} className="px-6 py-3.5 flex items-center gap-4">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">{inv.number}</span>
                  <span className="flex-1 text-sm text-slate-500">{'\u00A5'}{inv.amount.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">{inv.date}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{inv.status}</span>
                </div>
              ))}</div>
            </div>

            {/* Processing rules */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#ea580c]" /><h2 className="text-sm font-bold text-slate-700">{'\u51E6\u7406\u30EB\u30FC\u30EB'}</h2></div>
                <p className="text-xs text-slate-400 mt-0.5">{'\u5FA1\u793E\u306E\u53D6\u5F15\u306B\u57FA\u3065\u304D\u3001AI\u304C\u5B66\u7FD2\u3057\u305F\u4ED5\u8A33\u30EB\u30FC\u30EB\u3067\u3059\u3002'}</p>
              </div>
              <div className="p-4 space-y-2">{processingRules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-[#fff7ed] border-l-4 border-[#ea580c] rounded-r-lg">
                  <span className="text-sm text-slate-700">{rule.condition} {'\u2192'} {rule.account}</span>
                  <span className="text-xs text-slate-400">{'\u78BA\u4FE1\u5EA6'} {rule.confidence}%</span>
                </div>
              ))}</div>
            </div>

            {/* Subsidies */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-sm font-bold text-slate-700">{'\u8A72\u5F53\u88DC\u52A9\u91D1\u60C5\u5831'}</h2></div>
              <div className="p-4 space-y-3">{relevantSubsidies.map((sub) => (
                <div key={sub.name} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <div><p className="text-sm font-medium text-slate-700">{sub.name}</p><p className="text-xs text-slate-400">{sub.maxAmount} | {'\u7DE0\u5207'}: {sub.deadline}</p></div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
