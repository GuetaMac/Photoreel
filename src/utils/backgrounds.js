// Board backgrounds — the mat/border color behind the photos (like
// the navy border on a printed photobooth strip), never the photos
// themselves. `swatch` drives the picker UI, `draw` renders the same
// color onto the export canvas so the download matches what was picked.
export const BACKGROUNDS = [
  {
    id: 'navy',
    label: 'Midnight Navy',
    swatch: '#1b2340',
    ink: '#f5f2e9',
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#212b4d')
      g.addColorStop(1, '#161d38')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
  },
  {
    id: 'noir',
    label: 'Noir',
    swatch: '#17151a',
    ink: '#f0ebdd',
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#1d1a20')
      g.addColorStop(1, '#111014')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
  },
  {
    id: 'wine',
    label: 'Wine',
    swatch: '#4a1e2b',
    ink: '#f3e6dc',
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#552332')
      g.addColorStop(1, '#3c1723')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    swatch: '#1e3327',
    ink: '#efe9d8',
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#243e2e')
      g.addColorStop(1, '#16281e')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
  },
  {
    id: 'blush',
    label: 'Blush',
    swatch: '#e9cfc6',
    ink: '#3b2a26',
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#eed6cd')
      g.addColorStop(1, '#e2c2b7')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
  },
  {
    id: 'cream',
    label: 'Cream',
    swatch: '#f1e9d8',
    ink: '#2b2420',
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#f5efe1')
      g.addColorStop(1, '#ece1ca')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
  },
  {
    id: 'rose',
    label: 'Rose Gold',
    swatch: '#c98a8a',
    ink: '#3c2020',
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#d99a97')
      g.addColorStop(1, '#b8716f')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
  },
  {
    id: 'lavender',
    label: 'Lavender',
    swatch: '#8a7cae',
    ink: '#2a2338',
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#9c8dc2')
      g.addColorStop(1, '#786a9e')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
  },
]

export const getBackground = (id) => BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0]
