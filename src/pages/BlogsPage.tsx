import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

export const BlogsPage: React.FC = () => {
  const posts = [
    {
      id: '1',
      title: 'The Modern Anatomy of Website Health in the Era of AI Search',
      excerpt: 'Why traditional SEO is yielding ground to structured RAG indexing and how llms.txt standardizes generative search ingestion.',
      date: 'August 14, 2026',
      readTime: '6 min read'
    },
    {
      id: '2',
      title: 'Decimating TTFB with Multi-Region Edge Workers',
      excerpt: 'A deep-dive into synthetic edge latency telemetry across Tokyo, Frankfurt, Virginia, and Sydney points of presence.',
      date: 'August 08, 2026',
      readTime: '8 min read'
    },
    {
      id: '3',
      title: 'Automating Git Repository SecOps & Hygiene Verification',
      excerpt: 'How automated branch protection, license checks, and SECURITY.md audits prevent catastrophic supply-chain leaks.',
      date: 'July 29, 2026',
      readTime: '5 min read'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Architecture & Telemetry Insights</h1>
          <p className="mt-2 text-sm text-slate-400">
            Technical breakdowns, web performance benchmarks, and SecOps engineering practices.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 hover:border-cyan-500/40 hover:bg-slate-900/70 transition-all"
          >
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mb-2">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <h2 className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        ))}
      </main>
    </div>
  );
};
