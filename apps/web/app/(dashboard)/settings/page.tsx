'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useMe } from '../../../lib/useMe';

export default function SettingsPage() {
  const { me, isAdmin, myBrands } = useMe();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load the real account data
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        const u = data.data;
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
      } catch (e: any) {
        setError('تعذّر تحميل البيانات');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    if (name.trim().length < 2) { setError('أدخل اسماً صحيحاً'); return; }
    setSaving(true); setError('');
    try {
      // Persist to the backend (updateProfile)
      await api.patch('/users/me', { name: name.trim(), email: email.trim() || undefined });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.response?.data?.message || 'تعذّر حفظ البيانات');
    } finally {
      setSaving(false);
    }
  }

  const roleLabel = isAdmin ? '👑 مدير المنصة (أدمن)' : me?.role === 'brand_manager' ? '🏷️ صاحب براند' : '👤 مستخدم';

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-black text-gray-900">الإعدادات</h1>

      {loading ? (
        <div className="card text-center text-gray-400 py-10">جاري التحميل...</div>
      ) : (
        <>
          {/* Account info */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{roleLabel}</span>
              <h3 className="font-bold text-gray-900 text-lg">معلومات الحساب</h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">الاسم</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">رقم الجوال (لا يمكن تغييره)</label>
              <input value={phone} readOnly dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-left bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-right">{error}</div>}
            {saved && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm text-right">✓ تم الحفظ بنجاح</div>}

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full disabled:opacity-60">
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>

          {/* Brands owned (for brand managers / admin) */}
          {!isAdmin && myBrands.length > 0 && (
            <div className="card space-y-3">
              <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">برانداتي</h3>
              {myBrands.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-xl border flex items-center justify-center text-xl">{b.emoji || '🏷️'}</div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.sector || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
