'use client';

import { useEffect, useState } from 'react';
import { formatSAR } from '../../../lib/utils';
import api from '../../../lib/api';

const platEmoji: Record<string,string> = { SNAPCHAT:'👻', TIKTOK:'🎵', INSTAGRAM:'📸', X:'🐦' };
const statusCls: Record<string,string>  = { VERIFIED:'bg-green-100 text-green-700', PENDING:'bg-yellow-100 text-yellow-700', FAILED:'bg-red-100 text-red-700', EXPIRED:'bg-gray-100 text-gray-500' };
const statusLbl: Record<string,string>  = { VERIFIED:'✓ تم التحقق', PENDING:'⏳ قيد التحقق', FAILED:'✗ فشل', EXPIRED:'منتهي' };

interface Post {
  id: string; userName: string; userPhone: string; platform: string;
  brandName: string; brandEmoji?: string; campaignTitle: string;
  status: string; creditAmount: number; bonusAmount: number; postedAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/posts/managed'); // role-scoped
        setPosts(data.data || []);
      } catch (e: any) {
        setError(e.response?.data?.message || 'تعذّر تحميل المنشورات');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = posts.filter(p =>
    (!platform || p.platform === platform) &&
    (!status   || p.status   === status),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">سجل المنشورات</h1>
        <button className="btn-secondary text-sm">📥 تصدير CSV</button>
      </div>

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

      {loading && <div className="card text-center text-gray-400 py-10">جاري التحميل...</div>}
      {error && !loading && <div className="card bg-amber-50 border border-amber-200 text-amber-800 text-right">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="card text-center py-12 text-gray-500">لا توجد منشورات بعد — ستظهر هنا عند نشر المستخدمين لحملاتك</div>
      )}

      {filtered.length > 0 && (
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
                      <p className="font-semibold text-gray-900">{p.userName}</p>
                      <p className="text-xs text-gray-400" dir="ltr">{p.userPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="text-lg">{platEmoji[p.platform]}</span>
                        <span className="text-gray-600">{p.platform}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.brandEmoji} {p.brandName}</p>
                      <p className="text-xs text-gray-400">{p.campaignTitle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[p.status] || statusCls.PENDING}`}>
                        {statusLbl[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{formatSAR(p.creditAmount)}</p>
                      {p.bonusAmount > 0 && <p className="text-xs text-amber-600">+{formatSAR(p.bonusAmount)} بونص</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(p.postedAt).toLocaleString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
