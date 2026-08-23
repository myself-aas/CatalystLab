const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = [
  'src/components/api/ApiNavSidebar.tsx',
  'src/components/user/UserRateLimitAllocationCard.tsx',
  'src/components/user/UserBlogManagementView.tsx',
  'src/components/RateLimitBadge.tsx',
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Specifically looking for the ones where bg-white text-white coexist incorrectly from our previous replacements
    content = content.replace(/bg-white([^>]*)text-white/g, 'bg-brand-navy$1text-white');
    // or just let them be dark mode since the request was global white background. 
    // If the text is white and bg is white, we should just make the text black, or bg back to dark if it was a button
    // Let's replace 'bg-white px-4 py-2 text-xs font-bold text-white' to text-black
    
    fs.writeFileSync(file, content);
  }
}
