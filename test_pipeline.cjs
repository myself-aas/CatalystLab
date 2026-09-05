const fs = require('fs');
let code = fs.readFileSync('src/components/home/HowItWorks.tsx', 'utf8');
console.log(code);
