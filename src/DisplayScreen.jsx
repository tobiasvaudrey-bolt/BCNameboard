import { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { QROverlay } from './QROverlay';
import { showToast } from './Toast';
import { buildHash } from './hash';
import { THEMES, DEFAULT_THEME } from './themes';
import { useFitText } from './useFitText';
import { useWakeLock } from './useWakeLock';
import { useFullscreen } from './useFullscreen';
import { downloadAsImage, downloadAsPDF, SIZE_PRESETS } from './download';

function DecorativeArcs({ color }) {
  const strokeProps = { stroke: color, fill: 'none', strokeWidth: 2.5 };

  return (
    <>
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '40%', height: '40%' }}
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
      >
        <circle cx="200" cy="0" r="50" {...strokeProps} opacity="0.6" />
        <circle cx="200" cy="0" r="80" {...strokeProps} opacity="0.5" />
        <circle cx="200" cy="0" r="110" {...strokeProps} opacity="0.45" />
        <circle cx="200" cy="0" r="140" {...strokeProps} opacity="0.35" />
      </svg>

      <svg
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: '40%', height: '40%' }}
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
      >
        <circle cx="0" cy="200" r="50" {...strokeProps} opacity="0.6" />
        <circle cx="0" cy="200" r="80" {...strokeProps} opacity="0.5" />
        <circle cx="0" cy="200" r="110" {...strokeProps} opacity="0.45" />
        <circle cx="0" cy="200" r="140" {...strokeProps} opacity="0.35" />
      </svg>
    </>
  );
}

export function DisplayScreen({
  name,
  theme,
  active,
  onEdit,
}) {
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [qrVisible, setQrVisible] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const hideTimerRef = useRef(null);
  const displayRef = useRef(null);
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

  useEffect(() => {
    if (!toolbarVisible) setDownloadMenuOpen(false);
  }, [toolbarVisible]);

  function showToolbar() {
    setToolbarVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setToolbarVisible(false), 3000);
  }

  function toggleToolbar(e) {
    if (e.target.closest('[data-toolbar]')) return;
    if (e.target.closest('[data-download-menu]')) return;
    if (qrVisible) return;
    if (downloadMenuOpen) {
      setDownloadMenuOpen(false);
      return;
    }
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

  function handleDownloadToggle() {
    setDownloadMenuOpen((v) => !v);
    clearTimeout(hideTimerRef.current);
  }

  async function handleDownload(preset, label) {
    if (downloading) return;
    setDownloading(true);
    setDownloadMenuOpen(false);
    try {
      await downloadAsImage(name, t, preset);
      showToast(`${label} image saved!`);
    } catch {
      showToast('Could not save image');
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadPDF() {
    if (downloading) return;
    setDownloading(true);
    setDownloadMenuOpen(false);
    try {
      await downloadAsPDF(name, t);
      showToast('PDF saved!');
    } catch {
      showToast('Could not save PDF');
    } finally {
      setDownloading(false);
    }
  }

  const shareUrl = name
    ? window.location.origin + window.location.pathname + buildHash(name, theme)
    : '';

  return (
    <div
      ref={displayRef}
      className={`
        absolute inset-0 w-full h-dvh
        select-none cursor-default
        transition-all duration-300 ease-out z-10
        overflow-hidden
        ${active ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      style={{ backgroundColor: t.bg, color: t.text }}
      onClick={toggleToolbar}
      onMouseMove={handleMouseMove}
    >
      <DecorativeArcs color={t.accent} />

      <div className="relative flex flex-col items-center h-full w-full z-[1]">
        <div
          className="pt-[7vh] text-[clamp(1.25rem,5.5vh,4rem)] font-bold tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Hello
        </div>

        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center w-full min-h-0 overflow-hidden"
        >
          <div
            ref={elementRef}
            role="heading"
            aria-level="1"
            tabIndex={-1}
            className="text-center break-words px-[5vw] max-w-full max-h-full outline-none font-script"
            style={{ fontWeight: 700 }}
          >
            {name}
          </div>
        </div>

        <div
          className="pb-[5vh] text-[clamp(0.75rem,2.5vh,1.5rem)] tracking-wide"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span className="font-bold">Bolt</span>
          {' '}
          <span className="font-medium">Chauffeur</span>
        </div>
      </div>

      {downloadMenuOpen && (
        <div
          data-download-menu
          data-no-capture
          className="
            absolute bottom-[72px] left-1/2 -translate-x-1/2 z-20
            bg-black/70 backdrop-blur-md rounded-xl
            p-1.5 flex flex-col gap-0.5 min-w-[180px]
            shadow-lg border border-white/10
          "
        >
          <button
            type="button"
            onClick={() => handleDownload(SIZE_PRESETS.phone, 'Phone')}
            disabled={downloading}
            className="
              text-white/90 text-sm px-4 py-2.5 rounded-lg
              hover:bg-white/15 transition-colors text-left
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Save for Phone
          </button>
          <button
            type="button"
            onClick={() => handleDownload(SIZE_PRESETS.tablet, 'Tablet')}
            disabled={downloading}
            className="
              text-white/90 text-sm px-4 py-2.5 rounded-lg
              hover:bg-white/15 transition-colors text-left
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Save for Tablet
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="
              text-white/90 text-sm px-4 py-2.5 rounded-lg
              hover:bg-white/15 transition-colors text-left
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Save as PDF
          </button>
        </div>
      )}

      <div data-toolbar data-no-capture>
        <Toolbar
          onCopy={handleCopy}
          onQR={() => setQrVisible(true)}
          onDownload={handleDownloadToggle}
          onFullscreen={toggleFullscreen}
          onEdit={handleEdit}
          isFullscreen={isFullscreen}
          visible={toolbarVisible}
        />
      </div>

      <div data-no-capture>
        <QROverlay
          url={shareUrl}
          visible={qrVisible}
          onClose={() => setQrVisible(false)}
        />
      </div>
    </div>
  );
}
