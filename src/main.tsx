import { createRoot } from 'react-dom/client';

import { App } from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StoreProvider } from '@/state/store';

import './styles.css';

// iOS Safari only applies :active styles (the pressed look) once a touch listener exists.
document.addEventListener('touchstart', () => {}, { passive: true });

// No <StrictMode>: its double-run effects would sign in two anonymous Supabase users in dev.
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <StoreProvider>
      <App />
    </StoreProvider>
  </ErrorBoundary>,
);
