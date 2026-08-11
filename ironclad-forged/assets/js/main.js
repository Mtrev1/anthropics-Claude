/* =====================================================================
   IRONCLAD PEPTIDES (forged) — interactions
   Vanilla JS, no dependencies. Generates the crest/gear SVGs, the metallic
   vial, the catalog, and drives selection, filters, the age gate and motion.
   ===================================================================== */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
    return `<svg viewBox="0 0 120 132" width="100%" height="100%" aria-hidden="true">
      <path d="${gearPath(60, 58, 56, 47, 16)}" fill="url(#steelV)" fill-rule="evenodd" stroke="#0a0b0d" stroke-width="1.2"/>
      <path d="M20,30 L100,30 L100,63 Q100,95 60,120 Q20,95 20,63 Z" fill="url(#steelV)" stroke="url(#bronzeG)" stroke-width="3"/>
      <path d="M26,35 L94,35 L94,62 Q94,90 60,112 Q26,90 26,62 Z" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1"/>
      <rect x="24" y="53" width="72" height="14" fill="url(#bronzeG)" stroke="#3a260f" stroke-width="1"/>
      <text x="60" y="64" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="11" letter-spacing="1" fill="#1a1206">IC</text>
      <path d="M42,80 L60,96 L78,80" fill="none" stroke="url(#bronzeG)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <g fill="url(#chromeG)" stroke="#0a0b0d" stroke-width=".6">
        <circle cx="30" cy="42" r="2.4"/><circle cx="60" cy="39.5" r="2.4"/><circle cx="90" cy="42" r="2.4"/>
        <circle cx="34" cy="99" r="2.1"/><circle cx="86" cy="99" r="2.1"/>
      </g>
    </svg>`;
  }
  function heroGear() {
    return `<svg viewBox="0 0 220 220" aria-hidden="true">
      <path d="${gearPath(110, 110, 104, 84, 22)}" fill="none" stroke="#7c828c" stroke-width="2" fill-rule="evenodd"/>
      <circle cx="110" cy="110" r="58" fill="none" stroke="#7c828c" stroke-width="2"/>
      <circle cx="110" cy="110" r="34" fill="none" stroke="#7c828c" stroke-width="2"/>
      <circle cx="110" cy="110" r="6" fill="#7c828c"/>
    </svg>`;
  }

  /* ---------- metallic vial (animated) ---------- */
  function vial() {
    return `<svg class="vial" viewBox="0 0 40 64" width="78" style="--vg:#c2894b" aria-hidden="true">
      <rect x="12.5" y="2" width="15" height="7" rx="1.4" fill="url(#chromeG)" stroke="#0a0b0d" stroke-width=".8"/>
      <rect x="14.5" y="9" width="11" height="3.6" fill="#2a2e35"/>
      <rect x="9.5" y="12.6" width="21" height="48" rx="5.5" fill="url(#steelCyl)" stroke="#0a0b0d" stroke-width="1"/>
      <path class="vfill" d="M11.5 46 h17 v8.5 a4 4 0 0 1 -4 4 h-9 a4 4 0 0 1 -4 -4 z" fill="url(#bronzeCyl)"/>
      <line x1="11.5" y1="46" x2="28.5" y2="46" stroke="#f0b972" stroke-width="1"/>
      <rect x="9.5" y="28" width="21" height="12.5" fill="#0d0f12" opacity=".92"/>
      <line x1="12" y1="32" x2="28" y2="32" stroke="#c2894b" stroke-width="1" opacity=".75"/>
      <line x1="12" y1="35.5" x2="24" y2="35.5" stroke="#8a8f99" stroke-width="1" opacity=".6"/>
      <ellipse cx="15" cy="22" rx="2" ry="8" fill="#f4f6fa" opacity=".32"/>
    </svg>`;
  }

  /* ---------- data ---------- */
  const PRODUCTS = [
    { id: "bpc157", name: "BPC-157", seq: "GEPPPGKPADDAGLV", cat: "repair", mw: "1419.5", purity: "99.6%", price: 54, size: "5 mg", tag: "Best seller",
      desc: "Fifteen-residue body-protection compound studied for tissue repair and angiogenesis." },
    { id: "tb500", name: "TB-500", seq: "LKKTETQ", cat: "repair", mw: "889.0", purity: "99.3%", price: 62, size: "5 mg", tag: "In stock",
      desc: "Active thymosin β4 fragment used in cell-migration and recovery research." },
    { id: "ghkcu", name: "GHK-Cu", seq: "GHK", cat: "cosmetic", mw: "340.4", purity: "99.3%", price: 48, size: "50 mg", tag: "In stock",
      desc: "Copper-binding tripeptide investigated in dermal-matrix remodelling research." },
    { id: "ipamorelin", name: "Ipamorelin", seq: "AibHDFK", cat: "cognitive", mw: "711.9", purity: "99.5%", price: 58, size: "5 mg", tag: "In stock",
      desc: "Selective secretagogue peptide used in endocrine-signalling research." },
    { id: "semax", name: "Semax", seq: "MEHFPGP", cat: "cognitive", mw: "813.9", purity: "99.4%", price: 69, size: "10 mg", tag: "New lot",
      desc: "ACTH(4-10) analogue applied in neurotrophic and cognitive-performance studies." },
    { id: "epithalon", name: "Epithalon", seq: "AEDG", cat: "longevity", mw: "390.3", purity: "99.5%", price: 44, size: "10 mg", tag: "In stock",
      desc: "Synthetic tetrapeptide studied in telomerase-activity and circadian-regulation models." },
    { id: "glutathione", name: "Glutathione", seq: "ECG", cat: "longevity", mw: "307.3", purity: "99.0%", price: 39, size: "600 mg", tag: "In stock",
      desc: "Tripeptide antioxidant used broadly in oxidative-stress and redox research." },
    { id: "nadplus", name: "NAD+", seq: "C21H27N7O14P2", cat: "longevity", mw: "663.4", purity: "99.2%", price: 89, size: "500 mg", tag: "Premium",
      desc: "Coenzyme applied in cellular-metabolism and mitochondrial studies." },
    { id: "selank", name: "Selank", seq: "TKPRPGP", cat: "cognitive", mw: "751.9", purity: "99.2%", price: 66, size: "10 mg", tag: "In stock",
      desc: "Tuftsin-derived heptapeptide used in anxiolytic and neuro-signalling research." },
  ];
  const CAT = { repair: "Repair", cognitive: "Cognitive", longevity: "Longevity", cosmetic: "Cosmetic" };

  /* ---------- catalog ---------- */
  const grid = $("#grid");
  function renderCatalog() {
    grid.innerHTML = PRODUCTS.map((p, i) => `
      <li class="card plate reveal" data-cat="${p.cat}" data-id="${p.id}">
        <div class="card__stage">
          <span class="card__num">${String(i).padStart(2, "0")}</span>
          <span class="card__purity">${p.purity}</span>
          <span class="card__cat">${CAT[p.cat]}</span>
          ${vial()}
        </div>
        <div class="card__body">
          <h3 class="card__name">${p.name}</h3>
          <p class="card__desc">${p.desc}</p>
          <div class="card__seq" title="Sequence">${p.seq}</div>
          <div class="card__spec"><span>${p.size}</span><span>MW ${p.mw}</span><span>RUO</span></div>
          <div class="card__foot">
            <span class="card__price">${money(p.price)}<small>per vial</small></span>
            <button class="btn btn--bronze card__add" data-add="${p.id}">Add</button>
          </div>
          <span class="card__coa">▸ COA · lot #IC-${1000 + Math.floor(Math.random() * 8999)} <a href="#standard">view report</a></span>
        </div>
      </li>`).join("");
    observe($$(".card"));
  }
  grid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) addItem(add.dataset.add, add);
  });

  /* ---------- filters ---------- */
  $$(".chip").forEach((chip) => chip.addEventListener("click", () => {
    $$(".chip").forEach((c) => { c.classList.remove("is-active"); c.setAttribute("aria-selected", "false"); });
    chip.classList.add("is-active"); chip.setAttribute("aria-selected", "true");
    const f = chip.dataset.filter;
    $$(".card").forEach((c) => c.classList.toggle("is-hidden", !(f === "all" || c.dataset.cat === f)));
  }));

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
      ["shield", "ISO 17025 partnered labs"], ["scan", "HPLC purity ≥ 99%"], ["shield", "Mass-spec identity confirmed"],
      ["flask", "Endotoxin screened"], ["flask", "Sealed under argon"], ["link", "Lot-level traceability"],
    ];
    const one = creds.map(([ic, t]) => `<span class="creds__item">${ICONS[ic]}${t}</span>`).join("");
    $("#credTrack").innerHTML = one + one;
    const tick = ["Research use only", "Not for human consumption", "HPLC ≥ 99%", "Mass-spec verified", "COA per lot", "Cold-chain shipped"];
    const t = tick.map((x) => `<span>${x}</span><b>◆</b>`).join("");
    $("#tickerTrack").innerHTML = t + t;
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

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#navEmblem").innerHTML = emblem();
    $("#heroCrest").innerHTML = emblem();
    $("#ageEmblem").innerHTML = emblem();
    $("#heroGear").innerHTML = heroGear();
    $("#year").textContent = new Date().getFullYear();
    renderCatalog();
    renderPillars();
    renderForge();
    renderStrips();
    syncUI();
    initAgeGate();
    observe($$(".reveal"));
    counters();
    initNav();
    initNewsletter();
  });
})();
