const fs = require('fs');
let code = fs.readFileSync('src/pages/ContactPage.tsx', 'utf8');

// Import motion
if (!code.includes("import { motion } from 'motion/react';")) {
  code = code.replace(/import { PageTransition, LazyReveal } from '\.\.\/components\/common\/LazyAnimate';/, "import { PageTransition, LazyReveal } from '../components/common/LazyAnimate';\nimport { motion } from 'motion/react';");
}

// Replace the department selector with an animated one
const oldSelector = `<div className="grid grid-cols-2 gap-2">
                      {departments.map((dep) => (
                        <button
                          key={dep.id}
                          type="button"
                          onClick={() => setDepartment(dep.id)}
                          className={\`px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left \${
                            department === dep.id 
                              ? 'bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/30' 
                              : 'bg-[#060606] text-[#999999] border border-white/10 hover:border-white/20 hover:text-white'
                          }\`}
                        >
                          {dep.label}
                        </button>
                      ))}
                    </div>`;

const newSelector = `<div className="grid grid-cols-2 gap-2 relative">
                      {departments.map((dep) => (
                        <button
                          key={dep.id}
                          type="button"
                          onClick={() => setDepartment(dep.id)}
                          className={\`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left overflow-hidden border \${
                            department === dep.id 
                              ? 'text-[#0066FF] border-[#0066FF]/30' 
                              : 'bg-[#060606] text-[#999999] border-white/10 hover:border-white/20 hover:text-white'
                          }\`}
                        >
                          {department === dep.id && (
                            <motion.div
                              layoutId="contact-active-topic"
                              className="absolute inset-0 bg-[#0066FF]/10 z-0"
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10">{dep.label}</span>
                        </button>
                      ))}
                    </div>`;

code = code.replace(oldSelector, newSelector);

// Change the button shadow to shadow-lg as requested by the prompt
const oldButton = `shadow-[0_0_20px_-3px_rgba(255,255,255,0.2)] disabled:opacity-50`;
const newButton = `shadow-lg shadow-white/5 disabled:opacity-50`;
code = code.replace(oldButton, newButton);

fs.writeFileSync('src/pages/ContactPage.tsx', code);
