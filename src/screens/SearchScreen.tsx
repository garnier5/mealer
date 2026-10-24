import { useMemo, useState } from 'react';

import { Icon } from '@/components/Icon';
import { Button, Card, Chip, EmptyState, Eyebrow, Field, MomentBadge, RecipeTile, Screen, Title } from '@/components/ui';
import { SEARCH_SUGGESTIONS } from '@/data/recipes';
import { norm } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

export function SearchScreen() {
  const { data, recipes, addTag, removeTag, openSheet } = useStore();
  const [draft, setDraft] = useState('');
  const tags = data.tags;
  const ntags = tags.map(norm);

  const results = useMemo(() => {
    const wanted = tags.map(norm);
    const has = (name: string) => wanted.some((tg) => tg && norm(name).includes(tg));
    return recipes
      .map((r) => {
        const names = r.ing.map(([n]) => n);
        const hit = names.map(has);
        const m = hit.filter(Boolean).length;
        const missing = names.filter((_, j) => !hit[j]);
        return { r, hit, m, n: names.length, ratio: m / names.length, missing };
      })
      .filter((x) => x.m > 0)
      .sort((a, b) => b.m - a.m || b.ratio - a.ratio);
  }, [recipes, tags]);

  const suggestions = SEARCH_SUGGESTIONS.filter((x) => !ntags.includes(norm(x))).slice(0, 5);
  const submit = () => {
    addTag(draft);
    setDraft('');
  };

  return (
    <Screen>
      <div className="col" style={{ gap: 2 }}>
        <Eyebrow>Search</Eyebrow>
        <Title size={28}>Find recipes by ingredient</Title>
      </div>

      <Card style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${c.line}` }}>
        {tags.length > 0 && (
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            {tags.map((tag, j) => (
              <Chip key={tag} label={tag} onRemove={() => removeTag(j)} />
            ))}
          </div>
        )}
        <div
          className="row"
          style={{ gap: 8, borderTop: tags.length ? `1px solid ${c.line}` : 0, paddingTop: tags.length ? 10 : 0, color: c.text3 }}>
          <Icon name="search" size={20} />
          <Field
            bare
            value={draft}
            onChangeText={setDraft}
            onSubmit={submit}
            autoCapitalize="none"
            placeholder="Add an ingredient…"
            aria-label="Add an ingredient"
            style={{ height: 40 }}
          />
          <Button icon="plus" height={40} ariaLabel="Add ingredient" onClick={submit} />
        </div>
      </Card>

      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: c.text3, marginRight: 2 }}>Suggestions</span>
        {suggestions.map((x) => (
          <button key={x} type="button" className="press suggestion" onClick={() => addTag(x)}>
            <Icon name="plus" size={13} />
            {x}
          </button>
        ))}
      </div>

      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: c.text }}>
          {results.length} {results.length === 1 ? 'possible recipe' : 'possible recipes'}
        </h2>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: c.text3 }}>Best match first</span>
      </div>

      {results.length === 0 && (
        <EmptyState
          icon="bowl"
          title={tags.length ? 'No recipe with these ingredients' : 'Empty fridge?'}
          body="Add one or more ingredients to see matching recipes."
        />
      )}

      {results.map(({ r, hit, m, n, missing }) => (
        <Card key={r.id} style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="row" style={{ gap: 12 }}>
            <RecipeTile recipe={r} />
            <div className="col" style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <div style={{ fontSize: 16, lineHeight: '20px', fontWeight: 800, color: c.text }}>{r.name}</div>
              <MomentBadge moment={r.moment} />
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: m === n ? c.accentText : c.text }}>
              {m}
              <span style={{ fontSize: 15, fontWeight: 700, color: c.text3 }}>/{n}</span>
            </span>
          </div>
          <div className="col" style={{ gap: 7 }}>
            <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
              <div className="row" style={{ gap: 4 }}>
                {hit.map((h, j) => (
                  <span key={j} style={{ width: 22, height: 8, borderRadius: 4, backgroundColor: h ? c.bar : c.surface2 }} />
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: c.text2 }}>
                {m}/{n} ingredients
              </span>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: '17px', color: c.text3 }}>
              {missing.length ? 'Also uses: ' + missing.map((x) => x.toLowerCase()).join(', ') : 'Matches all its ingredients'}
            </p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Button label="View recipe" icon="book" variant="outline" height={42} onClick={() => openSheet({ kind: 'detail', id: r.id })} style={{ flex: 1 }} />
            <Button label="Add to plan" icon="calPlus" height={42} onClick={() => openSheet({ kind: 'plan', id: r.id })} style={{ flex: 1 }} />
          </div>
        </Card>
      ))}
    </Screen>
  );
}
