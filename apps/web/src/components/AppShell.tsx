import { Link, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

function routeTitle(pathname: string) {
  if (pathname.startsWith('/lines/')) {
    return 'Line Diagnostics';
  }

  return 'Production Line Overview';
}

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Factory Operations Dashboard</p>
          <h1>{routeTitle(location.pathname)}</h1>
        </div>
        <nav className="topbar-nav">
          <Link to="/">Overview</Link>
        </nav>
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
}
