const fs = require('fs');
let code = fs.readFileSync('src/pages/MasterAuditPage.tsx', 'utf8');

if (code.includes('<HowItWorks />')) {
  console.log("MasterAuditPage is importing HowItWorks successfully.");
}
