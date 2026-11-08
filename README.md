# Strip Booth

A photobooth that runs entirely in the browser. Take 3 photos (retake any of them), pick a strip backdrop and filter, add stickers and text, then download the strip as a PNG. No backend; nothing is uploaded anywhere.

Built with React 18 + Vite.

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173) and allow camera access.

## Build for hosting

```bash
npm run build
```

This creates a `dist/` folder of static files. Upload it to Netlify, Vercel, GitHub Pages or any static host. The site must be served over **https** (or localhost), or browsers won't allow the camera.

## Project layout

```
src/
  main.jsx                     entry point
  App.jsx                      phase flow + shared state
  styles.css                   all styles
  lib/strip.js                 strip size, backdrops, filters, fonts, canvas renderer, PNG export
  components/
    ShootPhase.jsx             webcam, countdown, 3 slots with retakes
    BackdropPhase.jsx          backdrop + filter picker
    DecoratePhase.jsx          stickers, text, caption
    StripCanvas.jsx            live strip preview with drag-to-move
    DonePhase.jsx              final preview, download, start over
```

## Customising

- **Add a backdrop:** add an entry to `BACKDROPS` in `src/lib/strip.js`. `draw(ctx)` paints a 600 × 1500 canvas; `ink` is the caption colour.
- **Add stickers:** add emoji to `STICKERS`.
- **Change strip size or photo layout:** edit `W`, `H`, `PW`, `PH`, `PX` and `PYS` at the top of `strip.js`.
- **Add a filter:** add to `FILTERS`; `css` is any CSS filter string.
