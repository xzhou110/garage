// TCO engine — internal domain types.
// ───────────────────────────────────────────────────────────────────────────
// VENDORED from the sibling project `car-tco-compare` (app/src/types.ts), the
// pure TCO calculator. Kept self-contained here so garage stays a dependency-free
// static SPA. See lib/tco/README.md + DECISIONS ADR-009 for provenance / re-sync.
// These types are PRIVATE to the engine; the garage app talks to it only through
// the adapter in resolve.ts (Car → Vehicle) and lib/derive.ts.

export type Condition = 'new' | 'used';
export type Powertrain = 'gas' | 'hybrid' | 'ev';

export interface FinancingBracket {
  downPct: number; // fraction of price (0.10 = 10%)
  apr: number; // annual, fraction (0.069 = 6.9%)
  termYears: number;
}

export interface Financing {
  enabled: boolean;
  new: FinancingBracket;
  used: FinancingBracket;
}

export interface Assumptions {
  holdingYears: number;
  annualMiles: number;
  salesTaxRate: number; // fraction
  registrationAnnual: number;
  fuelPricePerGallon: number;
  electricityPricePerKWh: number;
  financing: Financing;
}

export interface Vehicle {
  id: string;
  name: string;
  condition: Condition;
  purchasePrice: number;
  powertrain: Powertrain;
  mpg: number; // gas/hybrid
  miPerKWh: number; // ev
  modelYear: number; // age "now" is derived from this (currentYear − modelYear)
  odometerAtPurchase: number;
  resaleValue: number | null; // null => auto-estimate from the retention curve
  annualDepRate: number; // scales the retention curve's loss (0.16 = RAV4 benchmark)
  insuranceAnnual: number;
  maintenanceAnnual: number; // rough, includes tires
  repairAnnual: number; // applies once out of warranty
  warrantyYears: number; // from new
  warrantyMiles: number; // from new
  incentives: number;
}

export type CategoryKey =
  | 'depreciation'
  | 'financingInterest'
  | 'energy'
  | 'insurance'
  | 'maintenance'
  | 'repairs'
  | 'taxesAndFees';

export type ByCategory = Record<CategoryKey, number>;

export interface TcoResult {
  total: number;
  perYear: number;
  perMile: number;
  byCategory: ByCategory;
  cumulative: number[]; // length holdingYears + 1
  resaleUsed: number;
  downPayment: number;
}

export type SegmentKey =
  | 'car-economy'
  | 'car-midsize'
  | 'car-luxury'
  | 'car-sport'
  | 'suv-compact'
  | 'suv-midsize'
  | 'suv-large'
  | 'luxury-suv'
  | 'truck'
  | 'minivan';
