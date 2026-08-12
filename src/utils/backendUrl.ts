/** Normalized backend base URL for Socket.io and REST (no trailing slash). */
export function getBackendUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:5000';

  return raw.replace(/\/+$/, '');
}

/** Socket.io namespace URL, e.g. https://host/negotiations */
export function getBackendSocketUrl(namespace = ''): string {
  const base = getBackendUrl();
  if (!namespace) return base;
  const path = namespace.startsWith('/') ? namespace : `/${namespace}`;
  return `${base}${path}`;
}

export function isBackendConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_URL);
}
