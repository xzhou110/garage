import { describe, it, expect } from 'vitest';
import { getFlags, signalLevel } from './flags';
import type { Car, Flag } from '../types';

// ---------------------------------------------------------------------------
// Fixture helper — spreads overrides onto a complete, clean, low-risk default
// car so each test only touches the field(s) it's probing.
// ---------------------------------------------------------------------------
function car(overrides: Partial<Car> = {}): Car {
  return {
    id: 'test',
    status: 'New',
    year: 2022,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'SE',
    price: 30000,
    mileage: 48000,
    sellerType: 'Dealer',
    dealership: 'Test Motors',
    location: 'Anytown',
    ownerCount: 1,
    accidents: 0,
    titleStatus: 'Clean',
    drivetrain: 'AWD',
    fuelType: 'Hybrid',
    engine: '2.5L',
    extColor: 'White',
    intColor: 'Black',
    vin: 'ABC123456789',
    warranty: 'In warranty',
    feat: {
      moonroof: true,
      heatedSeats: true,
      heatedWheel: null,
      powerSeats: true,
      premiumAudio: false,
      keyless: true,
      bluetooth: true,
      powerLiftgate: null,
      immobilizer: null,
    },
    features: [],
    serviceRecords: true,
    serviceCount: 2,
    daysOnMarket: 10,
    dateSeen: '2026-06-01',
    marketAvg: null,
    transferFee: null,
    feesEstimate: null,
    tco5yr: null,
    expertRating: 4,
    rating: 0,
    notes: '',
    image: '',
    sourceUrl: 'https://example.com',
    ...overrides,
  };
}

// Helpers to extract flags by level
const flagsOfLevel = (flags: Flag[], lvl: string) => flags.filter((f) => f.lvl === lvl);
const hasLevel = (flags: Flag[], lvl: string) => flags.some((f) => f.lvl === lvl);

// ---------------------------------------------------------------------------
// §5.5 — BRANDED TITLE RULES
// ---------------------------------------------------------------------------
describe('getFlags — branded title', () => {
  it('Rebuilt title → risk flag', () => {
    const flags = getFlags(car({ titleStatus: 'Rebuilt' }), 2026);
    expect(hasLevel(flags, 'risk')).toBe(true);
    const risk = flagsOfLevel(flags, 'risk');
    expect(risk.some((f) => f.t.includes('Rebuilt'))).toBe(true);
  });

  it('Salvage title → risk flag', () => {
    const flags = getFlags(car({ titleStatus: 'Salvage' }), 2026);
    expect(hasLevel(flags, 'risk')).toBe(true);
    expect(flagsOfLevel(flags, 'risk').some((f) => f.t.includes('Salvage'))).toBe(true);
  });

  it('Flood title → risk flag', () => {
    const flags = getFlags(car({ titleStatus: 'Flood' }), 2026);
    expect(hasLevel(flags, 'risk')).toBe(true);
    expect(flagsOfLevel(flags, 'risk').some((f) => f.t.includes('Flood'))).toBe(true);
  });

  it('Lemon title → risk flag', () => {
    const flags = getFlags(car({ titleStatus: 'Lemon' }), 2026);
    expect(hasLevel(flags, 'risk')).toBe(true);
    expect(flagsOfLevel(flags, 'risk').some((f) => f.t.includes('Lemon'))).toBe(true);
  });

  it('Clean title → no branded risk flag', () => {
    const flags = getFlags(car({ titleStatus: 'Clean' }), 2026);
    const riskFlags = flagsOfLevel(flags, 'risk').filter((f) => f.t.includes('title'));
    expect(riskFlags).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — TITLE STATUS UNKNOWN / MISSING
// ---------------------------------------------------------------------------
describe('getFlags — title Unknown/missing', () => {
  it("titleStatus 'Unknown' → warn flag", () => {
    const flags = getFlags(car({ titleStatus: 'Unknown' }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('unknown'))).toBe(true);
  });

  it("titleStatus empty string '' → warn flag (falsy check)", () => {
    // The implementation checks `!c.titleStatus`, so an empty string triggers the warn.
    // The Car type constrains titleStatus to specific enum values, but we cast to test the runtime path.
    const c = car({ titleStatus: '' as never });
    const flags = getFlags(c, 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('unknown'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — ACCIDENTS
// ---------------------------------------------------------------------------
describe('getFlags — accidents', () => {
  it('accidents === 2 → risk flag', () => {
    const flags = getFlags(car({ accidents: 2 }), 2026);
    expect(hasLevel(flags, 'risk')).toBe(true);
    expect(flagsOfLevel(flags, 'risk').some((f) => f.t.includes('2 accidents'))).toBe(true);
  });

  it('accidents === 3 (≥2) → risk flag', () => {
    const flags = getFlags(car({ accidents: 3 }), 2026);
    expect(hasLevel(flags, 'risk')).toBe(true);
  });

  it('accidents === 1 → warn (not risk)', () => {
    const flags = getFlags(car({ accidents: 1 }), 2026);
    expect(flagsOfLevel(flags, 'risk').filter((f) => f.t.includes('accident'))).toHaveLength(0);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.includes('1 accident'))).toBe(true);
  });

  it('accidents === null → warn (unknown history)', () => {
    const flags = getFlags(car({ accidents: null }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('accident history unknown'))).toBe(true);
    expect(hasLevel(flags, 'risk')).toBe(false);
  });

  it('accidents === 0 → no accident flag of any kind', () => {
    const flags = getFlags(car({ accidents: 0 }), 2026);
    const accidentFlags = flags.filter((f) => f.t.toLowerCase().includes('accident'));
    expect(accidentFlags).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — VIN
// ---------------------------------------------------------------------------
describe('getFlags — VIN', () => {
  it("vin === '' → warn flag", () => {
    const flags = getFlags(car({ vin: '' }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.includes('VIN'))).toBe(true);
  });

  it('vin present → no VIN warn flag', () => {
    const flags = getFlags(car({ vin: 'ABC123456789' }), 2026);
    const vinWarn = flags.filter((f) => f.t.includes('VIN'));
    expect(vinWarn).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — HIGH MILEAGE ≥90,000
// ---------------------------------------------------------------------------
describe('getFlags — high mileage', () => {
  it('mileage === 90000 → warn flag', () => {
    const flags = getFlags(car({ mileage: 90000 }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('high mileage'))).toBe(true);
  });

  it('mileage === 95000 → warn flag', () => {
    const flags = getFlags(car({ mileage: 95000 }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('high mileage'))).toBe(true);
  });

  it('mileage === 89999 → no high-mileage warn', () => {
    const flags = getFlags(car({ mileage: 89999 }), 2026);
    const mileWarn = flags.filter((f) => f.t.toLowerCase().includes('high mileage'));
    expect(mileWarn).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — MILES PER YEAR ≥15,000 AND mileage <90,000 → info
// ---------------------------------------------------------------------------
describe('getFlags — milesPerYr ≥15,000', () => {
  // year:2024, mileage:46000, currentYear:2026 → 46000/(2026-2024)=23000/yr → ≥15k, <90k → info
  it('milesPerYr ≥15000 and <25000, mileage <90000 → warn flag (amber)', () => {
    // year:2024, mileage:46000, currentYear:2026 → 23000/yr → warn
    const flags = getFlags(car({ year: 2024, mileage: 46000 }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.includes('mi/yr'))).toBe(true);
  });

  it('milesPerYr ≥15000 but mileage ≥90000 → no milesPerYr info flag (suppressed)', () => {
    // year:2024, mileage:92000 → 46000/yr ≥15k BUT mileage ≥90000 → should NOT emit this info
    const flags = getFlags(car({ year: 2024, mileage: 92000 }), 2026);
    const perYrInfo = flags.filter((f) => f.t.includes('mi/yr'));
    expect(perYrInfo).toHaveLength(0);
  });

  it('milesPerYr <15000 → no milesPerYr info flag', () => {
    // year:2022, mileage:48000, currentYear:2026 → 12000/yr → below 15k
    const flags = getFlags(car({ year: 2022, mileage: 48000 }), 2026);
    const perYrInfo = flags.filter((f) => f.t.includes('mi/yr'));
    expect(perYrInfo).toHaveLength(0);
  });

  it('current-year car (age guard) — mileage divided by 1 (not zero) → warn', () => {
    // year:2026, mileage:20000, currentYear:2026 → age=max(1,0)=1 → 20000/yr ≥15k, <25k → warn
    const flags = getFlags(car({ year: 2026, mileage: 20000 }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.includes('mi/yr'))).toBe(true);
  });

  it('milesPerYr ≥25000 (very high) → risk flag (red)', () => {
    // year:2024, mileage:60000, currentYear:2026 → 30000/yr → risk
    const flags = getFlags(car({ year: 2024, mileage: 60000 }), 2026);
    expect(flagsOfLevel(flags, 'risk').some((f) => f.t.includes('mi/yr'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — OWNER COUNT ≥3
// ---------------------------------------------------------------------------
describe('getFlags — ownerCount', () => {
  it('ownerCount === 3 → warn', () => {
    const flags = getFlags(car({ ownerCount: 3 }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.includes('3 prior owners'))).toBe(true);
  });

  it('ownerCount === 4 → warn', () => {
    const flags = getFlags(car({ ownerCount: 4 }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.includes('prior owners'))).toBe(true);
  });

  it('ownerCount === 2 → no owner warn', () => {
    const flags = getFlags(car({ ownerCount: 2 }), 2026);
    expect(flags.filter((f) => f.t.includes('prior owners'))).toHaveLength(0);
  });

  it('ownerCount === null → no owner warn', () => {
    const flags = getFlags(car({ ownerCount: null }), 2026);
    expect(flags.filter((f) => f.t.includes('prior owners'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — SERVICE RECORDS
// ---------------------------------------------------------------------------
describe('getFlags — serviceRecords', () => {
  it('serviceRecords === false → warn', () => {
    const flags = getFlags(car({ serviceRecords: false }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('no service records'))).toBe(true);
  });

  it('serviceRecords === true → no service-records warn', () => {
    const flags = getFlags(car({ serviceRecords: true }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('service records'))).toHaveLength(0);
  });

  it('serviceRecords === null → no service-records warn', () => {
    const flags = getFlags(car({ serviceRecords: null }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('no service records'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — MARKET PRICE (over/under)
// ---------------------------------------------------------------------------
describe('getFlags — market price', () => {
  it('price > marketAvg*1.04 → warn (over market)', () => {
    // marketAvg=30000, price=31300 → 31300 > 31200 → warn
    const flags = getFlags(car({ marketAvg: 30000, price: 31300 }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('over market'))).toBe(true);
  });

  it('price === marketAvg*1.04 exactly → no over-market warn (must be strictly greater)', () => {
    const flags = getFlags(car({ marketAvg: 30000, price: 31200 }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('over market'))).toHaveLength(0);
  });

  it('price < marketAvg*0.85 and not branded → info (well below market)', () => {
    // marketAvg=30000, price=25000 → 25000 < 25500 → info
    const flags = getFlags(car({ marketAvg: 30000, price: 25000, titleStatus: 'Clean' }), 2026);
    expect(flagsOfLevel(flags, 'info').some((f) => f.t.toLowerCase().includes('well below market'))).toBe(true);
  });

  it('price < marketAvg*0.85 but branded → no below-market info flag', () => {
    const flags = getFlags(
      car({ marketAvg: 30000, price: 25000, titleStatus: 'Rebuilt' }),
      2026,
    );
    expect(flags.filter((f) => f.t.toLowerCase().includes('well below market'))).toHaveLength(0);
  });

  it('marketAvg not set → no market flags', () => {
    const flags = getFlags(car({ marketAvg: null, price: 10000 }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('market'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — WARRANTY
// ---------------------------------------------------------------------------
describe('getFlags — warranty', () => {
  it('warranty matches /none/i and sellerType !== CPO → warn', () => {
    const flags = getFlags(car({ warranty: 'None', sellerType: 'Dealer' }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('warranty'))).toBe(true);
  });

  it('warranty matches /void/i and sellerType !== CPO → warn', () => {
    const flags = getFlags(car({ warranty: 'Warranty void', sellerType: 'Dealer' }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('warranty'))).toBe(true);
  });

  it('warranty matches /expired/i and sellerType !== CPO → warn', () => {
    const flags = getFlags(car({ warranty: 'Expired', sellerType: 'Private' }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('warranty'))).toBe(true);
  });

  it('empty warranty string and sellerType !== CPO → warn', () => {
    const flags = getFlags(car({ warranty: '', sellerType: 'Dealer' }), 2026);
    expect(flagsOfLevel(flags, 'warn').some((f) => f.t.toLowerCase().includes('warranty'))).toBe(true);
  });

  it('CPO suppresses the warranty warn even with "None" warranty', () => {
    const flags = getFlags(car({ warranty: 'None', sellerType: 'CPO' }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('warranty'))).toHaveLength(0);
  });

  it('CPO suppresses warranty warn when warranty is empty', () => {
    const flags = getFlags(car({ warranty: '', sellerType: 'CPO' }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('warranty'))).toHaveLength(0);
  });

  it('valid non-CPO warranty → no warranty warn', () => {
    const flags = getFlags(car({ warranty: 'Toyota 3yr/36k', sellerType: 'Dealer' }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('warranty'))).toHaveLength(0);
  });

  it('expired basic but ACTIVE hybrid/powertrain coverage → no warranty warn (Toyota hybrid)', () => {
    const flags = getFlags(
      car({
        warranty: 'Hybrid system 8yr/100k active; powertrain near limit; Basic 3yr/36k expired.',
        sellerType: 'Dealer',
        year: 2022,
        mileage: 30000,
      }),
      2026,
    );
    expect(flags.filter((f) => f.t.toLowerCase().includes('warranty'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — DAYS ON MARKET ≥60
// ---------------------------------------------------------------------------
describe('getFlags — daysOnMarket', () => {
  it('daysOnMarket === 60 → info (stale listing)', () => {
    const flags = getFlags(car({ daysOnMarket: 60, titleStatus: 'Clean' }), 2026);
    expect(flagsOfLevel(flags, 'info').some((f) => f.t.includes('60 days'))).toBe(true);
  });

  it('daysOnMarket === 90 → info', () => {
    const flags = getFlags(car({ daysOnMarket: 90, titleStatus: 'Clean' }), 2026);
    expect(flagsOfLevel(flags, 'info').some((f) => f.t.includes('90 days'))).toBe(true);
  });

  it('daysOnMarket === 59 → no stale-listing info', () => {
    const flags = getFlags(car({ daysOnMarket: 59 }), 2026);
    expect(flags.filter((f) => f.t.includes('days'))).toHaveLength(0);
  });

  it('daysOnMarket === null → no stale-listing info', () => {
    const flags = getFlags(car({ daysOnMarket: null }), 2026);
    expect(flags.filter((f) => f.t.includes('days'))).toHaveLength(0);
  });

  it('daysOnMarket ≥60 but branded → no stale-listing info', () => {
    const flags = getFlags(car({ daysOnMarket: 90, titleStatus: 'Rebuilt' }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('stale listing'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — SELLER TYPE: PRIVATE
// ---------------------------------------------------------------------------
describe('getFlags — sellerType Private', () => {
  it('sellerType === Private → info flag', () => {
    const flags = getFlags(car({ sellerType: 'Private' }), 2026);
    expect(flagsOfLevel(flags, 'info').some((f) => f.t.toLowerCase().includes('private party'))).toBe(true);
  });

  it('sellerType === Dealer → no private-party info', () => {
    const flags = getFlags(car({ sellerType: 'Dealer' }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('private party'))).toHaveLength(0);
  });

  it('sellerType === CPO → no private-party info', () => {
    const flags = getFlags(car({ sellerType: 'CPO' }), 2026);
    expect(flags.filter((f) => f.t.toLowerCase().includes('private party'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5.5 — POSITIVE GOOD FLAG (Clean + 0 accidents + CPO + serviceRecords)
// ---------------------------------------------------------------------------
describe('getFlags — positive good flag', () => {
  it('Clean + accidents=0 + CPO + serviceRecords=true → good flag', () => {
    const flags = getFlags(
      car({
        titleStatus: 'Clean',
        accidents: 0,
        sellerType: 'CPO',
        serviceRecords: true,
        warranty: 'CPO warranty',
      }),
      2026,
    );
    expect(flagsOfLevel(flags, 'good').some((f) => f.t.toLowerCase().includes('clean title'))).toBe(true);
  });

  it('Clean + accidents=0 + CPO but serviceRecords=false → no good flag', () => {
    const flags = getFlags(
      car({
        titleStatus: 'Clean',
        accidents: 0,
        sellerType: 'CPO',
        serviceRecords: false,
        warranty: 'CPO warranty',
      }),
      2026,
    );
    expect(hasLevel(flags, 'good')).toBe(false);
  });

  it('Clean + accidents=0 + CPO but serviceRecords=null → no good flag', () => {
    const flags = getFlags(
      car({
        titleStatus: 'Clean',
        accidents: 0,
        sellerType: 'CPO',
        serviceRecords: null,
        warranty: 'CPO warranty',
      }),
      2026,
    );
    expect(hasLevel(flags, 'good')).toBe(false);
  });

  it('Clean + accidents=0 + serviceRecords=true but Dealer (not CPO) → no good flag', () => {
    const flags = getFlags(
      car({
        titleStatus: 'Clean',
        accidents: 0,
        sellerType: 'Dealer',
        serviceRecords: true,
      }),
      2026,
    );
    expect(hasLevel(flags, 'good')).toBe(false);
  });

  it('accidents=1 + CPO + serviceRecords=true → no good flag', () => {
    const flags = getFlags(
      car({
        titleStatus: 'Clean',
        accidents: 1,
        sellerType: 'CPO',
        serviceRecords: true,
        warranty: 'CPO warranty',
      }),
      2026,
    );
    expect(hasLevel(flags, 'good')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// signalLevel — ordering rules
// ---------------------------------------------------------------------------
describe('signalLevel', () => {
  it('any risk flag → returns "risk"', () => {
    expect(signalLevel(car({ titleStatus: 'Rebuilt' }), 2026)).toBe('risk');
  });

  it('risk beats warns: brandend title + multiple warns → still "risk"', () => {
    expect(
      signalLevel(car({ titleStatus: 'Salvage', accidents: 1, vin: '', ownerCount: 3 }), 2026),
    ).toBe('risk');
  });

  it('≥2 warn flags → "warn"', () => {
    // accidents=null (warn) + vin='' (warn) → 2 warns → 'warn'
    expect(signalLevel(car({ accidents: null, vin: '' }), 2026)).toBe('warn');
  });

  it('exactly 1 warn flag → "warn"', () => {
    // accidents=null is the only warn; everything else clean
    const c = car({
      accidents: null,
      titleStatus: 'Clean',
      vin: 'ABC123',
      mileage: 10000,
      ownerCount: 1,
      serviceRecords: true,
      marketAvg: null,
      warranty: 'Toyota warranty',
      daysOnMarket: 5,
      sellerType: 'Dealer',
    });
    const level = signalLevel(c, 2026);
    expect(level).toBe('warn');
  });

  it('good flag only → "good"', () => {
    // A car that triggers the 'good' flag and no risk/warn flags at all:
    // Clean + 0 accidents + CPO + serviceRecords=true + valid warranty + vin present
    const c = car({
      titleStatus: 'Clean',
      accidents: 0,
      sellerType: 'CPO',
      serviceRecords: true,
      warranty: 'CPO extended warranty',
      vin: 'ABC123',
      mileage: 10000,
      ownerCount: 1,
      marketAvg: null,
      daysOnMarket: 5,
      year: 2024,
    });
    expect(signalLevel(c, 2026)).toBe('good');
  });

  it('near-clean car with no flags → ""', () => {
    // Clean, 0 accidents, Dealer (not CPO, so no 'good'), valid warranty, vin present,
    // no market avg set, low mileage, low milesPerYr, low ownerCount, serviceRecords=true
    const c = car({
      titleStatus: 'Clean',
      accidents: 0,
      sellerType: 'Dealer',
      serviceRecords: true,
      warranty: 'Toyota factory warranty',
      vin: 'ABC123',
      mileage: 10000,
      ownerCount: 1,
      marketAvg: null,
      daysOnMarket: 5,
      year: 2024,
    });
    expect(signalLevel(c, 2026)).toBe('');
  });
});
