import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'Win Win — لوحة تحكم البراند',
  description: 'منصة تسويق الأداء — ادفع فقط مقابل النتائج الحقيقية',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="bg-gray-50 font-cairo antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
