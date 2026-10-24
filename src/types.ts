export type Moment = 'lunch' | 'dinner' | 'both';

export type IconKey = 'fork' | 'bowl' | 'tart' | 'leaf' | 'meat' | 'fish' | 'egg' | 'toast';

export type TintKey = 'ocre' | 'sage' | 'terra' | 'blue' | 'plum';

/** [name, quantity, unit] */
export type Ingredient = [string, number, string];

export type Recipe = {
  id: string;
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
  extra: Recipe[];
  deleted: Record<string, true>;
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
  | { kind: 'account' };

export type Tab = 'week' | 'search' | 'recipes' | 'shopping';

/** A yes/no question shown in the confirmation dialog. */
export type Ask = { title: string; body?: string; confirm: string; destructive?: boolean; onConfirm: () => void };
