import re

with open('src/pages/UserDashboardPage.tsx', 'r') as f:
    content = f.read()

modal_code = """      {/* QUICK VIEW MODAL */}
      {quickViewReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setQuickViewReport(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-3 pr-4">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm shrink-0 text-slate-700">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Diagnostic Quick View
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-sm">
                    {quickViewReport.url}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setQuickViewReport(null)}
                className="p-2 -mr-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-5 overflow-y-auto font-mono text-sm">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Engine</span>
                  <span className="text-slate-900 font-bold text-xs">
                    {quickViewReport.engine === 'all' || quickViewReport.engine === 'master' ? 'Master Audit' : (ENGINES_MAP[quickViewReport.engine]?.name || quickViewReport.engine)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Score</span>
                  <span className={`font-bold text-xs ${
                    (quickViewReport.score || 90) >= 90 ? 'text-emerald-600' : 
                    (quickViewReport.score || 90) >= 75 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {quickViewReport.score || 92}/100
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Date</span>
                  <span className="text-slate-900 font-bold text-xs">
                    {quickViewReport.createdAt ? new Date(quickViewReport.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Summary</h4>
                  <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-sans">
                    {quickViewReport.summary || quickViewReport.title || 'No executive summary provided for this audit.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Raw Output Log</h4>
                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                    {quickViewReport.output || 'No detailed output available.'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 flex justify-end">
              <button
                onClick={() => setQuickViewReport(null)}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
"""

content = content.replace("      </section>\n    </div>\n  );\n};\n\nexport default UserDashboardPage;", f"      </section>\n\n{modal_code}\n    </div>\n  );\n}};\n\nexport default UserDashboardPage;")

with open('src/pages/UserDashboardPage.tsx', 'w') as f:
    f.write(content)
