import { useEffect, useRef, useState, useCallback } from 'react'
import FilterBar from './components/FilterBar'
import FrameSelector from './components/FrameSelector'
import BackgroundSelector from './components/BackgroundSelector'
import { getFilter } from './utils/filters'
import { getFrame } from './utils/frames'
import { getBackground } from './utils/backgrounds'
import { composeImage } from './utils/compositeImage'
import { enhanceImage } from './utils/enhanceImage'
import './App.css'

const COUNTDOWN_SECONDS = 3

export default function App() {
  const [stage, setStage] = useState('setup') // setup | shooting | enhancing | review
  const [frameId, setFrameId] = useState('strip')
  const [filterId, setFilterId] = useState('none')
  const [backgroundId, setBackgroundId] = useState('navy')
  const [brandText, setBrandText] = useState('photobooth')
  const [facingMode, setFacingMode] = useState('user')
  const [countdown, setCountdown] = useState(null)
  const [shots, setShots] = useState([])
  const [enhanceStep, setEnhanceStep] = useState(0)
  const [finalImage, setFinalImage] = useState(null)
  const [error, setError] = useState(null)

  const videoRef = useRef(null)
  const captureCanvasRef = useRef(document.createElement('canvas'))
  const streamRef = useRef(null)

  const frame = getFrame(frameId)
  const filter = getFilter(filterId)
  const background = getBackground(backgroundId)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) {
      setError('Hindi ma-access ang camera. Paki-check ang browser permissions.')
    }
  }, [facingMode])

  useEffect(() => {
    if (stage === 'setup' || stage === 'shooting') startCamera()
  }, [startCamera, stage])

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = captureCanvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
  }

  const runCaptureSequence = async () => {
    setShots([])
    setStage('shooting')
    const collected = []

    for (let shotIndex = 0; shotIndex < frame.shots; shotIndex++) {
      for (let s = COUNTDOWN_SECONDS; s > 0; s--) {
        setCountdown(s)
        await new Promise((r) => setTimeout(r, 1000))
      }
      setCountdown('shoot')
      const dataUrl = captureFrame()
      collected.push(dataUrl)
      setShots([...collected])
      await new Promise((r) => setTimeout(r, 350))
      setCountdown(null)
      if (shotIndex < frame.shots - 1) await new Promise((r) => setTimeout(r, 600))
    }

    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())

    setStage('enhancing')
    const enhanced = []
    for (let i = 0; i < collected.length; i++) {
      setEnhanceStep(i + 1)
      enhanced.push(await enhanceImage(collected[i]))
    }

    const composed = await composeImage(enhanced, frame, filterId, backgroundId, brandText)
    setFinalImage(composed)
    setStage('review')
  }

  const handleRetake = () => {
    setFinalImage(null)
    setShots([])
    setEnhanceStep(0)
    setStage('setup')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = finalImage
    link.download = `photobooth-${Date.now()}.png`
    link.click()
  }

  const switchCamera = () => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))

  const boardAspect = frame.photoAreaW / frame.photoAreaH

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-eyebrow">tap. pose. pin it.</span>
        <h1>photobooth</h1>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {(stage === 'setup' || stage === 'shooting') && (
        <div className="camera-stage">
          <div className="polaroid-frame">
            <div className="polaroid-photo">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  filter: filter.css,
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />
              {countdown !== null && (
                <div className={`countdown-overlay ${countdown === 'shoot' ? 'flash' : ''}`}>
                  {countdown === 'shoot' ? '' : countdown}
                </div>
              )}
              <button
                type="button"
                className="switch-cam-btn"
                onClick={switchCamera}
                disabled={stage === 'shooting'}
                aria-label="Switch camera"
              >
                ⟲
              </button>
            </div>
            <div className="polaroid-caption">
              {stage === 'shooting' ? `shot ${shots.length}/${frame.shots}` : 'ready?'}
            </div>
          </div>

          {stage === 'setup' && (
            <div className="controls">
              <section>
                <span className="control-label">layout</span>
                <FrameSelector selected={frameId} onSelect={setFrameId} />
              </section>
              <section>
                <span className="control-label">board</span>
                <BackgroundSelector selected={backgroundId} onSelect={setBackgroundId} />
              </section>
              <section>
                <span className="control-label">filter</span>
                <FilterBar selected={filterId} onSelect={setFilterId} />
              </section>
              <section>
                <span className="control-label">label</span>
                <input
                  type="text"
                  className="brand-input"
                  value={brandText}
                  onChange={(e) => setBrandText(e.target.value)}
                  maxLength={20}
                  placeholder="photobooth"
                />
              </section>
              <button
                type="button"
                className="primary-btn"
                onClick={runCaptureSequence}
                disabled={!!error}
              >
                start — {frame.shots} shot{frame.shots > 1 ? 's' : ''}
              </button>
            </div>
          )}

          {stage === 'shooting' && (
            <div
              className="mini-board"
              style={{ aspectRatio: boardAspect, background: background.swatch }}
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
                    <img src={shots[i]} alt="" style={{ filter: filter.css }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {stage === 'enhancing' && (
        <div className="enhancing-stage">
          <div className="film-strip-loader">
            {Array.from({ length: frame.shots }).map((_, i) => (
              <span key={i} className={i < enhanceStep ? 'done' : ''} />
            ))}
          </div>
          <p>developing photo {enhanceStep} of {frame.shots}…</p>
        </div>
      )}

      {stage === 'review' && (
        <div className="review-stage">
          <img className="final-image" src={finalImage} alt="Your photobooth board" />
          <div className="review-actions">
            <button type="button" className="primary-btn" onClick={handleDownload}>
              save photo
            </button>
            <button type="button" className="secondary-btn" onClick={handleRetake}>
              retake
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
