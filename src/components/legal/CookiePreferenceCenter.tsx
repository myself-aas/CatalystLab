import React, { useEffect, useState } from 'react';
import { Check, Trash2, ShieldCheck, Cookie, Lock } from 'lucide-react';
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
    name: 'Firebase Auth storage',
    kind: 'Required',
    purpose: 'Your sign-in session, managed by the Firebase SDK.',
    lifetime: 'Until you sign out',
    removable: false,
  },
  {
    name: 'catalystlab_local_session',
    kind: 'Required',
    purpose: 'Keeps the local preview sign-in active on this device.',
    lifetime: 'Until you sign out or clear storage',
    removable: false,
  },
  {
    name: 'catalyst_visitor_id',
    kind: 'Required',
    purpose: 'Anonymous id the rate limiter uses to count your daily scans.',
    lifetime: 'Until you clear storage',
    removable: false,
  },
  {
    name: 'catalystlab_cached_reports',
    kind: 'Cache',
    purpose: 'Caches your recent audits so the dashboard opens without a round trip.',
    lifetime: 'Until you clear storage',
    removable: true,
  },
  {
    name: 'catalystlab_theme_preference',
    kind: 'Preference',
    purpose: 'Remembers whether you chose the light or dark theme.',
    lifetime: 'Until you clear storage',
    removable: true,
  },
  {
    name: 'catalystlab_cookie_consent',
    kind: 'Record',
    purpose: 'Records the choice you saved on this page.',
    lifetime: 'Until you clear storage',
    removable: true,
  },
];

const REMOVABLE_KEYS = STORED_ITEMS.filter((item) => item.removable).map((item) => item.name);

const BROWSER_INSTRUCTIONS = {
  chrome: 'Settings → Privacy and security → Third-party cookies',
  safari: 'Settings → Privacy → Manage Website Data',
  firefox: 'Settings → Privacy & Security → Cookies and Site Data',
  edge: 'Settings → Cookies and site permissions → Manage and delete cookies',
} as const;

type Browser = keyof typeof BROWSER_INSTRUCTIONS;

/**
 * Cookie preference centre.
 *
 * The previous version offered a "local cache and theme" switch that wrote a
 * flag nothing ever read: turning it off changed no behaviour. Rather than
 * describe an opt-out that does not exist, this page lists what is stored,
 * removes the items a page is allowed to remove, and points at the browser for
 * the rest.
 */
export const CookiePreferenceCenter: React.FC = () => {
  const [activeBrowser, setActiveBrowser] = useState<Browser>('chrome');
  const [removed, setRemoved] = useState<string[] | null>(null);
  const [clearError, setClearError] = useState<string | null>(null);
  const [hasConsentRecord, setHasConsentRecord] = useState(false);

  useEffect(() => {
    try {
      setHasConsentRecord(localStorage.getItem('catalystlab_cookie_consent') !== null);
    } catch {
      setHasConsentRecord(false);
    }
  }, []);

  const recordAcknowledged = () => {
    setClearError(null);
    try {
      localStorage.setItem(
        'catalystlab_cookie_consent',
        JSON.stringify({ acknowledgedAt: new Date().toISOString() }),
      );
      setHasConsentRecord(true);
    } catch (error) {
      logger.warn('Could not record the cookie notice acknowledgement:', error);
      setClearError('Your browser blocked local storage, so this acknowledgement could not be recorded.');
    }
  };

  const clearOptionalStorage = () => {
    setClearError(null);
    setRemoved(null);
    try {
      const cleared = REMOVABLE_KEYS.filter((key) => {
        if (localStorage.getItem(key) === null) return false;
        localStorage.removeItem(key);
        return true;
      });
      setRemoved(cleared);
      setHasConsentRecord(false);
    } catch (error) {
      logger.warn('Could not clear optional storage:', error);
      setClearError('Your browser blocked local storage, so these items could not be removed here.');
    }
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="stored-heading" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl space-y-1">
            <h2 id="stored-heading" className="framer-card-title text-foreground">
              What is stored on this device
            </h2>
            <p className="text-sm text-muted-foreground">
              Six items. Three are required for sign-in and rate limiting; three are conveniences
              you can remove below.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            {!hasConsentRecord ? (
              <button type="button" onClick={recordAcknowledged} className="ds-btn ds-btn-primary h-11 text-sm">
                <ShieldCheck className="size-4" aria-hidden="true" />
                <span>Record that I read this</span>
              </button>
            ) : (
              <span className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-success" aria-hidden="true" />
                Recorded {new Date().toLocaleDateString()}
              </span>
            )}
            <button type="button" onClick={clearOptionalStorage} className="ds-btn ds-btn-secondary h-11 text-sm">
              <Trash2 className="size-4" aria-hidden="true" />
              <span>Delete cached and optional items</span>
            </button>
          </div>
        </div>

        {clearError ? (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-foreground">
            {clearError}
          </p>
        ) : null}

        {removed ? (
          <p role="status" className="rounded-lg border border-border bg-surface p-3 text-sm text-foreground">
            {removed.length === 0
              ? 'There was nothing to delete: none of the optional items were stored.'
              : `Deleted ${removed.length} ${removed.length === 1 ? 'item' : 'items'}: ${removed.join(', ')}.`}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Browser storage written by CatalystLab</caption>
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
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${
                        item.removable
                          ? 'border-border bg-muted text-muted-foreground'
                          : 'border-success/30 bg-success/10 text-success'
                      }`}
                    >
                      {item.removable ? <Cookie className="size-3" aria-hidden="true" /> : <Lock className="size-3" aria-hidden="true" />}
                      {item.kind}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.purpose}</td>
                  <td className="py-3 text-muted-foreground">{item.lifetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          No advertising, cross-site tracking, or third-party analytics script is loaded on this
          site, so there is nothing else to opt out of.
        </p>
      </section>

      <section aria-labelledby="clear-heading" className="space-y-4 border-t border-border pt-8">
        <div className="max-w-2xl space-y-1">
          <h2 id="clear-heading" className="framer-card-title text-foreground">
            Clear everything from your browser
          </h2>
          <p className="text-sm text-muted-foreground">
            This page cannot remove the sign-in session or the rate-limit id. Use the settings for
            the browser you are in.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose your browser">
          {(Object.keys(BROWSER_INSTRUCTIONS) as Browser[]).map((browser) => (
            <button
              key={browser}
              type="button"
              aria-pressed={activeBrowser === browser}
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

        <p className="rounded-lg bg-surface p-4 text-sm text-foreground">
          {BROWSER_INSTRUCTIONS[activeBrowser]}
        </p>
      </section>
    </div>
  );
};

export default CookiePreferenceCenter;
