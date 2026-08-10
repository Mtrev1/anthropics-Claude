# IronClad Peptides — "primary structure" storefront

A second, deliberately **different** peptide site — no shared design language with
the dark Axiom build. The entire visual system is the one thing every peptide
actually is: a **sequence of amino-acid residues**. **Demo build with placeholder
content** — for laboratory and research use only.

## The concept

Light, Swiss-editorial, scientific-journal aesthetic — warm paper + ink, a
serif / grotesk / mono type mix, hairline rules, section marks (`§01`) and
footnotes. Color appears **only** where it means something: each amino-acid
residue is tinted by its functional class.

## What makes it distinct

- **Folding peptide backbone** (hero canvas) — one continuous N→C chain of
  labelled, class-colored residues that slowly folds, not a particle field.
  Scales to viewport, caps DPR, pauses off-screen, static under reduced motion.
- **Catalog as a specification index** — a numbered scientific table (not
  cards). Each row shows the peptide's real primary structure as residue chips
  (MW, purity, price) and expands to a full spec sheet with a functional-class
  breakdown bar and COA link.
- **The residue key** — a periodic-table-style grid of all 20 amino acids,
  colored by class (nonpolar / polar / acidic / basic), with a legend.
- **Sequence ticker** — a marquee built from the catalog's actual sequences.
- **Selection tray** — a docked bottom bar + slide-in panel with quantity
  steppers, live subtotal, `localStorage` persistence, and a demo checkout.
- **Responsive** from 320px (index reflows to a stacked layout), **accessible**
  (skip link, focus rings, ARIA dialog, keyboard-dismissable panel), and fully
  motion-safe.

Real published sequences drive the residue motif — e.g. GHK-Cu `GHK`,
Epithalon `AEDG`, BPC-157 `GEPPPGKPADDAGLV`.

## Structure

```
index.html             # markup + all sections
assets/css/styles.css  # editorial light design system
assets/js/main.js      # amino-acid data, index, residue key, backbone, tray
```

## Run

No build step. Serve the folder and open `ironclad/`:

```bash
python3 -m http.server 8000   # http://localhost:8000/ironclad/
```

## Customizing

- **Products & sequences** — edit the `PRODUCTS` array in `assets/js/main.js`.
- **Residue classes / colors** — the `--r-*` tokens in `:root`, plus the `AA`
  map in the JS.
- **Copy** — inline in `index.html`.
