import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReports } from '../lib/firebase';
import { ENGINES_MAP } from '../data/engines';
import type { AuditReport } from '../types';
import { LayoutDashboard, Search, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

export const ReportsDirectoryPage: React.FC = () => {
  const { user, login } = useAuth();
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const data = await getUserReports();
          setReports(data);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = reports.filter(r => 
    r.url?.toLowerCase().includes(query.toLowerCase()) || 
    r.engine?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                Audit Reports & Telemetry History
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Browse permanent audit records, shareable permalinks, and diagnostic dossiers.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Open Personal Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {!user ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
            <div className="text-3xl mb-3">🔐</div>
            <h2 className="text-xl font-bold text-white">Sign In to View Saved Audits</h2>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Sign in with Google to retrieve all your past audits and shareable permalinks.
            </p>
            <button
              onClick={() => login()}
              className="mt-6 rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search audits by domain or URL (e.g. example.com)..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading audit records...</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center text-xs text-slate-400">
                No saved audit records found. <Link to="/" className="text-cyan-400 underline">Run a new audit</Link>.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(r => {
                  const meta = ENGINES_MAP[r.engine] || { name: r.engine, icon: '⚡' };
                  return (
                    <Link
                      key={r.id}
                      to={`/report/${r.id}`}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-cyan-500/40 hover:bg-slate-900 transition-all block"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-lg">{meta.icon}</span>
                        <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {meta.name}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-white truncate">{r.url}</div>
                      <div className="text-[10px] text-slate-500 mt-2">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
