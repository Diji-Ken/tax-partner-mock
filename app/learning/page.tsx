"use client";

import React from "react";
import { BrainCircuit, Calculator, BarChart3, Rocket, Wallet, Receipt, PlayCircle } from "lucide-react";

const courses = [
  { title: "AI活用基礎", icon: BrainCircuit, modules: 8, progress: 75, color: "bg-purple-50 text-purple-600", description: "ChatGPT・Claude等のAIツールを会計業務に活用する方法" },
  { title: "freee活用マスター", icon: Calculator, modules: 12, progress: 60, color: "bg-green-50 text-green-600", description: "freee会計の効率的な使い方、API連携、自動化設定" },
  { title: "MF活用マスター", icon: BarChart3, modules: 10, progress: 40, color: "bg-blue-50 text-blue-600", description: "マネーフォワードクラウドの全機能活用ガイド" },
  { title: "DX推進実践", icon: Rocket, modules: 6, progress: 20, color: "bg-orange-50 text-orange-600", description: "会計事務所のDX推進ステップと成功事例" },
  { title: "融資支援ノウハウ", icon: Wallet, modules: 8, progress: 0, color: "bg-yellow-50 text-yellow-600", description: "融資支援の基礎から実践まで、事業計画書の作成支援" },
  { title: "インボイス対応", icon: Receipt, modules: 5, progress: 100, color: "bg-red-50 text-red-600", description: "インボイス制度の最新情報と実務対応ガイド" },
];

export default function LearningPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">ラーニング</h2>

      <div className="grid grid-cols-3 gap-5">
        {courses.map((course) => (
          <div key={course.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-orange-300 transition-colors">
            <div className={`w-12 h-12 rounded-xl ${course.color} flex items-center justify-center mb-4`}>
              <course.icon size={24} />
            </div>
            <h3 className="text-base font-semibold mb-1">{course.title}</h3>
            <p className="text-xs text-[#64748b] mb-4">{course.description}</p>
            <div className="flex items-center justify-between text-xs text-[#64748b] mb-2">
              <span>{course.modules}モジュール</span>
              <span>{course.progress}%完了</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mb-4">
              <div
                className={`h-full rounded-full ${course.progress === 100 ? "bg-green-500" : "bg-orange-500"}`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
              <PlayCircle size={14} />
              {course.progress === 0 ? "学習を開始" : course.progress === 100 ? "復習する" : "続きから学習"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
