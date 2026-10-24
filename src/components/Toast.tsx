import { useRef } from 'react';

import { Icon } from '@/components/Icon';
import { useStore } from '@/state/store';

/** Floating confirmation shown above the tab bar, or at the top while a sheet covers the bottom. */
export function Toast() {
  const { toastMsg, sheet } = useStore();
  // Keep the last message on screen while it fades out.
  const last = useRef(toastMsg);
  if (toastMsg) last.current = toastMsg;

  return (
    <div className={'toast-wrap' + (sheet ? ' top' : '') + (toastMsg ? ' show' : '')} role="status" aria-live="polite">
      {last.current && (
        <div className="toast">
          <Icon name="check" size={18} />
          {last.current}
        </div>
      )}
    </div>
  );
}
