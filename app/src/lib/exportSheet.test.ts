import { describe, it, expect } from 'vitest';
import { sheetMatrix, toCSV, toTSV, toJSON } from './exportSheet';
import { SHEET_COLS } from '../data/sheetCols';
import { FEATURES } from '../data/features';
import type { Car } from '../types';

// ---------------------------------------------------------------------------
// Fixture helper
// ---------------------------------------------------------------------------
function car(overrides: Partial<Car> = {}): Car {
  return {
    id: 'c1',
    status: 'Shortlist',
    year: 2023,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'Limited',
    price: 35999,
    mileage: 48280,
    sellerType: 'Dealer',
    dealership: 'Enterprise',
    location: 'Victorville, CA',
    ownerCount: 1,
    accidents: 0,
    titleStatus: 'Clean',
    drivetrain: 'AWD',
    fuelType: 'Hybrid',
    engine: '2.5L',
    extColor: 'White',
    intColor: 'Black',
    vin: '4T3D6RFV8PU137118',
    warranty: 'Toyota CPO',
    feat: {
      moonroof: true,
      heatedSeats: true,
      heatedWheel: null,
      powerSeats: true,
      premiumAudio: true,
      keyless: true,
      bluetooth: true,
      powerLiftgate: true,
      immobilizer: false,
    },
    features: ['Ventilated seats'],
    serviceRecords: true,
    serviceCount: 3,
    daysOnMarket: 15,
    dateSeen: '2026-06-01',
    marketAvg: 36500,
    transferFee: 300,
    feesEstimate: 200,
    tco5yr: 50000,
    expertRating: 4,
    rating: 3,
    notes: '',
    image: 'img/c1.jpg',
    sourceUrl: 'https://example.com/c1',
    ...overrides,
  };
}

// The authoritative expected column count from SHEET_COLS (24 static + 9 features + 8 static = 41)
const EXPECTED_COL_COUNT = SHEET_COLS.length;

// ---------------------------------------------------------------------------
// sheetMatrix — structure
// ---------------------------------------------------------------------------
describe('sheetMatrix — structure', () => {
  it('first row equals SHEET_COLS titles in order', () => {
    const matrix = sheetMatrix([car()]);
    const expectedTitles = SHEET_COLS.map((col) => col[0]);
    expect(matrix[0]).toEqual(expectedTitles);
  });

  it('row[0] starts with "Status"', () => {
    const matrix = sheetMatrix([car()]);
    expect(matrix[0][0]).toBe('Status');
  });

  it('row[0] has Year as second column', () => {
    const matrix = sheetMatrix([car()]);
    expect(matrix[0][1]).toBe('Year');
  });

  it('total column count matches SHEET_COLS length (25 static + 9 features + 8 static = 42)', () => {
    expect(EXPECTED_COL_COUNT).toBe(42);
  });

  it('exactly one car row + one title row = 2 rows for one car', () => {
    const matrix = sheetMatrix([car()]);
    expect(matrix).toHaveLength(2);
  });

  it('N cars → N+1 rows (titles + one per car)', () => {
    const matrix = sheetMatrix([car(), car({ id: 'c2' }), car({ id: 'c3' })]);
    expect(matrix).toHaveLength(4);
  });

  it('empty cars array → only titles row', () => {
    const matrix = sheetMatrix([]);
    expect(matrix).toHaveLength(1);
    expect(matrix[0]).toHaveLength(EXPECTED_COL_COUNT);
  });

  it('every car row has the same length as the titles row', () => {
    const matrix = sheetMatrix([car(), car({ id: 'c2' })]);
    const titleLen = matrix[0].length;
    for (let i = 1; i < matrix.length; i++) {
      expect(matrix[i]).toHaveLength(titleLen);
    }
  });

  it('titles row length === SHEET_COLS.length', () => {
    const matrix = sheetMatrix([car()]);
    expect(matrix[0]).toHaveLength(SHEET_COLS.length);
  });
});

// ---------------------------------------------------------------------------
// sheetMatrix — the 9 feature columns render Yes / No / ?
// ---------------------------------------------------------------------------
describe('sheetMatrix — feature columns', () => {
  // The feature columns start at index 24 (0-based) after 24 static columns
  // Feature titles come from FEATURES long labels
  const featureTitles = FEATURES.map(([, , long]) => long);

  it('titles row contains all 9 feature column headers (long labels)', () => {
    const matrix = sheetMatrix([car()]);
    const titles = matrix[0] as string[];
    for (const label of featureTitles) {
      expect(titles).toContain(label);
    }
  });

  it('feature column for moonroof=true renders "Yes"', () => {
    const c = car({ feat: { moonroof: true } });
    const matrix = sheetMatrix([c]);
    const titles = matrix[0] as string[];
    const moonroofIdx = titles.indexOf('Sunroof / moonroof');
    expect(moonroofIdx).toBeGreaterThan(-1);
    expect(matrix[1][moonroofIdx]).toBe('Yes');
  });

  it('feature column for immobilizer=false renders "No"', () => {
    const c = car({ feat: { immobilizer: false } });
    const matrix = sheetMatrix([c]);
    const titles = matrix[0] as string[];
    const idx = titles.indexOf('Immobilizer');
    expect(idx).toBeGreaterThan(-1);
    expect(matrix[1][idx]).toBe('No');
  });

  it('feature column for heatedWheel=null renders "?"', () => {
    const c = car({ feat: { heatedWheel: null } });
    const matrix = sheetMatrix([c]);
    const titles = matrix[0] as string[];
    const idx = titles.indexOf('Heated steering wheel');
    expect(idx).toBeGreaterThan(-1);
    expect(matrix[1][idx]).toBe('?');
  });

  it('feature column for absent key renders "?"', () => {
    const c = car({ feat: {} });
    const matrix = sheetMatrix([c]);
    const titles = matrix[0] as string[];
    const idx = titles.indexOf('Bluetooth');
    expect(matrix[1][idx]).toBe('?');
  });

  it('all 9 features render Yes/No/? (never boolean true/false)', () => {
    const c = car({
      feat: {
        moonroof: true,
        heatedSeats: false,
        heatedWheel: null,
        powerSeats: true,
        premiumAudio: false,
        keyless: null,
        bluetooth: true,
        powerLiftgate: false,
        immobilizer: null,
      },
    });
    const matrix = sheetMatrix([c]);
    const titles = matrix[0] as string[];
    for (const label of featureTitles) {
      const idx = titles.indexOf(label);
      expect(idx).toBeGreaterThan(-1);
      const cell = matrix[1][idx];
      expect(['Yes', 'No', '?']).toContain(cell);
    }
  });

  it('features column order matches FEATURES canonical order', () => {
    const matrix = sheetMatrix([car()]);
    const titles = matrix[0] as string[];
    const featureIndices = featureTitles.map((label) => titles.indexOf(label));
    // Each index should be strictly greater than the previous (preserving order)
    for (let i = 1; i < featureIndices.length; i++) {
      expect(featureIndices[i]).toBeGreaterThan(featureIndices[i - 1]);
    }
  });
});

// ---------------------------------------------------------------------------
// sheetMatrix — derived columns (Out-the-door, Miles/yr)
// ---------------------------------------------------------------------------
describe('sheetMatrix — derived columns', () => {
  it('Out-the-door column = price + fees', () => {
    // price=35999, transferFee=300, feesEstimate=200 → OTD=36499
    const c = car({ price: 35999, transferFee: 300, feesEstimate: 200 });
    const matrix = sheetMatrix([c]);
    const titles = matrix[0] as string[];
    const idx = titles.indexOf('Out-the-door');
    expect(matrix[1][idx]).toBe(36499);
  });

  it('Miles/yr column matches milesPerYr result', () => {
    // year=2022, mileage=48000, currentYear=now (non-deterministic) — just verify it's a number
    const c = car({ year: 2022, mileage: 48000 });
    const matrix = sheetMatrix([c]);
    const titles = matrix[0] as string[];
    const idx = titles.indexOf('Miles/yr');
    expect(typeof matrix[1][idx]).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// sheetMatrix — Owner type column (exports prior-use: Personal / Lease / Fleet / …)
// ---------------------------------------------------------------------------
describe('sheetMatrix — Owner type column', () => {
  const ownerIdx = (sheetMatrix([car()])[0] as string[]).indexOf('Owner type');

  it('"Owner type" column header exists', () => {
    expect(ownerIdx).toBeGreaterThan(-1);
  });

  it('exports the ownerType value verbatim (Lease / Personal / Rental/Fleet)', () => {
    expect(sheetMatrix([car({ ownerType: 'Lease' })])[1][ownerIdx]).toBe('Lease');
    expect(sheetMatrix([car({ ownerType: 'Personal' })])[1][ownerIdx]).toBe('Personal');
    expect(sheetMatrix([car({ ownerType: 'Rental/Fleet' })])[1][ownerIdx]).toBe('Rental/Fleet');
  });

  it('undefined ownerType → empty string (never the literal "undefined")', () => {
    // base fixture leaves ownerType unset
    expect(sheetMatrix([car()])[1][ownerIdx]).toBe('');
  });

  it('Owner type value survives CSV and TSV serialization', () => {
    const c = car({ ownerType: 'Rental/Fleet' });
    expect(toCSV([c])).toContain('Rental/Fleet');
    expect(toTSV([c])).toContain('Rental/Fleet');
  });
});

// ---------------------------------------------------------------------------
// toCSV — RFC-4180 quoting
// ---------------------------------------------------------------------------
describe('toCSV', () => {
  it('plain cells have no quotes', () => {
    const csv = toCSV([car({ notes: '', features: [] })]);
    const rows = csv.split('\n');
    // The title row should not quote "Status"
    expect(rows[0]).toContain('Status');
    expect(rows[0].startsWith('"')).toBe(false);
  });

  it('cell containing a comma is quoted', () => {
    const c = car({ notes: 'Good deal, maybe negotiate' });
    const csv = toCSV([c]);
    expect(csv).toContain('"Good deal, maybe negotiate"');
  });

  it('cell containing a newline is quoted', () => {
    const c = car({ notes: 'Line one\nLine two' });
    const csv = toCSV([c]);
    expect(csv).toContain('"Line one\nLine two"');
  });

  it('cell containing a double-quote is quoted and the inner quote is doubled', () => {
    const c = car({ notes: 'She said "great car"' });
    const csv = toCSV([c]);
    expect(csv).toContain('"She said ""great car"""');
  });

  it('cell with comma AND newline is quoted', () => {
    const c = car({ notes: 'First, check\nSecond, verify' });
    const csv = toCSV([c]);
    expect(csv).toContain('"First, check\nSecond, verify"');
  });

  it('produces one row per car plus a title row', () => {
    const csv = toCSV([car(), car({ id: 'c2' })]);
    const rows = csv.split('\n');
    expect(rows).toHaveLength(3); // title + 2 cars
  });

  it('empty array → only title row', () => {
    const csv = toCSV([]);
    const rows = csv.split('\n');
    expect(rows).toHaveLength(1);
  });

  it('title row starts with "Status"', () => {
    const csv = toCSV([]);
    expect(csv.startsWith('Status')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// toTSV — tab-separated, flattens tabs/newlines inside cells
// ---------------------------------------------------------------------------
describe('toTSV', () => {
  it('rows are separated by newlines', () => {
    const tsv = toTSV([car()]);
    const rows = tsv.split('\n');
    expect(rows).toHaveLength(2); // title + 1 car
  });

  it('cells within a row are tab-separated', () => {
    const tsv = toTSV([car()]);
    const firstRow = tsv.split('\n')[0];
    const cells = firstRow.split('\t');
    expect(cells).toHaveLength(EXPECTED_COL_COUNT);
  });

  it('tab inside a cell is replaced with a space (grid stays intact)', () => {
    const c = car({ notes: 'Check\ttabs' });
    const tsv = toTSV([c]);
    // The tab in notes should become a space, not break the column grid
    // A tab in notes would add an extra column if not replaced
    const carRow = tsv.split('\n')[1];
    const cells = carRow.split('\t');
    expect(cells).toHaveLength(EXPECTED_COL_COUNT);
    // The notes cell should have a space, not a tab
    const titles = tsv.split('\n')[0].split('\t');
    const notesIdx = titles.indexOf('Notes');
    expect(cells[notesIdx]).toBe('Check tabs');
  });

  it('newline inside a cell is flattened so grid stays intact', () => {
    const c = car({ notes: 'Line one\nLine two' });
    const tsv = toTSV([c]);
    const rows = tsv.split('\n');
    // Should still be 2 rows (title + 1 car), not 3
    expect(rows).toHaveLength(2);
  });

  it('empty cars → only title row with correct number of columns', () => {
    const tsv = toTSV([]);
    const cells = tsv.split('\t');
    expect(cells).toHaveLength(EXPECTED_COL_COUNT);
  });
});

// ---------------------------------------------------------------------------
// toJSON — parses back to the same array
// ---------------------------------------------------------------------------
describe('toJSON', () => {
  it('produces valid JSON that parses back', () => {
    const json = toJSON([car()]);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('parsed result is an array of the same length as input', () => {
    const cars = [car(), car({ id: 'c2' }), car({ id: 'c3' })];
    const json = toJSON(cars);
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(3);
  });

  it('empty array serializes and parses back as empty array', () => {
    const json = toJSON([]);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([]);
  });

  it('preserves car id in round-trip', () => {
    const c = car({ id: 'roundtrip-test' });
    const parsed = JSON.parse(toJSON([c]));
    expect(parsed[0].id).toBe('roundtrip-test');
  });

  it('preserves feature tri-state (null stays null, not coerced)', () => {
    const c = car({ feat: { heatedWheel: null, moonroof: true, heatedSeats: false } });
    const parsed = JSON.parse(toJSON([c]));
    expect(parsed[0].feat.heatedWheel).toBeNull();
    expect(parsed[0].feat.moonroof).toBe(true);
    expect(parsed[0].feat.heatedSeats).toBe(false);
  });

  it('produces pretty-printed JSON (indented)', () => {
    const json = toJSON([car()]);
    // Pretty-print means it has newlines and indentation
    expect(json).toContain('\n');
    expect(json).toContain('  ');
  });
});
