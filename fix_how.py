import re

with open('src/components/home/HowItWorks.tsx', 'r') as f:
    content = f.read()

pattern = r"\{steps\.map\(\(step\) => \{ const Icon = step\.icon; return \([\s\S]*\}\)\}\;"

replacement = """{steps.map((step) => { const Icon = step.icon; return (
              <div
                key={step.number}
                className="w-[300px] sm:w-[350px] lg:w-[400px] h-[260px] shrink-0 snap-start relative"
              >
                <HeroImageCard
                  imageUrl={step.bgImageUrl || ''}
                  imageAlt={step.title}
                  overlayStyle="glass"
                  badge={
                    <div className="font-black text-white tracking-widest uppercase text-sm drop-shadow-md">
                      CATALYST<span className="text-orange-500">LAB</span>
                    </div>
                  }
                  topRight={
                    <span className="text-sm font-medium text-white/90 drop-shadow-md">
                      {step.time}
                    </span>
                  }
                  title={<h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 leading-tight">{step.title}</h3>}
                  description={<div className="text-sm text-white/80 max-w-sm line-clamp-2">{step.description}</div>}
                  action={
                    <Link
                      to="/playground"
                      className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium text-sm transition-colors border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-2 whitespace-nowrap"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                  aspectRatio="h-full w-full"
                />
              </div>); })}"""

new_content = re.sub(pattern, replacement, content)

with open('src/components/home/HowItWorks.tsx', 'w') as f:
    f.write(new_content)
