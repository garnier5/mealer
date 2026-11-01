import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Label, Segmented } from '@/components/ui';
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

const recipesWord = (n: number) => (n > 1 ? 'recipes' : 'recipe');

function Warning({ children }: { children: string }) {
  return (
    <div className="row" style={{ gap: 6, alignItems: 'flex-start', fontSize: 13, lineHeight: '18px', fontWeight: 700, color: c.warm }}>
      <span style={{ flexShrink: 0, paddingTop: 1 }}>
        <Icon name="alert" size={15} />
      </span>
      {children}
    </div>
  );
}

/** "Generate a random week": a healthy or regular week, and how many different recipes for lunch and for dinner. */
export function GenerateSheet() {
  const { data, recipes, closeSheet, generate } = useStore();
  const [variety, setVariety] = useState<[number, number]>(data.variety);
  const [healthy, setHealthy] = useState(data.healthyWeek);

  return (
    <SheetFrame
      title="Generate a week"
      footer={
        <>
          <Button label="Cancel" variant="outline" onClick={closeSheet} />
          <Button label="Generate" icon="dice" onClick={() => generate(variety, healthy)} style={{ flex: 1 }} />
        </>
      }>
      <div className="col" style={{ gap: 8 }}>
        <Label>Week</Label>
        <Segmented
          value={healthy ? 'healthy' : 'regular'}
          onChange={(k) => setHealthy(k === 'healthy')}
          options={[
            { key: 'regular', label: 'Regular' },
            { key: 'healthy', label: 'Healthy', icon: 'sprout' },
          ]}
        />
        <span style={{ fontSize: 13, lineHeight: '18px', color: c.text3 }}>
          {healthy ? 'Only healthy recipes, as long as there are enough of them.' : 'Any recipe, healthy or not.'}
        </span>
      </div>

      {(['sun', 'moon'] as const).map((ic, k) => {
        const n = variety[k];
        const meal = k ? 'dinner' : 'lunch';
        const fitting = recipes.filter((r) => fitsSlot(r, k));
        const available = fitting.length;
        const fit = Math.min(n, available);
        const wholesome = fitting.filter((r) => r.healthy).length;
        return (
          <div key={ic} className="col" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 8, justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="row" style={{ gap: 6, fontSize: 15, fontWeight: 800, color: c.text }}>
                <Icon name={ic} size={16} />
                {k ? 'Dinner' : 'Lunch'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.text2 }}>{spread(fit || n)}</span>
            </div>
            <Segmented
              options={COUNTS.map((key) => ({ key, label: key }))}
              value={String(n) as (typeof COUNTS)[number]}
              onChange={(key) => setVariety((v) => (k ? [v[0], +key] : [+key, v[1]]))}
            />
            {available < n && (
              <Warning>{available ? `Only ${available} ${recipesWord(available)} for ${meal}` : `No recipe for ${meal} yet`}</Warning>
            )}
            {healthy && available > 0 && wholesome < fit && (
              <Warning>
                {wholesome
                  ? `Only ${wholesome} healthy ${recipesWord(wholesome)} for ${meal}: ${fit - wholesome} regular ${recipesWord(fit - wholesome)} complete the week`
                  : `No healthy recipe for ${meal} yet: regular ones are used`}
              </Warning>
            )}
          </div>
        );
      })}
    </SheetFrame>
  );
}
