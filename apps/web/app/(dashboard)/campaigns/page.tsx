'use client';

import { useEffect, useState } from 'react';
import { formatSAR } from '../../../lib/utils';
import api from '../../../lib/api';
import { AddCampaignModal } from '../../../components/dashboard/AddCampaignModal';

const platformEmoji: Record<string, string> = { SNAPCHAT: '👻', TIKTOK: '🎵', INSTAGRAM: '📸', X: '🐦' };

interface FeedCampaign {
  id: string;
  title: string;
  description?: string;
  brandName: string;
  brandEmoji?: string;
  brandColor?: string;
  contentType: string;
  estimatedCredit: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<FeedCampaign[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; emoji?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      // Same endpoint the mobile app reads → web & mobile stay in sync
      const [feedRes, brandsRes] = await Promise.all([
        api.get('/campaigns/feed'),
        api.get('/brands'),
      ]);
      setCampaigns(feedRes.data.data || []);
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
        <h1 className="text-2xl font-black text-gray-900">الحملات النشطة</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ حملة جديدة</button>
      </div>

      <p className="text-sm text-gray-500 -mt-3">
        كل حملة هنا منشورة فعلياً وتظهر مباشرة في تطبيق المستخدمين 📱
      </p>

      {loading && <div className="card text-center text-gray-400 py-10">جاري التحميل...</div>}

      {error && !loading && (
        <div className="card bg-amber-50 border border-amber-200 text-amber-800 text-right">{error}</div>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-3">لا توجد حملات نشطة بعد</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>أنشئ أول حملة</button>
        </div>
      )}

      <div className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="card flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                 style={{ backgroundColor: (c.brandColor || '#1B3A7A') + '20' }}>
              {c.brandEmoji || '🎯'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-active">نشطة</span>
                <span className="text-xs text-gray-400">{c.brandName}</span>
              </div>
              <h3 className="font-bold text-gray-900">{c.title}</h3>
              {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.description}</p>}
            </div>
            <div className="text-left min-w-[120px]">
              <p className="text-xs text-gray-500">نوع المحتوى</p>
              <p className="font-semibold text-gray-900">{c.contentType}</p>
            </div>
          </div>
        ))}
      </div>

      <AddCampaignModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={load}
        brands={brands}
      />
    </div>
  );
}
