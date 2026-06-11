'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../../lib/api';
import { useMe } from '../../../lib/useMe';
import { MetricCard } from '../../../components/dashboard/MetricCard';
import { formatSAR } from '../../../lib/utils';
import Link from 'next/link';

interface Brand {
  id: string; name: string; sector?: string; emoji?: string; color?: string;
  monthlyBudget: number; spentBudget: number; _count?: { campaigns: number };
}

export default function DashboardPage() {
  const { isAdmin, loading: meLoading } = useMe();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    // Fetch independently so one failing call doesn't blank the whole page
    api.get('/brands').then((r) => setBrands(r.data.data || [])).catch(() => {});
    api.get('/campaigns/managed').then((r) => setCampaigns(r.data.data || [])).catch(() => {});
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const totalSpent = brands.reduce((s, b) => s + (b.spentBudget || 0), 0);
  const totalPosts = campaigns.reduce((s, c) => s + (c.postsCount || 0), 0);

  const chartData = [
    { name: 'السبت', posts: 180 }, { name: 'الأحد', posts: 220 }, { name: 'الاثنين', posts: 195 },
    { name: 'الثلاثاء', posts: 280 }, { name: 'الأربعاء', posts: 310 }, { name: 'الخميس', posts: 420 },
    { name: 'الجمعة', posts: 380 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">نظرة عامة</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meLoading ? '' : isAdmin ? 'لوحة الأدمن — كل البراندات' : 'لوحة برانـدك'}
          </p>
        </div>
        {isAdmin && <Link href="/brands" className="btn-primary">+ إضافة براند</Link>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="إجمالي المنشورات" value={String(totalPosts)} icon="📝" color="blue" />
        <MetricCard title={isAdmin ? 'عدد البراندات' : 'برانداتي'} value={String(brands.length)} icon="🏷️" color="purple" />
        <MetricCard title="الإنفاق (ريال)" value={formatSAR(totalSpent)} icon="💰" color="green" />
        <MetricCard title="الحملات النشطة" value={String(activeCampaigns)} icon="🚀" color="orange" />
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">المنشورات اليومية (آخر 7 أيام)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v} منشور`, 'عدد المنشورات']} />
            <Bar dataKey="posts" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{isAdmin ? 'البراندات' : 'برانـدك'}</h3>
          <Link href="/brands" className="text-sm text-primary-600 font-semibold">عرض الكل</Link>
        </div>
        <div className="space-y-3">
          {brands.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد براندات بعد</p>
          )}
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.id}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-xl">
                {brand.emoji || '🏷️'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{brand.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatSAR(brand.spentBudget)} / {formatSAR(brand.monthlyBudget)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${brand.monthlyBudget ? (brand.spentBudget / brand.monthlyBudget) * 100 : 0}%`, backgroundColor: brand.color || '#1B3A7A' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
