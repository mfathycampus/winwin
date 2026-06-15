'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../../../lib/api';
import { formatSAR, formatDate } from '../../../../../../lib/utils';

const platformEmoji: Record<string, string> = { SNAPCHAT: '👻', TIKTOK: '🎵', INSTAGRAM: '📸', X: '🐦' };
const statusMap: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'نشطة', cls: 'bg-green-100 text-green-700' },
  DRAFT:  { label: 'مسودة', cls: 'bg-gray-100 text-gray-600' },
  PAUSED: { label: 'موقوفة', cls: 'bg-amber-100 text-amber-700' },
  ENDED:  { label: 'منتهية', cls: 'bg-gray-100 text-gray-500' },
};

export default function CampaignDetailPage() {
  const { brandId, campaignId } = useParams<{ brandId: string; campaignId: string }>();
  const router = useRouter();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: () => api.get(`/campaigns/${campaignId}`).then((r) => r.data.data),
  });

  async function setStatus(status: string) {
    try {
      await api.patch(`/campaigns/${campaignId}/status`, { status });
      refetch();
    } catch (e: any) {
      alert(e.response?.data?.message || 'تعذّر تغيير الحالة');
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>;
  }

  const c = data?.campaign;
  if (!c) return <div className="card text-center py-12 text-gray-500">الحملة غير موجودة</div>;

  const st = statusMap[c.status] || statusMap.DRAFT;
  const platforms: string[] = c.adContent?.[0]?.allowedPlatforms || [];
  const pct = c.totalBudget ? Math.round((c.spentBudget / c.totalBudget) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800">← رجوع</button>

      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
              <span className="text-xs text-gray-400">{c.brand?.name}</span>
              {platforms.map((p) => <span key={p} title={p}>{platformEmoji[p]}</span>)}
            </div>
            <h1 className="text-2xl font-black text-gray-900">{c.title}</h1>
            {c.description && <p className="text-gray-500 mt-1">{c.description}</p>}
          </div>
        </div>

        {/* Status controls */}
        <div className="flex gap-2 flex-wrap">
          {c.status !== 'ACTIVE' && (
            <button onClick={() => setStatus('ACTIVE')} className="btn-primary text-sm">▶️ تفعيل الحملة</button>
          )}
          {c.status === 'ACTIVE' && (
            <button onClick={() => setStatus('PAUSED')} className="btn-secondary text-sm">⏸️ إيقاف مؤقت</button>
          )}
          {c.status !== 'ENDED' && (
            <button onClick={() => setStatus('ENDED')} className="border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">⏹️ إنهاء</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">الميزانية</p>
          <p className="text-xl font-black text-gray-900 mt-1">{formatSAR(c.totalBudget)}</p>
          <div className="h-1.5 bg-gray-100 rounded-full mt-2">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatSAR(c.spentBudget)} مُصرَف ({pct}%)</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">المنصات المسموحة</p>
          <p className="text-2xl mt-2">{platforms.map((p) => platformEmoji[p]).join(' ') || '—'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">المدة</p>
          <p className="text-sm font-semibold text-gray-900 mt-2">{formatDate(c.startDate)}</p>
          <p className="text-sm font-semibold text-gray-900">→ {formatDate(c.endDate)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        الحملة النشطة تظهر مباشرة في تطبيق المستخدمين 📱 — تابع منشوراتها من «سجل المنشورات».
      </p>
    </div>
  );
}
