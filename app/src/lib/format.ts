import type { Car, FeatureKey, FeatState } from '../types';
import { FEATURES } from '../data/features';

/** "$35,999" — em-dash for null/undefined (ported from prototype:578). 0 renders as "$0". */
export function money(n: number | null | undefined): string {
  return n || n === 0 ? '$' + Number(n).toLocaleString('en-US') : '—';
}

/** "48,280 mi" — em-dash for null/undefined (prototype:579). */
export function miles(n: number | null | undefined): string {
  return n || n === 0 ? Number(n).toLocaleString('en-US') + ' mi' : '—';
}

/** Tri-state for a feature: 'yes' | 'no' | 'unk'. 'unk' must never collapse to 'no'. */
export function featState(c: Car, k: FeatureKey): FeatState {
  const v = (c.feat || {})[k];
  return v === true ? 'yes' : v === false ? 'no' : 'unk';
}

/** Count of features the car definitively HAS (only 'yes'). */
export function featCount(c: Car): number {
  return FEATURES.reduce((n, [k]) => n + (featState(c, k) === 'yes' ? 1 : 0), 0);
}

/** Plain-text tri-state for export/spreadsheet cells. */
export function yn(state: FeatState): string {
  return state === 'yes' ? 'Yes' : state === 'no' ? 'No' : '?';
}

/** Display name `${year} ${make} ${model}` (prototype:581). */
export function carName(c: Car): string {
  return `${c.year || ''} ${c.make || ''} ${c.model || ''}`.trim();
}

/** Render a 0–5 rating as filled/empty stars, e.g. ★★★★☆. */
export function stars(n: number): string {
  const v = Math.max(0, Math.min(5, Math.round(n || 0)));
  return '★'.repeat(v) + '☆'.repeat(5 - v);
}
