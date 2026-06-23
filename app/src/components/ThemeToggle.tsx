import type { ReactElement } from 'react';
import { IconMoon, IconSun } from './icons';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

/** Header button that flips light/dark (the hook persists garage.theme + sets data-theme). */
export function ThemeToggle({ theme, onToggle }: Props): ReactElement {
  const dark = theme === 'dark';
  return (
    <button
      className="btn btn-ghost theme-toggle"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
