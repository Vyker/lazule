# LAZULE — Maison de Haute Joaillerie

Static marketing site for **LAZULE**, a Mesopotamian-inspired fine jewellery maison (design built in Google AI Studio, re-homed into a clean, editable HTML/CSS/JS project).

Live: <https://vyker.github.io/lazule/> (GitHub Pages)

## Project structure

```
index.html              Home page
new-in/index.html       "The First Inscriptions" — new pieces + unveiling ritual
collections/index.html  "The Four Chapters" — themed collections
shop/index.html         "All Heirlooms" — full product archive
search/index.html       "Find a Piece" — live archive search (client-side filter)
about/index.html        "The Maison" — story, atelier, press
heritage/index.html     "Our Inheritance" — timeline and craftsmanship
404.html                Custom not-found page
assets/css/tailwind.css   Compiled stylesheet (built, do not hand-edit)
assets/js/main.js     Nav drawer, quick-add, newsletter placeholder, year stamp
assets/images/        Self-hosted imagery (campaign + lookbook sources)
assets/images/products/  Clean single-product tiles extracted for the cards
favicon.svg           Brand favicon (lapis navy + serif L)
tailwind.config.js    Design tokens (palette, type scale, spacing) — the "design system"
input.css             Tailwind entry (base layer + mobile helpers)
package.json          npm scripts for the Tailwind build
```

## Editing content

- **Text, order, sections:** edit the page's `index.html` directly — each section is fenced with a big numbered comment banner (`1. HERO`, `2. NEW IN`, …).
- **Palette / fonts / spacing:** edit `tailwind.config.js`, then rebuild (below). Tokens follow the AI Studio `DESIGN.md` naming (Bodoni Moda display, DM Sans body, `#002452` primary navy, `#795902` antique gold).
- **Images:** drop files into `assets/images/` (clean product tiles in `assets/images/products/`) and update the `src` in the page's `index.html`.
- **Placeholder links** (product "Discover ✦", footer concierge/legal links, bag/wishlist icons, category filter buttons) currently point to `#` — replace when those pages/services exist.
- **Email capture** is front-end only: it validates and shows a thank-you, but does not store anything. Wire `form`/`newsletter-form` in `index.html` to a real provider later.

## Rebuilding the CSS (only after changing classes or tokens)

```bash
npm install
npm run build      # one-shot, minified -> assets/css/tailwind.css
npm run watch  # ...actually: npm run watch (live recompile while editing)
```

No build is needed for text/image edits.

## Deploying

Hosted on GitHub Pages (branch `main`, repo root). Deploy flow used here:

1. Edit, commit, tag: `git tag deploy-YYYYMMDD-HHMM`
2. `git push origin main`
3. Pages auto-republishes (~1 min)

Rollback: `git checkout deploy-<tag> -- . && git commit -am "revert to <tag>" && git push`.

## Before going live — verify

- [ ] **Press block**: the Vogue Arabia / Harper's Bazaar / GQ quotes are design placeholders — confirm each is real, licensed, or swap for genuine placements before public launch.
- [ ] **Contact details**: d3 address, `+971 4 821 0090` — confirm the live suite/phone.
- [ ] **Prices/AED** and stock counts (bag badge shows "2" as a design artifact).
- [ ] **Legal pages** (Privacy, Terms, Shipping, FAQ) — links are placeholders.
- [ ] **Product photos**: a few "different" products currently share one source image (AI Studio reuse) — replace with real product photography when available.
- [ ] Add real social/domain: when a custom domain (e.g. lazule.ae) is configured on Pages, update `canonical`, `og:*` and the JSON-LD `@id` URLs in `index.html`'s `<head>`.

## Provenance of assets

All imagery was generated inside Google AI Studio (Google Stitch) for this concept and downloaded from its `aida-public` CDN at original resolution before Google's temporary URLs expire.
