"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ScanLine,
  GitBranch,
  Receipt,
  FolderOpen,
  BrainCircuit,
  BookOpen,
  Building2,
  Monitor,
  GraduationCap,
  Link as LinkIcon,
  Settings,
  User,
} from "lucide-react";

const mainNav = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/clients", label: "顧客管理", icon: Users },
  { href: "/tasks", label: "タスク管理", icon: CheckSquare, badge: 12 },
  { href: "/bookkeeping", label: "記帳・OCR", icon: ScanLine },
  { href: "/pipeline", label: "パイプライン", icon: GitBranch },
  { href: "/billing", label: "請求管理", icon: Receipt },
  { href: "/documents", label: "ドキュメント", icon: FolderOpen },
];

const toolNav = [
  { href: "/ai", label: "AI分析", icon: BrainCircuit, badge: 3 },
  { href: "/knowledge", label: "ナレッジ管理", icon: BookOpen },
  { href: "/subsidy", label: "補助金・支援制度", icon: Building2 },
];

const bottomNav = [
  { href: "/portal", label: "クライアントポータル", icon: Monitor },
  { href: "/learning", label: "ラーニング", icon: GraduationCap },
  { href: "/integrations", label: "連携管理", icon: LinkIcon },
  { href: "/settings", label: "設定", icon: Settings },
];

const NavItem: React.FC<{
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  active: boolean;
}> = ({ href, label, icon: Icon, badge, active }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors relative ${
      active
        ? "bg-orange-600/20 text-orange-400 border-l-2 border-orange-500"
        : "text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
    }`}
  >
    <Icon size={18} />
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="bg-orange-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
        {badge}
      </span>
    )}
  </Link>
);

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col" style={{ backgroundColor: "#1a2744" }}>
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold text-white">TAX PARTNER</h1>
        <p className="text-xs text-gray-400 mt-0.5">Powered by Rit</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="space-y-0.5">
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        <div className="border-t border-white/10 my-3" />

        <div className="space-y-0.5">
          {toolNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        <div className="border-t border-white/10 my-3" />

        <div className="space-y-0.5">
          {bottomNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-600/30 flex items-center justify-center">
            <User size={18} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">サンプル会計事務所</p>
            <p className="text-xs text-gray-400 truncate">山田 太郎 / 管理者</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
