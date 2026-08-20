import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  Check, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  Info, 
  RefreshCw,
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
    <div className="space-y-10">
      {/* Policy Banner */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-300 mb-1">
            <Cookie className="h-4 w-4" />
            <span>TRANSPARENT PRIVACY TOKENS • STRICT OPT-IN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
            Cookie Policy & Consent Manager
          </h2>
          <p className="mt-2 text-xs text-[#cbd5e1] max-w-3xl leading-relaxed">
            CatalystLab does not use tracking pixels, ad networks, or invasive cross-domain beacons. We only use lightweight functional session tokens to keep your diagnostic consoles responsive.
          </p>
        </div>
      </LazyReveal>

      {/* Interactive Preference Center */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0b192c] flex items-center gap-2">
                <Sliders className="h-5 w-5 text-[#415a77]" />
                <span>Interactive Cookie Preference Center</span>
              </h3>
              <p className="text-xs text-[#415a77] mt-0.5">
                Customize which token types CatalystLab is permitted to store in your browser.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#152238] transition-all shadow-sm active:scale-98"
            >
              {saved ? <Check className="h-4 w-4 text-emerald-400" /> : <ShieldCheck className="h-4 w-4 text-sky-300" />}
              <span>{saved ? 'Preferences Saved!' : 'Save My Preferences'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Essential (Locked) */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-sm text-[#0b192c]">Strictly Essential & Authentication Tokens</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-[#415a77] leading-relaxed">
                  Required for Firebase OAuth session persistence, CSRF security, and route protection. Cannot be disabled without breaking application authentication.
                </p>
              </div>
              <div className="shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="h-5 w-5 rounded text-[#0b192c] cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Telemetry Cache (Toggle) */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 flex items-start justify-between gap-4 hover:border-[#415a77]/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-sky-600" />
                  <span className="font-bold text-sm text-[#0b192c]">Diagnostic Telemetry Cache</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[#415a77] leading-relaxed">
                  Caches recent synthetic DNS latency and terminal audit results in browser storage for instant page restoration without hitting worker rate limits.
                </p>
              </div>
              <div className="shrink-0 pt-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.telemetryCache}
                  onClick={() => setPreferences({ ...preferences, telemetryCache: !preferences.telemetryCache })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.telemetryCache ? 'bg-[#0b192c]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.telemetryCache ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Performance Analytics (Toggle) */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 flex items-start justify-between gap-4 hover:border-[#415a77]/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-sm text-[#0b192c]">Anonymous Usage & Crash Metrics</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-[#415a77] leading-relaxed">
                  Helps our engineering team detect UI rendering bottlenecks, socket disconnects, and mobile viewport errors without collecting IP addresses.
                </p>
              </div>
              <div className="shrink-0 pt-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.analytics}
                  onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.analytics ? 'bg-[#0b192c]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.analytics ? 'translate-x-5' : 'translate-x-0'
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
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-[#0b192c] mb-2">Detailed Cookie & Token Inventory</h3>
          <p className="text-xs text-[#415a77] mb-6">
            Comprehensive audit of every token written by CatalystLab.tech or authenticated cloud providers.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#0b192c] font-bold">
                  <th className="py-3 px-4 rounded-l-xl">Cookie Identifier</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Functional Purpose</th>
                  <th className="py-3 px-4 rounded-r-xl">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[#415a77]">
                {cookieList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#f8fafc]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0b192c]">{item.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-[#f4f6fa] border border-[#e2e8f0] px-2 py-0.5 text-[11px] font-semibold text-[#0b192c]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{item.provider}</td>
                    <td className="py-3.5 px-4 max-w-xs">{item.purpose}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">{item.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </LazyReveal>

      {/* Browser Specific Guides */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-6">
            <div>
              <h3 className="text-lg font-bold text-[#f8fafc]">Browser-Level Cookie Management</h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                You can also configure global cookie restrictions directly inside your browser settings.
              </p>
            </div>

            <div className="flex items-center rounded-2xl bg-[#152238] p-1 border border-[#415a77]/40">
              {(['chrome', 'safari', 'firefox', 'edge'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBrowser(b)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                    activeBrowser === b
                      ? 'bg-sky-500 text-[#07111e] shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#415a77]/25 bg-[#091524] p-5">
            <span className="text-[10px] uppercase font-bold text-sky-300">Instructions for {activeBrowser.toUpperCase()}:</span>
            <p className="text-xs text-[#cbd5e1] mt-2 font-mono leading-relaxed">
              {browserInstructions[activeBrowser]}
            </p>
          </div>
        </div>
      </LazyReveal>
    </div>
  );
};
