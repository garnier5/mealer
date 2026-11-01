import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Segmented } from '@/components/ui';
import { fitsSlot } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

const COUNTS = ['1', '2', '3', '4', '5', '6', '7'] as const;

/** How the week's days fall for `n` recipes: "Each one 2–3 days in a row". */
function spread(n: number) {
  if (n === 7) return 'A different recipe every day';
  if (n === 1) return 'The same recipe all week';
  const lo = Math.floor(7 / n);
  const hi = Math.ceil(7 / n);
  return `Each one ${lo === hi ? lo : `${lo}–${hi}`} days in a row`;
}

/** "Generate a random week": how many different recipes for lunch and for dinner. */
export function GenerateSheet() {
  const { data, recipes, closeSheet, generate } = useStore();
  const [variety, setVariety] = useState<[number, number]>(data.variety);

  return (
    <SheetFrame
      title="Generate a week"
      subtitle="Different recipes per meal"
      footer={
        <>
          <Button label="Cancel" variant="outline" onClick={closeSheet} />
          <Button label="Generate" icon="dice" onClick={() => generate(variety)} style={{ flex: 1 }} />
        </>
      }>
      {(['sun', 'moon'] as const).map((ic, k) => {
        const n = variety[k];
        const available = recipes.filter((r) => fitsSlot(r, k)).length;
        return (
          <div key={ic} className="col" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 8, justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="row" style={{ gap: 6, fontSize: 15, fontWeight: 800, color: c.text }}>
                <Icon name={ic} size={16} />
                {k ? 'Dinner' : 'Lunch'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.text2 }}>{spread(Math.min(n, available) || n)}</span>
            </div>
            <Segmented
              options={COUNTS.map((key) => ({ key, label: key }))}
              value={String(n) as (typeof COUNTS)[number]}
              onChange={(key) => setVariety((v) => (k ? [v[0], +key] : [+key, v[1]]))}
            />
            {available < n && (
              <div className="row" style={{ gap: 6, fontSize: 13, fontWeight: 700, color: c.warm }}>
                <Icon name="alert" size={15} />
                {available ? `Only ${available} ${available > 1 ? 'recipes fit' : 'recipe fits'} ${k ? 'dinner' : 'lunch'}` : `No recipe for ${k ? 'dinner' : 'lunch'} yet`}
              </div>
            )}
          </div>
        );
      })}
    </SheetFrame>
  );
}
