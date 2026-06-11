'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useMe } from '../../lib/useMe';

export function TopBar() {
  const { me, isAdmin, myBrands } = useMe();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) setBrandOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  const displayName = me?.name?.trim()
    || (isAdmin ? 'مدير المنصة' : me?.role === 'brand_manager' ? 'صاحب براند' : 'الحساب');
  const roleLabel = isAdmin ? '👑 أدمن' : me?.role === 'brand_manager' ? '🏷️ صاحب براند' : '👤 مستخدم';
  const initial = displayName.charAt(0) || 'م';

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          placeholder="بحث..."
          className="border border-gray-200 rounded-xl pr-10 pl-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Brand switcher — for owners managing more than one brand */}
        {!isAdmin && myBrands.length > 1 && (
          <div className="relative" ref={brandRef}>
            <button onClick={() => setBrandOpen((o) => !o)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <ChevronDown size={14} className="text-gray-400" />
              <span>برانداتي ({myBrands.length})</span>
            </button>
            {brandOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <p className="px-4 py-1 text-[11px] text-gray-400 text-right">اختر البراند للدخول إليه</p>
                {myBrands.map((b) => (
                  <button key={b.id}
                    onClick={() => { setBrandOpen(false); router.push(`/brands/${b.id}`); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-right">
                    <span className="text-lg">{b.emoji || '🏷️'}</span>
                    <span className="flex-1 text-right">{b.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Account dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
          >
            <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700 leading-tight">{displayName}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{roleLabel}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: '#1B3A7A' }}>
              {initial}
            </div>
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-400" dir="ltr">{me?.phone || ''}</p>
              </div>
              <Link href="/settings" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings size={16} className="text-gray-400" />
                الإعدادات
              </Link>
              <button onClick={logout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
