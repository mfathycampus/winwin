'use client';

import { useState, useEffect } from 'react';
import { formatSAR } from '../../../lib/utils';
import { AddSessionModal } from '../../../components/dashboard/AddSessionModal';

const mockCampaigns = [
  { id: 'camp_001', title: 'صيف مع ألمراعي', brandId: 'brand_almarai_001' },
  { id: 'camp_002', title: 'ادفع بذكاء',      brandId: 'brand_stc_001'    },
  { id: 'camp_003', title: 'عروض الصيف',      brandId: 'brand_extra_001'  },
];

const initSessions = [
  { id: '1', brand: 'Almarai Juice', emoji: '🥤', campaign: 'صيف مع ألمراعي', timeSlot: 'EVENING',  startsAt: new Date(Date.now() + 2*60*60*1000).toISOString(), durationMinutes: 60,  maxSeats: 500,  seatsTaken: 234, bonusBudget: 5000, bonusPerUser: 10, status: 'SCHEDULED' },
  { id: '2', brand: 'STC Pay',       emoji: '💳', campaign: 'ادفع بذكاء',    timeSlot: 'LUNCH',    startsAt: new Date(Date.now() - 30*60*1000).toISOString(),    durationMinutes: 45,  maxSeats: 300,  seatsTaken: 189, bonusBudget: 3000, bonusPerUser: 10, status: 'ACTIVE'    },
  { id: '3', brand: 'Extra Stores',  emoji: '🛒', campaign: 'عروض الصيف',   timeSlot: 'MORNING',  startsAt: new Date(Date.now() - 2*60*60*1000).toISOString(),  durationMinutes: 30,  maxSeats: 200,  seatsTaken: 200, bonusBudget: 2000, bonusPerUser: 10, status: 'ENDED'     },
];

const slotLabel: Record<string,string> = { EVENING:'المساء', LUNCH:'الظهيرة', MORNING:'الصباح', RAMADAN:'رمضان', CUSTOM:'مخصص' };
const statusStyle: Record<string,string> = { ACTIVE:'bg-red-100 text-red-700', SCHEDULED:'bg-blue-100 text-blue-700', ENDED:'bg-gray-100 text-gray-500' };
const statusLabel: Record<string,string> = { ACTIVE:'🔴 مباشر الآن', SCHEDULED:'⏰ مجدولة', ENDED:'✅ انتهت' };

function Countdown({ startsAt, status }: { startsAt: string; status: string }) {
  const [text, setText] = useState('');
  useEffect(() => {
    function tick() {
      const diff = new Date(startsAt).getTime() - Date.now();
      if (status === 'ACTIVE') { setText('جارية الآن'); return; }
      if (status === 'ENDED')  { setText('انتهت');      return; }
      if (diff <= 0) { setText('يبدأ الآن'); return; }
      const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
      setText(h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startsAt, status]);
  return <span className="font-mono font-bold text-lg">{text}</span>;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState(initSessions);
  const [showModal, setShowModal] = useState(false);

  function handleCreated(session: any) {
    const campaign = mockCampaigns.find(c => c.id === session.campaignId);
    setSessions(prev => [{
      id: session.id || String(Date.now()),
      brand: 'براند جديد',
      emoji: '🎯',
      campaign: campaign?.title || 'حملة جديدة',
      timeSlot: session.timeSlot,
      startsAt: session.startsAt,
      durationMinutes: session.durationMinutes,
      maxSeats: session.maxSeats,
      seatsTaken: 0,
      bonusBudget: session.bonusBudget,
      bonusPerUser: session.bonusPerUser,
      status: 'SCHEDULED',
    }, ...prev]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">جلسات البث المباشر</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ جلسة جديدة</button>
      </div>

      <div className="grid gap-4">
        {sessions.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{s.emoji}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle[s.status]}`}>
                      {statusLabel[s.status]}
                    </span>
                    <span className="text-xs text-gray-400">{slotLabel[s.timeSlot]}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{s.brand} · {s.campaign}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    المدة: {s.durationMinutes} دقيقة · البونص: {formatSAR(s.bonusPerUser)} / مستخدم
                  </p>
                </div>
              </div>

              <div className="text-left">
                <Countdown startsAt={s.startsAt} status={s.status} />
                <p className="text-xs text-gray-400 mt-1 text-left">
                  {s.status === 'SCHEDULED' ? 'يبدأ بعد' : s.status === 'ACTIVE' ? 'وقت الجلسة' : 'انتهت'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">المقاعد المحجوزة</span>
                <span className="font-semibold">{s.seatsTaken} / {s.maxSeats}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-l from-blue-500 to-blue-700 transition-all"
                     style={{ width: `${Math.round((s.seatsTaken/s.maxSeats)*100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>الميزانية الكلية: {formatSAR(s.bonusBudget)}</span>
                <span>{Math.round((s.seatsTaken/s.maxSeats)*100)}% ممتلئ</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddSessionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
        campaigns={mockCampaigns}
      />
    </div>
  );
}
