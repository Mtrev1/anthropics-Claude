# Axiom Peptides — research peptides storefront

A premium, single-page e-commerce site for a research-grade peptides supplier.
Dark, high-end aesthetic with elegant, performance-conscious motion. **Demo
build with placeholder content** — for laboratory and research use only.

## Highlights

- **Animated molecular hero** — a live particle-network canvas that scales its
  node count to viewport size, caps DPR, and pauses when off-screen.
- **Working cart** — add/remove, quantity steppers, live subtotal, slide-in
  drawer, and `localStorage` persistence. Demo checkout (no payment).
- **Filterable catalog** — nine research peptides with purity badges, sizes,
  RUO tags, and per-batch COA links; filter chips animate the grid.
- **Quality section** — animated HPLC purity chromatogram (SVG stroke draw).
- **Motion done right** — scroll reveals, count-up stats, and a marquee, all
  GPU-friendly (transform/opacity) and fully disabled under
  `prefers-reduced-motion`.
- **Responsive** — fluid from 320px up; mobile hamburger nav; no horizontal
  scroll.
- **Accessible** — skip link, focus-visible rings, ARIA on the cart dialog and
  nav, keyboard-dismissable drawer.
- **Compliance-forward** — a persistent "research use only" banner plus a full
  legal disclaimer in the footer, appropriate for this business type.

## Structure

```
index.html             # markup + all sections
assets/css/styles.css  # design system (tokens, dark theme, responsive)
assets/js/main.js      # catalog, cart, filters, canvas, reveals — vanilla JS
```

## Run

No build step. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Customizing

- **Products** — edit the `PRODUCTS` array in `assets/js/main.js`.
- **Brand & colors** — the palette lives in the `:root` block of
  `assets/css/styles.css` (`--teal`, `--blue`, `--grad`, …).
- **Copy** — all text is inline in `index.html`.

> Fonts load from Google Fonts with a full system-font fallback stack, so the
> site remains fully styled even if the CDN is unavailable.
