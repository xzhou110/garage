import type { ReactElement } from 'react';
import type { Car, Settings } from '../types';
import { Card } from './Card';
import { IconCar } from './icons';

interface Props {
  /** Cars after filter + sort. */
  cars: Car[];
  /** Total count in the garage (drives the "no cars yet" vs "no matches" empty state). */
  totalCount: number;
  /** Ownership assumptions (years + miles) — drives each card's TCO. */
  settings: Settings;
  compareSet: Set<string>;
  onToggleCompare: (id: string) => void;
  onOpen: (id: string) => void;
  onSetYou: (id: string, n: number) => void;
}

function Empty({ title, msg }: { title: string; msg: string }): ReactElement {
  return (
    <div className="empty" style={{ gridColumn: '1 / -1' }}>
      <IconCar />
      <h3>{title}</h3>
      <p>{msg}</p>
    </div>
  );
}

export function Grid({ cars, totalCount, settings, compareSet, onToggleCompare, onOpen, onSetYou }: Props): ReactElement {
  if (totalCount === 0) {
    return (
      <div className="grid">
        <Empty
          title="No cars yet"
          msg="Send me a screenshot of a listing and I'll add it here — or tap “Add car” to enter one manually."
        />
      </div>
    );
  }
  if (cars.length === 0) {
    return (
      <div className="grid">
        <Empty title="No matches" msg="Nothing fits these filters. Try clearing a chip or the search box." />
      </div>
    );
  }
  return (
    <div className="grid">
      {cars.map((c) => (
        <Card
          key={c.id}
          car={c}
          settings={settings}
          inCompare={compareSet.has(c.id)}
          onToggleCompare={onToggleCompare}
          onOpen={onOpen}
          onSetYou={onSetYou}
        />
      ))}
    </div>
  );
}
