const fs = require('fs');
let code = fs.readFileSync('src/pages/ContactPage.tsx', 'utf8');

// Ensure the topic buttons meet the 44px touch target minimum by changing py-2.5 to py-3
code = code.replace(/relative px-4 py-2\.5 rounded-xl/g, 'relative px-4 py-3 rounded-xl');

fs.writeFileSync('src/pages/ContactPage.tsx', code);
