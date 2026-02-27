import { useEffect, useRef } from 'react';

export function useWakeLock(active) {
  const sentinel = useRef(null);

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let released = false;

    navigator.wakeLock.request('screen').then((lock) => {
      if (released) {
        lock.release();
        return;
      }
      sentinel.current = lock;
      lock.addEventListener('release', () => { sentinel.current = null; });
    }).catch(() => {});

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !sentinel.current && !released) {
        navigator.wakeLock.request('screen').then((lock) => {
          if (released) { lock.release(); return; }
          sentinel.current = lock;
          lock.addEventListener('release', () => { sentinel.current = null; });
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisible);
      if (sentinel.current) {
        sentinel.current.release();
        sentinel.current = null;
      }
    };
  }, [active]);
}
