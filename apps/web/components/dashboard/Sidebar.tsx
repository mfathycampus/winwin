'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Megaphone, Clock, FileText,
  Settings, CreditCard, Users, LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',  label: 'نظرة عامة',          icon: LayoutDashboard },
  { href: '/brands',     label: 'البراندات',           icon: Users },
  { href: '/campaigns',  label: 'الحملات',             icon: Megaphone },
  { href: '/sessions',   label: 'البث المباشر',        icon: Clock },
  { href: '/posts',      label: 'سجل المنشورات',       icon: FileText },
  { href: '/billing',    label: 'الفواتير والاشتراك',  icon: CreditCard },
  { href: '/settings',   label: 'الإعدادات',           icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full flex flex-col" style={{ backgroundColor: '#0E2254' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex flex-col items-center gap-1">
          <div dir="ltr" className="flex items-center justify-center">
            <span className="font-black text-2xl text-white" style={{ letterSpacing: 1 }}>WIN</span>
            <span className="font-black text-2xl" style={{ color: '#22C55E' }}>و</span>
            <span className="font-black text-2xl text-white" style={{ letterSpacing: 1 }}>WIN</span>
          </div>
          <p className="text-xs font-semibold" style={{ color: '#22C55E' }}>وينوين · WINWIN</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                active
                  ? 'text-white'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/10',
              )}
              style={active ? { backgroundColor: '#C9922A' } : {}}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-200/70 hover:text-white hover:bg-white/10 w-full transition-all"
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
