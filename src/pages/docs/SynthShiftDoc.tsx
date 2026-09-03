import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Server, Cpu, CheckCircle2, Copy, Check, ExternalLink, Code, Layers, Sparkles } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const SynthShiftDoc: React.FC = () => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const toc = [
    { id: 'synthshift-overview', title: 'Phase 1: SynthShift Overview' },
    { id: 'nosql-schema', title: 'MongoDB Atlas NoSQL Schema' },
    { id: 'compound-indexes', title: 'Compound Indexes & Capacity' },
    { id: 'master-prompt', title: 'Google AI Studio Master Prompt' },
  ];

  const masterPromptText = `You are a Principal Software Architect. Design a production-grade system migration plan from a legacy monolithic stack to a modern serverless hybrid architecture utilizing:
1. Google Cloud Firebase Authentication (Client-side token exchange)
2. Node.js Express API Ingress + Python Engine micro-workers
3. MongoDB Atlas NoSQL collection schema with compound indexes
4. Pre-aggregated team velocity and capacity trackers
5. Deterministic scoring algorithms and automated quality gates

Please provide the exact collection schemas, indexing commands, and zero-downtime database synchronization scripts.`;

  return (
    <DocsLayout
      title="1. SynthShift (SDLC Phase 1) — Platform Migration Blueprint"
      description="System design blueprint, database schemas, MongoDB Atlas indexes, and pre-aggregated capacity tracking for modern full-stack migrations."
      canonicalPath="/docs/synthshift"
      toc={toc}
    >
      <section id="synthshift-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-0.5 text-xs font-semibold text-orange-800">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
          <span>SDLC Phase 1: Platform Migration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          SynthShift: Architectural System Design Blueprint
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          SynthShift provides enterprise technical system design specifications, NoSQL schema models, and capacity planning algorithms for migrating legacy applications to resilient cloud architectures.
        </p>

        <div className="rounded-xl border border-border bg-background p-5 space-y-3">
          <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Reference Architecture</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-background border border-border p-3">
              <strong className="text-[#6872D9] block mb-1">Auth & Ingress Layer</strong>
              Firebase Auth + Express Node.js Gateway with rate limiting & OWASP headers.
            </div>
            <div className="rounded-lg bg-background border border-border p-3">
              <strong className="text-emerald-700 block mb-1">Database Store</strong>
              MongoDB Atlas with compound indexes and TTL cache collections.
            </div>
            <div className="rounded-lg bg-background border border-border p-3">
              <strong className="text-purple-700 block mb-1">Diagnostic Workers</strong>
              Python 3 subprocesses + Cheerio AST streaming engines.
            </div>
          </div>
        </div>
      </section>

      {/* NoSQL Schema */}
      <section id="nosql-schema" className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground">High-Performance MongoDB Schema</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Production schema definition for task assignments and team capacity pre-aggregation:
        </p>

        <CodeSnippet
          title="Mongoose Task Assignment Schema (models/Task.ts)"
          language="typescript"
          code={`import { Schema, model } from 'mongoose';

export interface ITask {
  projectId: string;
  assigneeId: string;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  storyPoints: number;
  tags: string[];
  dueDate: Date;
  auditMetrics?: {
    domHealthScore: number;
    latencyTtfbMs: number;
  };
}

const taskSchema = new Schema<ITask>({
  projectId: { type: String, required: true, index: true },
  assigneeId: { type: String, required: true, index: true },
  status: { type: String, required: true, enum: ['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'] },
  priority: { type: String, required: true, default: 'MEDIUM' },
  storyPoints: { type: Number, required: true, default: 1 },
  tags: [{ type: String }],
  dueDate: { type: Date, required: true },
  auditMetrics: {
    domHealthScore: Number,
    latencyTtfbMs: Number
  }
}, { timestamps: true });

// Compound Index for High-Velocity Board Queries
taskSchema.index({ projectId: 1, status: 1, assigneeId: 1 });`}
        />
      </section>

      {/* Compound Indexes */}
      <section id="compound-indexes" className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground">Compound Indexes & Capacity Aggregation</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Efficient MongoDB aggregation pipeline to compute sprint capacity without full collection scans:
        </p>

        <CodeSnippet
          title="Team Capacity Aggregation Pipeline"
          language="javascript"
          code={`db.tasks.aggregate([
  { $match: { projectId: "proj_9f82a1", status: { $ne: "COMPLETED" } } },
  { 
    $group: {
      _id: "$assigneeId",
      totalPoints: { $sum: "$storyPoints" },
      taskCount: { $sum: 1 },
      criticalTasks: {
        $sum: { $cond: [{ $eq: ["$priority", "CRITICAL"] }, 1, 0] }
      }
    }
  },
  { $sort: { totalPoints: -1 } }
]);`}
        />
      </section>

      {/* Master Prompt */}
      <section id="master-prompt" className="space-y-4 border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Google AI Studio Master Planning Prompt</h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(masterPromptText);
              setCopiedPrompt(true);
              setTimeout(() => setCopiedPrompt(false), 2000);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copiedPrompt ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied Prompt</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy Master Prompt</span>
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 text-xs font-mono text-foreground leading-relaxed">
          {masterPromptText}
        </div>
      </section>
    </DocsLayout>
  );
};
export default SynthShiftDoc;
