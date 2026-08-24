import re

with open('src/components/home/FeaturedAuditMetrics.tsx', 'r') as f:
    content = f.read()

# Add bgImageUrl to the AuditMetricItem interface
if 'bgImageUrl?: string;' not in content:
    content = content.replace(
        "route: string;\n  vectors:",
        "route: string;\n  bgImageUrl?: string;\n  vectors:"
    )

# Replace the inner map logic
new_card = """
                <div
                  key={metric.id}
                  className="w-[280px] sm:w-[310px] h-[400px] flex-shrink-0 relative"
                >
                  <HeroImageCard
                    imageUrl={metric.bgImageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600'}
                    imageAlt={metric.title}
                    title={<div className="text-xl font-bold leading-tight">{metric.title}</div>}
                    badge={
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 uppercase tracking-wider font-bold shadow-sm">
                          {metric.phase}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 backdrop-blur-md border border-white/20 shadow-sm ${metric.scoreColor.replace('text-slate-800 bg-slate-100 border-slate-200', 'text-white')}`}>
                          {metric.score}
                        </span>
                      </div>
                    }
                    topRight={
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm shrink-0">
                        <IconComponent className="h-4 w-4" />
                      </div>
                    }
                    description={
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-black font-mono text-white tracking-tight metric-tabular">
                            {metric.highlightValue}
                          </div>
                          <div className="text-[11px] font-mono text-white/70 mt-0.5">
                            {metric.highlightLabel}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-sm">
                          {metric.badge}
                        </span>
                      </div>
                    }
                    action={
                      <div className="flex items-center justify-between w-full">
                        <button
                          type="button"
                          onClick={() => setInspectedMetric(metric)}
                          className="text-xs font-mono text-white hover:text-white/80 cursor-pointer font-bold transition-colors"
                        >
                          Inspect Vector
                        </button>
                        <Link
                          to={metric.route}
                          className="inline-flex items-center gap-1.5 bg-white text-black hover:bg-gray-100 py-1.5 px-3 rounded-lg font-mono text-xs font-bold transition-all shadow-sm"
                        >
                          <span>Run Audit</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    }
                    footer={
                      <div className="text-[11px] font-mono text-white/60">
                        {metric.engineName}
                      </div>
                    }
                    aspectRatio="h-full w-full"
                    gradientFrom="from-slate-950"
                  />
                </div>
"""

pattern = r"\{filteredMetrics\.map\(\(metric\) => \{[\s\S]*?return \([\s\S]*?\}\)\}"
if re.search(pattern, content):
    replacement = "{filteredMetrics.map((metric) => { const IconComponent = metric.icon; return (" + new_card + "); })}"
    content = re.sub(pattern, replacement, content)

    # Let's add images dynamically since we have 8 elements, just generic tech ones
    bg_images = [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1531297172868-edf65d642b84?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600"
    ]
    
    # We will just rely on the fallback OR I can inject it
    for i in range(1, 9):
        search_str = f"phaseNumber: {i},"
        replace_str = f"phaseNumber: {i},\n    bgImageUrl: '{bg_images[i-1]}',"
        content = content.replace(search_str, replace_str)
        
    if "import { HeroImageCard } from '../common/HeroImageCard';" not in content:
        content = "import { HeroImageCard } from '../common/HeroImageCard';\n" + content

    with open('src/components/home/FeaturedAuditMetrics.tsx', 'w') as f:
        f.write(content)
    print("Replaced FeaturedAuditMetrics successfully")
else:
    print("Regex failed for FeaturedAuditMetrics")

