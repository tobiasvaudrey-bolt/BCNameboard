import { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { QROverlay } from './QROverlay';
import { showToast } from './Toast';
import { buildHash } from './hash';
import { THEMES, DEFAULT_THEME } from './themes';
import { useFitText } from './useFitText';
import { useWakeLock } from './useWakeLock';
import { useFullscreen } from './useFullscreen';

export function DisplayScreen({
  name,
  theme,
  active,
  onThemeChange,
  onEdit,
}) {
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [qrVisible, setQrVisible] = useState(false);
  const hideTimerRef = useRef(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { elementRef, containerRef, refit } = useFitText(name, [active, isFullscreen]);
  const t = THEMES[theme] || THEMES[DEFAULT_THEME];

  useWakeLock(active);

  useEffect(() => {
    if (active) {
      refit();
      showToolbar();
    }
    return () => clearTimeout(hideTimerRef.current);
  }, [active, refit]);

  function showToolbar() {
    setToolbarVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setToolbarVisible(false), 3000);
  }

  function toggleToolbar(e) {
    if (e.target.closest('[data-toolbar]')) return;
    if (qrVisible) return;
    if (toolbarVisible) {
      setToolbarVisible(false);
      clearTimeout(hideTimerRef.current);
    } else {
      showToolbar();
    }
  }

  const handleMouseMove = useCallback(() => {
    if (!toolbarVisible) return;
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setToolbarVisible(false), 3000);
  }, [toolbarVisible]);

  async function handleCopy() {
    const url = window.location.origin + window.location.pathname + buildHash(name, theme);
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied!');
    } catch {
      showToast('Could not copy link');
    }
  }

  function handleEdit() {
    if (isFullscreen) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document).catch(() => {});
    }
    onEdit();
  }

  const shareUrl = name
    ? window.location.origin + window.location.pathname + buildHash(name, theme)
    : '';

  return (
    <div
      ref={containerRef}
      className={`
        absolute inset-0 w-full h-dvh
        flex flex-col items-center justify-center
        select-none cursor-default
        transition-all duration-300 ease-out z-10
        ${active ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      style={{ backgroundColor: t.bg, color: t.text }}
      onClick={toggleToolbar}
      onMouseMove={handleMouseMove}
    >
      <div
        ref={elementRef}
        role="heading"
        aria-level="1"
        tabIndex={-1}
        className="font-bold text-center break-words p-[5vw] max-w-full max-h-full outline-none landscape:p-[3vh_5vw]"
        style={{ textShadow: `0 0 30px ${t.text}20` }}
      >
        {name}
      </div>

      <div data-toolbar>
        <Toolbar
          theme={theme}
          onThemeChange={onThemeChange}
          onCopy={handleCopy}
          onQR={() => setQrVisible(true)}
          onFullscreen={toggleFullscreen}
          onEdit={handleEdit}
          isFullscreen={isFullscreen}
          visible={toolbarVisible}
        />
      </div>

      <QROverlay
        url={shareUrl}
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
      />
    </div>
  );
}
