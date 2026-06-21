const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const NAVY = '#0E2254';
const NAVY_DARK = '#0A1628';
const GREEN = '#22C55E';
const GOLD = '#F5A623';
const FONT = "'Tahoma', Arial, sans-serif";

function banner(W, H, { logoSize = 90, headline = '', sub = '' }) {
  const cx = W / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${NAVY}"/>
        <stop offset="1" stop-color="${NAVY_DARK}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="${W-40}" cy="40" r="${H*0.5}" fill="${GREEN}" opacity="0.07"/>
    <circle cx="60" cy="${H-20}" r="${H*0.4}" fill="${GOLD}" opacity="0.06"/>
    <text x="${cx}" y="${H*0.42}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${logoSize}">
      <tspan fill="#ffffff">WIN</tspan><tspan fill="${GREEN}">و</tspan><tspan fill="#ffffff">WIN</tspan>
    </text>
    ${headline ? `<text x="${cx}" y="${H*0.42 + logoSize*0.95}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${logoSize*0.42}" fill="#ffffff">${headline}</text>` : ''}
    ${sub ? `<text x="${cx}" y="${H*0.42 + logoSize*1.5}" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="${logoSize*0.34}" fill="${GREEN}">${sub}</text>` : ''}
  </svg>`;
}

function render(svg, W, name) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: W }, font: { loadSystemFonts: true } });
  fs.writeFileSync(path.join(__dirname, 'posts', name), r.render().asPng());
  console.log('✓', name);
}

// X / Twitter header
render(banner(1500, 500, { logoSize: 130, headline: 'انشر... واكسب مكافآت حقيقية', sub: 'winwin.sa' }), 1500, 'banner-x-1500x500.png');
// LinkedIn / Facebook cover
render(banner(1640, 624, { logoSize: 140, headline: 'منصة التسويق بالأداء في السعودية', sub: 'winwin.sa  ·  @winwin' }), 1640, 'banner-cover-1640x624.png');
// YouTube / general wide
render(banner(2048, 1152, { logoSize: 200, headline: 'انشر... واكسب', sub: 'حوّل متابعينك إلى دخل' }), 2048, 'banner-wide-2048x1152.png');

console.log('Banners done.');
