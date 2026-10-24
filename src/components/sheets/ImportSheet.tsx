import { useMemo, useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Card, EmptyState, MomentBadge, RecipeTile, TextArea } from '@/components/ui';
import { IMPORT_SAMPLE } from '@/data/recipes';
import { hasVariants, parseImport, recipeTitle } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';
import type { Recipe } from '@/types';

/** One recipe about to be imported: tap to unfold its description and ingredients. */
function PreviewRow({ recipe: r, open, onToggle, first }: { recipe: Recipe; open: boolean; onToggle: () => void; first: boolean }) {
  return (
    <div style={{ borderTop: first ? 0 : `1px solid ${c.line}` }}>
      <button type="button" className="press row" aria-expanded={open} onClick={onToggle} style={{ width: '100%', gap: 12, padding: '10px 12px', textAlign: 'left' }}>
        <RecipeTile recipe={r} size={38} iconSize={20} />
        <div className="col" style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <div style={{ fontSize: 14.5, lineHeight: '19px', fontWeight: 800, color: c.text }}>{recipeTitle(r)}</div>
          <div className="row" style={{ gap: 8 }}>
            <MomentBadge moment={r.moment} small />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: c.text3 }}>
              {r.ing.length} {r.ing.length === 1 ? 'ingredient' : 'ingredients'}
              {hasVariants(r) && ' · variants'}
            </span>
          </div>
        </div>
        <Icon name={open ? 'up' : 'down'} size={18} color={c.text3} />
      </button>
      {open && (
        <div className="col" style={{ gap: 8, padding: '0 14px 12px 62px' }}>
          {r.desc && <p style={{ fontSize: 13.5, lineHeight: '19px', color: c.text2 }}>{r.desc}</p>}
          {r.ing.length === 0 && <p style={{ fontSize: 13.5, color: c.text3 }}>No ingredients.</p>}
          {r.ing.map(([name, , , variants], j) => (
            <div key={name + j} className="row" style={{ gap: 10, alignItems: 'baseline' }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, flexShrink: 0, backgroundColor: c.bar, transform: 'translateY(-2px)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>
                {name}
                {variants?.map((v) => (
                  <span key={v} style={{ fontWeight: 600, color: c.text3 }}>
                    {' '}
                    or <span style={{ fontWeight: 700, color: c.text2 }}>{v.toLowerCase()}</span>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ImportSheet() {
  const { addRecipes, closeSheet, goTo, toast } = useStore();
  const [text, setText] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  // Only if the clipboard can't be read: a box to paste into by hand (long-press › Paste).
  const [manual, setManual] = useState(false);
  // Parsed once per paste: the recipes get their ids here, and the unfolded one is found by id.
  const res = useMemo(() => (text.trim() ? parseImport(text) : null), [text]);

  const load = (t: string) => {
    setText(t);
    setOpenId(null);
  };

  // Handy to hand the format to someone (or an AI) writing recipes. Without clipboard access
  // (an old browser, or no permission), the example is loaded here instead.
  const copyExample = async () => {
    try {
      await navigator.clipboard.writeText(IMPORT_SAMPLE);
      toast('Example copied');
    } catch {
      load(IMPORT_SAMPLE);
      toast('Example loaded below');
    }
  };

  // Reads the clipboard directly (iOS asks with its own small "Paste" bubble).
  const paste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip.trim()) toast('The clipboard is empty');
      else load(clip);
    } catch {
      setManual(true);
      toast('Long-press in the box, then Paste');
    }
  };

  const doImport = () => {
    if (!res?.ok) return;
    addRecipes(res.recipes);
    closeSheet();
    goTo('recipes');
    const n = res.recipes.length;
    toast(`${n} ${n > 1 ? 'recipes' : 'recipe'} imported`);
  };

  return (
    <SheetFrame
      title="Import recipes"
      footer={
        <>
          <Button label="Cancel" variant="outline" onClick={closeSheet} />
          <Button label="Import" icon="upload" onClick={doImport} disabled={!res?.ok} style={{ flex: 1 }} />
        </>
      }>
      <p style={{ fontSize: 14, lineHeight: '20px', color: c.text2 }}>
        Copy recipes written as JSON, like the example, then tap Paste. Fields: <strong style={{ fontWeight: 800, color: c.text }}>ingredients</strong>,
        title (optional), description, meal (lunch, dinner or both) and icon (plate, bowl, tart, salad, meat, fish, eggs, toast). An ingredient written as a
        list has variants: ["pasta", "rice"].
      </p>
      <div className="row" style={{ gap: 8 }}>
        <Button label="Paste" icon="paste" height={46} onClick={paste} style={{ flex: 1 }} />
        <Button label="Copy example" icon="copy" variant="outline" height={46} onClick={copyExample} style={{ flex: 1 }} />
      </div>

      {/* inputMode="none": pasted into, never typed in, so no keyboard shrinking the sheet. */}
      {manual && (
        <TextArea
          className="code"
          value={text}
          onChangeText={load}
          inputMode="none"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label="JSON content"
          placeholder="Long-press here, then Paste."
          style={{ height: 100 }}
        />
      )}

      {!res && !manual && <EmptyState icon="paste" title="Nothing pasted yet" body="The recipes found in what you paste show up here before you import them." />}

      {res && (
        <div className="row" style={{ gap: 8, color: res.ok ? c.accentText : c.warm }}>
          <Icon name={res.ok ? 'check' : 'alert'} size={18} />
          <div style={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}>{res.msg}</div>
          <Button label="Clear" variant="outline" height={34} onClick={() => load('')} />
        </div>
      )}

      {res?.ok && (
        <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
          {res.recipes.map((r, j) => (
            <PreviewRow key={r.id} recipe={r} first={j === 0} open={openId === r.id} onToggle={() => setOpenId(openId === r.id ? null : r.id)} />
          ))}
        </Card>
      )}
    </SheetFrame>
  );
}
