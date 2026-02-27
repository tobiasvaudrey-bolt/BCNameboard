import { useState, useEffect, useCallback } from 'react';

function getIsFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(getIsFullscreen);

  useEffect(() => {
    const update = () => setIsFullscreen(getIsFullscreen());
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange', update);
    return () => {
      document.removeEventListener('fullscreenchange', update);
      document.removeEventListener('webkitfullscreenchange', update);
    };
  }, []);

  const toggle = useCallback(() => {
    if (getIsFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document).catch(() => {});
    } else {
      const el = document.documentElement;
      const enter = el.requestFullscreen || el.webkitRequestFullscreen;
      if (enter) enter.call(el).catch(() => {});
    }
  }, []);

  return { isFullscreen, toggle };
}
