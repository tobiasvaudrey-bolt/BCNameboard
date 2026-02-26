// ---------------------------------------------------------------------------
// Nameboard — core logic (no DOM side-effects, fully testable)
// ---------------------------------------------------------------------------

export const THEMES = {
  chauffeur:       { name: 'Chauffeur',      bg: '#1C110A', text: '#FFFFFF' },
  classic:         { name: 'Classic',        bg: '#000000', text: '#FFFFFF' },
  inverted:        { name: 'Inverted',       bg: '#FFFFFF', text: '#000000' },
  'airport-blue':  { name: 'Airport Blue',   bg: '#003366', text: '#FFFFFF' },
  'taxi-yellow':   { name: 'Taxi Yellow',    bg: '#FFD700', text: '#000000' },
  'terminal-green':{ name: 'Terminal Green',  bg: '#004D00', text: '#00FF41' },
  sunset:          { name: 'Sunset',         bg: '#8B0000', text: '#FFD700' },
};

// ---------------------------------------------------------------------------
// URL hash parsing / serialization
// ---------------------------------------------------------------------------

export function parseHash(hash) {
  const cleaned = hash.replace(/^#/, '');
  if (!cleaned) return { name: null, theme: null };

  const params = new URLSearchParams(cleaned);
  const rawName = params.get('name');
  const name = rawName !== null ? decodeURIComponent(rawName) : null;
  const theme = params.get('theme') || null;
  return { name, theme };
}

export function buildHash(name, theme) {
  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (theme) params.set('theme', theme);
  return '#' + params.toString();
}

// ---------------------------------------------------------------------------
// Theme helpers
// ---------------------------------------------------------------------------

export function getDefaultTheme() {
  if (typeof localStorage === 'undefined') return 'chauffeur';
  const stored = localStorage.getItem('nameboard-theme');
  if (stored && THEMES[stored]) return stored;
  return 'chauffeur';
}

export function saveTheme(slug) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('nameboard-theme', slug);
  }
}

export function resolveTheme(themeFromUrl) {
  if (themeFromUrl && THEMES[themeFromUrl]) return themeFromUrl;
  return getDefaultTheme();
}

// ---------------------------------------------------------------------------
// Mode determination
// ---------------------------------------------------------------------------

export function getMode(hashState, orientation) {
  if (!hashState.name) return 'input';
  if (orientation === 'portrait') return 'edit';
  return 'display';
}

// ---------------------------------------------------------------------------
// Orientation detection
// ---------------------------------------------------------------------------

export function getOrientation() {
  if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.type) {
    return screen.orientation.type.startsWith('landscape') ? 'landscape' : 'portrait';
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  }
  return 'landscape';
}

// ---------------------------------------------------------------------------
// Dynamic font sizing (binary search)
// ---------------------------------------------------------------------------

export function fitText(element, container) {
  let lo = 10;
  let hi = 300;
  const maxW = container.clientWidth * 0.9;
  const maxH = container.clientHeight * 0.8;

  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    element.style.fontSize = mid + 'px';
    if (element.scrollWidth > maxW || element.scrollHeight > maxH) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  element.style.fontSize = lo + 'px';
}

// ---------------------------------------------------------------------------
// Wake Lock
// ---------------------------------------------------------------------------

let wakeLockSentinel = null;

export async function requestWakeLock() {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => { wakeLockSentinel = null; });
  } catch {
    // Silently fail
  }
}

export function releaseWakeLock() {
  if (wakeLockSentinel) {
    wakeLockSentinel.release();
    wakeLockSentinel = null;
  }
}

// ---------------------------------------------------------------------------
// Fullscreen
// ---------------------------------------------------------------------------

export function enterFullscreen() {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  const rfs = el.requestFullscreen
    || el.webkitRequestFullscreen
    || el.msRequestFullscreen;
  if (rfs) {
    rfs.call(el).catch(() => {});
  }
}

export function exitFullscreen() {
  if (typeof document === 'undefined') return;
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  if (fsEl) {
    const efs = document.exitFullscreen
      || document.webkitExitFullscreen
      || document.msExitFullscreen;
    if (efs) efs.call(document).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Clipboard
// ---------------------------------------------------------------------------

export async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback: temporary textarea
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch {
    // ignore
  }
  document.body.removeChild(ta);
  return success;
}

// ---------------------------------------------------------------------------
// Recent names (localStorage)
// ---------------------------------------------------------------------------

const MAX_RECENT = 5;
const RECENT_KEY = 'nameboard-recent';

export function getRecentNames() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentName(name) {
  if (!name || typeof localStorage === 'undefined') return;
  let recent = getRecentNames().filter((n) => n !== name);
  recent.unshift(name);
  if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

// ---------------------------------------------------------------------------
// Debounce utility
// ---------------------------------------------------------------------------

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
