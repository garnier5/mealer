import { RECIPE_ICONS } from '@/data/recipes';
import type { Data, IconKey, Ingredient, Moment, Recipe, TintKey } from '@/types';

export const SLOT_COUNT = 14;

export const emptyPlan = (): (string | null)[] => new Array(SLOT_COUNT).fill(null);

/** A fresh device: no plan, no own recipes, never synced. */
export const emptyData = (): Data => ({
  plan: emptyPlan(),
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

// ── Recipes from the "add" form or a JSON import ──

export const iconFromName = (n: unknown): IconKey => {
  const k = String(n ?? '').toLowerCase().trim();
  const f = RECIPE_ICONS.find((x) => x[0] === k || x[3] === k);
  return f ? f[0] : 'fork';
};

export const iconTint = (id: IconKey): TintKey => RECIPE_ICONS.find((x) => x[0] === id)?.[2] ?? 'plum';

export function makeRecipe(title: string, desc: string, ings: string[], moment: Moment, idx: number, icon: unknown): Recipe {
  const ic = iconFromName(icon);
  return {
    id: `u${Date.now()}_${idx}`,
    name: title,
    short: title,
    moment,
    icon: ic,
    tint: iconTint(ic),
    desc: desc || 'Added by you.',
    ing: ings.map((n) => [capitalize(n), 1, 'pc']),
  };
}

// ── Recipes from untrusted data ──

const MOMENTS: Moment[] = ['lunch', 'dinner', 'both'];
const TINTS: TintKey[] = ['ocre', 'sage', 'terra', 'blue', 'plum'];
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max).trim() : '');

/**
 * Rebuilds a recipe from data the app didn't produce itself (shared by another device,
 * or cached from one): every malformed field falls back to a default so it can't crash a screen.
 * null when there's nothing usable (no id or no name).
 */
export function sanitizeRecipe(v: unknown, id?: string): Recipe | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const rid = id ?? text(o.id, 100);
  const name = text(o.name, 200);
  if (!rid || !name) return null;
  const icon = iconFromName(o.icon);
  const ing = Array.isArray(o.ing)
    ? o.ing.slice(0, 100).flatMap((x): Ingredient[] => {
        const n = Array.isArray(x) ? text(x[0], 200) : '';
        if (!n) return [];
        const qty = typeof x[1] === 'number' && Number.isFinite(x[1]) ? x[1] : 1;
        return [[n, qty, text(x[2], 30) || 'pc']];
      })
    : [];
  return {
    id: rid,
    name,
    short: text(o.short, 100) || name,
    moment: MOMENTS.includes(o.moment as Moment) ? (o.moment as Moment) : 'both',
    icon,
    tint: TINTS.includes(o.tint as TintKey) ? (o.tint as TintKey) : iconTint(icon),
    desc: text(o.desc, 2000),
    ing,
  };
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
  const titleOf = (o: any) => (typeof o?.title === 'string' ? o.title : typeof o?.titre === 'string' ? o.titre : '');
  const valid = arr.filter((o: any) => o && typeof o === 'object' && titleOf(o).trim());
  if (!valid.length) return { ok: false, msg: 'No valid recipe (missing “title” field)' };
  const recipes = valid.map((o: any, j: number) => {
    const m = norm(o.meal || o.moment || '');
    const moment: Moment = m === 'lunch' || m === 'midi' ? 'lunch' : m === 'dinner' || m === 'soir' ? 'dinner' : 'both';
    const ings = Array.isArray(o.ingredients) ? o.ingredients.map(String) : [];
    return makeRecipe(titleOf(o).trim(), String(o.description || ''), ings, moment, j, o.icon);
  });
  const n = recipes.length;
  return { ok: true, recipes, msg: `${n} ${n > 1 ? 'recipes' : 'recipe'} detected · ready to import` };
}
