'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import api from '../../lib/api';

const PLATFORMS = [
  { key: 'SNAPCHAT',  label: '👻 سناب شات', mult: '×2.0' },
  { key: 'TIKTOK',    label: '🎵 تيك توك',  mult: '×1.8' },
  { key: 'INSTAGRAM', label: '📸 إنستغرام', mult: '×1.5' },
  { key: 'X',         label: '🐦 إكس',       mult: '×1.0' },
];

const CONTENT_TYPES = [
  { key: 'IMAGE', label: '🖼️ صورة' },
  { key: 'VIDEO', label: '🎬 فيديو' },
  { key: 'BOTH',  label: '🖼️🎬 صورة وفيديو' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  // The brand the campaign belongs to. Defaults to the seeded demo brand.
  brandId?: string;
  brandName?: string;
}

export function AddCampaignModal({
  open,
  onClose,
  onCreated,
  brandId = 'brand_almarai_001',
  brandName = 'Almarai Juice 🥤',
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: '',
    description: '',
    contentType: 'IMAGE',
    startDate: today,
    endDate: in30,
    maxCreditPct: '60', // shown as %, converted to 0.6
    totalBudget: '',
    platforms: ['SNAPCHAT', 'INSTAGRAM'] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, val: any) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.title.trim().length < 3) { setError('عنوان الحملة 3 أحرف على الأقل'); return; }
    if (form.platforms.length === 0) { setError('اختر منصة واحدة على الأقل'); return; }
    if (!form.totalBudget || Number(form.totalBudget) < 500) { setError('الميزانية 500 ريال على الأقل'); return; }

    setLoading(true); setError('');
    try {
      // 1) create the campaign (server creates it as DRAFT)
      const { data } = await api.post('/campaigns', {
        brandId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        contentType: form.contentType,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate + 'T23:59:59').toISOString(),
        maxCreditPct: Math.min(1, Math.max(0.01, Number(form.maxCreditPct) / 100)),
        totalBudget: Number(form.totalBudget),
        allowedPlatforms: form.platforms,
      });

      // 2) activate it so it appears in the mobile user feed
      const campaignId = data.data.id;
      await api.patch(`/campaigns/${campaignId}/status`, { status: 'ACTIVE' });

      onCreated();
      setForm((f) => ({ ...f, title: '', description: '', totalBudget: '' }));
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل إنشاء الحملة');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="حملة جديدة" width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-right">{error}</div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-right text-sm text-blue-800">
          البراند: <span className="font-bold">{brandName}</span>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">عنوان الحملة *</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)}
            placeholder="مثال: صيف مع ألمراعي"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">وصف الحملة</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
            rows={2} placeholder="اكتب وصفاً مختصراً للحملة"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
        </div>

        {/* Platforms */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">المنصات المسموحة *</label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <button key={p.key} type="button" onClick={() => togglePlatform(p.key)}
                className={`p-3 rounded-xl border-2 text-right transition-all flex items-center justify-between ${
                  form.platforms.includes(p.key) ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-xs font-bold" style={{ color: '#C9922A' }}>{p.mult}</span>
                <span className="font-semibold text-sm">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">نوع المحتوى</label>
          <div className="grid grid-cols-3 gap-2">
            {CONTENT_TYPES.map((c) => (
              <button key={c.key} type="button" onClick={() => set('contentType', c.key)}
                className={`p-3 rounded-xl border-2 text-center transition-all text-sm font-semibold ${
                  form.contentType === c.key ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">تاريخ البداية</label>
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">تاريخ النهاية</label>
            <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
        </div>

        {/* Budget + max credit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">ميزانية الحملة (ريال) *</label>
            <input type="number" min="500" value={form.totalBudget} onChange={(e) => set('totalBudget', e.target.value)}
              placeholder="20000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">أقصى نسبة رصيد للمنشور (%)</label>
            <input type="number" min="1" max="100" value={form.maxCreditPct} onChange={(e) => set('maxCreditPct', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full text-white font-bold py-3 rounded-xl transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#1B3A7A' }}>
          {loading ? 'جاري النشر...' : '🚀 نشر الحملة (ستظهر في تطبيق المستخدمين)'}
        </button>
      </form>
    </Modal>
  );
}
