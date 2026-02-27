export function BoltLogo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 360 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bolt logo"
    >
      <path
        d="M54.5 8C29.9 8 10 27.9 10 52.5S29.9 97 54.5 97c15.8 0 29.7-8.2 37.6-20.6l-20.3-11.7c-3.8 5.6-10.2 9.3-17.3 9.3-11.6 0-21-9.4-21-21s9.4-21 21-21c7.1 0 13.5 3.7 17.3 9.3l20.3-11.7C84.2 16.2 70.3 8 54.5 8z"
        fill="#34BB78"
      />
      <text
        x="105"
        y="73"
        fontFamily="Inter, sans-serif"
        fontWeight="700"
        fontSize="65"
        fill="#34BB78"
      >
        bolt
      </text>
    </svg>
  );
}
