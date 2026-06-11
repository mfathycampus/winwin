'use client';

import { formatSAR, formatDate } from '../../../lib/utils';

const currentPlan = { name: 'Growth', price: 799, campaigns: 10, platforms: 'كل المنصات', sessions: '2/شهر', renewsAt: '2026-07-09' };

const invoices = [
  { id: 'INV-001', amount: 918.85, tax: 119.85, issuedAt: '2026-06-09', status: 'paid' },
  { id: 'INV-002', amount: 918.85, tax: 119.85, issuedAt: '2026-05-09', status: 'paid' },
  { id: 'INV-003', amount: 918.85, tax: 119.85, issuedAt: '2026-04-09', status: 'paid' },
];

const plans = [
  { name: 'Starter',    price: 199,  campaigns: '3 حملات',     sessions: 'لا يشمل',  highlight: false },
  { name: 'Growth',     price: 799,  campaigns: '10 حملات',    sessions: '2 جلسات',  highlight: true  },
  { name: 'Pro',        price: 1999, campaigns: 'غير محدود',   sessions: '8 جلسات',  highlight: false },
  { name: 'Enterprise', price: 0,    campaigns: 'غير محدود',   sessions: 'غير محدود', highlight: false },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-gray-900">الفواتير والاشتراك</h1>

      {/* Current Plan */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0E2254, #1B3A7A)', border: 'none' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">خطتك الحالية</p>
            <h2 className="text-white font-black text-3xl">{currentPlan.name}</h2>
            <p className="text-blue-200 mt-1">{formatSAR(currentPlan.price)} / شهر <span className="text-xs">(شامل VAT 15%)</span></p>
          </div>
          <div className="text-left">
            <p className="text-blue-200 text-xs">تجديد بتاريخ</p>
            <p className="text-white font-bold">{formatDate(currentPlan.renewsAt)}</p>
          </div>
        </div>
        <div className="flex gap-6 mt-5 pt-5 border-t border-white/10">
          {[
            { label: 'الحملات', value: `${currentPlan.campaigns} حملة` },
            { label: 'المنصات', value: currentPlan.platforms },
            { label: 'جلسات البث', value: currentPlan.sessions },
          ].map(f => (
            <div key={f.label}>
              <p className="text-blue-300 text-xs">{f.label}</p>
              <p className="text-white font-semibold">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">تغيير الخطة</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => (
            <div key={plan.name} className={`card relative ${plan.highlight ? 'ring-2' : ''}`}
                 style={plan.highlight ? { boxShadow: '0 0 0 2px #1B3A7A' } : {}}>
              {plan.highlight && (
                <span className="absolute -top-3 right-4 text-white text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#C9922A' }}>خطتك الحالية</span>
              )}
              <h4 className="font-bold text-gray-900">{plan.name}</h4>
              <p className="text-2xl font-black mt-2" style={{ color: '#1B3A7A' }}>
                {plan.price === 0 ? 'تواصل معنا' : formatSAR(plan.price)}
              </p>
              {plan.price > 0 && <p className="text-xs text-gray-400">/ شهر</p>}
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>✓ {plan.campaigns}</p>
                <p>✓ {plan.sessions}</p>
              </div>
              {!plan.highlight && (
                <button className="mt-4 w-full py-2 rounded-xl text-sm font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-700 transition-colors">
                  {plan.price === 0 ? 'تواصل معنا' : 'الترقية'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">الفواتير السابقة</h3>
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['رقم الفاتورة','المبلغ','ضريبة VAT','تاريخ الإصدار','الحالة',''].map(h=>(
                  <th key={h} className="text-right px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv=>(
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-700">{inv.id}</td>
                  <td className="px-4 py-3 font-bold">{formatSAR(inv.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatSAR(inv.tax)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(inv.issuedAt)}</td>
                  <td className="px-4 py-3">
                    <span className="badge-active">مدفوعة ✓</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 text-xs font-semibold hover:underline">تحميل PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
