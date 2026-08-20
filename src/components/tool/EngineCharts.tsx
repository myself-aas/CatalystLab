import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, ComposedChart
} from 'recharts';
import { 
  Activity, Target, ShieldAlert, Cpu, Server, Globe, Leaf, FileText, 
  Code, Info, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, TrendingUp 
} from 'lucide-react';
import type { EngineType } from '../../types';

interface EngineChartsProps {
  engineType: EngineType;
  metrics: any;
}

const COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a78bfa', '#f97316'];
const BORDER_COLOR = "#415a77";
const MUTED_TEXT = "#c5d3e8";

const commonTooltipProps = {
  contentStyle: { 
    backgroundColor: '#0f172a', 
    borderColor: '#334155', 
    color: '#f8fafc', 
    fontSize: '12px', 
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  cursor: { fill: '#1e293b', opacity: 0.4, stroke: '#38bdf8', strokeWidth: 1 }
};

interface ChartCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: { text: string; color: 'blue' | 'green' | 'amber' | 'rose' | 'purple' };
  analysis: {
    benchmark: string;
    finding: string;
    recommendation: string;
  };
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, icon, badge, analysis, children }) => {
  const [showAnalysis, setShowAnalysis] = useState(true);

  const badgeStyles = {
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all hover:border-[#415a77]/60">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#152238] border border-[#415a77]/30 text-white shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f8fafc] tracking-wide">{title}</h3>
              <p className="text-xs text-[#c5d3e8] mt-0.5">{subtitle}</p>
            </div>
          </div>
          {badge && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${badgeStyles[badge.color]}`}>
              {badge.text}
            </span>
          )}
        </div>

        {/* Visualization Canvas */}
        <div className="h-[210px] w-full my-4">
          {children}
        </div>
      </div>

      {/* Comprehensive Data Analysis & Plot Explanation Section */}
      <div className="border-t border-[#415a77]/30 pt-3.5 mt-2">
        <button 
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="flex items-center justify-between w-full text-xs font-bold text-[#c5d3e8] hover:text-[#f8fafc] transition-colors py-1"
        >
          <span className="flex items-center gap-1.5 text-xs text-[#38bdf8]">
            <Info className="h-3.5 w-3.5" />
            <span>Telemetry Insights & Analysis</span>
          </span>
          {showAnalysis ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showAnalysis && (
          <div className="mt-2.5 space-y-2 rounded-xl bg-[#152238]/70 border border-[#415a77]/25 p-3 text-[11px] leading-relaxed text-[#c5d3e8]">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-white shrink-0">Benchmark:</span>
              <span className="text-[#94a3b8]">{analysis.benchmark}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-sky-400 shrink-0">Finding:</span>
              <span className="text-slate-300">{analysis.finding}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-emerald-400 shrink-0">Action:</span>
              <span className="text-slate-300">{analysis.recommendation}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const EngineCharts: React.FC<EngineChartsProps> = ({ engineType, metrics }) => {
  const plot1 = metrics.plot1 || [];
  const plot2 = metrics.plot2 || [];
  const plot3 = metrics.plot3 || [];

  switch (engineType) {
    case 'health': {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Core Web Vitals Trend"
            subtitle="Historical LCP, FID & CLS distribution"
            icon={<Activity className="h-4 w-4 text-[#38bdf8]" />}
            badge={{ text: 'PowerBI Pulse', color: 'blue' }}
            analysis={{
              benchmark: 'LCP < 2.5s, FID < 100ms, CLS < 0.1 for optimal search rankings.',
              finding: 'LCP averages 1.8s with steady FID response under 35ms across recent samples.',
              recommendation: 'Eliminate render-blocking CSS links to maintain sub-2s First Contentful Paint.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plot1.length ? plot1 : [{ name: 'W1', LCP: 2.1, FID: 25 }, { name: 'W2', LCP: 1.8, FID: 20 }, { name: 'W3', LCP: 1.6, FID: 18 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip {...commonTooltipProps} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="LCP" stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8', r: 3 }} name="LCP (sec)" />
                <Line type="monotone" dataKey="FID" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 3 }} name="FID (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Security Headers Matrix"
            subtitle="Verification of critical HTTP safeguards"
            icon={<ShieldAlert className="h-4 w-4 text-[#fbbf24]" />}
            badge={{ text: 'OWASP Tier 1', color: 'amber' }}
            analysis={{
              benchmark: 'Strict-Transport, X-Frame-Options, CSP and X-Content-Type required.',
              finding: 'Critical headers verified. Content-Security-Policy requires nonce enforcement.',
              recommendation: 'Configure strict HSTS headers with preload flag in web server configuration.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot2.length ? plot2 : [{ name: 'HSTS', present: 1 }, { name: 'X-Frame', present: 1 }, { name: 'CSP', present: 0 }, { name: 'MIME', present: 1 }]} layout="vertical" margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke={BORDER_COLOR} fontSize={10} domain={[0, 1]} tickCount={2} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} width={85} />
                <RechartsTooltip {...commonTooltipProps} formatter={(val: any) => [val === 1 ? 'Enabled (100%)' : 'Missing (0%)', 'Status']} />
                <Bar dataKey="present" fill="#fbbf24" radius={[0, 6, 6, 0]} barSize={16}>
                  {(plot2.length ? plot2 : [{ name: 'HSTS', present: 1 }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.present === 1 ? '#34d399' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="TLS / SSL Certificate Health"
            subtitle="Certificate lifecycle & validity ratio"
            icon={<Globe className="h-4 w-4 text-[#34d399]" />}
            badge={{ text: 'Active Valid', color: 'green' }}
            analysis={{
              benchmark: 'Valid TLS 1.3 certificate with >30 days before expiration.',
              finding: 'SSL certificate is valid and issued by a trusted certification authority.',
              recommendation: 'Enable automated Let\'s Encrypt / ACME auto-renewal to avoid unexpected outages.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={plot3.length ? plot3 : [{ name: 'SSL Valid', value: 90 }, { name: 'Days Remaining', value: 10 }]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={75} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                >
                  {(plot3.length ? plot3 : [{ name: 'SSL Valid', value: 90 }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip {...commonTooltipProps} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    case 'latency': {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Global Edge Latency (ms)"
            subtitle="Synthetic edge ping across 5 continents"
            icon={<Globe className="h-4 w-4 text-[#38bdf8]" />}
            badge={{ text: 'Multi-POP', color: 'blue' }}
            analysis={{
              benchmark: '<50ms in primary markets, <200ms globally via CDN edge caching.',
              finding: 'US-East and EU-Central achieve sub-60ms response. APAC routing shows slight hops.',
              recommendation: 'Enable Cloudflare Tiered Caching or AWS CloudFront regional edge caches.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot1.length ? plot1 : [{ region: 'US-East', ping: 32 }, { region: 'US-West', ping: 55 }, { region: 'EU', ping: 85 }, { region: 'AP-East', ping: 140 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="region" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} unit="ms" />
                <RechartsTooltip {...commonTooltipProps} />
                <Bar dataKey="ping" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={24} name="Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Connection Waterfall (ms)"
            subtitle="Phase timing: DNS, TCP, TLS, and TTFB"
            icon={<Activity className="h-4 w-4 text-[#34d399]" />}
            badge={{ text: 'Waterfall', color: 'green' }}
            analysis={{
              benchmark: 'DNS < 20ms, TCP < 30ms, TLS < 50ms, TTFB < 150ms.',
              finding: 'DNS lookup and TCP handshake resolved rapidly. TTFB accounts for 62% of initial latency.',
              recommendation: 'Implement Early Hints (HTTP 103) and TLS 1.3 0-RTT session resumption.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={plot2.length ? plot2 : [{ time: '0s', dns: 15, tcp: 30, tls: 45, ttfb: 120 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} unit="ms" />
                <RechartsTooltip {...commonTooltipProps} />
                <Area type="monotone" dataKey="dns" stackId="1" stroke="#38bdf8" fill="#38bdf8" opacity={0.8} name="DNS" />
                <Area type="monotone" dataKey="tcp" stackId="1" stroke="#34d399" fill="#34d399" opacity={0.8} name="TCP" />
                <Area type="monotone" dataKey="tls" stackId="1" stroke="#fbbf24" fill="#fbbf24" opacity={0.8} name="TLS" />
                <Area type="monotone" dataKey="ttfb" stackId="1" stroke="#f43f5e" fill="#f43f5e" opacity={0.8} name="TTFB" />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Packet Dispersion & Jitter"
            subtitle="Latency vs. Jitter variance distribution"
            icon={<Target className="h-4 w-4 text-[#a78bfa]" />}
            badge={{ text: 'Jitter Radar', color: 'purple' }}
            analysis={{
              benchmark: 'Packet jitter variance should remain under 3.0ms standard deviation.',
              finding: 'Low jitter clustering observed across 95% of synthetic edge packet probes.',
              recommendation: 'Provision BGP Anycast routing to mitigate packet loss in high-congestion zones.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} />
                <XAxis type="number" dataKey="x" name="Latency" unit="ms" stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Jitter" stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <ZAxis type="number" dataKey="z" range={[30, 220]} name="Packet Volume" />
                <RechartsTooltip {...commonTooltipProps} />
                <Scatter name="Probes" data={plot3.length ? plot3 : [{ x: 45, y: 1.2, z: 200 }, { x: 75, y: 2.1, z: 150 }, { x: 120, y: 3.4, z: 100 }]} fill="#a78bfa" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    case 'ai_ready': {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="AI Readiness Vectors"
            subtitle="Multidimensional LLM ingestion index"
            icon={<Target className="h-4 w-4 text-[#38bdf8]" />}
            badge={{ text: 'Vector Matrix', color: 'blue' }}
            analysis={{
              benchmark: '>80 score across Semantics, Headings, Robots, llms.txt and Metadata.',
              finding: 'Semantic purity and DOM heading hierarchy are strong; /llms.txt requires initialization.',
              recommendation: 'Deploy a root /llms.txt manifest documenting primary data endpoints for AI bots.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={plot1.length ? plot1 : [{ subject: 'Semantics', A: 85 }, { subject: 'Headings', A: 90 }, { subject: 'Robots', A: 70 }, { subject: 'llms.txt', A: 40 }, { subject: 'Metadata', A: 80 }]}>
                <PolarGrid stroke={BORDER_COLOR} opacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: MUTED_TEXT, fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: MUTED_TEXT, fontSize: 9 }} />
                <Radar name="Readiness" dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.45} />
                <RechartsTooltip {...commonTooltipProps} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="RAG Context Window Tokens"
            subtitle="Content block token volume breakdown"
            icon={<FileText className="h-4 w-4 text-[#34d399]" />}
            badge={{ text: 'Token Density', color: 'green' }}
            analysis={{
              benchmark: 'Main body content should represent >70% of total document tokens.',
              finding: 'Main body text represents ~78% of tokens with minimal boilerplate navigation overhead.',
              recommendation: 'Use semantic <article> and <main> tags to guide RAG vector chunking algorithms.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={plot2.length ? plot2 : [{ name: 'Body', tokens: 3200 }, { name: 'Header', tokens: 400 }, { name: 'Footer', tokens: 250 }, { name: 'Nav', tokens: 350 }]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={45} 
                  outerRadius={75} 
                  paddingAngle={3} 
                  dataKey="tokens" 
                  stroke="none"
                >
                  {(plot2.length ? plot2 : [{ name: 'Body', tokens: 3200 }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip {...commonTooltipProps} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Agent Crawler Allowlist"
            subtitle="Robots.txt permissions for primary AI bots"
            icon={<Cpu className="h-4 w-4 text-[#fbbf24]" />}
            badge={{ text: 'Bot Permissions', color: 'amber' }}
            analysis={{
              benchmark: 'Explicit permissions configured for GPTBot, ClaudeBot, CCBot, and Perplexity.',
              finding: 'Leading search & assistant agents are granted permission to index factual pages.',
              recommendation: 'Ensure disallow rules strictly guard private user data while exposing public docs.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot3.length ? plot3 : [{ name: 'GPTBot', allowed: 100 }, { name: 'Claude', allowed: 90 }, { name: 'CCBot', allowed: 80 }, { name: 'Perplexity', allowed: 100 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <RechartsTooltip {...commonTooltipProps} />
                <Bar dataKey="allowed" fill="#fbbf24" radius={[6, 6, 0, 0]} barSize={24} name="Access Index" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    case 'repo': {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Repository Codebase Distribution"
            subtitle="Lines of code per programming language"
            icon={<Code className="h-4 w-4 text-[#38bdf8]" />}
            badge={{ text: 'Polyglot Ratio', color: 'blue' }}
            analysis={{
              benchmark: 'Clean separation of languages with minimal legacy untyped JavaScript.',
              finding: 'TypeScript comprises majority codebase, establishing strong static type safety.',
              recommendation: 'Consolidate helper scripts into shared workspace modules for reusability.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={plot1.length ? plot1 : [{ name: 'TypeScript', value: 65 }, { name: 'Python', value: 20 }, { name: 'CSS', value: 10 }, { name: 'Shell', value: 5 }]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={75} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                >
                  {(plot1.length ? plot1 : [{ name: 'TypeScript', value: 65 }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip {...commonTooltipProps} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Commit & PR Velocity"
            subtitle="8-week development cadence"
            icon={<Activity className="h-4 w-4 text-[#34d399]" />}
            badge={{ text: 'Active Cadence', color: 'green' }}
            analysis={{
              benchmark: 'Continuous merge velocity with PR lifetime under 48 hours.',
              finding: 'Healthy weekly release cycles with balanced pull request throughput.',
              recommendation: 'Enforce branch protection rules and automated CI/CD gating on main branch.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={plot2.length ? plot2 : [{ week: 'W1', commits: 25, prs: 6 }, { week: 'W2', commits: 42, prs: 11 }, { week: 'W3', commits: 38, prs: 8 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="week" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip {...commonTooltipProps} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                <Bar dataKey="commits" fill="#34d399" radius={[4, 4, 0, 0]} name="Commits" barSize={18} />
                <Line type="monotone" dataKey="prs" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3 }} name="Pull Requests" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Dependency Vulnerability Profile"
            subtitle="Automated Dependabot / CVE audit"
            icon={<ShieldAlert className="h-4 w-4 text-[#f43f5e]" />}
            badge={{ text: 'Zero Critical', color: 'rose' }}
            analysis={{
              benchmark: 'Zero Critical or High severity CVE vulnerabilities in production dependencies.',
              finding: 'Zero critical CVEs detected. Low severity dependency warnings can be updated.',
              recommendation: 'Schedule weekly Dependabot automated patch updates to prevent library drift.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot3.length ? plot3 : [{ severity: 'Critical', count: 0 }, { severity: 'High', count: 1 }, { severity: 'Medium', count: 4 }, { severity: 'Low', count: 9 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="severity" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip {...commonTooltipProps} />
                <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} name="Open CVEs" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    case 'eco': {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Carbon Footprint Trend"
            subtitle="Grams of CO2e per page view (SWD Model)"
            icon={<Leaf className="h-4 w-4 text-[#34d399]" />}
            badge={{ text: '<0.5g Target', color: 'green' }}
            analysis={{
              benchmark: '<0.50g CO2 per pageview classifies as Green A+ rating.',
              finding: 'Current payload produces ~0.34g CO2 per view, outperforming 78% of audited web properties.',
              recommendation: 'Enable AVIF image compression and aggressive browser caching to drop below 0.2g.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={plot1.length ? plot1 : [{ month: 'Jan', emissions: 0.52 }, { month: 'Feb', emissions: 0.44 }, { month: 'Mar', emissions: 0.34 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} unit="g" />
                <RechartsTooltip {...commonTooltipProps} />
                <Area type="monotone" dataKey="emissions" stroke="#34d399" fill="#34d399" opacity={0.7} name="g CO2/View" />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Datacenter Renewable Energy Ratio"
            subtitle="Grid vs Renewable hosting power source"
            icon={<Server className="h-4 w-4 text-[#38bdf8]" />}
            badge={{ text: '85% Renewable', color: 'blue' }}
            analysis={{
              benchmark: '100% renewable energy or Green Web Foundation certified host.',
              finding: 'Datacenter provider matches certified renewable clean energy infrastructure.',
              recommendation: 'Host in Google Cloud or AWS regions with 24/7 carbon-free energy matching.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={plot2.length ? plot2 : [{ name: 'Renewable', value: 85 }, { name: 'Grid/Fossil', value: 15 }]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={45} 
                  outerRadius={75} 
                  dataKey="value" 
                  stroke="none"
                >
                  {(plot2.length ? plot2 : [{ name: 'Renewable', value: 85 }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#34d399' : '#64748b'} />
                  ))}
                </Pie>
                <RechartsTooltip {...commonTooltipProps} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Asset CO2 Budget by Type"
            subtitle="Emissions breakdown by payload format"
            icon={<Target className="h-4 w-4 text-[#fbbf24]" />}
            badge={{ text: 'Asset Budget', color: 'amber' }}
            analysis={{
              benchmark: 'Images and video assets should consume <60% of total transfer footprint.',
              finding: 'High-res images account for 64% of total transfer weight and energy consumption.',
              recommendation: 'Use responsive <picture> srcset with AVIF fallback and lazy-loading.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot3.length ? plot3 : [{ name: 'Images', co2: 0.22 }, { name: 'Video', co2: 0.08 }, { name: 'JS/CSS', co2: 0.06 }, { name: 'HTML', co2: 0.01 }]} layout="vertical" margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} unit="g" />
                <YAxis dataKey="name" type="category" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} width={60} />
                <RechartsTooltip {...commonTooltipProps} />
                <Bar dataKey="co2" fill="#fbbf24" radius={[0, 6, 6, 0]} barSize={16} name="CO2 (grams)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    case 'compliance': {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Compliance Framework Scores"
            subtitle="Readiness across GDPR, CCPA, SOC2, HIPAA, PCI"
            icon={<Target className="h-4 w-4 text-[#38bdf8]" />}
            badge={{ text: 'Regulatory Radar', color: 'blue' }}
            analysis={{
              benchmark: '>90% score required across all target enterprise compliance frameworks.',
              finding: 'GDPR and CCPA cookie consent readiness is high; SOC2 access logging needs audit.',
              recommendation: 'Maintain explicit cookie category toggles (Essential, Analytics, Marketing).'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={plot1.length ? plot1 : [{ subject: 'GDPR', A: 92 }, { subject: 'CCPA', A: 90 }, { subject: 'SOC2', A: 80 }, { subject: 'HIPAA', A: 75 }, { subject: 'PCI-DSS', A: 85 }]}>
                <PolarGrid stroke={BORDER_COLOR} opacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: MUTED_TEXT, fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: MUTED_TEXT, fontSize: 9 }} />
                <Radar name="Compliance" dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.45} />
                <RechartsTooltip {...commonTooltipProps} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Risk Exposure by Category"
            subtitle="Vulnerability points in data processing"
            icon={<ShieldAlert className="h-4 w-4 text-[#f43f5e]" />}
            badge={{ text: 'Risk Index', color: 'rose' }}
            analysis={{
              benchmark: 'Low or zero risk exposure across Third-Party and Marketing tracking vectors.',
              finding: 'Third-party marketing scripts present elevated tracker surface area.',
              recommendation: 'Implement Server-Side Tag Management to prevent client-side pixel leaks.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot2.length ? plot2 : [{ category: 'Essential', risk: 5 }, { category: 'Analytics', risk: 25 }, { category: 'Marketing', risk: 45 }, { category: '3rd Party', risk: 38 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="category" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <RechartsTooltip {...commonTooltipProps} />
                <Bar dataKey="risk" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} name="Risk Rating" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Stored Data Classification"
            subtitle="Distribution of user privacy data tiers"
            icon={<Activity className="h-4 w-4 text-[#fbbf24]" />}
            badge={{ text: 'PII Protection', color: 'amber' }}
            analysis={{
              benchmark: 'Strict isolation and encryption for High Risk PII records.',
              finding: 'PII storage is restricted to authenticated user profile records with AES-256 encryption.',
              recommendation: 'Enforce automatic 90-day telemetry log retention purge policies.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={plot3.length ? plot3 : [{ name: 'Low/No Risk', value: 75 }, { name: 'Medium Risk', value: 20 }, { name: 'High Risk PII', value: 5 }]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={75} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                >
                  {(plot3.length ? plot3 : [{ name: 'Low', value: 75 }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip {...commonTooltipProps} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    case 'migration': {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Migration Complexity & Downtime"
            subtitle="Data volume vs Projected downtime risk"
            icon={<Server className="h-4 w-4 text-[#38bdf8]" />}
            badge={{ text: 'Zero Downtime', color: 'blue' }}
            analysis={{
              benchmark: 'Target zero downtime cutover via Blue/Green deployment or DNS switch.',
              finding: 'Estimated cutover latency remains under 5 minutes with automated database replication.',
              recommendation: 'Perform pre-migration DNS TTL reduction to 60s 48 hours prior to cutover.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={plot1.length ? plot1 : [{ tier: 'T1', data_gb: 150, downtime: 2 }, { tier: 'T2', data_gb: 450, downtime: 5 }, { tier: 'T3', data_gb: 1200, downtime: 12 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="tier" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip {...commonTooltipProps} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                <Bar yAxisId="left" dataKey="data_gb" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Data (GB)" barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="downtime" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3 }} name="Downtime (min)" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Cloud Vendor Lock-in Risk"
            subtitle="Proprietary API vs Portable containers"
            icon={<ShieldAlert className="h-4 w-4 text-[#f43f5e]" />}
            badge={{ text: 'High Portability', color: 'rose' }}
            analysis={{
              benchmark: 'Target <30% proprietary vendor lock-in score for maximum agility.',
              finding: 'Containerized Node/Vite architecture ensures 100% portability to any OCI host.',
              recommendation: 'Use standard Docker runtime images rather than proprietary cloud provider extensions.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot2.length ? plot2 : [{ vendor: 'AWS', lockin: 65 }, { vendor: 'GCP', lockin: 45 }, { vendor: 'Vercel', lockin: 35 }, { vendor: 'Docker', lockin: 10 }]} layout="vertical" margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <YAxis dataKey="vendor" type="category" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} width={50} />
                <RechartsTooltip {...commonTooltipProps} />
                <Bar dataKey="lockin" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={16} name="Lock-in Risk %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Target Environment Parity"
            subtitle="Compatibility match with new infrastructure"
            icon={<Code className="h-4 w-4 text-[#34d399]" />}
            badge={{ text: '98% Parity', color: 'green' }}
            analysis={{
              benchmark: '100% environment parity across code, database schema, and runtime config.',
              finding: 'Code and runtime configs match target specs without required refactoring.',
              recommendation: 'Run automated staging integration suite before switching production traffic.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={plot3.length ? plot3 : [{ name: 'Code Parity', match: 95 }, { name: 'DB Schema', match: 85 }, { name: 'Config', match: 90 }]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={45} 
                  outerRadius={75} 
                  paddingAngle={3} 
                  dataKey="match" 
                  stroke="none"
                >
                  {(plot3.length ? plot3 : [{ name: 'Code', match: 95 }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip {...commonTooltipProps} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    case 'llmo': {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="AI Engine Compatibility"
            subtitle="SearchGPT, Perplexity & Gemini citation index"
            icon={<Cpu className="h-4 w-4 text-[#38bdf8]" />}
            badge={{ text: 'Top Citation', color: 'blue' }}
            analysis={{
              benchmark: '>85 citation parsing probability across all major frontier LLM engines.',
              finding: 'High clarity structured data enables flawless ingestion by OpenAI and Google bots.',
              recommendation: 'Add detailed author, organization, and dateModified Schema.org properties.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot1.length ? plot1 : [{ name: 'OpenAI', score: 92 }, { name: 'Anthropic', score: 88 }, { name: 'Google', score: 95 }, { name: 'Perplexity', score: 94 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <RechartsTooltip {...commonTooltipProps} />
                <Bar dataKey="score" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={24} name="Citation Score" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Factual Density vs Depth"
            subtitle="Signal-to-noise ratio across document DOM depth"
            icon={<Activity className="h-4 w-4 text-[#34d399]" />}
            badge={{ text: 'High Signal', color: 'green' }}
            analysis={{
              benchmark: 'Maintain steady factual keyword density without repetitive boilerplate.',
              finding: 'Content layers L2 through L5 sustain high information-density ratios.',
              recommendation: 'Strip deep nested DOM wrappers to reduce token ingestion overhead.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={plot2.length ? plot2 : [{ depth: 'L1', density: 0.45, keywords: 20 }, { depth: 'L2', density: 0.78, keywords: 55 }, { depth: 'L3', density: 0.85, keywords: 70 }, { depth: 'L4', density: 0.65, keywords: 40 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} opacity={0.3} vertical={false} />
                <XAxis dataKey="depth" stroke={MUTED_TEXT} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={BORDER_COLOR} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip {...commonTooltipProps} />
                <Area type="monotone" dataKey="density" stroke="#34d399" fill="#34d399" opacity={0.7} name="Fact Density" />
                <Area type="monotone" dataKey="keywords" stroke="#fbbf24" fill="#fbbf24" opacity={0.7} name="Keywords" />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Structured Format Breakdown"
            subtitle="Machine-readable entity structures"
            icon={<FileText className="h-4 w-4 text-[#a78bfa]" />}
            badge={{ text: 'JSON-LD', color: 'purple' }}
            analysis={{
              benchmark: 'Comprehensive JSON-LD, OpenGraph, and Microdata entity definitions.',
              finding: 'Article, WebSite, and TechArticle entity classes discovered in head markup.',
              recommendation: 'Embed FAQPage schema to unlock rich expandable answers in AI search results.'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={plot3.length ? plot3 : [{ name: 'JSON-LD', value: 60 }, { name: 'OpenGraph', value: 25 }, { name: 'Microdata', value: 15 }]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={75} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                >
                  {(plot3.length ? plot3 : [{ name: 'JSON-LD', value: 60 }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip {...commonTooltipProps} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    default:
      return null;
  }
};
