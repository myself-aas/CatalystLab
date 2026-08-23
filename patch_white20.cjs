const fs = require('fs');
const files = [
  'src/pages/PlaygroundPage.tsx',
  'src/pages/UserDashboardPage.tsx',
  'src/components/playground/PlaygroundNavSidebar.tsx',
];
for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/bg-white\/20 text-white/g, 'bg-gray-100 text-black');
    fs.writeFileSync(file, content);
  }
}
