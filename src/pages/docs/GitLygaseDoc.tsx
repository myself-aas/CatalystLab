import React from 'react';
import { GitBranch, CheckCircle2, ShieldCheck, AlertCircle, Terminal, FileCode } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const GitLygaseDoc: React.FC = () => {
 return (
 <DocsLayout
 title="2. GitLygase (SDLC Phase 2) — Git Repo Scanner & SecOps"
 description="Automated repository hygiene, SPDX license validation, vulnerability disclosure standards, and Dependabot CI/CD security."
 canonicalPath="/docs/gitlygase"
 >
 <section id="gitlygase-overview"className="space-y-4">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 py-0.5 text-xs font-semibold text-green-400">
 <span className="h-1.5 w-1.5 rounded-full bg-green-600"/>
 <span>SDLC Phase 2: Repository Scanner</span>
 </div>
 <h1 className="text-3xl font-extrabold text-[#EDEDED] tracking-tight">
 GitLygase: Repository SecOps & Hygiene Engine
 </h1>
 <p className="text-base text-[#A1A1AA] leading-relaxed">
 GitLygase audits Git repositories for security compliance policies, open source licensing (MIT, Apache 2.0, GPL, BSD), vulnerability disclosure protocols (<code>SECURITY.md</code>), automated dependency updates, and continuous integration workflows.
 </p>
 </section>

 {/* Security Disclosure */}
 <section id="security-disclosure"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-[#EDEDED]">SECURITY.md Vulnerability Disclosure Policy</h2>
 <p className="text-sm text-[#A1A1AA] leading-relaxed">
 Repositories without a clear vulnerability policy risk public exploit disclosure. GitLygase validates the presence of a standardized <code>.github/SECURITY.md</code>:
 </p>

 <CodeSnippet
 title=".github/SECURITY.md"
 language="markdown"
 code={`# Security Policy

## Supported Versions
| Version | Supported |
| ------- | ------------------ |
| 2.x | :white_check_mark: |
| 1.x | :x: |

## Reporting a Vulnerability
Please DO NOT report security issues via public GitHub issues.
Instead, send an encrypted report to **security@catalystlab.tech** with:
- Detailed proof-of-concept steps
- Affected component and commit SHA
- Remediation proposal if available

Our security team will acknowledge receipt within 24 hours and issue a patch within 5 business days.`}
 />
 </section>

 {/* Dependabot CI */}
 <section id="dependabot-ci"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-[#EDEDED]">Automated Dependabot Security Config</h2>
 <p className="text-sm text-[#A1A1AA] leading-relaxed">
 Enforce daily package vulnerability scans across npm, Docker, and GitHub Actions:
 </p>

 <CodeSnippet
 title=".github/dependabot.yml"
 language="yaml"
 code={`version: 2
updates:
 - package-ecosystem:"npm"
 directory:"/"
 schedule:
 interval:"daily"
 open-pull-requests-limit: 10
 versioning-strategy: increase
 labels:
 -"dependencies"
 -"security"

 - package-ecosystem:"github-actions"
 directory:"/"
 schedule:
 interval:"weekly"`}
 />
 </section>

 {/* License Detection */}
 <section id="license-detection"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-[#EDEDED]">SPDX License Compliance Matrix</h2>
 <div className="ds-card p-4 overflow-x-auto scrollbar-none touch-pan-x">
 <table className="w-full text-left text-sm">
 <thead className="border-b border-border bg-muted/20 text-[#A1A1AA] font-semibold">
 <tr>
 <th className="py-2.5">SPDX Identifier</th>
 <th className="py-2.5">Commercial Use</th>
 <th className="py-2.5">Copyleft Obligation</th>
 <th className="py-2.5">Compliance Risk</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.06] text-[#EDEDED]">
 <tr>
 <td className="py-2 font-mono font-bold text-emerald-700">MIT / BSD-3-Clause</td>
 <td className="py-2 text-emerald-700">Permitted</td>
 <td className="py-2 text-[#A1A1AA]">None (Attribution only)</td>
 <td className="py-2 text-emerald-700 font-bold">Low / Permissive</td>
 </tr>
 <tr>
 <td className="py-2 font-mono font-bold text-primary">Apache-2.0</td>
 <td className="py-2 text-emerald-700">Permitted</td>
 <td className="py-2 text-[#A1A1AA]">Patent Grant Required</td>
 <td className="py-2 text-emerald-700 font-bold">Low / Permissive</td>
 </tr>
 <tr>
 <td className="py-2 font-mono font-bold text-amber-700">GPL-3.0 / AGPL-3.0</td>
 <td className="py-2 text-amber-700">Restricted</td>
 <td className="py-2 text-rose-700 font-medium">Source Disclosure Mandatory</td>
 <td className="py-2 text-rose-700 font-bold">High (Proprietary Risk)</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>
 </DocsLayout>
 );
};
export default GitLygaseDoc;
