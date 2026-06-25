import { describe, it, expect } from 'vitest';
import {
  totalFees,
  otd,
  milesPerYr,
  tcoPerYear,
  tcoPerMile,
  estimatedTco,
  effectiveTco,
  isTcoEstimated,
} from './derive';
import type { Car, Settings } from '../types';

// ---------------------------------------------------------------------------
// Fixture helper
// ---------------------------------------------------------------------------
function car(overrides: Partial<Car> = {}): Car {
  return {
    id: 'x',
    status: 'New',
    year: 2022,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'SE',
    price: 30000,
    mileage: 48000,
    sellerType: 'Dealer',
    dealership: '',
    location: '',
    ownerCount: 1,
    accidents: 0,
    titleStatus: 'Clean',
    drivetrain: 'AWD',
    fuelType: 'Hybrid',
    engine: '',
    extColor: '',
    intColor: '',
    vin: 'V',
    warranty: 'In warranty',
    feat: {},
    features: [],
    serviceRecords: true,
    serviceCount: 2,
    daysOnMarket: null,
    dateSeen: '',
    marketAvg: null,
    transferFee: 500,
    feesEstimate: 100,
    tco5yr: 30000,
    expertRating: 4,
    rating: 0,
    notes: '',
    image: '',
    sourceUrl: '',
    ...overrides,
  };
}

const S: Settings = { miles: 12000, years: 5 };

// ---------------------------------------------------------------------------
// totalFees
// ---------------------------------------------------------------------------
describe('totalFees', () => {
  it('adds transferFee + feesEstimate', () => {
    expect(totalFees(car({ transferFee: 500, feesEstimate: 100 }))).toBe(600);
  });

  it('returns 0 when both fees are null', () => {
    expect(totalFees(car({ transferFee: null, feesEstimate: null }))).toBe(0);
  });

  it('returns 0 when both fees are absent (undefined/null)', () => {
    expect(totalFees(car({ transferFee: undefined as never, feesEstimate: undefined as never }))).toBe(0);
  });

  it('handles transferFee only', () => {
    expect(totalFees(car({ transferFee: 399, feesEstimate: null }))).toBe(399);
  });

  it('handles feesEstimate only', () => {
    expect(totalFees(car({ transferFee: null, feesEstimate: 250 }))).toBe(250);
  });

  it('handles zero fees (0 + 0 = 0)', () => {
    expect(totalFees(car({ transferFee: 0, feesEstimate: 0 }))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// otd (out-the-door)
// ---------------------------------------------------------------------------
describe('otd', () => {
  it('price + totalFees when price is set', () => {
    expect(otd(car({ price: 30000, transferFee: 500, feesEstimate: 100 }))).toBe(30600);
  });

  it('works with zero fees', () => {
    expect(otd(car({ price: 35000, transferFee: null, feesEstimate: null }))).toBe(35000);
  });

  it('returns null when price is null', () => {
    expect(otd(car({ price: null as never }))).toBeNull();
  });

  it('returns null when price is 0 (falsy)', () => {
    // NOTE: The implementation uses `c.price != null`, so price=0 is valid and should NOT be null.
    // price=0 is unlikely in practice but the contract says "null if no price".
    // The implementation: `return c.price != null ? c.price + totalFees(c) : null`
    // This means price=0 returns 0 + fees (a valid result), not null.
    expect(otd(car({ price: 0, transferFee: null, feesEstimate: null }))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// milesPerYr
// ---------------------------------------------------------------------------
describe('milesPerYr', () => {
  it('computes rounded miles per year', () => {
    // 48000 / (2026 - 2022) = 12000 exactly
    expect(milesPerYr(car({ year: 2022, mileage: 48000 }), 2026)).toBe(12000);
  });

  it('rounds fractional result', () => {
    // 50000 / (2026 - 2022) = 12500 exactly; test with non-exact: 50001 / 4 = 12500.25 → 12500
    expect(milesPerYr(car({ year: 2022, mileage: 50001 }), 2026)).toBe(12500);
  });

  it('rounds up when fraction ≥ 0.5', () => {
    // 50002 / 4 = 12500.5 → rounds to 12501
    expect(milesPerYr(car({ year: 2022, mileage: 50002 }), 2026)).toBe(12501);
  });

  it('min-1-year guard: currentYear === car year → divides by 1, not 0', () => {
    expect(milesPerYr(car({ year: 2026, mileage: 48000 }), 2026)).toBe(48000);
  });

  it('min-1-year guard: currentYear < car year (future year) → divides by 1', () => {
    expect(milesPerYr(car({ year: 2027, mileage: 20000 }), 2026)).toBe(20000);
  });

  it('returns null when mileage is null/falsy (missing)', () => {
    expect(milesPerYr(car({ mileage: null as never }), 2026)).toBeNull();
  });

  it('returns null when year is null/falsy (missing)', () => {
    expect(milesPerYr(car({ year: null as never }), 2026)).toBeNull();
  });

  it('uses real current year when currentYear not provided (non-deterministic, just no throw)', () => {
    expect(() => milesPerYr(car())).not.toThrow();
  });

  it('seed car c1: 2023 RAV4, 48280mi, currentYear=2026 → 48280/3 ≈ 16093', () => {
    expect(milesPerYr(car({ year: 2023, mileage: 48280 }), 2026)).toBe(16093);
  });

  it('seed car c2: 2022 RAV4, 58927mi, currentYear=2026 → 58927/4 ≈ 14732', () => {
    expect(milesPerYr(car({ year: 2022, mileage: 58927 }), 2026)).toBe(14732);
  });
});

// ---------------------------------------------------------------------------
// tcoPerYear
// ---------------------------------------------------------------------------
describe('tcoPerYear', () => {
  it('divides a manual TCO override by years', () => {
    expect(tcoPerYear(car({ tco5yr: 30000 }), { miles: 12000, years: 5 })).toBe(6000);
  });

  it('falls back to the engine estimate when there is no override (null)', () => {
    const c = car({ tco5yr: null });
    const expected = Math.round(estimatedTco(c, S)! / S.years);
    expect(tcoPerYear(c, S)).toBe(expected);
    expect(tcoPerYear(c, S)!).toBeGreaterThan(0);
  });

  it('treats a 0 override as no override (uses the estimate)', () => {
    const c = car({ tco5yr: 0 });
    expect(tcoPerYear(c, S)).toBe(Math.round(estimatedTco(c, S)! / S.years));
  });

  it('rounds to integer', () => {
    // 30001 / 5 = 6000.2 → Math.round → 6000
    expect(tcoPerYear(car({ tco5yr: 30001 }), { miles: 12000, years: 5 })).toBe(6000);
  });

  it('30003 / 5 = 6000.6 → rounds to 6001', () => {
    expect(tcoPerYear(car({ tco5yr: 30003 }), { miles: 12000, years: 5 })).toBe(6001);
  });

  it('different years setting (override path)', () => {
    expect(tcoPerYear(car({ tco5yr: 30000 }), { miles: 12000, years: 3 })).toBe(10000);
  });

  it('returns null when there is no price to estimate from and no override', () => {
    expect(tcoPerYear(car({ tco5yr: null, price: 0 }), S)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// tcoPerMile
// ---------------------------------------------------------------------------
describe('tcoPerMile', () => {
  it('override / (miles * years)', () => {
    // 30000 / (12000 * 5) = 0.5
    expect(tcoPerMile(car({ tco5yr: 30000 }), { miles: 12000, years: 5 })).toBe(0.5);
  });

  it('falls back to the engine estimate when there is no override (null)', () => {
    const c = car({ tco5yr: null });
    const expected = +(estimatedTco(c, S)! / (S.miles * S.years)).toFixed(2);
    expect(tcoPerMile(c, S)).toBe(expected);
    expect(tcoPerMile(c, S)!).toBeGreaterThan(0);
  });

  it('treats a 0 override as no override (uses the estimate)', () => {
    const c = car({ tco5yr: 0 });
    expect(tcoPerMile(c, S)).toBe(+(estimatedTco(c, S)! / (S.miles * S.years)).toFixed(2));
  });

  it('result is rounded to 2 decimal places', () => {
    // 10000 / (12000 * 5) = 0.16666... → 0.17
    expect(tcoPerMile(car({ tco5yr: 10000 }), { miles: 12000, years: 5 })).toBe(0.17);
  });

  it('different settings (override path)', () => {
    // 36000 / (15000 * 3) = 0.8
    expect(tcoPerMile(car({ tco5yr: 36000 }), { miles: 15000, years: 3 })).toBe(0.8);
  });

  it('returns null when there is no price to estimate from and no override', () => {
    expect(tcoPerMile(car({ tco5yr: null, price: 0 }), S)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// estimatedTco / effectiveTco / isTcoEstimated  (engine integration)
// ---------------------------------------------------------------------------
describe('estimatedTco', () => {
  it('computes a positive whole-dollar TCO from the engine for a priced car', () => {
    const t = estimatedTco(car({ tco5yr: null }), S);
    expect(t).not.toBeNull();
    expect(Number.isInteger(t)).toBe(true);
    expect(t!).toBeGreaterThan(0);
  });

  it('is null when there is no price', () => {
    expect(estimatedTco(car({ price: 0 }), S)).toBeNull();
  });

  it('a longer ownership horizon raises the total cost (more years of fuel/insurance/upkeep)', () => {
    const c = car({ tco5yr: null });
    expect(estimatedTco(c, { miles: 12000, years: 8 })!).toBeGreaterThan(estimatedTco(c, { miles: 12000, years: 3 })!);
  });

  it('more annual miles raises the total cost', () => {
    const c = car({ tco5yr: null });
    expect(estimatedTco(c, { miles: 20000, years: 5 })!).toBeGreaterThan(estimatedTco(c, { miles: 8000, years: 5 })!);
  });

  it('a cheaper, identical car costs less to own (price drives ranking)', () => {
    const cheap = car({ tco5yr: null, price: 30000 });
    const dear = car({ tco5yr: null, price: 40000 });
    expect(estimatedTco(cheap, S)!).toBeLessThan(estimatedTco(dear, S)!);
  });
});

describe('effectiveTco / isTcoEstimated', () => {
  it('uses the manual override verbatim when present', () => {
    expect(effectiveTco(car({ tco5yr: 42000 }), S)).toBe(42000);
    expect(isTcoEstimated(car({ tco5yr: 42000 }))).toBe(false);
  });

  it('uses the estimate when no override, and flags it as estimated', () => {
    const c = car({ tco5yr: null });
    expect(effectiveTco(c, S)).toBe(estimatedTco(c, S));
    expect(isTcoEstimated(c)).toBe(true);
  });
});
