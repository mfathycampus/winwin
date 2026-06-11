'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import api from '../../lib/api';

const SECTORS = ['أغذية ومشروبات','مالية وتقنية','تجزئة','سيارات','عقارات','تعليم','صحة وجمال','ترفيه','سياحة وسفر','أخرى'];
const EMOJIS  = ['🥤','💳','🛒','🚗','🏠','📚','💄','🎮','✈️','🏷️','🍔','👗','📱','🏋️','☕'];
const COLORS  = ['#1B3A7A','#C9922A','#00B140','#E31837','#6D2B8E','#FF6B35','#0099CC','#FF3B89','#2ECC71','#E67E22'];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (brand: any) => void;
  companyId?: string;
}

export function AddBrandModal({ open, onClose, onCreated, companyId = 'company_demo' }: Props) {
  const [form, setForm] = useState({
    name: '', sector: '', emoji: '🏷️', color: '#1B3A7A', monthlyBudget: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())   { setError('اسم البراند مطلوب'); return; }
    if (!form.sector)        { setError('القطاع مطلوب'); return; }
    if (!form.monthlyBudget || isNaN(Number(form.monthlyBudget))) {
      setError('أدخل ميزانية شهرية صحيحة'); return;
    }

    setLoading(true); setError('');
    try {
      const { data } = await api.post(`/brands/company/${companyId}`, {
        name: form.name.trim(),
        sector: form.sector,
        emoji: form.emoji,
        color: form.color,
        monthlyBudget: Number(form.monthlyBudget),
      });
      onCreated(data.data);
      setForm({ name: '', sector: '', emoji: '🏷️', color: '#1B3A7A', monthlyBudget: '' });
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل إنشاء البراند');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="إضافة براند جديد">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-right">{error}</div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">اسم البراند *</label>
          <input
            value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="مثال: Almarai Juice"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2"
          />
        </div>

        {/* Sector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">القطاع *</label>
          <select
            value={form.sector} onChange={e => set('sector', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2"
          >
            <option value="">اختر القطاع</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Emoji */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">أيقونة البراند</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(em => (
              <button key={em} type="button"
                onClick={() => set('emoji', em)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                  form.emoji === em ? 'border-blue-600 bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300'
                }`}
              >{em}</button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">لون البراند</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} type="button"
                onClick={() => set('color', c)}
                className={`w-8 h-8 rounded-full border-4 transition-all ${
                  form.color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">الميزانية الشهرية (ريال) *</label>
          <input
            type="number" min="1000"
            value={form.monthlyBudget} onChange={e => set('monthlyBudget', e.target.value)}
            placeholder="50000"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2"
          />
        </div>

        {/* Preview */}
        {form.name && (
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 mb-2 text-right">معاينة</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                   style={{ backgroundColor: form.color + '25', border: `2px solid ${form.color}40` }}>
                {form.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-900">{form.name}</p>
                <p className="text-sm text-gray-500">{form.sector}</p>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full text-white font-bold py-3 rounded-xl transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#1B3A7A' }}>
          {loading ? 'جاري الإنشاء...' : 'إنشاء البراند ✓'}
        </button>
      </form>
    </Modal>
  );
}
