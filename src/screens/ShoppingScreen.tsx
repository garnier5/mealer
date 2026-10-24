import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { Button, Card, EmptyState, Eyebrow, Field, IconButton, ProgressBar, Screen, Title } from '@/components/ui';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

export function ShoppingScreen() {
  const { data, byId, shopping, toggleItem, removeItem, addCustom, goTo } = useStore();
  const [draft, setDraft] = useState('');

  const planned = data.plan.filter((id) => id && byId[id]).length;
  const total = shopping.length;
  const done = shopping.filter((x) => data.checked[x.key]).length;
  const submit = () => {
    addCustom(draft);
    setDraft('');
  };

  return (
    <Screen>
      <div className="col" style={{ gap: 2 }}>
        <Eyebrow>For {planned} planned meals</Eyebrow>
        <Title>Shopping</Title>
      </div>

      <Card style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: c.text }}>
            {done}
            <span style={{ fontSize: 16, fontWeight: 700, color: c.text3 }}> / {total} items</span>
          </span>
          <span className="row" style={{ height: 26, padding: '0 10px', borderRadius: 13, backgroundColor: c.warmTint, color: c.warm, fontSize: 12.5, fontWeight: 800 }}>
            {total - done} left
          </span>
        </div>
        <ProgressBar pct={total ? Math.round((done / total) * 100) : 0} height={8} />
      </Card>

      <div className="row" style={{ gap: 8 }}>
        <Field value={draft} onChangeText={setDraft} onSubmit={submit} autoCapitalize="sentences" placeholder="Add an item…" maxLength={200} aria-label="Add an item" />
        <Button label="Add" icon="plus" height={48} onClick={submit} />
      </div>

      {total === 0 ? (
        <EmptyState icon="basket" title="Your list is empty" body="Plan some meals and their ingredients appear here, or add items yourself above.">
          <Button label="Go to my week" height={44} onClick={() => goTo('week')} style={{ marginTop: 2 }} />
        </EmptyState>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          {shopping.map((it, j) => {
            const ticked = !!data.checked[it.key];
            return (
              <div key={it.key} className="row" style={{ gap: 4, paddingRight: 6, borderTop: j ? `1px solid ${c.line}` : 0 }}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={ticked}
                  className="row"
                  onClick={() => toggleItem(it.key)}
                  style={{ flex: 1, minWidth: 0, minHeight: 56, gap: 12, padding: '9px 4px 9px 14px', textAlign: 'left' }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                      borderRadius: 8,
                      border: ticked ? 0 : `2px solid ${c.dash}`,
                      backgroundColor: ticked ? c.bar : 'transparent',
                      display: 'grid',
                      placeItems: 'center',
                      color: c.accentInk,
                    }}>
                    {ticked && <Icon name="check" size={15} />}
                  </span>
                  <span className="col" style={{ flex: 1, minWidth: 0, gap: 1, opacity: ticked ? 0.45 : 1 }}>
                    <span style={{ fontSize: 15, lineHeight: '20px', fontWeight: 700, color: c.text, textDecoration: ticked ? 'line-through' : 'none' }}>
                      {it.name}
                    </span>
                    <span className="ellipsis" style={{ fontSize: 12, lineHeight: '16px', color: c.text3 }}>
                      {it.from}
                    </span>
                  </span>
                </button>
                <IconButton icon="trash" label={'Remove ' + it.name} onClick={() => removeItem(it)} />
              </div>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
