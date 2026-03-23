import { useState, useEffect, useRef } from 'react';
import { BoltLogo } from './BoltLogo';
import { QRSection } from './QROverlay';
import { showToast } from './Toast';
import { buildHash } from './hash';

function InstallHint() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          w-full flex items-center justify-center gap-2
          text-white/30 text-xs font-sans
          bg-transparent border-none cursor-pointer
          py-2 transition-colors duration-150
          hover:text-white/50
        "
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Install as app for offline use
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-1 rounded-xl bg-white/[0.04] border border-white/10 p-4 flex flex-col gap-4 text-sm text-white/60 leading-relaxed">
          <div>
            <p className="text-white/80 font-semibold text-xs uppercase tracking-widest mb-2">iPad &amp; iPhone</p>
            <ol className="list-decimal list-inside flex flex-col gap-1">
              <li>
                Tap the <span className="inline-flex items-center align-middle mx-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </span> <span className="text-white/80">Share</span> button in Safari
              </li>
              <li>Tap <span className="text-white/80">&ldquo;Add to Home Screen&rdquo;</span></li>
            </ol>
          </div>
          <div>
            <p className="text-white/80 font-semibold text-xs uppercase tracking-widest mb-2">Android tablet</p>
            <ol className="list-decimal list-inside flex flex-col gap-1">
              <li>Tap the <span className="text-white/80">&#8942; menu</span> in Chrome</li>
              <li>Tap <span className="text-white/80">&ldquo;Install app&rdquo;</span> or <span className="text-white/80">&ldquo;Add to Home Screen&rdquo;</span></li>
            </ol>
          </div>
          <p className="text-white/40 text-xs">
            Once installed, the nameboard works offline and opens in full screen.
          </p>
        </div>
      )}
    </div>
  );
}

export function InputScreen({
  name,
  theme,
  active,
  onSubmit,
}) {
  const [inputValue, setInputValue] = useState(name || '');
  const inputRef = useRef(null);
  const hasName = !!name;

  useEffect(() => {
    if (active && name && !inputRef.current?.matches(':focus')) {
      setInputValue(name);
    }
  }, [active, name]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  async function handleCopy() {
    const url = window.location.origin + window.location.pathname + buildHash(name, theme);
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied!');
    } catch {
      showToast('Could not copy link');
    }
  }

  const shareUrl = hasName
    ? window.location.origin + window.location.pathname + buildHash(name, theme)
    : null;

  return (
    <div
      className={`
        absolute inset-0 w-full h-dvh
        flex flex-col items-center justify-center
        bg-[#111] text-white
        gap-6 p-6 overflow-y-auto
        transition-all duration-300 ease-out
        ${active ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
    >
      <div className="w-full max-w-md flex flex-col gap-5 items-center">
        <BoltLogo className="h-8 w-auto" />
        <p className="text-[0.7rem] uppercase tracking-[0.15em] text-white/50 font-semibold">
          Chauffeur Nameboard
        </p>
        <p className="text-sm text-white/50 text-center leading-relaxed">
          Enter a passenger name to display, or share a link to load one
        </p>

        <label
          htmlFor="name-input"
          className="text-[0.7rem] uppercase tracking-widest text-white/40 font-semibold self-start"
        >
          Passenger name
        </label>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            ref={inputRef}
            id="name-input"
            type="text"
            autoCapitalize="words"
            autoComplete="off"
            spellCheck="false"
            placeholder="e.g. John Smith"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="
              w-full text-lg font-sans
              px-4 py-3.5
              border-[1.5px] border-white/15 rounded-xl
              bg-white/[0.06] text-white
              outline-none
              transition-all duration-200
              focus:border-bolt focus:shadow-[0_0_0_3px_rgba(52,187,120,0.2)]
              placeholder:text-white/25
            "
          />
          <button
            type="submit"
            className="
              w-full text-lg font-sans font-bold
              py-3.5 border-none rounded-xl
              bg-bolt text-black
              cursor-pointer
              transition-all duration-200
              hover:bg-bolt-dark
              active:scale-[0.98]
            "
          >
            Display Name
          </button>
        </form>

        {hasName && (
          <button
            onClick={handleCopy}
            className="
              bg-transparent border border-white/15
              text-white/50 px-4 py-2 rounded-lg
              cursor-pointer text-sm font-sans
              transition-colors duration-150
              hover:border-bolt hover:text-white
            "
          >
            🔗 Copy Link
          </button>
        )}

        {shareUrl && <QRSection url={shareUrl} />}

        <InstallHint />
      </div>
    </div>
  );
}
