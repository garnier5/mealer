import {
  BookOpen,
  Calendar,
  CalendarPlus,
  Check,
  CircleAlert,
  Cloud,
  CloudOff,
  Code,
  Contrast,
  Dice5,
  Drumstick,
  Egg,
  Fish,
  Leaf,
  Moon,
  Pencil,
  Pizza,
  Plus,
  Sandwich,
  Search,
  Share,
  ShoppingBasket,
  Soup,
  Sun,
  Trash2,
  Upload,
  Users,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react';

/** Maps the app's icon keys onto lucide glyphs. */
const GLYPHS = {
  calendar: Calendar,
  calPlus: CalendarPlus,
  search: Search,
  book: BookOpen,
  basket: ShoppingBasket,
  sun: Sun,
  moon: Moon,
  half: Contrast,
  plus: Plus,
  x: X,
  trash: Trash2,
  edit: Pencil,
  code: Code,
  upload: Upload,
  check: Check,
  alert: CircleAlert,
  dice: Dice5,
  cloud: Cloud,
  cloudOff: CloudOff,
  users: Users,
  share: Share,
  // recipe icons
  fork: Utensils,
  bowl: Soup,
  tart: Pizza,
  leaf: Leaf,
  meat: Drumstick,
  fish: Fish,
  egg: Egg,
  toast: Sandwich,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof GLYPHS;

/** Decorative: the surrounding button or text carries the accessible name. Defaults to the text color. */
export function Icon({ name, size = 20, color = 'currentColor' }: { name: IconName; size?: number; color?: string }) {
  // hasOwn: a name like "constructor" from bad data must not reach an Object.prototype member.
  const Glyph = Object.hasOwn(GLYPHS, name) ? GLYPHS[name] : GLYPHS.fork;
  return <Glyph size={size} color={color} strokeWidth={2} aria-hidden style={{ flexShrink: 0 }} />;
}
