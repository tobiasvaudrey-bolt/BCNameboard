import { THEMES, THEME_SLUGS } from './themes';

export function ThemePicker({ current, onChange, className = '' }) {
  return (
    <div className={`flex gap-2.5 flex-wrap justify-center ${className}`}>
      {THEME_SLUGS.map((slug) => {
        const t = THEMES[slug];
        const isActive = slug === current;
        const isLight = t.bg === '#FFFFFF' || t.bg === '#ffffff';
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onChange(slug)}
            aria-label={`${t.name} theme`}
            className={`
              w-8 h-8 rounded-full shrink-0 cursor-pointer
              transition-transform duration-150
              hover:scale-120 focus-visible:scale-120
              ${isActive
                ? 'border-3 border-white'
                : `border-2 ${isLight ? 'border-gray-300' : 'border-white/40'}`
              }
            `}
            style={{ backgroundColor: t.bg }}
          />
        );
      })}
    </div>
  );
}
