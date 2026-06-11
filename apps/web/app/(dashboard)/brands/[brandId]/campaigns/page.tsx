'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../lib/api';
import { AddCampaignModal } from '../../../../../components/dashboard/AddCampaignModal';
import { formatSAR, formatDate } from '../../../../../lib/utils';
import { cn } from '../../../../../lib/utils';

const statusLabels: Record<string, string> = {
  ACTIVE: 'نشطة',
  PAUSED: 'موقوفة',
  DRAFT: 'مسودة',
  ENDED: 'منتهية',
};

const statusBadge: Record<string, string> = {
  ACTIVE: 'badge-active',
  PAUSED: 'badge-paused',
  DRAFT: 'badge-draft',
  ENDED: 'badge-ended',
};

export default function CampaignsPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [showModal, setShowModal] = useState(false);

  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ['campaigns', brandId],
    queryFn: () => api.get(`/brands/${brandId}/campaigns`).then((r) => r.data.data),
  });

  const { data: brandName } = useQuery({
    queryKey: ['brand-name', brandId],
    queryFn: () => api.get(`/brands/${brandId}/dashboard`).then((r) => r.data.data?.brand?.name || 'البراند'),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">الحملات</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + حملة جديدة
        </button>
      </div>

      <AddCampaignModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => refetch()}
        brands={[{ id: brandId, name: brandName || 'البراند' }]}
      />

      {campaigns.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد حملات بعد</h3>
          <p className="text-gray-500 mb-6">أنشئ حملتك الأولى وابدأ في الحصول على منشورات حقيقية</p>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-block">
            إنشاء أول حملة
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign: any) => (
            <Link
              key={campaign.id}
              href={`/brands/${brandId}/campaigns/${campaign.id}`}
              className="card hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(statusBadge[campaign.status])}>
                      {statusLabels[campaign.status]}
                    </span>
                    <span className="text-xs text-gray-400">{campaign.contentType}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
                  </p>
                </div>
                <div className="text-left mr-4">
                  <p className="text-xs text-gray-400">الميزانية</p>
                  <p className="font-bold text-gray-900">{formatSAR(campaign.totalBudget)}</p>
                  <div className="mt-2 h-1.5 w-24 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${Math.min(100, (campaign.spentBudget / campaign.totalBudget) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatSAR(campaign.spentBudget)} مُصرَف
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
