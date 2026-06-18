# Amit Website

React + Vite website ready for deployment on Vercel.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Vercel Settings

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

The included `vercel.json` contains the production build settings and a fallback rewrite to `index.html` for client-side routes.
