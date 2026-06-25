import type { Car, Settings } from '../types';
import type { ByCategory } from './tco';
import { estimateTco } from './tco';

/** Doc/transfer fees combined (prototype:582). */
export function totalFees(c: Car): number {
  return (c.transferFee || 0) + (c.feesEstimate || 0);
}

/** Out-the-door = price + fees, before tax/registration (prototype:583). null if no price. */
export function otd(c: Car): number | null {
  return c.price != null ? c.price + totalFees(c) : null;
}

/** Average miles per year; min 1-year guard so a current-year car can't divide by zero (prototype:584). */
export function milesPerYr(c: Car, currentYear: number = new Date().getFullYear()): number | null {
  if (!c.mileage || !c.year) return null;
  const age = Math.max(1, currentYear - c.year);
  return Math.round(c.mileage / age);
}

/**
 * Total cost of ownership over the user's horizon, ESTIMATED from the vendored TCO engine
 * (lib/tco) — depreciation + fuel + insurance + maintenance + repairs + taxes, cash basis.
 * Responds live to Settings.years / Settings.miles. Rounded to whole dollars. null if no price.
 */
export function estimatedTco(c: Car, s: Settings): number | null {
  const r = estimateTco(c, s);
  return r ? Math.round(r.total) : null;
}

/** Per-category breakdown of the estimated TCO (for the detail view). null if no price. */
export function tcoBreakdown(c: Car, s: Settings): ByCategory | null {
  const r = estimateTco(c, s);
  return r ? r.byCategory : null;
}

/**
 * The TCO actually shown/ranked: a manual `tco5yr` override (e.g. from an Edmunds lookup)
 * if the user entered one, otherwise the live engine estimate. This is the single source the
 * sort, compare table and detail view all read, so ranking and display never diverge.
 */
export function effectiveTco(c: Car, s: Settings): number | null {
  if (c.tco5yr) return c.tco5yr; // manual override wins
  return estimatedTco(c, s);
}

/** true when the shown TCO is the engine estimate (no manual override) — drives the "Est." label. */
export function isTcoEstimated(c: Car): boolean {
  return !c.tco5yr;
}

/** TCO spread over the ownership horizon (prototype:902). Uses the effective (override-or-estimate) TCO. */
export function tcoPerYear(c: Car, s: Settings): number | null {
  const tco = effectiveTco(c, s);
  return tco && s.years ? Math.round(tco / s.years) : null;
}

/** TCO per mile over the horizon (prototype:903). Uses the effective (override-or-estimate) TCO. */
export function tcoPerMile(c: Car, s: Settings): number | null {
  const tco = effectiveTco(c, s);
  const denom = s.miles * s.years;
  return tco && denom ? +(tco / denom).toFixed(2) : null;
}
