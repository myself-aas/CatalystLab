import React from 'react';
import { Bot } from 'lucide-react';
import type { AiReadinessSection } from '../../utils/telemetryParser';

interface AIRadarChartProps {
  aiReadiness: AiReadinessSection;
}

const reading = (value: boolean | null) => (value === null ? 'Not measured' : value ? 'Found' : 'Not found');

export const AIRadarChart: React.FC<AIRadarChartProps> = React.memo(({ aiReadiness }) => {
  const rows = [
    {
      label: '/llms.txt',
      value: reading(aiReadiness.hasLlmsTxt),
      note: 'Plain-text index written for language models.',
    },
    {
      label: '/.well-known/ai-plugin.json',
      value: reading(aiReadiness.hasAiPlugin),
      note: 'Optional manifest that lets agents discover tools.',
    },
    {
      label: 'AI crawler rules in robots.txt',
      value: reading(aiReadiness.hasRobotsAiDirectives),
      note: 'Named rules for GPTBot, CCBot, Claude or Anthropic.',
    },
    {
      label: 'Extracted text',
      value: aiReadiness.wordCount != null ? `${aiReadiness.wordCount.toLocaleString()} words` : 'Not measured',
      note: 'Body text after scripts and navigation are removed.',
    },
    {
      label: 'Heading tags',
      value: aiReadiness.headingsCount != null ? `${aiReadiness.headingsCount} h1–h3` : 'Not measured',
      note: 'Used by agents to infer document structure.',
    },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
            <Bot className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">AI crawler readiness</h3>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              What the engine fetched from your site. It does not query OpenAI, Anthropic, Google or
              Perplexity, so it makes no claim about how those services treat the page.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Readiness score</div>
          <div className="font-mono text-xl font-semibold tabular-nums text-foreground">
            {aiReadiness.score != null ? `${aiReadiness.score}/100` : 'Not scored'}
          </div>
        </div>
      </div>

      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <div>
              <dt className="font-mono text-xs text-foreground">{row.label}</dt>
              <dd className="mt-0.5 text-xs text-muted-foreground">{row.note}</dd>
            </div>
            <span className="font-mono text-sm text-foreground">{row.value}</span>
          </div>
        ))}
      </dl>
    </div>
  );
});
