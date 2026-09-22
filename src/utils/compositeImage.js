import { getFilter } from './filters'
import { getBackground } from './backgrounds'

function drawCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height
  const boxRatio = w / h
  let sx, sy, sw, sh

  if (imgRatio > boxRatio) {
    sh = img.height
    sw = sh * boxRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / boxRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

// Plain, uniform photo crop — no rotation, no paper border. Used for
// the classic strip layout where the gap between photos is just the
// board color showing through, like a printed photobooth strip.
function drawPlain(ctx, img, slotPx, filterCss) {
  ctx.save()
  ctx.filter = filterCss === 'none' ? 'none' : filterCss
  drawCover(ctx, img, slotPx.x, slotPx.y, slotPx.w, slotPx.h)
  ctx.restore()
}

// Pinned polaroid — paper border (thicker at the bottom) at a slight
// rotation, used for the scatter/grid/solo layouts.
function drawPolaroid(ctx, img, slotPx, filterCss, scale) {
  const { x, y, w, h, rot } = slotPx
  const border = 10 * scale
  const bottomBorder = 26 * scale
  const cx = x + w / 2
  const cy = y + h / 2

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rot * Math.PI) / 180)
  ctx.translate(-w / 2, -h / 2)

  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 14 * scale
  ctx.shadowOffsetY = 6 * scale
  ctx.fillStyle = '#faf7f0'
  ctx.fillRect(0, 0, w, h)
  ctx.shadowColor = 'transparent'

  ctx.save()
  ctx.filter = filterCss === 'none' ? 'none' : filterCss
  ctx.beginPath()
  ctx.rect(border, border, w - border * 2, h - bottomBorder - border)
  ctx.clip()
  drawCover(ctx, img, border, border, w - border * 2, h - bottomBorder - border)
  ctx.restore()

  ctx.restore()
}

function drawLogoPill(ctx, text, cx, cy, ink, scale) {
  const label = (text || 'photobooth').trim() || 'photobooth'
  ctx.font = `${30 * scale}px 'Space Grotesk', sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const metrics = ctx.measureText(label)
  const padX = 30 * scale
  const padY = 16 * scale
  const boxW = metrics.width + padX * 2
  const boxH = 30 * scale + padY * 2

  ctx.strokeStyle = ink
  ctx.lineWidth = 2 * scale
  roundRectPath(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, boxH / 2)
  ctx.stroke()

  ctx.fillStyle = ink
  ctx.fillText(label, cx, cy + 2 * scale)
}

// shots: array of dataURLs (already enhanced)
// frame: entry from frames.js (layout + slot geometry)
// filterId: entry id from filters.js
// backgroundId: entry id from backgrounds.js
// brandText: label shown inside the footer logo pill
export async function composeImage(shots, frame, filterId, backgroundId, brandText) {
  const filter = getFilter(filterId)
  const background = getBackground(backgroundId)
  const images = await Promise.all(shots.map(loadImage))

  const SCALE = 2
  const FOOTER_H = 150 * SCALE
  const CORNER_RADIUS = 26 * SCALE
  const photoAreaW = frame.photoAreaW * SCALE
  const photoAreaH = frame.photoAreaH * SCALE

  const canvas = document.createElement('canvas')
  canvas.width = photoAreaW
  canvas.height = photoAreaH + FOOTER_H
  const ctx = canvas.getContext('2d')

  // Rounded-corner card clip for the whole export
  roundRectPath(ctx, 0, 0, canvas.width, canvas.height, CORNER_RADIUS)
  ctx.clip()

  background.draw(ctx, canvas.width, canvas.height)

  frame.slots.forEach((slot, i) => {
    if (!images[i]) return
    const slotPx = {
      x: slot.x * photoAreaW,
      y: slot.y * photoAreaH,
      w: slot.w * photoAreaW,
      h: slot.h * photoAreaH,
      rot: slot.rot,
    }
    if (frame.layout === 'strip') {
      drawPlain(ctx, images[i], slotPx, filter.css)
    } else {
      drawPolaroid(ctx, images[i], slotPx, filter.css, SCALE)
    }
  })

  // Footer: brand pill + date, like a printed strip's branding band
  const footerCenterY = photoAreaH + FOOTER_H / 2
  drawLogoPill(ctx, brandText, canvas.width / 2, footerCenterY - 18 * SCALE, background.ink, SCALE)

  ctx.fillStyle = background.ink
  ctx.globalAlpha = 0.85
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.font = `${16 * SCALE}px 'Space Grotesk', sans-serif`
  const dateStr = new Date()
    .toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .split('/')
    .join('.')
  ctx.fillText(dateStr, canvas.width - 26 * SCALE, canvas.height - 22 * SCALE)
  ctx.globalAlpha = 1

  return canvas.toDataURL('image/png')
}
