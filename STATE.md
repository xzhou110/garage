# STATE

- **Product:** Garage — a local used-car shortlist & compare dashboard (personal, single-user). Buying deadline: end of June 2026.
- **Phase:** ✅ Built, verified, and **deployed to GitHub Pages** — live at https://xzhou110.github.io/garage/ (public repo `xzhou110/garage`, auto-deploy from `main` via Actions). Also runs locally (`cd app && npm run dev` → http://localhost:5178). 14 cars (c1–c14). Sheet URL verified absent from the public bundle.
- **Done:**
  - Vite/React/TS migration of the prototype complete. Pure engine ported verbatim + **169 unit tests pass**.
  - Full UI (grid, compare, detail, filters/sort, add/edit form, export, settings, theme) built and wired.
  - `npm run build` GREEN (tsc 0 errors). Live-verified: console 0 errors; both seeds render; compare best/worst
    correct; export = titles row + 1 row/car (41 cols); light/dark toggle persists; localStorage persistence
    round-trip (edit → reload → persists); no horizontal overflow at 360px; detail modal sections + 10-feature checklist.
  - Found & fixed: Card `{0 && jsx}` stray "0"; RatingStars CSS variant; enlarged inline-star hit target.
  - **Post-deploy iterations (2026-06-23/24):** grew the shortlist to **13 cars (c1–c13)** — added c7 (CarMax Santa Rosa 2022 SE), c8 (CarMax Colma 2023 XLE), c9 (CarMax Murrieta 2022 XLE Premium), c10 (Carvana 2023 XLE Premium), c11 (Maita Mazda 2025 XLE — corrected to ex-Avis **Rental/Fleet** after the CARFAX), c12 (CarMax Fremont 2024 SE, 19 service records), c13 (Capitol/DGDG 2023 **Limited** — top trim, 9/9 features, 30k mi, 26 service records, $40.5k, 2 open recalls). UX: default sort → **Year: Newest first**; **removed the "In play" stat**; **owner-type badge on every card** (Personal/Lease/Rental-Fleet/…); mileage moved onto the **title row** (tighter trim→price); **visible car-id badge** on each card + search matches the id. Flags: **1 reported accident now = red (risk)**, not amber (ADR-008). Tests 155→**161** (added Owner-type export coverage). All committed, pushed, and live on Pages.
  - **Added c14 (2026-06-24): 2023 RAV4 Hybrid XSE** — Capitol Toyota / DGDG (San Jose, ~25 mi), $36,990, 49,033 mi, the FIRST XSE on the board (sporty trim between XLE Premium and Limited; two-tone Silver Sky / black roof). 1-owner **personal lease** return, clean title, 0 accidents, ~16.7k mi/yr (amber flag). Ticks the priority comforts — moonroof + heated seats + heated wheel + power liftgate + power seat — but **8/10** (no JBL: 6-speaker system; no panoramic roof). $260 below CARFAX value; ~12-week stale listing (info flag = leverage). Caveat: only 2 service records with a ~46k-mi gap to the first (pre-sale recon incl. MAF-sensor swap). Expert 4/5. Tests stay 169 green; typecheck + build green; live-verified in preview (14 cards, image loads, no console errors, no overflow).
  - **Feature added (2026-06-24): panoramic roof** — now a 10th tracked feature, placed right after sunroof/moonroof.
    Encoded the real-world hierarchy as a one-way engine invariant (`FEATURE_IMPLIES` → `featState`): a panoramic
    roof implies sunroof/moonroof (auto-credited everywhere — pills, detail, compare, export, *and* the must-have
    filter, which was switched off raw `feat[k]` onto `featState` for consistency), but a plain sunroof never implies
    panoramic. Data: **c13** = panoramic ✓ (now a full 10/10); c1–c12 = ✕ (panoramic glass roof is RAV4 Limited-only,
    and c1, the only other Limited, lists a regular power moonroof). Tests 161→**169**. Build green; verified live.
- **Open items (non-blocking):**
  - Re-run the independent `reviewer` subagent when the API recovers (it 529'd twice; PM did the review — see review-findings.md).
  - Offer: create/refresh a **real Google Sheet** in the user's Drive via the connected Drive MCP (needs user OK — outward-facing).
  - Inline "You" star on cards: handler verified working via direct interaction; automated pointer-clicks in the
    preview harness mis-target the small star inside the hover-lift card (test-tool artifact, not a user bug). Hardened the target.
- **Blocked:** none.
- **Who's running:** orchestrator (PM). Crew used: qa-tester (Sonnet 4.6, engine tests), frontend-engineer (Opus 4.8, components — cut short by a 529; PM completed the lane).
