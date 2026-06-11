'use client';

import { Bell, Search } from 'lucide-react';

export function TopBar() {
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
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: '#1B3A7A' }}>
            م
          </div>
          <span className="text-sm font-semibold text-gray-700">مدير الحساب</span>
        </div>
      </div>
    </header>
  );
}
