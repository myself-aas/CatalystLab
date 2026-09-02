import React from 'react';
import { Link } from 'react-router-dom';
import { EdgeMeshGlobe } from '../components/ui/edge-mesh-globe';
import { SEOHead } from '../components/common/SEOHead';
import { 
  AlertTriangle, 
  Terminal, 
  ArrowLeft, 
  Search, 
  Globe2, 
  Home, 
  Activity,
  Layers
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden pt-20 pb-12">
      <SEOHead
        title="404 - Node Unreachable | CatalystLab Anycast Mesh"
        description="The requested routing endpoint could not be resolved across any of our 42 global Edge PoPs."
      />

      {/* Ambient background grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: 404 Diagnostics & Navigation */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-mono text-amber-300 backdrop-blur-md">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>HTTP 404 • ANYCAST NODE UNREACHABLE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Route Lost in the Global Mesh.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 font-sans leading-relaxed max-w-xl">
              The packet could not be routed to any of our 42 Anycast PoPs. The requested URL may have migrated, expired, or had its BGP routing table revised.
            </p>

            {/* Diagnostic Terminal Block */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left font-mono text-xs text-slate-300 space-y-1.5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  <span>EDGE_GATEWAY_TRACE</span>
                </span>
                <span className="text-amber-400">ERR_DNS_UNRESOLVED</span>
              </div>
              <div className="text-slate-400">Origin: <span className="text-cyan-300">Client Anycast Ingress</span></div>
              <div className="text-slate-400">Mesh Status: <span className="text-emerald-400">42 PoPs Operational</span></div>
              <div className="text-slate-400 text-[11px]">Recommended action: Return to root routing matrix or dispatch domain diagnostic.</div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/"
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-sans text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
              >
                <Home className="h-4 w-4" />
                <span>Return to Home</span>
              </Link>
              
              <Link
                to="/launch-audit"
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold font-sans text-xs sm:text-sm inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Activity className="h-4 w-4 text-cyan-400" />
                <span>Launch New Audit</span>
              </Link>

              <Link
                to="/pricing"
                className="px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 font-medium font-sans text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Layers className="h-4 w-4 text-slate-400" />
                <span>View 42-PoP Pricing</span>
              </Link>
            </div>

          </div>

          {/* Right Column: 3D Static Mesh Globe with Ambient Glow */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative">
              <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>STATIC POPS IDLE FRAME</span>
              </div>
              
              <div className="w-full flex items-center justify-center py-4">
                <EdgeMeshGlobe
                  variant="static"
                  interactive={true}
                  autoSpin={false}
                  showInspector={false}
                  showChips={false}
                  showControls={false}
                  className="max-h-[320px]"
                />
              </div>

              <div className="text-[11px] font-mono text-slate-400 text-center">
                All 42 Global Anycast Nodes operating normally.
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer minimal tag */}
      <footer className="text-center text-xs font-mono text-slate-400 relative z-10">
        CatalystLab Edge Telemetry Architecture • 42 Anycast PoPs
      </footer>
    </div>
  );
};
