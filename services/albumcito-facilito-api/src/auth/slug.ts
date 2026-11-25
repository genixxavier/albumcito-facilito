export const RESERVED_USERNAMES = new Set([
  'albums',
  'login',
  'signup',
  'api',
  'auth',
  'logout',
]);

export function slugify(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'usuario';
}

/** Devuelve un slug libre: base, base-2, base-3... */
export function uniqueSlug(
  name: string,
  isTaken: (slug: string) => boolean,
): string {
  const base = slugify(name);
  const taken = (s: string) => RESERVED_USERNAMES.has(s) || isTaken(s);
  if (!taken(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!taken(candidate)) return candidate;
  }
}
