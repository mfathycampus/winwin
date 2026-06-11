'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [name, setName]   = useState('شركة المراعي');
  const [email, setEmail] = useState('marketing@almarai.com');
  const [phone, setPhone] = useState('+966500000001');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-black text-gray-900">الإعدادات</h1>

      {/* Company info */}
      <div className="card space-y-5">
        <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">معلومات الشركة</h3>

        {[
          { label: 'اسم الشركة',      value: name,  set: setName,  type: 'text' },
          { label: 'البريد الإلكتروني', value: email, set: setEmail, type: 'email' },
          { label: 'رقم التواصل',     value: phone, set: setPhone, type: 'tel' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">{f.label}</label>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>
        ))}

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm text-right">
            ✓ تم حفظ الإعدادات بنجاح
          </div>
        )}

        <button onClick={handleSave} className="btn-primary w-full">حفظ التغييرات</button>
      </div>

      {/* Notifications */}
      <div className="card space-y-4">
        <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">إشعارات البريد الإلكتروني</h3>
        {[
          { label: 'منشور جديد على حملاتك',      desc: 'استقبل إشعاراً عند كل منشور جديد' },
          { label: 'تنبيه الميزانية (80%)',        desc: 'عند اقتراب الميزانية من الاستنفاد' },
          { label: 'تقرير أسبوعي',                desc: 'ملخص أداء الحملات كل أسبوع' },
          { label: 'منشور مشبوه',                  desc: 'عند اكتشاف نشاط غير اعتيادي' },
        ].map(n => (
          <div key={n.label} className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 text-sm text-right">{n.label}</p>
              <p className="text-xs text-gray-400 text-right">{n.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mr-4">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-700 after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-20px]" />
            </label>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card border border-red-100 space-y-4">
        <h3 className="font-bold text-red-600 text-lg">منطقة الخطر</h3>
        <p className="text-sm text-gray-500 text-right">هذه الإجراءات لا يمكن التراجع عنها. تأكد قبل المتابعة.</p>
        <button className="border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold px-6 py-3 rounded-xl transition-colors w-full">
          حذف الحساب
        </button>
      </div>
    </div>
  );
}
