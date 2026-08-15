# IronClad Compounds

The canonical marketing site for **IronClad Compounds** — a research-compounds
storefront with an industrial identity derived from the brand's crest logo:
brushed steel + a single bronze accent, a shield-and-gear emblem, riveted metal
plates, chrome-gradient headings and chamfered buttons. **Demo build with
placeholder content — for laboratory and research use only.**

Vanilla HTML/CSS/JS. No build step, no runtime dependencies.

## Highlights

- **Logo-derived design system** — palette (steel + bronze), type (Oswald /
  Barlow / Chakra Petch), and components all trace back to the crest.
- **Recreated crest emblem + ambient gear**, drawn in SVG.
- **21+ age gate** with Yes/No, an access-restricted screen, focus trap and
  `localStorage` memory.
- **Catalog** of realistic product vials (glass body, aluminum crimp, bronze
  flip-off cap, lyophilized cake) with filters and add-to-selection.
- **In-page product editor** ("Edit products") — change every field, add/remove
  products, export JSON, reset to defaults; saves to `localStorage`.
- **Selection dock + slide-in panel**, credential marquee, "no weak links"
  pillars, the forge process, a stats band, FAQ and a compliance footer.
- Committed single dark theme; motion respects `prefers-reduced-motion`;
  responsive down to a single column.

## Structure

```
index.html             # the site
assets/css/styles.css  # forged design system
assets/js/main.js      # emblem/vial generators, catalog, editor, selection
axiom/                 # archived earlier concept (Axiom Peptides, dark premium)
```

## Run

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Customizing

- **Products** — edit in-browser via **Edit products**, or change the `DEFAULTS`
  array in `assets/js/main.js`.
- **Brand colors** — the `--bronze` / steel tokens in the `:root` block of
  `assets/css/styles.css`.
- **Copy** — inline in `index.html`.

> The product editor is client-side (saves to the visitor's browser). Persisting
> edits for all visitors would require a backend.
