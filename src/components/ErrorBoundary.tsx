import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { logger } from '../lib/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * `root` wraps the entire app (full-page recovery UI);
   * `route` wraps a single route (recovery card inside the layout).
   */
  variant?: 'root' | 'route';
}

interface ErrorBoundaryState {
  error: Error | null;
}

const CHUNK_LOAD_PATTERN =
  /Failed to fetch dynamically imported|Loading chunk \d+ failed|Importing a module script failed|error loading dynamically imported module/i;

/** One automatic reload per deploy-mismatch burst, guarded in sessionStorage. */
const RELOAD_GUARD_KEY = 'catalystlab_chunk_reload_at';
const RELOAD_GUARD_WINDOW_MS = 30_000;

function isChunkLoadFailure(error: Error): boolean {
  return error.name === 'TypeError' && CHUNK_LOAD_PATTERN.test(error.message);
}

/**
 * Top-level and per-route error boundary.
 *
 * Renders a recovery UI instead of a white screen when any render-time
 * exception escapes a page. Deploy-mismatch chunk-load failures (an open tab
 * requesting chunks that no longer exist) trigger a single automatic reload
 * so users land on the fresh deployment without manual action.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error(`[ErrorBoundary:${this.props.variant ?? 'route'}]`, error, info.componentStack);
    logger.reportError(error, { boundary: this.props.variant ?? 'route' });
  }

  componentDidMount(): void {
    const { error } = this.state;
    if (!error) return;
    // Handled in getDerivedStateFromError + render; auto-reload is attempted
    // from render guard below via state. Kept here for future reporting hooks.
  }

  private attemptChunkReload(error: Error): void {
    if (typeof window === 'undefined' || !isChunkLoadFailure(error)) return;
    const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || 0);
    if (Date.now() - last < RELOAD_GUARD_WINDOW_MS) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
    window.location.reload();
  }

  render(): React.ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    this.attemptChunkReload(error);

    const isRoot = this.props.variant === 'root';
    return (
      <div
        role="alert"
        className={
          isRoot
            ? 'min-h-screen flex items-center justify-center bg-[#060912] text-slate-100 p-6'
            : 'min-h-[60vh] flex items-center justify-center p-6'
        }
      >
        <div className="max-w-lg w-full rounded-2xl border border-slate-700/60 bg-[#0B101D] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-white">
            Something disrupted this view
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            An unexpected error occurred while rendering this page. Reloading usually
            resolves it. The issue has been logged.
          </p>
          <p className="mt-3 break-all rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-slate-500">
            {error.message.slice(0, 240)}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reload
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Go to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
