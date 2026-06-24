import type { FeatureKey } from '../types';

/**
 * Canonical tracked-feature list: [key, shortLabel, longLabel], in display order.
 * FROZEN — ported verbatim from the prototype (garage.html:608). Do not reorder or rename keys;
 * the order drives the card pill row, the detail checklist, and the export columns.
 */
export const FEATURES: ReadonlyArray<readonly [FeatureKey, string, string]> = [
  ['moonroof', 'Moonroof', 'Sunroof / moonroof'],
  ['panoramicRoof', 'Pano roof', 'Panoramic roof'],
  ['heatedSeats', 'Htd seats', 'Heated seats'],
  ['heatedWheel', 'Htd wheel', 'Heated steering wheel'],
  ['powerSeats', 'Pwr seats', 'Power seats'],
  ['premiumAudio', 'JBL audio', 'JBL / premium audio'],
  ['keyless', 'Keyless', 'Keyless entry + push start'],
  ['bluetooth', 'Bluetooth', 'Bluetooth'],
  ['powerLiftgate', 'Pwr liftgate', 'Power liftgate'],
  ['immobilizer', 'Immobilizer', 'Immobilizer'],
];

/**
 * Feature subsumption — having the KEY feature necessarily means the car has each listed
 * feature too. A panoramic roof is a (larger, fixed-glass) sunroof/moonroof, so marking a
 * car's panoramic roof also credits its moonroof. The relationship is ONE-WAY: a plain
 * sunroof does NOT imply a panoramic roof. Consumed by featState() (lib/format.ts) so the
 * implication holds everywhere — pills, detail, compare, export, the "must-have" filter.
 */
export const FEATURE_IMPLIES: Partial<Record<FeatureKey, readonly FeatureKey[]>> = {
  panoramicRoof: ['moonroof'],
};
