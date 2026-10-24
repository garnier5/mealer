import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// `npm run icons` regenerates every PNG/ICO in public/ from public/icon.svg.
// The drawing already has its own margins (and stays inside the maskable safe zone), so no extra
// padding; the background fills the SVG's rounded corners, iOS and Android round the square themselves.
const background = '#DEDAF0';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background } },
  },
  images: ['public/icon.svg'],
});
