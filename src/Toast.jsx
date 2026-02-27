import { useEffect, useState, useCallback, useRef } from 'react';

let showFn = null;

export function showToast(msg, durationMs = 2500) {
  if (showFn) showFn(msg, durationMs);
}

export function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const show = useCallback((msg, durationMs) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), durationMs);
  }, []);

  useEffect(() => {
    showFn = show;
    return () => { showFn = null; };
  }, [show]);

  return (
    <div
      className={`
        fixed bottom-20 left-1/2 -translate-x-1/2
        bg-white/95 text-gray-900
        px-6 py-3 rounded-3xl
        text-sm font-semibold
        transition-opacity duration-300
        pointer-events-none whitespace-nowrap
        z-50
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {message}
    </div>
  );
}
