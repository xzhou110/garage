import type { Car, Flag, SignalLevel } from '../types';
import { milesPerYr } from './derive';
import { money } from './format';

const BRANDED = ['Rebuilt', 'Salvage', 'Flood', 'Lemon'];

/**
 * Risk / value flag engine — ported VERBATIM from the prototype (garage.html:638).
 * PURE: no DOM. `currentYear` is injectable so the milesPerYr rule is deterministic in tests.
 * Levels: risk (red) · warn (amber) · info (blue) · good (green).
 */
export function getFlags(c: Car, currentYear: number = new Date().getFullYear()): Flag[] {
  const f: Flag[] = [];

  if (BRANDED.includes(c.titleStatus))
    f.push({ lvl: 'risk', t: `${c.titleStatus} title — prior total loss. Warranty void, hard to insure/finance, resale hit. Default avoid.` });
  if (c.titleStatus === 'Unknown' || !c.titleStatus)
    f.push({ lvl: 'warn', t: 'Title status unknown — confirm it is clean before anything else.' });

  if (c.accidents != null && c.accidents >= 2)
    f.push({ lvl: 'risk', t: `${c.accidents} accidents reported — check structural/frame and airbag history.` });
  else if (c.accidents === 1)
    f.push({ lvl: 'warn', t: '1 accident reported — get severity and repair quality before a PPI.' });
  else if (c.accidents == null)
    f.push({ lvl: 'warn', t: 'Accident history unknown — pull Carfax/AutoCheck.' });

  if (!c.vin)
    f.push({ lvl: 'warn', t: "No VIN on file — can't run history or open-recall check." });

  if (c.mileage >= 90000)
    f.push({ lvl: 'warn', t: 'High mileage — budget for wear items (tires, brakes, fluids).' });

  if (c.mileage && c.year) {
    const perYr = milesPerYr(c, currentYear);
    if (perYr != null && perYr >= 15000 && c.mileage < 90000)
      f.push({ lvl: 'info', t: `~${perYr.toLocaleString()} mi/yr — above the ~12k average; reflect the extra wear and shorter remaining warranty in your price.` });
  }

  if (c.ownerCount != null && c.ownerCount >= 3)
    f.push({ lvl: 'warn', t: `${c.ownerCount} prior owners — more variables in how it was treated.` });

  if (c.serviceRecords === false)
    f.push({ lvl: 'warn', t: 'No service records — maintenance history unverified.' });

  if (c.marketAvg && c.price && c.price > c.marketAvg * 1.04)
    f.push({ lvl: 'warn', t: `Priced ~${money(c.price - c.marketAvg)} over market avg — room to negotiate or walk.` });
  if (c.marketAvg && c.price && c.price < c.marketAvg * 0.85 && !BRANDED.includes(c.titleStatus))
    f.push({ lvl: 'info', t: 'Well below market — verify why (condition, title, undisclosed issue).' });

  const warrantyNone = c.warranty && /none|void|expired/i.test(c.warranty);
  if ((warrantyNone || !c.warranty) && c.sellerType !== 'CPO')
    f.push({ lvl: 'warn', t: 'Likely out of factory warranty — price in out-of-pocket repairs.' });

  if (c.daysOnMarket != null && c.daysOnMarket >= 60 && !BRANDED.includes(c.titleStatus))
    f.push({ lvl: 'info', t: `On market ${c.daysOnMarket} days — stale listing = negotiation leverage.` });

  if (c.sellerType === 'Private')
    f.push({ lvl: 'info', t: 'Private party — no dealer warranty; handle title transfer & lien check yourself.' });

  // positive signal
  if (c.titleStatus === 'Clean' && c.accidents === 0 && c.sellerType === 'CPO' && c.serviceRecords)
    f.push({ lvl: 'good', t: 'Clean title, no accidents, CPO with records — low-risk profile.' });

  return f;
}

/**
 * Overall card signal (prototype:674):
 * risk if any risk → warn if (≥2 warn OR any warn) → good if any good → else ''.
 */
export function signalLevel(c: Car, currentYear: number = new Date().getFullYear()): SignalLevel {
  const f = getFlags(c, currentYear);
  if (f.some((x) => x.lvl === 'risk')) return 'risk';
  if (f.filter((x) => x.lvl === 'warn').length >= 2) return 'warn';
  if (f.some((x) => x.lvl === 'warn')) return 'warn';
  if (f.some((x) => x.lvl === 'good')) return 'good';
  return '';
}
