import { useState, useEffect, useRef } from 'react';
import { BoltLogo } from './BoltLogo';
import { ThemePicker } from './ThemePicker';
import { QRSection } from './QROverlay';
import { showToast } from './Toast';
import { buildHash } from './hash';

export function InputScreen({
  name,
  theme,
  active,
  onSubmit,
  onThemeChange,
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

        <ThemePicker current={theme} onChange={onThemeChange} />

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
      </div>
    </div>
  );
}
