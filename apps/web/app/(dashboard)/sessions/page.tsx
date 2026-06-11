'use client';

import { useState, useEffect } from 'react';
import { formatSAR } from '../../../lib/utils';
import api from '../../../lib/api';
import { AddSessionModal } from '../../../components/dashboard/AddSessionModal';

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

interface Session {
  id: string; brandName: string; brandEmoji?: string; campaignTitle: string;
  timeSlot: string; startsAt: string; durationMinutes: number;
  maxSeats: number; seatsTaken: number; bonusBudget: number; bonusPerUser: number; status: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; title: string; brandId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/sessions/managed'),       // role-scoped
        api.get('/campaigns/managed'),      // for the create modal (only your campaigns)
      ]);
      setSessions(sRes.data.data || []);
      // AddSessionModal needs {id,title,brandId}; managed campaigns expose brand via name → need brandId
      const camps = (cRes.data.data || []).map((c: any) => ({ id: c.id, title: c.title, brandId: c.brandId }));
      setCampaigns(camps);
    } catch (e: any) {
      setError(e.response?.data?.message || 'تعذّر تحميل الجلسات. سجّل الدخول أولاً.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">جلسات البث المباشر</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ جلسة جديدة</button>
      </div>

      {loading && <div className="card text-center text-gray-400 py-10">جاري التحميل...</div>}
      {error && !loading && (
        <div className="card bg-amber-50 border border-amber-200 text-amber-800 text-right">{error}</div>
      )}
      {!loading && !error && sessions.length === 0 && (
        <div className="card text-center py-12 text-gray-500">لا توجد جلسات بث بعد</div>
      )}

      <div className="grid gap-4">
        {sessions.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{s.brandEmoji || '🎯'}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle[s.status] || statusStyle.SCHEDULED}`}>
                      {statusLabel[s.status] || s.status}
                    </span>
                    <span className="text-xs text-gray-400">{slotLabel[s.timeSlot]}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{s.brandName} · {s.campaignTitle}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    المدة: {s.durationMinutes} دقيقة · البونص: {formatSAR(s.bonusPerUser)} / مستخدم
                  </p>
                </div>
              </div>
              <div className="text-left">
                <Countdown startsAt={s.startsAt} status={s.status} />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">المقاعد المحجوزة</span>
                <span className="font-semibold">{s.seatsTaken} / {s.maxSeats}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-l from-blue-500 to-blue-700 transition-all"
                     style={{ width: `${s.maxSeats ? Math.round((s.seatsTaken/s.maxSeats)*100) : 0}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>الميزانية: {formatSAR(s.bonusBudget)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddSessionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={load}
        campaigns={campaigns}
      />
    </div>
  );
}
