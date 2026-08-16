/* =====================================================================
   IRONCLAD COMPOUNDS (forged) — interactions
   Vanilla JS, no dependencies. Generates the crest/gear SVGs, the metallic
   vial, the catalog, and drives selection, filters, the age gate and motion.
   ===================================================================== */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ---------- gear + emblem geometry ---------- */
  function gearPath(cx, cy, rO, rV, teeth) {
    const step = (Math.PI * 2) / teeth;
    const P = (r, a) => `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
    let d = "";
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      d += (i === 0 ? "M " : "L ") + P(rV, a);
      d += ` L ${P(rO, a + step * 0.14)} L ${P(rO, a + step * 0.36)} L ${P(rV, a + step * 0.5)}`;
    }
    d += " Z";
    const ri = rV - 11;
    d += ` M ${cx + ri},${cy} A ${ri},${ri} 0 1 0 ${cx - ri},${cy} A ${ri},${ri} 0 1 0 ${cx + ri},${cy} Z`;
    return d;
  }

  function emblem() {
    return '<img class="crest-img" src="assets/img/logo-mark.png" alt="IronClad Compounds" />';
  }
  function heroGear() {
    return `<svg viewBox="0 0 220 220" aria-hidden="true">
      <path d="${gearPath(110, 110, 104, 84, 22)}" fill="none" stroke="#7c828c" stroke-width="2" fill-rule="evenodd"/>
      <circle cx="110" cy="110" r="58" fill="none" stroke="#7c828c" stroke-width="2"/>
      <circle cx="110" cy="110" r="34" fill="none" stroke="#7c828c" stroke-width="2"/>
      <circle cx="110" cy="110" r="6" fill="#7c828c"/>
    </svg>`;
  }

  /* ---------- realistic lyophilized-peptide vial (static) ---------- */
  function vial() {
    return `<svg class="vial" viewBox="0 0 64 132" width="84" aria-hidden="true">
      <ellipse cx="32" cy="126" rx="19" ry="3.6" fill="#000" opacity=".5"/>
      <!-- glass body: neck, shoulder, rounded base -->
      <path d="M22,33 L42,33 L42,35 Q48,37.5 48,47 L48,110 Q48,118 40,118 L24,118 Q16,118 16,110 L16,47 Q16,37.5 22,35 Z"
        fill="url(#glassBody)" stroke="rgba(255,255,255,.16)" stroke-width="1"/>
      <!-- lyophilized cake (white, uneven top) -->
      <path d="M18,99 Q25,95.5 32,97.5 Q39,99.5 46,97 L46,109 Q46,115 40,115 L24,115 Q18,115 18,109 Z" fill="url(#cakeG)"/>
      <path d="M18,99 Q25,95.5 32,97.5 Q39,99.5 46,97" fill="none" stroke="#ffffff" stroke-width="1" opacity=".55"/>
      <!-- glass highlights + shaded edge -->
      <rect x="21" y="47" width="3.4" height="60" rx="1.7" fill="#ffffff" opacity=".16"/>
      <rect x="27" y="49" width="1.6" height="52" rx="1" fill="#ffffff" opacity=".10"/>
      <path d="M45.5,47 L45.5,110 Q45.5,116 40.5,117" fill="none" stroke="#000" stroke-width="2.2" opacity=".16"/>
      <!-- metal label with the brand crest (drawn above the glass so it stays crisp) -->
      <rect x="16" y="55" width="32" height="32" rx="1.6" fill="#1b1f26" stroke="#4a4f58" stroke-width=".7"/>
      <rect x="16" y="55" width="32" height="2.2" fill="#c2894b" opacity=".9"/>
      <image href="assets/img/logo-mark.png" x="19" y="58" width="26" height="28" preserveAspectRatio="xMidYMid meet"/>
      <!-- rubber stopper -->
      <rect x="23.5" y="26" width="17" height="9" rx="1.5" fill="#3f4248"/>
      <rect x="23.5" y="26" width="17" height="3" fill="#4b4f55"/>
      <!-- aluminum crimp seal -->
      <rect x="22" y="19" width="20" height="8" fill="url(#aluCyl)"/>
      <g stroke="#565b64" stroke-width=".5" opacity=".5"><line x1="26" y1="20" x2="26" y2="26"/><line x1="30" y1="20" x2="30" y2="26"/><line x1="34" y1="20" x2="34" y2="26"/><line x1="38" y1="20" x2="38" y2="26"/></g>
      <!-- bronze flip-off cap -->
      <rect x="21" y="14" width="22" height="6" rx="1" fill="url(#bronzeG)"/>
      <ellipse cx="32" cy="14" rx="11" ry="3.4" fill="url(#bronzeG)" stroke="#5c3d1c" stroke-width=".5"/>
      <ellipse cx="32" cy="13.4" rx="4.4" ry="1.4" fill="#e6ab68" opacity=".85"/>
    </svg>`;
  }

  /* ---------- data (from inventory sheet; * items = out of stock; sequence/MW/purity are placeholders to confirm) ---------- */
  const DEFAULTS = [
    { id: "retatrutide-10", name: "GLP-3 RT", seq: "Modified peptide (39 aa)", cat: "metabolic", mw: "4731.4", purity: "99.2%", price: 60, size: "10 mg", stock: "in",
      desc: "Triple GLP-1 / GIP / glucagon receptor agonist (“Reta”) used in metabolic-research models." },
    { id: "retatrutide-20", name: "GLP-3 RT", seq: "Modified peptide (39 aa)", cat: "metabolic", mw: "4731.4", purity: "99.2%", price: 95, size: "20 mg", stock: "in",
      desc: "Triple GLP-1 / GIP / glucagon receptor agonist (“Reta”) used in metabolic-research models." },
    { id: "ghkcu-50", name: "GHK-Cu", seq: "GHK", cat: "cosmetic", mw: "340.4", purity: "99.3%", price: 45, size: "50 mg", stock: "out",
      desc: "Copper-binding tripeptide investigated in dermal-matrix and skin research." },
    { id: "ghkcu-100", name: "GHK-Cu", seq: "GHK", cat: "cosmetic", mw: "340.4", purity: "99.3%", price: 70, size: "100 mg", stock: "low",
      desc: "Copper-binding tripeptide investigated in dermal-matrix and skin research." },
    { id: "klow", name: "KLOW", seq: "GHK-Cu / BPC-157 / TB-500 / KPV", cat: "repair", mw: "—", purity: "99.0%", price: 110, size: "80 mg", stock: "in",
      desc: "Multi-peptide recovery blend (GHK-Cu, BPC-157, TB-500, KPV) studied in tissue-repair and skin research." },
    { id: "motsc", name: "MOTS-c", seq: "MRWQEMGYIFYPRKLR", cat: "metabolic", mw: "2174.6", purity: "99.1%", price: 65, size: "10 mg", stock: "in",
      desc: "Mitochondrial-derived 16-residue peptide studied in metabolic-regulation and exercise-response research." },
    { id: "tesamorelin", name: "Tesamorelin", seq: "Modified GRF(1-44) analogue", cat: "metabolic", mw: "5135.9", purity: "99.2%", price: 75, size: "10 mg", stock: "in",
      desc: "Stabilised GHRH analogue used in metabolic and body-composition research." },
    { id: "tirzepatide", name: "Tirzepatide", seq: "Modified peptide (39 aa)", cat: "metabolic", mw: "4813.5", purity: "99.3%", price: 110, size: "20 mg", stock: "out",
      desc: "Dual GLP-1 / GIP receptor agonist used in metabolic-research models." },
    { id: "cjc-ipamorelin", name: "CJC-1295 + Ipamorelin", seq: "CJC-1295 + Ipamorelin (blend)", cat: "longevity", mw: "—", purity: "99.1%", price: 80, size: "10 mg", stock: "out",
      desc: "Growth-hormone-secretagogue blend used in GH-axis and recovery research." },
    { id: "tb500-bpc157", name: "TB-500 + BPC-157", seq: "TB-500 + BPC-157 (blend)", cat: "repair", mw: "—", purity: "99.2%", price: 90, size: "10 mg", stock: "out",
      desc: "Recovery blend of two peptides studied for tissue repair and cell migration." },
    { id: "ipamorelin", name: "Ipamorelin", seq: "Modified pentapeptide", cat: "longevity", mw: "711.9", purity: "99.5%", price: 55, size: "10 mg", stock: "out",
      desc: "Selective growth-hormone secretagogue used in GH-axis research." },
    { id: "kpv", name: "KPV", seq: "KPV", cat: "cosmetic", mw: "342.4", purity: "99.2%", price: 55, size: "10 mg", stock: "out",
      desc: "α-MSH C-terminal tripeptide studied for anti-inflammatory and skin research." },
  ];
  const CAT = { repair: "Repair", metabolic: "Metabolic", cognitive: "Cognitive", longevity: "Longevity", cosmetic: "Cosmetic" };
  const CAT_ORDER = ["repair", "metabolic", "cognitive", "longevity", "cosmetic"];

  const PROD_KEY = "ironclad_forged_products_v6";
  function loadProducts() { try { const v = JSON.parse(localStorage.getItem(PROD_KEY)); return Array.isArray(v) && v.length ? v : null; } catch { return null; } }
  function saveProducts() { try { localStorage.setItem(PROD_KEY, JSON.stringify(PRODUCTS)); } catch {} }
  let PRODUCTS = loadProducts() || DEFAULTS.map((p) => ({ ...p }));

  /* ---------- catalog ---------- */
  const grid = $("#grid");
  function renderCatalog() {
    grid.innerHTML = PRODUCTS.map((p, i) => {
      const out = p.stock === "out";
      const low = p.stock === "low";
      return `
      <li class="card plate reveal${out ? " card--out" : ""}" data-cat="${p.cat}" data-id="${p.id}">
        <div class="card__stage">
          <span class="card__num">${String(i).padStart(2, "0")}</span>
          <span class="card__purity">${p.purity}</span>
          <span class="card__cat">${CAT[p.cat]}</span>
          ${vial()}
          ${out ? '<span class="card__oos">Out of stock</span>' : ""}
          ${low ? '<span class="card__low">Low stock</span>' : ""}
        </div>
        <div class="card__body">
          <h3 class="card__name">${p.name} <span class="card__size">${p.size}</span></h3>
          <p class="card__desc">${p.desc}</p>
          <div class="card__seq" title="Sequence">${p.seq}</div>
          <div class="card__spec"><span>MW ${p.mw}</span><span>RUO</span></div>
          <div class="card__foot">
            <span class="card__price">${money(p.price)}<small>per vial</small></span>
            ${out
              ? '<button class="btn btn--steel card__add card__add--oos" disabled>Out of stock</button>'
              : `<button class="btn btn--bronze card__add" data-add="${p.id}">Add</button>`}
          </div>
          <span class="card__coa">▸ COA · lot #IC-${1000 + Math.floor(Math.random() * 8999)} <a href="#standard">view report</a></span>
        </div>
      </li>`;
    }).join("");
    observe($$(".card"));
  }
  grid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) addItem(add.dataset.add, add);
  });

  /* ---------- filters (built from categories actually in stock) ---------- */
  const filtersEl = $("#filters");
  function renderFilters() {
    const present = CAT_ORDER.filter((c) => PRODUCTS.some((p) => p.cat === c));
    filtersEl.innerHTML = ['<button class="chip is-active" data-filter="all" role="tab" aria-selected="true">All</button>']
      .concat(present.map((c) => `<button class="chip" data-filter="${c}" role="tab" aria-selected="false">${CAT[c]}</button>`))
      .join("");
  }
  filtersEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (!chip) return;
    $$(".chip", filtersEl).forEach((c) => { c.classList.remove("is-active"); c.setAttribute("aria-selected", "false"); });
    chip.classList.add("is-active"); chip.setAttribute("aria-selected", "true");
    const f = chip.dataset.filter;
    $$(".card").forEach((c) => c.classList.toggle("is-hidden", !(f === "all" || c.dataset.cat === f)));
  });

  /* ---------- pillars ---------- */
  const ICONS = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/></svg>',
    scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3"/><path d="M3 12h4l2-4 3 8 2-4h7"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6M10 2v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-5-9V2"/><path d="M7 15h10"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>',
  };
  const PILLARS = [
    ["scan", "Verified purity", "Reversed-phase HPLC quantifies purity by area-under-curve — target ≥ 99%, with the trace on every certificate."],
    ["shield", "Confirmed identity", "Mass spectrometry matches the observed molecular weight against the theoretical mass of the sequence."],
    ["flask", "Screened & sealed", "LAL endotoxin screening on every lot, then lyophilized and sealed under inert argon."],
    ["link", "Fully traceable", "Each vial carries a lot number that resolves to its full analytical report for the life of the batch."],
  ];
  function renderPillars() {
    $("#pillars").innerHTML = PILLARS.map(([ic, h, p]) => `
      <article class="pillar plate reveal">
        <span class="pillar__icon">${ICONS[ic]}</span>
        <h3>${h}</h3><p>${p}</p>
      </article>`).join("");
    observe($$(".pillar"));
  }

  /* ---------- forge (process) ---------- */
  const STEPS = [
    ["Synthesise", "Solid-phase synthesis to the target sequence, then cleavage and purification."],
    ["Assay", "Independent HPLC purity and mass-spec identity, plus an LAL endotoxin screen."],
    ["Seal", "Lyophilized and sealed under argon; dispatched cold in ~42 hours."],
    ["Certify", "The lot COA ships with the order and stays traceable to the vial."],
  ];
  function renderForge() {
    $("#forge").innerHTML = STEPS.map(([h, p], i) => `
      <li class="forge__step reveal"><span class="forge__n">${String(i + 1).padStart(2, "0")}</span><h3>${h}</h3><p>${p}</p></li>`).join("");
    observe($$(".forge__step"));
  }

  /* ---------- credentials + ticker ---------- */
  function renderStrips() {
    const creds = [
      ["shield", "For research purposes only"], ["flask", "Laboratory use only"],
      ["shield", "ISO 17025 partnered labs"], ["scan", "HPLC purity ≥ 99%"], ["shield", "Mass-spec identity confirmed"],
      ["flask", "Endotoxin screened"], ["flask", "Sealed under argon"], ["link", "Lot-level traceability"],
    ];
    const one = creds.map(([ic, t]) => `<span class="creds__item">${ICONS[ic]}${t}</span>`).join("");
    $("#credTrack").innerHTML = one + one;
  }

  /* ---------- selection (localStorage) ---------- */
  const KEY = "ironclad_forged_sel_v1";
  let sel = load();
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(sel)); } catch {} }
  function addItem(id, btn) {
    sel[id] = (sel[id] || 0) + 1; save(); syncUI();
    const p = PRODUCTS.find((x) => x.id === id);
    toast(`${p.name} added to selection`);
    if (btn) { btn.classList.add("is-added"); btn.textContent = "Added ✓"; setTimeout(() => { btn.classList.remove("is-added"); btn.textContent = "Add"; }, 1200); }
  }
  function setQty(id, q) { if (q <= 0) delete sel[id]; else sel[id] = q; save(); syncUI(); }

  const dock = $("#dock"), dockCount = $("#dockCount"), dockTotal = $("#dockTotal"), selCount = $("#selCount");
  const panelItems = $("#panelItems"), panelEmpty = $("#panelEmpty"), panelFoot = $("#panelFoot"), panelSubtotal = $("#panelSubtotal");
  function syncUI() {
    // drop any selection whose product no longer exists (after edits)
    Object.keys(sel).forEach((id) => { if (!PRODUCTS.some((p) => p.id === id)) delete sel[id]; });
    const ids = Object.keys(sel);
    const count = ids.reduce((s, id) => s + sel[id], 0);
    const total = ids.reduce((s, id) => s + PRODUCTS.find((p) => p.id === id).price * sel[id], 0);
    selCount.textContent = count; dockCount.textContent = count; dockTotal.textContent = money(total);
    dock.hidden = count === 0;
    requestAnimationFrame(() => dock.classList.toggle("is-shown", count > 0));
    if (ids.length === 0) { panelItems.innerHTML = ""; panelEmpty.classList.remove("is-hidden"); panelFoot.hidden = true; return; }
    panelEmpty.classList.add("is-hidden"); panelFoot.hidden = false;
    panelItems.innerHTML = ids.map((id) => {
      const p = PRODUCTS.find((x) => x.id === id), q = sel[id];
      return `<div class="pitem" data-id="${id}">
        <div><div class="pitem__name">${p.name}</div><div class="pitem__seq">${p.seq} · ${p.size}</div>
        <div class="pitem__qty"><button data-dec="${id}" aria-label="Decrease">−</button><span>${q}</span><button data-inc="${id}" aria-label="Increase">+</button></div></div>
        <div class="pitem__price">${money(p.price * q)}</div>
        <button class="pitem__remove" data-remove="${id}">Remove</button></div>`;
    }).join("");
    panelSubtotal.textContent = money(total);
  }
  panelItems.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), rem = e.target.closest("[data-remove]");
    if (inc) setQty(inc.dataset.inc, sel[inc.dataset.inc] + 1);
    else if (dec) setQty(dec.dataset.dec, sel[dec.dataset.dec] - 1);
    else if (rem) setQty(rem.dataset.remove, 0);
  });

  const panel = $("#panel"), overlay = $("#panelOverlay"); let lastFocus = null;
  function openPanel() { lastFocus = document.activeElement; overlay.hidden = false; requestAnimationFrame(() => { overlay.classList.add("is-open"); panel.classList.add("is-open"); }); panel.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; $("#panelClose").focus(); }
  function closePanel() { overlay.classList.remove("is-open"); panel.classList.remove("is-open"); panel.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; setTimeout(() => { overlay.hidden = true; }, 400); if (lastFocus) lastFocus.focus(); }
  $("#selOpen").addEventListener("click", openPanel);
  $("#dockReview").addEventListener("click", openPanel);
  $("#panelClose").addEventListener("click", closePanel);
  overlay.addEventListener("click", closePanel);
  $("#panelBrowse").addEventListener("click", () => { closePanel(); $("#catalog").scrollIntoView(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("is-open")) closePanel(); });
  $("#panelCheckout").addEventListener("click", () => { toast("Demo checkout — no payment taken. Thank you."); sel = {}; save(); syncUI(); setTimeout(closePanel, 900); });

  /* ---------- toast ---------- */
  const toastEl = $("#toast"); let tT;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add("is-shown"); clearTimeout(tT); tT = setTimeout(() => toastEl.classList.remove("is-shown"), 2400); }

  /* ---------- reveals + counters ---------- */
  let obs;
  function observe(nodes) {
    if (reduce) { nodes.forEach((n) => n.classList.add("is-visible")); return; }
    if (!obs) obs = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); } }), { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    nodes.forEach((n) => obs.observe(n));
  }
  function counters() {
    const els = $$("[data-count-to]");
    const fmt = (el, v) => (el.dataset.prefix || "") + v + (el.dataset.suffix || "");
    if (reduce) { els.forEach((el) => el.textContent = fmt(el, el.dataset.countTo)); return; }
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return; const el = en.target;
      const to = parseFloat(el.dataset.countTo), dec = (el.dataset.countTo.split(".")[1] || "").length, dur = 1400, start = performance.now();
      const tick = (now) => { const t = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - t, 3); el.textContent = fmt(el, (to * e).toFixed(dec)); if (t < 1) requestAnimationFrame(tick); else el.textContent = fmt(el, to.toFixed(dec)); };
      requestAnimationFrame(tick); io.unobserve(el);
    }), { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- nav + newsletter ---------- */
  function initNav() {
    const nav = $("#nav");
    const on = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    const burger = $("#burger"), menu = $("#mobileMenu");
    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open); menu.setAttribute("aria-hidden", String(open));
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => { burger.setAttribute("aria-expanded", "false"); menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); }));
  }
  function initNewsletter() {
    const form = $("#newsletter"), note = $("#nlNote");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("#email").value.trim());
      if (!ok) { note.style.color = "#e07a5a"; note.textContent = "Enter a valid email address."; return; }
      note.style.color = ""; note.textContent = "You're on the list — spec sheets incoming."; form.reset();
    });
  }

  /* ---------- age gate (21+) ---------- */
  const AGE_KEY = "ironclad_forged_age_v1";
  function initAgeGate() {
    const gate = $("#ageGate"); if (!gate) return;
    let ok = false; try { ok = localStorage.getItem(AGE_KEY) === "yes"; } catch {}
    if (ok) { gate.hidden = true; return; }
    document.body.classList.add("gate-locked");
    const ask = $("#ageAsk"), deny = $("#ageDeny");
    $("#ageYes").focus();
    gate.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = $$("button", gate).filter((b) => b.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    $("#ageYes").addEventListener("click", () => {
      try { localStorage.setItem(AGE_KEY, "yes"); } catch {}
      gate.style.transition = "opacity .4s var(--ease)"; gate.style.opacity = "0";
      document.body.classList.remove("gate-locked");
      setTimeout(() => { gate.hidden = true; }, 400);
    });
    $("#ageNo").addEventListener("click", () => { ask.hidden = true; deny.hidden = false; $("#ageBack").focus(); });
    $("#ageBack").addEventListener("click", () => { deny.hidden = true; ask.hidden = false; $("#ageYes").focus(); });
  }

  /* ---------- product editor ---------- */
  function slugify(s) { return (String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) || ("p" + Math.random().toString(36).slice(2, 7)); }
  function initEditor() {
    const modal = $("#editor"), rowsEl = $("#editRows");
    const CATS = ["repair", "metabolic", "cognitive", "longevity", "cosmetic"];
    let draft = [];

    const rowHTML = (p, i) => `
      <div class="erow" data-i="${i}">
        <div class="erow__grid">
          <label>Name<input data-f="name" value="${esc(p.name)}" /></label>
          <label>Category<select data-f="cat">${CATS.map((c) => `<option value="${c}"${c === p.cat ? " selected" : ""}>${CAT[c]}</option>`).join("")}</select></label>
          <label>Size<input data-f="size" value="${esc(p.size)}" /></label>
          <label>Price ($)<input data-f="price" type="number" min="0" step="0.01" value="${esc(p.price)}" /></label>
          <label>Purity<input data-f="purity" value="${esc(p.purity)}" /></label>
          <label>MW<input data-f="mw" value="${esc(p.mw)}" /></label>
          <label>Stock<select data-f="stock"><option value="in"${(p.stock || "in") === "in" ? " selected" : ""}>In stock</option><option value="low"${p.stock === "low" ? " selected" : ""}>Low stock</option><option value="out"${p.stock === "out" ? " selected" : ""}>Out of stock</option></select></label>
          <label class="erow__wide">Sequence<input data-f="seq" value="${esc(p.seq)}" /></label>
          <label class="erow__wide">Description<textarea data-f="desc" rows="2">${esc(p.desc)}</textarea></label>
        </div>
        <button class="erow__del" data-del="${i}">Remove</button>
      </div>`;
    const render = () => { rowsEl.innerHTML = draft.map(rowHTML).join(""); };
    const readDraft = () => $$(".erow", rowsEl).forEach((row) => {
      const p = draft[+row.dataset.i]; if (!p) return;
      $$("[data-f]", row).forEach((f) => { p[f.dataset.f] = f.value; });
    });

    function open() { draft = PRODUCTS.map((p) => ({ ...p })); render(); modal.hidden = false; document.body.style.overflow = "hidden"; requestAnimationFrame(() => modal.classList.add("is-open")); $("#editClose").focus(); }
    function close() { modal.classList.remove("is-open"); document.body.style.overflow = ""; setTimeout(() => { modal.hidden = true; }, 300); }

    $("#editOpen").addEventListener("click", open);
    $("#editClose").addEventListener("click", close);
    $("#editCancel").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });

    rowsEl.addEventListener("click", (e) => { const del = e.target.closest("[data-del]"); if (del) { readDraft(); draft.splice(+del.dataset.del, 1); render(); } });
    $("#editAdd").addEventListener("click", () => { readDraft(); draft.push({ id: "", name: "New compound", cat: "repair", seq: "", mw: "", purity: "99.0%", price: 0, size: "5 mg", desc: "" }); render(); rowsEl.lastElementChild.scrollIntoView({ block: "center" }); });
    $("#editReset").addEventListener("click", () => { draft = DEFAULTS.map((p) => ({ ...p })); render(); toast("Reverted to default catalog (unsaved)"); });
    $("#editExport").addEventListener("click", () => {
      readDraft(); const json = JSON.stringify(draft, null, 2);
      if (navigator.clipboard) navigator.clipboard.writeText(json).then(() => toast("Product JSON copied to clipboard")).catch(() => toast("See console for JSON"));
      else toast("See console for JSON");
      console.log("IRONCLAD COMPOUNDS — products JSON:\n" + json);
    });
    $("#editSave").addEventListener("click", () => {
      readDraft(); const seen = {};
      PRODUCTS = draft.filter((p) => (p.name || "").trim()).map((p) => {
        let id = (p.id && p.id.trim()) ? p.id.trim() : slugify(p.name);
        while (seen[id]) id += "-x"; seen[id] = 1;
        return { ...p, id, price: parseFloat(p.price) || 0 };
      });
      saveProducts(); renderCatalog(); renderFilters();
      syncUI(); close(); toast("Catalog updated");
    });
  }

  /* ---------- announcement / offers banner ---------- */
  const PROMO_KEY = "ironclad_forged_promo_v1";
  const PROMO_DISMISS = "ironclad_forged_promo_dismissed";
  const PROMO_DEFAULT = {
    on: true, tag: "Announcement",
    title: "Launch offer — 15% off your first order", highlight: "15% off",
    text: "New lots drop monthly — watch this space for flash sales and bundle deals.",
    code: "IRONCLAD15", cta: "Shop the catalog", href: "#catalog",
  };
  const PROMO_FIELDS = ["tag", "title", "highlight", "text", "code", "cta", "href"];
  let promo = loadPromo();
  function loadPromo() { try { return Object.assign({}, PROMO_DEFAULT, JSON.parse(localStorage.getItem(PROMO_KEY)) || {}); } catch { return { ...PROMO_DEFAULT }; } }
  function savePromo() { try { localStorage.setItem(PROMO_KEY, JSON.stringify(promo)); } catch {} }
  const promoSig = (p) => [p.on, p.tag, p.title, p.highlight, p.text, p.code, p.cta, p.href].join("|");
  function highlightTitle(title, hl) {
    const t = esc(title); if (!hl) return t;
    const h = esc(hl); const i = t.indexOf(h);
    return i < 0 ? t : t.slice(0, i) + '<span class="bronze-text">' + h + "</span>" + t.slice(i + h.length);
  }
  const offersSection = $("#offers");
  const pencil = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  function renderPromo() {
    let dismissed = false;
    try { dismissed = localStorage.getItem(PROMO_DISMISS) === promoSig(promo); } catch {}
    const shown = !!promo.on && !dismissed;
    offersSection.style.display = shown ? "" : "none";
    $$('a[href="#offers"]').forEach((a) => { a.style.display = shown ? "" : "none"; });
    if (!shown) return;
    $("#promoInner").innerHTML = `
      <div class="promo__glow" aria-hidden="true"></div>
      <button class="promo__edit" id="promoOpen" aria-label="Edit announcement" title="Edit announcement">${pencil}</button>
      <button class="promo__dismiss" id="promoDismiss" aria-label="Dismiss announcement">×</button>
      <span class="promo__tag">${esc(promo.tag)}</span>
      <h2 class="promo__title">${highlightTitle(promo.title, promo.highlight)}</h2>
      ${promo.text ? `<p class="promo__text">${esc(promo.text)}</p>` : ""}
      ${promo.code ? `<p class="promo__codeline">Use code <span class="promo__code">${esc(promo.code)}</span></p>` : ""}
      ${(promo.cta && promo.href) ? `<a class="btn btn--bronze" href="${esc(promo.href)}">${esc(promo.cta)}</a>` : ""}`;
    $("#promoOpen").addEventListener("click", openPromoEditor);
    $("#promoDismiss").addEventListener("click", () => { try { localStorage.setItem(PROMO_DISMISS, promoSig(promo)); } catch {} renderPromo(); });
  }
  function fillPromoFields() {
    const m = $("#promoEditor");
    m.querySelector('[data-pf="on"]').checked = !!promo.on;
    PROMO_FIELDS.forEach((k) => { const el = m.querySelector(`[data-pf="${k}"]`); if (el) el.value = promo[k] || ""; });
  }
  function openPromoEditor() { const m = $("#promoEditor"); fillPromoFields(); m.hidden = false; document.body.style.overflow = "hidden"; requestAnimationFrame(() => m.classList.add("is-open")); $("#promoClose").focus(); }
  function closePromoEditor() { const m = $("#promoEditor"); m.classList.remove("is-open"); document.body.style.overflow = ""; setTimeout(() => { m.hidden = true; }, 300); }
  function initPromo() {
    renderPromo();
    $("#promoClose").addEventListener("click", closePromoEditor);
    $("#promoCancel").addEventListener("click", closePromoEditor);
    $("#promoEditor").addEventListener("click", (e) => { if (e.target.id === "promoEditor") closePromoEditor(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#promoEditor").hidden) closePromoEditor(); });
    $("#promoReset").addEventListener("click", () => { promo = { ...PROMO_DEFAULT }; savePromo(); try { localStorage.removeItem(PROMO_DISMISS); } catch {} fillPromoFields(); toast("Reverted to default (unsaved until you Save)"); });
    $("#promoSave").addEventListener("click", () => {
      const m = $("#promoEditor");
      promo.on = m.querySelector('[data-pf="on"]').checked;
      PROMO_FIELDS.forEach((k) => { const el = m.querySelector(`[data-pf="${k}"]`); if (el) promo[k] = el.value; });
      savePromo(); try { localStorage.removeItem(PROMO_DISMISS); } catch {} renderPromo(); closePromoEditor(); toast("Announcement updated");
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#navEmblem").innerHTML = emblem();
    $("#heroCrest").innerHTML = '<img class="crest-img" src="assets/img/logo.png" alt="IronClad Compounds" />';
    $("#ageEmblem").innerHTML = emblem();
    $("#year").textContent = new Date().getFullYear();
    renderCatalog();
    renderFilters();
    renderPillars();
    renderForge();
    renderStrips();
    syncUI();
    initAgeGate();
    observe($$(".reveal"));
    counters();
    initNav();
    initNewsletter();
    initEditor();
    initPromo();
  });
})();
