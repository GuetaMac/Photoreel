import { useEffect, useRef, useState, useCallback } from "react";
import FilterBar from "./components/FilterBar";
import FrameSelector from "./components/FrameSelector";
import BackgroundSelector from "./components/BackgroundSelector";

import {
  CameraIcon,
  FlipCameraIcon,
  LayoutIcon,
  PaletteIcon,
  SparkleIcon,
  TagIcon,
  TimerIcon,
  SoundOnIcon,
  SoundOffIcon,
  DownloadIcon,
  ShareIcon,
  CopyIcon,
  RefreshIcon,
  RetakeIcon,
  CheckCircleIcon,
  AlertIcon,
  PrintIcon,
} from "./components/Icons";
import { getFilter } from "./utils/filters";
import { getFrame } from "./utils/frames";
import { getBackground } from "./utils/backgrounds";
import { composeImage } from "./utils/compositeImage";
import { enhanceImage } from "./utils/enhanceImage";
import "./App.css";

const TIMER_CHOICES = [3, 5, 10];
const CAPTION_PRESETS = [
  "Bebe & Me",
  "Date Night",
  "Best Friends",
  "Squad Goals",
];

// Prints the final strip twice, side by side, onto one canvas — handy
// for giving one copy away and keeping one, like a real photobooth.
function buildDoubleStrip(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const gap = Math.round(img.width * 0.05);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2 + gap;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      ctx.drawImage(img, img.width + gap, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export default function App() {
  const [stage, setStage] = useState("setup"); // setup | shooting | precheck | enhancing | review
  const [frameId, setFrameId] = useState("strip");
  const [filterId, setFilterId] = useState("none");
  const [backgroundId, setBackgroundId] = useState("navy");
  const [brandText, setBrandText] = useState("photobooth");
  const [facingMode, setFacingMode] = useState("user");
  const [countdown, setCountdown] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [soundOn, setSoundOn] = useState(true);
  const [shots, setShots] = useState([]);
  const [retakingIndex, setRetakingIndex] = useState(null);
  const [enhanceStep, setEnhanceStep] = useState(0);
  const [finalImage, setFinalImage] = useState(null);
  const [printDouble, setPrintDouble] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const captureCanvasRef = useRef(document.createElement("canvas"));
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);

  const frame = getFrame(frameId);
  const filter = getFilter(filterId);
  const background = getBackground(backgroundId);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError(
        "Hindi ma-access ang camera. Paki-check ang browser permissions.",
      );
    }
  }, [facingMode]);

  useEffect(() => {
    if (stage === "setup" || stage === "shooting" || stage === "precheck")
      startCamera();
  }, [startCamera, stage]);

  useEffect(() => {
    return () => {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ---- tiny shutter/tick sounds, synthesized so no audio assets are needed ----
  const getAudioCtx = () => {
    if (!soundOn) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new AC();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const beep = (freq, duration, type = "sine", gain = 0.05) => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  };

  const playTick = () => beep(880, 0.07, "square", 0.03);
  const playShutter = () => beep(200, 0.14, "square", 0.07);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  // Runs one countdown + capture. Shared by the main sequence and by
  // single-shot retakes in the precheck step.
  const runSingleCapture = async () => {
    for (let s = countdownSeconds; s > 0; s--) {
      setCountdown(s);
      playTick();
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCountdown("shoot");
    playShutter();
    const dataUrl = captureFrame();
    await new Promise((r) => setTimeout(r, 350));
    setCountdown(null);
    return dataUrl;
  };

  const runCaptureSequence = async () => {
    setShots([]);
    setStage("shooting");
    const collected = [];

    for (let shotIndex = 0; shotIndex < frame.shots; shotIndex++) {
      const dataUrl = await runSingleCapture();
      collected.push(dataUrl);
      setShots([...collected]);
      if (shotIndex < frame.shots - 1)
        await new Promise((r) => setTimeout(r, 500));
    }

    setStage("precheck");
  };

  const retakeShot = async (index) => {
    setRetakingIndex(index);
    const dataUrl = await runSingleCapture();
    setShots((prev) => {
      const next = [...prev];
      next[index] = dataUrl;
      return next;
    });
    setRetakingIndex(null);
  };

  const confirmShots = async () => {
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());

    setStage("enhancing");
    const enhanced = [];
    for (let i = 0; i < shots.length; i++) {
      setEnhanceStep(i + 1);
      enhanced.push(await enhanceImage(shots[i]));
    }

    const composed = await composeImage(
      enhanced,
      frame,
      filterId,
      backgroundId,
      brandText,
    );
    setFinalImage(composed);
    setStage("review");
  };

  const handleRetake = () => {
    setFinalImage(null);
    setShots([]);
    setEnhanceStep(0);
    setPrintDouble(false);
    setStage("setup");
  };

  const handleDownload = async () => {
    const link = document.createElement("a");
    link.href = printDouble ? await buildDoubleStrip(finalImage) : finalImage;
    link.download = `photobooth-${Date.now()}.png`;
    link.click();
  };

  const switchCamera = () =>
    setFacingMode((m) => (m === "user" ? "environment" : "user"));

  const canShare =
    typeof navigator !== "undefined" &&
    !!navigator.share &&
    !!navigator.canShare;

  const handleShare = async () => {
    if (!finalImage) return;
    try {
      const res = await fetch(finalImage);
      const blob = await res.blob();
      const file = new File([blob], `photobooth-${Date.now()}.png`, {
        type: "image/png",
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My photobooth strip" });
      }
    } catch {
      // Share was cancelled or unsupported — download button remains the reliable path.
    }
  };

  const canCopy =
    typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof window !== "undefined" &&
    !!window.ClipboardItem;

  const handleCopy = async () => {
    if (!finalImage) return;
    try {
      const res = await fetch(finalImage);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new window.ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch {
      // Clipboard permission denied/unsupported — Download remains the reliable path.
    }
  };

  const boardAspect = frame.photoAreaW / frame.photoAreaH;
  const uiStep =
    stage === "review"
      ? 4
      : stage === "enhancing" || stage === "precheck"
        ? 3
        : stage === "shooting"
          ? 2
          : 1;

  const cameraCaption =
    stage === "shooting"
      ? "hold still…"
      : stage === "precheck"
        ? retakingIndex !== null
          ? "retaking…"
          : "all shots captured"
        : "ready when you are";

  // Live board preview: shown while customizing (setup) AND while
  // shooting, so picking a layout/color/filter reflects instantly —
  // no need to start shooting first to see what the board looks like.
  const showBoardPreview = stage === "setup" || stage === "shooting";
  const boardPreviewLabel =
    stage === "setup" ? "live preview" : "your strip so far";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="logo-mark" aria-hidden="true">
            <CameraIcon />
          </span>
          <div className="brand-text">
            <h1>Photoreel</h1>
            <p>tap. pose. pin it.</p>
          </div>
        </div>
        <nav className="step-indicator" aria-label="Progress">
          <span
            className={`step-dot ${uiStep === 1 ? "active" : uiStep > 1 ? "done" : ""}`}
          >
            <span className="dot" />{" "}
            <span className="step-label">Customize</span>
          </span>
          <span
            className={`step-dot ${uiStep === 2 ? "active" : uiStep > 2 ? "done" : ""}`}
          >
            <span className="dot" /> <span className="step-label">Smile</span>
          </span>
          <span
            className={`step-dot ${uiStep === 3 ? "active" : uiStep > 3 ? "done" : ""}`}
          >
            <span className="dot" /> <span className="step-label">Check</span>
          </span>
          <span className={`step-dot ${uiStep === 4 ? "active" : ""}`}>
            <span className="dot" /> <span className="step-label">Result</span>
          </span>
        </nav>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <AlertIcon aria-hidden="true" /> {error}
        </div>
      )}

      {(stage === "setup" || stage === "shooting" || stage === "precheck") && (
        <div className="photobooth-grid stage-enter">
          <div className="camera-card">
            <div className="camera-card-top">
              <span className="live-badge">
                <span className="live-dot" aria-hidden="true" /> Live
              </span>
              <div className="camera-card-top-right">
                {(stage === "shooting" || stage === "precheck") && (
                  <span className="shot-progress">
                    shot {shots.length}/{frame.shots}
                  </span>
                )}
                <button
                  type="button"
                  className="sound-toggle-btn"
                  onClick={() => setSoundOn((s) => !s)}
                  aria-label={soundOn ? "Mute sound" : "Unmute sound"}
                  title={soundOn ? "Mute sound" : "Unmute sound"}
                >
                  {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
                </button>
              </div>
            </div>
            <div className="camera-frame">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  filter: filter.css,
                  transform: facingMode === "user" ? "scaleX(-1)" : "none",
                }}
              />
              {countdown !== null && (
                <div
                  className={`countdown-overlay ${countdown === "shoot" ? "flash" : ""}`}
                >
                  {countdown !== "shoot" && (
                    <span className="countdown-number">{countdown}</span>
                  )}
                </div>
              )}
              <button
                type="button"
                className="switch-cam-btn"
                onClick={switchCamera}
                disabled={stage !== "setup"}
                aria-label="Switch camera"
              >
                <FlipCameraIcon />
              </button>
            </div>
            <div className="camera-caption">{cameraCaption}</div>

            {showBoardPreview && (
              <div className="mini-board-wrap">
                <p className="mini-board-label">{boardPreviewLabel}</p>
                <div
                  className="mini-board"
                  style={{
                    aspectRatio: boardAspect,
                    background: background.swatch,
                  }}
                >
                  {frame.slots.map((slot, i) => (
                    <div
                      key={i}
                      className="mini-board-slot"
                      style={{
                        left: `${slot.x * 100}%`,
                        top: `${slot.y * 100}%`,
                        width: `${slot.w * 100}%`,
                        height: `${slot.h * 100}%`,
                        transform: `rotate(${slot.rot}deg)`,
                      }}
                    >
                      {shots[i] && (
                        <img
                          src={shots[i]}
                          alt=""
                          style={{ filter: filter.css }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {stage === "setup" && (
            <div className="controls-panel">
              <div className="control-section">
                <div className="control-section-header">
                  <span className="icon" aria-hidden="true">
                    <LayoutIcon />
                  </span>
                  <span className="control-label">Layout</span>
                </div>
                <FrameSelector selected={frameId} onSelect={setFrameId} />
              </div>
              <div className="control-section">
                <div className="control-section-header">
                  <span className="icon" aria-hidden="true">
                    <PaletteIcon />
                  </span>
                  <span className="control-label">Board color</span>
                </div>
                <BackgroundSelector
                  selected={backgroundId}
                  onSelect={setBackgroundId}
                />
              </div>
              <div className="control-section">
                <div className="control-section-header">
                  <span className="icon" aria-hidden="true">
                    <SparkleIcon />
                  </span>
                  <span className="control-label">Filter</span>
                </div>
                <FilterBar selected={filterId} onSelect={setFilterId} />
              </div>
              <div className="control-section">
                <div className="control-section-header">
                  <span className="icon" aria-hidden="true">
                    <TimerIcon />
                  </span>
                  <span className="control-label">Timer</span>
                </div>
                <div className="choice-row">
                  {TIMER_CHOICES.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      className={`choice-chip ${countdownSeconds === sec ? "active" : ""}`}
                      onClick={() => setCountdownSeconds(sec)}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-section">
                <div className="control-section-header">
                  <span className="icon" aria-hidden="true">
                    <TagIcon />
                  </span>
                  <span className="control-label">Label</span>
                </div>
                <div className="choice-row">
                  {CAPTION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`choice-chip ${brandText === preset ? "active" : ""}`}
                      onClick={() => setBrandText(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="brand-input"
                  value={brandText}
                  onChange={(e) => setBrandText(e.target.value)}
                  maxLength={20}
                  placeholder="photobooth"
                />
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={runCaptureSequence}
                disabled={!!error}
              >
                <CameraIcon /> Start — {frame.shots} shot
                {frame.shots > 1 ? "s" : ""}
              </button>
            </div>
          )}

          {stage === "precheck" && (
            <div className="controls-panel">
              <h2 className="section-title">Check your shots</h2>
              <p className="section-hint">
                Not feeling one? Retake it before we finalize your strip.
              </p>
              <div className="precheck-grid">
                {shots.map((shot, i) => (
                  <div
                    key={i}
                    className={`precheck-item ${retakingIndex === i ? "retaking" : ""}`}
                  >
                    <img
                      src={shot}
                      alt={`Shot ${i + 1}`}
                      style={{ filter: filter.css }}
                    />
                    <button
                      type="button"
                      className="precheck-retake-btn"
                      onClick={() => retakeShot(i)}
                      disabled={retakingIndex !== null}
                    >
                      <RetakeIcon /> Retake
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={confirmShots}
                disabled={retakingIndex !== null}
              >
                <CheckCircleIcon /> Looks good — continue
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={runCaptureSequence}
                disabled={retakingIndex !== null}
              >
                <RefreshIcon /> Retake all
              </button>
            </div>
          )}
        </div>
      )}

      {stage === "enhancing" && (
        <div className="enhancing-stage stage-enter">
          <div className="spinner-ring" aria-hidden="true" />
          <div className="film-strip-loader">
            {Array.from({ length: frame.shots }).map((_, i) => (
              <span key={i} className={i < enhanceStep ? "done" : ""} />
            ))}
          </div>
          <h2>Enhancing your photos</h2>
          <p>
            photo {enhanceStep} of {frame.shots} — smoothing, sharpening, adding
            glow…
          </p>
        </div>
      )}

      {stage === "review" && (
        <div className="review-stage stage-enter">
          <h2 className="review-heading">Looking good!</h2>
          <p className="review-subheading">Here's your photobooth strip</p>
          <div className="final-image-wrap">
            <img
              className="final-image"
              src={finalImage}
              alt="Your photobooth board"
            />
          </div>

          <label className="print-toggle">
            <input
              type="checkbox"
              checked={printDouble}
              onChange={(e) => setPrintDouble(e.target.checked)}
            />
            <span className="toggle-track" aria-hidden="true">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">
              <PrintIcon /> Print 2 copies side-by-side
            </span>
          </label>

          <div className="review-actions">
            <div className="review-actions-row">
              <button
                type="button"
                className="primary-btn"
                onClick={handleDownload}
              >
                <DownloadIcon /> Download
              </button>
              {canShare && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleShare}
                >
                  <ShareIcon /> Share
                </button>
              )}
              {canCopy && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCopy}
                >
                  <CopyIcon /> Copy
                </button>
              )}
            </div>
            <button type="button" className="ghost-btn" onClick={handleRetake}>
              <RefreshIcon /> Create another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
