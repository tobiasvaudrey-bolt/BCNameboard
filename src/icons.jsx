const SIZE = 18;
const STROKE_PROPS = {
  width: SIZE,
  height: SIZE,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function LinkIcon() {
  return (
    <svg {...STROKE_PROPS}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function QRIcon() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="currentColor">
      <rect x="1" y="1" width="10" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="4" width="4" height="4" />
      <rect x="13" y="1" width="10" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="4" width="4" height="4" />
      <rect x="1" y="13" width="10" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="16" width="4" height="4" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="20" y="14" width="3" height="3" />
      <rect x="14" y="20" width="3" height="3" />
      <rect x="20" y="20" width="3" height="3" />
      <rect x="17" y="17" width="3" height="3" />
    </svg>
  );
}

export function FullscreenIcon() {
  return (
    <svg {...STROKE_PROPS}>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function ExitFullscreenIcon() {
  return (
    <svg {...STROKE_PROPS}>
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg {...STROKE_PROPS}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
