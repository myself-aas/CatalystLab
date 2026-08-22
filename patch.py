import re

with open('src/pages/MasterAuditPage.tsx', 'r') as f:
    content = f.read()

# 1. Hide the Action Toolbar if not hasAnyOutput
toolbar_target = """        {/* Action Toolbar above Grid */}
        <LazyReveal direction="fade" delay={0.05}>"""
toolbar_replacement = """        {/* Action Toolbar above Grid */}
        {hasAnyOutput && (
        <LazyReveal direction="fade" delay={0.05}>"""
content = content.replace(toolbar_target, toolbar_replacement)

toolbar_end_target = """          </div>
        </LazyReveal>

        {/* Dynamic Engine Selector & Terminal */}"""
toolbar_end_replacement = """          </div>
        </LazyReveal>
        )}

        {/* Dynamic Engine Selector & Terminal */}"""
content = content.replace(toolbar_end_target, toolbar_end_replacement)

# 2. Add Dropdown to the input field
form_target = """                  {/* Search Icon & Input (Larger Hit Area) */}
                  <div className="relative flex-1 w-full flex items-center pl-5 pr-3 group/input cursor-text rounded-[20px] transition-all duration-500 hover:bg-[#27272a]/30 overflow-hidden" onClick={() => document.getElementById('audit-url-input')?.focus()}>"""

# We'll add the dropdown just before the Launch Button
dropdown_ui = """                  {/* Engine Dropdown Selector */}
                  <div className="relative shrink-0">
                    <button 
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 bg-[#27272a]/50 hover:bg-[#27272a] px-4 py-3 rounded-[16px] transition-all border border-[#3f3f46]/50 focus:outline-none text-white text-sm"
                    >
                      <span className="material-symbols-outlined text-[#00d95a] text-lg">{ENGINES_MAP[activeEngineTab].icon}</span>
                      <span className="font-bold hidden sm:block">{ENGINES_MAP[activeEngineTab].shortCode}</span>
                      <span className={`material-symbols-outlined text-[#a1a1aa] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-3 w-64 bg-[#18181b] border border-[#27272a] rounded-[20px] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                          <div className="max-h-[300px] overflow-y-auto p-1.5 custom-scrollbar">
                            {engineKeys.map(key => {
                              const meta = ENGINES_MAP[key];
                              const isActive = key === activeEngineTab;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    setActiveEngineTab(key);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all text-left ${isActive ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-white'}`}
                                >
                                  <span className={`material-symbols-outlined text-lg ${isActive ? 'text-[#00d95a]' : ''}`}>
                                    {meta.icon}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold">{meta.name}</span>
                                    <span className="text-[9px] uppercase tracking-wider opacity-70">Phase {meta.sdlcPhaseNumber}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

"""

launch_target = """                  {/* Launch Button (Seamless Integration & Expressive Animation) */}"""
content = content.replace(launch_target, dropdown_ui + launch_target)

# 3. Remove the dropdown from the Terminal area since it's now in the input row
terminal_target_old = """            {/* Custom Dropdown Selector */}
            <div className="relative z-20 w-full md:w-80">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-white border border-[#415a77]/30 px-4 py-3 rounded-xl shadow-sm hover:border-[#415a77]/60 transition-all focus:outline-none focus:ring-2 focus:ring-[#415a77]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#415a77]/10 flex items-center justify-center text-[#415a77]">
                    <span className="material-symbols-outlined text-lg">{ENGINES_MAP[activeEngineTab].icon}</span>
                  </div>
                  <div className="text-left flex flex-col">
                    <span className="text-[10px] font-extrabold uppercase text-sky-600 tracking-wider leading-tight">
                      Phase {ENGINES_MAP[activeEngineTab].sdlcPhaseNumber}: {ENGINES_MAP[activeEngineTab].shortCode}
                    </span>
                    <span className="text-sm font-bold text-[#0b192c] leading-tight truncate">
                      {ENGINES_MAP[activeEngineTab].name}
                    </span>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-[#415a77] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#415a77]/20 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-80 overflow-y-auto py-2">
                      {engineKeys.map(key => {
                        const meta = ENGINES_MAP[key];
                        const isActive = key === activeEngineTab;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setActiveEngineTab(key);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#f8fafc] transition-colors border-b border-[#f1f5f9] last:border-b-0 ${isActive ? 'bg-[#f4f6fa]' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined text-lg ${isActive ? 'text-sky-600' : 'text-[#64748b]'}`}>
                                {meta.icon}
                              </span>
                              <div className="text-left flex flex-col">
                                <span className="text-[10px] font-bold uppercase text-[#64748b] tracking-wider leading-tight">
                                  Phase {meta.sdlcPhaseNumber} • {meta.shortCode}
                                </span>
                                <span className={`text-sm font-bold leading-tight ${isActive ? 'text-sky-800' : 'text-[#0b192c]'}`}>
                                  {meta.name}
                                </span>
                              </div>
                            </div>
                            {isActive && (
                              <span className="material-symbols-outlined text-sky-600 text-lg">check</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>"""

content = content.replace(terminal_target_old, "")

with open('src/pages/MasterAuditPage.tsx', 'w') as f:
    f.write(content)
print("done")
