'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../../lib/api';
import { MetricCard } from '../../../components/dashboard/MetricCard';
import { formatSAR, formatNumber, formatDate } from '../../../lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('/brands/company/company_id_placeholder').then((r) => r.data.data),
  });

  const mockMetrics = {
    totalPosts: 1247,
    totalReach: 2800000,
    totalCredits: 48200,
    activeCampaigns: 7,
  };

  const chartData = [
    { name: 'السبت', posts: 180 },
    { name: 'الأحد', posts: 220 },
    { name: 'الاثنين', posts: 195 },
    { name: 'الثلاثاء', posts: 280 },
    { name: 'الأربعاء', posts: 310 },
    { name: 'الخميس', posts: 420 },
    { name: 'الجمعة', posts: 380 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">نظرة عامة</h1>
          <p className="text-gray-500 text-sm mt-1">مرحباً بك في لوحة التحكم</p>
        </div>
        <Link href="/brands/new" className="btn-primary">
          + إضافة براند
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="إجمالي المنشورات هذا الشهر"
          value={formatNumber(mockMetrics.totalPosts)}
          icon="📝"
          color="blue"
          trend={{ value: 23, label: 'مقارنة بالشهر الماضي' }}
        />
        <MetricCard
          title="الوصول التقديري"
          value={formatNumber(mockMetrics.totalReach)}
          icon="👁"
          color="purple"
          trend={{ value: 18, label: 'مقارنة بالشهر الماضي' }}
        />
        <MetricCard
          title="الرصيد الموزع (ريال)"
          value={formatSAR(mockMetrics.totalCredits)}
          icon="💰"
          color="green"
          trend={{ value: 31, label: 'مقارنة بالشهر الماضي' }}
        />
        <MetricCard
          title="الحملات النشطة"
          value={mockMetrics.activeCampaigns}
          icon="🚀"
          color="orange"
        />
      </div>

      {/* Chart */}
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

      {/* Brands overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">البراندات</h3>
          <Link href="/brands" className="text-sm text-primary-600 font-semibold">
            عرض الكل
          </Link>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Almarai Juice', sector: 'أغذية ومشروبات', emoji: '🥤', budget: 50000, spent: 28000 },
            { name: 'STC Pay', sector: 'مالية وتقنية', emoji: '💳', budget: 80000, spent: 45000 },
            { name: 'Extra Stores', sector: 'تجزئة', emoji: '🛒', budget: 35000, spent: 12000 },
          ].map((brand) => (
            <div key={brand.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-xl">
                {brand.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{brand.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatSAR(brand.spent)} / {formatSAR(brand.budget)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${(brand.spent / brand.budget) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
