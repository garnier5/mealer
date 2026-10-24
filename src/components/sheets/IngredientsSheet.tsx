import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Card, Field, IconButton, Label } from '@/components/ui';
import { ingredientKey, options, recipeTitle } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

const recipesLabel = (n: number) => (n ? `${n} ${n === 1 ? 'recipe' : 'recipes'}` : 'Unused');

/** The shared ingredient list: search it, add to it, open one to rename, merge or delete it. */
export function IngredientsSheet() {
  const { ingredientList, usedIn, addIngredient, openSheet } = useStore();
  const [query, setQuery] = useState('');

  const q = ingredientKey(query);
  const list = q ? ingredientList.filter((x) => x.key.includes(q)) : ingredientList;
  const known = ingredientList.some((x) => x.key === q);
  const add = () => {
    if (!q || known) return;
    addIngredient(query);
    setQuery('');
  };

  return (
    <SheetFrame title="Ingredients" subtitle={`${ingredientList.length} in the list, shared by every recipe`}>
      <div className="row" style={{ gap: 8 }}>
        <label className="search-box" style={{ height: 46 }}>
          <Icon name="search" size={18} color={c.text3} />
          <Field bare value={query} onChangeText={setQuery} onSubmit={add} placeholder="Search or add…" maxLength={200} aria-label="Search or add an ingredient" />
        </label>
        <Button label="Add" icon="plus" height={46} onClick={add} disabled={!q || known} />
      </div>

      {list.length === 0 && (
        <p style={{ padding: '20px 0', textAlign: 'center', fontSize: 14, lineHeight: '20px', color: c.text2 }}>
          {q ? 'Not in the list yet: “Add” puts it there.' : 'No ingredients yet. They show up here as you add recipes.'}
        </p>
      )}

      {list.length > 0 && (
        <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
          {list.map((x, j) => (
            <button
              key={x.key}
              type="button"
              className="press row"
              onClick={() => openSheet({ kind: 'ingredient', key: x.key })}
              style={{ width: '100%', gap: 10, minHeight: 50, padding: '8px 14px', textAlign: 'left', borderTop: j ? `1px solid ${c.line}` : 0 }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: c.text, overflowWrap: 'anywhere' }}>{x.name}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: c.text3 }}>{recipesLabel(usedIn(x.key).length)}</span>
              <Icon name="edit" size={16} color={c.text3} />
            </button>
          ))}
        </Card>
      )}
    </SheetFrame>
  );
}

/** One ingredient of the list: rename it everywhere (merging into another if the name is taken), or delete it. */
export function IngredientSheet({ ingKey }: { ingKey: string }) {
  const { data, usedIn, renameIngredient, deleteIngredient, openSheet, ask } = useStore();
  const name = data.ingredients[ingKey] ?? '';
  const [value, setValue] = useState(name);
  if (!name) return null;

  const using = usedIn(ingKey);
  const newKey = ingredientKey(value);
  const target = newKey && newKey !== ingKey ? data.ingredients[newKey] : undefined;
  const changed = !!newKey && value.trim() !== name;
  // A recipe without a title whose only ingredient this is would be left with nothing at all.
  const blocking = using.filter((r) => !r.name && r.ing.every((i) => options(i).every((n) => ingredientKey(n) === ingKey)));
  const back = () => openSheet({ kind: 'ingredients' });

  const save = () => {
    if (!changed) return back();
    if (!target) {
      renameIngredient(ingKey, value);
      return back();
    }
    ask({
      title: `Merge into “${target}”?`,
      body: `“${name}” becomes “${target}” in every recipe, and leaves the list.`,
      confirm: 'Merge',
      onConfirm: () => {
        renameIngredient(ingKey, target);
        back();
      },
    });
  };
  const confirmDelete = () =>
    ask({
      title: `Delete “${name}”?`,
      body: using.length
        ? `It's removed from ${recipesLabel(using.length).toLowerCase()}. Where it has a variant, the variant takes its place.`
        : undefined,
      confirm: 'Delete',
      destructive: true,
      onConfirm: () => {
        deleteIngredient(ingKey);
        back();
      },
    });

  return (
    <SheetFrame
      eyebrow="Ingredient"
      title={name}
      footer={
        <>
          <IconButton icon="trash" label={'Delete ' + name} onClick={confirmDelete} size={52} bordered color={c.warm} disabled={blocking.length > 0} />
          <Button label="Back" variant="outline" onClick={back} />
          <Button label={target ? 'Merge' : 'Save'} onClick={save} disabled={!changed} style={{ flex: 1 }} />
        </>
      }>
      <label className="col" style={{ gap: 6 }}>
        <Label>Name</Label>
        <Field value={value} onChangeText={setValue} onSubmit={save} autoCapitalize="sentences" maxLength={200} style={{ fontWeight: 600 }} />
        <span style={{ fontSize: 13, lineHeight: '18px', color: target ? c.warm : c.text3 }}>
          {target ? `“${target}” is already in the list: saving merges the two.` : 'A new name applies to every recipe that uses it.'}
        </span>
      </label>

      <div className="col" style={{ gap: 8 }}>
        <Label>Used in</Label>
        {using.length === 0 ? (
          <p style={{ fontSize: 14, color: c.text2 }}>No recipe uses it yet.</p>
        ) : (
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {using.map((r, j) => (
              <button
                key={r.id}
                type="button"
                className="press row"
                onClick={() => openSheet({ kind: 'detail', id: r.id })}
                style={{ width: '100%', gap: 10, minHeight: 48, padding: '8px 14px', textAlign: 'left', borderTop: j ? `1px solid ${c.line}` : 0 }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: c.text }}>{recipeTitle(r)}</span>
                <Icon name="book" size={16} color={c.text3} />
              </button>
            ))}
          </Card>
        )}
        {blocking.length > 0 && (
          <p style={{ fontSize: 13, lineHeight: '18px', color: c.warm }}>
            It can't be deleted: it's all there is in “{recipeTitle(blocking[0])}”. Give that recipe a title or another ingredient first.
          </p>
        )}
      </div>
    </SheetFrame>
  );
}
