import React from 'react';
import { GitBranch, CheckCircle2, Terminal, ShieldCheck, Zap, Workflow, GitPullRequest } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';
import { PipelineVisualizer } from '../../components/integrations/PipelineVisualizer';

export const CicdDevOpsDoc: React.FC = () => {
 return (
 <DocsLayout
 title="CI/CD Quality Gates & DevOps Automation"
 description="Automate Core Web Vitals, AST code hygiene, and security score audits in GitHub Actions and GitLab CI pipelines."
 canonicalPath="/docs/cicd"
 >
 <section id="cicd-overview"className="space-y-4 font-mono">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-0.5 text-xs font-semibold text-cyan-400">
 <Workflow className="h-3.5 w-3.5"/>
 <span>DevOps &amp; Pipeline Automation</span>
 </div>
 <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight font-sans">
 CI/CD Quality Gates &amp; Automation
 </h1>
 <p className="text-sm text-foreground-muted leading-relaxed font-sans">
 Prevent performance regressions and security vulnerabilities before staging or production deployments. Embed CatalystLab audits directly into your pull request merge checks using GitHub Actions or GitLab CI.
 </p>
 </section>

 {/* Interactive Pipeline Visualizer */}
 <section id="pipeline-visualizer"className="space-y-4 border-t border-border pt-8 font-mono">
 <h2 className="text-xl font-bold text-primary-foreground font-sans flex items-center gap-2">
 <GitPullRequest className="h-5 w-5 text-cyan-400"/>
 <span>Interactive Pull Request Quality Gate Visualizer</span>
 </h2>
 <p className="text-xs text-foreground-muted font-sans">
 Test how synthetic telemetry failure blocks merges until performance &amp; security regressions are remediated:
 </p>
 <PipelineVisualizer />
 </section>

 {/* GitHub Actions */}
 <section id="github-actions"className="space-y-4 border-t border-border pt-8 font-mono">
 <h2 className="text-xl font-bold text-primary-foreground font-sans">GitHub Actions Workflow (.github/workflows/quality-gate.yml)</h2>
 <p className="text-xs text-foreground-muted font-sans">
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
 -H"Authorization: Bearer \$CATALYST_API_KEY"\\
 -H"Content-Type: application/json"\\
 -d '{"url":"'"\$PREVIEW_URL"'","engine":"master-suite"}')
 
 SCORE=\$(echo \$RESPONSE | jq '.score')
 echo"Audit Master Score: \$SCORE"
 
 if ["\$SCORE"-lt 85 ]; then
 echo"::error::Quality Gate Failed: Score \$SCORE is below minimum threshold of 85."
 exit 1
 fi`}
 />
 </section>

 {/* GitLab CI */}
 <section id="gitlab-ci"className="space-y-4 border-t border-border pt-8 font-mono">
 <h2 className="text-xl font-bold text-primary-foreground font-sans">GitLab CI/CD Recipe (.gitlab-ci.yml)</h2>
 <p className="text-xs text-foreground-muted font-sans">
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
 -H"Authorization: Bearer $CATALYST_API_KEY"
 -H"Content-Type: application/json"
 -d"{\"url\": \"$CI_ENVIRONMENT_URL\", \"engine\": \"website-health\"}"
 | grep '"status":"PASS"'
 rules:
 - if: '$CI_COMMIT_BRANCH =="main"'`}
 />
 </section>

 {/* Webhooks & Alerts */}
 <section id="webhooks-alerts"className="space-y-4 border-t border-border pt-8 font-mono">
 <h2 className="text-xl font-bold text-primary-foreground font-sans">Automated Telemetry Webhooks (Slack / Discord)</h2>
 <p className="text-xs text-foreground-muted font-sans">
 Configure real-time notifications for automated uptime probes or degraded quality scores directly into your engineering Slack or Discord channels.
 </p>
 </section>
 </DocsLayout>
 );
};
export default CicdDevOpsDoc;
