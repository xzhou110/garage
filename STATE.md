# STATE

- **Product:** Garage — a local used-car shortlist & compare dashboard (personal, single-user). Buying deadline: end of June 2026.
- **Phase:** ✅ Built, verified, and **deployed to GitHub Pages** — live at https://xzhou110.github.io/garage/ (public repo `xzhou110/garage`, auto-deploy from `main` via Actions). Also runs locally (`cd app && npm run dev` → http://localhost:5178). 13 cars (c1–c13). Sheet URL verified absent from the public bundle.
- **Done:**
  - Vite/React/TS migration of the prototype complete. Pure engine ported verbatim + **161 unit tests pass**.
  - Full UI (grid, compare, detail, filters/sort, add/edit form, export, settings, theme) built and wired.
  - `npm run build` GREEN (tsc 0 errors). Live-verified: console 0 errors; both seeds render; compare best/worst
    correct; export = titles row + 1 row/car (41 cols); light/dark toggle persists; localStorage persistence
    round-trip (edit → reload → persists); no horizontal overflow at 360px; detail modal sections + 9-feature checklist.
  - Found & fixed: Card `{0 && jsx}` stray "0"; RatingStars CSS variant; enlarged inline-star hit target.
  - **Post-deploy iterations (2026-06-23/24):** grew the shortlist to **13 cars (c1–c13)** — added c7 (CarMax Santa Rosa 2022 SE), c8 (CarMax Colma 2023 XLE), c9 (CarMax Murrieta 2022 XLE Premium), c10 (Carvana 2023 XLE Premium), c11 (Maita Mazda 2025 XLE — corrected to ex-Avis **Rental/Fleet** after the CARFAX), c12 (CarMax Fremont 2024 SE, 19 service records), c13 (Capitol/DGDG 2023 **Limited** — top trim, 9/9 features, 30k mi, 26 service records, $40.5k, 2 open recalls). UX: default sort → **Year: Newest first**; **removed the "In play" stat**; **owner-type badge on every card** (Personal/Lease/Rental-Fleet/…); mileage moved onto the **title row** (tighter trim→price); **visible car-id badge** on each card + search matches the id. Flags: **1 reported accident now = red (risk)**, not amber (ADR-008). Tests 155→**161** (added Owner-type export coverage). All committed, pushed, and live on Pages.
- **Open items (non-blocking):**
  - Re-run the independent `reviewer` subagent when the API recovers (it 529'd twice; PM did the review — see review-findings.md).
  - Offer: create/refresh a **real Google Sheet** in the user's Drive via the connected Drive MCP (needs user OK — outward-facing).
  - Inline "You" star on cards: handler verified working via direct interaction; automated pointer-clicks in the
    preview harness mis-target the small star inside the hover-lift card (test-tool artifact, not a user bug). Hardened the target.
- **Blocked:** none.
- **Who's running:** orchestrator (PM). Crew used: qa-tester (Sonnet 4.6, engine tests), frontend-engineer (Opus 4.8, components — cut short by a 529; PM completed the lane).
