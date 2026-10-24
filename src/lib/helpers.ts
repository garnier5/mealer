import { RECIPE_ICONS } from '@/data/recipes';
import type { Data, IconKey, Ingredient, Moment, Picks, Recipe, TintKey } from '@/types';

export const SLOT_COUNT = 14;

export const emptyPlan = (): (string | null)[] => new Array(SLOT_COUNT).fill(null);

/** A fresh device: no plan, no own recipes, never synced. */
export const emptyData = (): Data => ({
  plan: emptyPlan(),
  picks: {},
  extra: [],
  tags: [],
  checked: {},
  custom: [],
  removed: {},
  themePref: null,
  sync: { linked: false, remote: {} },
});

/** Lowercase, strip accents, so "Gruyère" matches "gruyere". */
export const norm = (s: string) =>
  String(s).toLowerCase().replace(/œ/g, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Can this recipe go in a lunch (k = 0) or dinner (k = 1) slot? */
export const fitsSlot = (r: Recipe, slot: number) => (slot % 2 === 0 ? r.moment !== 'dinner' : r.moment !== 'lunch');

export const slotLabel = (slot: number) => (slot % 2 ? 'Dinner' : 'Lunch');

// ── Current week (Monday → Sunday) ──

export type WeekDay = { short: string; long: string; num: number };

const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function currentWeek(now = new Date()) {
  const todayIdx = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIdx);
  const dates = SHORT.map((_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
  const days: WeekDay[] = dates.map((d, i) => ({ short: SHORT[i], long: LONG[i], num: d.getDate() }));
  const first = dates[0];
  const last = dates[6];
  const range =
    first.getMonth() === last.getMonth()
      ? `${MONTHS[first.getMonth()]} ${first.getDate()} – ${last.getDate()}`
      : `${MONTHS[first.getMonth()]} ${first.getDate()} – ${MONTHS[last.getMonth()]} ${last.getDate()}`;
  return { days, todayIdx, range };
}

// ── Names and variants ──

/** The ingredient followed by its variants. */
export const options = (i: Ingredient) => [i[0], ...(i[3] ?? [])];

/** "Pasta, cucumber & chicken". */
const joinNames = (names: string[]) => {
  const low = names.map((n) => n.toLowerCase());
  const list = low.length > 1 ? low.slice(0, -1).join(', ') + ' & ' + low[low.length - 1] : (low[0] ?? '');
  return capitalize(list) || 'Untitled recipe';
};

/** The recipe's name, or its ingredients (variants included) when it has none. */
export const recipeTitle = (r: Pick<Recipe, 'name' | 'ing'>) => r.name || joinNames(r.ing.map((i) => options(i).join(' / ')));

/** The ingredient names a planned meal actually uses, its chosen variants applied. */
export const chosenIngredients = (r: Recipe, pick?: number[]) => r.ing.map((i, j) => options(i)[pick?.[j] ?? 0] ?? i[0]);

/** What a planned meal is called: its name, or the ingredients of the chosen variant. */
export const mealTitle = (r: Recipe, pick?: number[]) => r.name || joinNames(chosenIngredients(r, pick));

export const hasVariants = (r: Recipe) => r.ing.some((i) => !!i[3]?.length);

/** Drops trailing zeros (the default option), so "no choice made" is always stored the same way. */
export function cleanPick(pick: number[]): number[] {
  const p = pick.slice();
  while (p.length && !p[p.length - 1]) p.pop();
  return p;
}

/** A random variant for every ingredient that has some. */
export const randomPick = (r: Recipe) => cleanPick(r.ing.map((i) => Math.floor(Math.random() * options(i).length)));

/** Picks read from storage or the server: only small whole numbers, only for real slots. */
export function sanitizePicks(v: unknown): Picks {
  const out: Picks = {};
  if (!v || typeof v !== 'object') return out;
  for (const [k, p] of Object.entries(v)) {
    const slot = Number(k);
    if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_COUNT) continue;
    const pick = sanitizePick(p);
    if (pick.length) out[slot] = pick;
  }
  return out;
}

export const sanitizePick = (p: unknown) =>
  Array.isArray(p) ? cleanPick(p.slice(0, 100).map((x) => (Number.isInteger(x) && x >= 0 && x <= MAX_VARIANTS ? x : 0))) : [];

// ── Recipes from the "add" form or a JSON import ──

export const iconFromName = (n: unknown): IconKey => {
  const k = String(n ?? '').toLowerCase().trim();
  const f = RECIPE_ICONS.find((x) => x[0] === k || x[3] === k);
  return f ? f[0] : 'fork';
};

export const iconTint = (id: IconKey): TintKey => RECIPE_ICONS.find((x) => x[0] === id)?.[2] ?? 'plum';

/** An ingredient from a list of names: the first one, then its variants. */
export const toIngredient = ([name, ...variants]: string[]): Ingredient =>
  variants.length ? [capitalize(name), 1, 'pc', variants.map(capitalize)] : [capitalize(name), 1, 'pc'];

/** `ings`: one list per ingredient, its variants after it (["pasta", "rice"]). */
export function makeRecipe(title: string, desc: string, ings: string[][], moment: Moment, idx: number, icon: unknown): Recipe {
  const ic = iconFromName(icon);
  return {
    id: `u${Date.now()}_${idx}`,
    name: title,
    short: title,
    moment,
    icon: ic,
    tint: iconTint(ic),
    desc,
    ing: ings.map(toIngredient),
  };
}

// ── Recipes from untrusted data ──

const MOMENTS: Moment[] = ['lunch', 'dinner', 'both'];
const TINTS: TintKey[] = ['ocre', 'sage', 'terra', 'blue', 'plum'];
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max).trim() : '');
export const MAX_VARIANTS = 5;
/** The server refuses entries over 50 000 bytes; one refused entry would hold back the whole sync. */
const MAX_BYTES = 45000;
const bytes = (v: unknown) => new TextEncoder().encode(JSON.stringify(v)).length;

/**
 * Rebuilds a recipe from data the app didn't produce itself (shared by another device,
 * or cached from one): every malformed field falls back to a default so it can't crash a screen.
 * null when there's nothing usable (no id, or neither a name nor an ingredient).
 */
export function sanitizeRecipe(v: unknown, id?: string): Recipe | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const rid = id ?? text(o.id, 100);
  const name = text(o.name, 200);
  const icon = iconFromName(o.icon);
  const ing = Array.isArray(o.ing)
    ? o.ing.slice(0, 100).flatMap((x): Ingredient[] => {
        const n = Array.isArray(x) ? text(x[0], 200) : '';
        if (!n) return [];
        const qty = typeof x[1] === 'number' && Number.isFinite(x[1]) ? x[1] : 1;
        const unit = text(x[2], 30) || 'pc';
        const variants = Array.isArray(x[3]) ? x[3].slice(0, MAX_VARIANTS).map((a: unknown) => text(a, 200)).filter(Boolean) : [];
        return [variants.length ? [n, qty, unit, variants] : [n, qty, unit]];
      })
    : [];
  if (!rid || (!name && !ing.length)) return null;
  const r: Recipe = {
    id: rid,
    name,
    short: text(o.short, 100) || name,
    moment: MOMENTS.includes(o.moment as Moment) ? (o.moment as Moment) : 'both',
    icon,
    tint: TINTS.includes(o.tint as TintKey) ? (o.tint as TintKey) : iconTint(icon),
    desc: text(o.desc, 2000),
    ing,
  };
  while (r.ing.length > 1 && bytes(r) > MAX_BYTES) r.ing.pop();
  return r;
}

type ImportResult ={ ok: true; recipes: Recipe[]; msg: string } | { ok: false; msg: string };

export function parseImport(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, msg: 'Invalid JSON — check the syntax' };
  }
  const arr = Array.isArray(data) ? data : [data];
  const titleOf = (o: any) => (typeof o?.title === 'string' ? o.title : typeof o?.titre === 'string' ? o.titre : '').trim();
  // An ingredient is a name, or a list of names: the ingredient, then its variants.
  const ingsOf = (o: any): string[][] =>
    (Array.isArray(o?.ingredients) ? o.ingredients : []).flatMap((x: unknown) => {
      const names = (Array.isArray(x) ? x : [x]).filter((n) => typeof n === 'string' || typeof n === 'number').map((n) => String(n).trim()).filter(Boolean);
      return names.length ? [names] : [];
    });
  const valid = arr.filter((o: any) => o && typeof o === 'object' && (titleOf(o) || ingsOf(o).length));
  if (!valid.length) return { ok: false, msg: 'No valid recipe (each needs a “title” or “ingredients”)' };
  const recipes = valid.flatMap((o: any, j: number) => {
    const m = norm(o.meal || o.moment || '');
    const moment: Moment = m === 'lunch' || m === 'midi' ? 'lunch' : m === 'dinner' || m === 'soir' ? 'dinner' : 'both';
    return sanitizeRecipe(makeRecipe(titleOf(o), String(o.description || ''), ingsOf(o), moment, j, o.icon)) ?? [];
  });
  const n = recipes.length;
  return { ok: true, recipes, msg: `${n} ${n > 1 ? 'recipes' : 'recipe'} detected · ready to import` };
}
