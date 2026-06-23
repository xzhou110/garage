import { useState } from 'react';
import type { ReactElement } from 'react';
import { FEATURES } from '../data/features';
import type { Filters as FilterState, SellerFilter, SortKey } from '../state/useGarage';
import { IconClose, IconFilter, IconSearch } from './icons';

interface Props {
  filters: FilterState;
  activeFilterCount: number;
  shownCount: number;
  totalCount: number;
  compareCount: number;
  view: 'grid' | 'compare';
  setFilters: (patch: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleReqFeature: (k: (typeof FEATURES)[number][0]) => void;
  onClearCompare: () => void;
}

const SELLER_CHIPS: { value: SellerFilter; label: string }[] = [
  { value: 'all', label: 'All sellers' },
  { value: 'Dealer', label: 'Dealer' },
  { value: 'CPO', label: 'CPO' },
  { value: 'Private', label: 'Private' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'added', label: 'Sort: Recently added' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'otd-asc', label: 'Out-the-door: Low → High' },
  { value: 'miles-asc', label: 'Mileage: Low → High' },
  { value: 'year-desc', label: 'Year: Newest first' },
  { value: 'feat-desc', label: 'Key features: Most' },
  { value: 'tco-asc', label: '5-yr TCO: Low → High' },
  { value: 'expert-desc', label: 'Expert rating: High → Low' },
  { value: 'you-desc', label: 'Your rating: High → Low' },
  { value: 'dom-desc', label: 'Days listed: Most (leverage)' },
];

const STAR_OPTS = [0, 1, 2, 3, 4, 5];

export function Filters({
  filters,
  activeFilterCount,
  shownCount,
  totalCount,
  compareCount,
  view,
  setFilters,
  resetFilters,
  toggleReqFeature,
  onClearCompare,
}: Props): ReactElement {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <div className="controls">
        <div className="search">
          <IconSearch />
          <input
            type="text"
            placeholder="Search make, model, dealer…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            aria-label="Search cars"
          />
        </div>

        <div className="select-wrap">
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ sort: e.target.value as SortKey })}
            aria-label="Sort cars"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`btn-mini ${panelOpen ? 'on' : ''}`}
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
        >
          <IconFilter />
          Filters
          {activeFilterCount > 0 && <span className="fcount">{activeFilterCount}</span>}
        </button>

        <div className="chips">
          {SELLER_CHIPS.map((s) => (
            <button
              key={s.value}
              className={`chip ${filters.seller === s.value ? 'on' : ''}`}
              onClick={() => setFilters({ seller: s.value })}
            >
              {s.label}
            </button>
          ))}
          <button
            className={`chip ${filters.cleanOnly ? 'on' : ''}`}
            onClick={() => setFilters({ cleanOnly: !filters.cleanOnly })}
          >
            Clean title only
          </button>
          <button
            className={`chip ${filters.noAccident ? 'on' : ''}`}
            onClick={() => setFilters({ noAccident: !filters.noAccident })}
          >
            No accidents
          </button>
          <button
            className={`chip ${filters.hideRejected ? 'on' : ''}`}
            onClick={() => setFilters({ hideRejected: !filters.hideRejected })}
          >
            Hide rejected
          </button>
          <button
            className={`chip ${filters.showSold ? 'on' : ''}`}
            onClick={() => setFilters({ showSold: !filters.showSold })}
          >
            {filters.showSold ? 'Hide sold' : 'Show sold'}
          </button>
        </div>

        <div className="controls-right">
          {compareCount > 0 && (
            <button className="btn-mini" onClick={onClearCompare}>
              <IconClose />
              Clear compare
            </button>
          )}
        </div>
      </div>

      {panelOpen && (
        <div className="filter-panel">
          <div className="fp-inner">
            <div className="fp-row">
              <label className="fp-field">
                Max price ($)
                <input
                  type="number"
                  placeholder="any"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => setFilters({ maxPrice: e.target.value === '' ? null : Number(e.target.value) })}
                />
              </label>
              <label className="fp-field">
                Max mileage
                <input
                  type="number"
                  placeholder="any"
                  value={filters.maxMileage ?? ''}
                  onChange={(e) => setFilters({ maxMileage: e.target.value === '' ? null : Number(e.target.value) })}
                />
              </label>
              <label className="fp-field">
                Min expert ★
                <select
                  value={filters.minExpert}
                  onChange={(e) => setFilters({ minExpert: Number(e.target.value) })}
                >
                  {STAR_OPTS.map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? 'any' : n === 5 ? '5' : `${n}+`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="fp-field">
                Min your ★
                <select value={filters.minYou} onChange={(e) => setFilters({ minYou: Number(e.target.value) })}>
                  {STAR_OPTS.map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? 'any' : n === 5 ? '5' : `${n}+`}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="fp-feats">
              <span className="fp-label">Must have</span>
              <div className="chips">
                {FEATURES.map(([k, short]) => (
                  <button
                    key={k}
                    className={`chip fchip ${filters.reqFeatures.includes(k) ? 'on' : ''}`}
                    onClick={() => toggleReqFeature(k)}
                  >
                    {short}
                  </button>
                ))}
              </div>
            </div>

            <div className="fp-foot">
              <button className="btn-mini" onClick={resetFilters}>
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="result-line">
        {view === 'grid'
          ? `${shownCount} of ${totalCount} car${totalCount !== 1 ? 's' : ''} shown`
          : `${compareCount} selected for comparison`}
      </div>
    </>
  );
}
