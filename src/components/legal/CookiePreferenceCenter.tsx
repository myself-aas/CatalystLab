import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  Check, 
  ShieldCheck, 
  Sliders, 
  Globe, 
  Lock, 
  Zap 
} from 'lucide-react';
import { LazyReveal } from '../common/LazyAnimate';

export const CookiePreferenceCenter: React.FC = () => {
  const [preferences, setPreferences] = useState({
    essential: true, // Always locked true
    telemetryCache: true,
    analytics: false
  });
  const [saved, setSaved] = useState(false);
  const [activeBrowser, setActiveBrowser] = useState<'chrome' | 'safari' | 'firefox' | 'edge'>('chrome');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('catalystlab_cookie_consent');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read stored cookie preferences:", e);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('catalystlab_cookie_consent', JSON.stringify(preferences));
    } catch (e) {
      console.warn("Could not save cookie preferences:", e);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const cookieList = [
    {
      name: '__session',
      category: 'Essential',
      provider: 'Firebase Auth',
      purpose: 'Authenticates your active superadmin and user dashboard sessions across browser tabs.',
      expiry: 'Session / 14 Days'
    },
    {
      name: 'catalystlab_telemetry_cache',
      category: 'Performance',
      provider: 'CatalystLab Engine',
      purpose: 'Stores local client-side audit history to reduce redundant DNS probe latency.',
      expiry: '30 Days'
    },
    {
      name: 'catalystlab_theme_prefs',
      category: 'Functional',
      provider: 'CatalystLab UI',
      purpose: 'Remembers your terminal font scaling, chart animations, and high-contrast toggle.',
      expiry: '1 Year'
    },
    {
      name: '_ga / _gid (Optional)',
      category: 'Analytics',
      provider: 'Google Analytics (if enabled)',
      purpose: 'Measures page load speeds and detects synthetic navigation drops.',
      expiry: '24 Hours / 2 Years'
    }
  ];

  const browserInstructions = {
    chrome: "Go to Settings > Privacy and security > Third-party cookies > Select your preferred cookie blocking rules.",
    safari: "Go to Preferences > Privacy > Ensure 'Prevent cross-site tracking' and customize cookie blocking.",
    firefox: "Go to Settings > Privacy & Security > Enhanced Tracking Protection > Choose Standard or Strict mode.",
    edge: "Go to Settings > Cookies and site permissions > Manage and delete cookies and site data."
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Policy Banner */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-brand-slate/40 bg-white p-6 sm:p-8 text-black shadow-xl">
          <div className="flex items-center gap-2 text-xs text-accent-cyan mb-1">
            <Cookie className="h-4 w-4" />
            <span>TRANSPARENT PRIVACY TOKENS • STRICT OPT-IN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight font-sans">
            Cookie Policy &amp; Consent Manager
          </h2>
          <p className="mt-2 text-xs text-brand-periwinkle max-w-3xl leading-relaxed font-sans">
            CatalystLab does not use tracking pixels, ad networks, or invasive cross-domain beacons. We only use lightweight functional session tokens to keep your diagnostic consoles responsive.
          </p>
        </div>
      </LazyReveal>

      {/* Interactive Preference Center */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-brand-slate/40 bg-white p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-slate/30 pb-5">
            <div>
              <h3 className="text-base font-bold text-black flex items-center gap-2 font-sans">
                <Sliders className="h-4 w-4 text-accent-cyan" />
                <span>Interactive Cookie Preference Center</span>
              </h3>
              <p className="text-xs text-brand-periwinkle mt-0.5 font-sans">
                Customize which token types CatalystLab is permitted to store in your browser.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
            >
              {saved ? <Check className="h-3.5 w-3.5 text-accent-emerald" /> : <ShieldCheck className="h-3.5 w-3.5 text-accent-cyan" />}
              <span>{saved ? 'Preferences Saved!' : 'Save My Preferences'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Essential (Locked) */}
            <div className="rounded-xl border border-brand-slate/40 bg-brand-oxford p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-accent-emerald" />
                  <span className="font-bold text-xs text-black font-sans">Strictly Essential &amp; Authentication Tokens</span>
                  <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded border border-accent-emerald/40 bg-white text-accent-emerald">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-brand-periwinkle leading-relaxed font-sans">
                  Required for Firebase OAuth session persistence, CSRF security, and route protection. Cannot be disabled without breaking application authentication.
                </p>
              </div>
              <div className="shrink-0 pt-0.5">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="h-4 w-4 rounded text-brand-slate cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Telemetry Cache (Toggle) */}
            <div className="rounded-xl border border-brand-slate/40 bg-brand-oxford p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-accent-cyan" />
                  <span className="font-bold text-xs text-black font-sans">Diagnostic Telemetry Cache</span>
                  <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded border border-accent-cyan/40 bg-white text-accent-cyan">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-brand-periwinkle leading-relaxed font-sans">
                  Caches recent synthetic DNS latency and terminal audit results in browser storage for instant page restoration without hitting worker rate limits.
                </p>
              </div>
              <div className="shrink-0 pt-0.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.telemetryCache}
                  onClick={() => setPreferences({ ...preferences, telemetryCache: !preferences.telemetryCache })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.telemetryCache ? 'bg-brand-slate' : 'bg-white'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.telemetryCache ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Performance Analytics (Toggle) */}
            <div className="rounded-xl border border-brand-slate/40 bg-brand-oxford p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-accent-amber" />
                  <span className="font-bold text-xs text-black font-sans">Anonymous Usage &amp; Crash Metrics</span>
                  <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded border border-accent-amber/40 bg-white text-accent-amber">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-brand-periwinkle leading-relaxed font-sans">
                  Helps our engineering team detect UI rendering bottlenecks, socket disconnects, and mobile viewport errors without collecting IP addresses.
                </p>
              </div>
              <div className="shrink-0 pt-0.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.analytics}
                  onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.analytics ? 'bg-brand-slate' : 'bg-white'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.analytics ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </LazyReveal>

      {/* Complete Cookie Inventory Table */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-brand-slate/40 bg-white p-6 sm:p-8 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-black font-sans">Detailed Cookie &amp; Token Inventory</h3>
            <p className="text-xs text-brand-periwinkle mt-0.5 font-sans">
              Comprehensive audit of every token written by CatalystLab.tech or authenticated cloud providers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-brand-slate/30 bg-brand-oxford text-black font-bold">
                  <th className="py-2.5 px-3 rounded-l-lg">Cookie Identifier</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Functional Purpose</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-slate/20 text-brand-periwinkle">
                {cookieList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-accent-cyan">{item.name}</td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-brand-oxford border border-brand-slate/40 px-2 py-0.5 text-[10px] font-semibold text-black">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">{item.provider}</td>
                    <td className="py-3 px-3 max-w-xs font-sans text-xs">{item.purpose}</td>
                    <td className="py-3 px-3 text-[11px] text-brand-slate-light">{item.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </LazyReveal>

      {/* Browser Specific Guides */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-brand-slate/40 bg-white p-6 sm:p-8 text-black shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-slate/30 pb-5">
            <div>
              <h3 className="text-base font-bold text-black font-sans">Browser-Level Cookie Management</h3>
              <p className="text-xs text-brand-periwinkle mt-0.5 font-sans">
                You can also configure global cookie restrictions directly inside your browser settings.
              </p>
            </div>

            <div className="flex items-center rounded-xl bg-brand-oxford p-1 border border-brand-slate/40">
              {(['chrome', 'safari', 'firefox', 'edge'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBrowser(b)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeBrowser === b
                      ? 'bg-brand-slate text-white border border-brand-periwinkle/30 shadow-sm'
                      : 'text-brand-periwinkle hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-brand-slate/40 bg-brand-oxford p-4">
            <span className="text-[10px] uppercase font-bold text-accent-cyan">Instructions for {activeBrowser.toUpperCase()}:</span>
            <p className="text-xs text-brand-periwinkle mt-1.5 font-sans leading-relaxed">
              {browserInstructions[activeBrowser]}
            </p>
          </div>
        </div>
      </LazyReveal>
    </div>
  );
};
