'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../lib/api';
import { MetricCard } from '../../../../components/dashboard/MetricCard';
import { AddCampaignModal } from '../../../../components/dashboard/AddCampaignModal';
import { AddSessionModal } from '../../../../components/dashboard/AddSessionModal';
import { formatSAR, formatNumber } from '../../../../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PLATFORM_COLORS: Record<string, string> = {
  SNAPCHAT: '#FFFC00',
  TIKTOK: '#000000',
  INSTAGRAM: '#E1306C',
  X: '#1DA1F2',
};

export default function BrandDashboardPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [showCampaign, setShowCampaign] = useState(false);
  const [showSession, setShowSession] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['brand-dashboard', brandId],
    queryFn: () => api.get(`/brands/${brandId}/dashboard`).then((r) => r.data.data),
  });

  // This brand's campaigns (for the live-session modal selector)
  const { data: myCampaigns, refetch: refetchCampaigns } = useQuery({
    queryKey: ['brand-campaigns', brandId],
    queryFn: () =>
      api.get('/campaigns/managed').then((r) =>
        (r.data.data || [])
          .filter((c: any) => c.brandId === brandId)
          .map((c: any) => ({ id: c.id, title: c.title, brandId: c.brandId })),
      ),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const brand = data?.brand;
  const metrics = data?.metrics;

  const platformData = [
    { name: 'Snapchat', value: 45, color: PLATFORM_COLORS.SNAPCHAT },
    { name: 'TikTok', value: 30, color: PLATFORM_COLORS.TIKTOK },
    { name: 'Instagram', value: 20, color: PLATFORM_COLORS.INSTAGRAM },
    { name: 'X', value: 5, color: PLATFORM_COLORS.X },
  ];

  const postsOverTime = Array.from({ length: 7 }, (_, i) => ({
    day: ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'][i],
    posts: Math.floor(Math.random() * 200 + 50),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: brand?.color || '#e5e7eb' }}
          >
            {brand?.emoji || '🏷'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{brand?.name || 'البراند'}</h1>
            <p className="text-gray-500 text-sm">{brand?.sector}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSession(true)} className="btn-secondary">
            📺 جلسة بث مباشر
          </button>
          <button onClick={() => setShowCampaign(true)} className="btn-primary">
            + حملة جديدة
          </button>
        </div>
      </div>

      {/* Create modals — scoped to THIS brand */}
      <AddCampaignModal
        open={showCampaign}
        onClose={() => setShowCampaign(false)}
        onCreated={() => { refetch(); refetchCampaigns(); }}
        brands={brand ? [{ id: brand.id, name: brand.name, emoji: brand.emoji }] : []}
      />
      <AddSessionModal
        open={showSession}
        onClose={() => setShowSession(false)}
        onCreated={() => { refetch(); }}
        campaigns={myCampaigns || []}
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="منشورات هذا الشهر"
          value={formatNumber(metrics?.postsThisMonth ?? 0)}
          icon="📝"
          color="blue"
        />
        <MetricCard
          title="الوصول التقديري"
          value={formatNumber(metrics?.estimatedReach ?? 0)}
          icon="👁"
          color="purple"
        />
        <MetricCard
          title="الرصيد الموزع"
          value={formatSAR(metrics?.creditsDistributed ?? 0)}
          icon="💰"
          color="green"
        />
        <MetricCard
          title="استخدام الميزانية"
          value={`${(metrics?.budgetUtilization ?? 0).toFixed(1)}%`}
          icon="📊"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-4">المنشورات عبر الوقت</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={postsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="posts" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">توزيع المنصات</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {platformData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                formatter={(v) => <span style={{ fontFamily: 'Cairo', fontSize: 12 }}>{v}</span>}
              />
              <Tooltip formatter={(v: number) => [`${v}%`, 'النسبة']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: `/brands/${brandId}/campaigns`, label: 'الحملات', icon: '🚀', count: metrics?.activeCampaigns },
          { href: `/sessions`, label: 'الجلسات', icon: '📺', count: undefined },
          { href: `/brands/${brandId}/posts`, label: 'سجل المنشورات', icon: '📋', count: metrics?.postsThisMonth },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer"
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="font-bold text-gray-900">{item.label}</p>
              {item.count !== undefined && (
                <p className="text-sm text-gray-500">{formatNumber(item.count)} إجمالي</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
