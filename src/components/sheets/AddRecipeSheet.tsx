import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Chip, Field, Label, Segmented, TextArea } from '@/components/ui';
import { RECIPE_ICONS } from '@/data/recipes';
import { capitalize, iconTint, makeRecipe } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';
import type { IconKey, Moment } from '@/types';

/** New recipe, or editing an existing one when `id` is given. */
export function AddRecipeSheet({ id }: { id?: string }) {
  const { tints, byId, addRecipes, updateRecipe, openSheet, closeSheet, goTo, toast } = useStore();
  const editing = id ? byId[id] : undefined;
  const [title, setTitle] = useState(editing?.name ?? '');
  const [desc, setDesc] = useState(editing?.desc ?? '');
  const [ings, setIngs] = useState<string[]>(editing?.ing.map(([name]) => name) ?? []);
  const [draft, setDraft] = useState('');
  const [moment, setMoment] = useState<Moment>(editing?.moment ?? 'both');
  const [icon, setIcon] = useState<IconKey>(editing?.icon ?? 'fork');

  const canSave = title.trim().length > 0;
  const pushIng = () => {
    const v = draft.trim();
    if (!v) return;
    setIngs((l) => l.concat(v));
    setDraft('');
  };
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
        ing: ings.map((n) => editing.ing.find(([old]) => old === n) ?? [capitalize(n), 1, 'pc']),
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
        <Label>Title</Label>
        <Field value={title} onChangeText={setTitle} autoCapitalize="sentences" placeholder="e.g. Zucchini gratin" maxLength={200} style={{ fontWeight: 600 }} />
      </label>

      <label className="col" style={{ gap: 6 }}>
        <Label>Description</Label>
        <TextArea value={desc} onChangeText={setDesc} placeholder="A few words about the dish…" maxLength={2000} rows={3} style={{ height: 88 }} />
      </label>

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

      <div className="col" style={{ gap: 8 }}>
        <Label>Ingredients</Label>
        <div className="row" style={{ gap: 8 }}>
          <Field value={draft} onChangeText={setDraft} onSubmit={pushIng} placeholder="Add an ingredient" maxLength={200} aria-label="Add an ingredient" />
          <Button label="Add" variant="tint" height={48} onClick={pushIng} />
        </div>
        {ings.length > 0 && (
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {ings.map((x, j) => (
              <Chip key={x + j} label={x} variant="outline" onRemove={() => setIngs((l) => l.filter((_, k) => k !== j))} />
            ))}
          </div>
        )}
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
    </SheetFrame>
  );
}
