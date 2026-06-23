import type { FeatureKey } from '../types';

/**
 * Canonical tracked-feature list: [key, shortLabel, longLabel], in display order.
 * FROZEN — ported verbatim from the prototype (garage.html:608). Do not reorder or rename keys;
 * the order drives the card pill row, the detail checklist, and the export columns.
 */
export const FEATURES: ReadonlyArray<readonly [FeatureKey, string, string]> = [
  ['moonroof', 'Moonroof', 'Sunroof / moonroof'],
  ['heatedSeats', 'Htd seats', 'Heated seats'],
  ['heatedWheel', 'Htd wheel', 'Heated steering wheel'],
  ['powerSeats', 'Pwr seats', 'Power seats'],
  ['premiumAudio', 'JBL audio', 'JBL / premium audio'],
  ['keyless', 'Keyless', 'Keyless entry + push start'],
  ['bluetooth', 'Bluetooth', 'Bluetooth'],
  ['powerLiftgate', 'Pwr liftgate', 'Power liftgate'],
  ['immobilizer', 'Immobilizer', 'Immobilizer'],
];
