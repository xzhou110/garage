import type { SheetCol, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { FEATURES } from './features';
import { otd, milesPerYr, effectiveTco } from '../lib/derive';
import { featState } from '../lib/format';

/**
 * Export/spreadsheet column order — ported from the prototype (garage.html:1224), now a builder
 * so the TCO column can reflect the user's ownership horizon. [title, accessor]. First row of any
 * export is these titles; one row per car follows. Includes all 10 features as Yes/No/? plus
 * derived out-the-door, miles/yr and the effective (override-or-estimate) TCO.
 */
export function buildSheetCols(settings: Settings = DEFAULT_SETTINGS): SheetCol[] {
  return [
  ['Status', (c) => c.status || ''],
  ['Year', (c) => c.year ?? ''],
  ['Make', (c) => c.make || ''],
  ['Model', (c) => c.model || ''],
  ['Trim', (c) => c.trim || ''],
  ['Price', (c) => c.price ?? ''],
  ['Transfer fee', (c) => c.transferFee ?? ''],
  ['Doc/other fees', (c) => c.feesEstimate ?? ''],
  ['Out-the-door', (c) => otd(c) ?? ''],
  ['Mileage', (c) => c.mileage ?? ''],
  ['Miles/yr', (c) => milesPerYr(c) ?? ''],
  ['Fuel', (c) => c.fuelType || ''],
  ['Drivetrain', (c) => c.drivetrain || ''],
  ['Engine', (c) => c.engine || ''],
  ['Title', (c) => c.titleStatus || ''],
  ['Accidents', (c) => c.accidents ?? ''],
  ['Owners', (c) => c.ownerCount ?? ''],
  ['Owner type', (c) => c.ownerType || ''],
  ['Service recs', (c) => c.serviceCount ?? (c.serviceRecords === true ? 'Yes' : c.serviceRecords === false ? 'No' : '')],
  ['Warranty', (c) => c.warranty || ''],
  ['Days listed', (c) => c.daysOnMarket ?? ''],
  ['Market avg', (c) => c.marketAvg ?? ''],
  [`Est. ${settings.years}yr TCO`, (c) => effectiveTco(c, settings) ?? ''],
  ['Expert rating', (c) => c.expertRating ?? ''],
  ['Your rating', (c) => c.rating ?? ''],
  ...FEATURES.map(([k, , long]): SheetCol => [
    long,
    (c) => {
      const s = featState(c, k);
      return s === 'yes' ? 'Yes' : s === 'no' ? 'No' : '?';
    },
  ]),
  ['Other features', (c) => (c.features || []).join('; ')],
  ['Dealer', (c) => c.dealership || ''],
  ['Location', (c) => c.location || ''],
  ['VIN', (c) => c.vin || ''],
  ['Ext color', (c) => c.extColor || ''],
  ['Int color', (c) => c.intColor || ''],
  ['Listing URL', (c) => c.sourceUrl || ''],
  ['Notes', (c) => c.notes || ''],
  ];
}

/** Default columns (5yr/12k assumptions). In-app exports rebuild with the user's settings. */
export const SHEET_COLS: SheetCol[] = buildSheetCols();
