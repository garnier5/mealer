import { useLayoutEffect, type ComponentType } from 'react';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Icon, type IconName } from '@/components/Icon';
import { SheetHost } from '@/components/sheets/SheetHost';
import { Toast } from '@/components/Toast';
import { RecipesScreen } from '@/screens/RecipesScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { SignInScreen } from '@/screens/SignInScreen';
import { ShoppingScreen } from '@/screens/ShoppingScreen';
import { WeekScreen } from '@/screens/WeekScreen';
import { useStore } from '@/state/store';
import { applyTheme } from '@/theme/theme';
import type { Tab } from '@/types';

const TABS: { key: Tab; title: string; icon: IconName; Screen: ComponentType }[] = [
  { key: 'week', title: 'My week', icon: 'calendar', Screen: WeekScreen },
  { key: 'search', title: 'Search', icon: 'search', Screen: SearchScreen },
  { key: 'recipes', title: 'Recipes', icon: 'book', Screen: RecipesScreen },
  { key: 'shopping', title: 'Shopping', icon: 'basket', Screen: ShoppingScreen },
];

export function App() {
  const { t, dark, tab, goTo, cloud } = useStore();

  // Before paint, so the first frame already has the right colors.
  useLayoutEffect(() => applyTheme(t, dark), [t, dark]);

  // With sync set up, the app is for signed-in accounts only.
  if (cloud.checking) return null;
  if (cloud.needsSignIn) {
    return (
      <main className="main">
        <SignInScreen />
      </main>
    );
  }

  // Every screen stays mounted (like native tabs), keeping its scroll position and drafts.
  // Tapping the current tab again scrolls it back to the top.
  const select = (key: Tab) => {
    if (key === tab) document.querySelector(`[data-tab="${key}"] .screen`)?.scrollTo({ top: 0, behavior: 'smooth' });
    else goTo(key);
  };

  return (
    <>
      <main className="main">
        {TABS.map(({ key, Screen }) => (
          <div key={key} data-tab={key} hidden={key !== tab}>
            <Screen />
          </div>
        ))}
      </main>
      <nav className="tabbar">
        {TABS.map((x) => (
          <button key={x.key} type="button" className="tab" aria-current={x.key === tab ? 'page' : undefined} onClick={() => select(x.key)}>
            <span className="tab-pill">
              <Icon name={x.icon} size={22} />
            </span>
            {x.title}
          </button>
        ))}
      </nav>
      <Toast />
      <SheetHost />
      <ConfirmDialog />
    </>
  );
}
