import { describe, it, expect } from 'vitest';
import {
  inferSegment,
  inferPowertrain,
  inferCondition,
  carToVehicle,
  garageAssumptions,
  estimateTco,
} from './resolve';
import type { Car, Settings } from '../../types';

const S: Settings = { miles: 12000, years: 5 };

function car(over: Partial<Car> = {}): Car {
  return {
    id: 'c1',
    status: 'Shortlist',
    year: 2023,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'XLE',
    price: 35000,
    mileage: 45000,
    sellerType: 'Dealer',
    dealership: '',
    location: '',
    ownerCount: 1,
    accidents: 0,
    titleStatus: 'Clean',
    drivetrain: 'AWD',
    fuelType: 'Hybrid',
    engine: '2.5L I4 Hybrid',
    extColor: '',
    intColor: '',
    vin: 'V',
    warranty: '',
    feat: {},
    features: [],
    serviceRecords: true,
    serviceCount: 2,
    daysOnMarket: null,
    dateSeen: '',
    marketAvg: null,
    transferFee: null,
    feesEstimate: null,
    tco5yr: null,
    expertRating: 4,
    rating: 0,
    notes: '',
    image: '',
    sourceUrl: '',
    ...over,
  };
}

describe('inferSegment', () => {
  it('maps the RAV4 board to compact SUV', () => {
    expect(inferSegment('Toyota', 'RAV4')).toBe('suv-compact');
    expect(inferSegment('Honda', 'CR-V')).toBe('suv-compact');
  });
  it('maps other known classes', () => {
    expect(inferSegment('Toyota', 'Camry')).toBe('car-midsize');
    expect(inferSegment('Toyota', 'Corolla')).toBe('car-economy');
    expect(inferSegment('Toyota', 'Highlander')).toBe('suv-midsize');
    expect(inferSegment('Toyota', 'Tacoma')).toBe('truck');
    expect(inferSegment('Toyota', 'Sienna')).toBe('minivan');
  });
  it('defaults unknown models to compact SUV (the board class)', () => {
    expect(inferSegment('Lucid', 'Air')).toBe('suv-compact');
  });
});

describe('inferPowertrain', () => {
  it('maps fuel types onto engine buckets', () => {
    expect(inferPowertrain('Hybrid')).toBe('hybrid');
    expect(inferPowertrain('Plug-in Hybrid')).toBe('hybrid');
    expect(inferPowertrain('EV')).toBe('ev');
    expect(inferPowertrain('Gas')).toBe('gas');
    expect(inferPowertrain('Diesel')).toBe('gas');
  });
});

describe('inferCondition', () => {
  it('treats a 0-mile current/future model-year car as new', () => {
    expect(inferCondition(car({ mileage: 0, year: 2026 }), 2026)).toBe('new');
    expect(inferCondition(car({ mileage: 0, year: 2027 }), 2026)).toBe('new');
  });
  it('treats anything with miles, or an older year, as used', () => {
    expect(inferCondition(car({ mileage: 12, year: 2026 }), 2026)).toBe('used');
    expect(inferCondition(car({ mileage: 0, year: 2024 }), 2026)).toBe('used');
    expect(inferCondition(car({ mileage: 45000, year: 2023 }), 2026)).toBe('used');
  });
});

describe('carToVehicle', () => {
  it('fills hybrid compact-SUV cost inputs from the reference tables', () => {
    const v = carToVehicle(car(), 2026);
    expect(v.powertrain).toBe('hybrid');
    expect(v.condition).toBe('used');
    expect(v.mpg).toBe(39); // suv-compact hybrid mpg override
    expect(v.annualDepRate).toBe(0.12); // depRateUsed for compact SUV
    expect(v.insuranceAnnual).toBe(Math.round(1600 * 1.15)); // hybrid insurance × CA multiplier
    expect(v.modelYear).toBe(2023);
    expect(v.odometerAtPurchase).toBe(45000);
    expect(v.purchasePrice).toBe(35000);
  });

  it('a new 0-mile car uses the new (faster) depreciation rate', () => {
    const v = carToVehicle(car({ mileage: 0, year: 2026 }), 2026);
    expect(v.condition).toBe('new');
    expect(v.annualDepRate).toBe(0.16); // depRateNew for compact SUV
  });
});

describe('garageAssumptions', () => {
  it('takes years + miles from settings and uses CA, cash-basis defaults', () => {
    const a = garageAssumptions({ miles: 15000, years: 7 });
    expect(a.holdingYears).toBe(7);
    expect(a.annualMiles).toBe(15000);
    expect(a.salesTaxRate).toBe(0.0725); // CA
    expect(a.financing.enabled).toBe(false);
  });
  it('treats a zero/empty horizon as unset (falls back to the default 5)', () => {
    expect(garageAssumptions({ miles: 12000, years: 0 }).holdingYears).toBe(5);
  });

  it('clamps a negative horizon to at least 1 year', () => {
    expect(garageAssumptions({ miles: 12000, years: -3 }).holdingYears).toBe(1);
  });
});

describe('estimateTco (ranking properties)', () => {
  it('returns a result for a priced car and null without a price', () => {
    expect(estimateTco(car(), S)).not.toBeNull();
    expect(estimateTco(car({ price: 0 }), S)).toBeNull();
  });

  it('a cheaper otherwise-identical car has a lower TCO', () => {
    expect(estimateTco(car({ price: 31000 }), S)!.total).toBeLessThan(estimateTco(car({ price: 39000 }), S)!.total);
  });

  it('a newer same-price car retains more value ⇒ lower TCO', () => {
    const newer = estimateTco(car({ year: 2025, mileage: 20000 }), S)!.total;
    const older = estimateTco(car({ year: 2021, mileage: 20000 }), S)!.total;
    expect(newer).toBeLessThan(older);
  });

  it('a longer horizon raises the total cost', () => {
    expect(estimateTco(car(), { miles: 12000, years: 8 })!.total).toBeGreaterThan(
      estimateTco(car(), { miles: 12000, years: 3 })!.total,
    );
  });
});
