const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSection.tsx', 'utf8');

// The headline has duplicated classes: font-semibold tracking-[-0.04em] leading-[1.05] font-semibold tracking-[-0.04em] leading-[1.05]
code = code.replace(/font-semibold tracking-\[-0\.04em\] leading-\[1\.05\] font-semibold tracking-\[-0\.04em\] leading-\[1\.05\]/g, 'font-semibold tracking-[-0.04em] leading-[1.05]');

fs.writeFileSync('src/components/home/HeroSection.tsx', code);
