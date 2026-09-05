const fs = require('fs');
let code = fs.readFileSync('src/pages/DiagnosticHubPage.tsx', 'utf8');

// 1. Import widgets
const widgetImports = `
import { 
  PerfWidget, 
  LatencyWidget, 
  EcoWidget, 
  SecurityWidget, 
  RepoWidget, 
  AiWidget, 
  MigrationWidget, 
  LlmoWidget 
} from '../components/hub/SimulationWidgets';
`;

code = code.replace(/import { ENGINES_MAP } from '\.\.\/data\/engines';/, "import { ENGINES_MAP } from '../data/engines';\n" + widgetImports);

// 2. Replace the Mock Widget Container content
const mockWidgetRegex = /\{\/\* Mock Widget Container \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/motion.div>/;

const replacement = `{/* Mock Widget Container */}
                  <div className="w-full h-full min-h-[220px] border border-white/5 rounded-2xl bg-[#0A0A0A] flex flex-col items-center justify-center p-0 relative overflow-hidden group/widget">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                    
                    {engine.widget === 'perf' && <PerfWidget />}
                    {engine.widget === 'latency' && <LatencyWidget />}
                    {engine.widget === 'eco' && <EcoWidget />}
                    {engine.widget === 'sec' && <SecurityWidget />}
                    {engine.widget === 'repo' && <RepoWidget />}
                    {engine.widget === 'ai' && <AiWidget />}
                    {engine.widget === 'migration' && <MigrationWidget />}
                    {engine.widget === 'llmo' && <LlmoWidget />}
                    
                    <Link
                      to={ENGINES_MAP[engine.id]?.route || '/hub'}
                      className="absolute inset-0 z-20 focus:outline-none"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs font-medium text-white opacity-0 group-hover/widget:opacity-100 transition-opacity z-30">
                      Inspect <ArrowRight className="size-3" />
                    </div>
                  </div>
                </div>
              </motion.div>`;

code = code.replace(mockWidgetRegex, replacement);

fs.writeFileSync('src/pages/DiagnosticHubPage.tsx', code);
