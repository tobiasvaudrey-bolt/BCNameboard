export function BoltLogo({ className = '' }) {
  return (
    <div className={className} aria-label="Bolt Chauffeur logo">
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 'inherit',
          color: 'white',
          letterSpacing: '0.02em',
        }}
      >
        Bolt
      </span>{' '}
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: 'inherit',
          color: 'white',
          letterSpacing: '0.02em',
        }}
      >
        Chauffeur
      </span>
    </div>
  );
}
