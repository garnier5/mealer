import type { CSSProperties, InputHTMLAttributes, KeyboardEvent, ReactNode, TextareaHTMLAttributes } from 'react';

import { Icon, type IconName } from '@/components/Icon';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';
import type { Moment, Recipe } from '@/types';

// ── Layout ──

/** One tab's scrollable page. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="screen">
      <div className="screen-inner">{children}</div>
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  );
}

// ── Text ──

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export function Title({ children, size = 30 }: { children: ReactNode; size?: number }) {
  return (
    <h1 className="title" style={{ fontSize: size, lineHeight: `${size + 6}px` }}>
      {children}
    </h1>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="label" style={style}>
      {children}
    </div>
  );
}

// ── Recipe bits ──

export function RecipeTile({ recipe, size = 46, iconSize = 24 }: { recipe: Pick<Recipe, 'icon' | 'tint'>; size?: number; iconSize?: number }) {
  const { tints } = useStore();
  const [bg, fg] = tints[recipe.tint] ?? tints.plum;
  return (
    <div className="tile" style={{ width: size, height: size, borderRadius: Math.round(size / 3), backgroundColor: bg }}>
      <Icon name={recipe.icon} size={iconSize} color={fg} />
    </div>
  );
}

export function MomentBadge({ moment, small }: { moment: Moment; small?: boolean }) {
  const b =
    moment === 'lunch'
      ? { label: 'Lunch', icon: 'sun' as const, bg: c.ocreTint, fg: c.ocre }
      : moment === 'dinner'
        ? { label: 'Dinner', icon: 'moon' as const, bg: c.warmTint, fg: c.warm }
        : { label: 'Lunch & Dinner', icon: 'half' as const, bg: c.tint, fg: c.accentText };
  const h = small ? 20 : 24;
  return (
    <span className="badge" style={{ height: h, borderRadius: h / 2, backgroundColor: b.bg, color: b.fg, fontSize: small ? 11 : 12 }}>
      <Icon name={b.icon} size={small ? 11 : 13} />
      {b.label}
    </span>
  );
}

// ── Controls ──

type ButtonVariant = 'primary' | 'outline' | 'tint' | 'warm';

export function Button({
  label,
  icon,
  onClick,
  variant = 'primary',
  disabled,
  height = 52,
  style,
  ariaLabel,
  submit,
}: {
  label?: string;
  icon?: IconName;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  height?: number;
  style?: CSSProperties;
  ariaLabel?: string;
  /** Submits its <form> (lets password managers offer to save the credentials). */
  submit?: boolean;
}) {
  return (
    <button
      type={submit ? 'submit' : 'button'}
      className={'btn btn-' + variant}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      style={{
        height,
        borderRadius: height >= 52 ? 16 : 14,
        padding: label ? '0 16px' : 0,
        width: label ? undefined : height,
        fontSize: height >= 52 ? 15 : 14,
        ...style,
      }}>
      {icon && <Icon name={icon} size={18} />}
      {label}
    </button>
  );
}

export function IconButton({
  icon,
  onClick,
  label,
  color = c.text3,
  bg = 'transparent',
  size = 40,
  round,
  bordered,
  disabled,
}: {
  icon: IconName;
  onClick: () => void;
  label: string;
  color?: string;
  bg?: string;
  size?: number;
  round?: boolean;
  bordered?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        width: size,
        height: size,
        borderRadius: round ? size / 2 : 12,
        backgroundColor: bg,
        border: bordered ? `1px solid ${c.line}` : 0,
        color,
      }}>
      <Icon name={icon} size={18} />
    </button>
  );
}

export function ProgressBar({ pct, height = 6 }: { pct: number; height?: number }) {
  return (
    <div className="progress" style={{ height, borderRadius: height / 2 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: K; label: string; count?: number; icon?: IconName }[];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.key} type="button" className="segment" aria-pressed={o.key === value} onClick={() => onChange(o.key)}>
          {o.icon && <Icon name={o.icon} size={15} />}
          {o.label}
          {o.count !== undefined && <span className="segment-count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Chip({ label, onRemove, variant = 'tint' }: { label: string; onRemove: () => void; variant?: 'tint' | 'outline' }) {
  return (
    <span className={'chip chip-' + variant}>
      {label}
      <button type="button" className="chip-x" onClick={onRemove} aria-label={'Remove ' + label}>
        <Icon name="x" size={14} />
      </button>
    </span>
  );
}

/** Enter submits, but not while an IME is composing a word. */
const submitOnEnter = (onSubmit?: () => void) => (e: KeyboardEvent) => {
  if (onSubmit && e.key === 'Enter' && !e.nativeEvent.isComposing) {
    e.preventDefault();
    onSubmit();
  }
};

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSubmit' | 'value'> & {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit?: () => void;
  /** No border or background: for inputs inside their own framed row. */
  bare?: boolean;
};

export function Field({ onChangeText, onSubmit, bare, className, ...props }: FieldProps) {
  return (
    <input
      className={'field' + (bare ? ' field-bare' : '') + (className ? ' ' + className : '')}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint={onSubmit ? 'done' : undefined}
      onChange={(e) => onChangeText(e.target.value)}
      onKeyDown={submitOnEnter(onSubmit)}
      {...props}
    />
  );
}

type AreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & { value: string; onChangeText: (v: string) => void };

export function TextArea({ onChangeText, className, ...props }: AreaProps) {
  return <textarea className={'field' + (className ? ' ' + className : '')} onChange={(e) => onChangeText(e.target.value)} {...props} />;
}

export function EmptyState({ icon, title, body, children }: { icon: IconName; title: string; body: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <Icon name={icon} size={30} color={c.accentText} />
      <div style={{ color: c.text, fontSize: 15, fontWeight: 800 }}>{title}</div>
      <p style={{ color: c.text2, fontSize: 13.5, lineHeight: '19px' }}>{body}</p>
      {children}
    </div>
  );
}
