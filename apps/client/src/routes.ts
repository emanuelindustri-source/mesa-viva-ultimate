export type Route = 'home' | 'play' | 'privacy' | 'terms';

const BASE = import.meta.env.BASE_URL;

export function currentRoute(pathname = globalThis.location?.pathname ?? '/'): Route {
  const relative = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const segment = relative.replace(/^\/+/, '').split('/')[0];
  if (segment === 'play') return 'play';
  if (segment === 'privacy') return 'privacy';
  if (segment === 'terms') return 'terms';
  return 'home';
}

export function routeHref(path: '' | 'play' | 'privacy' | 'terms'): string {
  if (path === '') return BASE;
  return `${BASE.replace(/\/$/, '')}/${path}/`;
}

export function assetHref(path: string): string {
  return `${BASE.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
}

export function queryParam(name: string, search = globalThis.location?.search ?? ''): string | null {
  try {
    return new URLSearchParams(search).get(name);
  } catch {
    return null;
  }
}

export function roomCodeFromUrl(search = globalThis.location?.search ?? ''): string | null {
  const code = queryParam('sala', search);
  return code !== null && /^\d{6}$/.test(code) ? code : null;
}

export function navigate(path: '' | 'play' | 'privacy' | 'terms'): void {
  globalThis.location?.assign(routeHref(path));
}
