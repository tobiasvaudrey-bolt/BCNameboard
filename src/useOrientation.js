import { useState, useEffect } from 'react';

function getOrientation() {
  if (screen.orientation?.type) {
    return screen.orientation.type.startsWith('landscape') ? 'landscape' : 'portrait';
  }
  if (window.matchMedia) {
    return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  }
  return 'landscape';
}

export function useOrientation() {
  const [orientation, setOrientation] = useState(getOrientation);

  useEffect(() => {
    const update = () => setOrientation(getOrientation());

    if (screen.orientation) {
      screen.orientation.addEventListener('change', update);
    }
    const mql = window.matchMedia('(orientation: portrait)');
    mql.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', update);
      }
      mql.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return orientation;
}
