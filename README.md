# Garage — used-car shortlist & compare

A single-user dashboard for shopping used cars: capture each candidate from a screenshot, see auto
risk/value flags, compare side-by-side on **out-the-door / total cost of ownership**, and export to
Google Sheets.

**Live:** https://xzhou110.github.io/garage/ — deployed from `main` via GitHub Actions (`.github/workflows/deploy.yml`).
The Google Sheet sync URL is **never** in the code/bundle (it lives only in your browser's localStorage), so
it is not exposed by the public site. Note: localStorage is per-domain, so set your Sheet URL once on the live
site too (Assumptions), separate from localhost. Runs locally as well (below).

## Run it

```bash
cd app
npm install        # first time only (already done)
npm run dev        # → http://localhost:5178
```

Other commands (from `app/`):
- `npm run build` — type-check + production bundle into `app/dist/`
- `npm run preview` — serve the built bundle
- `npm test` — run the engine unit tests (161 tests)

> Data persists in your browser's localStorage (in-app edits: ratings, status, new cars). The committed
> seed lives in `app/src/data/cars.ts` and is the source of truth I edit when you send screenshots.

## How you'll use it

1. **Add a car** — paste me a listing screenshot (and a Carfax/AutoCheck shot + the URL if you have them).
   I extract year/trim/price/mileage/title/accidents/features/etc., map vendor wording onto the 9 tracked
   features (marking anything *inferred from a package* as "confirm"), crop the photo, and append the car to
   `src/data/cars.ts`. You can also click **+ Add car** to enter one by hand, and **Edit** any card.
2. **Triage** — each card shows price + transfer + ≈ out-the-door, the 9-feature pill row (✓ / ✕ / **? = unknown**),
   and auto risk/value flags. A colored top border flags overall risk (red) / caution (amber) / good (green). A
   small car-id badge (e.g. `c2`) on each photo maps the card to the data file / chat references — and the search
   box matches the id, so typing `c4` jumps straight to that car.
3. **Compare** — tick ≥2 cars → the Compare tab shows a side-by-side table that auto-highlights the **best
   (green) / worst (red)** value in each row (cheapest price, lowest out-the-door, most features, etc.).
4. **Filter / sort** — search, seller/title/accident chips, a filter panel (max price/mileage, min ratings,
   "must-have" features), and sorts (out-the-door, mileage, TCO, ratings, …).
5. **Set & change your rating** — click the **You ★** stars on a card (or in the detail view) to rate; it saves
   instantly, persists across reloads, and you can change it any time. **Expert ★** is my rating.
6. **Mark as sold** — when a car is gone (sold to someone else / off the market), open it and click **Mark as
   sold**; it drops out of the list. Toggle the **Show sold** chip to bring sold cars back.
7. **Export to Google Sheets** — the **Export** button:
   - **Sync to Google Sheet** — pushes every car straight into your sheet (title row + one row per car, updated
     in place), no copy-paste. Needs the one-time setup below.
   - **Copy for Sheets** / **Download CSV** — zero-setup fallbacks (paste into A1 / open the CSV).
   - **JSON for Claude** — paste back to me in chat so I can save your in-app edits into the data file.

## Sync to Google Sheet — one-time setup (~5 min, free, no Google Cloud)
A browser app can't write to your Drive without auth, so set this up once:
1. Create a blank sheet at **https://sheets.new** — this is the sheet that gets updated.
2. In it: **Extensions → Apps Script**. Delete the placeholder and paste:
   ```js
   function doPost(e) {
     var rows = JSON.parse(e.postData.contents).rows || [];
     var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     sh.clear(); // reset content + old formatting each sync
     if (rows.length) {
       var nCols = rows[0].length;
       sh.getRange(1, 1, rows.length, nCols).setValues(rows);
       sh.getRange(1, 1, 1, nCols).setFontWeight('bold'); // bold title row
       sh.setFrozenRows(1);                               // keep titles visible
       sh.autoResizeColumns(1, nCols);                    // width fits the longest text
     }
     return ContentService.createTextOutput(JSON.stringify({ ok: true, rows: rows.length }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. **Deploy → New deployment → Web app**. Execute as **Me**; **Who has access: Anyone**. Click **Authorize
   access** and allow the permissions. *(Your URL is secret — only you have it — so "Anyone" just means the
   request doesn't need a Google login; the script still runs as **you** and writes only **your** sheet. With
   "Only myself" a browser POST is blocked and nothing is written.)*
4. Copy the **Web app URL** (ends in `/exec`, not `/dev`).
5. In Garage: **Assumptions** → paste it into **Google Sheet sync URL** → **Apply**.
6. Open the **Export** dialog → click **Sync to Google Sheet**, then open your sheet — title row + one row per
   car; re-syncing overwrites in place. (Google's CORS hides the response, so the button just says "sent" —
   glance at the sheet to confirm.)

**Troubleshooting — "Sync ran but the sheet is empty":** 99% of the time the deployment access is still
"Only myself." Fix: **Deploy → Manage deployments → ✏️ (edit) → Who has access → Anyone → Deploy**. The `/exec`
URL stays the same, so you don't need to re-paste it. Also confirm: you used the `/exec` URL (not `/dev`), you
clicked **Apply** after pasting it in Assumptions, and you clicked **Sync to Google Sheet** *inside* the Export
dialog (the header **Export** button only opens the dialog).

**Changed the script code?** (e.g. to add the bold-title/auto-fit formatting above.) Push it live the same way:
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy** — the `/exec` URL stays the same.

## The 10 tracked features
Sunroof/moonroof · **panoramic roof** · heated seats · heated steering wheel · power seats · JBL/premium audio ·
keyless entry + push start · Bluetooth · power liftgate · immobilizer. Tri-state: ✓ has · ✕ confirmed absent ·
**? unknown** (never silently treated as "no").

> **Panoramic roof ⟹ sunroof (one-way).** A panoramic roof *is* a (bigger, fixed-glass) sunroof, so a car
> marked as having a panoramic roof automatically counts as having the sunroof/moonroof too. The reverse does
> **not** hold — a plain sunroof gives no panoramic credit. The implication is derived in the engine
> (`featState`), so it holds everywhere: pills, detail, compare, export, and the "must-have" filter.

## Project layout
```
app/src/
  types.ts            data model (Car, Feat, Settings, Flag)
  data/               cars.ts (seed = source of truth) · features.ts · sheetCols.ts
  lib/                flags.ts · derive.ts · format.ts · exportSheet.ts  (PURE, unit-tested)
  state/useGarage.ts  cars + settings + filters; localStorage autosave + URL-hash share
  components/         Card · Grid · CompareTable · DetailModal · Filters · CarForm · Export/Settings modals
docs/                 PRD.md · spec-source.md · api-contract.md
```
Design rule: all domain logic is pure functions in `lib/*` (no DOM) and is covered by Vitest; the UI only
formats and renders. See `docs/` for the full spec and `review-findings.md` for the pre-ship review.
