import re

with open('src/components/home/HowItWorks.tsx', 'r') as f:
    content = f.read()

new_card = """
              <div
                key={step.number}
                className="w-[280px] sm:w-[310px] h-[360px] shrink-0 snap-start relative"
              >
                <HeroImageCard
                  imageUrl={step.bgImageUrl}
                  imageAlt={step.title}
                  title={<div className="text-xl font-bold leading-tight">{step.title}</div>}
                  badge={
                    <span className="text-[10px] font-mono text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 uppercase tracking-wider font-bold">
                      {step.subtitle}
                    </span>
                  }
                  topRight={
                    <span className="text-[10px] font-mono text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 font-bold shadow-sm">
                      {step.time}
                    </span>
                  }
                  description={step.description}
                  action={
                    <div className="p-2.5 rounded-xl bg-white border border-white/20 text-black shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  }
                  footer={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 uppercase tracking-wider text-[10px] font-mono font-bold">
                        Auto-Executed
                      </span>
                      <Link
                        to="/playground"
                        className="text-white hover:text-white/80 font-mono font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Run Scan</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  }
                  aspectRatio="h-full w-full"
                  gradientFrom="from-slate-950"
                />
              </div>
"""

pattern = r"\{steps\.map\(\(step\) => \{[\s\S]*?return \([\s\S]*?\}\)\}"

if re.search(pattern, content):
    replacement = "{steps.map((step) => { const Icon = step.icon; return (" + new_card + "); })}"
    new_content = re.sub(pattern, replacement, content)
    
    # We also need to add bgImageUrl to steps data
    new_content = new_content.replace(
        "time: '~140ms'",
        "time: '~140ms',\n      bgImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600'"
    )
    new_content = new_content.replace(
        "time: '~420ms'",
        "time: '~420ms',\n      bgImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'"
    )
    new_content = new_content.replace(
        "time: '~310ms'",
        "time: '~310ms',\n      bgImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600'"
    )
    new_content = new_content.replace(
        "time: '~190ms'",
        "time: '~190ms',\n      bgImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600'"
    )
    
    # Also update PipelineStep interface
    new_content = new_content.replace(
        "time: string;\n}",
        "time: string;\n  bgImageUrl?: string;\n}"
    )
    
    new_content = "import { HeroImageCard } from '../common/HeroImageCard';\n" + new_content

    with open('src/components/home/HowItWorks.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced HowItWorks successfully")
else:
    print("HowItWorks regex failed")

