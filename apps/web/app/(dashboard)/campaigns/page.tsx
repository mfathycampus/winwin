'use client';

import { useEffect, useState } from 'react';
import { formatSAR } from '../../../lib/utils';
import api from '../../../lib/api';
import { AddCampaignModal } from '../../../components/dashboard/AddCampaignModal';

const platformEmoji: Record<string, string> = { SNAPCHAT: '👻', TIKTOK: '🎵', INSTAGRAM: '📸', X: '🐦' };
const statusMap: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'نشطة', cls: 'bg-green-100 text-green-700' },
  DRAFT:  { label: 'مسودة', cls: 'bg-gray-100 text-gray-600' },
  PAUSED: { label: 'موقوفة', cls: 'bg-amber-100 text-amber-700' },
  ENDED:  { label: 'منتهية', cls: 'bg-gray-100 text-gray-500' },
};

interface Campaign {
  id: string;
  title: string;
  description?: string;
  status: string;
  brandName: string;
  brandEmoji?: string;
  brandColor?: string;
  totalBudget: number;
  spentBudget: number;
  platforms: string[];
  postsCount: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; emoji?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const [campaignsRes, brandsRes] = await Promise.all([
        api.get('/campaigns/managed'), // role-scoped: admin → all, owner → only theirs
        api.get('/brands'),
      ]);
      setCampaigns(campaignsRes.data.data || []);
      setBrands(brandsRes.data.data || []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'تعذّر تحميل الحملات. سجّل الدخول أولاً.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">الحملات</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ حملة جديدة</button>
      </div>

      <p className="text-sm text-gray-500 -mt-3">
        الحملات النشطة تظهر مباشرة في تطبيق المستخدمين 📱
      </p>

      {loading && <div className="card text-center text-gray-400 py-10">جاري التحميل...</div>}
      {error && !loading && (
        <div className="card bg-amber-50 border border-amber-200 text-amber-800 text-right">{error}</div>
      )}
      {!loading && !error && campaigns.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-3">لا توجد حملات بعد</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>أنشئ أول حملة</button>
        </div>
      )}

      <div className="space-y-3">
        {campaigns.map((c) => {
          const st = statusMap[c.status] || statusMap.DRAFT;
          const pct = c.totalBudget ? Math.round((c.spentBudget / c.totalBudget) * 100) : 0;
          return (
            <div key={c.id} className="card flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                   style={{ backgroundColor: (c.brandColor || '#1B3A7A') + '20' }}>
                {c.brandEmoji || '🎯'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                  <span className="text-xs text-gray-400">{c.brandName}</span>
                  {c.platforms.map((p) => <span key={p} title={p}>{platformEmoji[p]}</span>)}
                </div>
                <h3 className="font-bold text-gray-900">{c.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{c.postsCount} منشور</p>
              </div>
              <div className="text-left min-w-[140px]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">الإنفاق</span><span className="font-semibold">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-left">{formatSAR(c.spentBudget)} / {formatSAR(c.totalBudget)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <AddCampaignModal open={showModal} onClose={() => setShowModal(false)} onCreated={load} brands={brands} />
    </div>
  );
}
