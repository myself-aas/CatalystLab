const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Ensure touch targets for mobile are at least 44px
// The menu button: p-1 -> p-2 to increase hit area to 40px (w-10 h-10). Actually, min-h-[44px] min-w-[44px] is better.
code = code.replace(/className="md:hidden text-white focus:outline-none p-1 -mr-1"/, 'className="md:hidden text-white focus:outline-none p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"');

// Desktop links: add py-2 to make them taller touch targets on tablets
code = code.replace(/className="text-sm text-\[#999999\] hover:text-white transition-colors duration-150 focus:outline-none"/g, 'className="text-sm text-[#999999] hover:text-white transition-colors duration-150 focus:outline-none py-2"');

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
