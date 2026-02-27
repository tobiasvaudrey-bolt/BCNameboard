import { useEffect, useRef } from 'react';
import qrcode from 'qrcode-generator';

export function QROverlay({ url, visible, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!visible || !containerRef.current || !url) return;
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    containerRef.current.innerHTML = qr.createSvgTag({ scalable: true, margin: 2 });
  }, [visible, url]);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 bg-black/85 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={containerRef} className="w-[220px] h-[220px] [&_svg]:block [&_svg]:w-full [&_svg]:h-full" />
        <span className="text-gray-600 text-sm font-medium">
          Scan to open on another device
        </span>
      </div>
    </div>
  );
}

export function QRSection({ url, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    containerRef.current.innerHTML = qr.createSvgTag({ scalable: true, margin: 2 });
  }, [url]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="bg-white p-3 rounded-xl leading-none">
        <div ref={containerRef} className="w-40 h-40 [&_svg]:block [&_svg]:w-full [&_svg]:h-full" />
      </div>
      <span className="text-xs text-white/40">
        Scan to open on another device
      </span>
    </div>
  );
}
