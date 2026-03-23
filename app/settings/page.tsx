"use client";

import React from "react";
import { staff } from "@/data/staff";
import { Building2, Users, Bell, Shield, CreditCard } from "lucide-react";

const notifications = [
  { label: "タスク期限リマインド", description: "タスク期限の3日前に通知", enabled: true },
  { label: "未入金アラート", description: "支払期限超過時に通知", enabled: true },
  { label: "OCR処理完了", description: "OCR処理完了時に通知", enabled: true },
  { label: "新規問い合わせ", description: "新規問い合わせ受信時に通知", enabled: true },
  { label: "月次処理完了報告", description: "月次処理完了時にクライアントへ通知", enabled: false },
  { label: "週次レポート", description: "毎週月曜日に進捗レポートを送信", enabled: false },
];

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">設定</h2>

      <div className="space-y-6">
        {/* Office Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold">事務所プロフィール</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">事務所名</label>
              <input type="text" defaultValue="サンプル会計事務所" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">代表者</label>
              <input type="text" defaultValue="山田 太郎" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">電話番号</label>
              <input type="tel" defaultValue="03-1234-5678" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">メールアドレス</label>
              <input type="email" defaultValue="info@sample-tax.co.jp" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">住所</label>
              <input type="text" defaultValue="東京都千代田区丸の内1-1-1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Staff Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Users size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold">スタッフ管理</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
                <th className="px-4 py-3 font-medium">名前</th>
                <th className="px-4 py-3 font-medium">メール</th>
                <th className="px-4 py-3 font-medium">権限</th>
                <th className="px-4 py-3 font-medium">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-sm">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.role === "管理者" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
                      {s.status === "active" ? "有効" : "無効"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold">通知設定</h3>
          </div>
          <div className="space-y-3">
            {notifications.map((notif, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{notif.label}</p>
                  <p className="text-xs text-[#64748b]">{notif.description}</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer ${notif.enabled ? "bg-orange-600" : "bg-gray-300"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${notif.enabled ? "right-0.5" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold">セキュリティ設定</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">2段階認証</p>
                <p className="text-xs text-[#64748b]">ログイン時にSMS認証を要求</p>
              </div>
              <div className="w-10 h-5 rounded-full relative cursor-pointer bg-orange-600">
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 right-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">IPアドレス制限</p>
                <p className="text-xs text-[#64748b]">許可されたIPアドレスからのみアクセス</p>
              </div>
              <div className="w-10 h-5 rounded-full relative cursor-pointer bg-gray-300">
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 left-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">自動ログアウト</p>
                <p className="text-xs text-[#64748b]">30分間操作がない場合に自動ログアウト</p>
              </div>
              <div className="w-10 h-5 rounded-full relative cursor-pointer bg-orange-600">
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 right-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold">プラン情報</h3>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm font-semibold text-orange-700">スタンダードプラン</p>
            <p className="text-xs text-[#64748b] mt-1">全機能利用可能 / 顧問先数無制限 / スタッフ10名まで</p>
          </div>
        </div>
      </div>
    </div>
  );
}
