const fs = require('fs');
let code = fs.readFileSync('src/components/home/WorkflowSection.tsx', 'utf8');

// Replace vertical timeline with horizontal pipeline
// "Desktop: grid grid-cols-4 gap-4 relative connected by an animated glowing gradient line."
// "Mobile: flex flex-col gap-4 relative pl-6 border-l border-white/10."
const oldGridStart = `<div className="space-y-16 lg:space-y-24">`;
const newGridStart = `<div className="flex flex-col gap-4 relative pl-6 border-l border-white/10 lg:pl-0 lg:border-l-0 lg:grid lg:grid-cols-4 lg:gap-4">
            <div className="hidden lg:block absolute top-[50%] left-0 right-0 h-0.5 bg-accent -z-10" />
            <motion.div style={{ width: lineHeight }} className="hidden lg:block absolute top-[50%] left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shadow-[0_0_12px_rgba(99,102,241,0.5)] -z-10" />
`;

// It's a bit complicated to regex replace the entire mapping, so let's just create a completely new rendering structure for the map.

fs.writeFileSync('src/components/home/WorkflowSection.tsx', code);
