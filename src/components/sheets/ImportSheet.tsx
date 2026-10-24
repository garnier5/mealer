import { useState } from 'react';

import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, TextArea } from '@/components/ui';
import { IMPORT_SAMPLE } from '@/data/recipes';
import { parseImport } from '@/lib/helpers';
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
      toast('Example pasted in the box');
    }
  };

  // The long-press menu is easy to miss inside a scrolling sheet: read the clipboard directly
  // (iOS asks with its own small "Paste" bubble). Refused or unsupported: say how to do it by hand.
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
        Paste a JSON array, like the example. Fields: <strong style={{ fontWeight: 800, color: c.text }}>ingredients</strong>, title (optional),
        description, meal (lunch, dinner or both) and icon (plate, bowl, tart, salad, meat, fish, eggs, toast). Write an ingredient as a list to give it
        variants: ["pasta", "rice"].
      </p>
      <div className="row" style={{ gap: 8 }}>
        <Button label="Paste" icon="paste" variant="tint" height={42} onClick={paste} style={{ flex: 1 }} />
        <Button label="Copy example" icon="copy" variant="outline" height={42} onClick={copyExample} style={{ flex: 1 }} />
      </div>
      <TextArea
        className="code"
        value={text}
        onChangeText={setText}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="JSON content"
        placeholder={IMPORT_SAMPLE}
        style={{ height: 300 }}
      />
      {res && (
        <div className="row" style={{ gap: 8, color: res.ok ? c.accentText : c.warm }}>
          <Icon name={res.ok ? 'check' : 'alert'} size={18} />
          <div style={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}>{res.msg}</div>
        </div>
      )}
    </SheetFrame>
  );
}
