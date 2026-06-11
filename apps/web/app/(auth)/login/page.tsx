'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../../lib/api';

const phoneSchema = z.object({
  phone: z.string().regex(/^\+9665[0-9]{8}$/, 'أدخل رقم سعودي صحيح (+9665XXXXXXXX)'),
});
const otpSchema = z.object({ code: z.string().length(6, 'رمز مكون من 6 أرقام') });

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm   = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const [step, setStep]     = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const otpForm   = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  async function onSendOtp({ phone }: PhoneForm) {
    setLoading(true); setError('');
    try {
      await api.post('/auth/otp/send', { phone });
      setPhone(phone); setStep('otp');
    } catch (e: any) {
      if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
        setError('تعذّر الاتصال بالخادم — تأكد أن API يعمل على المنفذ 4000');
      } else {
        setError(e.response?.data?.message || e.message || 'حدث خطأ');
      }
    }
    finally { setLoading(false); }
  }

  async function onVerifyOtp({ code }: OtpForm) {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/otp/verify', { phone, code });
      localStorage.setItem('accessToken',  data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      window.location.href = '/dashboard';
    } catch (e: any) { setError(e.response?.data?.message || 'رمز غير صحيح'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'linear-gradient(135deg, #0E2254 0%, #1B3A7A 60%, #0E2254 100%)' }}>
      <div className="w-full max-w-md">

        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 mb-4">
            {/* Force LTR so mixed Arabic/Latin renders correctly */}
            <div dir="ltr" className="flex items-center justify-center mb-1" style={{ unicodeBidi: 'embed' }}>
              <span className="text-white font-black text-4xl" style={{ fontFamily: 'Cairo, sans-serif', letterSpacing: '2px' }}>
                WIN
              </span>
              <span style={{ color: '#C9922A', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>و</span>
              <span className="text-white font-black text-4xl" style={{ fontFamily: 'Cairo, sans-serif', letterSpacing: '2px' }}>
                WIN
              </span>
            </div>
            <p className="text-xs tracking-widest font-semibold mt-1" style={{ color: '#C9922A' }}>
              وينوين · WINWIN
            </p>
          </div>
          <p className="text-blue-200 text-sm">لوحة تحكم البراند</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-right">
            {step === 'phone' ? 'تسجيل الدخول' : 'أدخل رمز التحقق'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-5 text-sm text-right">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                  رقم الجوال
                </label>
                <input
                  {...phoneForm.register('phone')}
                  placeholder="+966 5X XXX XXXX"
                  dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50"
                  style={{ '--tw-ring-color': '#1B3A7A' } as any}
                />
                {phoneForm.formState.errors.phone && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3 px-6 rounded-xl transition-opacity disabled:opacity-70"
                style={{ backgroundColor: '#1B3A7A' }}
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
              <p className="text-sm text-gray-500 text-right">تم إرسال رمز التحقق إلى {phone}</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                  رمز التحقق
                </label>
                <input
                  {...otpForm.register('code')}
                  placeholder="123456"
                  dir="ltr"
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 bg-gray-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3 px-6 rounded-xl transition-opacity disabled:opacity-70"
                style={{ backgroundColor: '#1B3A7A' }}
              >
                {loading ? 'جاري التحقق...' : 'تأكيد ودخول'}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-sm text-gray-400 underline w-full text-center"
              >
                تغيير رقم الجوال
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-blue-200/50 text-xs mt-6">
          © 2026 WinWin · وينوين. جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
