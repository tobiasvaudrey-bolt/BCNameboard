import { useEffect, useRef, useCallback } from 'react';

export function useFitText(text, deps = []) {
  const elementRef = useRef(null);
  const containerRef = useRef(null);

  const fit = useCallback(() => {
    const element = elementRef.current;
    const container = containerRef.current;
    if (!element || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (cw === 0 || ch === 0) return;

    let lo = 10;
    let hi = Math.min(500, Math.floor(ch * 0.95));
    const maxW = cw * 0.94;
    const maxH = ch * 0.88;

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
  }, []);

  useEffect(() => {
    fit();
    const t1 = setTimeout(fit, 50);
    const t2 = setTimeout(fit, 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [text, fit, ...deps]);

  useEffect(() => {
    const container = containerRef.current;

    let rafId;
    const onResize = () => {
      fit();
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(fit);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('fullscreenchange', onResize);
    document.addEventListener('webkitfullscreenchange', onResize);

    let observer;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(onResize);
      observer.observe(container);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      document.removeEventListener('fullscreenchange', onResize);
      document.removeEventListener('webkitfullscreenchange', onResize);
      if (observer) observer.disconnect();
    };
  }, [fit]);

  return { elementRef, containerRef, refit: fit };
}
