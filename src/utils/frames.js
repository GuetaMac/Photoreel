// Each frame defines a "photo area" (fractions 0–1, relative to
// photoAreaW x photoAreaH) that both the live shooting-stage preview
// and the canvas compositor read from — so what pins onto the board
// while shooting is exactly what lands in the final export.
export const FRAMES = [
  {
    id: 'strip',
    label: 'Classic Strip',
    shots: 4,
    layout: 'strip',
    photoAreaW: 700,
    photoAreaH: 2076,
    slots: [
      { x: 0.0286, y: 0.0096, w: 0.9429, h: 0.2408, rot: 0 },
      { x: 0.0286, y: 0.2562, w: 0.9429, h: 0.2408, rot: 0 },
      { x: 0.0286, y: 0.5028, w: 0.9429, h: 0.2408, rot: 0 },
      { x: 0.0286, y: 0.7494, w: 0.9429, h: 0.2408, rot: 0 },
    ],
  },
  {
    id: 'collage',
    label: 'Scatter',
    shots: 4,
    layout: 'collage',
    photoAreaW: 1000,
    photoAreaH: 1150,
    slots: [
      { x: 0.05, y: 0.04, w: 0.42, h: 0.28, rot: -4 },
      { x: 0.52, y: 0.02, w: 0.43, h: 0.22, rot: 3 },
      { x: 0.04, y: 0.40, w: 0.34, h: 0.24, rot: 2.5 },
      { x: 0.41, y: 0.32, w: 0.54, h: 0.42, rot: -2 },
    ],
  },
  {
    id: 'grid',
    label: 'Even Grid',
    shots: 4,
    layout: 'grid',
    photoAreaW: 1000,
    photoAreaH: 1150,
    slots: [
      { x: 0.05, y: 0.04, w: 0.42, h: 0.40, rot: 0 },
      { x: 0.53, y: 0.04, w: 0.42, h: 0.40, rot: 0 },
      { x: 0.05, y: 0.50, w: 0.42, h: 0.40, rot: 0 },
      { x: 0.53, y: 0.50, w: 0.42, h: 0.40, rot: 0 },
    ],
  },
  {
    id: 'single',
    label: 'Solo',
    shots: 1,
    layout: 'single',
    photoAreaW: 1000,
    photoAreaH: 1000,
    slots: [{ x: 0.08, y: 0.05, w: 0.84, h: 0.9, rot: -1 }],
  },
]

export const getFrame = (id) => FRAMES.find((f) => f.id === id) || FRAMES[0]
