// Garage ⇄ TCO-engine adapter. PURE, no DOM. Unit-tested.
// ───────────────────────────────────────────────────────────────────────────
// This is the ONLY bridge between garage's `Car`/`Settings` and the vendored pure
// engine. It infers the cost inputs the engine needs (segment cost rates, powertrain,
// condition) from the sparse listing data we actually have, builds shared `Assumptions`
// from the user's ownership knobs (years + miles), and returns a full TcoResult.
//
// Design: assumptions that are COMMON to every car (region fuel/tax/insurance, cash
// basis) cancel out when ranking, so the ranking is driven by what differs per car —
// price, age (model year), and mileage. That's why a rough-but-consistent estimate is
// genuinely useful for *comparing* cars even though every absolute number is an estimate.
import type { Car, FuelType, Settings } from '../../types';
import type { Assumptions, Condition, Powertrain, SegmentKey, TcoResult, Vehicle } from './types';
import { REFERENCE, type PowertrainOverride, type RateRow } from './reference';
import { computeTco } from './engine';

/** Region whose fuel/electricity/tax/registration/insurance multiplier garage assumes.
 *  The board is CA-based and the owner is in CA; documented as an estimate in the UI. */
export const GARAGE_REGION = 'CA';

/** One-line description of the fixed assumptions, surfaced in the UI as a footnote. */
export const GARAGE_TCO_NOTE =
  'Estimate. Cash purchase, California averages for fuel, tax, registration & insurance, ' +
  'segment-typical maintenance/repairs/depreciation. Differences between cars come from price, ' +
  'age and mileage. Enter a TCO override (e.g. from Edmunds) on any car to replace the estimate.';

const KNOWN_SEGMENTS: { test: RegExp; segment: SegmentKey }[] = [
  { test: /rav4|cr-?v|crv|tucson|sportage|forester|rogue|cx-?5|cx5|escape|equinox|compass|cherokee|outback|hr-?v|corolla cross|venza/i, segment: 'suv-compact' },
  { test: /highlander|pilot|telluride|palisade|santa fe|grand cherokee|4runner|explorer|murano|passport|sorento|ascent/i, segment: 'suv-midsize' },
  { test: /tahoe|suburban|expedition|sequoia|armada|yukon/i, segment: 'suv-large' },
  { test: /tacoma|tundra|f-?150|silverado|ram|colorado|ranger|frontier|ridgeline/i, segment: 'truck' },
  { test: /sienna|odyssey|pacifica|carnival/i, segment: 'minivan' },
  { test: /corolla|civic|sentra|elantra|jetta|mazda3|impreza/i, segment: 'car-economy' },
  { test: /camry|accord|altima|sonata|malibu|legacy|mazda6/i, segment: 'car-midsize' },
];

/** Infer the cost-table segment from make/model. Defaults to compact SUV (the board's class). */
export function inferSegment(make: string, model: string): SegmentKey {
  const hay = `${make || ''} ${model || ''}`.trim();
  for (const { test, segment } of KNOWN_SEGMENTS) if (test.test(hay)) return segment;
  return 'suv-compact';
}

/** Map garage's FuelType onto the engine's powertrain buckets. */
export function inferPowertrain(fuel: FuelType): Powertrain {
  if (fuel === 'EV') return 'ev';
  if (fuel === 'Hybrid' || fuel === 'Plug-in Hybrid') return 'hybrid';
  return 'gas'; // Gas | Diesel
}

/** A 0-mile current/future-model-year car is treated as new; everything else as used. */
export function inferCondition(car: Car, asOfYear: number = new Date().getFullYear()): Condition {
  return (car.mileage || 0) === 0 && (car.year || 0) >= asOfYear ? 'new' : 'used';
}

function ratesFor(segment: SegmentKey, powertrain: Powertrain): RateRow & PowertrainOverride {
  const base = REFERENCE.rates[segment] ?? REFERENCE.rates['suv-compact'];
  const over: PowertrainOverride = base.byPowertrain?.[powertrain] ?? {};
  return { ...base, ...over };
}

/** Shared ownership assumptions: the user's years + miles over fixed regional/cash-basis defaults. */
export function garageAssumptions(s: Settings): Assumptions {
  const r = REFERENCE.regions[GARAGE_REGION] ?? REFERENCE.regions.national;
  return {
    holdingYears: Math.max(1, s.years || 5),
    annualMiles: Math.max(0, s.miles || 12000),
    salesTaxRate: r.salesTaxRate,
    registrationAnnual: r.registrationAnnual,
    fuelPricePerGallon: r.fuelPricePerGallon,
    electricityPricePerKWh: r.electricityPricePerKWh,
    financing: {
      enabled: false, // cash basis — keeps ranking clean and needs no APR input
      new: { downPct: 0.1, apr: 0.06, termYears: 5 },
      used: { downPct: 0.15, apr: 0.099, termYears: 5 },
    },
  };
}

/** Turn a garage Car into the engine's Vehicle, filling cost inputs from the segment tables. */
export function carToVehicle(car: Car, asOfYear: number = new Date().getFullYear()): Vehicle {
  const powertrain = inferPowertrain(car.fuelType);
  const condition = inferCondition(car, asOfYear);
  const segment = inferSegment(car.make, car.model);
  const rate = ratesFor(segment, powertrain);
  const region = REFERENCE.regions[GARAGE_REGION] ?? REFERENCE.regions.national;
  const isEv = powertrain === 'ev';
  const depRate = condition === 'used' ? rate.depRateUsed : rate.depRateNew;

  return {
    id: car.id,
    name: `${car.year} ${car.make} ${car.model}`.trim(),
    condition,
    purchasePrice: Number(car.price) || 0,
    powertrain,
    mpg: isEv ? 0 : rate.mpg,
    miPerKWh: isEv ? rate.miPerKWh ?? 3.5 : 0,
    modelYear: Number(car.year) || asOfYear,
    odometerAtPurchase: Number(car.mileage) || 0,
    resaleValue: null, // engine seeds it from the retention curve
    annualDepRate: depRate,
    insuranceAnnual: Math.round(rate.insurance * region.insuranceMultiplier),
    maintenanceAnnual: rate.maintenance,
    repairAnnual: rate.repair,
    warrantyYears: rate.warrantyYears,
    warrantyMiles: rate.warrantyMiles,
    incentives: REFERENCE.incentives[powertrain]?.[condition] ?? 0,
  };
}

/**
 * Full estimated TCO for one car over the user's ownership horizon.
 * Returns null only when there's no price to compute against.
 */
export function estimateTco(car: Car, s: Settings): TcoResult | null {
  if (!car.price) return null;
  return computeTco(carToVehicle(car), garageAssumptions(s));
}
