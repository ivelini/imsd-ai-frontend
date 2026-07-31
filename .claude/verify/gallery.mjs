const fs = await import('node:fs');
const path = await import('node:path');
const DIR = `${import.meta.dirname}/screenshots`;
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.png')).sort();

const groups = {};
for (const f of files) {
  const [page, vp] = f.replace('.png', '').split('__');
  (groups[page] ??= []).push(vp || 'top');
}

let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
  + 'body{font-family:system-ui;background:#111;color:#eee;padding:20px}'
  + 'h2{color:#ffc10a;margin:24px 0 8px}'
  + '.row{display:flex;gap:8px;overflow-x:auto;padding-bottom:12px}'
  + 'img{border:1px solid #333;max-height:400px;cursor:pointer}'
  + '</style></head><body><h1>Верификация мокапа</h1>';

for (const [page, vps] of Object.entries(groups)) {
  html += `<h2>${page}</h2><div class="row">`;
  for (const vp of vps) {
    const fn = vp === 'top' ? `top_${page}.png` : `${page}__${vp}.png`;
    html += `<a href="${fn}" target="_blank"><img src="${fn}" alt="${page} @ ${vp}" title="${vp}"></a>`;
  }
  html += '</div>';
}
html += '</body></html>';
fs.writeFileSync(`${DIR}/index.html`, html);
console.log('Gallery written to screenshots/index.html');
