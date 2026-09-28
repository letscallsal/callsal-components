# CALL SAL Components

Framer Marketplace-style site for **live interactive UI component previews**.

**Production:** https://components.callsal.app

## What this is

Agents (and humans) search component libraries and open a **full-bleed live iframe preview** — not thumb-card galleries.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Search-first marketplace |
| `/c/[libraryId]__[componentSlug]` | Full live iframe preview |
| `/api/search?q=...` | JSON search API for agents |

Example: https://components.callsal.app/c/magic-ui__marquee

## Data

Catalog SoT is copied into `public/catalog/` (`index.json` + `libraries/*.json`). Only components with a real `demo.iframeSrc` are shown.

## Dev

```bash
npm install
npm run dev
```

## Footer

© 2026 CALLSAL.
