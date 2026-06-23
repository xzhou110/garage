import type { ReactElement } from 'react';
import { IconStar } from './icons';

interface Props {
  label: 'Expert' | 'You';
  value: number;
  /** Accent the row in indigo (Expert) vs amber (You). */
  variant: 'r-exp' | 'r-you';
  /** When provided, the stars become a clickable 0–5 setter (clicking the lit star clears to 0). */
  onSet?: (n: number) => void;
}

/** Dual-rating row: ★ ★ ★ ★ ★ + numeric. Inline-editable when onSet is passed (used for "You"). */
export function RatingStars({ label, value, variant, onSet }: Props): ReactElement {
  const v = value || 0;
  const editable = !!onSet;
  return (
    <div className={`rrow ${variant}`}>
      <span className="rlabel">{label}</span>
      <div
        className="rating"
        role={editable ? 'group' : undefined}
        aria-label={editable ? `${label} rating` : undefined}
      >
        {[1, 2, 3, 4, 5].map((i) =>
          editable ? (
            <button
              key={i}
              type="button"
              className={`star-btn ${i <= v ? 'on' : ''}`}
              aria-label={`Set ${label} rating to ${i}`}
              aria-pressed={i <= v}
              onClick={(e) => {
                e.stopPropagation();
                onSet?.(i === v ? 0 : i);
              }}
            >
              <IconStar />
            </button>
          ) : (
            <IconStar key={i} className={i <= v ? 'on' : ''} />
          ),
        )}
      </div>
      {v ? (
        <span className="rnum num">{v}</span>
      ) : (
        <span className="rnum" style={{ color: 'var(--ink-3)', fontWeight: 500 }}>
          —
        </span>
      )}
    </div>
  );
}
