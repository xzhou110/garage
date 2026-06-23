import type { Car, Settings } from '../types';

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

/** 5-yr TCO spread over the ownership horizon (prototype:902). null if unknown. */
export function tcoPerYear(c: Car, s: Settings): number | null {
  return c.tco5yr && s.years ? Math.round(c.tco5yr / s.years) : null;
}

/** 5-yr TCO per mile over the horizon (prototype:903). null if unknown. */
export function tcoPerMile(c: Car, s: Settings): number | null {
  const denom = s.miles * s.years;
  return c.tco5yr && denom ? +(c.tco5yr / denom).toFixed(2) : null;
}
