import re

with open('src/components/user/UserAnalyticsDashboard.tsx', 'r') as f:
    content = f.read()

new_card = """
              <motion.div
                variants={itemVariants}
                key={catalyst.id}
                className="h-[320px] relative shrink-0"
              >
                <HeroImageCard
                  imageUrl={bgImage}
                  imageAlt={catalyst.name}
                  title={
                    <h3 className="font-extrabold text-xl sm:text-2xl leading-tight flex items-center gap-2">
                       <span className="material-symbols-outlined text-[24px] text-white/80">{catalyst.icon}</span>
                       {catalyst.name}
                    </h3>
                  }
                  badge={
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-white/20 bg-black/40 backdrop-blur-md text-white tracking-wider shadow-sm">
                        {catalyst.sdlcPhase}
                      </span>
                      {catalyst.shortCode && (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm">
                          {catalyst.shortCode}
                        </span>
                      )}
                    </div>
                  }
                  description={
                    <div className="flex flex-col gap-3">
                      <p className="line-clamp-2">{catalyst.description}</p>
                      {catalyst.keyVectors && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {catalyst.keyVectors.slice(0, 2).map((v, idx) => (
                            <span key={idx} className="text-[10px] font-medium bg-black/40 backdrop-blur-md text-white/80 px-2 py-1 rounded-md border border-white/20 truncate max-w-[200px]">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  }
                  footer={
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/docs#${catalyst.docsAnchor || 'overview'}`}
                        className="text-[11px] font-bold text-white/70 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider"
                      >
                        <span>Read Specs</span>
                      </Link>
                      {catalyst.shortCode === 'SYNTH' && (
                        <button
                          onClick={() => setActiveSubTab('par-blueprint')}
                          className="text-[11px] font-bold text-white/70 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider"
                        >
                          <span>Blueprint</span>
                        </button>
                      )}
                    </div>
                  }
                  action={
                    <Link
                      to={`${catalyst.route}${selectedDomain !== 'all' ? `?url=${encodeURIComponent('https://' + selectedDomain)}` : ''}`}
                      className="bg-white text-black hover:bg-gray-100 transition-colors font-bold py-2 px-5 rounded-full text-xs shadow-lg inline-flex items-center gap-2 active:scale-95 shrink-0"
                    >
                      <span>Launch</span>
                      <Play className="h-3 w-3 fill-current" />
                    </Link>
                  }
                  aspectRatio="h-full w-full"
                  gradientFrom="from-slate-950"
                />
              </motion.div>
"""

pattern = r"\{SDLC_CATALYSTS_LIST\.map\(\(catalyst, index\) => \{[\s\S]*?return \([\s\S]*?\}\)\}"
if re.search(pattern, content):
    replacement = "{SDLC_CATALYSTS_LIST.map((catalyst, index) => { const bgImage = catalyst.image || catImages[index % 4]; return (" + new_card + "); })}"
    content = re.sub(pattern, replacement, content)

    if "import { HeroImageCard } from '../common/HeroImageCard';" not in content:
        content = "import { HeroImageCard } from '../common/HeroImageCard';\n" + content

    with open('src/components/user/UserAnalyticsDashboard.tsx', 'w') as f:
        f.write(content)
    print("Replaced UserAnalyticsDashboard successfully")
else:
    print("Regex failed for UserAnalyticsDashboard")

