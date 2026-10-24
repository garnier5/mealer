import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

import {
  chosenIngredients,
  cleanPick,
  currentWeek,
  emptyData,
  emptyPlan,
  fitsSlot,
  mealTitle,
  norm,
  options,
  randomPick,
  recipeTitle,
  sanitizePicks,
  sanitizeRecipe,
  shuffle,
  slotLabel,
  SLOT_COUNT,
} from '@/lib/helpers';
import { useCloud } from '@/state/cloud';
import { THEMES, TINTS, type Theme } from '@/theme/theme';
import type { Ask, Data, Picks, Recipe, ShopItem, Sheet, Tab } from '@/types';

const STORAGE_KEY = 'mealer/v1';

/**
 * localStorage is synchronous, so the saved week is there on the very first render.
 * Shared recipes and plan slots are checked again: this cache may hold data received
 * from other devices before the app validated it.
 */
function load(): Data {
  const fresh = emptyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Partial<Data>;
    return {
      ...fresh,
      ...saved,
      plan: Array.isArray(saved.plan) && saved.plan.length === SLOT_COUNT ? saved.plan.map((id) => (typeof id === 'string' ? id : null)) : fresh.plan,
      picks: sanitizePicks(saved.picks),
      extra: Array.isArray(saved.extra) ? saved.extra.flatMap((r) => sanitizeRecipe(r) ?? []) : [],
      // A cache from before this version (or never synced) starts over with the server.
      sync: saved.sync?.linked === true ? saved.sync : fresh.sync,
    };
  } catch {
    return fresh;
  }
}

/** Forgets this device's copy of the data (the cloud session stays, so synced data comes back). */
export function resetLocalData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, or storage blocked: nothing to forget either.
  }
}

// ── Current tab, mirrored in the URL hash so a reload (or a relaunch) lands on the same screen ──

const TABS: Tab[] = ['week', 'search', 'recipes', 'shopping'];

/** The picks without this slot's: a meal that changes goes back to its default variant. */
const withoutPick = (picks: Picks, slot: number) => {
  const next = { ...picks };
  delete next[slot];
  return next;
};

const tabFromHash = (): Tab => {
  const h = location.hash.replace(/^#\/?/, '');
  return TABS.includes(h as Tab) ? (h as Tab) : 'week';
};

// ── System light / dark ──

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const subscribeDark = (cb: () => void) => {
  darkQuery.addEventListener('change', cb);
  return () => darkQuery.removeEventListener('change', cb);
};

function useStoreValue() {
  const [data, setData] = useState<Data>(load);
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [dialog, setDialog] = useState<Ask | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const systemDark = useSyncExternalStore(subscribeDark, () => darkQuery.matches);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or blocked: the app keeps working on what's in memory.
    }
  }, [data]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const cloud = useCloud(data, setData);

  const toast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const dark = data.themePref ? data.themePref === 'dark' : systemDark;
  const t: Theme = dark ? THEMES.dark : THEMES.light;
  const tints = dark ? TINTS.dark : TINTS.light;

  const recipes = data.extra;
  const byId = useMemo(() => Object.fromEntries(recipes.map((r) => [r.id, r])) as Record<string, Recipe>, [recipes]);
  const week = useMemo(() => currentWeek(), []);

  const shopping = useMemo<ShopItem[]>(() => {
    const map = new Map<string, string[]>();
    data.plan.forEach((id, slot) => {
      const r = id ? byId[id] : undefined;
      if (!r) return;
      const pick = data.picks[slot];
      chosenIngredients(r, pick).forEach((name) => {
        const from = map.get(name) ?? [];
        const label = r.short || mealTitle(r, pick);
        if (!from.includes(label)) from.push(label);
        map.set(name, from);
      });
    });
    const fromPlan = [...map.entries()]
      .filter(([name]) => !data.removed[name])
      .sort(([a], [b]) => a.localeCompare(b, 'en'))
      .map(([name, from]) => ({ key: name, name, from: 'For ' + from.join(' · '), custom: false }));
    const mine = data.custom.map((c) => ({ key: c.key, name: c.name, from: 'Added by you', custom: true }));
    return fromPlan.concat(mine);
  }, [data.plan, data.picks, data.removed, data.custom, byId]);

  const placed = (slot: number) => `Added to ${week.days[Math.floor(slot / 2)].short} · ${slotLabel(slot)}`;

  const actions = {
    goTo: (next: Tab) => {
      setTab(next);
      history.replaceState(null, '', next === 'week' ? location.pathname + location.search : '#/' + next);
    },
    openSheet: setSheet,
    closeSheet: () => setSheet(null),
    ask: setDialog,
    closeDialog: () => setDialog(null),
    toast,
    toggleTheme: () => setData((d) => ({ ...d, themePref: dark ? 'light' : 'dark' })),

    generate: () => {
      if (!recipes.length) {
        toast('Add some recipes first');
        return;
      }
      const used = new Set<string>();
      const plan = emptyPlan();
      const picks: Picks = {};
      for (const k of [0, 1]) {
        const pool = shuffle(recipes.filter((r) => fitsSlot(r, k)));
        for (let d = 0; d < 7; d++) {
          const r = pool.find((x) => !used.has(x.id)) ?? pool[d % pool.length];
          if (r) {
            plan[d * 2 + k] = r.id;
            const pick = randomPick(r);
            if (pick.length) picks[d * 2 + k] = pick;
            used.add(r.id);
          }
        }
      }
      // A new week starts a new shopping list: nothing bought or removed yet.
      setData((d) => ({ ...d, plan, picks, removed: {}, checked: {} }));
      toast(`Week generated · ${plan.filter(Boolean).length} meals`);
    },
    clearWeek: () => setData((d) => ({ ...d, plan: emptyPlan(), picks: {}, removed: {}, checked: {} })),
    assign: (slot: number, r: Recipe) => {
      setData((d) => {
        const plan = d.plan.slice();
        plan[slot] = r.id;
        return { ...d, plan, picks: withoutPick(d.picks, slot) };
      });
      setSheet(null);
      toast(placed(slot));
    },
    clearSlot: (slot: number) => {
      setData((d) => {
        const plan = d.plan.slice();
        plan[slot] = null;
        return { ...d, plan, picks: withoutPick(d.picks, slot) };
      });
      setSheet(null);
      toast('Slot cleared');
    },
    /** Uses option `option` (0 = the ingredient itself) for ingredient `j` of the meal in `slot`. */
    setPick: (slot: number, j: number, option: number) =>
      setData((d) => {
        const pick = d.picks[slot]?.slice() ?? [];
        while (pick.length <= j) pick.push(0);
        pick[j] = option;
        const clean = cleanPick(pick);
        return { ...d, picks: clean.length ? { ...d.picks, [slot]: clean } : withoutPick(d.picks, slot) };
      }),
    /** "Surprise me": random fitting recipe, preferring one not already planned. */
    fillSlot: (slot: number) => {
      const pool = recipes.filter((r) => fitsSlot(r, slot));
      const fresh = pool.filter((r) => !data.plan.includes(r.id));
      const src = fresh.length ? fresh : pool;
      if (!src.length) {
        toast(`No recipe for ${slotLabel(slot).toLowerCase()} yet`);
        return;
      }
      actions.assign(slot, src[Math.floor(Math.random() * src.length)]);
    },

    deleteRecipe: (r: Recipe) => {
      setData((d) => ({
        ...d,
        extra: d.extra.filter((x) => x.id !== r.id),
        plan: d.plan.map((x) => (x === r.id ? null : x)),
        picks: d.plan.reduce((p, x, slot) => (x === r.id ? withoutPick(p, slot) : p), d.picks),
      }));
      setSheet(null);
      toast(recipeTitle(r) + ' deleted');
    },
    confirmDeleteRecipe: (r: Recipe) => {
      const notes = [
        data.plan.includes(r.id) && 'It will also be removed from your week.',
        cloud.status !== 'off' && 'It disappears on every device.',
      ].filter(Boolean);
      setDialog({
        title: `Delete “${recipeTitle(r)}”?`,
        body: notes.join(' ') || undefined,
        confirm: 'Delete',
        destructive: true,
        onConfirm: () => actions.deleteRecipe(r),
      });
    },
    // Recipes go through the same limits as the ones received from other devices: the server
    // rejects oversized entries, and one rejected entry would hold back the whole sync.
    addRecipes: (list: Recipe[]) => setData((d) => ({ ...d, extra: d.extra.concat(list.flatMap((r) => sanitizeRecipe(r) ?? [])) })),
    updateRecipe: (edited: Recipe) => {
      const r = sanitizeRecipe(edited);
      if (!r) return;
      setData((d) => {
        const old = d.extra.find((x) => x.id === r.id);
        // Planned meals remember their variants by ingredient position: follow each chosen
        // variant by name, so reordering or editing the ingredients keeps "rice" on rice.
        let picks = d.picks;
        if (old) {
          d.plan.forEach((id, slot) => {
            if (id !== r.id || !d.picks[slot]) return;
            const chosen = new Map(old.ing.map((i, j) => [i[0], chosenIngredients(old, d.picks[slot])[j]]));
            const pick = cleanPick(r.ing.map((i) => Math.max(0, options(i).indexOf(chosen.get(i[0]) ?? i[0]))));
            picks = pick.length ? { ...picks, [slot]: pick } : withoutPick(picks, slot);
          });
        }
        return {
          ...d,
          picks,
          extra: old ? d.extra.map((x) => (x.id === r.id ? r : x)) : d.extra.concat(r),
        };
      });
    },

    addTag: (value: string) => {
      const v = value.trim().toLowerCase();
      if (!v || data.tags.some((x) => norm(x) === norm(v))) return;
      setData((d) => ({ ...d, tags: d.tags.concat(v) }));
    },
    removeTag: (idx: number) => setData((d) => ({ ...d, tags: d.tags.filter((_, k) => k !== idx) })),

    toggleItem: (key: string) =>
      setData((d) => {
        const checked = { ...d.checked };
        if (checked[key]) delete checked[key];
        else checked[key] = true;
        return { ...d, checked };
      }),
    removeItem: (it: ShopItem) => {
      setData((d) => {
        const checked = { ...d.checked };
        delete checked[it.key];
        return it.custom
          ? { ...d, checked, custom: d.custom.filter((x) => x.key !== it.key) }
          : { ...d, checked, removed: { ...d.removed, [it.key]: true } };
      });
      toast(it.name + ' removed');
    },
    addCustom: (value: string) => {
      const v = value.trim().slice(0, 200);
      if (!v) return;
      const name = v.charAt(0).toUpperCase() + v.slice(1);
      setData((d) => ({ ...d, custom: d.custom.concat({ key: 'c_' + Date.now(), name }) }));
    },
  };

  return { data, tab, sheet, dialog, toastMsg, dark, t, tints, recipes, byId, week, shopping, cloud, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside <StoreProvider>');
  return s;
}
