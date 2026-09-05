const fs = require('fs');
let code = fs.readFileSync('src/components/home/SevenDayTrialSection.tsx', 'utf8');
code = code.replace(/text-4xl sm:text-5xl lg:text-6xl font-extrabold/g, 'text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] leading-[1.12]');
fs.writeFileSync('src/components/home/SevenDayTrialSection.tsx', code);

code = fs.readFileSync('src/components/home/FinalCTA.tsx', 'utf8');
code = code.replace(/text-4xl sm:text-5xl lg:text-6xl/g, 'text-4xl sm:text-6xl lg:text-7xl');
fs.writeFileSync('src/components/home/FinalCTA.tsx', code);
