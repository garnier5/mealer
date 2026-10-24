import { Icon } from '@/components/Icon';
import { SheetFrame } from '@/components/sheets/SheetFrame';
import { Button, Card, Label } from '@/components/ui';
import { useStore } from '@/state/store';
import { c } from '@/theme/theme';

const STATUS_TEXT = {
  signedOut: 'Signed out',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline · changes will sync later',
} as const;

export function AccountSheet() {
  const { cloud, ask, closeSheet } = useStore();

  if (cloud.status === 'off') {
    return (
      <SheetFrame title="Account">
        <p style={{ fontSize: 14, lineHeight: '20px', color: c.text2 }}>
          Cloud sync isn't set up in this build. Add VITE_SUPABASE_URL and VITE_SUPABASE_KEY to the .env file, then rebuild the app.
        </p>
      </SheetFrame>
    );
  }

  const offline = cloud.status === 'offline';
  const confirmSignOut = () =>
    ask({
      title: 'Sign out?',
      body: "This device's copy of the data is erased; it comes back when you sign in again. Changes not synced yet are lost.",
      confirm: 'Sign out',
      destructive: true,
      onConfirm: () => {
        closeSheet();
        cloud.signOut();
      },
    });

  return (
    <SheetFrame title="Account">
      <div className="row" style={{ gap: 8, color: offline ? c.warm : c.accentText }}>
        <Icon name={offline ? 'cloudOff' : 'cloud'} size={18} />
        <span style={{ fontSize: 14, fontWeight: 800 }}>{STATUS_TEXT[cloud.status]}</span>
      </div>

      <Card style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="row" style={{ gap: 8, color: c.text2 }}>
          <Icon name="users" size={17} />
          <Label>Signed in as</Label>
        </div>
        <div className="ellipsis" style={{ fontSize: 17, fontWeight: 800, color: c.text }}>
          {cloud.account?.email}
        </div>
        <p style={{ fontSize: 13.5, lineHeight: '19px', color: c.text2 }}>
          Everyone with a Mealer account shares the same week, recipes and shopping list, updated live on every device.
        </p>
      </Card>

      <Button label="Sign out" variant="warm" height={44} onClick={confirmSignOut} />
    </SheetFrame>
  );
}
