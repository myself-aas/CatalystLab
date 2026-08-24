import re

with open('src/components/home/Testimonials.tsx', 'r') as f:
    content = f.read()

new_card = """
              <div
                key={t.id}
                className="w-[300px] sm:w-[320px] lg:w-[350px] h-[400px] shrink-0 snap-start relative"
              >
                <HeroImageCard
                  imageUrl={t.bgImageUrl || t.avatarUrl}
                  imageAlt={t.name}
                  title={<div className="text-xl sm:text-2xl font-bold leading-tight">"{t.quote}"</div>}
                  badge={
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  }
                  topRight={
                    <span className="text-[10px] font-mono text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 font-bold shadow-sm">
                      {t.verifiedBadge}
                    </span>
                  }
                  metadata={
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono uppercase text-white/70">{t.metricLabel}</span>
                      <span className="text-base font-bold font-mono text-white">{t.metric}</span>
                    </div>
                  }
                  action={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                  footer={
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-white/20 shrink-0 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <div className="text-sm font-bold text-white truncate">{t.name}</div>
                        <div className="text-xs text-white/70 truncate font-mono">{t.role} • {t.company}</div>
                      </div>
                    </div>
                  }
                  aspectRatio="h-full w-full"
                  gradientFrom="from-slate-950"
                />
              </div>
"""

pattern = r"\{filteredTestimonials\.map\(\(t\) => \([\s\S]*?\)\)\}"

if re.search(pattern, content):
    replacement = "{filteredTestimonials.map((t) => (" + new_card + "))}"
    new_content = re.sub(pattern, replacement, content)
    
    new_content = new_content.replace(
        "avatarText: 'DJ',",
        "avatarText: 'DJ',\n      bgImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',"
    )
    new_content = new_content.replace(
        "avatarText: 'AR',",
        "avatarText: 'AR',\n      bgImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',"
    )
    new_content = new_content.replace(
        "avatarText: 'ER',",
        "avatarText: 'ER',\n      bgImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',"
    )
    new_content = new_content.replace(
        "avatarText: 'MC',",
        "avatarText: 'MC',\n      bgImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600',"
    )
    new_content = new_content.replace(
        "avatarText: 'SL',",
        "avatarText: 'SL',\n      bgImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',"
    )
    
    new_content = "import { HeroImageCard } from '../common/HeroImageCard';\n" + new_content

    with open('src/components/home/Testimonials.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced Testimonials successfully")
else:
    print("Testimonials regex failed")

