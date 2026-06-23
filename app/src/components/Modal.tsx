import { useEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Adds the .wide variant (detail modal). */
  wide?: boolean;
  children: ReactNode;
  labelledBy?: string;
}

/**
 * Native <dialog> modal. Esc closes (the platform's default + our cancel handler), clicking the
 * backdrop closes, and showModal() traps focus inside the dialog for free. The visible card is a
 * .modal inside the dialog so the prototype's modal CSS applies unchanged.
 */
export function Modal({ open, onClose, wide, children, labelledBy }: Props): ReactElement {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    else if (!open && dlg.open) dlg.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dlg"
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault(); // Esc → route through our state so React stays in sync
        onClose();
      }}
      onClick={(e) => {
        // Backdrop click: the click target is the <dialog> itself (the .modal stops propagation visually).
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className={`modal ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </dialog>
  );
}
