'use client';

import { useState } from 'react';
import { formatSAR } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

const mockPosts = [
  { id:'1', user:'أحمد محمد',    phone:'+966501234567', brand:'Almarai Juice', campaign:'صيف مع ألمراعي', platform:'SNAPCHAT', credit:18.5, bonus:10,  status:'VERIFIED', date:'2026-06-09T10:30:00Z' },
  { id:'2', user:'سارة العمري',  phone:'+966509876543', brand:'STC Pay',       campaign:'ادفع بذكاء',    platform:'TIKTOK',   credit:22.0, bonus:10,  status:'VERIFIED', date:'2026-06-09T09:15:00Z' },
  { id:'3', user:'خالد الشمري',  phone:'+966505551234', brand:'Almarai Juice', campaign:'صيف مع ألمراعي', platform:'INSTAGRAM',credit:14.0, bonus:0,   status:'PENDING',  date:'2026-06-09T08:00:00Z' },
  { id:'4', user:'نورة الغامدي', phone:'+966503334455', brand:'Extra Stores',  campaign:'عروض الصيف',   platform:'SNAPCHAT', credit:16.5, bonus:0,   status:'FAILED',   date:'2026-06-08T20:00:00Z' },
  { id:'5', user:'فيصل القحطاني',phone:'+966507778899', brand:'STC Pay',       campaign:'ادفع بذكاء',    platform:'SNAPCHAT', credit:19.0, bonus:10,  status:'VERIFIED', date:'2026-06-08T18:45:00Z' },
];

const platEmoji: Record<string,string> = { SNAPCHAT:'👻', TIKTOK:'🎵', INSTAGRAM:'📸', X:'🐦' };
const statusCls: Record<string,string>  = { VERIFIED:'bg-green-100 text-green-700', PENDING:'bg-yellow-100 text-yellow-700', FAILED:'bg-red-100 text-red-700', EXPIRED:'bg-gray-100 text-gray-500' };
const statusLbl: Record<string,string>  = { VERIFIED:'✓ تم التحقق', PENDING:'⏳ قيد التحقق', FAILED:'✗ فشل', EXPIRED:'منتهي' };

export default function PostsPage() {
  const [platform, setPlatform] = useState('');
  const [status,   setStatus]   = useState('');

  const filtered = mockPosts.filter(p =>
    (!platform || p.platform === platform) &&
    (!status   || p.status   === status),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">سجل المنشورات</h1>
        <button className="btn-secondary text-sm">📥 تصدير CSV</button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4 items-center py-4">
        <select value={platform} onChange={e=>setPlatform(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-gray-50">
          <option value="">كل المنصات</option>
          <option value="SNAPCHAT">👻 Snapchat</option>
          <option value="TIKTOK">🎵 TikTok</option>
          <option value="INSTAGRAM">📸 Instagram</option>
          <option value="X">🐦 X</option>
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-gray-50">
          <option value="">كل الحالات</option>
          <option value="VERIFIED">✓ تم التحقق</option>
          <option value="PENDING">⏳ قيد التحقق</option>
          <option value="FAILED">✗ فشل</option>
        </select>
        <span className="text-sm text-gray-500 mr-auto">{filtered.length} منشور</span>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['المستخدم','المنصة','البراند / الحملة','الحالة','الرصيد','التاريخ'].map(h=>(
                  <th key={h} className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p=>(
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{p.user}</p>
                    <p className="text-xs text-gray-400">{p.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">{platEmoji[p.platform]}</span>
                      <span className="text-gray-600">{p.platform}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.brand}</p>
                    <p className="text-xs text-gray-400">{p.campaign}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[p.status]}`}>
                      {statusLbl[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">{formatSAR(p.credit)}</p>
                    {p.bonus > 0 && <p className="text-xs text-amber-600">+{formatSAR(p.bonus)} بونص</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(p.date).toLocaleString('ar-SA')}
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
