const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const importMappings = [
  // Customer app specific mappings
  { from: /@\/app\/meta-pixel/g, to: '../meta-pixel', context: '(customer)' },
  { from: /from ['"]@\/components\/layout\//g, to: "from '@/components/layout/" },
  { from: /from ['"]@\/components\/protected\//g, to: "from '@/components/protected/" },
  { from: /from ['"]@\/components\/ui\//g, to: "from '@/components/ui/" },
  { from: /from ['"]@\/components\/auth\//g, to: "from '@/components/auth/" },
  { from: /from ['"]@\/components\/home\//g, to: "from '@/components/home/" },
  { from: /from ['"]@\/hooks\//g, to: "from '@/hooks/" },
  { from: /from ['"]@\/lib\//g, to: "from '@/lib/" },
  { from: /from ['"]@\/providers\//g, to: "from '@/providers/" },
  { from: /from ['"]@\/util\//g, to: "from '@/util/" },
  
  // Admin app specific mappings - update component paths
  { from: /from ['"]@\/components\/EmotionRegistry['"]/g, to: "from '@/components/EmotionRegistry'" },
  { from: /from ['"]@\/components\/Logo['"]/g, to: "from '@/components/Logo'" },
  { from: /from ['"]@\/components\/Sidebar['"]/g, to: "from '@/components/Sidebar'" },
  { from: /from ['"]@\/components\/ClientOnly['"]/g, to: "from '@/components/ClientOnly'" },
  { from: /from ['"]@\/components\/auth\//g, to: "from '@/components/auth/" },
  { from: /from ['"]@\/components\/blackbox\//g, to: "from '@/components/blackbox/" },
  { from: /from ['"]@\/components\/countdown\//g, to: "from '@/components/countdown/" },
  { from: /from ['"]@\/components\/coupons\//g, to: "from '@/components/coupons/" },
  { from: /from ['"]@\/components\/dashboard\//g, to: "from '@/components/dashboard/" },
  { from: /from ['"]@\/components\/orders\//g, to: "from '@/components/orders/" },
  { from: /from ['"]@\/components\/shop\//g, to: "from '@/components/shop/" },
  { from: /from ['"]@\/components\/users\//g, to: "from '@/components/users/" },
  { from: /from ['"]@\/components\/shipping-zones\//g, to: "from '@/components/shipping-zones/" },
  { from: /from ['"]@\/components\/locations\//g, to: "from '@/components/locations/" },
  { from: /from ['"]@\/components\/content\//g, to: "from '@/components/content/" },
  { from: /from ['"]@\/components\/game\//g, to: "from '@/components/game/" },
  { from: /from ['"]@\/components\/settings\//g, to: "from '@/components/settings/" },
  
  // Fix relative paths for fonts
  { from: /['"]\.\.\/\.\.\/public\/fonts\//g, to: "'/fonts/" },
  { from: /['"]\.\.\/\.\.\/\.\.\/public\/assets\//g, to: "'/assets/" },
  { from: /['"]\.\.\/\.\.\/\.\.\/public\/fonts\//g, to: "'/fonts/" },
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;
  
  for (const mapping of importMappings) {
    if (mapping.context) {
      if (filePath.includes(mapping.context)) {
        content = content.replace(mapping.from, mapping.to);
      }
    } else {
      content = content.replace(mapping.from, mapping.to);
    }
  }
  
  // Fix specific patterns
  // Fix font imports that use relative paths to public
  content = content.replace(
    /localFont\(\{[\s\S]*?src:\s*\[[\s\S]*?\{[\s\S]*?path:\s*['"]\.\.\/\.\.\/public\/fonts\/([^'"]+)['"]/g,
    (match, fontFile) => match.replace(`../../public/fonts/${fontFile}`, `/fonts/${fontFile}`)
  );
  
  // Fix image imports from public
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/\.\.\/public\/assets\/([^'"]+)['"]/g,
    "import $1 from '/assets/$2'"
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modified = true;
    console.log(`Fixed: ${filePath}`);
  }
  
  return modified;
}

console.log('Scanning for TypeScript files...');
const files = getAllFiles(srcDir);
console.log(`Found ${files.length} files`);

let fixedCount = 0;
for (const file of files) {
  if (fixImports(file)) {
    fixedCount++;
  }
}

console.log(`\nFixed ${fixedCount} files`);
