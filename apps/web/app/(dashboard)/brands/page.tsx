'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatSAR } from '../../../lib/utils';
import { AddBrandModal } from '../../../components/dashboard/AddBrandModal';

const COMPANY_ID = 'company_demo';

const initBrands = [
  { id: 'brand_almarai_001', name: 'Almarai Juice', sector: 'أغذية ومشروبات', emoji: '🥤', color: '#00B140', monthlyBudget: 50000, spentBudget: 28000, activeCampaigns: 3 },
  { id: 'brand_stc_001',     name: 'STC Pay',       sector: 'مالية وتقنية',    emoji: '💳', color: '#6D2B8E', monthlyBudget: 80000, spentBudget: 45000, activeCampaigns: 5 },
  { id: 'brand_extra_001',   name: 'Extra Stores',  sector: 'تجزئة',           emoji: '🛒', color: '#E31837', monthlyBudget: 35000, spentBudget: 12000, activeCampaigns: 2 },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState(initBrands);
  const [showModal, setShowModal] = useState(false);

  function handleCreated(brand: any) {
    setBrands(prev => [...prev, { ...brand, spentBudget: 0, activeCampaigns: 0 }]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">البراندات</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ إضافة براند</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.id}`} className="card hover:shadow-md transition-shadow block group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                   style={{ backgroundColor: brand.color + '20', border: `2px solid ${brand.color}40` }}>
                {brand.emoji}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{brand.name}</h3>
                <p className="text-sm text-gray-500">{brand.sector}</p>
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
                <div className="h-full rounded-full" style={{ width: `${Math.min(100,(brand.spentBudget/brand.monthlyBudget)*100)}%`, backgroundColor: brand.color }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>{brand.activeCampaigns} حملة نشطة</span>
                <span>{Math.round((brand.spentBudget/brand.monthlyBudget)*100)}% مستخدم</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Add card */}
        <button onClick={() => setShowModal(true)}
          className="card border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3 min-h-[160px] group">
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-2xl transition-colors">+</div>
          <p className="font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">إضافة براند جديد</p>
        </button>
      </div>

      <AddBrandModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
        companyId={COMPANY_ID}
      />
    </div>
  );
}
