# Bolt Chauffeur Nameboard

A Progressive Web App for displaying passenger names at pickups. Chauffeurs receive a link or scan a QR code to load the passenger's name on their iPad or phone in large, readable text.

## Tech Stack

- **React 19** — component-based UI
- **Tailwind CSS v4** — utility-first styling with CSS variable theming
- **Vite** — fast dev server and production builds
- **Vitest + Testing Library** — unit and component tests

## Features

- Large, high-contrast name display optimized for distance readability
- Five built-in color themes including Bolt Chauffeur green
- Bolt branding with Inter font and logo
- Dynamic theming via CSS variables (no hardcoded colors in components)
- Shareable URLs with name and theme encoded in the hash
- QR codes for easy sharing between devices
- Works offline after first load (service worker + cache)
- Installable as a home screen app (PWA)
- Screen wake lock keeps the display on
- Manual fullscreen toggle for distraction-free display
- WCAG AAA contrast (7:1+) on all themes

## Usage

1. Open the app and type a passenger name (or share a pre-filled link)
2. Tap "Display Name" to show it full-screen
3. Share the link or QR code so the chauffeur can load it on their device

Share a direct link: `https://ashokfernandez-bolt.github.io/nameboard/#name=John+Smith&theme=bolt-chauffeur`

## Development

```bash
npm install
npm run dev       # start dev server
npm test          # run tests
npm run build     # production build to dist/
```

## Deployment

Pushes to `main` automatically test and deploy to GitHub Pages via GitHub Actions.
