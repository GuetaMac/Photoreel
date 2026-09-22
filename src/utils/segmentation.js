// Person segmentation + background swap, powered by MediaPipe's
// selfie segmenter running entirely client-side (WASM/GPU — no
// backend, no upload). Run `npm install @mediapipe/tasks-vision`
// before building.
//
// Two separate segmenter instances are kept because MediaPipe does
// not allow mixing "IMAGE" and "VIDEO" running modes on one instance:
//   - the IMAGE segmenter handles one-off stills (captured shots)
//   - the VIDEO segmenter handles the continuous live preview, which
//     needs a monotonically increasing timestamp per call
import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";
const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

let imageSegmenterPromise = null;
let videoSegmenterPromise = null;

async function loadSegmenter(runningMode) {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  return ImageSegmenter.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode,
    outputCategoryMask: false,
    outputConfidenceMasks: true,
  });
}

// Lazily creates (and caches) the stills segmenter.
export function getImageSegmenter() {
  if (!imageSegmenterPromise) imageSegmenterPromise = loadSegmenter("IMAGE");
  return imageSegmenterPromise;
}

// Lazily creates (and caches) the live-video segmenter. Call this once
// up front (e.g. on mount) so it's warm by the time the camera starts.
export function getVideoSegmenter() {
  if (!videoSegmenterPromise) videoSegmenterPromise = loadSegmenter("VIDEO");
  return videoSegmenterPromise;
}

function confidenceResultToMaskCanvas(result, width, height) {
  const confidenceMask = result.confidenceMasks?.[0];
  if (!confidenceMask) return null;

  const maskW = confidenceMask.width;
  const maskH = confidenceMask.height;
  const data = confidenceMask.getAsFloat32Array();

  // Render the model's native-resolution mask into its own canvas
  // first (white = person, alpha = confidence), then let the browser
  // scale it onto the target size.
  const raw = document.createElement("canvas");
  raw.width = maskW;
  raw.height = maskH;
  const rctx = raw.getContext("2d");
  const imageData = rctx.createImageData(maskW, maskH);
  for (let i = 0; i < data.length; i++) {
    const alpha = data[i] < 0 ? 0 : data[i] > 1 ? 255 : data[i] * 255;
    const j = i * 4;
    imageData.data[j] = 255;
    imageData.data[j + 1] = 255;
    imageData.data[j + 2] = 255;
    imageData.data[j + 3] = alpha;
  }
  rctx.putImageData(imageData, 0, 0);
  confidenceMask.close?.();

  if (maskW === width && maskH === height) return raw;

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const octx = out.getContext("2d");
  // Slight blur softens the upscaled mask's edge so the cutout
  // doesn't look pixelated/jagged around hair and shoulders.
  octx.filter = "blur(2px)";
  octx.drawImage(raw, 0, 0, width, height);
  return out;
}

// Segments a still image/canvas. Returns a same-size canvas whose
// alpha channel IS the silhouette (opaque = person, transparent =
// everything else).
export async function segmentStillToMaskCanvas(source, width, height) {
  const segmenter = await getImageSegmenter();
  const result = segmenter.segment(source);
  return confidenceResultToMaskCanvas(result, width, height);
}

// Segments one live <video> frame. `segmenter` must be a VIDEO-mode
// instance (from getVideoSegmenter); `timestampMs` must increase on
// every call (performance.now() works).
export function segmentVideoFrameToMaskCanvas(
  segmenter,
  videoEl,
  timestampMs,
  width,
  height,
) {
  const result = segmenter.segmentForVideo(videoEl, timestampMs);
  return confidenceResultToMaskCanvas(result, width, height);
}

// Composites `source` (video/canvas/img, already at width x height)
// over the chosen board `background` (an entry from backgrounds.js —
// it exposes a .draw(ctx, w, h) method), keeping only the pixels the
// mask marks as "person". Returns a new canvas.
export function compositeOverBackground(
  source,
  maskCanvas,
  background,
  width,
  height,
) {
  const cutout = document.createElement("canvas");
  cutout.width = width;
  cutout.height = height;
  const cctx = cutout.getContext("2d");
  cctx.drawImage(source, 0, 0, width, height);
  if (maskCanvas) {
    cctx.globalCompositeOperation = "destination-in";
    cctx.drawImage(maskCanvas, 0, 0, width, height);
    cctx.globalCompositeOperation = "source-over";
  }

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const octx = out.getContext("2d");
  background.draw(octx, width, height);
  octx.drawImage(cutout, 0, 0);
  return out;
}
