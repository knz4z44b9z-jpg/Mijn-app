'use strict';
/* ---------- Werklogica (puur, testbaar) ---------- */
const DAYMS = 86400000;
const CYC = [].concat(
  Array(3).fill('Off'), Array(2).fill('Dag'), Array(2).fill('Off'), Array(2).fill('Nacht'),
  Array(3).fill('Off'), Array(3).fill('Dag'), ['Off'], Array(2).fill('Nacht'),
  Array(4).fill('Off'), Array(2).fill('Dag'), ['Off'], Array(3).fill('Nacht'));
const ANCHOR = Date.UTC(2027, 1, 1) / DAYMS; // dag 1 van de cyclus = ma 1 feb 2027
function dn(y, m, d) { return Math.round(Date.UTC(y, m, d) / DAYMS); }
function shiftOf(y, m, d) { return CYC[(((dn(y, m, d) - ANCHOR) % 28) + 28) % 28]; }
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
    f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, mo - 1, da));
}
function holidays(y) {
  const e = easter(y), add = n => new Date(e.getTime() + n * DAYMS), map = {};
  const put = (dt, name) => { map[dt.getUTCMonth() + '-' + dt.getUTCDate()] = name; };
  put(new Date(Date.UTC(y, 0, 1)), 'Nieuwjaar'); put(add(1), 'Paasmaandag');
  put(new Date(Date.UTC(y, 4, 1)), 'Dag van de Arbeid'); put(add(39), 'O.L.H. Hemelvaart');
  put(add(50), 'Pinkstermaandag'); put(new Date(Date.UTC(y, 6, 21)), 'Nationale feestdag');
  put(new Date(Date.UTC(y, 7, 15)), 'O.L.V. Hemelvaart'); put(new Date(Date.UTC(y, 10, 1)), 'Allerheiligen');
  put(new Date(Date.UTC(y, 10, 11)), 'Wapenstilstand'); put(new Date(Date.UTC(y, 11, 25)), 'Kerstmis');
  return map;
}
function lastSunday(y, m) { const d = new Date(Date.UTC(y, m + 1, 0)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d.getUTCDate(); }
// uurwissel: zaterdag voor de laatste zondag van oktober (+1u dagploeg) of maart (-1u nachtploeg)
function uurwissel(y, m, d) {
  if (m === 9 && d === lastSunday(y, 9) - 1) return { who: 'Dag', badge: '+1u', text: 'Klok terug: de dagploeg werkt 1 uur extra' };
  if (m === 2 && d === lastSunday(y, 2) - 1) return { who: 'Nacht', badge: '−1u', text: 'Klok vooruit: de nachtploeg werkt 1 uur minder' };
  return null;
}
// Vlaamse schoolvakanties (vaste lijst uit het ontwerp): [jaar,maand(1-12),dag, jaar,maand,dag]
const SCHOOL = [
  [2026,7,1,2026,8,31],[2026,11,2,2026,11,8],[2026,12,21,2027,1,3],[2027,2,8,2027,2,14],[2027,3,29,2027,4,11],
  [2027,7,1,2027,8,31],[2027,11,1,2027,11,7],[2027,12,27,2028,1,9],[2028,2,28,2028,3,5],[2028,4,3,2028,4,17],[2028,7,1,2028,8,31]
];
const SCHOOLN = ['Zomervakantie','Herfstvakantie','Kerstvakantie','Krokusvakantie','Paasvakantie','Zomervakantie','Herfstvakantie','Kerstvakantie','Krokusvakantie','Paasvakantie','Zomervakantie'];
function schoolIn(y, m) {
  const a = dn(y, m, 1);
  const end = dn(y, m + 1, 1) - 1; const out = [];
  SCHOOL.forEach((r, i) => { const s0 = dn(r[0], r[1] - 1, r[2]), e0 = dn(r[3], r[4] - 1, r[5]); if (s0 <= end && e0 >= a) out.push(SCHOOLN[i] + ' · ' + r[2] + '/' + r[1] + ' tot ' + r[5] + '/' + r[4]); });
  return out;
}
function isSchool(y, m, d) {
  const t = dn(y, m, d);
  return SCHOOL.some(r => t >= dn(r[0], r[1] - 1, r[2]) && t <= dn(r[3], r[4] - 1, r[5]));
}

// Voetbal: KFC Moerbeke B — [jaar, maand(1-12), dag, uur|tekst, thuis(1)/uit(0), tegenstander]
const MATCHES = [[2026,10,16,"20:00",0,"FC Assenede B"],[2026,10,23,"20:00",1,"KVVK Basevelde"],[2026,11,1,"10:00",0,"Jago St.-A'berg"],[2026,11,8,"10:00",1,"KFC St-Kruis-W B"],[2026,11,15,"10:00",0,"SV Zaffelare B"],[2026,11,22,"10:00",1,"FCDKG Beervelde B"],[2026,11,27,"20:00",0,"KVV Laarne-Kalken B"],[2026,12,4,"Algemeen niet-opkomen",1,"FC Daknam"],[2026,12,14,"20:00",0,"Santos Gent"],[2026,12,18,"20:00",1,"KVVE Massemen B"],[2027,1,10,"11:00",0,"FC Genclerbirligi Zele"],[2027,1,15,"20:00",1,"KFC Heikant Zele B"],[2027,1,24,"10:00",0,"FCDKG Beervelde B"],[2027,1,31,"10:00",1,"SK Lochristi C"],[2027,2,14,"10:00",1,"SV Zaffelare B"],[2027,2,19,"20:00",0,"KVVK Basevelde"],[2027,2,26,"20:00",1,"KVV Laarne-Kalken B"],[2027,3,5,"20:00",0,"KVVE Massemen B"],[2027,3,12,"20:00",1,"Jago St.-A'berg"],[2027,3,21,"10:00",0,"KFC St-Kruis-W B"],[2027,4,3,"Algemeen niet-opkomen",0,"FC Daknam"],[2027,4,9,"20:00",1,"FCSKV Overmere"],[2027,4,18,"10:00",0,"KFC Eksaarde C"],[2027,4,23,"20:00",1,"FC Assenede B"]];
const HMS = 3600000;
function parseMatch(r) {
  const hm = r[3].indexOf(':') > 0 ? r[3].split(':') : null, dayT = Date.UTC(r[0], r[1] - 1, r[2]);
  return { y: r[0], m: r[1] - 1, d: r[2], dayT, start: hm ? dayT + Number(hm[0]) * HMS + Number(hm[1]) * 60000 : null, time: r[3], home: r[4] === 1, opp: r[5] };
}
// Kan / Krap / Botst: wedstrijd telt van 1 u voor de aftrap tot 2,5 u erna; overlap = Botst; minder dan 4 u ruimte = Krap
function rateMatch(mt) {
  if (mt.start === null) return null;
  const w0 = mt.start - HMS, w1 = mt.start + 2.5 * HMS; let best = null;
  for (let k = -1; k <= 1; k++) {
    const dT = mt.dayT + k * DAYMS, sh = shiftOf(...ymd(dT)); if (sh === 'Off') continue;
    const a = sh === 'Dag' ? dT + 7 * HMS : dT + 19 * HMS, b = a + 12 * HMS;
    if (a < w1 && b > w0) return { lvl: 'Botst', sh };
    const gap = a >= w1 ? a - w1 : w0 - b; if (best === null || gap < best.gap) best = { gap, sh };
  }
  return best !== null && best.gap < 4 * HMS ? { lvl: 'Krap', sh: best.sh } : { lvl: 'Kan', sh: '' };
}
function ymd(t) { const d = new Date(t); return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()]; }
function upcomingMatches(nowT, todayT) {
  return MATCHES.map(parseMatch).filter(mt => mt.start === null ? mt.dayT >= todayT : mt.start + 2.5 * HMS > nowT);
}
if (typeof module !== 'undefined') module.exports = { schoolIn, parseMatch, rateMatch, upcomingMatches, MATCHES, shiftOf, CYC, easter, holidays, uurwissel, lastSunday, isSchool };

/* ---------- Beveiliging: toegangscode -> AES-GCM ---------- */
if (typeof document !== 'undefined') (function () {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = u => btoa(String.fromCharCode(...new Uint8Array(u)));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const K_SALT = 'ma_salt', K_DATA = 'ma_data';
  let key = null, data = null, lockTimer = null;

  async function deriveKey(code, salt) {
    const base = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base,
      { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function seal(obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
    return JSON.stringify({ iv: b64(iv), ct: b64(ct) });
  }
  async function open(str) {
    const o = JSON.parse(str);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, key, unb64(o.ct));
    return JSON.parse(dec.decode(pt));
  }
  async function save() { localStorage.setItem(K_DATA, await seal(data)); }

  const app = document.getElementById('app');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ----- Vergrendelscherm ----- */
  function lockScreen() {
    key = null; data = null;
    const first = !localStorage.getItem(K_SALT);
    app.innerHTML = `<h1>Mijn app</h1><div class="card">
      <p>${first ? 'Kies een toegangscode (minstens 6 tekens). <b>Onthoud ze goed: zonder code kan niemand je gegevens lezen, ook ik niet.</b>' : 'Voer je toegangscode in.'}</p>
      <input id="code" type="password" autocomplete="off" placeholder="Toegangscode">
      ${first ? '<input id="code2" type="password" autocomplete="off" placeholder="Herhaal de code">' : ''}
      <div class="err" id="err"></div><button id="go">${first ? 'Code instellen' : 'Ontgrendelen'}</button></div>
      <p class="mut">Face ID komt in een volgende versie.</p>`;
    const go = async () => {
      const c = document.getElementById('code').value, err = document.getElementById('err');
      try {
        if (first) {
          if (c.length < 6) { err.textContent = 'Minstens 6 tekens.'; return; }
          if (c !== document.getElementById('code2').value) { err.textContent = 'De twee codes zijn verschillend.'; return; }
          const salt = crypto.getRandomValues(new Uint8Array(16));
          localStorage.setItem(K_SALT, b64(salt)); key = await deriveKey(c, salt);
          data = { verlof: {} }; await save();
        } else {
          key = await deriveKey(c, unb64(localStorage.getItem(K_SALT)));
          data = await open(localStorage.getItem(K_DATA));
        }
        home();
      } catch (e) { key = null; err.textContent = 'Verkeerde code.'; }
    };
    document.getElementById('go').onclick = go;
    document.getElementById('code').onkeydown = e => { if (e.key === 'Enter' && !first) go(); };
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) lockTimer = setTimeout(() => { if (key) lockScreen(); }, 60000);
    else clearTimeout(lockTimer);
  });

  /* ----- Hoofdmenu ----- */
  const MODULES = [
    ['Werkkalender', 'Je ploegenrooster, verlof en uurwissel', werkkalender],
    ['Voetbal', 'Wedstrijden van KFC Moerbeke B', voetbal],
    ['Financieel', 'Leefbudget, schulden, beleggen, pensioen …', soon]
  ];
  function soon(name) {
    app.innerHTML = `<p><button class="ghost" id="back">‹ Terug</button></p><h1>${esc(name)}</h1><div class="card">Deze module wordt als volgende gebouwd.</div>`;
    document.getElementById('back').onclick = home;
  }
  function home() {
    app.innerHTML = `<h1>Mijn app</h1>` + MODULES.map((m, i) => `<button class="tile" data-i="${i}"><b>${m[0]}</b><small>${m[1]}</small></button>`).join('') +
      `<h2>Gegevens</h2><div class="card"><div class="row"><button class="ghost" id="exp">Back-up maken</button><button class="ghost" id="imp">Back-up terugzetten</button><button class="ghost" id="lock">Vergrendelen</button></div>
      <p class="mut">Een back-up is een versleuteld bestand. Bewaar het in iCloud Drive (Bestanden-app).</p><input type="file" id="file" hidden></div>`;
    app.querySelectorAll('.tile').forEach(b => b.onclick = () => MODULES[b.dataset.i][2](MODULES[b.dataset.i][0]));
    document.getElementById('lock').onclick = lockScreen;
    document.getElementById('exp').onclick = () => {
      const blob = new Blob([JSON.stringify({ salt: localStorage.getItem(K_SALT), data: localStorage.getItem(K_DATA) })], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'mijn-app-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
    };
    document.getElementById('imp').onclick = () => document.getElementById('file').click();
    document.getElementById('file').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const o = JSON.parse(await f.text()); if (!o.salt || !o.data) throw 0;
        if (!confirm('Dit vervangt alle gegevens op dit toestel. Doorgaan? Je moet daarna de code van die back-up gebruiken.')) return;
        localStorage.setItem(K_SALT, o.salt); localStorage.setItem(K_DATA, o.data); lockScreen();
      } catch (x) { alert('Dit is geen geldige back-up.'); }
    };
  }

  /* ----- Werkkalender ----- */
  const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  let cur = null, mode = 'maand';
  const DN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  function localParts() { const n = new Date(); return { todayT: Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()), nowT: Date.UTC(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours(), n.getMinutes()) }; }
  function voetbal(name) {
    const { todayT, nowT } = localParts(), up = upcomingMatches(nowT, todayT), nx = up.find(x => x.start !== null);
    const row = mt => { const r = rateMatch(mt), dd = new Date(mt.dayT); return `<div class="card"><div class="row"><b>${DN[dd.getUTCDay()]} ${mt.d} ${MAANDEN[mt.m]}</b><span class="pill ${mt.home ? 'thuis' : 'uit'}">${mt.home ? 'Thuis' : 'Uit'}</span></div>
      <div>${esc(mt.opp)}</div><div class="row"><span class="mut">${esc(mt.time)}</span>${r ? `<span class="pill ${r.lvl}">${r.lvl}${r.sh ? ' · ' + r.sh : ''}</span>` : ''}</div></div>`; };
    app.innerHTML = `<p><button class="ghost" id="back">‹ Terug</button></p><h1>${esc(name)}</h1>
      <div class="card"><div class="mut">Volgende wedstrijd</div>${nx ? `<h2 style="margin:4px 0">${esc(nx.opp)}</h2><div>${DN[new Date(nx.dayT).getUTCDay()]} ${nx.d} ${MAANDEN[nx.m]} · ${nx.time} · ${nx.home ? 'thuis' : 'uit'}</div>
      <div class="mut">Nog ${Math.round((nx.dayT - todayT) / DAYMS)} dag(en)</div>` : '<div>Geen wedstrijd gepland</div>'}</div>
      <h2>Komende wedstrijden (${up.length})</h2>${up.map(row).join('')}
      <p class="mut">Botst = overlapt met een shift. Krap = minder dan 4 uur ruimte. Kan = geen probleem. Uitslagen en rangschikking volgen in een volgende versie.</p>`;
    document.getElementById('back').onclick = home;
  }
  const COL = { Off: ['#1B3573', '#C7D4F5'], Dag: ['#34D399', '#04122E'], Nacht: ['#A5B4FC', '#04122E'] };
  function legende() {
    const sq = c => `<span class="sq" style="background:${c}"></span>`;
    return `<div class="leg">${sq('#1B3573')}Off ${sq('#34D399')}Dag · 7u–19u ${sq('#A5B4FC')}Nacht · 19u–7u <span class="vb">Verlof</span></div>`;
  }
  function tabs(active) {
    return `<div class="tabs"><button id="tm" class="${active === 'maand' ? 'on' : ''}">Maand</button><button id="ty" class="${active === 'jaar' ? 'on' : ''}">Jaar</button></div>`;
  }
  function wireTabs() {
    document.getElementById('back').onclick = home;
    document.getElementById('tm').onclick = () => { mode = 'maand'; werkkalender(); };
    document.getElementById('ty').onclick = () => { mode = 'jaar'; werkkalender(); };
  }
  function jaarKalender() {
    const y = cur.y, now = new Date(), hol = holidays(y); let out = '', leaveYear = 0;
    for (let m = 0; m < 12; m++) {
      const lead = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      let c = '<i class="e"></i>'.repeat(lead);
      for (let d = 1; d <= days; d++) {
        const sh = shiftOf(y, m, d), lv = !!data.verlof[y + '-' + m + '-' + d], today = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();
        if (lv && sh !== 'Off') leaveYear++;
        const uw = uurwissel(y, m, d), dot = hol[m + '-' + d] ? '#EF4444' : (uw && uw.who !== sh ? '#FCD34D' : null);
        c += `<i class="y${today ? ' td' : ''}" style="background:${lv ? '#fff' : COL[sh][0]};color:${lv ? '#0A1A3F' : COL[sh][1]}">${d}${dot ? `<u style="background:${dot}"></u>` : ''}${isSchool(y, m, d) ? '<b></b>' : ''}</i>`;
      }
      out += `<button class="ym" data-m="${m}"><span class="mt">${MAANDEN[m]}</span><div class="yg">${c}</div></button>`;
    }
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Werkkalender</h1><p class="mut">Het hele jaar in één overzicht.</p>${tabs('jaar')}
      <div class="card"><div class="row"><button class="nav" id="pv" aria-label="Vorig jaar">‹</button><span class="big">${y}</span><button class="nav" id="nx" aria-label="Volgend jaar">›</button></div>
      ${legende()}<div class="row mut2"><span>Tik op een maand om die groot te openen.</span><b>Verlof dit jaar: ${leaveYear} dag${leaveYear === 1 ? '' : 'en'}</b></div><div class="yr">${out}</div></div>`;
    wireTabs();
    document.getElementById('pv').onclick = () => { cur.y--; jaarKalender(); };
    document.getElementById('nx').onclick = () => { cur.y++; jaarKalender(); };
    app.querySelectorAll('.ym').forEach(b => b.onclick = () => { cur.m = +b.dataset.m; mode = 'maand'; werkkalender(); });
  }
  function werkkalender() {
    const now = new Date();
    if (!cur) cur = { y: now.getFullYear(), m: now.getMonth() };
    if (mode === 'jaar') return jaarKalender();
    const { y, m } = cur, hol = holidays(y), lead = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    let cells = '<span class="e"></span>'.repeat(lead), leaveM = 0; const holL = [], exL = [];
    for (let d = 1; d <= days; d++) {
      const sh = shiftOf(y, m, d), h = hol[m + '-' + d], uw = uurwissel(y, m, d), key = y + '-' + m + '-' + d, lv = !!data.verlof[key];
      const today = y === now.getFullYear() && m === now.getMonth() && d === now.getDate(), ex = uw && uw.who === sh;
      if (lv && sh !== 'Off') leaveM++;
      if (h) holL.push(`${d} ${MAANDEN[m]} · ${h}`);
      if (uw) exL.push(`${d} ${MAANDEN[m]} · ${ex ? uw.text : 'Uurwissel, geen invloed op je rooster'}`);
      const dot = h ? '#EF4444' : (uw && !ex ? '#FCD34D' : null);
      cells += `<button class="day${today ? ' tod' : ''}" data-k="${key}" style="background:${lv ? '#fff' : COL[sh][0]};color:${lv ? '#0A1A3F' : COL[sh][1]}">
        <span class="n${today ? ' tn' : ''}">${d}${today ? ' · vandaag' : ''}</span>
        <span class="${lv ? 'vb' : 'sh'}">${lv ? 'Verlof' : sh}</span>${lv && sh !== 'Off' ? `<span class="sub">(${sh})</span>` : ''}${ex && !lv ? `<span class="xb">${uw.badge}</span>` : ''}
        ${dot ? `<u style="background:${dot}"></u>` : ''}${isSchool(y, m, d) ? '<b></b>' : ''}</button>`;
    }
    const sc = schoolIn(y, m), li = (arr, c, none) => (arr.length ? arr : [none]).map(t => `<div class="li"><i style="background:${arr.length ? c : 'transparent'}"></i>${esc(t)}</div>`).join('');
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Werkkalender</h1><p class="mut">De maand die bezig is, met je shift per dag.</p>
      <div class="ok">Cyclus klopt met je jaarkalender 2027 (C-ploeg)</div>${tabs('maand')}
      <div class="card"><div class="row"><span class="row2"><button class="nav" id="pv" aria-label="Vorige maand">‹</button><span class="big">${MAANDEN[m]} ${y}</span><button class="nav" id="nx" aria-label="Volgende maand">›</button></span><button class="nav w" id="td">Deze maand</button></div>
      ${legende()}<div class="row mut2"><span>Tik op een dag om verlof toe te voegen of weg te halen.</span><b>Verlof deze maand: ${leaveM} dag${leaveM === 1 ? '' : 'en'}</b></div>
      <div class="mg">${['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(x => `<span class="dw">${x}</span>`).join('')}${cells}</div>
      <div class="lists"><div><h3>Feestdagen</h3>${li(holL, '#F87171', 'Geen feestdag deze maand')}</div><div><h3>Schoolvakanties</h3>${li(sc, '#FB923C', 'Geen schoolvakantie deze maand')}</div><div><h3>Extra uren</h3>${li(exL, '#FCD34D', 'Geen uurwissel deze maand')}</div></div></div>`;
    wireTabs();
    document.getElementById('pv').onclick = () => { cur.m--; if (cur.m < 0) { cur.m = 11; cur.y--; } werkkalender(); };
    document.getElementById('nx').onclick = () => { cur.m++; if (cur.m > 11) { cur.m = 0; cur.y++; } werkkalender(); };
    document.getElementById('td').onclick = () => { cur = { y: now.getFullYear(), m: now.getMonth() }; werkkalender(); };
    app.querySelectorAll('.day').forEach(b => b.onclick = async () => {
      const k = b.dataset.k; if (data.verlof[k]) delete data.verlof[k]; else data.verlof[k] = 1;
      await save(); werkkalender();
    });
  }

  lockScreen();
})();
