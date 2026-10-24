import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Card, MomentBadge, RecipeTile, TextArea } from '@/components/ui';
import { IMPORT_SAMPLE } from '@/data/recipes';
import { hasVariants, parseImport, recipeTitle } from '@/lib/helpers';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

export function ImportSheet() {
  const { addRecipes, closeSheet, goTo, toast } = useStore();
  const [text, setText] = useState('');
  const res = text.trim() ? parseImport(text) : null;

  // Handy to hand the format to someone (or an AI) writing recipes. Without clipboard access
  // (an old browser, or no permission), the example goes into the box instead.
  const copyExample = async () => {
    try {
      await navigator.clipboard.writeText(IMPORT_SAMPLE);
      toast('Example copied');
    } catch {
      setText(IMPORT_SAMPLE);
      toast('Example put in the box');
    }
  };

  // Reads the clipboard directly (iOS asks with its own small "Paste" bubble).
  // Refused or unsupported: say how to do it by hand.
  const paste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip.trim()) toast('The clipboard is empty');
      else setText(clip);
    } catch {
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

      {/* Pasted, not typed: inputMode="none" keeps the keyboard down (so the sheet doesn't shrink)
          while a long-press still offers Paste. */}
      <TextArea
        className="code"
        value={text}
        onChangeText={setText}
        inputMode="none"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="JSON content"
        placeholder="Tap Paste, or long-press here and choose Paste."
        style={{ height: 120 }}
      />

      {res && (
        <div className="row" style={{ gap: 8, color: res.ok ? c.accentText : c.warm }}>
          <Icon name={res.ok ? 'check' : 'alert'} size={18} />
          <div style={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}>{res.msg}</div>
          <Button label="Clear" variant="outline" height={34} onClick={() => setText('')} />
        </div>
      )}

      {/* What will be imported, so it's obvious the paste worked. */}
      {res?.ok && (
        <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
          {res.recipes.map((r, j) => (
            <div key={r.id} className="row" style={{ gap: 12, padding: '10px 12px', borderTop: j ? `1px solid ${c.line}` : 0 }}>
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
            </div>
          ))}
        </Card>
      )}
    </SheetFrame>
  );
}
