export function getBackendUrl() {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  const port = import.meta.env.VITE_BACKEND_PORT || '5001';
  const candidate = configuredUrl || `http://localhost:${port}`;
  const isProduction = import.meta.env.PROD;

  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    const isLocalHost =
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '[::1]' ||
      url.hostname === '::1';

    if (isProduction && isLocalHost) {
      return null;
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}
