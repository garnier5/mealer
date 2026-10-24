import { useState, type FormEvent } from 'react';

import { Button, Eyebrow, Field, Label, Title } from '@/components/ui';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

/** Shown instead of the app while sync is set up and nobody is signed in on this device. */
export function SignInScreen() {
  const { cloud } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = email.trim().length > 0 && password.length > 0 && !busy;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    const err = await cloud.signIn(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <div className="screen">
      <form className="screen-inner sign-in" onSubmit={submit}>
        <img src={import.meta.env.BASE_URL + 'icon.svg'} alt="" width={64} height={64} style={{ borderRadius: 16 }} />
        <div className="col" style={{ gap: 2 }}>
          <Eyebrow>Mealer</Eyebrow>
          <Title>Sign in</Title>
        </div>
        <p style={{ fontSize: 14, lineHeight: '20px', color: c.text2 }}>
          Accounts are created by whoever runs this Mealer. Ask them for yours if you don't have one.
        </p>

        <label className="col" style={{ gap: 6 }}>
          <Label>Email</Label>
          <Field type="email" value={email} onChangeText={setEmail} autoComplete="username" inputMode="email" autoCapitalize="none" required />
        </label>
        <label className="col" style={{ gap: 6 }}>
          <Label>Password</Label>
          <Field type="password" value={password} onChangeText={setPassword} autoComplete="current-password" required />
        </label>

        {error && (
          <p role="alert" style={{ fontSize: 13.5, lineHeight: '19px', fontWeight: 700, color: c.warm }}>
            {error}
          </p>
        )}

        <Button submit label={busy ? 'Signing in…' : 'Sign in'} disabled={!ready} />
      </form>
    </div>
  );
}
