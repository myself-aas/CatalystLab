import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleSecurity } from '../context/RoleSecurityContext';
import type { BlogPost } from '../types';
import { getBlogPostById, saveBlogPost, deleteBlogPost } from '../lib/firebase';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { getBlogCoverImage } from '../utils/blogImageMap';
import { SEOHead } from '../components/common/SEOHead';
import { calculateReadingTime } from '../utils/readingTime';
import { HeroImageLivePreview } from '../components/blog/HeroImageLivePreview';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Edit3,
  Columns,
  Maximize2,
  Minimize2,
  Trash2,
  ExternalLink,
  Sparkles,
  Tag,
  Folder,
  Image as ImageIcon,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  HelpCircle,
  Layers,
  FileCode,
  FileText,
  Search,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

const CATEGORIES = [
  'AI & LLMO',
  'Edge Latency',
  'SecOps & Compliance',
  'DOM & Performance',
  'Web Architecture',
  'Sustainability & Green Web',
  'Release Notes',
  'Engineering'
];

const SAMPLE_UNSPLASH_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
    title: 'AI Neural Networks & Vector Embeddings'
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    title: 'High-Performance Code & DOM Architecture'
  },
  {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    title: 'Global Edge Network & Optical Anycast Routing'
  },
  {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200',
    title: 'Zero-Trust SecOps & OWASP Defense Matrix'
  },
  {
    url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=1200',
    title: 'Git Version Control & CI/CD Pipelines'
  },
  {
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200',
    title: 'Green Web Datacenters & Carbon Telemetry'
  },
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
    title: 'Cloud Infrastructure & Platform Migration'
  },
  {
    url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=1200',
    title: 'Generative Search & LLMO Knowledge Discovery'
  },
  {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    title: 'Microchips & Quantum Computing Hardware'
  },
  {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    title: 'Engineering Operations Command Center'
  },
  {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    title: 'High-Density Cloud Servers & Kubernetes Cluster'
  },
  {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    title: 'Master Audit & Real-Time Performance Analytics'
  }
];

const TEMPLATES: { label: string; template: string }[] = [
  {
    label: 'Architecture Benchmark Dossier',
    template: `## Executive Summary
Introduce the technical architecture, target workload, and performance benchmarks under real-world traffic.

### Telemetry & Diagnostics Overview
1. **Edge Network Latency (TTFB)**: Monitored at ~45ms global average across 14 edge PoPs.
2. **DOM Depth & Render Profiling**: Total DOM nodes kept below 800 with 0 layout reflows.
3. **Core Web Vitals Impact**: LCP < 1.1s, INP < 48ms, CLS = 0.00.

### Code Implementation & Tuning
\`\`\`typescript
// High-performance edge handler pattern
export async function handleEdgeRequest(req: Request): Promise<Response> {
  const cacheKey = req.url;
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const response = await fetch(req);
  // Store with aggressive stale-while-revalidate headers
  return response;
}
\`\`\`

### Key Findings & Recommendations
- Configure stale-while-revalidate caching on dynamic telemetry endpoints.
- Compress large JSON payloads with Brotli/Gzip compression.
- Isolate non-critical third-party analytics into async Web Workers.`
  },
  {
    label: 'AI Crawler & LLMO Readiness Audit',
    template: `## Overview of LLMO Audit
This report analyzes crawlability, schema semantics, and markdown ingestion readiness for next-generation AI agents.

### Key Indexing Signals
- **Semantic Structure**: High-contrast heading hierarchy (H1 -> H2 -> H3) with zero skipped levels.
- **Machine Readability**: Rich JSON-LD Schema.org metadata and strict robots.txt directives.
- **API Equivalency**: Fast, programmatic JSON endpoints matching all human-facing web views.

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Evaluating Autonomous LLM Ingestion Latencies",
  "author": {
    "@type": "Organization",
    "name": "CatalystLab Telemetry Team"
  }
}
\`\`\`

### Action Items for Engineering Teams
1. Ensure \`robots.txt\` explicitly allows friendly AI agent user-agents (GPTBot, PerplexityBot, Google-Extended).
2. Expose structured JSON-LD entities on all primary benchmark and audit pages.`
  },
  {
    label: 'SecOps Threat Analysis & Post-Mortem',
    template: `## Incident Summary
Detailed analysis of the observed vulnerability vector, time-to-remediation, and defensive security posture.

### Attack Vector Analysis
- **Vector**: Unsanitized HTTP header injection attempt on edge proxy routes.
- **Impact Radius**: Zero unauthorized data access; blocked by Cloudflare & CatalystLab strict rate limiters.
- **Response Time**: Automated threat detection triggered within 120 milliseconds.

\`\`\`bash
# Verification test probe
curl -I -X GET "https://api.catalystlab.tech/health" \\
  -H "X-Forwarded-For: 127.0.0.1" \\
  -H "User-Agent: CatalystLab-Security-Probe/1.0"
\`\`\`

### Hardening Measures Implemented
- [x] Enforced strict Content-Security-Policy (CSP) headers across all routes.
- [x] Added sliding-window burst rate limiters for anonymous API requests.
- [x] Automated SHA-256 integrity verification for external scripts.`
  }
];

export const BlogEditorPage: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { effectiveRole, hasPermission, roleConfig } = useRoleSecurity();

  const isCreateMode = !routeId || routeId === 'new' || routeId === 'create';
  const localStorageDraftKey = isCreateMode ? 'catalystlab_blog_draft_new' : `catalystlab_blog_draft_${routeId}`;

  // Form State
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: TEMPLATES[0].template,
    category: 'AI & LLMO',
    tags: ['Architecture', 'Telemetry', 'SecOps'],
    authorName: user?.displayName || 'CatalystLab SecOps Team',
    authorEmail: user?.email || 'shuvo.1807016@bau.edu.bd',
    authorAvatar: user?.photoURL || '',
    coverImage: SAMPLE_UNSPLASH_IMAGES[0].url,
    status: 'published',
    readTime: '5 min read'
  });

  const isOwnerOrAdmin = isCreateMode || isAdmin || effectiveRole === 'superadmin' || (user != null && post.authorEmail === user.email);

  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [customSlugActive, setCustomSlugActive] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInlineHeroPreview, setShowInlineHeroPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing post if editing
  useEffect(() => {
    if (!isCreateMode && routeId) {
      let isMounted = true;
      setLoading(true);

      getBlogPostById(routeId)
        .then((fetched) => {
          if (!isMounted) return;
          if (fetched) {
            setPost(fetched);
            if (fetched.slug) setCustomSlugActive(true);
          } else {
            showNotification('Post not found, initializing fresh editor.', 'error');
          }
        })
        .catch((err) => {
          console.error('Error fetching blog for editing:', err);
          showNotification('Could not load blog post from server.', 'error');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [routeId, isCreateMode]);

  // Sync user info if creating
  useEffect(() => {
    if (isCreateMode && user) {
      setPost((prev) => ({
        ...prev,
        authorName: prev.authorName || user.displayName || 'CatalystLab Engineer',
        authorEmail: prev.authorEmail || user.email || '',
        authorAvatar: prev.authorAvatar || user.photoURL || ''
      }));
    }
  }, [isCreateMode, user]);

  // Auto-generate slug when title changes (unless user manually customized slug)
  const handleTitleChange = (newTitle: string) => {
    setHasUnsavedChanges(true);
    const generatedSlug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 150);

    setPost((prev) => ({
      ...prev,
      title: newTitle,
      slug: customSlugActive ? prev.slug : generatedSlug
    }));
  };

  const handleSlugChange = (newSlug: string) => {
    setHasUnsavedChanges(true);
    setCustomSlugActive(true);
    const clean = newSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '')
      .replace(/^-|-$/g, '')
      .substring(0, 150);

    setPost((prev) => ({ ...prev, slug: clean }));
  };

  // Word count & Reading time calculation (Accurate technical metric based on text length, code blocks & images)
  const stats = useMemo(() => {
    return calculateReadingTime(post.content, post.excerpt);
  }, [post.content, post.excerpt]);

  // Update readTime automatically
  useEffect(() => {
    setPost((prev) => ({ ...prev, readTime: stats.readTime }));
  }, [stats.readTime]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Tag Management
  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter' && e.key !== ',') return;
    if (e) e.preventDefault();

    const val = tagInput.trim().replace(/^,|,$/g, '');
    if (val) {
      const currentTags = post.tags || [];
      if (!currentTags.includes(val)) {
        setPost((prev) => ({
          ...prev,
          tags: [...currentTags, val]
        }));
        setHasUnsavedChanges(true);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHasUnsavedChanges(true);
    setPost((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove)
    }));
  };

  // Markdown Toolbar Inserts
  const insertMarkdown = (before: string, after: string = '', defaultPlaceholder: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = post.content || '';
    const selectedText = currentText.substring(start, end) || defaultPlaceholder;

    const replacement = `${before}${selectedText}${after}`;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    setPost((prev) => ({ ...prev, content: newContent }));
    setHasUnsavedChanges(true);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+S)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave('published');
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**', 'bold text');
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*', 'italic text');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      insertMarkdown('  ', '');
    }
  };

  // Save / Publish
  const handleSave = async (statusOverride?: 'published' | 'draft') => {
    if (!hasPermission('feature:write_blogs')) {
      showNotification('Pro membership or elevated role required to publish articles.', 'error');
      return;
    }
    if (!isOwnerOrAdmin) {
      showNotification('Access Denied: You do not have permission to modify this article.', 'error');
      return;
    }
    if (!post.title?.trim()) {
      showNotification('Please provide an article title.', 'error');
      return;
    }
    if (!post.content?.trim()) {
      showNotification('Article content cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      const finalStatus = statusOverride || post.status || 'published';
      const payloadToSave: Partial<BlogPost> = {
        ...post,
        status: finalStatus,
        slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      };

      const savedId = await saveBlogPost(payloadToSave);
      setHasUnsavedChanges(false);
      localStorage.removeItem(localStorageDraftKey);

      showNotification(
        isCreateMode
          ? `Article published successfully as ${finalStatus}!`
          : `Article "${post.title}" successfully updated!`,
        'success'
      );

      // If created new, transition URL cleanly to the edit route or back to blog list
      if (isCreateMode && savedId) {
        setTimeout(() => {
          navigate(`/blogs/edit/${savedId}`, { replace: true });
        }, 800);
      }
    } catch (err: unknown) {
      console.error('Failed to save article:', err);
      showNotification(`Failed to save article: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Post
  const handleDelete = async () => {
    if (!post.id) return;
    if (!confirm(`Are you sure you want to permanently delete "${post.title}"?`)) return;

    setSaving(true);
    try {
      await deleteBlogPost(post.id);
      showNotification('Article deleted successfully.', 'success');
      setTimeout(() => {
        navigate('/blogs');
      }, 600);
    } catch (err: unknown) {
      console.error('Delete failed:', err);
      showNotification(`Failed to delete: ${err.message}`, 'error');
      setSaving(false);
    }
  };

  const handleCopyLiveLink = () => {
    const slug = post.slug || post.id || 'article';
    const liveUrl = `${window.location.origin}/blogs/${slug}`;
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 text-amber-600 animate-spin mb-4" />
        <div className="text-lg font-bold">Loading Article Editor Studio...</div>
        <p className="text-sm text-slate-400 mt-1">Retrieving markdown document and metadata.</p>
      </div>
    );
  }

  const liveArticleSlug = post.slug || post.id;

  return (
    <div className={`min-h-screen bg-white text-black flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      <SEOHead
        title={isCreateMode ? 'Create New Article | CatalystLab Studio' : `Edit: ${post.title || 'Article'} | CatalystLab Studio`}
        description="Dedicated Markdown and telemetry article editor with real-time preview, SEO optimization, and Unsplash integration."
      />

      {/* 1. TOP DEDICATED APP BAR */}
      <header className="sticky top-0 z-30 border-b border-cyan-500/20 bg-[#091527]/95 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left Zone: Back & Title Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  return;
                }
                navigate(-1);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-black hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Return to previous view"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isCreateMode ? 'bg-black/20 text-amber-600 border border-cyan-400/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                {isCreateMode ? <Sparkles className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
                <span>{isCreateMode ? 'New Article' : 'Editing Article'}</span>
              </span>

              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {stats.readTime}
                </span>
                <span className="text-slate-600">•</span>
                <span>{stats.words.toLocaleString()} words</span>
                {stats.codeBlocksCount > 0 && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400">{stats.codeBlocksCount} code blocks</span>
                  </>
                )}
              </div>

              {hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md border border-gray-200/50">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Saved
                </span>
              )}
            </div>
          </div>

          {/* Center Zone: Mode Switchers (Split, Edit, Preview) */}
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-xl bg-[#0d1f38] p-1 border border-gray-200/70">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'edit'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-400 hover:text-black'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Write Only</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'split'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-400 hover:text-black'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'preview'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-400 hover:text-black'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Full Preview</span>
              </button>
            </div>
          </div>

          {/* Right Zone: Actions (Draft, Publish, Live Link, Fullscreen) */}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden lg:inline-flex p-2 rounded-lg border border-gray-200 bg-slate-800/80 text-gray-700 hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title={isFullscreen ? 'Exit Fullscreen' : 'Zen Fullscreen Writing Mode'}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>

            {!isCreateMode && liveArticleSlug && (
              <a
                href={`/blogs/${liveArticleSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Open live article in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View Live</span>
              </a>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-gray-800 hover:bg-slate-700 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black hover:bg-black-hover border border-brand-periwinkle/30 px-4 py-1.5 text-xs font-bold text-black disabled:opacity-50 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent-amber-strong" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 text-accent-amber-strong" />
                  <span>{isCreateMode ? 'Publish Article' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl transition-all ${
          notification.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border border-rose-500/40'
            : 'bg-emerald-950/90 text-emerald-200 border border-emerald-500/40'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="h-4 w-4 text-rose-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content Area (col-span-8 or col-span-12 in full preview) */}
        <main className={`space-y-6 ${viewMode === 'preview' ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
          
          {/* Article Title Input Box */}
          <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1f38] p-5 sm:p-6 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                Article Title & Headline
              </label>
              <input
                type="text"
                value={post.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Next.js 15 Server Action Latencies: Multi-Region Telemetry Benchmark"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-lg sm:text-xl font-extrabold text-black placeholder:text-slate-500 focus:border-black focus:outline-none transition-colors"
              />
            </div>

            {/* Permanent URL Slug Preview & Editor */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <LinkIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="font-mono text-slate-500">catalystlab.tech/blogs/</span>
                <input
                  type="text"
                  value={post.slug || ''}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="custom-article-slug"
                  className="bg-transparent border-b border-dashed border-slate-600 font-mono text-amber-600 focus:border-black focus:outline-none px-1 py-0.5 max-w-[240px] sm:max-w-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowInlineHeroPreview(!showInlineHeroPreview)}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                    showInlineHeroPreview
                      ? 'bg-black/20 text-amber-600 border-cyan-400/40'
                      : 'bg-slate-800 text-slate-400 border-gray-200 hover:text-black'
                  }`}
                  title="Toggle live hero banner preview"
                >
                  <ImageIcon className="h-3 w-3 text-amber-600" />
                  <span>{showInlineHeroPreview ? 'Hide Hero Banner' : 'Live Hero Banner Preview'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLiveLink}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedLink ? 'Copied URL!' : 'Copy Permanent URL'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Inline Hero Image Live Preview */}
          {showInlineHeroPreview && viewMode !== 'preview' && (
            <HeroImageLivePreview
              imageUrl={post.coverImage || ''}
              title={post.title || 'Untitled Technical Article'}
              category={post.category || 'Architecture'}
              authorName={post.authorName || 'CatalystLab Telemetry Team'}
              readTime={stats.readTime}
              excerpt={post.excerpt || ''}
              onUrlChange={(newUrl) => {
                setPost((prev) => ({ ...prev, coverImage: newUrl }));
                setHasUnsavedChanges(true);
              }}
              presetImages={SAMPLE_UNSPLASH_IMAGES}
            />
          )}

          {/* Rich Markdown Formatting Toolbar (Visible in edit and split modes) */}
          {viewMode !== 'preview' && (
            <div className="rounded-2xl border border-gray-200 bg-[#0d1f38] p-2.5 shadow-md">
              <div className="flex flex-wrap items-center gap-1">
                
                {/* Heading group */}
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('# ', '', 'Heading 1')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Heading 1"
                  >
                    <Heading1 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ', '', 'Heading 2')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Heading 2"
                  >
                    <Heading2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('### ', '', 'Heading 3')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Heading 3"
                  >
                    <Heading3 className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-5 w-px bg-slate-800 mx-1" />

                {/* Inline formatting group */}
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**', 'bold text')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*', 'italic text')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('~~', '~~', 'strikethrough')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('`', '`', 'code')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Inline Code"
                  >
                    <Code className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-5 w-px bg-slate-800 mx-1" />

                {/* Blocks group */}
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ', '', 'Quoted text')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Blockquote"
                  >
                    <Quote className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ', '', 'List item')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('1. ', '', 'Numbered item')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- [ ] ', '', 'Task')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Task Checklist"
                  >
                    <CheckSquare className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-5 w-px bg-slate-800 mx-1" />

                {/* Advanced Inserters */}
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('```typescript\n', '\n```', '// Code snippet')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Code Block"
                  >
                    <FileCode className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('[', '](https://)', 'Link text')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('![', '](https://images.unsplash.com/photo-1558494949-ef010cbdcc31)', 'Image description')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('| Metric | Status | Latency |\n|---|---|---|\n| Edge TTFB | Optimal | 42ms |\n| LCP | Good | 1.1s |\n')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Telemetry Table"
                  >
                    <TableIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n---\n')}
                    className="p-1.5 text-gray-700 hover:text-amber-600 hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    title="Horizontal Divider"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Templates Selector */}
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Templates:</span>
                  <select
                    onChange={(e) => {
                      const selected = TEMPLATES.find((t) => t.label === e.target.value);
                      if (selected) {
                        if (confirm(`Load template "${selected.label}"? This will append to your editor.`)) {
                          setPost((prev) => ({
                            ...prev,
                            content: (prev.content ? `${prev.content}\n\n` : '') + selected.template
                          }));
                          setHasUnsavedChanges(true);
                        }
                      }
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-amber-600 focus:border-black focus:outline-none"
                  >
                    <option value="" disabled>Insert Technical Blueprint...</option>
                    {TEMPLATES.map((t) => (
                      <option key={t.label} value={t.label}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Split / Edit / Preview Workspace */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* 1. WRITE MODE OR SPLIT LEFT */}
            {viewMode !== 'preview' && (
              <div className={`rounded-2xl border border-cyan-500/20 bg-[#0d1f38] p-4 sm:p-5 shadow-xl flex flex-col ${
                viewMode === 'split' ? 'min-h-[550px]' : 'min-h-[700px]'
              }`}>
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-200 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-600" />
                    <span>Markdown Source Stream</span>
                  </div>
                  <span>Tab: 2 Spaces • Shortcuts: Ctrl+B, Ctrl+I, Ctrl+S</span>
                </div>

                <textarea
                  ref={textareaRef}
                  value={post.content || ''}
                  onChange={(e) => {
                    setPost((prev) => ({ ...prev, content: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Write your in-depth telemetry analysis, benchmarks, architecture patterns, and technical remediation here..."
                  className="flex-1 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm font-mono leading-relaxed text-black placeholder:text-slate-600 focus:border-black focus:outline-none resize-y min-h-[480px]"
                />
              </div>
            )}

            {/* 2. PREVIEW MODE OR SPLIT RIGHT */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-2xl text-[#0b192c]">
                
                {/* Header in Preview */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300 px-3 py-0.5 text-xs font-bold">
                      {post.category || 'Architecture'}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime || '5 min read'}</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Live Rendered Reader View
                  </span>
                </div>

                {/* Article Headline */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b192c] tracking-tight leading-tight mb-6">
                  {post.title || 'Untitled Engineering Article'}
                </h1>

                {/* Hero / Cover Image Banner */}
                {post.coverImage && (
                  <div className="mb-8 rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-[16/9] bg-slate-100">
                    <img
                      src={getBlogCoverImage(post as BlogPost)}
                      alt={post.title || 'Article Cover'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-3 border-y border-slate-100 py-3.5 mb-8">
                  {post.authorAvatar ? (
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName || 'Author'}
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b192c] text-sm font-bold text-black shadow-xs">
                      {(post.authorName || 'C')[0]}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-[#0b192c]">
                      {post.authorName || 'CatalystLab Telemetry Team'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • Verified Technical Publication
                    </div>
                  </div>
                </div>

                {/* Excerpt Lead in Preview */}
                {post.excerpt && (
                  <div className="mb-8 rounded-xl border-l-4 border-[#0b192c] bg-slate-50 p-4 text-base font-medium text-slate-700 leading-relaxed">
                    {post.excerpt}
                  </div>
                )}

                {/* Rendered Markdown Body */}
                <div className="prose prose-slate max-w-none text-base leading-relaxed text-[#0b192c]">
                  <MarkdownRenderer content={post.content || ''} />
                </div>

                {/* Rendered Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 border-t border-slate-100 pt-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-600 mr-1">Tags:</span>
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* 3. SETTINGS & METADATA SIDEBAR (col-span-4) */}
        {viewMode !== 'preview' && (
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Card: Publishing Controls */}
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1f38] p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <Send className="h-3.5 w-3.5" />
                <span>Publication Status</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPost((prev) => ({ ...prev, status: 'published' }));
                    setHasUnsavedChanges(true);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold border transition-all ${
                    post.status === 'published'
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-sm'
                      : 'border-gray-200 bg-slate-800/60 text-slate-400 hover:text-gray-800'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Published</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPost((prev) => ({ ...prev, status: 'draft' }));
                    setHasUnsavedChanges(true);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold border transition-all ${
                    post.status === 'draft'
                      ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-sm'
                      : 'border-gray-200 bg-slate-800/60 text-slate-400 hover:text-gray-800'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Draft</span>
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-black-hover border border-brand-periwinkle/30 py-3 text-sm font-bold text-black disabled:opacity-50 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-accent-amber-strong" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-accent-amber-strong" />
                    <span>{isCreateMode ? 'Publish Article Now' : 'Save Article Changes'}</span>
                  </>
                )}
              </button>

              {!isCreateMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 py-2 text-xs font-bold text-rose-300 hover:bg-rose-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Article Permanently</span>
                </button>
              )}
            </div>

            {/* Card: Hero & Cover Image Live Preview */}
            <HeroImageLivePreview
              imageUrl={post.coverImage || ''}
              title={post.title || 'Untitled Technical Article'}
              category={post.category || 'Architecture'}
              authorName={post.authorName || 'CatalystLab Telemetry Team'}
              readTime={stats.readTime}
              excerpt={post.excerpt || ''}
              onUrlChange={(newUrl) => {
                setPost((prev) => ({ ...prev, coverImage: newUrl }));
                setHasUnsavedChanges(true);
              }}
              presetImages={SAMPLE_UNSPLASH_IMAGES}
            />

            {/* Card: Taxonomy & Category */}
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1f38] p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <Folder className="h-3.5 w-3.5" />
                <span>Category & Taxonomy</span>
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Primary Category</label>
                <select
                  value={post.category || CATEGORIES[0]}
                  onChange={(e) => {
                    setPost((prev) => ({ ...prev, category: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-black focus:border-black focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Keywords & Tags</label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag (press Enter)..."
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-black placeholder:text-slate-500 focus:border-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="rounded-xl border border-gray-200 bg-slate-800 px-3 py-1.5 text-xs font-bold text-gray-800 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(post.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 text-xs font-medium text-amber-600"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card: Excerpt & SERP Snippet */}
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1f38] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  <span>Search Snippet & Excerpt</span>
                </h3>
                <span className={`text-[11px] font-mono ${
                  (post.excerpt?.length || 0) > 160 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {post.excerpt?.length || 0}/160 chars
                </span>
              </div>

              <textarea
                value={post.excerpt || ''}
                onChange={(e) => {
                  setPost((prev) => ({ ...prev, excerpt: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                rows={3}
                placeholder="Concise summary indexed by Google and AI LLM search engines..."
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-black placeholder:text-slate-500 focus:border-black focus:outline-none"
              />

              {/* SERP Search Preview Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono truncate">
                  <span>https://www.catalystlab.tech › blogs › {post.slug || 'article'}</span>
                </div>
                <div className="text-sky-400 font-medium hover:underline cursor-pointer truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  {post.title || 'Untitled Engineering Article'} - CatalystLab
                </div>
                <div className="text-slate-400 text-[11px] line-clamp-2">
                  {post.excerpt || 'Read the comprehensive engineering benchmarks and edge telemetry diagnostics on CatalystLab.'}
                </div>
              </div>
            </div>

            {/* Card: Author Byline */}
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1f38] p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                <span>Author Attribution</span>
              </h3>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Author Name</label>
                <input
                  type="text"
                  value={post.authorName || ''}
                  onChange={(e) => {
                    setPost((prev) => ({ ...prev, authorName: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-black focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Author Email</label>
                <input
                  type="email"
                  value={post.authorEmail || ''}
                  onChange={(e) => {
                    setPost((prev) => ({ ...prev, authorEmail: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-black focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
