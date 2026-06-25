// Public surface of the vendored TCO module. Garage code imports from here.
export type { Assumptions, TcoResult, ByCategory, CategoryKey, Vehicle, SegmentKey, Powertrain, Condition } from './types';
export { computeTco, seedResaleValue, vehicleAgeNow } from './engine';
export { estimateResale, retentionAt, depFactorFromRate } from './depreciation';
export { REFERENCE } from './reference';
export {
  estimateTco,
  carToVehicle,
  garageAssumptions,
  inferSegment,
  inferPowertrain,
  inferCondition,
  GARAGE_REGION,
  GARAGE_TCO_NOTE,
} from './resolve';
