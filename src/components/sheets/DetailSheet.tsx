import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Card, IconButton, MomentBadge, RecipeTile } from '@/components/ui';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

export function DetailSheet({ id }: { id: string }) {
  const { data, byId, week, openSheet, confirmDeleteRecipe } = useStore();
  const r = byId[id];
  if (!r) return null;

  const where = data.plan.flatMap((pid, i) => (pid === r.id ? [`${week.days[Math.floor(i / 2)].short} ${i % 2 ? 'dinner' : 'lunch'}`] : []));

  return (
    <SheetFrame
      title={r.name}
      leading={<RecipeTile recipe={r} size={60} iconSize={30} />}
      footer={
        <>
          <IconButton icon="trash" label="Delete this recipe" onClick={() => confirmDeleteRecipe(r)} size={52} bordered color={c.warm} />
          <IconButton icon="edit" label="Edit this recipe" onClick={() => openSheet({ kind: 'add', id: r.id })} size={52} bordered color={c.text2} />
          <Button label="Add to plan" icon="calPlus" onClick={() => openSheet({ kind: 'plan', id: r.id })} style={{ flex: 1 }} />
        </>
      }>
      <MomentBadge moment={r.moment} />
      <p style={{ fontSize: 15, lineHeight: '22px', color: c.text2 }}>{r.desc}</p>

      {where.length > 0 && (
        <div className="row" style={{ gap: 8, padding: '10px 12px', borderRadius: 14, backgroundColor: c.tint, color: c.accentText }}>
          <Icon name="calendar" size={17} />
          <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>Planned for {where.join(', ')}</div>
        </div>
      )}

      <div className="col" style={{ gap: 8 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Ingredients</h3>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: c.text3 }}>{r.ing.length} ingredients</span>
        </div>
        <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
          {r.ing.map(([name], j) => (
            <div key={name + j} className="row" style={{ gap: 12, minHeight: 46, padding: '8px 14px', borderTop: j ? `1px solid ${c.line}` : 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, flexShrink: 0, backgroundColor: c.bar }} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: c.text }}>{name}</span>
            </div>
          ))}
        </Card>
      </div>
    </SheetFrame>
  );
}
