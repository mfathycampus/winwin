import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#0E2254', color: '#fff', textAlign: 'center', padding: 24 }}>
      <div style={{ fontWeight: 900, fontSize: 40 }}>
        WIN<span style={{ color: '#22C55E' }}>و</span>WIN
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>الصفحة غير موجودة</h1>
      <p style={{ color: '#94a3b8' }}>عذراً، الصفحة التي تبحث عنها غير متوفرة.</p>
      <Link href="/dashboard" style={{ background: '#22C55E', color: '#fff', padding: '10px 24px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
        العودة للوحة التحكم
      </Link>
    </div>
  );
}
