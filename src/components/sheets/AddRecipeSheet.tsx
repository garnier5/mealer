import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Card, Chip, Field, IconButton, Label, Segmented, TextArea } from '@/components/ui';
import { RECIPE_ICONS } from '@/data/recipes';
import { iconTint, makeRecipe, MAX_VARIANTS, options, recipeTitle, toIngredient } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';
import type { IconKey, Ingredient, Moment } from '@/types';

/** New recipe, or editing an existing one when `id` is given. */
export function AddRecipeSheet({ id }: { id?: string }) {
  const { tints, byId, addRecipes, updateRecipe, openSheet, closeSheet, goTo, toast } = useStore();
  const editing = id ? byId[id] : undefined;
  const [title, setTitle] = useState(editing?.name ?? '');
  const [desc, setDesc] = useState(editing?.desc ?? '');
  // One list per ingredient: its name, then its variants.
  const [ings, setIngs] = useState<string[][]>(editing?.ing.map(options) ?? []);
  const [draft, setDraft] = useState('');
  const [variantFor, setVariantFor] = useState<number | null>(null);
  const [variantDraft, setVariantDraft] = useState('');
  const [moment, setMoment] = useState<Moment>(editing?.moment ?? 'both');
  const [icon, setIcon] = useState<IconKey>(editing?.icon ?? 'fork');

  const canSave = title.trim().length > 0 || ings.length > 0;
  const pushIng = () => {
    const v = draft.trim();
    if (!v) return;
    setIngs((l) => l.concat([[v]]));
    setDraft('');
  };
  const removeIng = (j: number) => {
    setIngs((l) => l.filter((_, k) => k !== j));
    setVariantFor(null);
  };
  const startVariant = (j: number) => {
    setVariantFor(j);
    setVariantDraft('');
  };
  const pushVariant = () => {
    const v = variantDraft.trim();
    if (v && variantFor !== null) setIngs((l) => l.map((g, k) => (k === variantFor ? g.concat(v) : g)));
    setVariantFor(null);
  };
  /** Swaps ingredient `j` with its neighbour (`by` = -1 up, 1 down); a recipe without a title is named in this order. */
  const moveIng = (j: number, by: -1 | 1) => {
    setIngs((l) => {
      const next = l.slice();
      [next[j], next[j + by]] = [next[j + by], next[j]];
      return next;
    });
    setVariantFor(null);
  };
  const removeVariant = (j: number, k: number) => setIngs((l) => l.map((g, x) => (x === j ? g.filter((_, y) => y !== k) : g)));

  const save = () => {
    if (editing) {
      const name = title.trim();
      updateRecipe({
        ...editing,
        name,
        short: name === editing.name ? editing.short : name,
        desc: desc.trim(),
        moment,
        icon,
        tint: icon === editing.icon ? editing.tint : iconTint(icon),
        // Keep quantities of ingredients that are still there.
        ing: ings.map((g) => {
          const old = editing.ing.find(([n]) => n === g[0]);
          const next = toIngredient(g);
          return old ? ([old[0], old[1], old[2], ...next.slice(3)] as Ingredient) : next;
        }),
      });
      openSheet({ kind: 'detail', id: editing.id });
      toast('Recipe updated');
      return;
    }
    addRecipes([makeRecipe(title.trim(), desc.trim(), ings, moment, 0, icon)]);
    closeSheet();
    goTo('recipes');
    toast('Recipe added');
  };
  const cancel = () => (editing ? openSheet({ kind: 'detail', id: editing.id }) : closeSheet());

  return (
    <SheetFrame
      title={editing ? 'Edit recipe' : 'New recipe'}
      footer={
        <>
          <Button label="Cancel" variant="outline" onClick={cancel} />
          <Button label={editing ? 'Save changes' : 'Save recipe'} onClick={save} disabled={!canSave} style={{ flex: 1 }} />
        </>
      }>
      <label className="col" style={{ gap: 6 }}>
        <Label>Title (optional)</Label>
        <Field value={title} onChangeText={setTitle} autoCapitalize="sentences" placeholder="e.g. Zucchini gratin" maxLength={200} style={{ fontWeight: 600 }} />
        {!title.trim() && ings.length > 0 && (
          <span style={{ fontSize: 13, lineHeight: '18px', color: c.text3 }}>
            Without a title it's called “{recipeTitle({ name: '', ing: ings.map(toIngredient) })}”.
          </span>
        )}
      </label>

      <div className="col" style={{ gap: 8 }}>
        <Label>Ingredients</Label>
        <div className="row" style={{ gap: 8 }}>
          <Field value={draft} onChangeText={setDraft} onSubmit={pushIng} placeholder="Add an ingredient" maxLength={200} aria-label="Add an ingredient" />
          <Button label="Add" variant="tint" height={48} onClick={pushIng} />
        </div>
        {ings.length > 0 && (
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {ings.map((g, j) => (
              <div key={j} className="col" style={{ gap: 8, padding: '8px 6px 8px 14px', borderTop: j ? `1px solid ${c.line}` : 0 }}>
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: c.text, overflowWrap: 'anywhere' }}>{g[0]}</span>
                  {g.length <= MAX_VARIANTS && variantFor !== j && (
                    <button type="button" className="press suggestion" onClick={() => startVariant(j)} aria-label={'Add a variant for ' + g[0]}>
                      <Icon name="plus" size={13} />
                      or…
                    </button>
                  )}
                  {ings.length > 1 && (
                    <div className="row">
                      <IconButton icon="up" label={'Move ' + g[0] + ' up'} onClick={() => moveIng(j, -1)} size={32} disabled={j === 0} />
                      <IconButton icon="down" label={'Move ' + g[0] + ' down'} onClick={() => moveIng(j, 1)} size={32} disabled={j === ings.length - 1} />
                    </div>
                  )}
                  <IconButton icon="x" label={'Remove ' + g[0]} onClick={() => removeIng(j)} size={32} />
                </div>
                {g.length > 1 && (
                  <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                    {g.slice(1).map((v, k) => (
                      <Chip key={v + k} label={'or ' + v} onRemove={() => removeVariant(j, k + 1)} />
                    ))}
                  </div>
                )}
                {variantFor === j && (
                  <div className="row" style={{ gap: 8, paddingRight: 8 }}>
                    <Field
                      autoFocus
                      value={variantDraft}
                      onChangeText={setVariantDraft}
                      onSubmit={pushVariant}
                      placeholder={`Instead of ${g[0].toLowerCase()}…`}
                      maxLength={200}
                      aria-label={'Variant for ' + g[0]}
                      style={{ height: 44 }}
                    />
                    <Button label="Add" variant="tint" height={44} onClick={pushVariant} />
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
        <span style={{ fontSize: 13, lineHeight: '18px', color: c.text3 }}>
          “or…” adds a variant, like rice instead of pasta: you pick one each time the recipe is planned.
        </span>
      </div>

      <div className="col" style={{ gap: 8 }}>
        <Label>Meal</Label>
        <Segmented
          value={moment}
          onChange={setMoment}
          options={[
            { key: 'lunch', label: 'Lunch', icon: 'sun' },
            { key: 'dinner', label: 'Dinner', icon: 'moon' },
            { key: 'both', label: 'Both', icon: 'half' },
          ]}
        />
      </div>

      <div className="col" style={{ gap: 8 }}>
        <Label>Icon</Label>
        <div className="row" style={{ gap: 6 }}>
          {RECIPE_ICONS.map(([key, label, tint]) => {
            const on = key === icon;
            const [bg, fg] = tints[tint];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                aria-label={label}
                aria-pressed={on}
                title={label}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 40,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  border: on ? `2px solid ${fg}` : `1px solid ${c.line}`,
                  backgroundColor: on ? bg : c.surface,
                  color: on ? fg : c.text3,
                }}>
                <Icon name={key} size={20} />
              </button>
            );
          })}
        </div>
      </div>

      <label className="col" style={{ gap: 6 }}>
        <Label>Description (optional)</Label>
        <TextArea value={desc} onChangeText={setDesc} placeholder="A few words about the dish…" maxLength={2000} rows={3} style={{ height: 88 }} />
      </label>
    </SheetFrame>
  );
}
