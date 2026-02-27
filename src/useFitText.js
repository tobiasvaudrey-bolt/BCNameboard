import { useEffect, useRef, useCallback } from 'react';

export function useFitText(text, deps = []) {
  const elementRef = useRef(null);
  const containerRef = useRef(null);

  const fit = useCallback(() => {
    const element = elementRef.current;
    const container = containerRef.current;
    if (!element || !container) return;

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
  }, []);

  useEffect(() => {
    fit();
  }, [text, fit, ...deps]);

  useEffect(() => {
    const onResize = () => fit();
    window.addEventListener('resize', onResize);
    document.addEventListener('fullscreenchange', onResize);
    document.addEventListener('webkitfullscreenchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('fullscreenchange', onResize);
      document.removeEventListener('webkitfullscreenchange', onResize);
    };
  }, [fit]);

  return { elementRef, containerRef, refit: fit };
}
