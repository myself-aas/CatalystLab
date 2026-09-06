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
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background text-foreground flex flex-col justify-between relative overflow-hidden pb-12">
 <SEOHead
 title="404 - Node Unreachable | CatalystLab Anycast Mesh"
 description="The requested routing endpoint could not be resolved across any of our 42 global Edge PoPs."
 />

 {/* Ambient background grid & glow */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.12)_0%,transparent_70%)] pointer-events-none"/>
 <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-20"/>

 <main className="ds-page-shell w-full relative z-10 my-auto">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
 
 {/* Left Column: 404 Diagnostics & Navigation */}
 <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
 
 <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 framer-micro-tag text-amber-400 backdrop-blur-md">
 <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0"/>
 <span>HTTP 404 • ANYCAST NODE UNREACHABLE</span>
 </div>

 <h1 className="framer-hero-title text-foreground">
 Route Lost in the Global Mesh.
 </h1>

 <p className="framer-body-text max-w-xl">
 The packet could not be routed to any of our 42 Anycast PoPs. The requested URL may have migrated, expired, or had its BGP routing table revised.
 </p>

 {/* Diagnostic Terminal Block */}
 <div className="ds-card p-4 text-left font-mono text-xs text-muted-foreground space-y-1.5 backdrop-blur-md">
 <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border">
 <span className="flex items-center gap-1.5">
 <Terminal className="h-3.5 w-3.5 text-[#00D2FF] shrink-0"/>
 <span>EDGE_GATEWAY_TRACE</span>
 </span>
 <span className="text-amber-400">ERR_DNS_UNRESOLVED</span>
 </div>
 <div className="text-muted-foreground">Origin: <span className="text-[#00D2FF]">Client Anycast Ingress</span></div>
 <div className="text-muted-foreground">Mesh Status: <span className="text-emerald-400">42 PoPs Operational</span></div>
 <div className="text-muted-foreground text-[11px]">Recommended action: Return to root routing matrix or dispatch domain diagnostic.</div>
 </div>

 {/* Quick Action Navigation Buttons */}
 <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
 <Link
 to="/"
 className="ds-btn ds-btn-primary text-xs sm:text-sm"
 >
 <Home className="h-4 w-4 shrink-0"/>
 <span>Return to Home</span>
 </Link>
 
 <Link
 to="/launch-audit"
 className="ds-btn ds-btn-secondary text-xs sm:text-sm"
 >
 <Activity className="h-4 w-4 text-[#00D2FF] shrink-0"/>
 <span>Launch New Audit</span>
 </Link>

 <Link
 to="/pricing"
 className="ds-btn ds-btn-ghost text-xs sm:text-sm"
 >
 <Layers className="h-4 w-4 shrink-0"/>
 <span>View 42-PoP Pricing</span>
 </Link>
 </div>

 </div>

 {/* Right Column: 3D Static Mesh Globe with Ambient Glow */}
 <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
 <div className="w-full ds-card p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative">
 <div className="absolute top-3 left-4 framer-micro-tag text-muted-foreground flex items-center gap-1.5">
 <Globe2 className="h-3.5 w-3.5 text-[#00D2FF] shrink-0"/>
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

 <div className="text-[11px] font-mono text-muted-foreground text-center">
 All 42 Global Anycast Nodes operating normally.
 </div>
 </div>
 </div>

 </div>
 </main>

 {/* Footer minimal tag */}
 <footer className="text-center text-xs font-mono text-muted-foreground relative z-10">
 CatalystLab Edge Telemetry Architecture • 42 Anycast PoPs
 </footer>
 </div>
 );
};
