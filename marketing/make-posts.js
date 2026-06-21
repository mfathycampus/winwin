const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const NAVY = '#0E2254';
const NAVY_DARK = '#0A1628';
const GREEN = '#22C55E';
const GOLD = '#F5A623';
// Tahoma first — clean, professional Arabic on Windows (avoids decorative fallback)
const FONT = "'Tahoma', Arial, sans-serif";

const W = 1080, H = 1080;

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Generic branded square post
function post({ badge, badgeColor = GOLD, lines = [], sub = '', cta = '', accent = GREEN }) {
  const cx = W / 2;
  const n = lines.length;
  const lineGap = 122;
  const firstY = 470 - ((n - 1) * lineGap) / 2; // vertically center the headline block
  const lineSvgs = lines.map((ln, i) =>
    `<text x="${cx}" y="${firstY + i * lineGap}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="88" fill="#ffffff">${esc(ln)}</text>`
  ).join('');
  const subY = firstY + (n - 1) * lineGap + 100;
  const ctaY = H - 250;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${NAVY}"/>
        <stop offset="1" stop-color="${NAVY_DARK}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="${W-60}" cy="120" r="220" fill="${accent}" opacity="0.08"/>
    <circle cx="40" cy="${H-80}" r="200" fill="${GOLD}" opacity="0.06"/>

    <!-- Logo -->
    <text x="${cx}" y="150" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="58">
      <tspan fill="#ffffff">WIN</tspan><tspan fill="${GREEN}">و</tspan><tspan fill="#ffffff">WIN</tspan>
    </text>

    <!-- Badge -->
    ${badge ? `<rect x="${cx-200}" y="235" width="400" height="72" rx="36" fill="${badgeColor}"/>
    <text x="${cx}" y="285" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="38" fill="#0A1628">${esc(badge)}</text>` : ''}

    <!-- Headline lines -->
    ${lineSvgs}

    <!-- Sub -->
    ${sub ? `<text x="${cx}" y="${subY}" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="44" fill="#cbd5e1">${esc(sub)}</text>` : ''}

    <!-- CTA -->
    ${cta ? `<rect x="${cx-310}" y="${ctaY}" width="620" height="100" rx="50" fill="${accent}"/>
    <text x="${cx}" y="${ctaY+65}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="46" fill="#ffffff">${esc(cta)}</text>` : ''}

    <text x="${cx}" y="${H-60}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="32" fill="${GREEN}">winwin.sa  ·  @winwin</text>
  </svg>`;
}

function render(svg, name) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: W }, font: { loadSystemFonts: true } });
  const out = path.join(__dirname, 'posts', name);
  fs.writeFileSync(out, r.render().asPng());
  console.log('✓', name);
}

const dir = path.join(__dirname, 'posts');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1) Launch announcement
render(post({
  badge: 'تطبيق جديد', badgeColor: GREEN,
  lines: ['انشر... واكسب', 'مكافآت حقيقية'],
  sub: 'حوّل متابعينك على السوشيال ميديا إلى دخل',
  cta: 'حمّل التطبيق الآن',
}), '1-launch.png');

// 2) How it works
render(post({
  badge: 'كيف تكسب؟', badgeColor: GOLD,
  lines: ['اربط حساباتك', 'انشر الإعلان', 'استلم رصيدك'],
  sub: 'ثلاث خطوات · رصيدك خلال ٣٠ دقيقة',
  cta: 'ابدأ الآن',
}), '2-how.png');

// 3) For brands
render(post({
  badge: 'للبراندات', badgeColor: GREEN,
  lines: ['ادفع فقط مقابل', 'نتائج حقيقية'],
  sub: 'منشورات موثّقة من مستخدمين حقيقيين',
  cta: 'سجّل براندك',
  accent: GOLD,
}), '3-brands.png');

// 4) Value / platforms
render(post({
  badge: '👻 🎵 📸 🐦', badgeColor: GREEN,
  lines: ['كل منصة', 'لها مكافأة'],
  sub: 'سناب · تيك توك · إنستغرام · إكس',
  cta: 'اكتشف مكافأتك',
}), '4-platforms.png');

// 5) Coming soon / KSA
render(post({
  badge: '🇸🇦 السعودية', badgeColor: GOLD,
  lines: ['قريباً', 'في مدينتك'],
  sub: 'كن أول من يكسب مع وينوين',
  cta: 'تابعنا',
  accent: GREEN,
}), '5-comingsoon.png');

console.log('All posts generated in marketing/posts/');
