import type { SheetCol } from '../types';
import { FEATURES } from './features';
import { otd, milesPerYr } from '../lib/derive';
import { featState } from '../lib/format';

/**
 * Export/spreadsheet column order — ported VERBATIM from the prototype (garage.html:1224).
 * [title, accessor]. First row of any export is these titles; one row per car follows.
 * Includes all 9 features as Yes/No/? plus derived out-the-door and miles/yr.
 */
export const SHEET_COLS: SheetCol[] = [
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
  ['5yr TCO', (c) => c.tco5yr ?? ''],
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
