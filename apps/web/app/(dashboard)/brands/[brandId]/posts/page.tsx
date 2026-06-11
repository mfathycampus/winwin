'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import api from '../../../../../lib/api';
import { formatSAR, formatDate } from '../../../../../lib/utils';
import { cn } from '../../../../../lib/utils';

const platformEmoji: Record<string, string> = {
  SNAPCHAT: '👻',
  TIKTOK: '🎵',
  INSTAGRAM: '📸',
  X: '🐦',
};

const statusLabels: Record<string, string> = {
  PENDING: 'قيد التحقق',
  VERIFIED: 'تم التحقق',
  FAILED: 'فشل',
  EXPIRED: 'منتهية',
};

export default function PostsPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['brand-posts', brandId, page, platform, status],
    queryFn: () =>
      api
        .get(`/brands/${brandId}/posts`, { params: { page, platform, status } })
        .then((r) => r.data.data),
  });

  const posts = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">سجل المنشورات</h1>
        <button
          onClick={() => {/* export CSV */}}
          className="btn-secondary text-sm"
        >
          📥 تصدير CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card flex gap-4">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">كل المنصات</option>
          <option value="SNAPCHAT">Snapchat</option>
          <option value="TIKTOK">TikTok</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="X">X (Twitter)</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">كل الحالات</option>
          <option value="PENDING">قيد التحقق</option>
          <option value="VERIFIED">تم التحقق</option>
          <option value="FAILED">فشل</option>
        </select>
        <span className="text-sm text-gray-500 self-center">{total} منشور</span>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">المستخدم</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">المنصة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">الحملة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">الرصيد</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    جاري التحميل...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    لا توجد منشورات
                  </td>
                </tr>
              ) : (
                posts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{post.user?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{post.user?.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span>{platformEmoji[post.platform]}</span>
                        <span className="text-gray-600">{post.platform}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{post.campaign?.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          post.verificationStatus === 'VERIFIED' && 'bg-green-100 text-green-700',
                          post.verificationStatus === 'PENDING' && 'bg-yellow-100 text-yellow-700',
                          post.verificationStatus === 'FAILED' && 'bg-red-100 text-red-700',
                        )}
                      >
                        {statusLabels[post.verificationStatus] || post.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatSAR(post.creditAmount + post.bonusAmount)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(post.postedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 50 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              السابق
            </button>
            <span className="text-sm text-gray-500">
              صفحة {page} من {Math.ceil(total / 50)}
            </span>
            <button
              disabled={page * 50 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
