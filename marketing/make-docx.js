const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, Header, Footer, PageBreak,
} = require('docx');

const NAVY = '0E2254';
const GREEN = '22C55E';
const GOLD = 'F5A623';
const LIGHT = 'F2F7F5';
const HEAD_BG = '0E2254';

// A4 content width with 1" margins = 9026 DXA
const CW = 9026;

// ── Helpers (all RTL) ─────────────────────────────────────────────
const t = (text, opts = {}) => new TextRun({ text, rightToLeft: true, font: 'Arial', ...opts });

const p = (text, opts = {}) =>
  new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.START,
    spacing: { after: 120 },
    children: [t(text, opts.run || {})],
    ...opts.para,
  });

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    bidirectional: true,
    children: [t(text, { bold: true, color: NAVY, size: 34 })],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    bidirectional: true,
    children: [t(text, { bold: true, color: GREEN, size: 28 })],
  });

const bullet = (text) =>
  new Paragraph({
    bidirectional: true,
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80 },
    children: [t(text)],
  });

// Quote/caption box: shaded single paragraph
const quote = (lines, title) => {
  const border = { style: BorderStyle.SINGLE, size: 4, color: GREEN };
  return new Table({
    visuallyRightToLeft: true,
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CW],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            borders: { top: border, bottom: border, left: border, right: border },
            shading: { fill: LIGHT, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              ...(title
                ? [new Paragraph({
                    bidirectional: true,
                    spacing: { after: 80 },
                    children: [t(title, { bold: true, color: NAVY })],
                  })]
                : []),
              ...lines.map((ln) =>
                new Paragraph({
                  bidirectional: true,
                  spacing: { after: 60 },
                  children: [t(ln, { size: 22 })],
                })),
            ],
          }),
        ],
      }),
    ],
  });
};

// Generic RTL table
function tbl(headers, rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'BBBBBB' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (text, { head = false, w } = {}) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders,
      shading: { fill: head ? HEAD_BG : 'FFFFFF', type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [
        new Paragraph({
          bidirectional: true,
          children: [t(text, { bold: head, color: head ? 'FFFFFF' : '000000', size: 21 })],
        }),
      ],
    });

  return new Table({
    visuallyRightToLeft: true,
    width: { size: CW, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((hh, i) => cell(hh, { head: true, w: widths[i] })) }),
      ...rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, { w: widths[i] })) })),
    ],
  });
}

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
const spacer = () => new Paragraph({ spacing: { after: 120 }, children: [] });

// ── Content ───────────────────────────────────────────────────────
const children = [];

// Cover
children.push(
  new Paragraph({ spacing: { before: 2400, after: 240 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: 'WIN', bold: true, size: 72, color: NAVY, font: 'Arial' }),
    new TextRun({ text: 'و', bold: true, size: 76, color: GREEN, font: 'Arial', rightToLeft: true }),
    new TextRun({ text: 'WIN', bold: true, size: 72, color: NAVY, font: 'Arial' }),
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 200 }, children: [
    t('خطة محتوى السوشيال ميديا — 3 أشهر', { bold: true, size: 40, color: NAVY }),
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 120 }, children: [
    t('إنستغرام · تيك توك · سناب شات · إكس', { size: 26, color: GREEN, bold: true }),
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [
    t('وينوين · winwin.sa', { size: 22, color: '888888' }),
  ]}),
  pageBreak(),
);

// Strategy
children.push(
  h1('الاستراتيجية العامة'),
  tbl(['الشهر', 'المرحلة', 'الهدف'], [
    ['الشهر الأول', 'الوعي والإطلاق', 'تعريف الناس بالفكرة + أول تحميلات'],
    ['الشهر الثاني', 'الإثبات والثقة', 'قصص أرباح حقيقية + جذب البراندات'],
    ['الشهر الثالث', 'النمو والتوسع', 'تحديات فيروسية + برنامج الإحالة + شراكات'],
  ], [1800, 2800, 4426]),
  spacer(),
  h2('الإيقاع الأسبوعي الموحّد'),
  bullet('إنستغرام: 3 منشورات + ستوري يومي + 2 Reels'),
  bullet('تيك توك: 3-4 فيديوهات'),
  bullet('سناب شات: ستوري يومي (نفس محتوى ستوري إنستغرام)'),
  bullet('إكس (X): 4-5 تغريدات نصية أسرع'),
  pageBreak(),
);

// ============ MONTH 1 ============
children.push(h1('🗓️ الشهر الأول — الوعي والإطلاق'));

children.push(
  h2('الأسبوع الأول — "وصلنا!"'),
  tbl(['اليوم', 'إنستغرام', 'تيك توك', 'إكس (X)'], [
    ['السبت', 'تصميم الإطلاق + نص الإطلاق', 'فيديو 15ث: فتح التطبيق + "انشر واكسب"', 'تغريدة إطلاق مثبّتة'],
    ['الأحد', 'ستوري: استطلاع "تحب تربح من جوالك؟"', '—', 'تغريدة: "كم متابع عندك؟ قد يكون دخلك القادم"'],
    ['الاثنين', 'تصميم "كيف تكسب"', 'فيديو: شرح 3 خطوات بتسجيل شاشة', 'ثريد: كيف يعمل وينوين (5 تغريدات)'],
    ['الثلاثاء', 'ستوري: عدّاد "كم تكسب بـ 10k متابع؟"', '—', 'رد على التعليقات + إعادة نشر'],
    ['الأربعاء', 'تصميم مضاعفات المنصات', 'فيديو: "سناب يدفع أكثر! ×2"', 'تغريدة المضاعفات بالأرقام'],
    ['الخميس', 'Reel: تجربة أول نشر كاملة', 'نفس الفيديو', 'تغريدة: "الويكند فرصة النشر"'],
    ['الجمعة', 'ستوري: تذكير التحميل', 'فيديو خفيف على تريند', '—'],
  ], [1200, 2800, 2600, 2426]),
  spacer(),
  quote([
    '🚀 أطلقنا وينوين — أول منصة سعودية تحوّل متابعينك إلى دخل حقيقي.',
    'انشر إعلان براند على حسابك ← يتحقق النظام ← يوصلك رصيدك خلال ٣٠ دقيقة.',
    'بدون شروط تعجيزية. ابدأ من ١٠٠ متابع فقط.',
    'حمّل التطبيق 👇  #وينوين #اربح_من_جوالك',
  ], 'تغريدة الإطلاق (مثبّتة):'),
  spacer(),
  quote([
    '1/ كل يوم تنشر ستوري وسنابات مجاناً… ليش ما تربح منها؟ 🧵',
    '2/ وينوين يوصلك بالبراندات: تختار إعلاناً يناسبك وتنشره على حسابك.',
    '3/ النظام يتحقق أن المنشور بقي ٣٠ دقيقة — وبعدها الرصيد في محفظتك مباشرة.',
    '4/ كل منصة لها مضاعف: سناب ×٢ | تيك توك ×١.٨ | إنستا ×١.٥ | إكس ×١',
    '5/ كلما زاد متابعوك وتفاعلك، زادت مكافأتك. حمّل التطبيق وجرّب بنفسك 👇',
  ], 'ثريد X — كيف يعمل وينوين:'),
  spacer(),
  quote([
    '[مشهد 1 – 3 ثوانٍ] شخص يتصفح جواله بملل: "تنشر كل يوم ستوري… ببلاش؟"',
    '[مشهد 2 – 5 ثوانٍ] فتح تطبيق وينوين + اختيار إعلان: "اختر إعلان براند"',
    '[مشهد 3 – 4 ثوانٍ] لقطة المحفظة والرصيد يزيد: "وخذ فلوسك خلال ٣٠ دقيقة"',
    '[مشهد 4 – 3 ثوانٍ] اللوجو + "حمّل وينوين الآن"',
  ], 'سكربت فيديو تيك توك (15 ثانية):'),
  pageBreak(),
);

children.push(
  h2('الأسبوع الثاني — التعليم العميق'),
  tbl(['اليوم', 'المحتوى الرئيسي'], [
    ['السبت', 'Reel/تيك توك: شرح ربط الحسابات خطوة بخطوة (تسجيل شاشة)'],
    ['الأحد', 'منشور: "وش يعني مضاعف المنصة؟" (إنفوجرافيك بسيط)'],
    ['الاثنين', 'ستوري أسئلة وأجوبة: "اسألنا أي شي عن وينوين"'],
    ['الثلاثاء', 'ثريد X: أخطاء شائعة عند النشر وكيف تتجنبها'],
    ['الأربعاء', 'منشور: جدول "كم تكسب حسب متابعينك" (1k / 10k / 50k)'],
    ['الخميس', 'تيك توك: "يوم في حياة مستخدم وينوين"'],
    ['الجمعة', 'ستوري: تصويت "أي منصة تستخدم أكثر؟"'],
  ], [1500, 7526]),
  spacer(),
  quote([
    '💰 كم ممكن تكسب من إعلان واحد؟',
    '• ١٬٠٠٠ متابع ← يبدأ من ~١٥ ريال',
    '• ١٠٬٠٠٠ متابع ← يبدأ من ~٥٠ ريال',
    '• ٥٠٬٠٠٠ متابع ← يبدأ من ~١٥٠ ريال',
    'والأرقام تزيد مع تفاعلك ومضاعف المنصة 📈 (الأرقام تقديرية وتختلف حسب الحملة)',
  ], 'منشور "كم تكسب حسب متابعينك":'),
  spacer(),
);

children.push(
  h2('الأسبوع الثالث — جذب البراندات وبناء المجتمع'),
  tbl(['اليوم', 'المحتوى الرئيسي'], [
    ['السبت', 'تصميم "للبراندات" على LinkedIn/X + إنستغرام'],
    ['الأحد', 'تيك توك: "لصاحب المطعم/المتجر: كذا توصل لآلاف بدون ميزانية إعلانات ضخمة"'],
    ['الاثنين', 'ستوري: خلف الكواليس — لوحة تحكم البراند'],
    ['الثلاثاء', 'X: تغريدة موجهة للبراندات + دعوة تواصل'],
    ['الأربعاء', 'منشور تفاعلي: "منشن براند تتمنى تنشر له" 👇'],
    ['الخميس', 'Reel مقارنة: "إعلان تقليدي 5000 ريال مقابل وينوين — تدفع فقط لمن نشر فعلاً"'],
    ['الجمعة', 'ستوري: ملخص الأسبوع'],
  ], [1500, 7526]),
  spacer(),
  quote([
    '📢 لأصحاب البراندات:',
    'ليش تدفع آلاف على إعلانات ما تدري من شافها؟',
    'مع وينوين تدفع فقط مقابل منشور حقيقي تم التحقق منه، من أشخاص حقيقيين لمتابعين حقيقيين.',
    'عمولتنا ٥٪ فقط. سجّل براندك اليوم 👉 الرابط في البايو',
  ], 'نص المنشور الموجّه للبراندات:'),
  spacer(),
);

children.push(
  h2('الأسبوع الرابع — أول إثبات اجتماعي'),
  tbl(['اليوم', 'المحتوى الرئيسي'], [
    ['السبت', 'لقطة شاشة أول أرباح مستخدم (بإذنه) + قصته'],
    ['الأحد', 'تيك توك: رد فعل مستخدم أول ما وصله الرصيد'],
    ['الاثنين', 'منشور: "وزّعنا هذا الشهر X ريال" (رقم حقيقي)'],
    ['الثلاثاء', 'ستوري: شكر للمنضمين الأوائل'],
    ['الأربعاء', 'X: إحصائيات الشهر الأول (تحميلات / منشورات / رصيد موزع)'],
    ['الخميس', 'Reel تجميعي: أفضل لحظات الشهر'],
    ['الجمعة', 'إعلان تشويقي: "الشهر الجاي… شي كبير 👀"'],
  ], [1500, 7526]),
  pageBreak(),
);

// ============ MONTH 2 ============
children.push(
  h1('🗓️ الشهر الثاني — الإثبات والثقة'),
  tbl(['الأسبوع', 'الفكرة المحورية'], [
    ['الأسبوع 5', 'قصص نجاح: 3 مستخدمين حقيقيين — لكل واحد منشور + فيديو قصير عن تجربته'],
    ['الأسبوع 6', 'أسبوع البراندات: قصة أول براند + نتائجه بالأرقام (وصول / منشورات / تكلفة)'],
    ['الأسبوع 7', 'البث المباشر: شرح ميزة الجلسات + بونص المساء ×2.5 + أول جلسة مُعلنة'],
    ['الأسبوع 8', 'تفاعل المجتمع: مسابقة "أفضل منشور إبداعي لحملة" بجائزة رصيد إضافي'],
  ], [1800, 7226]),
  spacer(),
  h2('قوالب جاهزة — الشهر الثاني'),
  quote([
    '🏆 قصة [الاسم]:',
    '"[اقتباس قصير من المستخدم عن تجربته]"',
    '📊 [عدد] منشورات × [مدة] = [المبلغ] ريال',
    'قصتك ممكن تكون التالية — حمّل وينوين 👇',
  ], 'قالب قصة نجاح:'),
  spacer(),
  quote([
    '🔴 جلسة مباشرة مع [البراند]!',
    '🕗 [اليوم] الساعة ٨ مساءً',
    '💰 بونص إضافي [X] ريال لكل مشارك + مضاعف المساء ×٢.٥',
    '🪑 المقاعد محدودة ([العدد]) — فعّل التذكير الآن!',
  ], 'قالب إعلان جلسة بث مباشر:'),
  spacer(),
  quote([
    '📊 نتائج [اسم البراند] في أسبوعين مع وينوين:',
    '✅ [X] منشور حقيقي موثّق',
    '✅ وصول تقديري [X] ألف شخص',
    '✅ التكلفة؟ فقط ما تم نشره فعلاً — صفر هدر',
    'براندك التالي؟ سجّل من الموقع 👉',
  ], 'قالب منشور نتائج براند:'),
  spacer(),
  quote([
    '🎁 مسابقة وينوين الأولى!',
    'انشر أي حملة من التطبيق بطريقتك الإبداعية + هاشتاق #تحدي_وينوين',
    'أفضل ٣ منشورات: ١٠٠ ريال رصيد إضافي لكل واحد 💰',
    'آخر موعد: [التاريخ]',
  ], 'قالب المسابقة (الأسبوع 8):'),
  pageBreak(),
);

// ============ MONTH 3 ============
children.push(
  h1('🗓️ الشهر الثالث — النمو والانتشار'),
  tbl(['الأسبوع', 'الفكرة المحورية'], [
    ['الأسبوع 9', 'تحدي فيروسي: #كم_كسبت_من_وينوين — المستخدمون يشاركون لقطات أرباحهم'],
    ['الأسبوع 10', 'برنامج الإحالة: "ادعُ صديقك واكسبوا الاثنين" (حملة كاملة)'],
    ['الأسبوع 11', 'شراكات المؤثرين الصغار: 3-5 مايكرو إنفلونسر (5-50k) يجربون ويوثقون'],
    ['الأسبوع 12', 'ملخص الربع + الإعلان القادم: أرقام 3 أشهر + خارطة الطريق'],
  ], [1800, 7226]),
  spacer(),
  h2('قوالب جاهزة — الشهر الثالث'),
  quote([
    '💸 تحدي #كم_كسبت_من_وينوين',
    'صوّر لقطة محفظتك وانشرها بالهاشتاق —',
    'كل أسبوع نختار أعلى ٣ أرباح ونضاعف رصيدهم 🔥',
    'ما بدأت بعد؟ حمّل التطبيق والحق عليهم!',
  ], 'إطلاق التحدي (الأسبوع 9):'),
  spacer(),
  quote([
    '🤝 صديقك = رصيد إضافي',
    'ادعُ صديقك لوينوين:',
    '• هو يكسب مكافأة ترحيبية',
    '• وأنت تكسب [X] ريال أول ما ينشر',
    'شارك كودك من صفحة "حسابي" 📲',
  ], 'حملة الإحالة (الأسبوع 10):'),
  spacer(),
  quote([
    'مرحباً [الاسم] 👋',
    'نتابع محتواك ونشوفه مناسباً جداً لجمهور وينوين.',
    'نقترح تعاوناً بسيطاً: تجرب التطبيق وتوثق تجربتك بشفافية (أرباحك حقيقية وتظهر مباشرة).',
    'بدون سكربت مفروض — رأيك الصادق. مهتم؟',
  ], 'قالب رسالة تعاون مع مؤثر:'),
  spacer(),
  quote([
    '📈 ٣ أشهر من وينوين بالأرقام:',
    '👥 [X] مستخدم | 🏷️ [X] براند | 📝 [X] منشور موثّق | 💰 [X] ريال موزعة',
    'وهذي البداية فقط…',
    'القادم: [ميزة ١] + [ميزة ٢] 👀',
    'شكراً لكل من صدّق بالفكرة 💚',
  ], 'ملخص الربع (الأسبوع 12):'),
  pageBreak(),
);

// ============ RULES ============
children.push(
  h1('📌 قواعد تشغيلية مهمة'),
  bullet('أفضل أوقات النشر بالسعودية: 8–11 مساءً (الذروة) و1–2 ظهراً. الخميس والجمعة الأعلى تفاعلاً.'),
  bullet('أعد التدوير: كل فيديو تيك توك = Reel إنستغرام = ستوري سناب. لا تصنع محتوى منفصلاً لكل منصة.'),
  bullet('إكس للسرعة: تغريدات نصية يومية قصيرة لا تحتاج تصميماً — النكت الخفيفة عن "النشر ببلاش" تنجح.'),
  bullet('الأرقام الحقيقية فقط: لا تنشر أرباحاً وهمية أبداً — أول فضيحة تقتل المنصة.'),
  bullet('رد خلال ساعة على التعليقات في أول 3 أشهر — يبني المجتمع ويرفع الوصول.'),
  bullet('قِس أسبوعياً: التحميلات لكل منشور ← كرر ما نجح، وأوقف ما فشل.'),
  spacer(),
  h2('الهاشتاقات الجاهزة'),
  bullet('عامة: #وينوين #WINWIN #السعودية #الرياض #جدة'),
  bullet('كسب: #اربح_من_جوالك #دخل_إضافي #دخل_من_المنزل #عمل_حر'),
  bullet('تسويق: #تسويق #تسويق_بالعمولة #براندات #إعلانات #المؤثرين'),
);

// ── Document ──────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 23 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 34, bold: true, font: 'Arial', color: NAVY },
        paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: GREEN },
        paragraph: { spacing: { before: 200, after: 140 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: 'WIN', bold: true, size: 20, color: NAVY, font: 'Arial' }),
          new TextRun({ text: 'و', bold: true, size: 22, color: GREEN, font: 'Arial', rightToLeft: true }),
          new TextRun({ text: 'WIN', bold: true, size: 20, color: NAVY, font: 'Arial' }),
          new TextRun({ text: '  —  خطة المحتوى', size: 18, color: '888888', font: 'Arial', rightToLeft: true }),
        ]}),
      ]}),
    },
    footers: {
      default: new Footer({ children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: 'صفحة ', size: 18, font: 'Arial', rightToLeft: true }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Arial' }),
        ]}),
      ]}),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = path.join(__dirname, 'WinWin-Content-Plan-3Months.docx');
  fs.writeFileSync(out, buffer);
  console.log('✓ created:', out, `(${(buffer.length / 1024).toFixed(0)} KB)`);
});
