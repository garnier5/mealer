import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { emptyData, emptyPlan, sanitizePick, sanitizeRecipe, SLOT_COUNT } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import type { CustomItem, Data, Picks, Recipe } from '@/types';

/**
 * Cloud sync with Supabase.
 *
 * Every account (created by the admin, sign-ups closed) shares one space: the recipes,
 * the 14 plan slots and the shopping list state are flattened into key/value
 * entries, one row each in the `entries` table. `data.sync.remote` holds the last known server
 * value of every entry, so a three-way comparison tells local edits (pushed) from remote ones
 * (applied). It lives inside `data` so both always change together.
 *
 * Tags and the theme stay per-device.
 */

type Entries = Record<string, unknown>;
type Row = { kind: string; key: string; value: unknown; deleted: boolean };

export type CloudStatus = 'off' | 'signedOut' | 'syncing' | 'synced' | 'offline';
export type Account = { id: string; email: string };

// ── Entries ⇄ data ──

function toEntries(d: Data): Entries {
  const out: Entries = {};
  d.extra.forEach((r) => (out['recipe:' + r.id] = r));
  // A meal with a chosen variant is { id, pick }; without one it stays a plain id.
  d.plan.forEach((id, i) => (out['slot:' + i] = id && d.picks[i]?.length ? { id, pick: d.picks[i] } : id));
  Object.keys(d.checked).forEach((k) => (out['checked:' + k] = true));
  Object.keys(d.removed).forEach((k) => (out['removed:' + k] = true));
  d.custom.forEach((c) => (out['item:' + c.key] = c.name));
  return out;
}

const byId = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });

function fromEntries(e: Entries): Pick<Data, 'extra' | 'plan' | 'picks' | 'checked' | 'removed' | 'custom'> {
  const extra: Recipe[] = [];
  const plan = emptyPlan();
  const picks: Picks = {};
  const checked: Record<string, true> = {};
  const removed: Record<string, true> = {};
  const custom: CustomItem[] = [];
  for (const [id, value] of Object.entries(e)) {
    const i = id.indexOf(':');
    const kind = id.slice(0, i);
    const key = id.slice(i + 1);
    // Server values come from any member's device: never trust their shape.
    if (kind === 'recipe') {
      const r = sanitizeRecipe(value, key);
      if (r) extra.push(r);
    } else if (kind === 'slot' && +key >= 0 && +key < SLOT_COUNT) {
      const meal = value as { id?: unknown; pick?: unknown } | null;
      if (typeof value === 'string') plan[+key] = value;
      else if (meal && typeof meal === 'object' && typeof meal.id === 'string') {
        plan[+key] = meal.id;
        const pick = sanitizePick(meal.pick);
        if (pick.length) picks[+key] = pick;
      }
    } else if (kind === 'checked') checked[key] = true;
    else if (kind === 'removed') removed[key] = true;
    else if (kind === 'item') custom.push({ key, name: String(value).slice(0, 200) });
  }
  extra.sort((a, b) => byId(a.id, b.id));
  custom.sort((a, b) => byId(a.key, b.key));
  return { extra, plan, picks, checked, removed, custom };
}

/** JSON with sorted keys: Postgres jsonb doesn't keep key order. */
function stable(v: unknown): string {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return '{' + Object.keys(o).sort().map((k) => JSON.stringify(k) + ':' + stable(o[k])).join(',') + '}';
  }
  return v === undefined ? 'undefined' : JSON.stringify(v);
}
const same = (a: unknown, b: unknown) => stable(a) === stable(b);

const live = (rows: Row[]): Entries => Object.fromEntries(rows.filter((r) => !r.deleted).map((r) => [r.kind + ':' + r.key, r.value]));

/** Rows to upsert so the server matches local data. Deletions keep the old value. */
function pending(d: Data) {
  const local = toEntries(d);
  const remote = d.sync.remote;
  const rows: Row[] = [];
  const row = (id: string, value: unknown, deleted: boolean) => {
    const i = id.indexOf(':');
    rows.push({ kind: id.slice(0, i), key: id.slice(i + 1), value, deleted });
  };
  for (const [k, v] of Object.entries(local)) if (!(k in remote) || !same(v, remote[k])) row(k, v, false);
  for (const [k, v] of Object.entries(remote)) if (!(k in local)) row(k, v, true);
  return rows;
}

/** Applies server changes (undefined = deleted) unless the same entry has an unpushed local edit. */
function merge(d: Data, changes: Entries): Data {
  const old = d.sync.remote;
  const fresh = Object.entries(changes).filter(([k, v]) => !same(old[k], v));
  if (!fresh.length) return d; // e.g. the echo of our own write
  const remote = { ...old };
  const local = toEntries(d);
  let touched = false;
  for (const [k, v] of fresh) {
    if (v === undefined) delete remote[k];
    else remote[k] = v;
    if (same(local[k], old[k]) && !same(local[k], v)) {
      if (v === undefined) delete local[k];
      else local[k] = v;
      touched = true;
    }
  }
  return { ...d, ...(touched ? fromEntries(local) : null), sync: { linked: true, remote } };
}

/** Folds a full server snapshot into local data. */
function reconcile(d: Data, rows: Row[]): Data {
  const server = live(rows);
  if (d.sync.linked) {
    const changes: Entries = {};
    for (const k of new Set([...Object.keys(d.sync.remote), ...Object.keys(server)])) {
      if (!same(d.sync.remote[k], server[k])) changes[k] = server[k];
    }
    return merge(d, changes);
  }
  // First sync on this device.
  // Empty server (first device ever): everything local gets uploaded.
  if (!rows.length) return { ...d, sync: { linked: true, remote: {} } };
  // Otherwise take the server's data, but bring this device's own recipes along.
  const merged = { ...server };
  for (const [k, v] of Object.entries(toEntries(d))) if (k.startsWith('recipe:') && !(k in merged)) merged[k] = v;
  return { ...d, ...fromEntries(merged), sync: { linked: true, remote: server } };
}

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase!.from('entries').select('kind,key,value,deleted').order('kind').order('key').range(from, from + 999);
    if (error) throw error;
    rows.push(...(data as Row[]));
    if (data.length < 1000) return rows;
  }
}

// ── Hook ──

export function useCloud(data: Data, setData: Dispatch<SetStateAction<Data>>) {
  const [account, setAccount] = useState<Account | null>(null);
  const [authChecked, setAuthChecked] = useState(!supabase);
  const [status, setStatus] = useState<CloudStatus>('syncing');
  const [tick, setTick] = useState(0);

  const dataRef = useRef(data);
  dataRef.current = data;
  const busy = useRef(false);
  const pulling = useRef(false);
  const uid = account?.id ?? null;

  // The session lives in localStorage, so a signed-in device opens straight into the app, even offline.
  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setAccount(session ? { id: session.user.id, email: session.user.email ?? '' } : null);
      setAuthChecked(true);
      // Signed out (by hand, or the account was removed): this device forgets the shared data.
      if (event === 'SIGNED_OUT') setData((d) => ({ ...emptyData(), themePref: d.themePref }));
    });
    return () => sub.subscription.unsubscribe();
  }, [setData]);

  const pull = useCallback(async () => {
    if (!supabase || pulling.current) return;
    pulling.current = true;
    setStatus('syncing');
    try {
      const rows = await fetchAll();
      setData((d) => reconcile(d, rows));
      setStatus('synced');
      setTick((n) => n + 1); // push whatever is still pending
    } catch {
      setStatus('offline');
    } finally {
      pulling.current = false;
    }
  }, [setData]);

  // Live updates from the other devices, plus a full pull on (re)connect, when the app comes back
  // to the foreground and when the network returns.
  useEffect(() => {
    if (!supabase || !uid) return;
    const sb = supabase;
    pull();
    const channel = sb
      .channel('entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, (payload) => {
        const r = payload.new as Partial<Row>;
        if (!r.kind || r.key === undefined) return;
        const k = r.kind + ':' + r.key;
        setData((d) => (d.sync.linked ? merge(d, { [k]: r.deleted ? undefined : r.value }) : d));
      })
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') pull();
      });
    const wake = () => {
      if (document.visibilityState === 'visible') pull();
    };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    return () => {
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
      sb.removeChannel(channel);
    };
  }, [uid, pull, setData]);

  // Push local edits shortly after they happen.
  useEffect(() => {
    if (!supabase || !uid || !data.sync.linked) return;
    const timer = setTimeout(async () => {
      const d = dataRef.current;
      if (busy.current || !d.sync.linked) return;
      const rows = pending(d);
      if (!rows.length) return;
      busy.current = true;
      setStatus('syncing');
      const { error } = await supabase!.from('entries').upsert(rows);
      busy.current = false;
      if (error) {
        setStatus('offline');
        return;
      }
      setStatus('synced');
      // Updating the base re-runs this effect, which pushes anything edited meanwhile.
      setData((x) => {
        if (!x.sync.linked) return x;
        const remote = { ...x.sync.remote };
        for (const r of rows) {
          if (r.deleted) delete remote[r.kind + ':' + r.key];
          else remote[r.kind + ':' + r.key] = r.value;
        }
        return { ...x, sync: { linked: true, remote } };
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [data, uid, tick, setData]);

  // Offline: try again every 20 s.
  useEffect(() => {
    if (status !== 'offline' || !uid) return;
    const timer = setInterval(pull, 20000);
    return () => clearInterval(timer);
  }, [status, uid, pull]);

  return {
    status: (!supabase ? 'off' : !account ? 'signedOut' : status) as CloudStatus,
    account,
    /** Sync is set up but nobody is signed in on this device: show the sign-in screen. */
    needsSignIn: !!supabase && authChecked && !account,
    /** Still reading the saved session (a few ms): render nothing rather than flash the sign-in screen. */
    checking: !!supabase && !authChecked,
    /** Returns an error message, or null on success. */
    signIn: async (email: string, password: string) => {
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (!error) return null;
      if (error.code === 'invalid_credentials') return 'Wrong email or password.';
      if (error.status === 429) return 'Too many attempts. Try again in a few minutes.';
      if (!navigator.onLine || error.name === 'AuthRetryableFetchError') return "Can't reach the server. Check your connection.";
      return error.message;
    },
    /** Always signs this device out, even offline (supabase-js drops the local session whatever the server says). */
    signOut: async () => {
      await supabase!.auth.signOut({ scope: 'local' });
    },
  };
}
