# Nameboard

A lightweight Progressive Web App for displaying names at airport arrivals. Hold up your phone or tablet in landscape mode to show a name in large, readable text.

## Features

- Large, high-contrast name display optimized for distance readability
- Six built-in color themes
- Orientation-driven UX: landscape = display, portrait = edit
- Works offline after first load (service worker + cache)
- Shareable URLs with name and theme encoded in the hash
- Installable as a home screen app (PWA)
- Screen wake lock keeps the display on
- Auto-fullscreen in display mode
- < 50 KB total, zero external dependencies

## Usage

1. Open the app and type a name
2. Turn your phone sideways to display it
3. Rotate back to portrait to edit

Share a direct link: `https://ashokfernandez-bolt.github.io/nameboard/#name=John+Smith&theme=classic`

## Development

```bash
npm install
npm test          # run tests
npm run build     # copy src/ to dist/
```

## Deployment

Pushes to `main` automatically test and deploy to GitHub Pages via GitHub Actions.
