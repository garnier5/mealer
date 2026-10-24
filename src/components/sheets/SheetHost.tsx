import { useEffect, useRef } from 'react';

import { AccountSheet } from '@/components/sheets/AccountSheet';
import { AddRecipeSheet } from '@/components/sheets/AddRecipeSheet';
import { DetailSheet } from '@/components/sheets/DetailSheet';
import { ImportSheet } from '@/components/sheets/ImportSheet';
import { IngredientSheet, IngredientsSheet } from '@/components/sheets/IngredientsSheet';
import { PlanPickerSheet } from '@/components/sheets/PlanPickerSheet';
import { SlotSheet } from '@/components/sheets/SlotSheet';
import { useStore } from '@/state/store';
import type { Sheet } from '@/types';

/**
 * One overlay renders whichever bottom sheet is active, so going from one sheet
 * to another (detail → add to plan) just swaps the content and slides it in again.
 */
export function SheetHost() {
  const { sheet, dialog, closeSheet } = useStore();
  const root = useRef<HTMLDivElement>(null);
  const open = !!sheet;

  // Keep rendering the last sheet while the overlay fades out.
  const last = useRef<Sheet | null>(sheet);
  if (sheet) last.current = sheet;
  const shown = last.current;

  // Fit the overlay to the visible area, so the iOS keyboard pushes the sheet up instead of covering it.
  // With the keyboard up (`kb`), the sheet takes all that's left, and the field being typed in is
  // scrolled back into view: iOS doesn't do it inside a scrolling sheet that just got shorter.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = root.current;
    if (!open || !vv || !el) return;
    const reveal = () => {
      const field = document.activeElement;
      if (field instanceof HTMLElement && field.matches('input, textarea') && el.contains(field)) {
        requestAnimationFrame(() => field.scrollIntoView({ block: 'center' }));
      }
    };
    const fit = () => {
      el.style.top = vv.offsetTop + 'px';
      el.style.height = vv.height + 'px';
      el.classList.toggle('kb', window.innerHeight - vv.height > 120);
    };
    const resized = () => {
      fit();
      reveal();
    };
    fit();
    vv.addEventListener('resize', resized);
    vv.addEventListener('scroll', fit);
    // Moving from one field to the next while the keyboard is already up doesn't resize anything.
    el.addEventListener('focusin', reveal);
    return () => {
      vv.removeEventListener('resize', resized);
      vv.removeEventListener('scroll', fit);
      el.removeEventListener('focusin', reveal);
      el.classList.remove('kb');
      el.style.top = '';
      el.style.height = '';
    };
  }, [open]);

  // Escape closes the sheet, unless a confirmation dialog sits on top of it.
  useEffect(() => {
    if (!open || dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dialog, closeSheet]);

  return (
    <div ref={root} className={'sheet-root' + (open ? ' open' : '')} inert={!open}>
      <div className="overlay" onClick={closeSheet} />
      <div key={shown?.kind} className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        {shown?.kind === 'slot' && <SlotSheet slot={shown.slot} />}
        {shown?.kind === 'detail' && <DetailSheet id={shown.id} />}
        {shown?.kind === 'plan' && <PlanPickerSheet id={shown.id} />}
        {shown?.kind === 'add' && <AddRecipeSheet key={shown.id ?? 'new'} id={shown.id} />}
        {shown?.kind === 'import' && <ImportSheet />}
        {shown?.kind === 'ingredients' && <IngredientsSheet />}
        {shown?.kind === 'ingredient' && <IngredientSheet key={shown.key} ingKey={shown.key} />}
        {shown?.kind === 'account' && <AccountSheet />}
      </div>
    </div>
  );
}
