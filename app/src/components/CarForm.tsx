import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type {
  Car,
  Drivetrain,
  Feat,
  FuelType,
  OwnerType,
  SellerType,
  Status,
  TitleStatus,
} from '../types';
import { FEATURES } from '../data/features';
import { Modal } from './Modal';
import { IconClose } from './icons';

interface Props {
  /** null = add mode; a Car = edit mode. undefined = closed. */
  car: Car | null | undefined;
  onClose: () => void;
  onSave: (car: Car) => void;
}

const STATUSES: Status[] = ['New', 'Shortlist', 'Contacted', 'Test driven', 'Negotiating', 'Rejected', 'Bought', 'Sold'];
const TITLES: TitleStatus[] = ['Clean', 'Rebuilt', 'Salvage', 'Flood', 'Lemon', 'Unknown'];
const SELLERS: SellerType[] = ['Dealer', 'CPO', 'Private'];
const DRIVES: Drivetrain[] = ['FWD', 'RWD', 'AWD', '4WD'];
const FUELS: FuelType[] = ['Gas', 'Hybrid', 'Plug-in Hybrid', 'EV', 'Diesel'];
const OWNER_TYPES: OwnerType[] = ['Personal', 'Rental/Fleet', 'Lease', 'Commercial', 'Government', 'Unknown'];

/** Tri-state select value for one feature. */
type FeatChoice = '?' | 'Yes' | 'No';
function featToChoice(v: boolean | null | undefined): FeatChoice {
  return v === true ? 'Yes' : v === false ? 'No' : '?';
}
function choiceToFeat(c: FeatChoice): boolean | null {
  return c === 'Yes' ? true : c === 'No' ? false : null;
}

/** The draft shape: every field as a string/select-friendly value, plus per-feature tri-state. */
interface Draft {
  status: Status;
  year: string;
  make: string;
  model: string;
  trim: string;
  price: string;
  mileage: string;
  marketAvg: string;
  transferFee: string;
  feesEstimate: string;
  tco5yr: string;
  ownerCount: string;
  ownerType: '' | OwnerType;
  accidents: string;
  titleStatus: TitleStatus;
  serviceRecords: '' | 'Yes' | 'No';
  serviceCount: string;
  warranty: string;
  daysOnMarket: string;
  vin: string;
  sellerType: SellerType;
  drivetrain: '' | Drivetrain;
  fuelType: '' | FuelType;
  engine: string;
  extColor: string;
  intColor: string;
  dealership: string;
  location: string;
  feat: Record<string, FeatChoice>;
  features: string;
  sourceUrl: string;
  image: string;
  expertRating: string;
  rating: string;
  notes: string;
}

function emptyDraft(): Draft {
  const feat: Record<string, FeatChoice> = {};
  FEATURES.forEach(([k]) => (feat[k] = '?'));
  return {
    status: 'New',
    year: '',
    make: '',
    model: '',
    trim: '',
    price: '',
    mileage: '',
    marketAvg: '',
    transferFee: '',
    feesEstimate: '',
    tco5yr: '',
    ownerCount: '',
    ownerType: '',
    accidents: '',
    titleStatus: 'Clean',
    serviceRecords: '',
    serviceCount: '',
    warranty: '',
    daysOnMarket: '',
    vin: '',
    sellerType: 'Dealer',
    drivetrain: '',
    fuelType: '',
    engine: '',
    extColor: '',
    intColor: '',
    dealership: '',
    location: '',
    feat,
    features: '',
    sourceUrl: '',
    image: '',
    expertRating: '',
    rating: '',
    notes: '',
  };
}

function s(v: number | null | undefined): string {
  return v == null ? '' : String(v);
}

function carToDraft(c: Car): Draft {
  const feat: Record<string, FeatChoice> = {};
  FEATURES.forEach(([k]) => (feat[k] = featToChoice(c.feat[k])));
  return {
    status: c.status,
    year: s(c.year),
    make: c.make,
    model: c.model,
    trim: c.trim,
    price: s(c.price),
    mileage: s(c.mileage),
    marketAvg: s(c.marketAvg),
    transferFee: s(c.transferFee),
    feesEstimate: s(c.feesEstimate),
    tco5yr: s(c.tco5yr),
    ownerCount: s(c.ownerCount),
    ownerType: c.ownerType || '',
    accidents: s(c.accidents),
    titleStatus: c.titleStatus,
    serviceRecords: c.serviceRecords === true ? 'Yes' : c.serviceRecords === false ? 'No' : '',
    serviceCount: s(c.serviceCount),
    warranty: c.warranty,
    daysOnMarket: s(c.daysOnMarket),
    vin: c.vin,
    sellerType: c.sellerType,
    drivetrain: c.drivetrain,
    fuelType: c.fuelType,
    engine: c.engine,
    extColor: c.extColor,
    intColor: c.intColor,
    dealership: c.dealership,
    location: c.location,
    feat,
    features: (c.features || []).join(', '),
    sourceUrl: c.sourceUrl,
    image: c.image,
    expertRating: s(c.expertRating),
    rating: s(c.rating),
    notes: c.notes,
  };
}

function num(v: string): number | null {
  const t = v.trim();
  return t === '' ? null : Number(t);
}

/** Build a complete Car from the draft (ported from saveCar, garage.html:1171). */
function draftToCar(d: Draft, existing: Car | null): Car {
  const feat: Feat = {};
  FEATURES.forEach(([k]) => {
    feat[k] = choiceToFeat(d.feat[k] || '?');
  });
  const sc = num(d.serviceCount);
  const serviceRecords =
    d.serviceRecords === 'Yes' ? true : d.serviceRecords === 'No' ? false : sc != null ? sc > 0 : null;

  return {
    id: existing ? existing.id : 'c' + Date.now(),
    status: d.status || 'New',
    year: num(d.year) ?? 0,
    make: d.make.trim(),
    model: d.model.trim(),
    trim: d.trim.trim(),
    price: num(d.price) ?? 0,
    mileage: num(d.mileage) ?? 0,
    sellerType: d.sellerType || 'Dealer',
    dealership: d.dealership.trim(),
    location: d.location.trim(),
    ownerCount: num(d.ownerCount),
    ownerType: d.ownerType || undefined,
    accidents: num(d.accidents),
    titleStatus: d.titleStatus || 'Unknown',
    drivetrain: (d.drivetrain || 'FWD') as Drivetrain,
    fuelType: (d.fuelType || 'Gas') as FuelType,
    engine: d.engine.trim(),
    extColor: d.extColor.trim(),
    intColor: d.intColor.trim(),
    vin: d.vin.trim(),
    warranty: d.warranty.trim(),
    feat,
    features: d.features
      ? d.features
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      : [],
    serviceRecords,
    serviceCount: sc,
    daysOnMarket: num(d.daysOnMarket),
    dateSeen: existing?.dateSeen || new Date().toISOString().slice(0, 10),
    marketAvg: num(d.marketAvg),
    transferFee: num(d.transferFee),
    feesEstimate: num(d.feesEstimate),
    tco5yr: num(d.tco5yr),
    expertRating: num(d.expertRating) ?? 0,
    rating: num(d.rating) ?? 0,
    notes: d.notes,
    image: d.image.trim(),
    sourceUrl: d.sourceUrl.trim(),
  };
}

export function CarForm({ car, onClose, onSave }: Props): ReactElement {
  const open = car !== undefined;
  const isEdit = !!car;
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  // Reset the draft whenever we (re)open in add or edit mode.
  useEffect(() => {
    if (car === undefined) return;
    setDraft(car ? carToDraft(car) : emptyDraft());
  }, [car]);

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }
  function setFeat(k: string, v: FeatChoice) {
    setDraft((d) => ({ ...d, feat: { ...d.feat, [k]: v } }));
  }

  function handleSave() {
    if (!draft.make.trim() && !draft.model.trim()) {
      // mirror the prototype's guard
      window.alert('Add at least a make or model');
      return;
    }
    onSave(draftToCar(draft, car ?? null));
  }

  const txt = (k: keyof Draft, label: string, type = 'text', span = false, opt = false, hint?: string) => (
    <div className={`field ${span ? 'span2' : ''}`}>
      <label>
        {label}
        {opt && <span className="opt"> (optional)</span>}
        {hint && <span className="opt"> — {hint}</span>}
      </label>
      <input type={type} value={draft[k] as string} onChange={(e) => set(k, e.target.value as Draft[typeof k])} />
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} labelledBy="form-title">
      <div className="modal-head">
        <div>
          <div className="modal-title" id="form-title">
            {isEdit ? 'Edit car' : 'Add a car'}
          </div>
          <div className="modal-sub">Most fields are optional — fill what the listing shows.</div>
        </div>
        <button className="x" onClick={onClose} aria-label="Close">
          <IconClose />
        </button>
      </div>

      <div className="modal-body">
        <div className="form-grid">
          <div className="section-label">Identity</div>
          {txt('year', 'Year', 'number')}
          {txt('make', 'Make')}
          {txt('model', 'Model')}
          {txt('trim', 'Trim')}

          <div className="section-label">Price &amp; value</div>
          {txt('price', 'Asking price ($)', 'number')}
          {txt('mileage', 'Mileage', 'number')}
          {txt('marketAvg', 'Market avg ($)', 'number', false, true)}
          {txt('transferFee', 'Transfer fee ($)', 'number', false, true)}
          {txt('feesEstimate', 'Doc/other fees ($)', 'number', false, true)}
          {txt('tco5yr', '5-yr TCO ($)', 'number', false, true, 'I can fill this from an Edmunds lookup')}

          <div className="section-label">History &amp; title</div>
          {txt('ownerCount', 'Prior owners', 'number', false, true)}
          <div className="field">
            <label>
              Owner type <span className="opt">(optional)</span>
            </label>
            <select value={draft.ownerType} onChange={(e) => set('ownerType', e.target.value as Draft['ownerType'])}>
              <option value="">—</option>
              {OWNER_TYPES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          {txt('accidents', 'Accidents', 'number', false, true, '0 = none')}
          <div className="field">
            <label>Title status</label>
            <select value={draft.titleStatus} onChange={(e) => set('titleStatus', e.target.value as TitleStatus)}>
              {TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>
              Service records <span className="opt">(optional)</span>
            </label>
            <select
              value={draft.serviceRecords}
              onChange={(e) => set('serviceRecords', e.target.value as Draft['serviceRecords'])}
            >
              <option value="">—</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {txt('serviceCount', '# service records', 'number', false, true, 'count from Carfax/AutoCheck')}
          {txt('warranty', 'Warranty', 'text', false, true)}
          {txt('daysOnMarket', 'Days on market', 'number', false, true)}
          {txt('vin', 'VIN', 'text', false, true)}

          <div className="section-label">Specs</div>
          <div className="field">
            <label>Seller type</label>
            <select value={draft.sellerType} onChange={(e) => set('sellerType', e.target.value as SellerType)}>
              {SELLERS.map((sl) => (
                <option key={sl} value={sl}>
                  {sl}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>
              Drivetrain <span className="opt">(optional)</span>
            </label>
            <select value={draft.drivetrain} onChange={(e) => set('drivetrain', e.target.value as Draft['drivetrain'])}>
              <option value="">—</option>
              {DRIVES.map((dv) => (
                <option key={dv} value={dv}>
                  {dv}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>
              Fuel type <span className="opt">(optional)</span>
            </label>
            <select value={draft.fuelType} onChange={(e) => set('fuelType', e.target.value as Draft['fuelType'])}>
              <option value="">—</option>
              {FUELS.map((fu) => (
                <option key={fu} value={fu}>
                  {fu}
                </option>
              ))}
            </select>
          </div>
          {txt('engine', 'Engine', 'text', false, true)}
          {txt('extColor', 'Exterior color', 'text', false, true)}
          {txt('intColor', 'Interior', 'text', false, true)}
          {txt('dealership', 'Dealership', 'text', false, true)}
          {txt('location', 'Location', 'text', false, true)}

          <div className="section-label">Key features (Yes / No / ? unknown)</div>
          {FEATURES.map(([k, , long]) => (
            <div className="field" key={k}>
              <label>{long}</label>
              <select value={draft.feat[k] || '?'} onChange={(e) => setFeat(k, e.target.value as FeatChoice)}>
                <option value="?">?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          ))}

          <div className="section-label">Other notable features, link &amp; your take</div>
          {txt('features', 'Other notable features (comma-separated)', 'text', true, true)}
          {txt('sourceUrl', 'Listing URL', 'text', true, true)}
          {txt('image', 'Image URL', 'text', true, true, 'paste a listing image URL, or leave blank for a placeholder')}
          <div className="field">
            <label>Status</label>
            <select value={draft.status} onChange={(e) => set('status', e.target.value as Status)}>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          {txt('expertRating', 'Expert rating (0–5)', 'number', false, true, 'my take — leave as is')}
          {txt('rating', 'Your rating (0–5)', 'number', false, true)}
          <div className="field span2">
            <label>
              Notes <span className="opt">(optional)</span>
            </label>
            <textarea value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="form-foot">
          <button className="btn-mini" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={handleSave}>
            Save car
          </button>
        </div>
      </div>
    </Modal>
  );
}
