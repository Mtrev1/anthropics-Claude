/* =====================================================================
   AXIOM PEPTIDES — interactions
   Vanilla JS, no dependencies. Performance-minded:
   - canvas particle count scales with viewport & DPR is capped
   - motion honors prefers-reduced-motion
   - cart persists to localStorage
   ===================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------------------------------------------------------------
     Product data (placeholder — research peptides, RUO)
  --------------------------------------------------------------- */
  const PRODUCTS = [
    { id: "bpc157", name: "BPC-157", cat: "repair", size: "5 mg", purity: "99.6%", price: 54.00, tag: "Best seller", icon: "🧬",
      desc: "Body-protection compound studied for tissue-repair and angiogenesis research models." },
    { id: "tb500", name: "TB-500", cat: "repair", size: "5 mg", purity: "99.3%", price: 62.00, tag: "In stock", icon: "🧫",
      desc: "Thymosin β4 fragment used in cell-migration and recovery research." },
    { id: "ghkcu", name: "GHK-Cu", cat: "cosmetic", size: "50 mg", purity: "99.1%", price: 48.00, tag: "In stock", icon: "🔷",
      desc: "Copper tripeptide investigated in dermal-matrix and regeneration studies." },
    { id: "ipamorelin", name: "Ipamorelin", cat: "metabolic", size: "5 mg", purity: "99.5%", price: 58.00, tag: "In stock", icon: "🧪",
      desc: "Selective secretagogue peptide used in endocrine signaling research." },
    { id: "cjc1295", name: "CJC-1295 DAC", cat: "metabolic", size: "5 mg", purity: "99.2%", price: 69.00, tag: "In stock", icon: "⚗️",
      desc: "Long-acting analogue applied in growth-axis and half-life research." },
    { id: "epithalon", name: "Epithalon", cat: "longevity", size: "10 mg", purity: "99.4%", price: 44.00, tag: "New batch", icon: "🧩",
      desc: "Tetrapeptide studied in telomerase and circadian-regulation models." },
    { id: "glutathione", name: "Glutathione", cat: "longevity", size: "600 mg", purity: "99.0%", price: 39.00, tag: "In stock", icon: "🌀",
      desc: "Tripeptide antioxidant used broadly in oxidative-stress research." },
    { id: "nadplus", name: "NAD+", cat: "longevity", size: "500 mg", purity: "99.2%", price: 89.00, tag: "Premium", icon: "💠",
      desc: "Coenzyme applied in cellular-metabolism and mitochondrial studies." },
    { id: "melanotan2", name: "Melanotan II", cat: "cosmetic", size: "10 mg", purity: "99.1%", price: 42.00, tag: "In stock", icon: "🔶",
      desc: "Melanocortin analogue used in pigmentation-pathway research." },
  ];

  const CAT_LABEL = { repair: "Tissue & recovery", metabolic: "Metabolic", longevity: "Longevity", cosmetic: "Cosmetic" };

  /* ---------------------------------------------------------------
     Render catalog
  --------------------------------------------------------------- */
  const grid = $("#productGrid");
  function renderProducts() {
    grid.innerHTML = PRODUCTS.map((p) => `
      <article class="card reveal" data-cat="${p.cat}" data-id="${p.id}">
        <div class="card__vial">
          <span class="card__ribbon">${p.tag}</span>
          <span class="card__purity">${p.purity}</span>
          <div class="card__glass"></div>
        </div>
        <div class="card__body">
          <span class="card__cat">${CAT_LABEL[p.cat]}</span>
          <h3 class="card__name">${p.name}</h3>
          <p class="card__desc">${p.desc}</p>
          <div class="card__meta">
            <span class="card__tag">${p.size}</span>
            <span class="card__tag">RUO</span>
            <span class="card__tag">HPLC ${p.purity}</span>
          </div>
          <div class="card__foot">
            <span class="card__price">${money(p.price)}<small>per vial</small></span>
            <button class="card__add" data-add="${p.id}" aria-label="Add ${p.name} to cart">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add
            </button>
          </div>
          <span class="card__coa">📄 <a href="#quality">View COA · batch #AX-${1000 + Math.floor(Math.random()*8999)}</a></span>
        </div>
      </article>`).join("");
    observeReveals($$(".card", grid));
  }

  /* ---------------------------------------------------------------
     Filters
  --------------------------------------------------------------- */
  function initFilters() {
    const chips = $$(".chip");
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => { c.classList.remove("is-active"); c.setAttribute("aria-selected", "false"); });
      chip.classList.add("is-active"); chip.setAttribute("aria-selected", "true");
      const f = chip.dataset.filter;
      $$(".card", grid).forEach((card) => {
        const show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("is-hiding", !show);
        setTimeout(() => { card.style.display = show ? "" : "none"; }, show ? 0 : 260);
        if (show) requestAnimationFrame(() => card.classList.add("is-visible"));
      });
    }));
  }

  /* ---------------------------------------------------------------
     Cart (localStorage-backed)
  --------------------------------------------------------------- */
  const STORE_KEY = "axiom_cart_v1";
  let cart = loadCart();

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveCart() { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch {} }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart(); updateCartUI();
    const p = PRODUCTS.find((x) => x.id === id);
    showToast(`${p.name} added to cart`);
  }
  function setQty(id, qty) {
    if (qty <= 0) delete cart[id]; else cart[id] = qty;
    saveCart(); updateCartUI();
  }

  const cartCount = $("#cartCount");
  const cartItemsEl = $("#cartItems");
  const cartEmptyEl = $("#cartEmpty");
  const cartFootEl = $("#cartFoot");
  const cartSubtotalEl = $("#cartSubtotal");

  function updateCartUI() {
    const ids = Object.keys(cart);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    cartCount.textContent = count;
    cartCount.setAttribute("data-count", String(count));

    if (ids.length === 0) {
      cartItemsEl.innerHTML = "";
      cartEmptyEl.classList.add("is-shown");
      cartFootEl.hidden = true;
      return;
    }
    cartEmptyEl.classList.remove("is-shown");
    cartFootEl.hidden = false;

    let subtotal = 0;
    cartItemsEl.innerHTML = ids.map((id) => {
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) return "";
      const qty = cart[id];
      subtotal += p.price * qty;
      return `
        <div class="citem" data-id="${id}">
          <div class="citem__thumb">${p.icon}</div>
          <div>
            <div class="citem__name">${p.name}</div>
            <div class="citem__sub">${p.size} · ${p.purity} · RUO</div>
            <div class="citem__qty">
              <button data-dec="${id}" aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button data-inc="${id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="citem__right">
            <span class="citem__price">${money(p.price * qty)}</span>
            <button class="citem__remove" data-remove="${id}">Remove</button>
          </div>
        </div>`;
    }).join("");
    cartSubtotalEl.textContent = money(subtotal);
  }

  // event delegation: add buttons in catalog
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addToCart(btn.dataset.add);
    btn.classList.add("is-added");
    btn.innerHTML = "✓ Added";
    setTimeout(() => { btn.classList.remove("is-added"); btn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> Add'; }, 1200);
  });

  // event delegation: cart item controls
  cartItemsEl.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rem = e.target.closest("[data-remove]");
    if (inc) setQty(inc.dataset.inc, cart[inc.dataset.inc] + 1);
    else if (dec) setQty(dec.dataset.dec, cart[dec.dataset.dec] - 1);
    else if (rem) setQty(rem.dataset.remove, 0);
  });

  /* ---------- drawer open/close ---------- */
  const drawer = $("#cartDrawer");
  const overlay = $("#drawerOverlay");
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => { overlay.classList.add("is-open"); drawer.classList.add("is-open"); });
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("#cartClose").focus();
  }
  function closeCart() {
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => { overlay.hidden = true; }, 400);
    if (lastFocus) lastFocus.focus();
  }
  $("#cartToggle").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  $("#cartKeepShopping").addEventListener("click", () => { closeCart(); document.getElementById("catalog").scrollIntoView(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeCart(); });

  $("#checkoutBtn").addEventListener("click", () => {
    showToast("Demo checkout — no payment taken. Thank you!");
    cart = {}; saveCart(); updateCartUI();
    setTimeout(closeCart, 900);
  });

  /* ---------------------------------------------------------------
     Toast
  --------------------------------------------------------------- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-shown"), 2600);
  }

  /* ---------------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------------- */
  let revealObserver;
  function observeReveals(nodes) {
    if (reduceMotion) { nodes.forEach((n) => n.classList.add("is-visible")); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (entry.target.classList.contains("chroma")) entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    }
    nodes.forEach((n) => revealObserver.observe(n));
  }

  /* ---------------------------------------------------------------
     Count-up stats
  --------------------------------------------------------------- */
  function initCounters() {
    const els = $$("[data-count-to]");
    if (reduceMotion) {
      els.forEach((el) => el.textContent = el.dataset.countTo + (el.dataset.suffix || ""));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.countTo);
        const suffix = el.dataset.suffix || "";
        const decimals = (el.dataset.countTo.split(".")[1] || "").length;
        const dur = 1500; const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(decimals) + suffix;
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------
     Nav: sticky style, mobile menu
  --------------------------------------------------------------- */
  function initNav() {
    const nav = $("#nav");
    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = $("#burger");
    const menu = $("#mobileMenu");
    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
      menu.setAttribute("aria-hidden", String(open));
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => {
      burger.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true");
    }));
  }

  /* ---------------------------------------------------------------
     Newsletter
  --------------------------------------------------------------- */
  function initNewsletter() {
    const form = $("#newsletter");
    const note = $("#nlNote");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("#email").value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) { note.style.color = "#ff6b81"; note.textContent = "Please enter a valid email address."; return; }
      note.style.color = ""; note.textContent = "You're on the list — we'll send new batch releases.";
      form.reset();
    });
  }

  /* ---------------------------------------------------------------
     Molecular canvas (hero) — particle network
  --------------------------------------------------------------- */
  function initMolecule() {
    const canvas = $("#molecule");
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    let w, h, dpr, nodes, raf, running = true;
    const LINK_DIST = 130;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // node count scales with area, capped for low-end devices
      const target = Math.min(Math.round((w * h) / 15000), 80);
      nodes = new Array(target).fill(0).map(() => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.8,
      }));
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const a = (1 - dist / LINK_DIST) * 0.5;
            ctx.strokeStyle = `rgba(120,180,255,${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(78,230,196,.85)"; ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    size();
    frame();

    let resizeT;
    window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(size, 200); });
    // pause when hero off-screen (battery/perf)
    new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting;
      if (running) { cancelAnimationFrame(raf); frame(); }
      else cancelAnimationFrame(raf);
    }, { threshold: 0 }).observe(canvas);
  }

  /* ---------------------------------------------------------------
     Age verification gate (must be 21+)
  --------------------------------------------------------------- */
  const AGE_KEY = "axiom_age_ok_v1";
  function initAgeGate() {
    const gate = $("#ageGate");
    if (!gate) return;

    let verified = false;
    try { verified = localStorage.getItem(AGE_KEY) === "yes"; } catch {}

    if (verified) { gate.hidden = true; return; }

    // lock scroll while the gate is up
    document.body.classList.add("gate-locked");
    const ask = $("#ageGateAsk");
    const deny = $("#ageGateDeny");
    $("#ageYes").focus();

    // keep focus inside the gate
    gate.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusable = $$("button", gate).filter((b) => b.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    $("#ageYes").addEventListener("click", () => {
      try { localStorage.setItem(AGE_KEY, "yes"); } catch {}
      gate.style.transition = "opacity .4s var(--ease)";
      gate.style.opacity = "0";
      document.body.classList.remove("gate-locked");
      setTimeout(() => { gate.hidden = true; }, 400);
    });

    $("#ageNo").addEventListener("click", () => {
      ask.hidden = true;
      deny.hidden = false;
      $("#ageBack").focus();
    });

    $("#ageBack").addEventListener("click", () => {
      deny.hidden = true;
      ask.hidden = false;
      $("#ageYes").focus();
    });
  }

  /* ---------------------------------------------------------------
     Init
  --------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initAgeGate();
    $("#year").textContent = new Date().getFullYear();
    renderProducts();
    initFilters();
    updateCartUI();
    observeReveals($$(".reveal"));
    initCounters();
    initNav();
    initNewsletter();
    initMolecule();
  });
})();
