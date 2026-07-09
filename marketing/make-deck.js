const pptxgen = require('pptxgenjs');
const path = require('path');

const NAVY = '0E2254', NAVY_DARK = '0A1628', GREEN = '22C55E', GOLD = 'F5A623';
const LIGHT = 'F2F7F5', GRAY = '64748B', WHITE = 'FFFFFF', INK = '0F172A';
const F = 'Arial';
const ICON = path.join(__dirname, '..', 'apps', 'mobile', 'assets', 'icon.png');

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE'; // 13.3 x 7.5
p.author = 'WINوWIN';
p.title = 'WINوWIN — عرض البراندات';
const W = 13.3, H = 7.5;

const shadow = () => ({ type: 'outer', color: '000000', blur: 8, offset: 3, angle: 90, opacity: 0.12 });

// Logo wordmark as rich text (LTR order preserved)
function logo(slide, x, y, size, onDark = true) {
  slide.addText(
    [
      { text: 'WIN', options: { color: onDark ? WHITE : NAVY, bold: true } },
      { text: 'و', options: { color: GREEN, bold: true } },
      { text: 'WIN', options: { color: onDark ? WHITE : NAVY, bold: true } },
    ],
    { x, y, w: 3.2, h: size, fontFace: F, fontSize: size * 40, align: 'left', valign: 'middle', margin: 0 }
  );
}

// Arabic heading
function heading(slide, text, color = NAVY, y = 0.55) {
  slide.addText(text, { x: 0.7, y, w: W - 1.4, h: 0.9, fontFace: F, fontSize: 34, bold: true,
    color, align: 'right', rtlMode: true, valign: 'middle' });
}

// icon circle with emoji
function iconCircle(slide, x, y, d, fill, emoji) {
  slide.addShape(p.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, shadow: shadow() });
  slide.addText(emoji, { x, y, w: d, h: d, fontFace: F, fontSize: d * 26, align: 'center', valign: 'middle' });
}

// ───────────────────────── Slide 1 — Cover ─────────────────────────
let s = p.addSlide();
s.background = { color: NAVY_DARK };
s.addShape(p.shapes.OVAL, { x: W - 4, y: -2.5, w: 6, h: 6, fill: { color: GREEN, transparency: 90 } });
s.addShape(p.shapes.OVAL, { x: -2, y: H - 3, w: 5.5, h: 5.5, fill: { color: GOLD, transparency: 92 } });
s.addText([
  { text: 'WIN', options: { color: WHITE, bold: true } },
  { text: 'و', options: { color: GREEN, bold: true } },
  { text: 'WIN', options: { color: WHITE, bold: true } },
], { x: 0, y: 2.15, w: W, h: 1.3, fontFace: F, fontSize: 88, align: 'center' });
s.addText('منصة التسويق بالأداء في السعودية', { x: 0, y: 3.75, w: W, h: 0.7, fontFace: F, fontSize: 28,
  color: GREEN, bold: true, align: 'center', rtlMode: true });
s.addText('ادفع فقط مقابل نتائج حقيقية', { x: 0, y: 4.5, w: W, h: 0.6, fontFace: F, fontSize: 22,
  color: 'CBD5E1', align: 'center', rtlMode: true });
s.addText('عرض تقديمي للبراندات  ·  winwin.sa', { x: 0, y: 6.6, w: W, h: 0.4, fontFace: F, fontSize: 14,
  color: '94A3B8', align: 'center', rtlMode: true });

// ───────────────────────── Slide 2 — Problem ─────────────────────────
s = p.addSlide();
s.background = { color: WHITE };
heading(s, 'التحدي: الإعلان التقليدي مكلف وغير مضمون');
const problems = [
  { e: '💸', t: 'ميزانيات ضخمة', d: 'تدفع آلاف الريالات مقدماً بدون ضمان لأي نتيجة.' },
  { e: '❓', t: 'لا ضمان للمشاهدة', d: 'لا تعرف من رأى إعلانك فعلاً، وكم منهم مهتم حقاً.' },
  { e: '📉', t: 'صعوبة القياس', d: 'أرقام وصول مبهمة يصعب ربطها بمبيعات أو تفاعل حقيقي.' },
];
problems.forEach((c, i) => {
  const x = 0.7 + i * 4.15;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 2.0, w: 3.85, h: 3.9, rectRadius: 0.12,
    fill: { color: LIGHT }, shadow: shadow() });
  iconCircle(s, x + 1.42, 2.4, 1.0, NAVY, c.e);
  s.addText(c.t, { x: x + 0.2, y: 3.65, w: 3.45, h: 0.6, fontFace: F, fontSize: 20, bold: true,
    color: NAVY, align: 'center', rtlMode: true });
  s.addText(c.d, { x: x + 0.35, y: 4.3, w: 3.15, h: 1.4, fontFace: F, fontSize: 15, color: GRAY,
    align: 'center', rtlMode: true, valign: 'top' });
});

// ───────────────────────── Slide 3 — Solution ─────────────────────────
s = p.addSlide();
s.background = { color: WHITE };
heading(s, 'الحل: وينوين');
s.addText([
  { text: 'مستخدمون حقيقيون', options: { color: GREEN, bold: true } },
  { text: ' ينشرون إعلان براندك على حساباتهم في السوشيال ميديا — ', options: { color: INK } },
  { text: 'وأنت تدفع فقط بعد التحقق من النشر الفعلي.', options: { color: INK, bold: true } },
], { x: 1.0, y: 1.85, w: W - 2, h: 1.7, fontFace: F, fontSize: 23, align: 'right', rtlMode: true, valign: 'middle', lineSpacingMultiple: 1.3 });

const solve = [
  { e: '✅', t: 'نتائج مضمونة', d: 'كل ريال مقابل منشور موثّق' },
  { e: '👥', t: 'وصول أصيل', d: 'من أشخاص حقيقيين لمتابعين حقيقيين' },
  { e: '📊', t: 'قياس دقيق', d: 'لوحة تحكم بكل الأرقام لحظياً' },
];
solve.forEach((c, i) => {
  const x = 0.7 + i * 4.15;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 3.7, w: 3.85, h: 2.7, rectRadius: 0.12,
    fill: { color: NAVY }, shadow: shadow() });
  s.addText(c.e, { x: x + 0.3, y: 3.95, w: 1, h: 0.9, fontFace: F, fontSize: 34, align: 'center', valign: 'middle' });
  s.addText(c.t, { x: x + 0.2, y: 4.9, w: 3.45, h: 0.5, fontFace: F, fontSize: 19, bold: true,
    color: WHITE, align: 'center', rtlMode: true });
  s.addText(c.d, { x: x + 0.3, y: 5.45, w: 3.25, h: 0.8, fontFace: F, fontSize: 14, color: 'CBD5E1',
    align: 'center', rtlMode: true, valign: 'top' });
});

// ───────────────────────── Slide 4 — How it works ─────────────────────────
s = p.addSlide();
s.background = { color: WHITE };
heading(s, 'كيف يعمل — ٤ خطوات بسيطة');
const steps = [
  { n: '١', t: 'أنشئ حملتك', d: 'من لوحة التحكم: العنوان، المنصات، الميزانية' },
  { n: '٢', t: 'ينشرها المستخدمون', d: 'مستخدمون حقيقيون يشاركونها على حساباتهم' },
  { n: '٣', t: 'تحقق تلقائي', d: 'النظام يتأكد من بقاء المنشور ٣٠ دقيقة' },
  { n: '٤', t: 'تدفع بعد النتيجة', d: 'رصيد المستخدم يُحرّر، وتقريرك يتحدّث' },
];
steps.forEach((c, i) => {
  const x = 0.7 + i * 3.05;
  iconCircle(s, x + 0.9, 2.3, 1.15, i % 2 ? GOLD : GREEN, c.n);
  s.addText(c.t, { x: x - 0.1, y: 3.6, w: 3.0, h: 0.6, fontFace: F, fontSize: 18, bold: true,
    color: NAVY, align: 'center', rtlMode: true });
  s.addText(c.d, { x: x, y: 4.2, w: 2.8, h: 1.5, fontFace: F, fontSize: 14, color: GRAY,
    align: 'center', rtlMode: true, valign: 'top' });
});

// ───────────────────────── Slide 5 — Why brands (2x2) ─────────────────────────
s = p.addSlide();
s.background = { color: WHITE };
heading(s, 'لماذا وينوين لبراندك؟');
const why = [
  { e: '🎯', t: 'دفع مقابل الأداء', d: 'صفر هدر — لا تدفع إلا عن منشور حقيقي تم التحقق منه.' },
  { e: '⚡', t: 'انتشار سريع', d: 'عشرات ومئات الحسابات تنشر لك في وقت قصير.' },
  { e: '🛡️', t: 'مصداقية عالية', d: 'محتوى من أشخاص يثق بهم متابعوهم أكثر من الإعلان.' },
  { e: '📈', t: 'تحكم كامل', d: 'أوقف، فعّل، وعدّل ميزانيتك في أي لحظة.' },
];
why.forEach((c, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.7 + col * 6.15, y = 1.85 + row * 2.35;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.85, h: 2.1, rectRadius: 0.1,
    fill: { color: LIGHT }, shadow: shadow() });
  iconCircle(s, x + 4.75, y + 0.5, 1.1, i % 2 ? GOLD : GREEN, c.e);
  s.addText(c.t, { x: x + 0.3, y: y + 0.3, w: 4.3, h: 0.55, fontFace: F, fontSize: 20, bold: true,
    color: NAVY, align: 'right', rtlMode: true });
  s.addText(c.d, { x: x + 0.3, y: y + 0.9, w: 4.3, h: 1.0, fontFace: F, fontSize: 15, color: GRAY,
    align: 'right', rtlMode: true, valign: 'top' });
});

// ───────────────────────── Slide 6 — Platforms (dark) ─────────────────────────
s = p.addSlide();
s.background = { color: NAVY };
heading(s, 'أربع منصات · مضاعفات مكافأة مختلفة', WHITE);
const plats = [
  { e: '👻', t: 'Snapchat', m: '×2.0' },
  { e: '🎵', t: 'TikTok', m: '×1.8' },
  { e: '📸', t: 'Instagram', m: '×1.5' },
  { e: '🐦', t: 'X (تويتر)', m: '×1.0' },
];
plats.forEach((c, i) => {
  const x = 0.7 + i * 3.05;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 2.1, w: 2.8, h: 3.4, rectRadius: 0.12,
    fill: { color: NAVY_DARK }, shadow: shadow() });
  s.addText(c.e, { x, y: 2.4, w: 2.8, h: 1.1, fontFace: F, fontSize: 46, align: 'center', valign: 'middle' });
  s.addText(c.t, { x, y: 3.6, w: 2.8, h: 0.5, fontFace: F, fontSize: 18, bold: true, color: WHITE, align: 'center' });
  s.addText(c.m, { x, y: 4.2, w: 2.8, h: 0.9, fontFace: F, fontSize: 40, bold: true, color: GREEN, align: 'center' });
  s.addText('مضاعف', { x, y: 5.0, w: 2.8, h: 0.35, fontFace: F, fontSize: 13, color: '94A3B8', align: 'center', rtlMode: true });
});
s.addText('كلما زاد تفاعل المستخدم وعدد متابعيه، زاد وصول حملتك.', { x: 0.7, y: 5.9, w: W - 1.4, h: 0.6,
  fontFace: F, fontSize: 17, color: 'CBD5E1', align: 'center', rtlMode: true });

// ───────────────────────── Slide 7 — Dashboard ─────────────────────────
s = p.addSlide();
s.background = { color: WHITE };
heading(s, 'لوحة تحكم البراند — كل شيء بين يديك');
const feats = [
  { e: '🚀', t: 'إنشاء الحملات', d: 'حدّد المنصات، الميزانية، والمدة بثوانٍ.' },
  { e: '🔴', t: 'جلسات البث المباشر', d: 'حملات مكثّفة بمضاعف مسائي حتى ×2.5.' },
  { e: '📋', t: 'سجل المنشورات', d: 'كل منشور حقيقي موثّق مع حالته ورصيده.' },
  { e: '📊', t: 'تقارير لحظية', d: 'الوصول، الإنفاق، والأداء في مكان واحد.' },
];
feats.forEach((c, i) => {
  const y = 1.95 + i * 1.2;
  iconCircle(s, 11.2, y, 0.95, i % 2 ? GOLD : GREEN, c.e);
  s.addText(c.t, { x: 5.0, y: y + 0.02, w: 6.0, h: 0.5, fontFace: F, fontSize: 20, bold: true,
    color: NAVY, align: 'right', rtlMode: true });
  s.addText(c.d, { x: 3.0, y: y + 0.52, w: 8.0, h: 0.5, fontFace: F, fontSize: 15, color: GRAY,
    align: 'right', rtlMode: true });
});
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 1.95, w: 2.0, h: 4.6, rectRadius: 0.12,
  fill: { color: NAVY }, shadow: shadow() });
s.addText([
  { text: 'إدارة', options: { breakLine: true } },
  { text: 'كاملة', options: { breakLine: true } },
  { text: 'ومباشرة', options: {} },
], { x: 0.7, y: 1.95, w: 2.0, h: 4.6, fontFace: F, fontSize: 24, bold: true,
  color: WHITE, align: 'center', valign: 'middle', rtlMode: true });

// ───────────────────────── Slide 8 — Pricing ─────────────────────────
s = p.addSlide();
s.background = { color: WHITE };
heading(s, 'نموذج بسيط وعادل');
const price = [
  { big: '٥٪', t: 'عمولة على قيمة الرصيد', d: 'تُحتسب فقط على المنشورات الحقيقية الموثّقة.' },
  { big: '١٥٪', t: 'على ميزانية جلسات البث', d: 'للحملات المكثّفة عالية التفاعل.' },
  { big: '٠', t: 'رسوم اشتراك مقدّمة', d: 'ابدأ بدون تكاليف ثابتة — ادفع مع النتائج.' },
];
price.forEach((c, i) => {
  const x = 0.7 + i * 4.15;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 2.0, w: 3.85, h: 4.0, rectRadius: 0.12,
    fill: { color: i === 0 ? NAVY : LIGHT }, shadow: shadow() });
  s.addText(c.big, { x, y: 2.4, w: 3.85, h: 1.3, fontFace: F, fontSize: 60, bold: true,
    color: i === 0 ? GREEN : NAVY, align: 'center' });
  s.addText(c.t, { x: x + 0.2, y: 3.85, w: 3.45, h: 0.7, fontFace: F, fontSize: 18, bold: true,
    color: i === 0 ? WHITE : NAVY, align: 'center', rtlMode: true });
  s.addText(c.d, { x: x + 0.35, y: 4.65, w: 3.15, h: 1.2, fontFace: F, fontSize: 14,
    color: i === 0 ? 'CBD5E1' : GRAY, align: 'center', rtlMode: true, valign: 'top' });
});

// ───────────────────────── Slide 9 — Opportunity (dark) ─────────────────────────
s = p.addSlide();
s.background = { color: NAVY_DARK };
heading(s, 'الفرصة: سوق سوشيال ميديا من الأضخم عالمياً', WHITE);
const stats = [
  { n: '+90٪', d: 'نسبة انتشار الإنترنت في المملكة' },
  { n: '+٢٦م', d: 'مستخدم نشط على السوشيال ميديا' },
  { n: '#1', d: 'من الأعلى عالمياً في استخدام سناب وتيك توك' },
];
stats.forEach((c, i) => {
  const x = 0.7 + i * 4.15;
  s.addText(c.n, { x, y: 2.5, w: 3.85, h: 1.4, fontFace: F, fontSize: 60, bold: true, color: GREEN, align: 'center' });
  s.addText(c.d, { x: x + 0.2, y: 3.95, w: 3.45, h: 1.2, fontFace: F, fontSize: 17, color: 'CBD5E1',
    align: 'center', rtlMode: true, valign: 'top' });
});
s.addText('جمهورك موجود بالفعل على هذه المنصات — وينوين يوصلك إليه عبر من يثقون بهم.', {
  x: 0.7, y: 5.9, w: W - 1.4, h: 0.7, fontFace: F, fontSize: 17, color: GOLD, align: 'center', rtlMode: true });

// ───────────────────────── Slide 10 — CTA (dark) ─────────────────────────
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.OVAL, { x: -2, y: -2, w: 6, h: 6, fill: { color: GREEN, transparency: 92 } });
s.addShape(p.shapes.OVAL, { x: W - 3.5, y: H - 3.5, w: 6, h: 6, fill: { color: GOLD, transparency: 94 } });
s.addText([
  { text: 'WIN', options: { color: WHITE, bold: true } },
  { text: 'و', options: { color: GREEN, bold: true } },
  { text: 'WIN', options: { color: WHITE, bold: true } },
], { x: 0, y: 1.3, w: W, h: 1.1, fontFace: F, fontSize: 60, align: 'center' });
s.addText('جاهزون لنبدأ حملتك الأولى؟', { x: 0, y: 3.0, w: W, h: 0.9, fontFace: F, fontSize: 40, bold: true,
  color: WHITE, align: 'center', rtlMode: true });
s.addText('سجّل براندك اليوم وادفع فقط مقابل نتائج حقيقية.', { x: 0, y: 4.0, w: W, h: 0.6, fontFace: F, fontSize: 20,
  color: 'CBD5E1', align: 'center', rtlMode: true });
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: (W - 4) / 2, y: 4.9, w: 4, h: 0.85, rectRadius: 0.42,
  fill: { color: GREEN }, shadow: shadow() });
s.addText('winwin.sa', { x: (W - 4) / 2, y: 4.9, w: 4, h: 0.85, fontFace: F, fontSize: 24, bold: true,
  color: WHITE, align: 'center', valign: 'middle' });
s.addText('@winwin  ·  انشر... واكسب مكافآت حقيقية', { x: 0, y: 6.4, w: W, h: 0.5, fontFace: F, fontSize: 15,
  color: '94A3B8', align: 'center', rtlMode: true });

p.writeFile({ fileName: path.join(__dirname, 'WinWin-Brand-Deck.pptx') }).then((f) =>
  console.log('✓ created', f));
