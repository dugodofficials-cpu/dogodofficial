const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import path mappings to fix
const importFixes = [
  // Fix relative imports that should use @ alias
  { from: /from ['"]\.\.\/\.\.\/lib\//g, to: "from '@/lib/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\//g, to: "from '@/lib/" },
  { from: /from ['"]\.\.\/\.\.\/components\//g, to: "from '@/components/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/components\//g, to: "from '@/components/" },
  { from: /from ['"]\.\.\/\.\.\/hooks\//g, to: "from '@/hooks/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/hooks\//g, to: "from '@/hooks/" },
  { from: /from ['"]\.\.\/\.\.\/types\//g, to: "from '@/types/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/types\//g, to: "from '@/types/" },
  { from: /from ['"]\.\.\/\.\.\/contexts\//g, to: "from '@/contexts/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/contexts\//g, to: "from '@/contexts/" },
  { from: /from ['"]\.\.\/\.\.\/providers\//g, to: "from '@/providers/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/providers\//g, to: "from '@/providers/" },
  { from: /from ['"]\.\.\/\.\.\/utils\//g, to: "from '@/utils/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/utils\//g, to: "from '@/utils/" },
  { from: /from ['"]\.\.\/\.\.\/styles\//g, to: "from '@/styles/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/styles\//g, to: "from '@/styles/" },
  // Fix 4+ level deep imports
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\//g, to: "from '@/lib/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components\//g, to: "from '@/components/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks\//g, to: "from '@/hooks/" },
];

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const fix of importFixes) {
    if (fix.from.test(content)) {
      content = content.replace(fix.from, fix.to);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Find all TypeScript/JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', { cwd: process.cwd() });
let fixedCount = 0;

for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  if (fixImports(fullPath)) {
    fixedCount++;
  }
}

console.log(`\nTotal files fixed: ${fixedCount}`);
