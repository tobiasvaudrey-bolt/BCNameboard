export function parseHash(hash) {
  const cleaned = hash.replace(/^#/, '');
  if (!cleaned) return { name: null, theme: null };

  const params = new URLSearchParams(cleaned);
  const rawName = params.get('name');
  const name = rawName !== null ? decodeURIComponent(rawName) : null;
  const theme = params.get('theme') || null;
  return { name, theme };
}

export function buildHash(name, theme) {
  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (theme) params.set('theme', theme);
  return '#' + params.toString();
}
