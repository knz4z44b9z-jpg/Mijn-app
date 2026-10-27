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

  /* ----- Face ID (WebAuthn + PRF): de toegangscode wordt versleuteld bewaard met een sleutel die enkel Face ID kan vrijgeven ----- */
  const K_BIO = 'ma_bio', PRF_SALT = enc.encode('mijn-app-faceid-v1');
  const bioKey = async prf => crypto.subtle.importKey('raw', prf, 'AES-GCM', false, ['encrypt', 'decrypt']);
  const prfOut = r => { const x = r.getClientExtensionResults(); return x.prf && x.prf.results && x.prf.results.first; };
  const bioOpts = id => ({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: 'public-key', id }], userVerification: 'required', extensions: { prf: { eval: { first: PRF_SALT } } } } });
  // stap 1: Face ID-sleutel aanmaken (moet rechtstreeks op een tik gebeuren)
  async function bioCreate() {
    if (!window.PublicKeyCredential || !navigator.credentials) throw new Error('niet-ondersteund');
    const cred = await navigator.credentials.create({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: 'Mijn app' },
      user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'mijn-app', displayName: 'Mijn app' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
      extensions: { prf: { eval: { first: PRF_SALT } } } } });
    if (!(cred.getClientExtensionResults().prf || {}).enabled) throw new Error('niet-ondersteund');
    return { id: new Uint8Array(cred.rawId), out: prfOut(cred) };
  }
  // stap 2: sleutel ophalen met Face ID (tweede tik) en de code versleuteld bewaren
  async function bioFinish(st, code) {
    let out = st.out;
    if (!out) out = prfOut(await navigator.credentials.get(bioOpts(st.id)));
    if (!out) throw new Error('niet-ondersteund');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await bioKey(out), enc.encode(code));
    localStorage.setItem(K_BIO, JSON.stringify({ id: b64(st.id), iv: b64(iv), ct: b64(ct) }));
  }
  async function bioCode() {
    const o = JSON.parse(localStorage.getItem(K_BIO));
    const a = await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: 'public-key', id: unb64(o.id) }], userVerification: 'required', extensions: { prf: { eval: { first: PRF_SALT } } } } });
    const out = prfOut(a); if (!out) throw new Error('geen-prf');
    return dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, await bioKey(out), unb64(o.ct)));
  }

  const app = document.getElementById('app');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ----- Vergrendelscherm ----- */
  function lockScreen() {
    const nv = document.getElementById('nav'); if (nv) nv.style.display = 'none';
    key = null; data = null;
    const first = !localStorage.getItem(K_SALT);
    app.innerHTML = `<h1>Mijn app</h1><div class="card">
      <p>${first ? 'Kies een toegangscode (minstens 6 tekens). <b>Onthoud ze goed: zonder code kan niemand je gegevens lezen, ook ik niet.</b>' : 'Voer je toegangscode in.'}</p>
      <input id="code" type="password" autocomplete="off" placeholder="Toegangscode">
      ${first ? '<input id="code2" type="password" autocomplete="off" placeholder="Herhaal de code">' : ''}
      <div class="err" id="err"></div><button id="go">${first ? 'Code instellen' : 'Ontgrendelen'}</button></div>
      ${!first && localStorage.getItem(K_BIO) ? '<button class="ghost" id="bio" style="margin-top:12px">Ontgrendel met Face ID</button>' : ''}`;
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
      } catch (e) { console.error(e); key = null; err.textContent = 'Verkeerde code.'; }
    };
    document.getElementById('go').onclick = go;
    const bioBtn = document.getElementById('bio');
    if (bioBtn) bioBtn.onclick = async () => {
      const err = document.getElementById('err');
      try { const c = await bioCode(); key = await deriveKey(c, unb64(localStorage.getItem(K_SALT))); data = await open(localStorage.getItem(K_DATA)); home(); }
      catch (e) { key = null; data = null; err.textContent = 'Face ID lukte niet. Gebruik je toegangscode.'; }
    };
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
    ['Financieel', 'Beleggen, schulden en meer', financieel]
  ];
  function soon(name) {
    app.innerHTML = `<p><button class="ghost" id="back">‹ Terug</button></p><h1>${esc(name)}</h1><div class="card">Deze module wordt als volgende gebouwd.</div>`;
    document.getElementById('back').onclick = home;
  }

  /* ----- Financieel ----- */
  let fromDash = false;
  const backFin = () => (fromDash ? home() : financieel('Financieel'));
  const euro = (n, dec) => '€ ' + Number(n).toLocaleString('nl-BE', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  const signed = (n, dec) => (n < 0 ? '− ' : '+ ') + euro(Math.abs(n), dec);
  const noData = name => `<p><button class="ghost" id="back">← Terug</button></p><h1>${esc(name)}</h1><div class="card">Nog geen gegevens. Laad je gegevensbestand in via het hoofdmenu → <b>Gegevens inladen</b>.</div>`;
  function financieel(name) {
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>${esc(name)}</h1>
      <button class="tile" id="f-lf"><b>Leefbudget</b><small>Wat je nog kunt besteden in deze periode</small></button>
      <button class="tile" id="f-bel"><b>Beleggen</b><small>BUX, Saxo, gestort en resultaat</small></button>
      <button class="tile" id="f-spp"><b>Spaarplan</b><small>Gepland tegenover gestort</small></button>
      <button class="tile" id="f-ink"><b>Inkomsten</b><small>Wat er binnenkomt, per maand en per jaar</small></button>
      <button class="tile" id="f-lb"><b>Loonbarema</b><small>Je categorie en de weddetabel</small></button>
      <button class="tile" id="f-idx"><b>Index</b><small>Gezondheidsindex en spilindex</small></button>
      <button class="tile" id="f-pen"><b>Pensioen</b><small>Pensioensparen en loopbaan</small></button>
      <button class="tile" id="f-sch"><b>Schulden</b><small>Hypotheek en autolening</small></button>`;
    document.getElementById('back').onclick = home;
    document.getElementById('f-lf').onclick = () => { fromDash = false; leefbudget('Leefbudget'); };
    document.getElementById('f-bel').onclick = () => { fromDash = false; beleggen('Beleggen'); };
    document.getElementById('f-sch').onclick = () => { fromDash = false; schulden('Schulden'); };
    document.getElementById('f-spp').onclick = () => { fromDash = false; spaarplan('Spaarplan'); };
    document.getElementById('f-ink').onclick = () => { fromDash = false; inkomsten('Inkomsten'); };
    document.getElementById('f-idx').onclick = () => { fromDash = false; indexScherm('Index'); };
    document.getElementById('f-pen').onclick = () => { fromDash = false; pensioen('Pensioen'); };
    document.getElementById('f-lb').onclick = () => { fromDash = false; loonbarema('Loonbarema'); };
  }
  function planning() {
    curTab = 'plan'; renderNav();
    app.innerHTML = `<h1>Planning</h1>
      <button class="tile" id="p-wk"><b>Werkkalender</b><small>Je ploegenrooster, verlof en uurwissel</small></button>
      <button class="tile" id="p-vb"><b>Voetbal</b><small>Wedstrijden van KFC Moerbeke B</small></button>`;
    document.getElementById('p-wk').onclick = () => werkkalender();
    document.getElementById('p-vb').onclick = () => voetbal('Voetbal');
  }
  let who = 'totaal';
  function beleggen(name) {
    const B = data.beleggen; if (!B) { app.innerHTML = noData(name); document.getElementById('back').onclick = backFin; return; }
    const G = B.gestort, S = B.strategie, vals = S[who], tot = vals.reduce((a, b) => a + b, 0);
    const rows = vals.map((v, i) => {
      const pct = Math.round(v / tot * 100), t = S.doel[i], kind = pct < t ? 'buy' : (pct - t > 5 ? 'stop' : 'ok');
      const lbl = { buy: ['Bijkopen', 'Botst'], stop: ['Niet storten', 'Krap'], ok: ['Ok', 'Kan'] }[kind];
      return `<div class="card"><div class="row"><b>${esc(S.namen[i])}</b><span class="pill ${lbl[1]}">${lbl[0]}</span></div>
        <div class="mut2">${esc(S.uitgever[who][i] || '')}</div><div class="row"><span>${euro(v)}</span><span class="mut2">nu ${pct}% · doel ${S.doel[i]}%</span></div>
        ${kind === 'buy' ? `<div class="mut2">Nodig voor doel: <b>${euro(S.doel[i] / 100 * tot - v)}</b></div>` : ''}</div>`;
    }).join('');
    const gp = tot / B.doelBedrag * 100;
    const tabs = [['totaal', 'Totaal'], ['mezelf', 'Mezelf'], ['gezamenlijk', 'Gezamenlijk'], ['kids', 'Kids']].map(t => `<button data-w="${t[0]}" class="${t[0] === who ? 'on' : ''}">${t[1]}</button>`).join('');
    const jaren = Object.keys(G.perJaar).map(j => `<div class="row"><span>${j}</span><b>${euro(G.perJaar[j])}</b></div>`).join('');
    const sx = B.saxoPos.map(x => `<div class="row li2"><span>${esc(x.naam)}</span><span>${euro(x.waarde)} · <span class="${x.res < 0 ? 'neg' : 'pos'}">${signed(x.res)} · ${x.resPct < 0 ? '−' : '+'}${Math.abs(x.resPct).toFixed(1).replace('.', ',')}%</span></span></div>`).join('');
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Beleggen</h1><p class="mut">Alle waarden komen uit PDT. De app rekent ze niet zelf uit.</p>
      <div class="ok">Cijfers uit PDT · koersen van ${esc(B.koersDatum)}</div>
      <div class="card"><div class="mut2">Totaal beleggen</div><div class="huge">${euro(B.totaal)}</div><div class="mut2">(waarvan winst: <b style="color:#6EE7B7">${euro(B.winst)}</b>)</div>
        <div class="row mut2"><span>BUX <b>${euro(B.bux)}</b></span><span>Saxo <b>${euro(B.saxo)}</b></span><span>Cash <b>${euro(B.cash)}</b></span></div></div>
      <div class="card"><h3>Gestort en resultaat · uit PDT</h3>
        <div class="row"><span>Netto gestort</span><b>${euro(G.netto)}</b></div><div class="mut2">${esc(G.boekingen)}</div>
        <div class="row"><span>Huidige waarde</span><b>${euro(B.totaal)}</b></div><div class="mut2">incl. cash ${euro(B.cash)}</div>
        <div class="row"><span>Winst tot nu toe</span><b class="pos">${signed(B.winst)}</b></div><div class="mut2">+${G.winstPct.toFixed(1).replace('.', ',')}% op wat je stortte</div>
        <div class="row"><span>Dit jaar gestort</span><b>${euro(G.ditJaar)}</b></div>
        <div class="row"><span>Winst dit jaar</span><b class="pos">${signed(G.winstDitJaar)}</b></div><div class="mut2">waarde ${euro(G.waardeHoger)} hoger, waarvan ${euro(G.ditJaar)} gestort</div>
        <div class="row"><span>Verdeeld over</span><b>BUX ${euro(G.verdeeldBux)} · Saxo ${euro(G.verdeeldSaxo)}</b></div>
        <h3 style="margin-top:14px">Netto gestort per jaar</h3>${jaren}<p class="mut2">${esc(G.uitleg)}</p></div>
      <h2>BUX · strategie ${S.doel.join('-')}</h2><div class="tabs" id="wtabs">${tabs}</div><div class="card"><div class="mut2">Totaal ${esc(who)}</div><div class="big2">${euro(tot)}</div></div>${rows}
      <div class="card"><div class="row"><span>Doel: ${euro(B.doelBedrag)} met BUX</span><b>${euro(tot)} · ${gp.toFixed(1).replace('.', ',')}%</b></div><div class="bar"><i style="width:${Math.max(gp, 0.5)}%"></i></div></div>
      <h2>Saxo · tryout money</h2><div class="card"><div class="mut2">enkel Mike</div><div class="big2">${euro(B.saxo)}</div>${sx}
        <div class="row li2"><b>Totaal Saxo</b><b>${euro(B.saxo)} · <span class="${B.saxoRes < 0 ? 'neg' : 'pos'}">${signed(B.saxoRes)} · −${Math.abs(B.saxoResPct).toFixed(1).replace('.', ',')}%</span></b></div>
        <p class="mut2">Telt mee in het totaal van beleggen, maar niet in de percentages van ${S.doel.join('-')}. Lange horizon, dus beperkt houden.</p></div>
      <p class="mut2">De koersen worden bijgewerkt wanneer je een nieuw gegevensbestand inlaadt (hoofdmenu → Gegevens inladen).</p>`;
    document.getElementById('back').onclick = backFin;
    app.querySelectorAll('#wtabs button').forEach(b => b.onclick = () => { who = b.dataset.w; beleggen(name); });
  }
  function loopbaan(P) {
    const tot = P.einde - P.start, fr = (Date.now() - Date.UTC(P.start, 0, 1)) / (365.25 * DAYMS), nu = Math.min(Math.max(Math.floor(fr), 0), tot);
    return { nu, tot, pct: Math.min(Math.max(fr, 0), tot) / tot * 100 };
  }
  function timeline(P) {
    const lb = loopbaan(P), tot = lb.tot; let lab = '';
    for (let y = P.start; y < P.einde - 1; y += 5) { const l = (y - P.start) / tot * 100; lab += `<span style="position:absolute;left:${l.toFixed(2)}%;transform:translateX(${y === P.start ? '0' : '-50%'});font-size:10px;color:#9FB2DE">${y}</span>`; }
    return `<div style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;font-size:14px"><span style="font-weight:600">Loopbaan ${esc(P.naam)}</span><span style="color:#B8C7EE">${lb.nu} van ${tot} jaar</span></div>
      <div style="position:relative;height:16px;margin-top:4px">${lab}</div>
      <div style="position:relative;height:14px;border-radius:99px;background:#1B3573;margin:0 0 4px"><div style="width:${lb.pct.toFixed(1)}%;height:100%;border-radius:99px;background:#3FA0FF"></div>
        <div style="position:absolute;left:0;right:0;top:0;bottom:0;border-radius:99px;background-image:repeating-linear-gradient(to right,transparent 0,transparent calc(100% / ${tot} - 1px),rgba(234,240,255,0.45) calc(100% / ${tot} - 1px),rgba(234,240,255,0.45) calc(100% / ${tot}))"></div>
        <div style="position:absolute;left:0;right:0;top:-4px;bottom:-4px;background-image:repeating-linear-gradient(to right,transparent 0,transparent calc(100% * 5 / ${tot} - 2px),#EAF0FF calc(100% * 5 / ${tot} - 2px),#EAF0FF calc(100% * 5 / ${tot}))"></div></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;margin-top:-4px"><div style="width:2px;height:14px;background:#EAF0FF"></div><div style="font-size:11px;font-weight:700;color:#EAF0FF;margin-top:2px">${P.einde}</div><div style="font-size:11px;color:#9FB2DE">Einde</div></div></div>`;
  }
  function pensioen(name) {
    const P = data.pensioen; if (!P) { app.innerHTML = noData(name); document.getElementById('back').onclick = backFin; return; }
    const som = x => x.fondsen.reduce((a, f) => a + f.bedrag, 0), tot = som(P.mike) + som(P.marie);
    const blok = x => {
      const lb = loopbaan(x);
      return `<div class="card"><div class="row"><b class="big2">${esc(x.naam)}</b><b class="big2">${euro(som(x), 2)}</b></div>
        <div class="row"><span>Maandelijkse inleg</span><b>${euro(x.inleg, 2)}</b></div><div class="row"><span>Fiscaal voordeel per jaar</span><b>${euro(x.voordeel)}</b></div>
        ${x.fondsen.map(f => `<div class="li2 row"><span>${esc(f.bank)} · ${esc(f.naam)}<br><span class="mut2">${f.actief ? 'Actief' : 'Inactief'}</span></span><b>${euro(f.bedrag, 2)}</b></div>`).join('')}
        <div class="mut2">${esc(x.stand)}</div>
        <div class="row li2"><span>Aanvullend pensioen (werkgever)</span><b>${x.aanvullend == null ? '–' : euro(x.aanvullend, 2)}</b></div>
        <div style="margin-top:12px">${timeline(x)}</div></div>`;
    };
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Pensioen</h1><p class="mut">Wat je opbouwt voor later.</p>
      <div class="card"><div class="mut2">Totaal pensioensparen</div><div class="huge">${euro(tot, 2)}</div><div class="row mut2"><span>Mike <b>${euro(som(P.mike), 2)}</b></span><span>Marie <b>${euro(som(P.marie), 2)}</b></span></div></div>
      ${blok(P.mike)}${blok(P.marie)}
      <div class="card"><div class="row"><span>Terugbetaling cafetariaplan (via loonbrief)</span><b>${euro(P.cafetaria)} per maand</b></div></div>`;
    document.getElementById('back').onclick = backFin;
  }
  function indexScherm(name) {
    const X = data.index; if (!X) { app.innerHTML = noData(name); document.getElementById('back').onclick = backFin; return; }
    const nf = n => n.toLocaleString('nl-BE', { minimumFractionDigits: 2 }), te = X.spil - X.waarde, L = data.loonbarema;
    const rows = X.tabel.map(r => `<div class="ix3"><span><b>${esc(r.maand)}</b>${r.label ? `<br><span class="mut2">${esc(r.label)}</span>` : ''}</span><span>${nf(r.waarde)}</span><span>${nf(r.spil)}</span></div>`).join('');
    let voorjou = '';
    if (L) { const p = X.plafond, vol = L.schaduwloon * 0.02, beperkt = p * 0.02;
      voorjou = `<h2>Wat betekent dit voor jou?</h2><div class="card"><div class="mut2">Je schaduwloon (${euro(L.schaduwloon, 2)}) ligt boven het plafond van ${euro(p)}. Bij een indexering van 2% telt dus enkel het deel tot ${euro(p)} mee, dat is ${euro(beperkt)} in plaats van ongeveer ${euro(vol)}. Dit is een rekenvoorbeeld op basis van de regels hierboven, niet je echte indexering.</div></div>`; }
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Index</h1><p class="mut">De indexering van je loon.</p>
      <div class="card"><div class="mut2">Afgevlakte gezondheidsindex</div><div class="huge">${nf(X.waarde)}</div><div class="mut2">${esc(X.maand)}</div></div>
      <div class="card"><div class="mut2">Volgende spilindex (chemie)</div><div class="huge">${nf(X.spil)}</div><div class="mut2">nog ${nf(te)} punten te gaan</div></div>
      <div class="card"><div class="mut2">Laatste overschrijding</div><div class="big2">${esc(X.overschreden.maand)}</div><div class="mut2">${nf(X.overschreden.waarde)} tegenover spilindex ${nf(X.overschreden.spil)}</div></div>
      <h2>Zo werkt het</h2><div class="card"><div class="mut2">${esc(X.uitleg)}</div></div>
      <h2>Maand per maand</h2><div class="card"><div class="ix3 hd"><span>Maand</span><span>Afgevlakte index</span><span>Spilindex chemie</span></div>${rows}</div><p class="mut2">${esc(X.bron)}</p>
      <h2>Hoe werkt de centenindex?</h2><div class="card">${X.centen.map(c => `<div class="mut2">• ${esc(c)}</div>`).join('')}</div>${voorjou}
      <div class="ok" style="background:#3a2f0b;color:#fcd34d">Datum en percentage van je echte indexeringen nog in te vullen</div>`;
    document.getElementById('back').onclick = backFin;
  }
  function loonbarema(name) {
    const L = data.loonbarema; if (!L) { app.innerHTML = noData(name); document.getElementById('back').onclick = backFin; return; }
    const ci = L.cats.indexOf(L.categorie), nu = L.tabel[L.anc][ci], volg = L.tabel[L.anc + 1][ci];
    const kop = '<tr><th>Anc.</th>' + L.cats.map(c => `<th>${c}</th>`).join('') + '</tr>';
    const body = L.tabel.map((r, a) => `<tr><th>${a}</th>${r.map((v, i) => `<td class="${i === ci && a === L.anc ? 'hi1' : i === ci && a === L.anc + 1 ? 'hi2' : ''}">${v.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</td>`).join('')}</tr>`).join('');
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Loonbarema</h1><p class="mut">Het barema waarop je loon gebaseerd is.</p><div class="ok">Weddetabel uit je eigen bestand${L.geldigVanaf ? ' · geldt vanaf ' + esc(L.geldigVanaf) : ''}</div>
      <div class="card"><div class="mut2">${esc(L.naam)}</div><div class="big2">Categorie ${L.categorie}${String(L.anc).padStart(2, '0')}</div>
        <div class="row"><span>Schaduwloon</span><b>${euro(L.schaduwloon, 2)}</b></div><div class="row"><span>Basismaandloon</span><b>${euro(L.basis, 2)}</b></div><div class="row"><span>Shiftpremie</span><b>${euro(L.shiftpremie, 2)}</b></div></div>
      <h2>Volgende stappen</h2>
      <div class="card"><div class="row"><b>${L.categorie}${String(L.anc + 1).padStart(2, '0')}</b><span class="pill Kan">Zeker</span></div><div class="mut2">${esc(L.volgende[0].tekst)} Volgens de tabel ${euro(volg, 2)} (+ ${euro(volg - nu, 2)}).</div></div>
      ${L.volgende.slice(1).map(v => `<div class="card"><div class="row"><b>${esc(v.titel)}</b><span class="pill Krap">Nog niet zeker</span></div><div class="mut2">${esc(v.tekst)}</div></div>`).join('')}
      <h2>Weddetabel</h2><p class="mut2">Anciënniteit (Anc.) per categorie. ${L.categorie}${String(L.anc).padStart(2, '0')} is donkergroen, ${L.categorie}${String(L.anc + 1).padStart(2, '0')} lichtgroen.</p>
      <div class="tw"><table>${kop}${body}</table></div>`;
    document.getElementById('back').onclick = backFin;
  }
  const MND = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  function leefCalc(Lf) {
    const I = Lf.inkomsten, V = Lf.vast, S = Lf.sparen, ink = I.loonMike + I.loonMarie + I.kindergeld, vast = V.hypotheek + V.auto + V.creche,
      spar = S.vaste + S.toekomstige + S.pensioenMike + S.pensioenMarie + S.beleggen, rest = ink - vast - spar - (Lf.aanzuivering || 0),
      L = Math.max(Math.min(Lf.doel, rest), 0), B = Math.max(rest - Lf.doel, 0), U = Lf.uitgegeven, nog = L - U, bufLeft = Math.max(B - Math.max(U - L, 0), 0);
    const st = new Date(Lf.start + 'T00:00:00'), en = new Date(Lf.einde + 'T00:00:00'), t = new Date(); t.setHours(0, 0, 0, 0);
    const dagen = Math.max(Math.round((en - t) / DAYMS) + 1, 0), fmtD = x => x.getDate() + ' ' + MND[x.getMonth()];
    return { ink, vast, spar, rest, L, B, U, nog, bufLeft, dagen, periode: fmtD(st) + ' – ' + fmtD(en), besteedPct: L > 0 ? Math.min(U / L * 100, 100) : 100 };
  }
  function leefbudget(name) {
    const Lf = data.leefbudget; if (!Lf) { app.innerHTML = noData(name); document.getElementById('back').onclick = backFin; return; }
    const c = leefCalc(Lf), I = Lf.inkomsten, V = Lf.vast, S = Lf.sparen, e = x => euro(x, Math.abs(x % 1) > 0.004 ? 2 : 0);
    const row = (a, b, st) => `<div style="display:flex;justify-content:space-between;gap:12px;${st || 'color:#EAF0FF'}"><span>${a}</span><span>${b}</span></div>`;
    const chip = (t, bg, bd) => `<div style="align-self:flex-start;padding:5px 12px;border-radius:8px;background:${bg};border:1px solid ${bd};font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">${t}</div>`;
    const hr = '<div style="height:1px;background:#223F80"></div>', art = 'padding:24px;border-radius:20px;background:#11275A;border:1px solid #223F80;margin-bottom:14px';
    const mini = (t, v) => `<div style="${art};margin:0"><div class="dl">${t}</div><div style="margin-top:10px;font-size:28px;font-weight:800">${v}</div></div>`;
    const bar = (pct, col) => `<div style="height:10px;border-radius:99px;background:#1B3573"><div style="width:${Math.min(pct, 100).toFixed(0)}%;height:100%;border-radius:99px;background:${col}"></div></div>`;
    const uitg = c.vast + c.U, uitgPlan = c.vast + c.L, over = c.nog < 0;
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Leefbudget</h1><p class="mut">${c.periode} · nog ${c.dagen} dag${c.dagen === 1 ? '' : 'en'} tot het volgende loon</p>
      <div class="ok">Echte cijfers · stand van ${new Date().getDate()} ${MND[new Date().getMonth()]}</div>
      <article style="${art};display:flex;flex-direction:column;gap:14px"><div class="dl" style="font-size:13px">Hoe dit bedrag tot stand komt</div>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:15px">${chip('Inkomsten', '#14532D', '#1E7A43')}
        ${row('Loon Mike', e(I.loonMike))}${row('Loon Marie', e(I.loonMarie))}${row('waarvan RVA-bijpassing', e(I.rva), 'padding-left:18px;font-size:14px;color:#B8C7EE')}${row('Kindergeld', e(I.kindergeld))}${row('Totaal inkomsten', '<b>' + e(c.ink) + '</b>')}${hr}
        ${chip('Grote vaste kosten', '#7F1D1D', '#A32A2A')}${row('Hypotheek', '− ' + e(V.hypotheek))}${row('Autolening', '− ' + e(V.auto))}${row('Crèche', '− ' + e(V.creche))}${row('Totaal vaste kosten', '<b>− ' + e(c.vast) + '</b>')}${hr}
        ${chip('Sparen', '#1E3A8A', '#2F55B8')}${row('Vaste spaarrekening', '− ' + e(S.vaste), 'color:#B8C7EE')}${row('Toekomstige spaarrekening', '− ' + e(S.toekomstige), 'color:#B8C7EE')}${row('Pensioensparen Mike', '− ' + e(S.pensioenMike), 'color:#B8C7EE')}${row('Pensioensparen Marie', '− ' + e(S.pensioenMarie), 'color:#B8C7EE')}${row('Beleggen', '− ' + e(S.beleggen), 'color:#B8C7EE')}${Lf.aanzuivering ? row('Aanvullen spaarrekening', '− ' + e(Lf.aanzuivering), 'color:#B8C7EE') : ''}${row('Totaal sparen', '<b>− ' + e(c.spar + (Lf.aanzuivering || 0)) + '</b>')}${hr}
        <div style="display:flex;justify-content:space-between"><span style="font-weight:700">Leefbudget</span><b>${e(c.L)}</b></div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:20px;font-weight:800;color:#FCA5A5"><span>Al uitgegeven</span><span>${e(c.U)}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:20px;font-weight:800;color:${over ? '#FCA5A5' : '#6EE7B7'}"><span>Nog te besteden</span><span>${over ? '− ' + e(-c.nog) : e(c.nog)}</span></div>
        ${!over && c.dagen > 0 ? `<div style="text-align:right;font-size:13px;color:#B8C7EE;margin-top:-6px">± ${e(c.nog / c.dagen)} per dag</div>` : ''}
        ${over ? `<div style="text-align:right;font-size:13px;color:#FCD34D;margin-top:-6px">Boven je leefbudget: je buffer wordt aangesproken</div>` : ''}${hr}
        <div style="display:flex;justify-content:space-between"><span style="font-weight:700">Buffer</span><b>${e(c.bufLeft)}</b></div><div class="mut2" style="margin-top:4px">Beginbedrag van deze periode: ${e(c.B)}</div></div></article>
      <article style="${art};display:flex;flex-direction:column;gap:18px"><div class="dl" style="font-size:13px">Maandelijkse balans</div>
        <div><div style="display:flex;justify-content:space-between;font-size:15px;margin-bottom:8px"><span style="font-weight:600">Inkomsten</span><span style="color:#6EE7B7">${e(c.ink)} / ${e(c.ink)} · binnen</span></div>${bar(100, '#34D399')}</div>
        <div><div style="display:flex;justify-content:space-between;font-size:15px;margin-bottom:8px"><span style="font-weight:600">Uitgaven</span><span style="color:#B8C7EE">${e(uitg)} / ${e(uitgPlan)}</span></div>${bar(uitgPlan > 0 ? uitg / uitgPlan * 100 : 100, '#F87171')}</div>
        ${hr}<div style="display:flex;justify-content:flex-end;align-items:baseline"><span style="color:#FDBA74;font-weight:800;font-size:20px">${c.ink - uitg < 0 ? '− ' : '+ '}${e(Math.abs(c.ink - uitg))} <span style="font-size:13px;font-weight:600;color:${c.ink - uitg < 0 ? '#FCA5A5' : '#6EE7B7'}">${c.ink - uitg < 0 ? 'negatief' : 'positief'}</span></span></div></article>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${mini('Maaltijdcheques', Lf.maaltijdcheques ? e(Lf.maaltijdcheques) : '–')}${mini('Buffer', e(c.bufLeft) + '<div class="mut2" style="font-size:12px;font-weight:400;margin-top:4px">begin ' + e(c.B) + '</div>')}${mini('Beleggen', e(S.beleggen))}${mini('Pensioensparen', e(S.pensioenMike + S.pensioenMarie))}${mini('Spaarrekening', e(S.vaste + S.toekomstige))}</div>
      <p class="mut2">Leefbudget = inkomsten − grote vaste kosten − sparen, met een maximum van ${e(Lf.doel)}. Wat daarboven overblijft, is je buffer. Maaltijdcheques komen er als surplus bovenop.</p>`;
    document.getElementById('back').onclick = backFin;
  }
  let inkTab = 'jaar';
  function inkomsten(name) {
    const I = data.inkomsten; if (!I) { app.innerHTML = noData(name); document.getElementById('back').onclick = backFin; return; }
    const vorig = I.jaren.find(j => j.jaar === I.jaar - 1), huidig = I.jaren.find(j => j.jaar === I.jaar), max = Math.max(...I.jaren.map(j => j.bedrag));
    const maanden = I.maanden.map(m => `<div class="card"><div class="row"><b>${esc(m.naam)}</b><b>${m.bedrag == null ? '–' : euro(m.bedrag, 2)}</b></div>
      <div class="mut2">${esc(m.status)}</div>${(m.notes || []).map(n => `<div class="mut2">• ${esc(n)}</div>`).join('')}</div>`).join('');
    const jaren = I.jaren.map((j, i) => {
      const prev = I.jaren[i - 1], pct = prev ? (j.bedrag / prev.bedrag - 1) * 100 : null, lopend = j.jaar === I.jaar;
      return `<div class="card"><div class="row"><b>${j.jaar}</b><b>${euro(j.bedrag)}</b></div><div class="bar"><i style="width:${j.bedrag / max * 100}%"></i></div>
        <div class="row mut2"><span>${lopend ? 'Lopend' : ''}</span><span class="${lopend ? '' : pct == null ? '' : pct < 0 ? 'neg' : 'pos'}" ${lopend ? 'style="color:#FB923C"' : ''}>${pct == null ? '–' : (pct < 0 ? '−' : '+') + Math.abs(pct).toFixed(1).replace('.', ',') + '%'}</span></div></div>`;
    }).join('');
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Inkomsten</h1><p class="mut">Wat er dit jaar binnenkwam en nog komt. Netto, jij en Marie samen.</p>
      <div class="ok">${esc(I.badge)}</div>
      <div class="card" style="padding:28px;display:flex;flex-direction:column;gap:14px;border-radius:20px"><div class="dl" style="font-size:13px">${I.jaar}</div><div style="font-size:52px;font-weight:800;letter-spacing:-.03em;line-height:1">${euro(huidig.bedrag)}</div>
        <div style="display:flex;justify-content:space-between;font-size:14px;color:#B8C7EE"><span></span><span>${I.jaar - 1}: ${euro(vorig.bedrag)}</span></div>
        <div style="height:28px;border-radius:99px;background:#1B3573;overflow:hidden"><div style="width:${Math.min(huidig.bedrag / vorig.bedrag * 100, 100).toFixed(0)}%;height:100%;background:#34D399;display:flex;align-items:center;padding-left:12px;font-size:13px;font-weight:700;color:#06281C;white-space:nowrap">${Math.round(huidig.bedrag / vorig.bedrag * 100)}% van ${I.jaar - 1}</div></div></div>
      <div class="tabs"><button data-t="maand" class="${inkTab === 'maand' ? 'on' : ''}">Per maand</button><button data-t="jaar" class="${inkTab === 'jaar' ? 'on' : ''}">Per jaar</button></div>
      ${inkTab === 'maand' ? maanden : jaren + `<p class="mut2">${esc(I.noot)}</p>`}`;
    document.getElementById('back').onclick = backFin;
    app.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { inkTab = b.dataset.t; inkomsten(name); });
  }
  const MAAND3 = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  function spTile(S) {
    const m = S.huidigeMaand, g = S.regels, now = g.spaarrekeningen.gestort + g.beleggen.gestort + g.pensioen.gestort, jaarG = S.gestort.reduce((a, x) => a + (x.bedrag || 0), 0), jaarP = S.maandPlan * 12;
    const ex = S.extras, exT = ex.reduce((a, x) => a + x.bedrag, 0), exB = ex.filter(x => x.binnen).length;
    const blok = (lab, big, small, pct, col, labcol) => `<div style="display:flex;flex-direction:column;gap:10px;margin-top:14px"><div style="font-size:13px;color:${labcol || '#B8C7EE'}">${lab}</div><div style="font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1">${big} <span style="font-size:16px;font-weight:600;color:#9FB2DE">${small}</span></div><div style="height:12px;border-radius:99px;background:#1B3573"><div style="width:${Math.max(Math.min(pct, 100), 0)}%;height:100%;border-radius:99px;background:${col}"></div></div></div>`;
    return `<div class="dl">Spaarplan</div>${blok('Maandelijks', euro(now), 'van ' + euro(S.maandPlan), now / S.maandPlan * 100, '#3FA0FF')}${blok('Jaarlijks', euro(jaarG), 'van ' + euro(jaarP), jaarG / jaarP * 100, '#3FA0FF')}${blok("Extra's", euro(exT), `${exB} van ${ex.length} binnen`, exB / ex.length * 100, '#FDBA74', '#FDBA74')}`;
  }
  function spaarplan(name) {
    const S = data.spaarplan; if (!S) { app.innerHTML = noData(name); document.getElementById('back').onclick = backFin; return; }
    const g = S.regels, now = g.spaarrekeningen.gestort + g.beleggen.gestort + g.pensioen.gestort, jaarG = S.gestort.reduce((a, x) => a + (x.bedrag || 0), 0), jaarP = S.maandPlan * 12;
    const ex = S.extras, exT = ex.reduce((a, x) => a + x.bedrag, 0), exB = ex.filter(x => x.binnen).length;
    const lijn = (l, o) => `<div class="row li2"><span>${l}</span><b>${euro(o.gestort)} / ${euro(o.plan)}</b></div>`;
    const maanden = S.gestort.map((x, i) => {
      const st = i < S.huidigeMaand ? (x.bedrag >= S.maandPlan ? ['Gelukt', 'Kan'] : ['Niet gelukt', 'Botst']) : i === S.huidigeMaand ? ['Lopend', 'Krap'] : ['Nog te komen', ''];
      const exs = ex.filter(e => e.maand === x.maand).map(e => `<div class="mut2">+ Extra: ${esc(e.naam)} · ${euro(e.bedrag)} · ${e.binnen ? 'binnen' : 'nog te komen'}</div>`).join('');
      return `<div class="card"><div class="row"><b>${x.maand}</b>${st[1] ? `<span class="pill ${st[1]}">${st[0]}</span>` : `<span class="mut2">${st[0]}</span>`}</div><div class="row"><span>${x.bedrag == null ? '–' : (x.bedrag < 0 ? '− ' : '') + euro(Math.abs(x.bedrag), 2)} / ${euro(S.maandPlan)}</span></div>${exs}</div>`;
    }).join('');
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Spaarplan</h1><p class="mut">Gepland tegenover gestort.</p>
      <div class="card">${spTile(S)}</div>
      <div class="card"><h3>Deze periode</h3>${lijn('Spaarrekeningen (vaste + toekomstige uitgaven)', g.spaarrekeningen)}${lijn('Beleggen (BUX)', g.beleggen)}${lijn('Pensioensparen', g.pensioen)}<p class="mut2">De twee spaarrekeningen staan in je Excel samen. Het negatieve bedrag is wat je tijdelijk hebt opgenomen.</p></div>
      <h2>Per maand</h2>${maanden}
      <p class="mut2">De bedragen bij de Extra's zijn schattingen.</p>`;
    document.getElementById('back').onclick = backFin;
  }
  function schulden(name) {
    const D = data.schulden; if (!D) { app.innerHTML = noData(name); document.getElementById('back').onclick = backFin; return; }
    const H = D.hypotheek, A = D.auto, R = '#FCA5A5', O = '#FDBA74', LB = '#B8C7EE', MU = '#9FB2DE', W = '#EAF0FF';
    const art = 'box-sizing:border-box;padding:24px;border-radius:20px;background:#11275A;border:1px solid #223F80;display:flex;flex-direction:column;gap:14px;margin-bottom:14px';
    const lab = 'font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9FB2DE';
    const bar = (g, r, tg, tr) => `<div style="display:flex;height:28px;border-radius:99px;overflow:hidden;gap:2px;font-size:13px;font-weight:800;color:#04122E"><div style="width:${g}%;background:#34D399;display:flex;align-items:center;justify-content:center;white-space:nowrap">${tg}</div><div style="width:${r}%;background:#F87171;display:flex;align-items:center;justify-content:center;white-space:nowrap">${tr}</div></div>`;
    const delen = H.delen.map(x => `<div style="display:flex;flex-direction:column;gap:4px;padding-bottom:4px"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 12px;font-size:15px"><span style="font-weight:700">${esc(x.naam)}</span><span><b style="color:${R}">${euro(x.rest, 2)}</b> <span style="color:${LB}">nog te betalen · waarvan <b style="color:${O}">${euro(x.rente, 2)}</b> rente</span></span></div>
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 12px;font-size:13px;color:${LB}"><span>nog ${esc(x.nog)}</span><span><b style="color:${W}">${euro(x.maand, 2)} per maand</b></span></div>
      <div style="font-size:12px;color:${MU}">Van ${euro(x.bedrag)} · ${esc(x.van)} tot ${esc(x.tot)} · ${esc(x.rentePct)} rente · al afgelost ${euro(x.afgelost, 2)}</div></div>`).join('');
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Schulden</h1><p class="mut">Nog te betalen, kapitaal plus rente.</p><div class="ok">Echte cijfers · stand van ${esc(D.stand)}</div>
      <article style="${art};gap:10px"><div style="${lab}">Totaal nog te betalen</div><div style="font-size:44px;font-weight:800;letter-spacing:-.03em;line-height:1;color:${R}">${euro(D.totaal, 2)}</div>${bar(D.aflossPct, 100 - D.aflossPct, D.aflossPct + '%', (100 - D.aflossPct) + '%')}<div style="display:flex;justify-content:space-between;font-size:13px;color:#B8C7EE"><span><span style="color:#34D399">●</span> ${D.aflossPct}% afgelost</span><span><span style="color:#F87171">●</span> ${100 - D.aflossPct}% nog te betalen</span></div><div style="font-size:15px;color:${LB}">Maandelijks aflosbedrag: <b style="color:${W}">${euro(D.perMaand, 2)} per maand</b></div></article>
      <article style="${art}"><div style="${lab}">Hypotheek</div><div style="font-size:32px;font-weight:800;letter-spacing:-.02em;line-height:1;color:${R}">${euro(H.rest, 2)}</div>
        <div style="font-size:14px;color:${LB}"><b style="color:${W}">${euro(H.perMaand, 2)} per maand</b> voor de drie delen samen</div><div style="font-size:14px;color:${LB}">waarvan <b style="color:${O}">${euro(H.rente, 2)}</b> rente</div>
        ${typeof H.pct === 'number' ? bar(H.pct, 100 - H.pct, H.pct + '%', (100 - H.pct) + '%') : ''}<div style="height:1px;background:#223F80"></div>${delen}
        <div style="font-size:12px;color:${MU};border-top:1px solid #223F80;padding-top:10px">${esc(H.noot)}</div></article>
      <article style="${art}"><div style="${lab}">Autolening</div><div style="font-size:32px;font-weight:800;letter-spacing:-.02em;line-height:1;color:${R}">${euro(A.rest, 2)}</div>
        <div style="font-size:14px;color:${LB}">nog ${esc(A.nog)} · <b style="color:${W}">${euro(A.maand, 2)} per maand</b></div><div style="font-size:14px;color:${LB}">waarvan <b style="color:${O}">${euro(A.rente, 2)}</b> rente</div>
        ${typeof A.pct === 'number' ? bar(A.pct, 100 - A.pct, A.pct + '%', (100 - A.pct) + '%') : ''}<div style="font-size:12px;color:${MU}">${esc(A.noot)}</div></article>`;
    document.getElementById('back').onclick = backFin;
  }

  function dashboard() {
    const n = new Date(), { todayT, nowT } = localParts(), [y, m, d] = ymd(todayT), sh = shiftOf(y, m, d);
    let nt = todayT + DAYMS, k = 0; while (shiftOf(...ymd(nt)) === 'Off' && k++ < 40) nt += DAYMS;
    const nd = new Date(nt), nsh = shiftOf(...ymd(nt)), up = upcomingMatches(nowT, todayT).find(x => x.start !== null);
    const card = (id, t, body) => `<div class="tile dash" data-go="${id}" role="button" tabindex="0"><div class="dl">${t}</div>${body}<div class="db">Details</div></div>`;
    const T = {};
    T.wk = (card('wk', 'Werkkalender', `<div class="mut2">Vandaag</div><div class="row"><span class="pill sh${sh}">${sh}</span></div><div class="mut2">Volgende shift: ${DN[nd.getUTCDay()]} ${nd.getUTCDate()}/${nd.getUTCMonth() + 1} (${nsh})</div>`));
    if (up) { const rt = rateMatch(up), MN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']; T.vb = (card('vb', 'Voetbal · KFC Moerbeke B', `<div style="font-size:13px;color:#B8C7EE">Volgende wedstrijd</div><div style="font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1.1">${esc(up.opp)}</div><div class="row"><span style="font-size:14px;color:#D5E0FA">${DN[new Date(up.dayT).getUTCDay()]} ${up.d} ${MN[up.m]} · ${up.time} · ${up.home ? 'thuis' : 'uit'}</span>${rt ? `<span class="pill ${rt.lvl}">${rt.lvl}${rt.sh ? ' · ' + rt.sh : ''}</span>` : ''}</div>`)); }
    const B = data.beleggen, I = data.inkomsten, S = data.schulden;
    if (B) T.bel = (card('bel', 'Beleggen', `<div class="huge">${euro(B.totaal)}</div><div class="mut2">(waarvan winst: <b style="color:#6EE7B7">${euro(B.winst)}</b>)</div><div class="row mut2"><span>BUX <b>${euro(B.bux)}</b></span><span>Saxo <b>${euro(B.saxo)}</b></span><span>Cash <b>${euro(B.cash)}</b></span></div>`));
    if (I) { const h = I.jaren.find(j => j.jaar === I.jaar), v = I.jaren.find(j => j.jaar === I.jaar - 1), pc = Math.round(h.bedrag / v.bedrag * 100); T.ink = (card('ink', 'Inkomsten', `<div style="font-size:16px;font-weight:700;color:#B8C7EE;margin-top:8px">${I.jaar}</div><div style="font-size:32px;font-weight:800;letter-spacing:-.02em;line-height:1">${euro(h.bedrag)}</div><div style="display:flex;justify-content:space-between;font-size:13px;color:#B8C7EE;margin-top:8px"><span>tot nu toe binnen</span><span>${I.jaar - 1}: ${euro(v.bedrag)}</span></div><div style="height:28px;border-radius:99px;background:#1B3573;overflow:hidden;margin-top:6px"><div style="width:${Math.min(pc, 100)}%;height:100%;background:#34D399;display:flex;align-items:center;padding-left:12px;font-size:13px;font-weight:700;color:#06281C;white-space:nowrap">${pc}% van ${I.jaar - 1}</div></div>`)); }
    const LF = data.leefbudget; if (LF) { const c = leefCalc(LF), e = x => euro(x, Math.abs(x % 1) > 0.004 ? 2 : 0), pc = Math.round(c.besteedPct), bp = c.B > 0 ? Math.round(c.bufLeft / c.B * 100) : 0;
      T.lf = (card('lf', 'Leefbudget', `<div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 12px;margin-top:-18px"><span></span><span style="font-size:14px;font-weight:600;color:#D5E0FA">${c.periode}</span></div><div><div style="font-size:34px;font-weight:800;letter-spacing:-.02em;line-height:1">${e(c.L)}</div><div style="margin-top:8px;font-size:15px;color:#B8C7EE">beginbudget van deze periode</div></div>
      <div style="display:flex;height:28px;border-radius:99px;overflow:hidden;gap:2px;font-size:13px;font-weight:800;color:#04122E"><div style="width:${pc}%;background:#F87171;display:flex;align-items:center;justify-content:center">${pc}%</div>${pc < 100 ? `<div style="width:${100 - pc}%;background:#34D399;display:flex;align-items:center;justify-content:center">${100 - pc}%</div>` : ''}</div>
      <div style="display:flex;justify-content:space-between;gap:12px"><div><div style="font-size:13px;color:#B8C7EE">Reeds besteed</div><div style="margin-top:4px;font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1;color:#FCA5A5">${e(c.U)}</div></div><div style="text-align:right"><div style="font-size:13px;color:#B8C7EE">Nog te besteden</div><div style="margin-top:4px;font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1;color:${c.nog < 0 ? '#FCA5A5' : '#6EE7B7'}">${c.nog < 0 ? '− ' + e(-c.nog) : e(c.nog)}</div></div></div>
      <div><div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px;color:#B8C7EE;margin-bottom:8px"><span>Buffer · begin ${e(c.B)}</span><span style="color:#D5E0FA;font-weight:600">${e(c.bufLeft)}</span></div><div style="height:28px;border-radius:99px;background:#1B3573;overflow:hidden"><div style="width:${bp}%;height:100%;background:#34D399;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#04122E">${bp > 12 ? bp + '%' : ''}</div></div></div>`)); }
    const PE = data.pensioen; if (PE) T.pen = (card('pen', 'Pensioen', `<div style="display:flex;flex-direction:column;gap:16px;margin-top:12px">${timeline(PE.mike)}${timeline(PE.marie)}</div>`));
    const X = data.index; if (X) T.ix = (card('ix', 'Index', `<div class="huge">${X.waarde.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</div><div class="mut2">${esc(X.maand)} · nog ${(X.spil - X.waarde).toLocaleString('nl-BE', { minimumFractionDigits: 2 })} punten tot de spilindex</div>`));
    const L = data.loonbarema; if (L) T.lb = (card('lb', 'Loonbarema', `<div style="font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1;margin-top:6px">Categorie ${L.categorie}${String(L.anc).padStart(2, '0')}</div><div style="display:flex;justify-content:space-between;gap:12px;font-size:15px;margin-top:6px"><span style="font-weight:600">Schaduwloon</span><span style="color:#B8C7EE">${euro(L.schaduwloon, 2)}</span></div><div style="display:flex;justify-content:space-between;gap:12px;font-size:15px"><span style="font-weight:600;color:#6EE7B7">Basismaandloon</span><span style="font-weight:700;color:#6EE7B7">${euro(L.basis, 2)}</span></div><div style="display:flex;justify-content:space-between;gap:12px;font-size:15px"><span style="font-weight:600;color:#6EE7B7">Shiftpremie</span><span style="font-weight:700;color:#6EE7B7">${euro(L.shiftpremie, 2)}</span></div>`));
    const SP = data.spaarplan; if (SP) T.spp = (card('spp', '', spTile(SP)));
    if (S) T.sch = (card('sch', 'Schulden', `<div style="font-size:34px;font-weight:800;letter-spacing:-.02em;line-height:1;margin-top:8px">${euro(S.totaal, 2)} <span style="font-size:15px;font-weight:600;color:#9FB2DE">nog te betalen</span></div>`));
    const order = ['lf', 'spp', 'ink', 'bel', 'sch', 'pen', 'vb', 'wk', 'lb', 'ix'], res = order.filter(k => T[k]).map(k => T[k]);
    if (!B) res.unshift(`<div class="card mut2">Laad je gegevensbestand in (Meer → Gegevens inladen) om je cijfers op het dashboard te zien.</div>`);
    return res.join('');
  }
  function home() {
    curTab = 'home'; renderNav();
    app.innerHTML = `<h1>Dashboard</h1>` + dashboard();
    const GO = { lf: () => leefbudget('Leefbudget'), wk: () => werkkalender(), vb: () => voetbal('Voetbal'), bel: () => beleggen('Beleggen'), ink: () => inkomsten('Inkomsten'), sch: () => schulden('Schulden'), lbd: () => leefbudget('Leefbudget'), spp: () => spaarplan('Spaarplan'), pen: () => pensioen('Pensioen'), ix: () => indexScherm('Index'), lb: () => loonbarema('Loonbarema') };
    app.querySelectorAll('.tile[data-go]').forEach(b => b.onclick = () => { fromDash = true; GO[b.dataset.go](); });
  }
  function boekingen() {
    curTab = 'boek'; renderNav();
    app.innerHTML = `<h1>Boekingen</h1><div class="card mut2">De boekingen uit PDT komen in een volgende versie.</div>`;
  }
  let curTab = 'home';
  function renderNav() {
    let n = document.getElementById('nav');
    if (!n) { n = document.createElement('nav'); n.id = 'nav'; document.body.appendChild(n); }
    const it = (k, l, svg) => `<button data-k="${k}" class="${curTab === k ? 'on' : ''}" ${k === 'home' ? 'aria-label="Home"' : ''}>${svg || l}</button>`;
    n.innerHTML = it('home', '', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-6h4v6"/></svg>') + it('fin', 'Financieel') + it('plan', 'Planning') + it('meer', 'Meer');
    n.style.display = 'flex';
    n.querySelectorAll('button').forEach(b => b.onclick = () => { const k = b.dataset.k; if (k === 'home') home(); else if (k === 'fin') { fromDash = false; curTab = 'fin'; renderNav(); financieel('Financieel'); } else if (k === 'plan') planning(); else meer(); });
  }
  function meer() {
    curTab = 'meer'; renderNav();
    app.innerHTML = `<h1>Meer</h1>` +
      `<h2>Gegevens</h2><div class="card"><div class="row"><button class="ghost" id="exp">Back-up maken</button><button class="ghost" id="imp">Back-up terugzetten</button><button class="ghost" id="bioset">${localStorage.getItem(K_BIO) ? 'Face ID uitschakelen' : 'Face ID inschakelen'}</button><button class="ghost" id="lock">Vergrendelen</button></div><p><button class="ghost" id="load">Gegevens inladen</button></p>
      <p class="mut">Een back-up is een versleuteld bestand. Bewaar het in iCloud Drive (Bestanden-app).</p><input type="file" id="file" hidden><input type="file" id="gfile" accept=".json" hidden></div>`;
    document.getElementById('lock').onclick = lockScreen;
    document.getElementById('bioset').onclick = () => {
      if (localStorage.getItem(K_BIO)) { localStorage.removeItem(K_BIO); alert('Face ID is uitgeschakeld.'); return meer(); }
      const box = document.createElement('div'); box.className = 'card'; box.style.marginTop = '12px';
      box.innerHTML = '<p>Voer je toegangscode in en tik op de knop. Face ID vraagt daarna om bevestiging.</p><input id="bcode" type="password" autocomplete="off" placeholder="Toegangscode"><div class="err" id="berr"></div><button id="bgo">Face ID koppelen</button>';
      document.getElementById('bioset').after(box);
      const err = t => { document.getElementById('berr').textContent = t; };
      const nm = e => (e && e.message === 'niet-ondersteund') ? 'Face ID wordt op dit toestel of in deze browser niet ondersteund voor deze app. Je toegangscode blijft werken.' : 'Face ID instellen is niet gelukt (' + (e && (e.name || e.message) || 'onbekend') + '). Je toegangscode blijft werken.';
      document.getElementById('bgo').onclick = async () => {
        const c = document.getElementById('bcode').value; if (!c) { err('Voer je code in.'); return; }
        let st; try { st = await bioCreate(); } catch (e) { err(nm(e)); return; }
        try { const k = await deriveKey(c, unb64(localStorage.getItem(K_SALT))); const d = JSON.parse(localStorage.getItem(K_DATA)); await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(d.iv) }, k, unb64(d.ct)); }
        catch (e) { err('Verkeerde code.'); return; }
        try { await bioFinish(st, c); alert('Face ID is ingeschakeld.'); meer(); }
        catch (e) {
          err('Tik nog één keer om met Face ID te bevestigen.');
          const b2 = document.getElementById('bgo'); b2.textContent = 'Bevestig met Face ID';
          b2.onclick = async () => { try { await bioFinish(st, c); alert('Face ID is ingeschakeld.'); meer(); } catch (e2) { err(nm(e2)); } };
        }
      };
    };
    document.getElementById('exp').onclick = () => {
      const blob = new Blob([JSON.stringify({ salt: localStorage.getItem(K_SALT), data: localStorage.getItem(K_DATA) })], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'mijn-app-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
    };
    document.getElementById('load').onclick = () => document.getElementById('gfile').click();
    document.getElementById('gfile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const o = JSON.parse(await f.text()); if (o.type !== 'mijn-app-gegevens') throw 0;
        Object.keys(o.data).forEach(k => { if (k === 'voetbal' && data.voetbal && Array.isArray(data.voetbal.uitslagen)) { const keep = new Map(); (o.data.voetbal.uitslagen || []).forEach(u => keep.set(u.y + '-' + u.m + '-' + u.d, u)); data.voetbal.uitslagen.forEach(u => keep.set(u.y + '-' + u.m + '-' + u.d, u)); data.voetbal = Object.assign({}, data.voetbal, o.data.voetbal, { uitslagen: [...keep.values()] }); } else data[k] = o.data[k]; }); await save(); alert('Gegevens ingeladen: ' + Object.keys(o.data).join(', ') + '.');
      } catch (x) { alert('Dit is geen geldig gegevensbestand.'); }
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
  let vbAlle = false;
  function voetbal(name) {
    const { todayT, nowT } = localParts(), up = upcomingMatches(nowT, todayT), nx = up.find(x => x.start !== null);
    const V = data.voetbal = data.voetbal || {}, U = V.uitslagen = V.uitslagen || [];
    const lab = mt => { const dd = new Date(mt.dayT); return `${DN[dd.getUTCDay()]} ${mt.d} ${MAANDEN[mt.m].slice(0, 3)}`; };
    const keyOf = (y, m, d) => y + '-' + m + '-' + d;
    const done = new Set(U.map(u => keyOf(u.y, u.m, u.d)));
    const open = MATCHES.map(parseMatch).filter(mt => mt.start !== null && mt.start + 2.5 * HMS <= nowT && !done.has(keyOf(mt.y, mt.m + 1, mt.d)));
    const row = mt => { const r = rateMatch(mt), dd = new Date(mt.dayT); return `<div class="card"><div class="row"><b>${DN[dd.getUTCDay()]} ${mt.d} ${MAANDEN[mt.m]}</b><span class="pill ${mt.home ? 'thuis' : 'uit'}">${mt.home ? 'Thuis' : 'Uit'}</span></div>
      <div>${esc(mt.opp)}</div><div class="row"><span class="mut">${esc(mt.time)}</span>${r ? `<span class="pill ${r.lvl}">${r.lvl}${r.sh ? ' · ' + r.sh : ''}</span>` : ''}</div></div>`; };
    const P = U.filter(u => !u.afgelast), W = P.filter(u => u.voor > u.tegen).length, G = P.filter(u => u.voor === u.tegen).length, L = P.length - W - G;
    const dv = P.reduce((a, u) => a + u.voor, 0), dt = P.reduce((a, u) => a + u.tegen, 0);
    const stat = (n, l) => `<div style="flex:1;text-align:center"><div style="font-size:26px;font-weight:800">${n}</div><div class="mut2">${l}</div></div>`;
    const stand = V.stand || [], toonAlles = vbAlle, mi = stand.findIndex(t => /moerbeke/i.test(t.ploeg)), rows = (toonAlles ? stand : stand.slice(0, 5)).map((t, i) => ({ t, i })); if (!toonAlles && mi >= 5) rows.push({ t: stand[mi], i: mi, gap: true });
    const sg = n => n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '0';
    const tbl = stand.length ? `<h2>Rangschikking${V.standDatum ? ' · stand van ' + esc(V.standDatum) : ''}</h2><div class="card"><div class="tw" style="max-height:none"><table style="width:100%"><thead><tr><th style="text-align:left">#</th><th style="text-align:left">Ploeg</th><th>Ptn</th><th>Gesp</th><th>W</th><th>G</th><th>V</th><th>+</th><th>−</th><th>+/−</th></tr></thead><tbody>${rows.map(({ t, i, gap }) => `${gap ? '<tr><td colspan="10" style="text-align:center;padding:2px" class="mut2">⋮</td></tr>' : ''}<tr${/moerbeke/i.test(t.ploeg) ? ' style="background:#16306B;font-weight:800"' : ''}><td style="text-align:left">${i + 1}</td><td style="text-align:left">${esc(t.ploeg)}</td><td><b>${t.ptn}</b></td><td>${t.gesp}</td><td>${t.w}</td><td>${t.g}</td><td>${t.v}</td><td>${t.vo}</td><td>${t.teg}</td><td>${sg(t.vo - t.teg)}</td></tr>`).join('')}</tbody></table></div>
      ${stand.length > 5 ? `<button class="ghost" id="alle" style="margin-top:10px">${toonAlles ? 'Toon minder' : 'Toon alle ' + stand.length}</button>` : ''}
      <p class="mut2" style="margin:8px 0 0">W = winst, G = gelijk, V = verlies, + en − = doelpunten voor en tegen.</p></div>` : '';
    const gesp = U.length ? `<h2>Gespeeld</h2><div class="card">${U.slice().sort((x, y) => keyD(x) - keyD(y)).map(u => { const t = Date.UTC(u.y, u.m - 1, u.d), dd = new Date(t), res = u.voor > u.tegen ? 'gewonnen' : u.voor === u.tegen ? 'gelijk' : 'verloren', col = u.voor > u.tegen ? '#6EE7B7' : u.voor === u.tegen ? '#FCD34D' : '#FCA5A5';
      return `<div class="row" style="padding:8px 0;border-top:1px solid var(--line)"><span>${DN[dd.getUTCDay()]} ${u.d} ${MAANDEN[u.m - 1].slice(0, 3)} · <span class="pill ${u.thuis ? 'thuis' : 'uit'}">${u.thuis ? 'Thuis' : 'Uit'}</span> ${esc(u.opp)}</span><b style="color:${u.afgelast ? '#B8C7EE' : col};white-space:nowrap">${u.afgelast ? 'afgelast' : u.voor + ' - ' + u.tegen + ' ' + res} <button class="ghost wis" data-k="${u.y}-${u.m}-${u.d}" aria-label="Verwijder" style="padding:2px 8px;min-height:0;margin-left:6px">✕</button></b></div>`; }).join('')}</div>` : '';
    function keyD(u) { return Date.UTC(u.y, u.m - 1, u.d); }
    const inv = open.length ? `<h2>Uitslag invullen</h2>${open.map((mt, i) => `<div class="card"><div class="row"><b>${lab(mt)} · ${mt.home ? 'Thuis' : 'Uit'}</b></div><div>${esc(mt.opp)}</div>
      <div class="row" style="margin-top:8px;gap:8px"><input id="v${i}" type="number" inputmode="numeric" min="0" placeholder="KFC Moerbeke" style="width:50%"><input id="t${i}" type="number" inputmode="numeric" min="0" placeholder="${esc(mt.opp)}" style="width:50%"></div><div class="row" style="gap:8px;margin-top:8px"><button id="s${i}">Uitslag bewaren</button><button class="ghost" id="a${i}">Afgelast</button></div></div>`).join('')}` : '';
    app.innerHTML = `<p><button class="ghost" id="back">‹ Terug</button></p><h1>${esc(name)}</h1><p class="mut">KFC Moerbeke B · Reserven · seizoen 2026-2027</p>
      <div class="card"><div class="mut">Volgende wedstrijd</div>${nx ? `<h2 style="margin:4px 0">${esc(nx.opp)}</h2><div>${DN[new Date(nx.dayT).getUTCDay()]} ${nx.d} ${MAANDEN[nx.m]} · ${nx.time} · ${nx.home ? 'thuis' : 'uit'}</div>
      <div class="mut">Nog ${Math.round((nx.dayT - todayT) / DAYMS)} dag(en)</div>` : '<div>Geen wedstrijd gepland</div>'}</div>
      <div class="card"><div class="dl" style="margin-bottom:10px">Seizoen tot nu toe</div><div class="row" style="gap:4px">${stat(P.length, 'gespeeld')}${stat(W, 'gewonnen')}${stat(dv + ' – ' + dt, 'doelpunten')}${stat(up.length, 'nog te spelen')}</div>${G || L ? `<div class="mut2" style="margin-top:8px">${G} gelijk · ${L} verloren</div>` : ''}</div>
      ${inv}${tbl}
      <h2>Komende wedstrijden (${up.length})</h2>${up.map(row).join('')}${gesp}
      <p class="mut">Botst = overlapt met een shift. Krap = minder dan 4 uur ruimte. Kan = geen probleem.</p>`;
    document.getElementById('back').onclick = home;
    const al = document.getElementById('alle'); if (al) al.onclick = () => { vbAlle = !vbAlle; voetbal(name); };
    open.forEach((mt, i) => document.getElementById('a' + i).onclick = async () => { U.push({ y: mt.y, m: mt.m + 1, d: mt.d, thuis: mt.home, opp: mt.opp, afgelast: true }); await save(); voetbal(name); });
    app.querySelectorAll('.wis').forEach(b => b.onclick = async () => { if (!confirm('Deze uitslag verwijderen?')) return; V.uitslagen = U.filter(u => (u.y + '-' + u.m + '-' + u.d) !== b.dataset.k); await save(); voetbal(name); });
    open.forEach((mt, i) => document.getElementById('s' + i).onclick = async () => {
      const v = parseInt(document.getElementById('v' + i).value, 10), t = parseInt(document.getElementById('t' + i).value, 10);
      if (isNaN(v) || isNaN(t) || v < 0 || t < 0) { alert('Vul beide scores in.'); return; }
      U.push({ y: mt.y, m: mt.m + 1, d: mt.d, thuis: mt.home, opp: mt.opp, voor: v, tegen: t }); await save(); voetbal(name);
    });
  }
  const COL = { Off: ['#1B3573', '#C7D4F5'], Dag: ['#34D399', '#04122E'], Nacht: ['#A5B4FC', '#04122E'] };
  function legende() {
    const sq = (c, t) => `<span class="it"><span class="sq" style="background:${c}"></span>${t}</span>`;
    return `<div class="leg">${sq('#1B3573', 'Off')}${sq('#34D399', 'Dag · 7u–19u')}${sq('#A5B4FC', 'Nacht · 19u–7u')}<span class="it"><span class="vb">Verlof</span></span></div>`;
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
        c += `<i class="y${today ? ' td' : ''}" style="background:${lv ? '#fff' : COL[sh][0]};color:${lv ? '#0A1A3F' : COL[sh][1]}"><span class="yn">${d}</span><span class="ys${lv ? ' lv' : ''}">${lv ? 'Verlof' : sh === 'Dag' ? 'D' : sh === 'Nacht' ? 'N' : 'Off'}</span>${dot ? `<u style="background:${dot}"></u>` : ''}${isSchool(y, m, d) ? '<b></b>' : ''}</i>`;
      }
      out += `<button class="ym" data-m="${m}"><span class="mt">${MAANDEN[m]}</span><div class="yg">${c}</div></button>`;
    }
    app.innerHTML = `<p><button class="ghost" id="back">← Terug</button></p><h1>Werkkalender</h1><p class="mut">Het hele jaar in één overzicht.</p>${tabs('jaar')}
      <div class="card"><div class="row"><button class="nav" id="pv" aria-label="Vorig jaar">‹</button><span class="big">${y}</span><button class="nav" id="nx" aria-label="Volgend jaar">›</button></div>
      <div class="leg"><span class="it"><span class="sq" style="background:#34D399"></span>D = Dag · 7u–19u</span><span class="it"><span class="sq" style="background:#A5B4FC"></span>N = Nacht · 19u–7u</span><span class="it"><span class="sq" style="background:#1B3573"></span>Off</span><span class="it"><span class="vb">Verlof</span></span></div><div class="row mut2"><span>Tik op een maand om die groot te openen.</span><b>Verlof dit jaar: ${leaveYear} dag${leaveYear === 1 ? '' : 'en'}</b></div><div class="yr">${out}</div></div>`;
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
        <span class="n">${d}</span>
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
