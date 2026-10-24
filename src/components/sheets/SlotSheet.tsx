import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, EmptyState, Field, IconButton, MomentBadge, RecipeTile } from '@/components/ui';
import { fitsSlot, mealTitle, norm, options as variantsOf, recipeTitle, slotLabel } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

/** "Choose a recipe" for one lunch/dinner slot of the week. */
export function SlotSheet({ slot }: { slot: number }) {
  const { data, byId, recipes, week, assign, clearSlot, fillSlot, setPick, openSheet } = useStore();
  const [query, setQuery] = useState('');

  const day = week.days[Math.floor(slot / 2)];
  const current = data.plan[slot] ? byId[data.plan[slot]!] : undefined;
  const pick = data.picks[slot];
  const q = norm(query);
  const fitting = recipes.filter((r) => fitsSlot(r, slot));
  const options = fitting.filter((r) => !q || norm(recipeTitle(r)).includes(q));

  return (
    <SheetFrame eyebrow="Choose a recipe" title={`${day.long} · ${slotLabel(slot)}`}>
      {current && (
        <div className="col" style={{ gap: 12, padding: '10px 10px 12px 12px', borderRadius: 18, backgroundColor: c.tint }}>
          <div className="row" style={{ gap: 10 }}>
            <RecipeTile recipe={current} size={40} iconSize={21} />
            <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: c.accentText }}>Currently planned</div>
              <div className="ellipsis" style={{ fontSize: 15, fontWeight: 800, color: c.text }}>
                {mealTitle(current, pick)}
              </div>
            </div>
            <IconButton icon="book" label="View this recipe" bg={c.surface} color={c.text2} onClick={() => openSheet({ kind: 'detail', id: current.id })} />
            <IconButton icon="trash" label="Clear this slot" bg={c.surface} color={c.warm} onClick={() => clearSlot(slot)} />
          </div>
          {/* One row of choices per ingredient that has variants: the shopping list follows. */}
          {current.ing.map((ing, j) => {
            const opts = variantsOf(ing);
            if (opts.length < 2) return null;
            const on = Math.min(pick?.[j] ?? 0, opts.length - 1);
            return (
              <div key={j} className="row" role="group" aria-label={'Variant for ' + ing[0]} style={{ flexWrap: 'wrap', gap: 6 }}>
                {opts.map((o, k) => (
                  <button
                    key={o + k}
                    type="button"
                    className="press variant"
                    aria-pressed={k === on}
                    onClick={() => setPick(slot, j, k)}>
                    {k === on && <Icon name="check" size={14} />}
                    {o}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {fitting.length === 0 ? (
        <EmptyState icon="book" title={`No recipe for ${slotLabel(slot).toLowerCase()} yet`} body="Recipes marked for this meal, or for both, show up here.">
          <Button label="Add a recipe" icon="plus" height={44} onClick={() => openSheet({ kind: 'add' })} style={{ marginTop: 2 }} />
        </EmptyState>
      ) : (
        <div className="row" style={{ gap: 8 }}>
          <label className="search-box" style={{ height: 46 }}>
            <Icon name="search" size={18} color={c.text3} />
            <Field bare value={query} onChangeText={setQuery} type="search" placeholder="Search recipes…" aria-label="Search recipes" />
          </label>
          <Button label="Surprise me" icon="dice" height={46} onClick={() => fillSlot(slot)} />
        </div>
      )}

      <div className="col" style={{ gap: 8 }}>
        {fitting.length > 0 && options.length === 0 && (
          <p style={{ padding: '20px 0', textAlign: 'center', fontSize: 14, color: c.text2 }}>No recipe matches this search.</p>
        )}
        {options.map((r) => {
          const on = current?.id === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className="press row"
              onClick={() => assign(slot, r)}
              aria-pressed={on}
              style={{
                gap: 12,
                padding: 10,
                borderRadius: 16,
                textAlign: 'left',
                border: `${on ? 1.5 : 1}px solid ${on ? c.bar : c.line}`,
                backgroundColor: on ? c.tint : c.surface,
              }}>
              <RecipeTile recipe={r} size={40} iconSize={21} />
              <div className="col" style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{recipeTitle(r)}</div>
                <MomentBadge moment={r.moment} small />
              </div>
              {on && <Icon name="check" size={20} color={c.accentText} />}
            </button>
          );
        })}
      </div>
    </SheetFrame>
  );
}
