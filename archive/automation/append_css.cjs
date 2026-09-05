const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('.scrollbar-none')) {
  code += `\n\n/* Added by refactoring Phase 4 */\n@layer utilities {\n  .scrollbar-none {\n    -ms-overflow-style: none;\n    scrollbar-width: none;\n  }\n  .scrollbar-none::-webkit-scrollbar {\n    display: none;\n  }\n}\n`;
  fs.writeFileSync('src/index.css', code);
}
