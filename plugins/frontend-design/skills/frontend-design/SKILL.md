---
name: frontend-design
description: >-
  Craft distinctive, production-quality frontend interfaces instead of generic,
  template-looking output. Use this skill whenever building or restyling any
  web UI — landing pages, marketing sites, dashboards, app screens, components,
  design systems, or prototypes — and whenever the user mentions frontend,
  UI, HTML/CSS, Tailwind, React components, "make it look good," "polish the
  design," visual hierarchy, responsiveness, or accessibility, even if they
  don't say the word "design." Reach for it any time the visual result matters,
  not just the logic.
---

# Frontend Design

## Why this skill exists

Left to autopilot, models produce frontend that is technically correct and
visually forgettable: the same centered card on a gray-50 background, the same
indigo-600 primary button, the same three-column feature grid with lucide
icons. It works, but it looks like every other AI-generated page, and users can
tell. The goal here is different — to produce interfaces that feel deliberately
designed, like a person with taste made specific choices for this specific
product.

Good design is not decoration layered on at the end. It comes from a small
number of decisions made early and applied consistently: what this thing is,
who it's for, and the one impression it should leave. Everything below is in
service of making those decisions and then executing them cleanly.

## Start by committing to a direction

Before writing markup, decide the design's point of view. A page without one
defaults to the generic average of everything, which reads as bland. You don't
need to ask the user twenty questions — infer from context (a fintech
dashboard, a kids' game, a developer tool, a luxury brand all want very
different treatments) and commit.

Pin down these four things, even just in your head:

- **Purpose & tone.** Is this authoritative and calm, playful and loud,
  minimal and editorial, dense and utilitarian? The tone drives every later
  choice. A tax app and a music festival site should not share a personality.
- **One memorable move.** Pick a single distinctive element the design will be
  remembered for — an unexpected color pairing, expressive typography, a
  striking hero, a signature motion, generous negative space. One strong idea
  beats five timid ones. Don't spread the budget thin.
- **Reference, don't default.** Think of a real aesthetic lineage (Swiss
  editorial, brutalist, glassmorphism, warm organic, terminal/mono, soft
  neo-brutalism) and lean into it deliberately rather than landing on the
  unstyled middle.
- **Constraints.** Existing brand colors, a component library already in the
  repo, dark-mode requirements, performance budgets. Match what exists before
  inventing something new — consistency with the surrounding product beats a
  prettier island.

When the direction is genuinely ambiguous and the choice materially changes the
outcome, ask. Otherwise pick the strongest-fitting direction and go; a decisive
opinionated design is easier to react to and refine than a hedged one.

## The craft fundamentals

These are where "looks AI-generated" is won or lost. Most weak output fails not
on grand vision but on the fundamentals below being slightly off everywhere.

### Typography carries most of the impression

Type is the highest-leverage design tool on the web — more than color, more
than imagery.

- **Choose type with intent.** The system-font stack is a fine *default* but a
  forgettable *choice*. Pick typefaces that match the tone: a characterful
  display face for headings paired with a highly readable text face is a
  reliable, high-impact move. Even shipping one well-chosen font instead of the
  default lifts a page noticeably.
- **Build a real type scale.** Use a consistent ratio (≈1.2–1.333) rather than
  ad-hoc sizes. The jump from body to headline should be decisive — timid
  hierarchy (18px body, 20px heading) reads as unstyled. Big things should be
  genuinely big.
- **Tune the details.** Tighten `letter-spacing` on large headings; loosen it
  slightly on small uppercase labels. Set line-height by role — tight
  (1.05–1.2) for display, comfortable (1.5–1.7) for body. Cap measure at
  ~60–75ch for readability. These micro-adjustments separate designed from
  default.

### Color: restraint plus one commitment

- **Work from a system, not swatches.** Define a small palette: one or two
  brand/accent colors, a neutral ramp (background → surface → border → muted
  text → text) with enough steps to build depth, and semantic colors for
  success/warning/danger. Derive states (hover, active, disabled) from the ramp
  rather than picking new colors each time.
- **Neutrals are rarely pure gray.** Give them a subtle temperature — warm
  grays for organic/editorial, cool for tech/clinical. Tinting neutrals toward
  the accent hue is a quiet trick that makes a palette feel cohesive.
- **Commit to one accent and use it sparingly.** Accent color earns attention
  precisely because it's rare — reserve it for primary actions and key
  emphasis. A page where everything is colored has no hierarchy.
- **Guarantee contrast.** Body text must meet WCAG AA (4.5:1). Don't put
  light-gray text on white because it looks "sleek" — it reads as broken to
  many users. Verify, don't eyeball.

### Space and layout create calm

- **Use a spacing scale.** Base everything on a consistent unit (4px or 8px).
  Consistent rhythm is most of what makes a layout feel intentional.
- **Be generous, then deliberate.** Under-spaced, cramped UIs are the most
  common tell of rushed work. Give sections room to breathe; let whitespace do
  the grouping. Then vary density with purpose — a dense data table and an airy
  hero can and should coexist.
- **Establish a grid and align to it.** Elements sharing an edge or baseline
  look intentional; near-misses look broken. Alignment is free and it reads as
  competence.
- **Guide the eye.** Each screen should have one clear focal point and an
  obvious reading order. Scale, weight, color, and position establish it — if
  everything competes, nothing wins.

### Depth, borders, and finish

- **Pick a depth strategy and hold it.** Either flat-with-borders or
  soft-shadow-elevation — mixing heavy borders and heavy shadows at random
  looks messy. If you use shadows, make them soft, layered, and low-opacity;
  harsh single-layer shadows look dated.
- **Corner radius is part of the voice.** Sharp corners read serious/editorial;
  large radii read friendly/consumer. Keep radii consistent across the UI.
- **Sweat the small stuff.** Consistent icon sizing and stroke weight, aligned
  optical centers, hover/focus/active states on every interactive element,
  styled form fields (never leave raw browser defaults on a designed page).
  These details compound into perceived quality.

## Motion and interaction

Motion should clarify, not perform. Purposeful animation makes a UI feel alive
and responsive; gratuitous animation feels amateur and gets in the way.

- Animate to communicate: reveal relationships, confirm actions, smooth state
  changes, direct attention. Not just because you can.
- Keep it quick and natural — most UI transitions land at 150–300ms with an
  ease-out or custom cubic-bezier, not a linear slog. Micro-interactions on
  buttons, links, and cards make a UI feel crafted.
- Respect `prefers-reduced-motion` and provide a calm fallback.
- Every interactive element needs visible feedback for hover, focus (keyboard!),
  active, and disabled. Missing focus states is both an accessibility failure
  and a polish failure.

## Responsive and accessible by default

These are not optional finishing passes — bake them in as you build, because
retrofitting is painful and usually gets skipped.

- **Design fluid, not fixed.** Use relative units, flexbox/grid, and sensible
  breakpoints. Verify the real small-screen experience — tap targets ≥44px,
  no horizontal scroll, readable type. Mobile is usually the majority case.
- **Use semantic HTML.** Real `<button>`, `<nav>`, `<main>`, headings in order,
  `<label>`s tied to inputs. Semantics give you accessibility and behavior for
  free; div soup throws both away.
- **Meet accessibility baselines.** AA contrast, visible focus indicators,
  keyboard operability, `alt` text, ARIA only where semantics fall short.
  Accessible design is simply better design; treat it as table stakes.

## Implementation guidance

- **Match the repo's stack.** Detect what's already in use (Tailwind, CSS
  modules, styled-components, plain CSS, a component library) and follow it.
  Don't introduce a new styling paradigm unless asked — an ad-hoc dependency is
  a cost the user has to maintain.
- **Centralize design tokens.** Put colors, spacing, type scale, radii, and
  shadows in one place (CSS custom properties, a Tailwind config, or a theme
  object) and reference them everywhere. This is what makes a design consistent
  and cheaply themeable, including dark mode.
- **Compose small, reusable pieces.** Build a real button/card/input once and
  reuse; don't hand-restyle every instance. Consistency emerges from shared
  components, not discipline.
- **Handle every state.** Design and build loading, empty, error, and
  populated states — plus long-content and overflow. Empty and error states are
  where rushed UIs fall apart, and they're often the user's first impression.
- **Keep it self-contained and lightweight** when the deliverable is a single
  page or artifact: inline assets, avoid heavy dependencies for small effects,
  and prefer CSS over JS where CSS suffices.

## Before you call it done

Look at the result with fresh eyes and pressure-test it:

- Does it have a clear point of view, or did it drift to the generic default?
- Is there one thing that makes it memorable?
- Is the typographic hierarchy decisive? Is spacing consistent and generous?
- Does contrast pass AA? Do keyboard focus states exist?
- Does it hold up at 375px wide and at 1440px?
- Are hover/focus/active/disabled and loading/empty/error states all handled?
- Is anything misaligned, cramped, or inconsistent with the rest of the UI?

If you can, render it and actually look at it rather than trusting the markup —
design is a visual medium and the eye catches what the code review misses. Fix
the two or three weakest spots; that final pass is usually the difference
between "fine" and "good."
