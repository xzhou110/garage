import { describe, it, expect } from 'vitest';
import { computeTco, seedResaleValue, vehicleAgeNow } from './engine';
import type { Assumptions, Vehicle } from './types';

// Local fixtures (the garage port does not vendor car-tco-compare's presets).
const NOW = new Date().getFullYear();

const A = (over: Partial<Assumptions> = {}): Assumptions => ({
  holdingYears: 5,
  annualMiles: 12000,
  salesTaxRate: 0.0725,
  registrationAnnual: 250,
  fuelPricePerGallon: 4.8,
  electricityPricePerKWh: 0.3,
  financing: {
    enabled: false,
    new: { downPct: 0.1, apr: 0.06, termYears: 5 },
    used: { downPct: 0.15, apr: 0.099, termYears: 5 },
  },
  ...over,
});

const V = (over: Partial<Vehicle> = {}): Vehicle => ({
  id: 'v1',
  name: 'RAV4 Hybrid',
  condition: 'used',
  purchasePrice: 35000,
  powertrain: 'hybrid',
  mpg: 39,
  miPerKWh: 0,
  modelYear: NOW, // age 0 by default
  odometerAtPurchase: 0,
  resaleValue: null,
  annualDepRate: 0.16,
  insuranceAnnual: 1600,
  maintenanceAnnual: 700,
  repairAnnual: 500,
  warrantyYears: 3,
  warrantyMiles: 36000,
  incentives: 0,
  ...over,
});

describe('computeTco', () => {
  it('itemizes exactly the 7 categories', () => {
    const r = computeTco(V(), A());
    expect(Object.keys(r.byCategory).sort()).toEqual(
      ['depreciation', 'energy', 'financingInterest', 'insurance', 'maintenance', 'repairs', 'taxesAndFees'].sort(),
    );
  });

  it('depreciation = price − resale', () => {
    const r = computeTco(V(), A());
    expect(r.byCategory.depreciation).toBeCloseTo(35000 - r.resaleUsed, 6);
  });

  it('cumulative starts at price + sales tax and ends at total TCO; length = years + 1', () => {
    const a = A();
    const r = computeTco(V(), a);
    expect(r.cumulative[0]).toBeCloseTo(35000 + 35000 * a.salesTaxRate, 6);
    expect(r.cumulative[r.cumulative.length - 1]).toBeCloseTo(r.total, 6);
    expect(r.cumulative.length).toBe(a.holdingYears + 1);
  });

  it('warranty zeroes repairs while covered (age AND miles)', () => {
    const a = A();
    const base = V({ modelYear: NOW, odometerAtPurchase: 0 }); // new-ish, 3yr/36k warranty
    expect(computeTco({ ...base, warrantyYears: 0, warrantyMiles: 0 }, a).byCategory.repairs).toBeCloseTo(base.repairAnnual * a.holdingYears, 6);
    expect(computeTco({ ...base, warrantyYears: 10, warrantyMiles: 120000 }, a).byCategory.repairs).toBe(0);
  });

  it('cash purchase has zero financing interest; enabled financing is positive', () => {
    expect(computeTco(V(), A()).byCategory.financingInterest).toBe(0);
    const fin = A({ financing: { ...A().financing, enabled: true } });
    expect(computeTco(V(), fin).byCategory.financingInterest).toBeGreaterThan(0);
  });

  it('0% APR yields finite interest = 0', () => {
    const fin = A({ financing: { enabled: true, new: { downPct: 0.1, apr: 0, termYears: 5 }, used: { downPct: 0.15, apr: 0, termYears: 5 } } });
    const r = computeTco(V(), fin);
    expect(Number.isFinite(r.byCategory.financingInterest)).toBe(true);
    expect(r.byCategory.financingInterest).toBe(0);
  });

  it('EV uses electricity price and efficiency', () => {
    const a = A();
    const ev = V({ powertrain: 'ev', miPerKWh: 3.4, mpg: 0 });
    const expected = ((a.holdingYears * a.annualMiles) / 3.4) * a.electricityPricePerKWh;
    expect(computeTco(ev, a).byCategory.energy).toBeCloseTo(expected, 6);
  });

  it('more annual miles ⇒ more energy (monotonic)', () => {
    const less = computeTco(V(), A()).byCategory.energy;
    const more = computeTco(V(), A({ annualMiles: 24000 })).byCategory.energy;
    expect(more).toBeGreaterThan(less);
  });

  it('respects an explicit resale override and reduces total by incentives', () => {
    const a = A();
    const r = computeTco(V({ resaleValue: 20000 }), a);
    expect(r.resaleUsed).toBe(20000);
    expect(r.byCategory.depreciation).toBeCloseTo(35000 - 20000, 6);
    const base = computeTco(V(), a).total;
    const credited = computeTco(V({ incentives: 5000 }), a).total;
    expect(base - credited).toBeCloseTo(5000, 6);
  });

  it('perYear and perMile are consistent with the total', () => {
    const a = A();
    const r = computeTco(V(), a);
    expect(r.perYear).toBeCloseTo(r.total / a.holdingYears, 6);
    expect(r.perMile).toBeCloseTo(r.total / (a.holdingYears * a.annualMiles), 6);
  });
});

describe('seedResaleValue (retention curve)', () => {
  it('stays within [0, price] and falls as the depreciation rate rises', () => {
    const s = seedResaleValue(V(), A());
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(35000);
    expect(seedResaleValue(V({ annualDepRate: 0.3 }), A())).toBeLessThan(s);
  });

  it('falls as the holding period lengthens', () => {
    const short = seedResaleValue(V(), A({ holdingYears: 3 }));
    const long = seedResaleValue(V(), A({ holdingYears: 8 }));
    expect(long).toBeLessThan(short);
  });

  it('an older model year (same price) seeds a lower resale', () => {
    const newer = seedResaleValue(V({ modelYear: NOW }), A());
    const older = seedResaleValue(V({ modelYear: NOW - 4 }), A());
    expect(older).toBeLessThan(newer);
  });
});

describe('vehicleAgeNow', () => {
  it('age = asOfYear − modelYear, floored at 0', () => {
    expect(vehicleAgeNow(V({ modelYear: 2022 }), 2026)).toBe(4);
    expect(vehicleAgeNow(V({ modelYear: 2027 }), 2026)).toBe(0); // future model year clamps to 0
  });
});
