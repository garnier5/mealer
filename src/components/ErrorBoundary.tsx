import { Component, type ErrorInfo, type ReactNode } from 'react';

import { resetLocalData } from '@/state/store';

/**
 * Last line of defense: an error while rendering shows this screen instead of a blank page.
 * It sits outside the store, so "Try again" remounts the whole app and re-reads the saved data.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mealer crashed', error, info.componentStack);
  }

  retry = () => this.setState({ error: null });

  reset = () => {
    const ok = window.confirm(
      "Erase this device's copy of Mealer? With cloud sync, your data comes back from the server once you're signed in; changes not synced yet are lost.",
    );
    if (!ok) return;
    resetLocalData();
    this.retry();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash" role="alert">
        <h1 className="title" style={{ fontSize: 24, lineHeight: '30px' }}>
          Something went wrong
        </h1>
        <p>Mealer couldn't display this screen. Try again; if it keeps happening, reset this device's copy of the data.</p>
        <button type="button" className="btn btn-primary" style={{ height: 52, borderRadius: 16, padding: '0 16px' }} onClick={this.retry}>
          Try again
        </button>
        <button type="button" className="btn btn-outline" style={{ height: 52, borderRadius: 16, padding: '0 16px' }} onClick={this.reset}>
          Reset this device
        </button>
      </div>
    );
  }
}
