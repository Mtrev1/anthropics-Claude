/* =====================================================================
   IRONCLAD PEPTIDES — interactions
   Vanilla JS, no dependencies. The amino-acid sequence drives the UI.
   ===================================================================== */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- amino acids: one-letter -> name + functional class ---------- */
  const AA = {
    A: ["Alanine", "nonpolar"], R: ["Arginine", "basic"],   N: ["Asparagine", "polar"],
    D: ["Aspartate", "acidic"], C: ["Cysteine", "polar"],   E: ["Glutamate", "acidic"],
    Q: ["Glutamine", "polar"],  G: ["Glycine", "nonpolar"], H: ["Histidine", "basic"],
    I: ["Isoleucine", "nonpolar"], L: ["Leucine", "nonpolar"], K: ["Lysine", "basic"],
    M: ["Methionine", "nonpolar"], F: ["Phenylalanine", "nonpolar"], P: ["Proline", "nonpolar"],
    S: ["Serine", "polar"],     T: ["Threonine", "polar"],   W: ["Tryptophan", "nonpolar"],
    Y: ["Tyrosine", "polar"],   V: ["Valine", "nonpolar"],
  };
  const classOf = (letter) => (AA[letter] ? AA[letter][1] : "nonpolar");

  /* ---------- products: real published sequences (illustrative) ---------- */
  const PRODUCTS = [
    { id: "ghkcu",  name: "GHK-Cu",     seq: "GHK",             cat: "cosmetic",  mw: "340.4", purity: "99.3%", price: 48, size: "50 mg",
      desc: "Copper-binding tripeptide investigated in dermal-matrix remodelling and regeneration research." },
    { id: "epithalon", name: "Epithalon", seq: "AEDG",          cat: "longevity", mw: "390.3", purity: "99.5%", price: 44, size: "10 mg",
      desc: "Synthetic tetrapeptide studied in telomerase-activity and circadian-regulation models." },
    { id: "selank", name: "Selank",     seq: "TKPRPGP",         cat: "cognitive", mw: "751.9", purity: "99.2%", price: 66, size: "10 mg",
      desc: "Heptapeptide derived from tuftsin, used in anxiolytic and neuro-signalling research." },
    { id: "semax",  name: "Semax",      seq: "MEHFPGP",         cat: "cognitive", mw: "813.9", purity: "99.4%", price: 69, size: "10 mg",
      desc: "ACTH(4-10) analogue applied in neurotrophic and cognitive-performance studies." },
    { id: "bpc157", name: "BPC-157",    seq: "GEPPPGKPADDAGLV", cat: "repair",    mw: "1419.5", purity: "99.6%", price: 54, size: "5 mg",
      desc: "Fifteen-residue body-protection compound studied for tissue-repair and angiogenesis." },
    { id: "glutathione", name: "Glutathione", seq: "ECG",       cat: "longevity", mw: "307.3", purity: "99.0%", price: 39, size: "600 mg",
      desc: "Tripeptide antioxidant used broadly in oxidative-stress and redox research." },
    { id: "pinealon", name: "Pinealon", seq: "EDR",             cat: "cognitive", mw: "418.4", purity: "99.1%", price: 42, size: "10 mg",
      desc: "Tripeptide investigated in neuroprotection and oxidative-stress-resistance models." },
    { id: "vilon",  name: "Vilon",      seq: "KE",              cat: "longevity", mw: "275.3", purity: "99.2%", price: 38, size: "10 mg",
      desc: "Dipeptide studied for immunomodulatory and gene-expression research applications." },
    { id: "thymogen", name: "Thymogen", seq: "EW",              cat: "repair",    mw: "333.3", purity: "99.1%", price: 40, size: "10 mg",
      desc: "Glu-Trp dipeptide used in immunoregulation and recovery research." },
  ];
  const CAT = { repair: "Repair", cognitive: "Cognitive", longevity: "Longevity", cosmetic: "Cosmetic" };

  /* ---------- render residue chips ---------- */
  function chips(seq, big) {
    return seq.split("").map((L) => `<span class="res res--${classOf(L)}${big ? " res--big" : ""}" title="${AA[L] ? AA[L][0] : L}">${L}</span>`).join("");
  }
  function classCounts(seq) {
    const c = { nonpolar: 0, polar: 0, acidic: 0, basic: 0 };
    seq.split("").forEach((L) => { c[classOf(L)]++; });
    return c;
  }

  /* ---------- render the index ---------- */
  const idx = $("#idx");
  function renderIndex() {
    idx.innerHTML = PRODUCTS.map((p, i) => {
      const c = classCounts(p.seq);
      const total = p.seq.length;
      const pct = (n) => (n / total) * 100;
      return `
      <li class="idx__item reveal" data-cat="${p.cat}" data-id="${p.id}">
        <button class="idx__row-top" data-toggle="${p.id}" aria-expanded="false">
          <span class="idx__num">${String(i).padStart(2, "0")}</span>
          <span class="idx__name">${p.name}<small>${CAT[p.cat]} · ${p.size}</small></span>
          <span class="idx__seq">${chips(p.seq)}</span>
          <span class="idx__mw">${p.mw}</span>
          <span class="idx__purity">${p.purity}</span>
          <span class="idx__price">${money(p.price)}</span>
          <span class="idx__actions"><span class="idx__toggle" aria-hidden="true">+</span></span>
        </button>
        <div class="idx__detail">
          <div class="idx__detail-inner">
            <div class="idx__detail-pad">
              <div>
                <p class="idx__desc">${p.desc}</p>
                <div class="idx__seqbig">${chips(p.seq, true)}</div>
                <div class="classbar" aria-hidden="true">
                  <span class="c-nonpolar" style="width:${pct(c.nonpolar)}%"></span>
                  <span class="c-polar" style="width:${pct(c.polar)}%"></span>
                  <span class="c-acidic" style="width:${pct(c.acidic)}%"></span>
                  <span class="c-basic" style="width:${pct(c.basic)}%"></span>
                </div>
                <p class="classbar-key">${total} residues — ${c.nonpolar} nonpolar · ${c.polar} polar · ${c.acidic} acidic · ${c.basic} basic</p>
              </div>
              <div class="idx__spec">
                <dl>
                  <dt>Sequence</dt><dd>${p.seq}</dd>
                  <dt>Length</dt><dd>${total} aa</dd>
                  <dt>Mol. weight</dt><dd>${p.mw} g/mol</dd>
                  <dt>Purity</dt><dd>${p.purity}</dd>
                  <dt>Format</dt><dd>${p.size} · lyophilized</dd>
                </dl>
                <span class="idx__coa">📄 COA · lot #IC-${1000 + Math.floor(Math.random() * 8999)} <a href="#method">view report</a></span>
                <button class="btn btn--solid idx__add" data-add="${p.id}">Add to selection</button>
              </div>
            </div>
          </div>
        </div>
      </li>`;
    }).join("");
    observe($$(".idx__item"));
  }

  /* ---------- expand / collapse rows ---------- */
  idx.addEventListener("click", (e) => {
    const t = e.target.closest("[data-toggle]");
    const add = e.target.closest("[data-add]");
    if (add) { e.stopPropagation(); addItem(add.dataset.add, add); return; }
    if (!t) return;
    const item = t.closest(".idx__item");
    const open = item.classList.toggle("is-open");
    t.setAttribute("aria-expanded", String(open));
    t.querySelector(".idx__toggle").textContent = open ? "−" : "+";
  });

  /* ---------- filters ---------- */
  $$(".tab").forEach((tab) => tab.addEventListener("click", () => {
    $$(".tab").forEach((x) => { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
    tab.classList.add("is-active"); tab.setAttribute("aria-selected", "true");
    const f = tab.dataset.filter;
    $$(".idx__item").forEach((it) => it.classList.toggle("is-hidden", !(f === "all" || it.dataset.cat === f)));
  }));

  /* ---------- residue key + legend ---------- */
  function renderKey() {
    const legend = [
      ["nonpolar", "Nonpolar", "var(--r-nonpolar)"],
      ["polar", "Polar", "var(--r-polar)"],
      ["acidic", "Acidic", "var(--r-acidic)"],
      ["basic", "Basic", "var(--r-basic)"],
    ];
    $("#legend").innerHTML = legend.map(([, label, col]) => `<span><i style="background:${col}"></i>${label}</span>`).join("");
    $("#keygrid").innerHTML = Object.keys(AA).map((L) => {
      const [name, cls] = AA[L];
      return `<div class="key key--${cls} reveal"><span class="key__letter">${L}</span><span class="key__name">${name}</span></div>`;
    }).join("");
    observe($$(".key"));
  }

  /* ---------- sequence ticker ---------- */
  function renderTicker() {
    const seqs = PRODUCTS.map((p) => p.seq);
    let html = "";
    const build = () => seqs.forEach((s) => {
      html += s.split("").map((L) => `<span class="seq-chip res--${classOf(L)}" style="color:var(--r-${classOf(L)})">${L}</span>`).join("");
      html += `<span class="seq-gap"></span>`;
    });
    build(); build(); // duplicate for seamless loop
    $("#seqTrack").innerHTML = html;
  }

  /* ---------- selection (cart) with localStorage ---------- */
  const KEY = "ironclad_sel_v1";
  let sel = load();
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(sel)); } catch {} }

  function addItem(id, btn) {
    sel[id] = (sel[id] || 0) + 1; save(); syncUI();
    const p = PRODUCTS.find((x) => x.id === id);
    toast(`${p.name} added to selection`);
    if (btn) { btn.classList.add("is-added"); btn.textContent = "Added ✓"; setTimeout(() => { btn.classList.remove("is-added"); btn.textContent = "Add to selection"; }, 1200); }
  }
  function setQty(id, q) { if (q <= 0) delete sel[id]; else sel[id] = q; save(); syncUI(); }

  const dock = $("#dock"), dockCount = $("#dockCount"), dockTotal = $("#dockTotal");
  const selCount = $("#selCount");
  const panelItems = $("#panelItems"), panelEmpty = $("#panelEmpty"), panelFoot = $("#panelFoot"), panelSubtotal = $("#panelSubtotal");

  function syncUI() {
    const ids = Object.keys(sel);
    const count = ids.reduce((s, id) => s + sel[id], 0);
    const total = ids.reduce((s, id) => s + (PRODUCTS.find((p) => p.id === id).price * sel[id]), 0);
    selCount.textContent = count;
    dockCount.textContent = count;
    dockTotal.textContent = money(total);
    dock.hidden = count === 0;
    requestAnimationFrame(() => dock.classList.toggle("is-shown", count > 0));

    if (ids.length === 0) {
      panelItems.innerHTML = ""; panelEmpty.classList.remove("is-hidden"); panelFoot.hidden = true; return;
    }
    panelEmpty.classList.add("is-hidden"); panelFoot.hidden = false;
    panelItems.innerHTML = ids.map((id) => {
      const p = PRODUCTS.find((x) => x.id === id); const q = sel[id];
      return `
      <div class="pitem" data-id="${id}">
        <div>
          <div class="pitem__name">${p.name}</div>
          <div class="pitem__seq">${p.seq} · ${p.size}</div>
          <div class="pitem__qty">
            <button data-dec="${id}" aria-label="Decrease">−</button>
            <span>${q}</span>
            <button data-inc="${id}" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="pitem__price">${money(p.price * q)}</div>
        <button class="pitem__remove" data-remove="${id}">Remove</button>
      </div>`;
    }).join("");
    panelSubtotal.textContent = money(total);
  }

  panelItems.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), rem = e.target.closest("[data-remove]");
    if (inc) setQty(inc.dataset.inc, sel[inc.dataset.inc] + 1);
    else if (dec) setQty(dec.dataset.dec, sel[dec.dataset.dec] - 1);
    else if (rem) setQty(rem.dataset.remove, 0);
  });

  /* ---------- panel open/close ---------- */
  const panel = $("#panel"), overlay = $("#panelOverlay");
  let lastFocus = null;
  function openPanel() {
    lastFocus = document.activeElement; overlay.hidden = false;
    requestAnimationFrame(() => { overlay.classList.add("is-open"); panel.classList.add("is-open"); });
    panel.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; $("#panelClose").focus();
  }
  function closePanel() {
    overlay.classList.remove("is-open"); panel.classList.remove("is-open"); panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; setTimeout(() => { overlay.hidden = true; }, 400); if (lastFocus) lastFocus.focus();
  }
  $("#selOpen").addEventListener("click", openPanel);
  $("#dockReview").addEventListener("click", openPanel);
  $("#panelClose").addEventListener("click", closePanel);
  overlay.addEventListener("click", closePanel);
  $("#panelBrowse").addEventListener("click", () => { closePanel(); $("#index").scrollIntoView(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("is-open")) closePanel(); });
  $("#panelCheckout").addEventListener("click", () => { toast("Demo checkout — no payment taken. Thank you."); sel = {}; save(); syncUI(); setTimeout(closePanel, 900); });

  /* ---------- toast ---------- */
  const toastEl = $("#toast"); let tTimer;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("is-shown"); clearTimeout(tTimer); tTimer = setTimeout(() => toastEl.classList.remove("is-shown"), 2400); }

  /* ---------- reveal on scroll ---------- */
  let obs;
  function observe(nodes) {
    if (reduce) { nodes.forEach((n) => n.classList.add("is-visible")); return; }
    if (!obs) obs = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); } }), { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    nodes.forEach((n) => obs.observe(n));
  }

  /* ---------- count-up ---------- */
  function counters() {
    const els = $$("[data-count-to]");
    if (reduce) { els.forEach((el) => el.textContent = el.dataset.countTo + (el.dataset.suffix || "")); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return; const el = en.target;
      const to = parseFloat(el.dataset.countTo), suf = el.dataset.suffix || "", dec = (el.dataset.countTo.split(".")[1] || "").length;
      const dur = 1400, start = performance.now();
      const tick = (now) => { const t = Math.min((now - start) / dur, 1); const e = 1 - Math.pow(1 - t, 3); el.textContent = (to * e).toFixed(dec) + suf; if (t < 1) requestAnimationFrame(tick); else el.textContent = to.toFixed(dec) + suf; };
      requestAnimationFrame(tick); io.unobserve(el);
    }), { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- folding peptide backbone (canvas) ----------
     A connected chain of residues traced along a path that slowly folds.
     Distinct from a particle field: it's one continuous backbone (N→C).      */
  function initChain() {
    const canvas = $("#chainCanvas"); if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const seq = "GEPPPGKPADDAGLV".split(""); // 15 residues, on-theme (BPC-157)
    const COLORS = {
      nonpolar: "#9a7b3f", polar: "#227e70", acidic: "#c2432c", basic: "#2f52c8",
    };
    let w, h, dpr, t = 0, raf, running = true;
    const nodes = seq.map((L, i) => ({ L, cls: classOf(L), phase: i * 0.6 }));

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function pos(i, time) {
      const n = nodes.length;
      const margin = 34;
      const x = margin + (i / (n - 1)) * (w - margin * 2);
      // folding motion: layered sine waves, gentle
      const amp = Math.min(h * 0.28, 70);
      const y = h / 2
        + Math.sin(i * 0.9 + time) * amp * 0.6
        + Math.sin(i * 0.35 - time * 0.7) * amp * 0.4;
      return { x, y };
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const pts = nodes.map((_, i) => pos(i, t));
      // backbone bonds
      ctx.lineWidth = 2; ctx.strokeStyle = "rgba(23,22,15,.32)";
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const xc = (pts[i - 1].x + pts[i].x) / 2, yc = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
      // residues
      nodes.forEach((n, i) => {
        const { x, y } = pts[i];
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[n.cls]; ctx.globalAlpha = 0.16; ctx.fill(); ctx.globalAlpha = 1;
        ctx.lineWidth = 1.6; ctx.strokeStyle = COLORS[n.cls]; ctx.stroke();
        ctx.fillStyle = COLORS[n.cls]; ctx.font = "600 11px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(n.L, x, y + 0.5);
      });
      t += 0.008;
      raf = requestAnimationFrame(frame);
    }

    size();
    if (reduce) { t = 1.2; frame(); running = false; cancelAnimationFrame(raf); return; }
    frame();
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 200); });
    new IntersectionObserver((e) => { running = e[0].isIntersecting; if (running) { cancelAnimationFrame(raf); frame(); } else cancelAnimationFrame(raf); }, { threshold: 0 }).observe(canvas);
  }

  /* ---------- header shadow on scroll ---------- */
  function initHead() {
    const head = $("#head");
    const on = () => head.style.borderBottomColor = window.scrollY > 8 ? "var(--line-2)" : "";
    on(); window.addEventListener("scroll", on, { passive: true });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();
    renderIndex();
    renderKey();
    renderTicker();
    syncUI();
    observe($$(".reveal"));
    counters();
    initChain();
    initHead();
  });
})();
