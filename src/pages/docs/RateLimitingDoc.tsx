import React from 'react';
import { Sliders, CheckCircle2, Shield, User, Sparkles } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const RateLimitingDoc: React.FC = () => {
 return (
 <DocsLayout
 title="Sliding Token Rate Limiter"
 description="Multi-tier quota limits for anonymous, authenticated, and SuperAdmin users with token-bucket sliding windows."
 canonicalPath="/docs/rate-limiting"
 >
 <section id="tier-matrix"className="space-y-4">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 py-0.5 text-xs font-semibold text-indigo-400">
 <Sliders className="h-3.5 w-3.5"/>
 <span>Traffic Control & Fair Quotas</span>
 </div>
 <h1 className="text-3xl font-extrabold text-[#EDEDED] tracking-tight">
 Multi-Tier Sliding Rate Limiter
 </h1>
 <p className="text-base text-[#A1A1AA] leading-relaxed">
 CatalystLab employs a hybrid client-device and IP rate limiter to protect upstream infrastructure, prevent abuse, and ensure fair resource allocation across all users.
 </p>

 <div className="ds-card p-4 overflow-x-auto scrollbar-none touch-pan-x">
 <table className="w-full text-left text-sm">
 <thead className="border-b border-border bg-muted/20 text-[#A1A1AA] font-semibold">
 <tr>
 <th className="py-2.5">User Tier</th>
 <th className="py-2.5">Daily Single Scans</th>
 <th className="py-2.5">Daily Master Audits</th>
 <th className="py-2.5">Identification Key</th>
 <th className="py-2.5">Reset Window</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.06] text-[#EDEDED]">
 <tr>
 <td className="py-2.5 font-semibold">Anonymous Visitor</td>
 <td className="py-2.5 font-mono">5 scans / day</td>
 <td className="py-2.5 font-mono">1 audit / day</td>
 <td className="py-2.5 text-[#A1A1AA]"><code>vis_&#123;deviceId|IP&#125;</code></td>
 <td className="py-2.5">Midnight UTC</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold text-primary">Authenticated User (Google)</td>
 <td className="py-2.5 font-mono text-emerald-700 font-bold">10 scans / day</td>
 <td className="py-2.5 font-mono text-emerald-700 font-bold">3 audits / day</td>
 <td className="py-2.5 text-[#A1A1AA]"><code>user_&#123;UID|Email&#125;</code></td>
 <td className="py-2.5">Midnight UTC</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold text-purple-700">SuperAdmin Tier</td>
 <td className="py-2.5 font-mono text-purple-700 font-bold">Unlimited</td>
 <td className="py-2.5 font-mono text-purple-700 font-bold">Unlimited</td>
 <td className="py-2.5 text-[#A1A1AA]">Verified Admin Email</td>
 <td className="py-2.5">N/A</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* Identification & Fingerprinting */}
 <section id="client-fingerprint"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-[#EDEDED]">Identification & Client Device Fingerprinting</h2>
 <p className="text-sm text-[#A1A1AA] leading-relaxed">
 Anonymous traffic uses an in-browser persistent client UUID combined with remote client IP address hashing. When users sign in with Google Firebase Auth, their account transitions to the Authenticated Tier with elevated quotas and automatic audit history synchronization.
 </p>
 </section>

 {/* Sliding Window */}
 <section id="sliding-window"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-[#EDEDED]">Sliding Token Bucket Algorithm</h2>
 <p className="text-sm text-[#A1A1AA] leading-relaxed">
 The rate limiter maintains an in-memory and Firestore timestamp queue. Requests that exceed the daily quota trigger an HTTP 429 response with time remaining until the next quota replenishment.
 </p>

 <CodeSnippet
 title="Rate Limit Check Logic (server.ts)"
 language="typescript"
 code={`interface RateLimitRecord {
 scansCount: number;
 masterAuditCount: number;
 lastReset: string; // YYYY-MM-DD
}

function checkUserQuota(key: string, isMaster: boolean, tier: 'visitor' | 'user' | 'admin') {
 if (tier === 'admin') return { allowed: true, remaining: 999 };

 const maxScans = tier === 'user' ? 10 : 5;
 const maxMaster = tier === 'user' ? 3 : 1;
 const record = getOrCreateRecord(key);

 if (isMaster && record.masterAuditCount >= maxMaster) {
 return { allowed: false, error:"Daily Master Audit quota reached. Upgrade by logging in."};
 }
 if (!isMaster && record.scansCount >= maxScans) {
 return { allowed: false, error:"Daily single scan quota reached."};
 }

 return { allowed: true, remaining: maxScans - record.scansCount };
}`}
 />
 </section>

 {/* Response Headers */}
 <section id="headers-response"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-[#EDEDED]">Standard Rate Limit Headers</h2>
 <p className="text-sm text-[#A1A1AA] leading-relaxed">
 All API responses carry rate limit telemetry headers to allow programmatic clients to monitor quota:
 </p>

 <div className="ds-card p-4 font-mono text-xs space-y-1">
 <div><strong className="text-primary">X-RateLimit-Limit:</strong> 10</div>
 <div><strong className="text-primary">X-RateLimit-Remaining:</strong> 7</div>
 <div><strong className="text-primary">X-RateLimit-Reset:</strong> 1755859200 (Midnight UTC)</div>
 <div><strong className="text-primary">X-RateLimit-Tier:</strong> user</div>
 </div>
 </section>
 </DocsLayout>
 );
};
export default RateLimitingDoc;
