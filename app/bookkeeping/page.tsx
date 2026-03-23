"use client";

import React, { useState } from "react";
import { ocrResults } from "@/data/ocr-results";
import { aiLearningRules } from "@/data/ai-learning-rules";
import { Upload, HardDrive, ScanLine, CheckCircle2, AlertTriangle, Clock, Copy, ArrowRightLeft, Hash, Search, BrainCircuit, X } from "lucide-react";

const steps = [
  { label: "アップロード", icon: Upload },
  { label: "OCR読取", icon: ScanLine },
  { label: "AI仕訳候補", icon: BrainCircuit },
  { label: "確認・修正", icon: Search },
  { label: "承認", icon: CheckCircle2 },
  { label: "記帳完了", icon: CheckCircle2 },
];

const statusBadge: Record<string, { color: string; icon: React.ElementType }> = {
  "確認済": { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  "要確認": { color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
  "処理中": { color: "bg-blue-100 text-blue-700", icon: Clock },
};

const ruleStatusBadge: Record<string, string> = {
  "承認済": "bg-green-100 text-green-700",
  "要確認": "bg-yellow-100 text-yellow-700",
  "新規候補": "bg-blue-100 text-blue-700",
};

export default function BookkeepingPage() {
  const [showLearningModal, setShowLearningModal] = useState(false);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">記帳・OCR</h2>

      {/* Upload Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-5">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-orange-400 transition-colors">
          <Upload size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium mb-1">ファイルをドラッグ&ドロップ</p>
          <p className="text-xs text-[#64748b] mb-4">PDF, JPG, PNG, CSV対応 (最大20MB)</p>
          <div className="flex items-center justify-center gap-3">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
              ファイルを選択
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <HardDrive size={14} />
              Google Driveから選択
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <ScanLine size={14} />
              スキャナー連携
            </button>
          </div>
        </div>
      </div>

      {/* AI-OCR Process Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-5">
        <h3 className="text-sm font-semibold text-[#64748b] mb-4">AI-OCR処理フロー</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= 2 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                  <step.icon size={18} />
                </div>
                <span className={`text-xs font-medium ${i <= 2 ? "text-orange-600" : "text-gray-400"}`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < 2 ? "bg-orange-300" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Quality Check Buttons */}
      <div className="flex gap-3 mb-5">
        <button className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-orange-300 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Copy size={18} className="text-red-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">重複チェック</p>
            <p className="text-xs text-[#64748b]">同一仕訳の検出</p>
          </div>
        </button>
        <button className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-orange-300 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <ArrowRightLeft size={18} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">突合チェック</p>
            <p className="text-xs text-[#64748b]">通帳と帳簿の突合</p>
          </div>
        </button>
        <button className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-orange-300 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Hash size={18} className="text-green-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">インボイス番号検証</p>
            <p className="text-xs text-[#64748b]">登録番号の有効性確認</p>
          </div>
        </button>
      </div>

      {/* OCR Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">処理結果</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">証憑種別</th>
              <th className="px-4 py-3 font-medium">取引先</th>
              <th className="px-4 py-3 font-medium">日付</th>
              <th className="px-4 py-3 font-medium">金額</th>
              <th className="px-4 py-3 font-medium">勘定科目</th>
              <th className="px-4 py-3 font-medium">インボイス</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ocrResults.map((r) => {
              const badge = statusBadge[r.status];
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}>
                      <badge.icon size={12} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{r.documentType}</td>
                  <td className="px-4 py-3 text-sm">{r.vendor}</td>
                  <td className="px-4 py-3 text-sm">{r.date}</td>
                  <td className="px-4 py-3 text-sm font-medium">{r.amount.toLocaleString()}円</td>
                  <td className="px-4 py-3 text-sm">{r.account}</td>
                  <td className="px-4 py-3 text-xs font-mono">{r.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">確認</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Learning Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold">AI学習ルール</h3>
          </div>
          <button
            onClick={() => setShowLearningModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
          >
            過去データから学習
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
              <th className="px-4 py-3 font-medium">顧問先</th>
              <th className="px-4 py-3 font-medium">条件</th>
              <th className="px-4 py-3 font-medium">仕訳先</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">確信度</th>
              <th className="px-4 py-3 font-medium">適用回数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {aiLearningRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{rule.clientName}</td>
                <td className="px-4 py-3 text-sm">{rule.condition}</td>
                <td className="px-4 py-3 text-sm">{rule.account}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ruleStatusBadge[rule.status]}`}>{rule.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${rule.confidence}%` }} />
                    </div>
                    <span className="text-xs text-[#64748b]">{rule.confidence}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{rule.appliedCount}回</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-sm text-[#64748b]">
          <HardDrive size={14} />
          <span>Google Drive保存先: 顧問先別 / 年度 / 証憑種別</span>
        </div>
      </div>

      {/* Learning Modal */}
      {showLearningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowLearningModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-[480px]">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">過去データから学習</h3>
              <button onClick={() => setShowLearningModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">対象顧問先</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option>全顧問先</option>
                  <option>株式会社サクラテック</option>
                  <option>株式会社ヤマダHD</option>
                  <option>株式会社マルハシ商事</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">学習期間</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option>過去6ヶ月</option>
                  <option>過去1年</option>
                  <option>過去2年</option>
                  <option>全期間</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">最低確信度</label>
                <input type="range" min="50" max="100" defaultValue="70" className="w-full" />
                <div className="flex justify-between text-xs text-[#64748b]">
                  <span>50%</span>
                  <span>70%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowLearningModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">キャンセル</button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">学習開始</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
