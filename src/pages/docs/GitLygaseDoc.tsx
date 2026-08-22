import React from 'react';
import { GitBranch, CheckCircle2, ShieldCheck, AlertCircle, Terminal, FileCode } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const GitLygaseDoc: React.FC = () => {
  const toc = [
    { id: 'gitlygase-overview', title: 'Phase 2: GitLygase Overview' },
    { id: 'security-disclosure', title: 'SECURITY.md Policy Standard' },
    { id: 'dependabot-ci', title: 'Dependabot CI/CD Automation' },
    { id: 'license-detection', title: 'SPDX License Compliance' },
  ];

  return (
    <DocsLayout
      title="2. GitLygase (SDLC Phase 2) — Git Repo Scanner & SecOps"
      description="Automated repository hygiene, SPDX license validation, vulnerability disclosure standards, and Dependabot CI/CD security."
      canonicalPath="/docs/gitlygase"
      toc={toc}
    >
      <section id="gitlygase-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-semibold text-green-800">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          <span>SDLC Phase 2: Repository Scanner</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          GitLygase: Repository SecOps & Hygiene Engine
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          GitLygase audits Git repositories for security compliance policies, open source licensing (MIT, Apache 2.0, GPL, BSD), vulnerability disclosure protocols (<code>SECURITY.md</code>), automated dependency updates, and continuous integration workflows.
        </p>
      </section>

      {/* Security Disclosure */}
      <section id="security-disclosure" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">SECURITY.md Vulnerability Disclosure Policy</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Repositories without a clear vulnerability policy risk public exploit disclosure. GitLygase validates the presence of a standardized <code>.github/SECURITY.md</code>:
        </p>

        <CodeSnippet
          title=".github/SECURITY.md"
          language="markdown"
          code={`# Security Policy

## Supported Versions
| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

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
      <section id="dependabot-ci" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Automated Dependabot Security Config</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Enforce daily package vulnerability scans across npm, Docker, and GitHub Actions:
        </p>

        <CodeSnippet
          title=".github/dependabot.yml"
          language="yaml"
          code={`version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    versioning-strategy: increase
    labels:
      - "dependencies"
      - "security"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"`}
        />
      </section>

      {/* License Detection */}
      <section id="license-detection" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">SPDX License Compliance Matrix</h2>
        <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
              <tr>
                <th className="py-2.5 px-3">SPDX Identifier</th>
                <th className="py-2.5 px-3">Commercial Use</th>
                <th className="py-2.5 px-3">Copyleft Obligation</th>
                <th className="py-2.5 px-3">Compliance Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-emerald-700">MIT / BSD-3-Clause</td>
                <td className="py-2 px-3 text-emerald-700">Permitted</td>
                <td className="py-2 px-3 text-[#64748b]">None (Attribution only)</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Low / Permissive</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-sky-700">Apache-2.0</td>
                <td className="py-2 px-3 text-emerald-700">Permitted</td>
                <td className="py-2 px-3 text-[#64748b]">Patent Grant Required</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Low / Permissive</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-amber-700">GPL-3.0 / AGPL-3.0</td>
                <td className="py-2 px-3 text-amber-700">Restricted</td>
                <td className="py-2 px-3 text-rose-700 font-medium">Source Disclosure Mandatory</td>
                <td className="py-2 px-3 text-rose-700 font-bold">High (Proprietary Risk)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocsLayout>
  );
};
export default GitLygaseDoc;
