import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Sliders, 
  Clock, 
  User, 
  Tag, 
  Layout, 
  Smartphone, 
  Monitor, 
  Share2,
  X
} from 'lucide-react';
import { getBlogCoverImage } from '../../utils/blogImageMap';

interface HeroImageLivePreviewProps {
  imageUrl: string;
  title: string;
  category?: string;
  authorName?: string;
  readTime?: string;
  excerpt?: string;
  onUrlChange: (newUrl: string) => void;
  presetImages?: Array<{ url: string; title: string }>;
}

export const HeroImageLivePreview: React.FC<HeroImageLivePreviewProps> = ({
  imageUrl,
  title,
  category = 'Architecture',
  authorName = 'CatalystLab Telemetry Team',
  readTime = '5 min read',
  excerpt = 'Read the comprehensive telemetry benchmarks and diagnostics report.',
  onUrlChange,
  presetImages = []
}) => {
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [dimensions, setDimensions] = useState<{ width: number; height: number; aspectRatio: string } | null>(null);
  const [previewContext, setPreviewContext] = useState<'hero' | 'card' | 'social'>('hero');
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '21/9' | '4/3' | '3/2'>('16/9');
  const [overlayDarkness, setOverlayDarkness] = useState<'none' | 'subtle' | 'strong'>('subtle');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const effectiveUrl = imageUrl?.trim() || getBlogCoverImage({ title, category, coverImage: imageUrl } as any);

  // Validate image URL on load
  useEffect(() => {
    if (!effectiveUrl) {
      setLoadStatus('idle');
      setDimensions(null);
      return;
    }

    setLoadStatus('loading');
    const img = new Image();
    img.src = effectiveUrl;

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratio = (w / (h || 1)).toFixed(2);
      let ratioLabel = `${ratio}:1`;
      if (Math.abs(w / h - 16 / 9) < 0.05) ratioLabel = '16:9';
      else if (Math.abs(w / h - 21 / 9) < 0.05) ratioLabel = '21:9';
      else if (Math.abs(w / h - 4 / 3) < 0.05) ratioLabel = '4:3';
      else if (Math.abs(w / h - 3 / 2) < 0.05) ratioLabel = '3:2';
      else if (Math.abs(w / h - 1) < 0.05) ratioLabel = '1:1';

      setDimensions({ width: w, height: h, aspectRatio: ratioLabel });
      setLoadStatus('loaded');
    };

    img.onerror = () => {
      setLoadStatus('error');
      setDimensions(null);
    };
  }, [effectiveUrl]);

  const handleCopyUrl = () => {
    if (!effectiveUrl) return;
    navigator.clipboard.writeText(effectiveUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRandomize = () => {
    if (presetImages.length > 0) {
      const random = presetImages[Math.floor(Math.random() * presetImages.length)];
      onUrlChange(random.url);
    } else {
      onUrlChange(`https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`);
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-[#0d1f38] p-4 sm:p-5 shadow-xl space-y-4 text-black">
      
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-black/20 text-amber-600 border border-cyan-400/30">
            <ImageIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-black text-black uppercase tracking-wider">
              Hero Banner Live Preview
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time rendering &amp; aspect ratio tester from provided URL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Status Badge */}
          {loadStatus === 'loading' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
              <RefreshCw className="h-2.5 w-2.5 animate-spin" />
              <span>Verifying URL...</span>
            </span>
          )}
          {loadStatus === 'loaded' && dimensions && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
              <span>{dimensions.width}×{dimensions.height} ({dimensions.aspectRatio})</span>
            </span>
          )}
          {loadStatus === 'error' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="h-2.5 w-2.5 text-rose-400" />
              <span>Image Load Error</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 rounded-lg border border-gray-200 bg-slate-800 text-gray-700 hover:text-black hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Expand Fullscreen Banner Preview"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Direct URL Input with Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <label className="font-semibold text-gray-700">Image Source URL</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomize}
              className="text-amber-600 hover:text-cyan-200 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              🎲 Random Preset
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => onUrlChange('')}
                className="text-rose-400 hover:text-rose-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="relative flex items-center">
          <input
            type="url"
            value={imageUrl || ''}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.pexels.com/...)"
            className="w-full rounded-xl border border-gray-200 bg-white pl-3.5 pr-20 py-2.5 text-xs text-black placeholder:text-slate-500 focus:border-black focus:outline-none font-mono"
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Copy Image URL"
            >
              {copiedUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
            {effectiveUrl && (
              <a
                href={effectiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Open raw image"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Context & Viewport Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-200/80">
        
        {/* Context switch (Hero vs Card vs Social) */}
        <div className="inline-flex rounded-xl bg-white p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => setPreviewContext('hero')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              previewContext === 'hero'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-400 hover:text-black'
            }`}
          >
            <Monitor className="h-3 w-3" />
            <span>Article Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewContext('card')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              previewContext === 'card'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-400 hover:text-black'
            }`}
          >
            <Layout className="h-3 w-3" />
            <span>Catalog Card</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewContext('social')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              previewContext === 'social'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-400 hover:text-black'
            }`}
          >
            <Share2 className="h-3 w-3" />
            <span>Social Share</span>
          </button>
        </div>

        {/* Aspect Ratio & Darkness */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as any)}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-700 font-mono text-[11px] focus:border-black focus:outline-none"
          >
            <option value="16/9">16:9 Standard</option>
            <option value="21/9">21:9 Cinema</option>
            <option value="4/3">4:3 Box</option>
            <option value="3/2">3:2 Classic</option>
          </select>

          <select
            value={overlayDarkness}
            onChange={(e) => setOverlayDarkness(e.target.value as any)}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-700 font-mono text-[11px] focus:border-black focus:outline-none"
          >
            <option value="none">No Overlay</option>
            <option value="subtle">Subtle Darken</option>
            <option value="strong">Deep Darken</option>
          </select>
        </div>
      </div>

      {/* 4. LIVE PREVIEW STAGE */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-inner group">
        
        {/* Dynamic Aspect Ratio Container */}
        <div 
          className={`relative w-full overflow-hidden ${
            aspectRatio === '21/9' ? 'aspect-[21/9]' :
            aspectRatio === '4/3' ? 'aspect-[4/3]' :
            aspectRatio === '3/2' ? 'aspect-[3/2]' : 'aspect-[16/9]'
          }`}
        >
          {/* Main Image */}
          {loadStatus === 'error' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-rose-950/20 text-rose-300 border border-dashed border-rose-500/40">
              <AlertTriangle className="h-8 w-8 text-rose-400 mb-2" />
              <div className="text-xs font-bold text-black">Failed to load hero image</div>
              <p className="text-[10px] text-rose-400 mt-1 max-w-xs truncate">
                {effectiveUrl}
              </p>
              <button
                type="button"
                onClick={handleRandomize}
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-rose-500/30 border border-rose-400/40 px-3 py-1 text-[11px] font-bold text-black hover:bg-rose-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Sparkles className="h-3 w-3" />
                <span>Try Curated Preset</span>
              </button>
            </div>
          ) : (
            <>
              <img
                src={effectiveUrl}
                alt={title || 'Article Hero Banner'}
                className={`w-full h-full transition-all duration-500 ${
                  fitMode === 'contain' ? 'object-contain bg-black' : 'object-cover'
                }`}
                
              />

              {/* Optional Contrast Dark Overlay */}
              {overlayDarkness === 'subtle' && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
              )}
              {overlayDarkness === 'strong' && (
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />
              )}

              {/* Context Overlays */}
              {/* A. Hero Banner Context (Title + Author + Calculated Reading Time) */}
              {previewContext === 'hero' && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 pointer-events-none">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-cyan-950/90 text-amber-600 border border-cyan-400/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      {category}
                    </span>
                    <span className="rounded-md bg-black/70 text-gray-800 px-2 py-0.5 text-[10px] font-mono font-semibold backdrop-blur-md flex items-center gap-1 border border-white/10">
                      <Clock className="h-2.5 w-2.5 text-amber-600" />
                      <span>{readTime}</span>
                    </span>
                  </div>

                  {/* Bottom Title & Author Banner */}
                  <div className="space-y-1.5">
                    <h4 className="text-sm sm:text-base font-extrabold text-black leading-tight drop-shadow-md line-clamp-2">
                      {title || 'Untitled Technical Article'}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-700 font-mono drop-shadow">
                      <span className="flex items-center gap-1">
                        <User className="h-2.5 w-2.5 text-amber-600" />
                        <span>{authorName}</span>
                      </span>
                      <span>•</span>
                      <span>Verified Telemetry Publication</span>
                    </div>
                  </div>
                </div>
              )}

              {/* B. Catalog Card Context */}
              {previewContext === 'card' && (
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-white/90 border border-gray-200 backdrop-blur-md pointer-events-none">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span className="text-amber-600 font-bold">{category}</span>
                    <span>{readTime}</span>
                  </div>
                  <div className="text-xs font-bold text-black truncate">
                    {title || 'Article Title Preview'}
                  </div>
                </div>
              )}

              {/* C. Social Snippet Context */}
              {previewContext === 'social' && (
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/80 border border-white/20 text-center text-[10px] text-gray-700 font-mono backdrop-blur-md pointer-events-none">
                  <span className="text-black font-bold truncate block">
                    {title || 'Article Title'} | CatalystLab
                  </span>
                  <span className="text-slate-400 text-[10px] block">catalystlab.tech</span>
                </div>
              )}

              {/* Hover Quick Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <button
                  type="button"
                  onClick={() => setFitMode(fitMode === 'cover' ? 'contain' : 'cover')}
                  className="px-2 py-1 rounded-md bg-black/80 border border-gray-200 text-[10px] font-mono text-gray-800 hover:text-black backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  title="Toggle Fit Mode"
                >
                  {fitMode === 'cover' ? 'Fit: Cover' : 'Fit: Contain'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 rounded-md bg-black/80 border border-gray-200 text-gray-800 hover:text-black backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  title="Fullscreen"
                >
                  <Maximize2 className="h-3 w-3" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5. Quick-Select Presets Gallery */}
      {presetImages && presetImages.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-gray-200">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Curated Architectural Cover Presets</span>
            <span className="text-[10px] text-amber-600 font-mono">1-Click Apply</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presetImages.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onUrlChange(preset.url)}
                className={`relative rounded-xl overflow-hidden border aspect-[16/9] transition-all group/preset ${
                  imageUrl === preset.url
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-102'
                    : 'border-gray-200 hover:border-cyan-400/60 hover:scale-102'
                }`}
                title={preset.title}
              >
                <img src={preset.url} alt={preset.title} className="w-full h-full object-cover"  />
                {imageUrl === preset.url && (
                  <div className="absolute inset-0 bg-cyan-950/60 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-amber-600 stroke-[3]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preset:opacity-100 transition-opacity flex items-center justify-center p-1 text-[10px] font-bold text-black text-center line-clamp-2">
                  {preset.title.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Fullscreen Modal Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-5xl w-full mx-auto flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-black/20 text-amber-600 border border-cyan-400/30">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-black">
                    Fullscreen Hero Banner Simulator
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-fidelity rendering of the primary cover banner and overlay typography
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl border border-gray-200 bg-slate-800 text-gray-700 hover:text-black hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* High-Res Banner in Modal */}
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 aspect-[16/9] shadow-2xl bg-black">
              <img
                src={effectiveUrl}
                alt={title}
                className="w-full h-full object-cover"
                
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 sm:p-10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-black text-white px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider">
                    {category}
                  </span>
                  <span className="rounded-lg bg-black/70 border border-white/20 px-3 py-1 text-xs font-mono text-black flex items-center gap-1.5 backdrop-blur-md">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>{readTime}</span>
                  </span>
                </div>

                <div className="space-y-3 max-w-2xl">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-black leading-tight drop-shadow-lg">
                    {title || 'Untitled Technical Article'}
                  </h1>
                  {excerpt && (
                    <p className="text-sm text-gray-700 line-clamp-2 font-medium">
                      {excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
                    <span>Author: {authorName}</span>
                    <span>•</span>
                    <span>CatalystLab Telemetry &amp; Security Lab</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
