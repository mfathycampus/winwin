'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import api from '../../lib/api';

const SESSION_COMMISSION_RATE = 0.15; // 15% platform commission on prime sessions

const TIME_SLOTS = [
  { key: 'EVENING',  label: '🌙 وقت المساء',   mult: 2.5, hint: '8-11 م — أعلى تفاعل' },
  { key: 'LUNCH',    label: '☀️ وقت الظهيرة',  mult: 1.8, hint: '12-2 م' },
  { key: 'MORNING',  label: '🌅 وقت الصباح',   mult: 1.3, hint: '7-10 ص' },
  { key: 'RAMADAN',  label: '🌙 رمضان',         mult: 3.0, hint: 'موسم رمضان المبارك' },
  { key: 'CUSTOM',   label: '⚙️ مخصص',          mult: 1.0, hint: 'حدد الوقت بنفسك' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (session: any) => void;
  campaigns: { id: string; title: string; brandId: string }[];
}

export function AddSessionModal({ open, onClose, onCreated, campaigns }: Props) {
  const [form, setForm] = useState({
    campaignId: '', brandId: '', timeSlot: 'EVENING',
    startsAt: '', endsAt: '', durationMinutes: '60',
    maxSeats: '500', bonusBudget: '', bonusPerUser: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleCampaignChange(campaignId: string) {
    const campaign = campaigns.find(c => c.id === campaignId);
    setForm(f => ({ ...f, campaignId, brandId: campaign?.brandId || '' }));
  }

  const selectedSlot = TIME_SLOTS.find(s => s.key === form.timeSlot);
  const bonusNum     = parseFloat(form.bonusBudget) || 0;
  const commission   = Math.round(bonusNum * SESSION_COMMISSION_RATE * 100) / 100;
  const perUser      = parseFloat(form.bonusPerUser) || 0;
  const maxUsers     = perUser > 0 ? Math.floor(bonusNum / perUser) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.campaignId) { setError('اختر الحملة'); return; }
    if (!form.startsAt)   { setError('حدد وقت البداية'); return; }
    if (!form.endsAt)     { setError('حدد وقت النهاية'); return; }
    if (!form.bonusBudget || !form.bonusPerUser) { setError('أدخل ميزانية البونص والمبلغ لكل مستخدم'); return; }

    setLoading(true); setError('');
    try {
      const { data } = await api.post('/sessions', {
        brandId:         form.brandId,
        campaignId:      form.campaignId,
        timeSlot:        form.timeSlot,
        startsAt:        new Date(form.startsAt).toISOString(),
        endsAt:          new Date(form.endsAt).toISOString(),
        durationMinutes: parseInt(form.durationMinutes),
        maxSeats:        parseInt(form.maxSeats),
        bonusBudget:     parseFloat(form.bonusBudget),
        bonusPerUser:    parseFloat(form.bonusPerUser),
      });
      onCreated(data.data);
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل إنشاء الجلسة');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="جلسة بث مباشر جديدة" width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-right">{error}</div>
        )}

        {/* Campaign */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">الحملة *</label>
          <select value={form.campaignId} onChange={e => handleCampaignChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2">
            <option value="">اختر الحملة</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">الفترة الزمنية</label>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map(slot => (
              <button key={slot.key} type="button"
                onClick={() => set('timeSlot', slot.key)}
                className={`p-3 rounded-xl border-2 text-right transition-all ${
                  form.timeSlot === slot.key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <p className="font-semibold text-sm">{slot.label}</p>
                <p className="text-xs text-gray-400">{slot.hint}</p>
                <p className="text-xs font-bold mt-1" style={{ color: '#C9922A' }}>×{slot.mult} مضاعف</p>
              </button>
            ))}
          </div>
        </div>

        {/* Start / End */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">وقت البداية *</label>
            <input type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">وقت النهاية *</label>
            <input type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
        </div>

        {/* Seats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">الحد الأقصى للمقاعد</label>
            <input type="number" min="10" value={form.maxSeats} onChange={e => set('maxSeats', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">مدة الجلسة (دقيقة)</label>
            <select value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2">
              {[15,30,45,60,90,120,180,240].map(m => (
                <option key={m} value={m}>{m} دقيقة</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">ميزانية البونص (ريال) *</label>
            <input type="number" min="100" value={form.bonusBudget} onChange={e => set('bonusBudget', e.target.value)}
              placeholder="5000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">بونص لكل مستخدم (ريال) *</label>
            <input type="number" min="1" value={form.bonusPerUser} onChange={e => set('bonusPerUser', e.target.value)}
              placeholder="10"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
          </div>
        </div>

        {/* Summary */}
        {bonusNum > 0 && (
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#0E2254' }}>
            <p className="text-white font-bold text-right">ملخص الجلسة</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-200 text-xs">الحد الأقصى للمستخدمين</p>
                <p className="text-white font-black text-lg">{maxUsers}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-200 text-xs">بونص / مستخدم</p>
                <p className="font-black text-lg" style={{ color: '#C9922A' }}>{perUser} ريال</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-200 text-xs">عمولة المنصة (15%)</p>
                <p className="text-white font-black text-lg">{commission} ريال</p>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full text-white font-bold py-3 rounded-xl transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#1B3A7A' }}>
          {loading ? 'جاري الإنشاء...' : '🚀 إنشاء الجلسة'}
        </button>
      </form>
    </Modal>
  );
}
