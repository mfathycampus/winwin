'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatSAR } from '../../../lib/utils';
import api from '../../../lib/api';
import { useMe } from '../../../lib/useMe';
import { AddBrandModal } from '../../../components/dashboard/AddBrandModal';

interface Brand {
  id: string;
  name: string;
  sector?: string;
  emoji?: string;
  color?: string;
  monthlyBudget: number;
  spentBudget: number;
  _count?: { campaigns: number };
}

export default function BrandsPage() {
  const { isAdmin, loading: meLoading } = useMe();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/brands');
      setBrands(data.data || []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'تعذّر تحميل البراندات. سجّل الدخول أولاً.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {isAdmin ? 'كل البراندات' : 'براندي'}
          </h1>
          {!meLoading && (
            <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isAdmin ? '👑 حساب الأدمن' : '🏷️ حساب صاحب براند'}
            </span>
          )}
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ إضافة براند</button>
        )}
      </div>

      {loading && <div className="card text-center text-gray-400 py-10">جاري التحميل...</div>}
      {error && !loading && (
        <div className="card bg-amber-50 border border-amber-200 text-amber-800 text-right">{error}</div>
      )}
      {!loading && !error && brands.length === 0 && (
        <div className="card text-center py-12 text-gray-500">
          {isAdmin ? 'لا توجد براندات بعد — أضف أول براند' : 'لم يتم تعيين أي براند لحسابك بعد'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.id}`} className="card hover:shadow-md transition-shadow block group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                   style={{ backgroundColor: (brand.color || '#1B3A7A') + '20', border: `2px solid ${(brand.color || '#1B3A7A')}40` }}>
                {brand.emoji || '🏷️'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{brand.name}</h3>
                <p className="text-sm text-gray-500">{brand.sector || '—'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الميزانية المستخدمة</span>
                <span className="font-semibold text-gray-900">
                  {formatSAR(brand.spentBudget)} / {formatSAR(brand.monthlyBudget)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                     style={{ width: `${brand.monthlyBudget ? Math.min(100, (brand.spentBudget / brand.monthlyBudget) * 100) : 0}%`, backgroundColor: brand.color || '#1B3A7A' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>{brand._count?.campaigns ?? 0} حملة</span>
                <span>اضغط لإدارة الحملات والبث ←</span>
              </div>
            </div>
          </Link>
        ))}

        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="card border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3 min-h-[160px] group">
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-2xl transition-colors">+</div>
            <p className="font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">إضافة براند جديد</p>
          </button>
        )}
      </div>

      <AddBrandModal open={showModal} onClose={() => setShowModal(false)} onCreated={() => load()} />
    </div>
  );
}
