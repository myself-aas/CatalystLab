import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, Sliders, Lock, Cookie } from 'lucide-react';
import { logger } from '../../lib/logger';

/**
 * What CatalystLab actually writes to this browser.
 *
 * Source of truth: the annex in `src/legal/privacy.ts` and the storage keys in
 * `src/context/*`, `src/lib/firebase.ts`, and `src/utils/rateLimiter.ts`. Every
 * row below is read or written by shipped code; the previous list advertised a
 * "catalystlab_telemetry_cache" and Google Analytics cookies that do not exist.
 */
const STORED_ITEMS = [
  {
    name: 'catalystlab_local_session',
    kind: 'Sign-in',
    purpose: 'Keeps the local preview sign-in active on this device.',
    lifetime: 'Until you sign out or clear storage',
  },
  {
    name: 'Firebase Auth storage',
    kind: 'Sign-in',
    purpose: 'Your real sign-in session, managed by the Firebase SDK.',
    lifetime: 'Until you sign out',
  },
  {
    name: 'catalyst_visitor_id',
    kind: 'Required',
    purpose: 'Anonymous id the rate limiter uses to count your daily scans.',
    lifetime: 'Until you clear storage',
  },
  {
    name: 'catalystlab_cached_reports',
    kind: 'Optional',
    purpose: 'Caches your recent audits so the dashboard opens without a round trip.',
    lifetime: 'Until you clear storage',
  },
  {
    name: 'catalystlab_theme_preference',
    kind: 'Optional',
    purpose: 'Remembers whether you chose the light or dark theme.',
    lifetime: 'Until you clear storage',
  },
  {
    name: 'catalystlab_cookie_consent',
    kind: 'Required',
    purpose: 'Records the choice you save on this page.',
    lifetime: 'Until you clear storage',
  },
];

const BROWSER_INSTRUCTIONS = {
  chrome: 'Settings → Privacy and security → Third-party cookies',
  safari: 'Settings → Privacy → Prevent cross-site tracking',
  firefox: 'Settings → Privacy & Security → Enhanced Tracking Protection',
  edge: 'Settings → Cookies and site permissions → Manage and delete cookies',
} as const;

type Browser = keyof typeof BROWSER_INSTRUCTIONS;

export const CookiePreferenceCenter: React.FC = () => {
  const [preferences, setPreferences] = useState({
    essential: true,
    localCache: true,
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeBrowser, setActiveBrowser] = useState<Browser>('chrome');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('catalystlab_cookie_consent');
      if (stored) {
        const parsed = JSON.parse(stored) as { localCache?: boolean };
        setPreferences({ essential: true, localCache: parsed.localCache ?? true });
      }
    } catch (e) {
      logger.warn('Could not read the stored cookie preference:', e);
    }
  }, []);

  const handleSave = () => {
    setSaveError(null);
    try {
      localStorage.setItem('catalystlab_cookie_consent', JSON.stringify(preferences));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      logger.warn('Could not save the cookie preference:', e);
      setSaveError('Your browser blocked local storage, so this choice could not be saved.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="ds-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <h2 className="framer-card-title flex items-center gap-2 text-foreground">
              <Sliders className="size-5 shrink-0 text-info" aria-hidden="true" />
              Your choice
            </h2>
            <p className="text-sm text-muted-foreground">
              One item is optional. Everything else is required for the app to work.
            </p>
          </div>

          <button type="button" onClick={handleSave} className="ds-btn ds-btn-primary shrink-0 text-sm">
            {saved ? <Check className="size-4 shrink-0" aria-hidden="true" /> : <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />}
            <span>{saved ? 'Choice saved' : 'Save my choice'}</span>
          </button>
        </div>

        {saveError && (
          <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-foreground">
            {saveError}
          </p>
        )}

        <div className="mt-5 space-y-3">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Lock className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">Sign-in and rate limiting</span>
                <span className="rounded border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  Always on
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Without these two items you cannot stay signed in and the daily scan allowance
                cannot be counted.
              </p>
            </div>
            <input
              type="checkbox"
              checked
              disabled
              aria-label="Sign-in and rate limiting storage, always on"
              className="mt-0.5 size-4 shrink-0 cursor-not-allowed rounded border-border"
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Cookie className="size-3.5 shrink-0 text-info" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">Local cache and theme</span>
                <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Optional
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Keeps your recent audits and theme choice on this device so pages open faster.
                Turning this off deletes nothing already stored; use your browser settings for that.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.localCache}
              aria-label="Local cache and theme"
              onClick={() => setPreferences((p) => ({ ...p, localCache: !p.localCache }))}
              className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                preferences.localCache ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow transition-transform ${
                  preferences.localCache ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          No advertising, cross-site tracking, or third-party analytics script is loaded on this
          site, so there is nothing to opt out of beyond the cache above.
        </p>
      </section>

      <section className="ds-card p-6 sm:p-8">
        <h2 className="framer-card-title text-foreground">What is stored on this device</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every key below is written by shipped CatalystLab code.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="py-2.5 pr-4 font-medium">Key</th>
                <th scope="col" className="py-2.5 pr-4 font-medium">Type</th>
                <th scope="col" className="py-2.5 pr-4 font-medium">Purpose</th>
                <th scope="col" className="py-2.5 font-medium">Lifetime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {STORED_ITEMS.map((item) => (
                <tr key={item.name} className="align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-mono text-xs font-medium text-foreground">
                    {item.name}
                  </th>
                  <td className="py-3 pr-4 text-muted-foreground">{item.kind}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.purpose}</td>
                  <td className="py-3 text-muted-foreground">{item.lifetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ds-card p-6 sm:p-8">
        <h2 className="framer-card-title text-foreground">Clear it from your browser</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This page can record a choice but cannot delete browser storage. Use the settings for
          the browser you are in.
        </p>

        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Browser">
          {(Object.keys(BROWSER_INSTRUCTIONS) as Browser[]).map((browser) => (
            <button
              key={browser}
              type="button"
              role="tab"
              aria-selected={activeBrowser === browser}
              onClick={() => setActiveBrowser(browser)}
              className={`min-h-11 rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
                activeBrowser === browser
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {browser}
            </button>
          ))}
        </div>

        <p className="mt-4 rounded-lg bg-surface p-4 text-sm text-foreground">
          {BROWSER_INSTRUCTIONS[activeBrowser]}
        </p>
      </section>
    </div>
  );
};

export default CookiePreferenceCenter;
