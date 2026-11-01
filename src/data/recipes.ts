import type { IconKey, TintKey } from '@/types';

/**
 * [icon, label, tint, JSON alias]. Each icon has its own tint, so recipes tell apart at a glance.
 * The first one is the default, also for an unknown icon (the former "plate" and "eggs" among them).
 */
export const RECIPE_ICONS: [IconKey, string, TintKey, string][] = [
  ['fork', 'Chef', 'iris', 'chef'],
  ['bowl', 'Bowl', 'teal', 'bowl'],
  ['tart', 'Tart', 'plum', 'tart'],
  ['leaf', 'Salad', 'sage', 'salad'],
  ['meat', 'Meat', 'terra', 'meat'],
  ['fish', 'Fish', 'blue', 'fish'],
  ['toast', 'Toast', 'ocre', 'toast'],
  ['cake', 'Cake', 'rose', 'cake'],
];

/**
 * The import format, shown in the import box and copied by its "Copy example" button.
 * An ingredient written as a list is an ingredient and its variants; the title is optional.
 */
export const IMPORT_SAMPLE = JSON.stringify(
  [
    { title: 'Zucchini gratin', description: 'Melting zucchini under golden Gruyère.', meal: 'dinner', icon: 'tart', ingredients: ['zucchini', 'heavy cream', 'grated gruyère', 'garlic'] },
    { meal: 'lunch', icon: 'salad', ingredients: [['pasta', 'rice'], 'cucumber', 'chicken'] },
  ],
  null,
  2,
);
