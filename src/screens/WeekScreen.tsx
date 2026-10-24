import { Icon } from '@/components/Icon';
import { Button, Eyebrow, IconButton, ProgressBar, RecipeTile, Screen, Title } from '@/components/ui';
import { SLOT_COUNT } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

export function WeekScreen() {
  const { dark, data, byId, week, cloud, toggleTheme, clearWeek, generate, openSheet, ask } = useStore();
  const online = cloud.status === 'synced' || cloud.status === 'syncing';
  const planned = data.plan.filter((id) => id && byId[id]).length;

  const confirmClear = () =>
    ask({ title: 'Clear the week?', body: 'All planned meals will be removed.', confirm: 'Clear', destructive: true, onConfirm: clearWeek });

  return (
    <Screen>
      <div className="row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div className="col" style={{ gap: 2 }}>
          <Eyebrow>Mealer</Eyebrow>
          <Title>My week</Title>
        </div>
        <div className="row" style={{ gap: 8, paddingTop: 4 }}>
          <IconButton
            icon={online ? 'cloud' : 'cloudOff'}
            label="Account"
            onClick={() => openSheet({ kind: 'account' })}
            size={44}
            round
            bordered
            bg={online ? c.tint : c.surface}
            color={online ? c.accentText : c.text2}
          />
          <IconButton icon={dark ? 'sun' : 'moon'} label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme} size={44} round bordered bg={c.surface} color={c.text2} />
          <IconButton icon="trash" label="Clear the week" onClick={confirmClear} size={44} round bordered bg={c.surface} color={c.text2} />
        </div>
      </div>

      <div className="col" style={{ gap: 8 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: c.text2 }}>{week.range}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: c.text }}>
            {planned}
            <span style={{ fontWeight: 600, color: c.text3 }}> / {SLOT_COUNT} meals planned</span>
          </span>
        </div>
        <ProgressBar pct={Math.round((planned / SLOT_COUNT) * 100)} />
      </div>

      <Button label="Generate a random week" icon="dice" height={54} onClick={generate} style={{ borderRadius: 18 }} />

      <div className="col" style={{ gap: 6 }}>
        <div className="week-row">
          <div style={{ width: 48, flexShrink: 0 }} />
          {(['sun', 'moon'] as const).map((ic, k) => (
            <div key={ic} className="col-head">
              <Icon name={ic} size={15} />
              {k ? 'Dinner' : 'Lunch'}
            </div>
          ))}
        </div>

        {week.days.map((day, d) => (
          <div key={day.short} className="week-row">
            <div className={'day-cell' + (d === week.todayIdx ? ' today' : '')}>
              <span className="day-short">{day.short}</span>
              <span className="day-num">{day.num}</span>
            </div>
            {[0, 1].map((k) => {
              const slot = d * 2 + k;
              const id = data.plan[slot];
              const r = id ? byId[id] : undefined;
              const meal = k ? 'dinner' : 'lunch';
              return r ? (
                <button
                  key={k}
                  type="button"
                  className="press slot slot-filled"
                  onClick={() => openSheet({ kind: 'slot', slot })}
                  aria-label={`Change ${r.name}, ${day.long} ${meal}`}>
                  <RecipeTile recipe={r} size={30} iconSize={17} />
                  <span className="clamp2" style={{ flex: 1, fontSize: 12.5, lineHeight: '15px', fontWeight: 700, color: c.text }}>
                    {r.name}
                  </span>
                </button>
              ) : (
                <button
                  key={k}
                  type="button"
                  className="press slot slot-empty"
                  onClick={() => openSheet({ kind: 'slot', slot })}
                  aria-label={`Choose a recipe for ${day.long} ${meal}`}>
                  <Icon name="plus" size={17} />
                  To plan
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Screen>
  );
}
