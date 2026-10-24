import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui';
import { useStore } from '@/state/store';

/** The yes/no question asked through `ask()`, drawn above everything else (sheets included). */
export function ConfirmDialog() {
  const { dialog, closeDialog } = useStore();
  const actionsRef = useRef<HTMLDivElement>(null);
  // Keep the last question rendered while the dialog fades out.
  const last = useRef(dialog);
  if (dialog) last.current = dialog;
  const d = last.current;

  useEffect(() => {
    if (!dialog) return;
    // Focus "Cancel": a stray Enter must not delete anything.
    actionsRef.current?.querySelector('button')?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, closeDialog]);

  return (
    <div className={'dialog-root' + (dialog ? ' open' : '')} inert={!dialog}>
      <div className="overlay" onClick={closeDialog} />
      {d && (
        <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby={d.body ? 'dialog-body' : undefined}>
          <h2 id="dialog-title" className="dialog-title">
            {d.title}
          </h2>
          {d.body && (
            <p id="dialog-body" className="dialog-body">
              {d.body}
            </p>
          )}
          <div ref={actionsRef} className="row" style={{ gap: 10, marginTop: 6 }}>
            <Button label="Cancel" variant="outline" height={46} onClick={closeDialog} style={{ flex: 1 }} />
            <Button
              label={d.confirm}
              variant={d.destructive ? 'warm' : 'primary'}
              height={46}
              onClick={() => {
                closeDialog();
                d.onConfirm();
              }}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
