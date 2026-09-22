function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// Stretches the luminance histogram so washed-out / flat webcam shots
// get real blacks and whites back, instead of sitting in the murky
// middle of the range.
function autoLevels(imageData) {
  const data = imageData.data;
  const total = data.length / 4;
  const hist = new Uint32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    const l =
      (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) | 0;
    hist[l]++;
  }

  const clip = total * 0.01;
  let low = 0;
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc > clip) {
      low = i;
      break;
    }
  }
  let high = 255;
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += hist[i];
    if (acc > clip) {
      high = i;
      break;
    }
  }
  const range = Math.max(high - low, 1);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(((data[i] - low) / range) * 255);
    data[i + 1] = clamp(((data[i + 1] - low) / range) * 255);
    data[i + 2] = clamp(((data[i + 2] - low) / range) * 255);
  }
}

// Mild unsharp mask — a 3x3 sharpen kernel blended with the original
// at `amount` strength, which recovers perceived detail that gets
// lost to webcam/phone compression without haloing artifacts.
function sharpen(imageData, width, height, amount) {
  const src = imageData.data;
  const copy = new Uint8ClampedArray(src);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const base = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += copy[idx] * kernel[k];
            k++;
          }
        }
        const idx = base + c;
        src[idx] = clamp(copy[idx] + (sum - copy[idx]) * amount);
      }
    }
  }
}

// Soft-glow skin smoothing: blend a lightly blurred copy back over the
// sharpened base at low opacity. This softens skin texture/blemishes
// without touching the sharp edges (eyes, hair, jewelry) underneath,
// giving a flattering "beauty mode" look instead of a blurry photo.
function softGlow(sourceCanvas, amount = 0.28, blurPx = 3) {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  const blurred = document.createElement("canvas");
  blurred.width = w;
  blurred.height = h;
  const bctx = blurred.getContext("2d");
  bctx.filter = `blur(${blurPx}px)`;
  bctx.drawImage(sourceCanvas, 0, 0);

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  octx.drawImage(sourceCanvas, 0, 0);
  octx.globalAlpha = amount;
  octx.drawImage(blurred, 0, 0);
  octx.globalAlpha = 1;

  return out;
}

// Final color grade: a gentle saturation/brightness/contrast lift so
// exported shots look crisp and vibrant instead of flat webcam output.
function colorPop(sourceCanvas) {
  const out = document.createElement("canvas");
  out.width = sourceCanvas.width;
  out.height = sourceCanvas.height;
  const ctx = out.getContext("2d");
  ctx.filter = "saturate(1.14) brightness(1.03) contrast(1.05)";
  ctx.drawImage(sourceCanvas, 0, 0);
  return out;
}

export async function enhanceImage(dataUrl) {
  const img = await loadImage(dataUrl);

  // Stage 1 — auto-levels + sharpen on raw pixel data (fixes flat,
  // washed-out webcam exposure and recovers perceived detail).
  const base = document.createElement("canvas");
  base.width = img.width;
  base.height = img.height;
  const baseCtx = base.getContext("2d");
  baseCtx.drawImage(img, 0, 0);

  const imageData = baseCtx.getImageData(0, 0, base.width, base.height);
  autoLevels(imageData);
  sharpen(imageData, base.width, base.height, 0.5);
  baseCtx.putImageData(imageData, 0, 0);

  // Stage 2 — soft-glow beauty smoothing.
  const glowed = softGlow(base);

  // Stage 3 — final color grade / vibrance pop.
  const finalCanvas = colorPop(glowed);

  return finalCanvas.toDataURL("image/png");
}
