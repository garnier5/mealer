import type { IconKey, TintKey } from '@/types';

/** [icon, label, tint, JSON alias] */
export const RECIPE_ICONS: [IconKey, string, TintKey, string][] = [
  ['fork', 'Plate', 'ocre', 'plate'],
  ['bowl', 'Bowl', 'terra', 'bowl'],
  ['tart', 'Tart', 'plum', 'tart'],
  ['leaf', 'Salad', 'sage', 'salad'],
  ['meat', 'Meat', 'terra', 'meat'],
  ['fish', 'Fish', 'blue', 'fish'],
  ['egg', 'Eggs', 'ocre', 'eggs'],
  ['toast', 'Toast', 'ocre', 'toast'],
];

/** Shown as the import box's placeholder: the expected format. */
export const IMPORT_SAMPLE = JSON.stringify(
  [
    { title: 'Zucchini gratin', description: 'Melting zucchini under golden Gruyère.', meal: 'dinner', icon: 'tart', ingredients: ['zucchini', 'heavy cream', 'grated gruyère', 'garlic'] },
    { title: 'Tofu vegetable stir-fry', description: 'Crunchy vegetables, crispy tofu, soy sauce.', meal: 'both', icon: 'bowl', ingredients: ['tofu', 'bell peppers', 'broccoli', 'soy sauce'] },
  ],
  null,
  2,
);
