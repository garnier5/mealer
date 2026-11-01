import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { Button, Card, EmptyState, Eyebrow, HealthyBadge, IconButton, MomentBadge, RecipeTile, Screen, Segmented, Title } from '@/components/ui';
import { hasVariants, recipeTitle } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

type Filter = 'all' | 'lunch' | 'dinner';

export function RecipesScreen() {
  const { recipes, tints, openSheet, confirmDeleteRecipe } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [healthyOnly, setHealthyOnly] = useState(false);

  // The counts follow the healthy filter, so they always match the list shown.
  const shown = healthyOnly ? recipes.filter((r) => r.healthy) : recipes;
  const lunch = shown.filter((r) => r.moment !== 'dinner');
  const dinner = shown.filter((r) => r.moment !== 'lunch');
  const list = filter === 'lunch' ? lunch : filter === 'dinner' ? dinner : shown;
  const healthyCount = recipes.filter((r) => r.healthy).length;
  const [sageBg, sageFg] = tints.sage;

  return (
    <Screen>
      <div className="col" style={{ gap: 2 }}>
        <Eyebrow>
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </Eyebrow>
        <Title>Recipes</Title>
      </div>

      <Button label="Add a recipe" icon="plus" height={54} onClick={() => openSheet({ kind: 'add' })} style={{ borderRadius: 18 }} />
      <div className="row" style={{ gap: 8 }}>
        <Button label="Ingredients" icon="leaf" variant="outline" height={44} onClick={() => openSheet({ kind: 'ingredients' })} style={{ flex: 1 }} />
        <Button label="Import JSON" icon="code" variant="warm" height={44} onClick={() => openSheet({ kind: 'import' })} style={{ flex: 1 }} />
      </div>

      {recipes.length === 0 && (
        <EmptyState icon="book" title="No recipes yet" body="Add your first recipe, or import several at once from JSON. Everyone on Mealer shares them." />
      )}

      {recipes.length > 0 && (
        <div className="col" style={{ gap: 8 }}>
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { key: 'all', label: 'All', count: shown.length },
              { key: 'lunch', label: 'Lunch', count: lunch.length },
              { key: 'dinner', label: 'Dinner', count: dinner.length },
            ]}
          />
          <button
            type="button"
            className="press suggestion"
            aria-pressed={healthyOnly}
            onClick={() => setHealthyOnly((v) => !v)}
            style={{
              alignSelf: 'flex-start',
              borderColor: healthyOnly ? sageFg : undefined,
              backgroundColor: healthyOnly ? sageBg : undefined,
              color: healthyOnly ? sageFg : undefined,
            }}>
            <Icon name={healthyOnly ? 'check' : 'sprout'} size={14} />
            Healthy only · {healthyCount}
          </button>
        </div>
      )}

      {recipes.length > 0 && list.length === 0 && (
        <p style={{ padding: '20px 0', textAlign: 'center', fontSize: 14, color: c.text2 }}>
          {healthyOnly ? `No healthy recipe${filter === 'all' ? '' : ' for ' + filter} yet.` : `No recipe for ${filter} yet.`}
        </p>
      )}

      <div className="col" style={{ gap: 10 }}>
        {list.map((r) => (
          <Card key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 2, paddingRight: 6 }}>
            <button
              type="button"
              className="press row"
              onClick={() => openSheet({ kind: 'detail', id: r.id })}
              aria-label={'View ' + recipeTitle(r)}
              style={{ flex: 1, minWidth: 0, gap: 14, padding: 12, textAlign: 'left' }}>
              <RecipeTile recipe={r} size={54} iconSize={26} />
              <div className="col" style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <div style={{ fontSize: 15.5, lineHeight: '20px', fontWeight: 800, color: c.text }}>{recipeTitle(r)}</div>
                {r.desc && (
                  <div className="ellipsis" style={{ fontSize: 13, lineHeight: '17px', color: c.text2 }}>
                    {r.desc}
                  </div>
                )}
                <div className="row" style={{ gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  <MomentBadge moment={r.moment} small />
                  {r.healthy && <HealthyBadge small />}
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: c.text3 }}>
                    {r.ing.length} {r.ing.length === 1 ? 'ingredient' : 'ingredients'}
                    {hasVariants(r) && ' · variants'}
                  </span>
                </div>
              </div>
            </button>
            <IconButton icon="trash" label={'Delete ' + recipeTitle(r)} onClick={() => confirmDeleteRecipe(r)} />
          </Card>
        ))}
      </div>
    </Screen>
  );
}
