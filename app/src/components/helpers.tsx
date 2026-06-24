// UI-layer helpers: orchestration that COMPOSES the pure lib/* engine (it never reimplements
// domain logic) plus presentational shared bits (asset URLs, flag icons, status classes).
import type { ReactElement } from 'react';
import type { Car, FlagLevel, Status } from '../types';
import { otd } from '../lib/derive';
import { featCount, featState } from '../lib/format';
import { IconCheck, IconInfo, IconRisk, IconWarn } from './icons';
import type { Filters } from '../state/useGarage';

/** Resolve a public/ asset (e.g. "img/c1.jpg") against Vite's base so it works in dev and built dist/. */
export function assetUrl(path: string): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:|\/\/)/i.test(path)) return path; // absolute / data / blob — leave as-is
  const base = import.meta.env.BASE_URL || '/';
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

/** Flag-level → the matching status icon (risk→risk, good→check, info→info, warn→warn). */
export function flagIcon(lvl: FlagLevel, className?: string): ReactElement {
  if (lvl === 'risk') return <IconRisk className={className} />;
  if (lvl === 'good') return <IconCheck className={className} />;
  if (lvl === 'info') return <IconInfo className={className} />;
  return <IconWarn className={className} />;
}

/** Status → badge color class (ported from STATUS_COLORS, garage.html:683). */
export const STATUS_BADGE: Record<Status, string> = {
  New: 'b-neutral',
  Shortlist: 'b-info',
  Contacted: 'b-info',
  'Test driven': 'b-good',
  Negotiating: 'b-warn',
  Rejected: 'b-risk',
  Bought: 'b-good',
  Sold: 'b-neutral',
};

/** Search + chip + panel filters (ported from applyFilters, garage.html:692). featState via lib. */
export function applyFilters(cars: Car[], f: Filters): Car[] {
  const q = f.search.trim().toLowerCase();
  return cars.filter((c) => {
    if (q) {
      const hay = `${c.id || ''} ${c.year || ''} ${c.make || ''} ${c.model || ''} ${c.trim || ''} ${c.dealership || ''} ${
        c.location || ''
      } ${(c.features || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.seller !== 'all' && c.sellerType !== f.seller) return false;
    if (f.cleanOnly && c.titleStatus !== 'Clean') return false;
    if (f.noAccident && c.accidents !== 0) return false;
    if (f.hideRejected && c.status === 'Rejected') return false;
    if (!f.showSold && c.status === 'Sold') return false;
    if (f.maxPrice != null && (c.price == null || c.price > f.maxPrice)) return false;
    if (f.maxMileage != null && (c.mileage == null || c.mileage > f.maxMileage)) return false;
    if (f.minExpert && !((c.expertRating || 0) >= f.minExpert)) return false;
    if (f.minYou && !((c.rating || 0) >= f.minYou)) return false;
    // featState (not raw c.feat) so feature implications hold: a "must have moonroof"
    // filter also matches a car whose panoramic roof implies it.
    for (const k of f.reqFeatures) {
      if (featState(c, k) !== 'yes') return false;
    }
    return true;
  });
}

/** Sort (ported from applySort, garage.html:711). 'added' keeps insertion order. */
export function applySort(cars: Car[], sort: Filters['sort']): Car[] {
  const arr = [...cars];
  const cmp: Partial<Record<Filters['sort'], (a: Car, b: Car) => number>> = {
    'price-asc': (a, b) => (a.price || 1e12) - (b.price || 1e12),
    'price-desc': (a, b) => (b.price || 0) - (a.price || 0),
    'otd-asc': (a, b) => (otd(a) ?? 1e12) - (otd(b) ?? 1e12),
    'miles-asc': (a, b) => (a.mileage || 1e12) - (b.mileage || 1e12),
    'year-desc': (a, b) => (b.year || 0) - (a.year || 0),
    'feat-desc': (a, b) => featCount(b) - featCount(a),
    'tco-asc': (a, b) => (a.tco5yr || 1e12) - (b.tco5yr || 1e12),
    'expert-desc': (a, b) => (b.expertRating || 0) - (a.expertRating || 0),
    'you-desc': (a, b) => (b.rating || 0) - (a.rating || 0),
    'dom-desc': (a, b) => (b.daysOnMarket || 0) - (a.daysOnMarket || 0),
  };
  const fn = cmp[sort];
  if (fn) arr.sort(fn);
  return arr;
}
