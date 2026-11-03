const AUTH_ROUTE_PREFIXES = [
  '/novauser/signin',
  '/novauser/register',
  '/novauser/auth',
  '/login',
  '/register',
  '/signup',
];

function isSafeTarget(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !AUTH_ROUTE_PREFIXES.some((prefix) => value === prefix || value.startsWith(`${prefix}?`) || value.startsWith(`${prefix}#`))
  );
}

/** Normalise a router location or string into a safe in-app return target. */
export function normalizeRedirectTarget(from, fallback = '/app') {
  if (isSafeTarget(from)) return from;
  if (from && isSafeTarget(from.pathname)) {
    return `${from.pathname}${from.search || ''}${from.hash || ''}`;
  }
  return fallback;
}

/** Read the return target from router state first, then a ?redirect= query. */
export function getRedirectTarget(location, fallback = '/app') {
  const fromState = location?.state?.from;
  if (fromState) return normalizeRedirectTarget(fromState, fallback);

  try {
    const params = new URLSearchParams(location?.search || '');
    return normalizeRedirectTarget(params.get('redirect'), fallback);
  } catch {
    return fallback;
  }
}
