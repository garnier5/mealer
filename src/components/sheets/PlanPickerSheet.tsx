import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { fitsSlot } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

/** "Add to plan": pick the day/slot for a given recipe. */
export function PlanPickerSheet({ id }: { id: string }) {
  const { data, byId, week, assign } = useStore();
  const r = byId[id];
  if (!r) return null;

  const hint = r.moment === 'lunch' ? 'lunch only' : r.moment === 'dinner' ? 'dinner only' : 'lunch or dinner';

  return (
    <SheetFrame title="Add to plan" subtitle={`${r.name} · ${hint}`}>
      <div className="row" style={{ gap: 8 }}>
        <div style={{ width: 48 }} />
        <div className="col-head">Lunch</div>
        <div className="col-head">Dinner</div>
      </div>
      <div className="col" style={{ gap: 8 }}>
        {week.days.map((day, d) => (
          <div key={day.short} className="row" style={{ gap: 8 }}>
            <div className="col" style={{ width: 48, flexShrink: 0, alignItems: 'center' }}>
              <span className="day-short" style={{ color: c.text2 }}>
                {day.short}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: c.text }}>{day.num}</span>
            </div>
            {[0, 1].map((k) => {
              const i = d * 2 + k;
              const ok = fitsSlot(r, i);
              const cur = data.plan[i] ? byId[data.plan[i]!] : undefined;
              const isThis = cur?.id === r.id;
              const fg = isThis ? c.accentInk : cur ? c.text2 : c.accentText;
              return (
                <button
                  key={k}
                  type="button"
                  className="press row"
                  disabled={!ok}
                  onClick={() => assign(i, r)}
                  aria-label={`${day.long} ${k ? 'dinner' : 'lunch'}${cur ? ', currently ' + cur.name : ', free'}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 48,
                    padding: '0 10px',
                    borderRadius: 14,
                    gap: 6,
                    border: cur ? `1px solid ${c.line}` : `1.5px dashed ${c.dash}`,
                    backgroundColor: isThis ? c.accent : cur ? c.surface : c.emptyBg,
                    color: fg,
                    opacity: ok ? undefined : 0.35,
                  }}>
                  <Icon name={isThis ? 'check' : cur ? 'fork' : 'plus'} size={15} />
                  <span className="ellipsis" style={{ flex: 1, textAlign: 'left', fontSize: 12.5, fontWeight: 700 }}>
                    {isThis ? 'Planned here' : cur ? cur.short : 'Free'}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </SheetFrame>
  );
}
