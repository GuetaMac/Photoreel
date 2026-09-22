// Filter presets — same string works for both the CSS live-preview
// and the canvas ctx.filter used when compositing the final image,
// so what you see while shooting is exactly what gets exported.
export const FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'bw', label: 'B&W', css: 'grayscale(1) contrast(1.1)' },
  { id: 'sepia', label: 'Sepia', css: 'sepia(0.8) contrast(1.05) brightness(1.02)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.35) saturate(1.3) contrast(0.9) brightness(1.05)' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.6) contrast(1.15) brightness(1.03)' },
  { id: 'cool', label: 'Cool', css: 'saturate(1.1) hue-rotate(-8deg) brightness(1.05) contrast(1.05)' },
  { id: 'warm', label: 'Warm', css: 'saturate(1.15) hue-rotate(8deg) brightness(1.05) sepia(0.15)' },
  { id: 'soft', label: 'Soft', css: 'brightness(1.08) contrast(0.92) saturate(0.95)' },
  { id: 'dreamy', label: 'Dreamy', css: 'brightness(1.1) contrast(0.92) saturate(1.15) sepia(0.12) hue-rotate(-4deg)' },
  { id: 'golden', label: 'Golden Hour', css: 'saturate(1.25) brightness(1.06) sepia(0.25) hue-rotate(4deg) contrast(1.02)' },
]

export const getFilter = (id) => FILTERS.find((f) => f.id === id) || FILTERS[0]
