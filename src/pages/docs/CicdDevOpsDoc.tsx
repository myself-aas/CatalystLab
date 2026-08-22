import React from 'react';
import { GitBranch, CheckCircle2, Terminal, ShieldCheck, Zap, Workflow } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const CicdDevOpsDoc: React.FC = () => {
  const toc = [
    { id: 'cicd-overview', title: 'CI/CD Automation Overview' },
    { id: 'github-actions', title: 'GitHub Actions Quality Gate' },
    { id: 'gitlab-ci', title: 'GitLab CI/CD Pipeline' },
    { id: 'webhooks-alerts', title: 'Automated Telemetry Webhooks' },
  ];

  return (
    <DocsLayout
      title="CI/CD Quality Gates & DevOps Automation"
      description="Automate Core Web Vitals and security score audits in GitHub Actions and GitLab CI pipelines."
      canonicalPath="/docs/cicd"
      toc={toc}
    >
      <section id="cicd-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-xs font-semibold text-sky-800">
          <Workflow className="h-3.5 w-3.5" />
          <span>DevOps & Pipeline Automation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          CI/CD Quality Gates & Automation
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          Prevent performance regressions and security vulnerabilities before staging or production deployments. Embed CatalystLab audits directly into your pull request merge checks using GitHub Actions or GitLab CI.
        </p>
      </section>

      {/* GitHub Actions */}
      <section id="github-actions" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">GitHub Actions Workflow (.github/workflows/quality-gate.yml)</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Trigger a Master Audit whenever a preview PR URL is deployed:
        </p>

        <CodeSnippet
          title=".github/workflows/catalystlab-gate.yml"
          language="yaml"
          code={`name: CatalystLab Telemetry Quality Gate

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  telemetry-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Execute CatalystLab Audit
        env:
          CATALYST_API_KEY: \${{ secrets.CATALYST_API_KEY }}
          PREVIEW_URL: \${{ steps.deploy.outputs.preview_url }}
        run: |
          RESPONSE=\$(curl -s -X POST https://www.catalystlab.tech/api/run-engine \\
            -H "Authorization: Bearer \$CATALYST_API_KEY" \\
            -H "Content-Type: application/json" \\
            -d '{"url": "'"\$PREVIEW_URL"'", "engine": "master-suite"}')
          
          SCORE=\$(echo \$RESPONSE | jq '.score')
          echo "Audit Master Score: \$SCORE"
          
          if [ "\$SCORE" -lt 80 ]; then
            echo "Quality Gate Failed: Score \$SCORE is below minimum threshold of 80."
            exit 1
          fi`}
        />
      </section>

      {/* GitLab CI */}
      <section id="gitlab-ci" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">GitLab CI/CD Recipe (.gitlab-ci.yml)</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Integrate quality auditing into GitLab pipelines:
        </p>

        <CodeSnippet
          title=".gitlab-ci.yml"
          language="yaml"
          code={`stages:
  - test
  - quality-gate

catalystlab_audit:
  stage: quality-gate
  image: curlimages/curl:latest
  script:
    - >
      curl -s -X POST https://www.catalystlab.tech/api/run-engine
      -H "Authorization: Bearer $CATALYST_API_KEY"
      -H "Content-Type: application/json"
      -d "{\"url\": \"$CI_ENVIRONMENT_URL\", \"engine\": \"website-health\"}"
      | grep '"status":"PASS"'
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'`}
        />
      </section>

      {/* Webhooks & Alerts */}
      <section id="webhooks-alerts" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Automated Telemetry Webhooks (Slack / Discord)</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Configure real-time notifications for automated uptime probes or degraded quality scores directly into your engineering Slack or Discord channels.
        </p>
      </section>
    </DocsLayout>
  );
};
export default CicdDevOpsDoc;
