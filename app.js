/* ===================== helpers ===================== */
const state = { lang: "ar", filter: "all", open: new Set(), compare: ["donghak", "junbin"], focus: null };
try { const s = localStorage.getItem("flc-lang"); if (s === "en" || s === "ar") state.lang = s; } catch (e) {}
{ const q = new URLSearchParams(location.search).get("lang"); if (q === "en" || q === "ar") state.lang = q; }

const HN = h => state.lang === "ar" ? (HERO_AR[h] || h) : h;
const $ = id => document.getElementById(id);
const T = () => I18N[state.lang];
const L = o => (o == null ? "" : typeof o === "string" ? o : o[state.lang]);
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k]);
const byId = id => DATA.players.find(p => p.id === id);
const inRole = r => DATA.players.filter(p => p.role === r);
const teamName = k => L(DATA.teams[k]);
const badge = k => DATA.logos[k] ? `<img class="tlogo" loading="lazy" decoding="async" src="${DATA.logos[k]}" alt="">` : "";
const teamWith = k => `<span class="team-l">${badge(k)}<span>${teamName(k)}</span></span>`;
const portrait = (p, cls) => `<div class="pcard-photo ${cls || ""}${p.stays ? " kept-ring" : ""}">${p.photo ? `<img loading="lazy" decoding="async" src="${p.photo}" alt="${p.handle}">` : `<span class="ph-init">${initials(p.handle)}</span>`}<bdi class="pcard-name">${p.handle}</bdi></div>`;
const lineOf = r => DATA.lines.find(l => l.roles.includes(r));
const initials = h => h.slice(0, 2).toUpperCase();
const PCRIT = () => DATA.criteria.filter(c => c.scope === "player");
const lgName = k => L(DATA.leagues[k]);
const AR_ORD = ["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
const ordAr = n => AR_ORD[n] || String(n);
const ordEn = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"));
const prim = p => p.seasons[0];
const titleCount = p => p.titles.filter(t => t[0] === 1).length;
const groupTitles = ps => new Set(ps.flatMap(p => p.titles.filter(t => t[0] === 1).map(t => t[1] + ":" + t[2]))).size;
const TOTAL_MAPS = Object.values(DATA.leagues).reduce((s, l) => s + l.maps, 0);
const fmt = n => n.toLocaleString("en-US");
const tile = (p, cls) => `<span class="tile ${cls || ""}${p.stays ? " kept" : ""}" aria-hidden="true">${p.photo ? `<img loading="lazy" decoding="async" src="${p.photo}" alt="">` : initials(p.handle)}</span>`;

const COLLAR = '<svg class="collar" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d="M36 0 Q50 19 64 0 Z" fill="#0b1712"/><path d="M33 0 Q50 24 67 0" fill="none" stroke="var(--j-trim)" stroke-width="2" vector-effect="non-scaling-stroke"/><path d="M33 0 L0 24 M67 0 L100 24" fill="none" stroke="var(--j-trim)" stroke-width="1" opacity=".55" vector-effect="non-scaling-stroke"/></svg>';
const ICON = {
  check: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.4l2.3 2.3 4.7-5"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>',
  plus: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M7 2v10M2 7h10"/></svg>',
  minus: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 7h10"/></svg>',
  x: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg>'
};

function seg(val) {
  let s = '<span class="seg" aria-hidden="true">';
  for (let i = 1; i <= 5; i++) s += `<i${val && i <= val ? ' class="on"' : ""}></i>`;
  return s + `</span><span class="seg-n num">${val ? val + "/5" : "—"}</span>`;
}
function ratingRows(r) {
  const t = T();
  return `<dl class="rate">` + PCRIT().map(c => { const v = r && r[c.id];
    return `<dt>${L(c.name)}</dt><dd>${seg(v)}${v ? "" : `<small>${t.ourCall}</small>`}</dd>`; }).join("") + `</dl>`;
}
function trend(p) {
  const t2 = T();
  const keys = Object.keys(p.stages);
  const max = Math.max(...keys.map(k => p.stages[k][1]), 1);
  return `<div class="trend">` + keys.map(k => { const [n, sc] = p.stages[k]; const ev = DATA.events[k];
    return `<div><span class="bar${n < 10 ? " small" : ""}"><i style="height:${Math.max(6, sc / max * 100)}%"></i></span><b class="num">${sc.toFixed(2)}</b><span>${L(ev.s) || L(ev)}${keys.some(x => !x.startsWith(k.replace(/\d/, ""))) ? " " + L(DATA.leagues[k.replace(/\d/, "")]) : ""}<br>${n} ${t2.mapsShort}</span></div>`; }).join("") + `</div>`;
}
function titleChips(p) {
  const t = T();
  return `<div class="titles">` + p.titles.map(([pl, ev, tm]) => `<span class="tchip${pl === 1 ? " gold" : ""}"><i dir="ltr">${t.place(pl)}</i>${L(DATA.events[ev])}${tm === "kor" ? (state.lang === "ar" ? " مع " : " with ") + teamName("kor") : ""}</span>`).join("") + `</div>`;
}
function heroRows(list) {
  return `<ul class="heroes">` + list.map(h => `<li><span>${HN(h[0])}</span><span class="hbar"><i style="width:${h[1]}%"></i></span><span class="num">${h[1]}%</span></li>`).join("") + `</ul>`;
}
function jersey(p, cls) {
  if (p.photo) return `<div class="jersey photo ${cls || ""}${p.stays ? " kept" : ""}"><img loading="lazy" decoding="async" src="${p.photo}" alt=""></div>`;
  return `<div class="jersey ${cls || ""}${p.stays ? " kept" : ""}" style="--len:${p.handle.length}">${COLLAR}<bdi class="jname">${p.handle}</bdi></div>`;
}

/* ===================== static chapters ===================== */
function renderStatic() {
  const t = T(), v = { asOf: L(DATA.asOf), v: DATA.version, n: groupTitles(DATA.players.filter(p => p.picked)) };
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-t]").forEach(el => { const s = t[el.dataset.t]; if (typeof s === "string") el.textContent = fill(s, v); });
  $("lang-ar").setAttribute("aria-pressed", state.lang === "ar");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en");
  $("nav").innerHTML = Object.keys(t.nav).map((k, i) => `<a href="#/${k === "home" ? "" : k}" data-nav="${k}">${t.nav[k]}</a>`).join("");

  /* hero stage */
  let i = 0;
  $("stage").innerHTML = DATA.lines.map(line => `<div class="stage-line"><h2>${L(line)}</h2><div class="stage-pair">` +
    line.roles.map(r => { const p = inRole(r).find(x => x.picked); if (!p) return "";
      return `<figure class="pcard${p.stays ? " stays" : ""}" style="--i:${i++}"><div class="pcard-photo">${p.photo ? `<img loading="lazy" decoding="async" src="${p.photo}" alt="${p.handle}">` : ""}<bdi class="pcard-name">${p.handle}</bdi></div>
        <figcaption><b>${L(DATA.roles[r])}</b><span${p.stays ? ' class="keep"' : ""}>${p.stays ? t.stays : `<span class="team-l">${badge(p.team)}<span>${fill(t.from, { team: teamName(p.team) })}</span></span>`}</span></figcaption></figure>`;
    }).join("") + `</div></div>`).join("");
  $("facts").innerHTML = t.facts.map(([n, l]) => `<div class="fact"><b class="num">${n === "{maps}" ? fmt(TOTAL_MAPS) : n}</b><span>${l}</span></div>`).join("");

  /* path */
  $("path").innerHTML = DATA.path.map(s => { const ev = DATA.events[s.ev];
    return `<li class="stop${s.place === 1 ? " win" : ""}"><span class="kind">${ev.intl ? t.intlKind : t.lgKind}</span><span class="place num"><bdi dir="ltr">${t.place(s.place)}</bdi></span><span class="ev">${L(ev)}${s.mapWr ? "<br>" + fill(t.mapWr, { n: s.mapWr }) : ""}</span></li>`; }).join("");

  renderSlope();

  /* roster cards */
  $("rosterList").innerHTML = DATA.current.map(p => { const line = DATA.lines.find(l => l.id === p.line);
    return `<figure class="rcard reveal${p.stays ? " stays" : ""}">${p.photo ? portrait(p) : jersey(p, p.stays ? "kit" : "")}<figcaption><b>${L(line)}</b><span>${fill(t.since, { d: L(p.since) })}</span>
      <span class="stagenums">${["kr1", "kr2", "kr3"].map(k => `<span><i>${L(DATA.events[k].s)}</i><b class="num" style="font-weight:500">${p.stages[k] ? p.stages[k][1].toFixed(2) : "—"}</b></span>`).join("")}</span>
      <span class="tag${p.stays ? " keep" : ""}">${p.stays ? t.stays : t.out}</span></figcaption></figure>`; }).join("");

  /* criteria */
  const crit = scope => DATA.criteria.filter(c => c.scope === scope).map((c, n) =>
    `<div class="crit">${scope === "player" ? `<span class="crit-i num">${n + 1}</span>` : ""}<dt>${L(c.name)}</dt><dd>${L(c.text)}${c.how ? `<span class="how"><b>${t.howLabel}</b> ${L(c.how)}</span>` : ""}</dd></div>`).join("");
  const lg = DATA.leagues;
  $("critGrid").innerHTML = `<div class="principles">${DATA.principles.map(p => `<div class="principle"><h3>${L(p.name)}</h3><p>${L(p.text)}</p></div>`).join("")}</div><div class="crit-list"><h3 class="sub">${t.critPlayer}</h3><dl>${crit("player")}</dl></div>
    <div class="crit-side"><h3 class="sub">${t.critLineup}</h3><dl>${crit("lineup")}</dl>
      <div class="scale"><h3 class="sub">${t.scaleTitle}</h3><div class="scale-bar" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div><p>${t.scaleText}</p></div>
      <div class="source-box"><h3 class="sub">${t.srcBoxTitle}</h3><p>${t.srcBoxText}</p>
        <div class="src-rows num">${Object.keys(lg).map(k => `<div><span>${L(lg[k])}</span><span>${lg[k].series} ${t.srcSeries}</span><span>${lg[k].maps} ${t.srcMaps}</span></div>`).join("")}
        <div><span>${t.srcIntl}</span><span>${DATA.intlEvents.series} ${t.srcSeries}</span><span>${DATA.intlEvents.maps} ${t.srcMaps}</span></div></div></div></div>`;

  renderLineup();

  const ex = DATA.excluded;
  $("excluded").innerHTML = `<div class="ex-head"><span class="ex-mark" aria-hidden="true">!</span><div><h3>${L(ex.title)}</h3><p>${L(ex.text)}</p></div></div>
    <ul class="ex-list">${ex.players.map(x => `<li><span class="tile" aria-hidden="true">${initials(x.handle)}</span><div><b><bdi>${x.handle}</bdi></b><span class="ex-role"><bdi>${L(DATA.roles[x.role])}</bdi>${state.lang === "ar" ? "، " : ", "}ZETA DIVISION</span></div></li>`).join("")}</ul>
    <p class="ex-foot">${L(ex.honours)}</p>`;
  $("limitsList").innerHTML = DATA.limits.map(l => `<li><b>${l[state.lang][0]}</b><span>${l[state.lang][1]}</span></li>`).join("");
  $("sources").innerHTML = DATA.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${L(s.label)}</a></li>`).join("");
}

/* slope chart: one scale, 2 to 9 */
function renderSlope() {
  const t = T(), W = 640, H = 320, x0 = 70, x1 = 470, top = 24, bot = 290, lo = 3, hi = 8.5;
  const X = [x0, (x0 + x1) / 2, x1], Y = v => bot - (v - lo) / (hi - lo) * (bot - top);
  const keys = ["kr1", "kr2", "kr3"];
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t.slopeTitle}"><g class="grid">`;
  for (let v = 3; v <= 8; v++) svg += `<line x1="${x0 - 10}" x2="${x1 + 10}" y1="${Y(v)}" y2="${Y(v)}"/>`;
  svg += `</g><g class="axis">`;
  for (let v = 3; v <= 8; v++) svg += `<text x="${x0 - 22}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`;
  keys.forEach((k, i) => { svg += `<text x="${X[i]}" y="${H - 4}" text-anchor="middle">${L(DATA.events[k])}</text>`; });
  svg += `</g>`;
  const ends = DATA.current.map(p => ({ p, v: p.stages.kr3[1] })).sort((a, b) => b.v - a.v);
  let lastY = -99; ends.forEach(e => { let y = Y(e.v); if (y - lastY < 17) y = lastY + 17; e.ly = y; lastY = y; });
  DATA.current.forEach(p => { const pts = keys.map((k, i) => p.stages[k] ? [X[i], Y(p.stages[k][1]), p.stages[k][0]] : null).filter(Boolean);
    const d = pts.map((q, i) => (i ? "L" : "M") + q[0] + " " + q[1]).join(" "); const e = ends.find(x => x.p === p);
    svg += `<g class="ln${p.stays ? " kept" : ""}${state.focus === p.handle ? " on" : ""}" data-h="${p.handle}"><path d="${d}"/>` +
      pts.map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="4.5" class="${q[2] < 10 ? "small" : ""}"/>`).join("").replace(/<circle([^>]*) class="small"\/>/g, '<circle$1 stroke-dasharray="2 2"/>') +
      `<text x="${x1 + 18}" y="${e.ly + 4}">${p.handle} ${p.stages.kr3[1].toFixed(2)}</text></g>`; });
  svg += `</svg>`;
  const box = $("slope"); box.innerHTML = svg; box.classList.toggle("focus", !!state.focus);
  $("slopeChips").innerHTML = DATA.current.map(p => `<button type="button" class="chip${p.stays ? " kept" : ""}" data-act="focus" data-h="${p.handle}" aria-pressed="${state.focus === p.handle}"><bdi>${p.handle}</bdi></button>`).join("");
}

/* lineup, pools, trophies */
function renderLineup() {
  const t = T();
  $("lineupBody").innerHTML = DATA.lines.map(line => `<div class="lu-line"><h3>${L(line)}</h3>` +
    line.roles.map(r => { const p = inRole(r).find(x => x.picked); if (!p) return ""; const s = prim(p);
      const move = p.stays ? t.stays : fill(t.from, { team: teamName(p.team) });
      return `<article class="lu reveal${p.stays ? " stays" : ""}">
        <div class="lu-top"><div class="lu-photo">${p.photo ? `<img loading="lazy" decoding="async" src="${p.photo}" alt="${p.handle}">` : ""}<bdi class="pcard-name">${p.handle}</bdi></div>
          <div class="lu-text"><span class="lu-name-row"><bdi class="lu-name">${p.handle}</bdi>${p.igl ? `<span class="igl big" title="${t.iglTitle}">IGL</span>` : ""}${p.alert ? `<button type="button" class="alert-btn" data-alert="lu-${p.id}" aria-expanded="false" aria-controls="alert-lu-${p.id}" title="${t.alertTag}">!<span class="sr">${t.alertTag}</span></button>` : ""}</span><div class="lu-role"><bdi>${L(DATA.roles[r])}</bdi>${p.stays ? (state.lang === "ar" ? "، " : ", ") : ""}<b>${p.stays ? move : `<span class="team-l">${badge(p.team)}<span>${move}</span></span>`}</b></div>
            <div class="lu-score"><b class="num">${s.score.toFixed(2)}</b><span>${t.st.score}<br>${t.rankIn(s, lgName(s.lg))}</span></div></div></div>
        ${p.alert ? `<p class="alert-pop" id="alert-lu-${p.id}" hidden><b>${t.alertTag}</b><span>${L(p.alert)}</span></p>` : ""}
        <p class="lu-note">${L(p.note)}</p>
        <div class="lu-cols"><div><h4 class="mini-h">${t.trendTitle}</h4>${trend(p)}</div><div><h4 class="mini-h">${t.ratingsTitle}</h4>${ratingRows(p.ratings)}</div></div>
        <div><h4 class="mini-h">${t.titlesTitle}</h4>${titleChips(p)}</div>
        <div><h4 class="mini-h">${t.heroesTitle}</h4>${heroRows(p.heroes)}</div>
      </article>`; }).join("") + `</div>`).join("");

  /* hero pools per line */
  $("pool").innerHTML = DATA.lines.map(line => { const [a, b] = line.roles.map(r => inRole(r).find(x => x.picked));
    const hs = {}; [a, b].forEach((p, i) => p.heroes.forEach(([h, v]) => { hs[h] = hs[h] || [0, 0]; hs[h][i] = v; }));
    const rows = Object.entries(hs).sort((x, y) => (y[1][0] + y[1][1]) - (x[1][0] + x[1][1]));
    return `<div class="pool-col${b.stays ? " kept-col" : ""}"><h4>${L(line)}</h4><div class="who"><span><i class="pa"></i><bdi>${a.handle}</bdi></span><span><i class="pb"></i><bdi>${b.handle}</bdi></span></div>` +
      rows.map(([h, [va, vb]]) => `<div class="prow"><span>${HN(h)}</span><span class="pbars"><span><i class="pa" style="width:${va}%"></i></span><span><i class="pb" style="width:${vb}%"></i></span></span></div>`).join("") + `</div>`; }).join("");

  /* trophies */
  const won = [];
  DATA.players.filter(p => p.picked).forEach(p => p.titles.filter(x => x[0] === 1).forEach(([, ev, tm]) => won.push({ ev, tm, p: p.handle })));
  const grouped = {}; won.forEach(w => { const k = w.ev + "|" + w.tm; (grouped[k] = grouped[k] || { ev: w.ev, tm: w.tm, who: [] }).who.push(w.p); });
  $("trophies").innerHTML = Object.values(grouped).map(g => `<li><b>${L(DATA.events[g.ev])}</b><span>${teamName(g.tm)}: <bdi>${g.who.join(state.lang === "ar" ? " و" : " and ")}</bdi></span></li>`).join("");
}

/* ===================== candidates ===================== */
function candHTML(p) {
  const t = T(), open = state.open.has(p.id), cmp = state.compare.includes(p.id), s = prim(p), lg = lgName(s.lg);
  const best = Math.max(...DATA.players.filter(x => lineOf(x.role) === lineOf(p.role) && x.seasons[0].lg === s.lg).map(x => x.seasons[0].score));
  const s3keys = ["e10", "d10", "dmg10"].concat(lineOf(p.role).id === "support" ? ["h10"] : lineOf(p.role).id === "tank" ? ["mit10"] : []);
  return `<li class="cand${open ? " open" : ""}${p.picked ? " is-picked" : ""}" data-id="${p.id}">
    <div class="cand-row">
      <button type="button" class="cand-main" data-act="open" data-id="${p.id}" aria-expanded="${open}" aria-controls="fold-${p.id}">
        ${tile(p)}
        <span class="cand-text"><span class="cand-name"><bdi>${p.handle}</bdi>${p.picked ? `<span class="pick" title="${t.picked}">${ICON.check}<span class="sr">${t.picked}</span></span>` : ""}${p.igl ? `<span class="igl" title="${t.iglTitle}">IGL</span>` : ""}</span>
        <span class="cand-team">${teamWith(p.team)}</span></span>
        <span class="sc" title="${t.rankIn(s, lg)}"><b class="num">${s.score.toFixed(2)}</b><small class="rk" dir="auto">${t.rankShort(s)}</small></span>${ICON.chev}
      </button>
      <button type="button" class="cmp-btn" data-act="cmp" data-id="${p.id}" aria-pressed="${cmp}" aria-label="${cmp ? t.rmCmp : t.addCmp}: ${p.handle}" title="${cmp ? t.rmCmp : t.addCmp}">${cmp ? ICON.minus : ICON.plus}</button>
    </div>
    ${p.alert ? `<button type="button" class="alert-chip" data-alert="${p.id}" aria-expanded="false" aria-controls="alert-${p.id}"><i aria-hidden="true">!</i>${T().alertTag}</button><p class="alert-pop" id="alert-${p.id}" hidden><b>${T().alertTag}</b><span>${L(p.alert)}</span></p>` : ""}
    <div class="cand-meter" aria-hidden="true"><i style="width:${Math.max(4, s.score / best * 100)}%"></i></div>
    <div class="cand-fold" id="fold-${p.id}"><div><div class="cand-body">
      <div class="cand-hero">${portrait(p, "small")}<div><p class="cand-note">${L(p.note)}</p>${p.concept ? `<p class="concept">${t.conceptTag}</p>` : ""}</div></div>
      <div><h5 class="mini-h">${t.trendTitle}</h5>${trend(p)}</div>
      <div><h5 class="mini-h">${t.titlesTitle}</h5>${titleChips(p)}</div>
      <div><h5 class="mini-h">${t.ratingsTitle}</h5>${ratingRows(p.ratings)}</div>
      <dl class="statgrid">${["form", "above", "wr", "worst"].map(k => `<div><dt>${t.st[k]}</dt><dd class="num">${k === "above" || k === "wr" ? s[k] + "%" : s[k].toFixed(2)}</dd></div>`).join("")}</dl>
      <div><h5 class="mini-h">${t.s3Title}</h5>${!p.s3 ? `<div class="pending">${t.noS3}</div>` : `<dl class="statgrid">${s3keys.map(k => `<div><dt>${t.st[k]}${k === "d10" ? ` <small class="lower">${t.lower}</small>` : ""}</dt><dd class="num">${k.endsWith("10") && p.s3[k] > 100 ? fmt(p.s3[k]) : p.s3[k].toFixed(2)}</dd></div>`).join("")}</dl>`}</div>
      <div><h5 class="mini-h">${t.heroesTitle}</h5>${p.heroes.length ? heroRows(p.heroes) : `<div class="pending">${t.noS3}</div>`}</div>
      <dl class="facts-dl">
        ${p.name ? `<dt>${t.fName}</dt><dd dir="ltr" style="text-align:start">${p.name}</dd>` : ""}
        <dt>${t.fSample}</dt><dd>${p.seasons.map(x => t.sample(lgName(x.lg), x)).join("<br>")}</dd>
        <dt>${t.fIntl}</dt><dd>${t.intlLine(p.intl)}</dd>
      </dl>
      <button type="button" class="textbtn" data-act="cmp" data-id="${p.id}">${cmp ? t.rmCmp : t.addCmp}</button>
    </div></div></div></li>`;
}
function renderCandidates() {
  const t = T();
  $("filters").innerHTML = [{ id: "all" }].concat(DATA.lines).map(f =>
    `<button type="button" class="chip" data-act="filter" data-id="${f.id}" aria-pressed="${state.filter === f.id}">${f.id === "all" ? t.all : L(f)}</button>`).join("");
  const lines = DATA.lines.filter(l => state.filter === "all" || state.filter === l.id);
  const depth = $("depth"); depth.classList.toggle("one", lines.length === 1);
  depth.innerHTML = lines.map(line => `<div class="dline"><h3>${L(line)}</h3><div class="dline-roles">` +
    line.roles.map(r => { const list = inRole(r);
      return `<div class="drole"><div class="drole-head"><h4>${L(DATA.roles[r])}</h4><span>${t.nOf(list.length)}</span></div><ul>${list.map(candHTML).join("")}</ul></div>`; }).join("") + `</div></div>`).join("");
  renderCompare();
}
function renderCompare() {
  const t = T(), sel = state.compare.map(byId).filter(Boolean);
  let html = `<div class="compare-head"><h3 class="sub">${t.cmpTitle}</h3><p>${t.cmpHint}</p></div>`;
  if (sel.length < 2) {
    html += `<div class="pending">${t.cmpEmpty}</div>` + (sel.length ? `<div class="cmp-grid" style="--n:1;margin-top:16px">${cmpHead(sel[0])}</div>` : "");
  } else {
    const row = (label, fn, cls) => `<div class="cmp-label">${label}</div>` + sel.map(p => `<div class="cmp-val${cls ? " " + cls(p) : ""}">${fn(p) || "—"}</div>`).join("");
    const bar = (label, get, show, inv) => { const vals = sel.map(get); const ok = vals.filter(v => v != null); const best = ok.length ? (inv ? Math.min(...ok) : Math.max(...ok)) : null; const max = ok.length ? Math.max(...ok) : 0;
      return `<div class="cmp-label">${label}</div>` + sel.map((p, i) => vals[i] == null ? `<div class="cmp-val">—</div>` : `<div class="cmp-val cmp-bar"><span class="cbar"><i class="${vals[i] === best ? "best" : ""}" style="width:${max > 0 ? Math.max(2, vals[i] / max * 100) : 0}%"></i></span><span class="num">${show(vals[i])}</span></div>`).join(""); };
    const d2 = v => v.toFixed(2), pc = v => v + "%";
    const mixed = new Set(sel.map(p => prim(p).lg)).size > 1;
    html += (mixed ? `<div class="pending" style="margin-bottom:16px">${t.crossNote}</div>` : "") +
      `<div class="cmp-grid" style="--n:${sel.length}">` + sel.map(cmpHead).join("") +
      row(t.rRole, p => L(DATA.roles[p.role])) +
      row(t.rTeam, p => teamWith(p.team)) +
      row(t.rPicked, p => p.picked ? t.yes : t.no, p => p.picked ? "yes" : "") +
      row(t.fRank, p => `<span class="num">${t.rankIn(prim(p), lgName(prim(p).lg))}</span>`) +
      bar(t.st.score, p => prim(p).score, d2) + bar(t.st.form, p => prim(p).form, d2) + bar(t.st.above, p => prim(p).above, pc) +
      bar(t.st.wr, p => prim(p).wr, pc) + bar(t.st.worst, p => prim(p).worst, d2) + bar(t.st.ed, p => p.ed, d2) +
      bar(t.st.e10, p => p.s3 ? p.s3.e10 : null, d2) + bar(`${t.st.d10} <small class="lower">${t.lower}</small>`, p => p.s3 ? p.s3.d10 : null, d2, true) + bar(t.st.dmg10, p => p.s3 ? p.s3.dmg10 : null, fmt) +
      bar(t.st.intl, p => p.intl.maps ? p.intl.score : null, d2) + bar(t.st.titles, p => titleCount(p), String) +
      PCRIT().map(c => row(L(c.name), p => seg(p.ratings[c.id]))).join("") +
      row(t.trendTitle, p => Object.keys(p.stages).map(k => `${L(DATA.events[k].s)} <span class="num">${p.stages[k][1].toFixed(2)}</span>`).join("<br>")) +
      row(t.heroesTitle, p => !p.heroes.length ? "—" : p.heroes.slice(0, 3).map(h => `${HN(h[0])} <span class="num">${h[1]}%</span>`).join("<br>")) + `</div>`;
  }
  $("compare").innerHTML = html;
  updatePill();
}
function cmpHead(p) {
  const t = T();
  return `<div class="cmp-player">${tile(p)}<span class="cand-name"><bdi>${p.handle}</bdi>${p.picked ? `<span class="pick" title="${t.picked}">${ICON.check}</span>` : ""}</span>
    <button type="button" class="cmp-x" data-act="cmp" data-id="${p.id}" aria-label="${t.rmCmp}: ${p.handle}">${ICON.x}</button></div>`;
}
function syncCmpButtons() {
  const t = T();
  document.querySelectorAll('.cand [data-act="cmp"]').forEach(b => { const on = state.compare.includes(b.dataset.id); const p = byId(b.dataset.id);
    if (b.classList.contains("cmp-btn")) { b.setAttribute("aria-pressed", on); b.innerHTML = on ? ICON.minus : ICON.plus; b.title = on ? t.rmCmp : t.addCmp; b.setAttribute("aria-label", (on ? t.rmCmp : t.addCmp) + ": " + p.handle); }
    else b.textContent = on ? t.rmCmp : t.addCmp; });
}


/* ===================== your six ===================== */
const ROLE_ORDER = ["mt", "ot", "hs", "fd", "ms", "fs"];
const OURS = () => Object.fromEntries(ROLE_ORDER.map(r => [r, inRole(r).find(p => p.picked).id]));
let six = OURS(), copiedAt = 0;
{ const q = new URLSearchParams(location.search).get("six"); if (q) { const ids = q.split(","); six = {}; ROLE_ORDER.forEach((r, i) => { const p = byId(ids[i]); if (p && p.role === r) six[r] = p.id; }); } }
function sixLink() { const u = new URL(location.href); u.hash = "/build"; u.searchParams.set("six", ROLE_ORDER.map(r => six[r] || "").join(",")); u.searchParams.set("lang", state.lang); return u.toString(); }
function renderBuild(popRole) {
  const t = T(), ours = OURS(), picks = ROLE_ORDER.map(r => six[r] && byId(six[r]));
  const full = picks.filter(Boolean);
  const avg = full.length ? full.reduce((a, p) => a + prim(p).score, 0) / full.length : null;
  const titles = groupTitles(full);
  const shared = ROLE_ORDER.filter(r => six[r] && six[r] === ours[r]).length;
  const igls = full.filter(p => p.igl);
  const leagues = new Set(full.map(p => prim(p).lg));
  const msgs = [];
  if (full.length < 6) msgs.push(`<p>${t.bEmpty}</p>`);
  else if (shared === 6) msgs.push(`<p class="ok">${t.bSame}</p>`);
  if (full.length === 6 && !igls.length) msgs.push(`<p>${t.bNoIgl}</p>`);
  if (igls.length > 1) msgs.push(`<p>${t.bTwoIgl}</p>`);
  if (leagues.size > 1) msgs.push(`<p>${t.bCross}</p>`);
  const slot = (p, r) => `<div class="bld-slot${p ? " full" : ""}${p && p.id === ours[r] ? " ours" : ""}${r === popRole ? " pop" : ""}">${p && p.photo ? `<img loading="lazy" decoding="async" src="${p.photo}" alt="">` : ""}${p && p.igl ? '<span class="igl">IGL</span>' : ""}<span><b><bdi>${p ? p.handle : "؟"}</bdi></b><small>${L(DATA.roles[r])}</small></span></div>`;
  $("bld").innerHTML = `<div class="bld-card"><div class="bld-six">${ROLE_ORDER.map((r, i) => slot(picks[i], r)).join("")}</div>
    <dl class="bld-stats">
      <div><dt>${t.bAvg}</dt><dd class="num">${avg == null ? "—" : avg.toFixed(2)}</dd></div>
      <div><dt>${t.bTitles}</dt><dd class="num">${titles}</dd></div>
      <div><dt>${t.bShared}</dt><dd>${fill(t.bOf6, { n: shared })}</dd></div>
      <div><dt>${t.bIgl}</dt><dd><bdi>${igls.length ? igls.map(p => p.handle).join(" + ") : t.bNone}</bdi></dd></div>
    </dl>
    <div class="bld-msg" aria-live="polite">${msgs.join("")}</div>
    <div class="bld-acts"><button type="button" class="main" data-act="bShare">${Date.now() - copiedAt < 1800 ? t.bCopied : t.bShare}</button><button type="button" data-act="bReset">${t.bReset}</button><button type="button" data-act="bClear">${t.bClear}</button></div></div>
    <div class="bld-roles">${ROLE_ORDER.map(r => `<div class="bld-role"><h3>${fill(t.bPickFor, { role: L(DATA.roles[r]) })}</h3><div class="bld-opts" role="group">${inRole(r).map(p => `<button type="button" class="bld-opt" data-act="bPick" data-id="${p.id}" aria-pressed="${six[r] === p.id}">${tile(p)}<bdi>${p.handle}</bdi><span class="num">${prim(p).score.toFixed(2)}</span></button>`).join("")}</div></div>`).join("")}</div>`;
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const act = el.dataset.act;
  if (act === "bPick") { const p = byId(el.dataset.id); six[p.role] = six[p.role] === p.id ? undefined : p.id; renderBuild(p.role); }
  else if (act === "bReset") { six = OURS(); renderBuild(); }
  else if (act === "bClear") { six = {}; renderBuild(); }
  else if (act === "bShare") { const link = sixLink(); try { history.replaceState(null, "", link); } catch (err) {}
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).catch(() => {}).finally(() => { copiedAt = Date.now(); renderBuild(); setTimeout(renderBuild, 1900); }); }
});
/* ===================== behaviour ===================== */
let compareVisible = false, candidatesVisible = false, pillArmed = false;
function updatePill() { const pill = $("cmpPill"), n = state.compare.length; pill.textContent = T().pill(n); pill.hidden = !(pillArmed && n >= 2 && candidatesVisible && !compareVisible); }
function renderAll() { renderStatic(); renderCandidates(); renderBuild(); renderHome(); showPage(true); }

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;
  if (act === "lang") {
    if (state.lang === el.dataset.lang) return;
    state.lang = el.dataset.lang;
    try { localStorage.setItem("flc-lang", state.lang); } catch (err) {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduce) document.startViewTransition(renderAll); else renderAll();
  } else if (act === "filter") {
    state.filter = id; renderCandidates();
  } else if (act === "open") {
    const li = el.closest(".cand"); const open = !state.open.has(id);
    open ? state.open.add(id) : state.open.delete(id);
    li.classList.toggle("open", open); el.setAttribute("aria-expanded", open);
  } else if (act === "cmp") {
    const i = state.compare.indexOf(id);
    if (i >= 0) state.compare.splice(i, 1);
    else { if (state.compare.length >= 3) state.compare.shift(); state.compare.push(id); pillArmed = true; }
    syncCmpButtons(); renderCompare();
  } else if (act === "goCompare") {
    $("compare").scrollIntoView({ block: "start", behavior: "smooth" });
  } else if (act === "focus") {
    state.focus = state.focus === el.dataset.h ? null : el.dataset.h; renderSlope();
  }
});
$("slope").addEventListener("pointerover", e => { const g = e.target.closest(".ln"); if (!g || state.focus) return; $("slope").classList.add("focus"); g.classList.add("on"); });
$("slope").addEventListener("pointerout", e => { const g = e.target.closest(".ln"); if (!g || state.focus) return; $("slope").classList.remove("focus"); g.classList.remove("on"); });
document.addEventListener("pointermove", e => { const c = e.target.closest && e.target.closest(".lu"); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); }, { passive: true });

let ticking = false;
addEventListener("scroll", () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { const h = document.documentElement; $("progress").style.setProperty("--p", Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight))); ticking = false; }); }, { passive: true });

const PAGES = ["roster", "criteria", "candidates", "lineup", "build", "limits"];
let page = "";
function routeFromHash() { const h = location.hash.replace(/^#\/?/, ""); return PAGES.includes(h) ? h : ""; }
function showPage(first) {
  page = routeFromHash();
  document.body.dataset.page = page || "home";
  document.querySelectorAll("main > section").forEach(sec => { const on = page ? sec.id === page : (sec.id === "top" || sec.id === "home"); sec.hidden = !on; });
  document.querySelectorAll("#nav a").forEach(a => { if (a.dataset.nav === (page || "home")) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  const a = document.querySelector(`#nav a[data-nav="${page || "home"}"]`); if (a && a.parentElement.scrollWidth > a.parentElement.clientWidth) a.parentElement.scrollTo({ left: a.offsetLeft - 24, behavior: "smooth" });
  if (!first) scrollTo({ top: 0, behavior: "instant" });
  document.title = (page ? T().nav[page] + " | " : "") + T().brand;
  compareVisible = false; candidatesVisible = page === "candidates"; updatePill();
  document.querySelectorAll(`#${page || "home"} .reveal:not(.in), #top .reveal:not(.in)`).forEach(el => el.classList.add("in"));
}
addEventListener("hashchange", () => showPage(false));
if ("IntersectionObserver" in window) new IntersectionObserver(es => { compareVisible = es[0].isIntersecting; updatePill(); }, { threshold: 0.05 }).observe($("compare"));
function renderHome() {
  const t = T();
  $("homeWhy").innerHTML = t.homeWhy.map(x => `<li>${x}</li>`).join("");
  $("homeGrid").innerHTML = PAGES.map(k => `<a class="hcard" href="#/${k}"><h3>${t.nav[k]}</h3><p>${t.pages[k]}</p><span class="go">${t.homeOpen}</span></a>`).join("");
}
renderAll();

/* ===== motion: background layers, tilt, count-up, bars ===== */
(function motion() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WING = '<svg viewBox="0 0 120 44" aria-hidden="true"><path d="M3 41C34 33 66 14 117 3M22 41C49 33 75 19 111 13M42 41C63 35 84 27 106 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
  document.querySelectorAll(".hero, .ch").forEach((sec, k) => {
    const fx = document.createElement("div"); fx.className = "fx"; fx.setAttribute("aria-hidden", "true");
    let html = '<span class="orb o1"></span><span class="orb o2"></span>' + '' + '<span class="spot"></span>';
    if (!reduce) for (let i = 0; i < 4; i++) {
      const left = 4 + i * 13 + (Math.sin(k * 7 + i) * 4), w = 70 + ((i * 37 + k * 11) % 90), d = 22 + ((i * 7 + k * 5) % 18), dl = -((i * 5 + k * 3) % d), o = (.16 + ((i + k) % 3) * .08).toFixed(2), r = (-24 + ((i * 13) % 30)), x = (((i % 2) ? 1 : -1) * (20 + i * 8));
      html += `<span class="wing${(i + k) % 3 === 0 ? " g" : ""}" style="left:${left}%;--w:${w}px;--d:${d}s;--dl:${dl}s;--o:${o};--r:${r}deg;--x:${x}px">${WING}</span>`;
    }
    fx.innerHTML = html; sec.prepend(fx);
    if (!reduce) sec.addEventListener("pointermove", e => { const b = sec.getBoundingClientRect(); fx.style.setProperty("--mx", (e.clientX - b.left) + "px"); fx.style.setProperty("--my", (e.clientY - b.top) + "px"); }, { passive: true });
  });
  if (reduce) return;
  /* tilt for player cards and lineup cards (re-applied after every render) */
  const tilt = () => document.querySelectorAll(".pcard, .lu").forEach(el => {
    if (el.dataset.tilt) return; el.dataset.tilt = "1"; el.classList.add("tilt");
    const sh = document.createElement("span"); sh.className = "sheen"; el.appendChild(sh);
    const max = el.classList.contains("lu") ? 3 : 7;
    el.addEventListener("pointermove", e => { if (e.pointerType !== "mouse") return; const b = el.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      el.style.transform = `perspective(900px) rotateX(${(.5 - py) * max}deg) rotateY(${(px - .5) * max}deg) translateY(-3px)`; el.style.setProperty("--sx", px * 100 + "%"); el.style.setProperty("--sy", py * 100 + "%"); });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
  /* count-up for the hero facts */
  const countUp = el => { const raw = el.textContent.trim(), n = Number(raw.replace(/,/g, "")); if (!isFinite(n) || n < 2 || el.dataset.cu) return; el.dataset.cu = "1";
    const t0 = performance.now(), dur = 1300, f = new Intl.NumberFormat("en-US"); const step = now => { const k = Math.min(1, (now - t0) / dur), v = Math.round(n * (1 - Math.pow(1 - k, 3))); el.textContent = f.format(v); if (k < 1) requestAnimationFrame(step); else el.textContent = raw; }; requestAnimationFrame(step); };
  /* bars grow when their block scrolls in */
  const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; const el = en.target; io.unobserve(el);
    if (el.classList.contains("fact")) countUp(el.querySelector(".num")); else requestAnimationFrame(() => el.classList.remove("pending")); }), { threshold: .25 });
  const arm = () => { tilt();
    document.querySelectorAll(".fact").forEach(el => { if (!el.dataset.io) { el.dataset.io = "1"; io.observe(el); } });
    document.querySelectorAll(".trend, .heroes, .pool").forEach(el => { if (!el.dataset.io) { el.dataset.io = "1"; el.classList.add("pending"); io.observe(el); } }); };
  arm(); new MutationObserver(() => arm()).observe(document.querySelector("main"), { childList: true, subtree: true });
})();

/* ===================== finishing layer ===================== */
/* A short segmented bar under each page title that slides in when the page opens, a reading line along the top,
   and the main buttons lean a little toward the cursor. Skipped for reduced motion. */
(function finish() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("h2.title").forEach(h => { const r = document.createElement("span"); r.className = "title-rule"; r.setAttribute("aria-hidden", "true"); r.innerHTML = "<i></i><i></i><i></i>"; h.after(r); });
  const draw = () => document.querySelectorAll("main > section:not([hidden]) .title-rule").forEach(s => { s.classList.remove("drawn"); void s.getBoundingClientRect(); setTimeout(() => s.classList.add("drawn"), 60); });
  if (reduce) document.documentElement.classList.add("rule-still"); else { draw(); addEventListener("hashchange", () => setTimeout(draw, 60)); }

  const bar = document.createElement("div"); bar.className = "read-line"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
  let q = 0; const prog = () => { q = 0; const m = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${m > 0 ? Math.min(1, scrollY / m) : 0})`; };
  const on = () => { if (!q) q = requestAnimationFrame(prog); };
  addEventListener("scroll", on, { passive: true }); addEventListener("resize", on); addEventListener("hashchange", () => setTimeout(on, 50)); prog();

  if (reduce || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.addEventListener("pointermove", e => {
    const b = e.target.closest && e.target.closest(".bld-acts .main, .hcard, .foot-x");
    document.querySelectorAll(".pulled").forEach(x => { if (x !== b) { x.classList.remove("pulled"); x.style.translate = ""; } });
    if (!b) return;
    const r = b.getBoundingClientRect(), k = b.classList.contains("hcard") ? .04 : .2;
    b.classList.add("pulled"); b.style.translate = `${((e.clientX - r.left - r.width / 2) * k).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * k * 1.3).toFixed(1)}px`;
  }, { passive: true });
})();

/* clickable notes next to a candidate */
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-alert]"); if (!b) return;
  const pop = document.getElementById("alert-" + b.dataset.alert); if (!pop) return;
  const show = pop.hidden; pop.hidden = !show; b.setAttribute("aria-expanded", String(show));
});
