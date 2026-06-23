import type { Car } from '../types';
import { SHEET_COLS } from '../data/sheetCols';

/** [titles row, ...one row per car] using SHEET_COLS order (prototype:1242). */
export function sheetMatrix(cars: Car[]): (string | number)[][] {
  return [SHEET_COLS.map((col) => col[0]), ...cars.map((c) => SHEET_COLS.map((col) => col[1](c)))];
}

/** Tab-separated; tabs/newlines inside cells flattened so a paste into A1 stays a clean grid (prototype:1243). */
export function toTSV(cars: Car[]): string {
  return sheetMatrix(cars)
    .map((r) => r.map((v) => String(v).replace(/\t/g, ' ').replace(/\r?\n/g, '  ')).join('\t'))
    .join('\n');
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** RFC-4180-style CSV (prototype:1244). */
export function toCSV(cars: Car[]): string {
  return sheetMatrix(cars)
    .map((r) => r.map(csvCell).join(','))
    .join('\n');
}

/** Pretty JSON of the raw car objects (prototype:1250). */
export function toJSON(cars: Car[]): string {
  return JSON.stringify(cars, null, 2);
}
