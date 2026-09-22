// Small line-icon set, all inline SVG (no external assets/deps, no emoji).
// Consistent 22x22 viewBox, 1.7 stroke, currentColor so they inherit
// whatever text color the surrounding button/label uses.

const base = {
  viewBox: '0 0 22 22',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const CameraIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 7.5h2.6L7 5.2h8l1.4 2.3H19a1 1 0 0 1 1 1V17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1Z" />
    <circle cx="11" cy="12.3" r="3.4" />
  </svg>
)

export const FlipCameraIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 8a7 7 0 0 1 11.6-4.6M18 5v3.5h-3.5" />
    <path d="M18 14a7 7 0 0 1-11.6 4.6M4 17v-3.5h3.5" />
  </svg>
)

export const LayoutIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.4" />
    <rect x="12" y="3" width="7" height="7" rx="1.4" />
    <rect x="3" y="12" width="7" height="7" rx="1.4" />
    <rect x="12" y="12" width="7" height="7" rx="1.4" />
  </svg>
)

export const PaletteIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M11 3a8 8 0 1 0 0 16c1 0 1.7-.8 1.7-1.7 0-.45-.18-.85-.46-1.14a1.6 1.6 0 0 1-.46-1.15c0-.9.72-1.6 1.6-1.6H15a4 4 0 0 0 4-4c0-3.9-3.6-6.4-8-6.4Z" />
    <circle cx="7.2" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="9.6" cy="6.8" r="1" fill="currentColor" stroke="none" />
    <circle cx="13.4" cy="7.2" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const SparkleIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M11 3.5c.5 2.6 1.2 4.1 2.3 5.2s2.6 1.8 5.2 2.3c-2.6.5-4.1 1.2-5.2 2.3s-1.8 2.6-2.3 5.2c-.5-2.6-1.2-4.1-2.3-5.2S6.1 11.5 3.5 11c2.6-.5 4.1-1.2 5.2-2.3S10.5 6.1 11 3.5Z" />
  </svg>
)

export const TagIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M11.6 3.3 18 9.7a2 2 0 0 1 0 2.9l-5.4 5.4a2 2 0 0 1-2.9 0L3.3 11.6V4.8a1.5 1.5 0 0 1 1.5-1.5h6.8Z" />
    <circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

export const TimerIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="12.5" r="7" />
    <path d="M11 8.7v3.8l2.6 1.6M8.6 2.8h4.8" />
  </svg>
)

export const SoundOnIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 8.7h3l4.2-3.5v13.6L7 15.3H4a1 1 0 0 1-1-1V9.7a1 1 0 0 1 1-1Z" />
    <path d="M15.3 8.3a4.6 4.6 0 0 1 0 6.4M17.7 6a8 8 0 0 1 0 10.9" />
  </svg>
)

export const SoundOffIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 8.7h3l4.2-3.5v13.6L7 15.3H4a1 1 0 0 1-1-1V9.7a1 1 0 0 1 1-1Z" />
    <path d="m15 9 4.2 4.2M19.2 9 15 13.2" />
  </svg>
)

export const DownloadIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M11 3.5v10.8M7.2 10.6 11 14.4l3.8-3.8" />
    <path d="M4.5 15.8v1.7a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-1.7" />
  </svg>
)

export const ShareIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="16.2" cy="5.5" r="2.2" />
    <circle cx="5.8" cy="11" r="2.2" />
    <circle cx="16.2" cy="16.5" r="2.2" />
    <path d="m7.7 9.9 6.6-3.3M7.7 12.1l6.6 3.3" />
  </svg>
)

export const CopyIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="8" y="8" width="10.5" height="10.5" rx="2" />
    <path d="M13.5 8V5.5A1.5 1.5 0 0 0 12 4H5a1.5 1.5 0 0 0-1.5 1.5V13A1.5 1.5 0 0 0 5 14.5h3" />
  </svg>
)

export const RefreshIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 11a7 7 0 0 1 12-4.9L18 8" />
    <path d="M18 4v4h-4" />
    <path d="M18 11a7 7 0 0 1-12 4.9L4 14" />
    <path d="M4 18v-4h4" />
  </svg>
)

export const RetakeIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3.5 8.2A7.8 7.8 0 0 1 18 6.4M18.5 13.8A7.8 7.8 0 0 1 4 15.6" />
    <path d="M17.2 3v4h-4M4.8 19v-4h4" />
  </svg>
)

export const CheckCircleIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m7.5 11.3 2.3 2.3 4.7-5.2" />
  </svg>
)

export const AlertIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M11 3.6 19.8 18a1 1 0 0 1-.86 1.5H3.06A1 1 0 0 1 2.2 18L11 3.6Z" />
    <path d="M11 9v3.6" />
    <circle cx="11" cy="15.4" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

export const PrintIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 8.5V3.8h10v4.7" />
    <rect x="3.3" y="8.5" width="15.4" height="7" rx="1.4" />
    <path d="M6 14v4.2h10V14" />
  </svg>
)
