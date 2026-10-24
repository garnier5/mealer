export type Moment = 'lunch' | 'dinner' | 'both';

export type IconKey = 'fork' | 'bowl' | 'tart' | 'leaf' | 'meat' | 'fish' | 'egg' | 'toast';

export type TintKey = 'ocre' | 'sage' | 'terra' | 'blue' | 'plum';

/** [name, quantity, unit, variants that can replace it (rice instead of pasta)] */
export type Ingredient = [string, number, string, string[]?];

export type Recipe = {
  id: string;
  /** May be empty: the recipe is then called by its ingredients ("Pasta, cucumber & chicken"). */
  name: string;
  short: string;
  moment: Moment;
  icon: IconKey;
  tint: TintKey;
  desc: string;
  ing: Ingredient[];
};

/** 14 slots: index = day * 2 + (0 lunch | 1 dinner). */
export type Plan = (string | null)[];

/**
 * Variant chosen for each planned meal, by slot: pick[j] is the option used for the recipe's
 * ingredient j (0 = the ingredient itself, 1 = its first variant…). Missing means all zeros.
 */
export type Picks = Record<number, number[]>;

export type CustomItem = { key: string; name: string };

export type ShopItem = { key: string; name: string; from: string; custom: boolean };

/**
 * Last known server state: live entries keyed by `kind:key`.
 * `linked` turns true once this device's data has been reconciled with the server.
 */
export type SyncBase = { linked: boolean; remote: Record<string, unknown> };

/** Everything that survives an app restart. */
export type Data = {
  plan: Plan;
  picks: Picks;
  /** Every recipe (the name dates from when the app shipped built-in ones). */
  extra: Recipe[];
  /** The shared ingredient list: normalized name (see ingredientKey) → name as displayed. */
  ingredients: Record<string, string>;
  tags: string[];
  checked: Record<string, true>;
  custom: CustomItem[];
  removed: Record<string, true>;
  themePref: 'light' | 'dark' | null;
  sync: SyncBase;
};

export type Sheet =
  | { kind: 'slot'; slot: number }
  | { kind: 'detail'; id: string }
  | { kind: 'plan'; id: string }
  | { kind: 'add'; id?: string }
  | { kind: 'import' }
  | { kind: 'ingredients' }
  | { kind: 'ingredient'; key: string }
  | { kind: 'account' };

export type Tab = 'week' | 'search' | 'recipes' | 'shopping';

/** A yes/no question shown in the confirmation dialog. */
export type Ask = { title: string; body?: string; confirm: string; destructive?: boolean; onConfirm: () => void };
