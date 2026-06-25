import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { Settings } from '../types';
import { Modal } from './Modal';
import { IconClose } from './icons';

interface Props {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (patch: Partial<Settings>) => void;
  onToast: (msg: string) => void;
}

export function SettingsModal({ open, settings, onClose, onSave, onToast }: Props): ReactElement {
  const [milesStr, setMilesStr] = useState(String(settings.miles));
  const [yearsStr, setYearsStr] = useState(String(settings.years));
  const [sheetUrlStr, setSheetUrlStr] = useState(settings.sheetUrl || '');

  // Re-seed the inputs each time the modal opens.
  useEffect(() => {
    if (open) {
      setMilesStr(String(settings.miles));
      setYearsStr(String(settings.years));
      setSheetUrlStr(settings.sheetUrl || '');
    }
  }, [open, settings.miles, settings.years, settings.sheetUrl]);

  function apply() {
    onSave({ miles: Number(milesStr) || 12000, years: Number(yearsStr) || 5, sheetUrl: sheetUrlStr.trim() });
    onToast('Assumptions applied');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="settings-title">
      <div className="modal-head">
        <div>
          <div className="modal-title" id="settings-title">
            Ownership assumptions
          </div>
          <div className="modal-sub">
            Drive the total-cost-of-ownership estimate that ranks your cars — and its cost-per-year / per-mile.
          </div>
        </div>
        <button className="x" onClick={onClose} aria-label="Close">
          <IconClose />
        </button>
      </div>

      <div className="modal-body">
        <div className="set-row">
          <div className="l">
            <b>Annual miles driven</b>
            <span>How far you drive per year</span>
          </div>
          <input
            className="num"
            type="number"
            value={milesStr}
            onChange={(e) => setMilesStr(e.target.value)}
            aria-label="Annual miles driven"
          />
        </div>
        <div className="set-row">
          <div className="l">
            <b>Ownership horizon (years)</b>
            <span>How long you'll keep it — longer collapses per-year depreciation</span>
          </div>
          <input
            className="num"
            type="number"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            aria-label="Ownership horizon in years"
          />
        </div>
        <div className="set-row" style={{ display: 'block' }}>
          <div className="l" style={{ marginBottom: 8 }}>
            <b>Google Sheet sync URL</b>
            <span>
              Paste your Apps Script Web App URL to enable Export → “Sync to Google Sheet”. One-time setup — see
              the README.
            </span>
          </div>
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/…/exec"
            value={sheetUrlStr}
            onChange={(e) => setSheetUrlStr(e.target.value)}
            aria-label="Google Sheet sync URL"
            style={{ width: '100%', textAlign: 'left', fontFamily: 'var(--body)', fontWeight: 500 }}
          />
        </div>

        <div className="form-foot">
          <button className="btn btn-accent" onClick={apply}>
            Apply
          </button>
        </div>
      </div>
    </Modal>
  );
}
