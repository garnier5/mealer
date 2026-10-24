import type { ReactNode } from 'react';

import { IconButton } from '@/components/ui';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

/** Shared header + scrollable body + optional sticky footer for every bottom sheet. */
export function SheetFrame({
  eyebrow,
  title,
  subtitle,
  leading,
  footer,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const { closeSheet } = useStore();
  return (
    <>
      <div className="sheet-header">
        {leading}
        <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h2 className="sheet-title">{title}</h2>
          {subtitle && (
            <div className="ellipsis" style={{ color: c.text2, fontSize: 14, fontWeight: 700 }}>
              {subtitle}
            </div>
          )}
        </div>
        <IconButton icon="x" label="Close" onClick={closeSheet} round bg={c.surface2} color={c.text2} />
      </div>
      <div className="sheet-body">{children}</div>
      {footer && <div className="sheet-footer">{footer}</div>}
    </>
  );
}
