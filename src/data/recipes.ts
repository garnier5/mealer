import type { IconKey, Recipe, TintKey } from '@/types';

export const SEED_RECIPES: Recipe[] = [
  { id: 'carbo', name: 'Spaghetti carbonara', short: 'Carbonara', moment: 'dinner', icon: 'fork', tint: 'ocre', desc: 'The Roman classic, silky thanks to egg yolks and parmesan.', ing: [['Spaghetti', 400, 'g'], ['Bacon lardons', 200, 'g'], ['Eggs', 4, 'pc'], ['Parmesan', 80, 'g']] },
  { id: 'cesar', name: 'Caesar salad', short: 'Caesar', moment: 'lunch', icon: 'leaf', tint: 'sage', desc: 'Crisp romaine, golden chicken, croutons and parmesan dressing.', ing: [['Romaine lettuce', 1, 'pc'], ['Chicken breasts', 2, 'pc'], ['Parmesan', 40, 'g'], ['Croutons', 1, 'bag'], ['Lemon', 1, 'pc']] },
  { id: 'blanq', name: 'Veal blanquette', short: 'Blanquette', moment: 'dinner', icon: 'bowl', tint: 'terra', desc: 'Slow-simmered French classic in a creamy mushroom sauce.', ing: [['Veal shoulder', 800, 'g'], ['Carrots', 3, 'pc'], ['Button mushrooms', 250, 'g'], ['Heavy cream', 20, 'cl'], ['Onion', 1, 'pc'], ['Rice', 300, 'g']] },
  { id: 'curry', name: 'Chickpea curry', short: 'Curry', moment: 'both', icon: 'bowl', tint: 'ocre', desc: 'Vegetarian, mild and fragrant with coconut milk and coriander.', ing: [['Chickpeas', 2, 'can'], ['Coconut milk', 40, 'cl'], ['Crushed tomatoes', 1, 'can'], ['Onion', 1, 'pc'], ['Rice', 300, 'g'], ['Coriander', 1, 'bunch']] },
  { id: 'quiche', name: 'Quiche Lorraine', short: 'Quiche', moment: 'lunch', icon: 'tart', tint: 'ocre', desc: 'Golden pastry, smoky lardons and a creamy egg filling.', ing: [['Shortcrust pastry', 1, 'pc'], ['Bacon lardons', 200, 'g'], ['Eggs', 3, 'pc'], ['Heavy cream', 20, 'cl'], ['Grated Gruyère', 80, 'g']] },
  { id: 'soupe', name: 'Pumpkin soup', short: 'Pumpkin soup', moment: 'dinner', icon: 'bowl', tint: 'terra', desc: 'Velvety seasonal soup with a touch of cream and nutmeg.', ing: [['Pumpkin', 1000, 'g'], ['Onion', 1, 'pc'], ['Heavy cream', 20, 'cl'], ['Vegetable stock', 1, 'cube']] },
  { id: 'pchamp', name: 'Creamy mushroom chicken', short: 'Mushroom chicken', moment: 'both', icon: 'meat', tint: 'terra', desc: 'Pan-fried chicken breasts in a creamy mushroom sauce, served with fresh tagliatelle.', ing: [['Chicken breasts', 4, 'pc'], ['Button mushrooms', 250, 'g'], ['Heavy cream', 20, 'cl'], ['Shallots', 2, 'pc'], ['Tagliatelle', 300, 'g']] },
  { id: 'ratat', name: 'Ratatouille', short: 'Ratatouille', moment: 'both', icon: 'leaf', tint: 'sage', desc: 'Sunny Provençal vegetables, even better the next day.', ing: [['Zucchini', 2, 'pc'], ['Eggplant', 1, 'pc'], ['Bell peppers', 2, 'pc'], ['Tomatoes', 4, 'pc'], ['Onion', 1, 'pc']] },
  { id: 'croque', name: 'Croque-monsieur', short: 'Croque', moment: 'dinner', icon: 'toast', tint: 'ocre', desc: 'Toasted ham sandwich with a quick béchamel and melted Gruyère.', ing: [['Sandwich bread', 8, 'slice'], ['Ham', 4, 'slice'], ['Grated Gruyère', 100, 'g'], ['Milk', 25, 'cl']] },
  { id: 'gratin', name: 'Gratin dauphinois', short: 'Gratin', moment: 'dinner', icon: 'tart', tint: 'plum', desc: 'Thinly sliced potatoes baked slowly in cream.', ing: [['Potatoes', 1000, 'g'], ['Heavy cream', 40, 'cl'], ['Garlic', 1, 'clove'], ['Milk', 25, 'cl']] },
  { id: 'taboule', name: 'Tabbouleh', short: 'Tabbouleh', moment: 'lunch', icon: 'leaf', tint: 'sage', desc: 'Couscous, tomatoes, cucumber and lots of fresh mint.', ing: [['Couscous', 250, 'g'], ['Tomatoes', 3, 'pc'], ['Cucumber', 1, 'pc'], ['Mint', 1, 'bunch'], ['Lemon', 1, 'pc']] },
  { id: 'hachis', name: 'Hachis parmentier', short: 'Parmentier', moment: 'both', icon: 'fork', tint: 'terra', desc: 'French cottage pie: seasoned ground beef under a golden mash.', ing: [['Ground beef', 500, 'g'], ['Potatoes', 1000, 'g'], ['Milk', 25, 'cl'], ['Grated Gruyère', 60, 'g'], ['Onion', 1, 'pc']] },
  { id: 'saumon', name: 'Salmon, rice & broccoli', short: 'Salmon', moment: 'both', icon: 'fish', tint: 'blue', desc: 'Roasted salmon fillet, basmati rice and steamed broccoli.', ing: [['Salmon fillets', 2, 'pc'], ['Rice', 200, 'g'], ['Broccoli', 1, 'pc'], ['Lemon', 1, 'pc']] },
  { id: 'omelette', name: 'Mushroom omelette', short: 'Omelette', moment: 'dinner', icon: 'egg', tint: 'ocre', desc: 'Ready in 10 minutes, soft and fragrant with chives.', ing: [['Eggs', 6, 'pc'], ['Button mushrooms', 200, 'g'], ['Chives', 1, 'bunch']] },
  { id: 'lentilles', name: 'Lentils & salt pork', short: 'Lentils', moment: 'lunch', icon: 'bowl', tint: 'plum', desc: 'Green lentils simmered with salt pork and carrots.', ing: [['Green lentils', 300, 'g'], ['Salt pork', 600, 'g'], ['Carrots', 2, 'pc'], ['Onion', 1, 'pc']] },
  { id: 'risotto', name: 'Mushroom risotto', short: 'Risotto', moment: 'dinner', icon: 'bowl', tint: 'sage', desc: 'Creamy arborio rice, sautéed mushrooms and parmesan.', ing: [['Arborio rice', 300, 'g'], ['Button mushrooms', 300, 'g'], ['Parmesan', 60, 'g'], ['Shallots', 1, 'pc'], ['Vegetable stock', 1, 'cube']] },
  { id: 'roti', name: 'Roast chicken & potatoes', short: 'Roast chicken', moment: 'lunch', icon: 'meat', tint: 'terra', desc: 'The Sunday lunch: roasted with thyme and baby potatoes.', ing: [['Whole chicken', 1, 'pc'], ['Potatoes', 800, 'g'], ['Thyme', 1, 'bunch'], ['Garlic', 2, 'clove']] },
  { id: 'tarte', name: 'Tomato & mustard tart', short: 'Tomato tart', moment: 'lunch', icon: 'tart', tint: 'terra', desc: 'Shortcrust pastry, wholegrain mustard and roasted tomatoes.', ing: [['Shortcrust pastry', 1, 'pc'], ['Tomatoes', 4, 'pc'], ['Wholegrain mustard', 1, 'jar'], ['Grated Gruyère', 50, 'g']] },
];

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

export const SEARCH_SUGGESTIONS = ['onion', 'tomatoes', 'rice', 'eggs', 'bacon', 'potatoes', 'parmesan', 'carrots'];

export const IMPORT_SAMPLE = JSON.stringify(
  [
    { title: 'Zucchini gratin', description: 'Melting zucchini under golden Gruyère.', meal: 'dinner', icon: 'tart', ingredients: ['zucchini', 'heavy cream', 'grated gruyère', 'garlic'] },
    { title: 'Tofu vegetable stir-fry', description: 'Crunchy vegetables, crispy tofu, soy sauce.', meal: 'both', icon: 'bowl', ingredients: ['tofu', 'bell peppers', 'broccoli', 'soy sauce'] },
  ],
  null,
  2,
);
