import re

with open('src/components/home/Testimonials.tsx', 'r') as f:
    content = f.read()

pattern = r"\{filteredTestimonials\.map\(\(t\) => \([\s\S]*\}\)\}\;"

replacement = """{filteredTestimonials.map((t) => (
              <div
                key={t.id}
                className="w-[300px] sm:w-[320px] lg:w-[350px] h-[480px] shrink-0 snap-start relative"
              >
                <HeroImageCard
                  imageUrl={t.bgImageUrl || t.avatarUrl}
                  imageAlt={t.name}
                  overlayStyle="solid"
                  bottomGradientClasses="from-teal-800 via-teal-800/90"
                  title={<h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 leading-tight">"{t.quote}"</h3>}
                  footer={
                    <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-2">
                       <div className="flex items-center gap-3">
                          <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 text-center leading-none border border-white/10 shrink-0">
                             <div className="text-[10px] uppercase font-bold text-white/80 mb-1 tracking-wider">Rating</div>
                             <div className="flex gap-0.5">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                               ))}
                             </div>
                          </div>
                          <div className="text-sm text-white leading-tight overflow-hidden">
                             <div className="font-bold truncate">{t.name}</div>
                             <div className="text-xs text-white/70 truncate">{t.role} • {t.company}</div>
                          </div>
                       </div>
                       <div className="text-right text-white shrink-0 pl-3">
                          <div className="font-bold text-sm tracking-tight">{t.metric}</div>
                          <div className="text-[10px] uppercase tracking-wider text-white/70">{t.metricLabel}</div>
                       </div>
                    </div>
                  }
                  aspectRatio="h-full w-full"
                />
              </div>
            ))}"""

new_content = re.sub(pattern, replacement, content)

with open('src/components/home/Testimonials.tsx', 'w') as f:
    f.write(new_content)
