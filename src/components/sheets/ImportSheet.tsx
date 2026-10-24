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
  const [text, setText] = useState(IMPORT_SAMPLE);
  const res = parseImport(text);

  const doImport = () => {
    if (!res.ok) return;
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
          <Button label="Import" icon="upload" onClick={doImport} disabled={!res.ok} style={{ flex: 1 }} />
        </>
      }>
      <p style={{ fontSize: 14, lineHeight: '20px', color: c.text2 }}>
        Paste a JSON array. Supported fields: <strong style={{ fontWeight: 800, color: c.text }}>title</strong>, description, ingredients, meal (lunch,
        dinner or both) and icon (plate, bowl, tart, salad, meat, fish, eggs, toast).
      </p>
      <TextArea
        className="code"
        value={text}
        onChangeText={setText}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="JSON content"
        style={{ height: 300 }}
      />
      <div className="row" style={{ gap: 8, color: res.ok ? c.accentText : c.warm }}>
        <Icon name={res.ok ? 'check' : 'alert'} size={18} />
        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}>{res.msg}</div>
      </div>
    </SheetFrame>
  );
}
