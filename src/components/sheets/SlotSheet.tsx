import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Field, IconButton, MomentBadge, RecipeTile } from '@/components/ui';
import { fitsSlot, norm, slotLabel } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

/** "Choose a recipe" for one lunch/dinner slot of the week. */
export function SlotSheet({ slot }: { slot: number }) {
  const { data, byId, recipes, week, assign, clearSlot, fillSlot, openSheet } = useStore();
  const [query, setQuery] = useState('');

  const day = week.days[Math.floor(slot / 2)];
  const current = data.plan[slot] ? byId[data.plan[slot]!] : undefined;
  const q = norm(query);
  const options = recipes.filter((r) => fitsSlot(r, slot)).filter((r) => !q || norm(r.name).includes(q));

  return (
    <SheetFrame eyebrow="Choose a recipe" title={`${day.long} · ${slotLabel(slot)}`}>
      {current && (
        <div className="row" style={{ gap: 10, padding: '10px 10px 10px 12px', borderRadius: 18, backgroundColor: c.tint }}>
          <RecipeTile recipe={current} size={40} iconSize={21} />
          <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: c.accentText }}>Currently planned</div>
            <div className="ellipsis" style={{ fontSize: 15, fontWeight: 800, color: c.text }}>
              {current.name}
            </div>
          </div>
          <IconButton icon="book" label="View this recipe" bg={c.surface} color={c.text2} onClick={() => openSheet({ kind: 'detail', id: current.id })} />
          <IconButton icon="trash" label="Clear this slot" bg={c.surface} color={c.warm} onClick={() => clearSlot(slot)} />
        </div>
      )}

      <div className="row" style={{ gap: 8 }}>
        <label className="search-box" style={{ height: 46 }}>
          <Icon name="search" size={18} color={c.text3} />
          <Field bare value={query} onChangeText={setQuery} type="search" placeholder="Search recipes…" aria-label="Search recipes" />
        </label>
        <Button label="Surprise me" icon="dice" height={46} onClick={() => fillSlot(slot)} />
      </div>

      <div className="col" style={{ gap: 8 }}>
        {options.length === 0 && <p style={{ padding: '20px 0', textAlign: 'center', fontSize: 14, color: c.text2 }}>No recipe matches this search.</p>}
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
                <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{r.name}</div>
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
