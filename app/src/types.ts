// ============================================================================
// FROZEN CONTRACT — owned by the orchestrator/PM. Do NOT edit in a build lane.
// If a type change is needed, route it through the PM (it affects both lanes).
// Mirrors the handoff spec §4 and the prototype's data shapes verbatim.
// ============================================================================

export type FeatureKey =
  | 'moonroof'
  | 'panoramicRoof'
  | 'heatedSeats'
  | 'heatedWheel'
  | 'powerSeats'
  | 'premiumAudio'
  | 'keyless'
  | 'bluetooth'
  | 'powerLiftgate'
  | 'immobilizer';

/** Tri-state per feature: true = has · false = confirmed absent · null/undefined = unknown. */
export type Feat = { [K in FeatureKey]?: boolean | null };

/** Rendered tri-state. 'unk' must always stay visually distinct from 'no'. */
export type FeatState = 'yes' | 'no' | 'unk';

export type Status =
  | 'New'
  | 'Shortlist'
  | 'Contacted'
  | 'Test driven'
  | 'Negotiating'
  | 'Rejected'
  | 'Bought'
  | 'Sold'; // sold (to someone else) / off the market — hidden from the active list by default

export type SellerType = 'Dealer' | 'CPO' | 'Private';
export type TitleStatus = 'Clean' | 'Rebuilt' | 'Salvage' | 'Flood' | 'Lemon' | 'Unknown';
export type Drivetrain = 'FWD' | 'RWD' | 'AWD' | '4WD';
export type FuelType = 'Gas' | 'Hybrid' | 'Plug-in Hybrid' | 'EV' | 'Diesel';
/** Prior use / owner profile. Rental/Fleet = ex-rental or fleet (e.g. Enterprise off-fleet). */
export type OwnerType = 'Personal' | 'Rental/Fleet' | 'Lease' | 'Commercial' | 'Government' | 'Unknown';

export interface Car {
  id: string;
  status: Status;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  mileage: number;
  sellerType: SellerType;
  dealership: string;
  location: string;
  ownerCount: number | null;
  ownerType?: OwnerType; // prior use: personal, ex-rental/fleet, lease, etc.
  accidents: number | null;
  titleStatus: TitleStatus;
  /** Prior theft record disclosed (e.g. CarMax/AutoCheck "Prior Theft History") — stolen & recovered; the title may stay clean. true → red risk flag. */
  priorTheft?: boolean;
  drivetrain: Drivetrain;
  fuelType: FuelType;
  engine: string;
  extColor: string;
  intColor: string;
  vin: string;
  warranty: string;
  feat: Feat;
  features: string[];
  serviceRecords: boolean | null;
  serviceCount: number | null;
  daysOnMarket: number | null;
  dateSeen: string; // ISO date
  marketAvg: number | null;
  transferFee: number | null;
  feesEstimate: number | null;
  tco5yr: number | null;
  expertRating: number; // 0–5
  rating: number; // 0–5
  notes: string; // supports \n
  image: string; // path under public/ (e.g. "img/c1.jpg") OR a data: URI fallback
  sourceUrl: string;
}

export interface Settings {
  miles: number; // annual miles, default 12000
  years: number; // ownership horizon, default 5
  sheetUrl?: string; // Google Apps Script Web App URL for direct Sheets sync ('' = not configured)
}

export const DEFAULT_SETTINGS: Settings = { miles: 12000, years: 5, sheetUrl: '' };

export type FlagLevel = 'risk' | 'warn' | 'info' | 'good';
export interface Flag {
  lvl: FlagLevel;
  t: string;
}

/** Overall card signal. '' = none. */
export type SignalLevel = 'risk' | 'warn' | 'good' | '';

/** A SHEET_COLS column: [title, accessor]. Accessor returns a cell value. */
export type SheetCol = [string, (c: Car) => string | number];
