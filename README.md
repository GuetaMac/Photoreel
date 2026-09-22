# Photobooth App

Web-based photobooth, classic-strip style (like SM mall photobooth kiosks): countdown → multi-shot capture → live filters → auto photo enhancement → uniform 4-shot strip on a customizable mat color, rounded corners, brand pill + date footer → print-ready download. Scatter/Grid/Solo layouts also included as alternatives. Mobile-friendly, front/back camera support.

Default layout is **Classic Strip** — 4 equal-size shots stacked, solid mat-color border, rounded corners, brand-name pill + date in the footer.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Camera access needs `https://` or `localhost` (browser security requirement).

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy that folder to Vercel/Netlify same way as your portfolio site.

## Project structure

```
src/
  App.jsx                    # main flow: setup → shooting → enhancing → review
  App.css                    # component styling
  index.css                  # global styles, fonts, page background
  components/
    FrameSelector.jsx        # layout picker (Classic Strip / Scatter / Grid / Solo)
    BackgroundSelector.jsx   # mat color picker (navy/noir/wine/forest/blush/cream)
    FilterBar.jsx            # filter picker
  utils/
    filters.js               # filter presets (CSS filter strings)
    frames.js                # layout presets — slot positions/sizes/rotation per photo
    backgrounds.js           # mat color presets (canvas-drawn gradients)
    enhanceImage.js          # auto-levels + sharpen, run on each shot after capture
    compositeImage.js        # canvas compositor — builds the final PNG
```

## How it works

1. **Setup stage** — pick a layout, a mat color, a filter, and a label for the footer; live camera preview shows the filter applied.
2. **Shooting stage** — countdown (3s) runs per shot. Each captured photo appears on a live mini-strip preview at its final position (`frames.js` defines slot x/y/w/h/rotation per layout).
3. **Enhancing stage** — each raw shot runs through `enhanceImage.js`: auto contrast/levels (fixes flat, washed-out webcam exposure) + a mild unsharp-mask sharpen, so shots look crisper instead of soft/blurry.
4. **Compose** — `compositeImage.js` draws the enhanced shots onto the chosen mat color at 2x scale (print-ready) inside a rounded-corner card, bakes in the filter via `ctx.filter`, and adds a footer with a pill-outlined brand label + date. The Classic Strip layout crops photos edge-to-edge (gap = mat color showing through); the Scatter/Grid/Solo layouts instead render each photo as a pinned polaroid with a paper border and slight rotation.
5. **Review** — preview the final image, download as PNG, or retake.

## Extending it

- **More filters**: add an entry to `FILTERS` in `src/utils/filters.js`.
- **More layouts**: add an entry (with `slots`: x/y/w/h/rot fractions) to `FRAMES` in `src/utils/frames.js` — the live preview and export both read the same slot data. Set `layout: 'strip'` for a plain edge-to-edge crop, or any other value to get the pinned-polaroid treatment.
- **More mat colors**: add an entry to `BACKGROUNDS` in `src/utils/backgrounds.js` with a `swatch` (CSS, for the picker), an `ink` (text/logo color), and a `draw(ctx, w, h)` function (for the export canvas).
- **Tune the enhancer**: `enhanceImage.js` exposes the sharpen `amount` (0–1) and the auto-levels clip percentage.
- **Logo/branding**: the footer pill text comes from the "label" field in the setup controls (`brandText` in `App.jsx`) — swap it for a fixed string if you want it locked to one brand.
- **QR code sharing**: after `composeImage()` returns a dataURL, upload it to storage and generate a QR (e.g. with the `qrcode` npm package) instead of only offering download.
"# Photoreel" 
