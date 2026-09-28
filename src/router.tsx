import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

export type Route = 'home' | 'risks' | 'terms' | 'privacy' | 'app' | 'notfound';

export function routeOf(pathname: string): Route {
  const p = pathname.replace(/\/+$/, '').replace(/\/index\.html$/, '');
  switch (p) {
    case '':
      return 'home';
    case '/risks':
    case '/terms':
    case '/privacy':
    case '/app':
      return p.slice(1) as Route;
    default:
      return 'notfound';
  }
}

export function pathOf(route: Exclude<Route, 'notfound'>): string {
  return route === 'home' ? '/' : `/${route}/`;
}

const listeners = new Set<() => void>();

export function navigate(href: string) {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) {
    window.location.href = href;
    return;
  }
  const samePage = url.pathname === window.location.pathname;
  window.history.pushState(null, '', url.pathname + url.search + url.hash);
  listeners.forEach((l) => l());
  if (url.hash) {
    // Wait for the new page to render before scrolling to its section.
    requestAnimationFrame(() => document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
  } else if (!samePage) {
    window.scrollTo(0, 0);
  }
}

export function useLocation(): { route: Route; search: URLSearchParams } {
  const [, setTick] = useState(0);
  useEffect(() => {
    const update = () => setTick((n) => n + 1);
    listeners.add(update);
    window.addEventListener('popstate', update);
    return () => {
      listeners.delete(update);
      window.removeEventListener('popstate', update);
    };
  }, []);
  return { route: routeOf(window.location.pathname), search: new URLSearchParams(window.location.search) };
}

/** A link inside the site, without a page reload. */
export function Link({ href = '/', onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target === '_blank' || /^(https?:|mailto:)/.test(href)) return;
    e.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handle} {...rest} />;
}
