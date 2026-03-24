'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  ClipboardList,
  BadgeJapaneseYen,
  BookOpen,
  Settings,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/revenue', label: 'Revenue', icon: BadgeJapaneseYen },
  { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/admin', label: 'Admin', icon: Settings },
];

const portalItem = { href: '/portal', label: 'Portal', icon: ExternalLink };

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 w-[240px] h-screen bg-[#1a2744] text-white flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-wide leading-tight">TAX PARTNER</div>
            <div className="text-[10px] text-white/50 tracking-widest">Powered by Rit</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{item.label === 'Home' ? '\u30DB\u30FC\u30E0' : item.label === 'Clients' ? '\u9867\u554F\u5148' : item.label === 'Tasks' ? '\u696D\u52D9\u30DC\u30FC\u30C9' : item.label === 'Revenue' ? '\u53CE\u76CA\u30FB\u30DE\u30C3\u30C1\u30F3\u30B0' : item.label === 'Knowledge' ? '\u30CA\u30EC\u30C3\u30B8' : item.label === 'Admin' ? '\u7BA1\u7406' : item.label}</span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3 border-t border-white/10" />

        {/* Portal */}
        {(() => {
          const Icon = portalItem.icon;
          const isActive = pathname.startsWith(portalItem.href);
          return (
            <Link
              href={portalItem.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#ea580c]/20 text-[#fb923c]'
                  : 'text-white/50 hover:bg-white/8 hover:text-white/80'
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{'\u9867\u554F\u5148\u30DE\u30A4\u30DA\u30FC\u30B8'}</span>
            </Link>
          );
        })()}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ea580c]/80 flex items-center justify-center text-xs font-bold">
            {'\u5C71\u7530'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{'\u30B5\u30F3\u30D7\u30EB\u4F1A\u8A08\u4E8B\u52D9\u6240'}</div>
            <div className="text-[11px] text-white/40 truncate">{'\u5C71\u7530 \u592A\u90CE / \u7BA1\u7406\u8005'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
