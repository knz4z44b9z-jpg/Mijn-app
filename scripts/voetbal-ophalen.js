// Haalt de openbare gegevens van de ploeg op (stand, uitslagen) en bewaart ze in data/voetbal-raw.json.
const { chromium } = require('playwright');
const fs = require('fs');
const START = 'https://www.voetbalvlaanderen.be/club/1499/ploeg/364535/overzicht';
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 1600 }, locale: 'nl-BE' });
  const out = { opgehaald: new Date().toISOString(), json: [], paginas: [] };
  p.on('response', async r => {
    try {
      const ct = r.headers()['content-type'] || '';
      if (ct.includes('json') && r.status() === 200) { const t = await r.text(); if (t.length < 400000) out.json.push({ url: r.url(), body: t }); }
    } catch (e) { }
  });
  const bezoek = async url => {
    try {
      await p.goto(url, { timeout: 45000, waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
      out.paginas.push({ url, titel: await p.title(), tekst: (await p.innerText('body')).slice(0, 20000) });
      return await p.$$eval('a', as => as.map(a => ({ t: a.innerText.trim().slice(0, 40), h: a.href })));
    } catch (e) { out.paginas.push({ url, fout: String(e.message).slice(0, 200) }); return []; }
  };
  const links = await bezoek(START);
  const gezien = new Set([START]);
  for (const l of links) {
    if (gezien.size > 6) break;
    if (/ranking|klassement|rangschikking|uitslag|kalender|resultaat/i.test(l.t + ' ' + l.h) && l.h.includes('voetbalvlaanderen.be') && !gezien.has(l.h)) { gezien.add(l.h); await bezoek(l.h); }
  }
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/voetbal-raw.json', JSON.stringify(out, null, 1));
  console.log('pagina\'s', out.paginas.length, 'json', out.json.length);
  await b.close();
})();
