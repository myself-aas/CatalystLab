const fs = require('fs');
const files = ['src/components/auth/AdminRoute.tsx', 'src/components/auth/ProtectedRoute.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[#0b192c\]/g, 'bg-white');
  content = content.replace(/bg-\[#f8fafc\]/g, 'bg-white');
  content = content.replace(/text-\[#f8fafc\]/g, 'text-black');
  content = content.replace(/text-\[#0b192c\]/g, 'text-black');
  fs.writeFileSync(file, content);
}
