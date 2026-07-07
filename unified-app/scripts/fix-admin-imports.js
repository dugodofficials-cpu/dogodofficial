const fs = require('fs');
const path = require('path');

const adminAppDir = path.join(__dirname, '../src/app/admin');
const adminComponentsDir = path.join(__dirname, '../src/components');

const adminHookMappings = [
  { from: /@\/hooks\/products/g, to: '@/hooks/admin/products' },
  { from: /@\/hooks\/auth/g, to: '@/hooks/admin/auth' },
  { from: /@\/hooks\/users/g, to: '@/hooks/admin/users' },
  { from: /@\/hooks\/coupons/g, to: '@/hooks/admin/coupons' },
  { from: /@\/hooks\/blackbox/g, to: '@/hooks/admin/blackbox' },
  { from: /@\/hooks\/order/g, to: '@/hooks/admin/order' },
  { from: /@\/hooks\/countdown/g, to: '@/hooks/admin/countdown' },
  { from: /@\/hooks\/payment/g, to: '@/hooks/admin/payment' },
  { from: /@\/hooks\/locations/g, to: '@/hooks/admin/locations' },
  { from: /@\/hooks\/shipping-zones/g, to: '@/hooks/admin/shipping-zones' },
];

const adminComponentFolders = [
  'auth', 'blackbox', 'countdown', 'coupons', 'dashboard', 
  'orders', 'shop', 'users', 'shipping-zones', 'locations',
  'content', 'game', 'settings', 'EmotionRegistry.tsx', 
  'Logo.tsx', 'Sidebar.tsx', 'ClientOnly.tsx'
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  for (const mapping of adminHookMappings) {
    content = content.replace(mapping.from, mapping.to);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

console.log('Fixing admin app imports...');

// Fix admin app pages
const adminAppFiles = getAllFiles(adminAppDir);
let count = 0;
for (const file of adminAppFiles) {
  if (fixImports(file)) count++;
}

// Fix admin-specific components
for (const folder of adminComponentFolders) {
  const componentPath = path.join(adminComponentsDir, folder);
  if (fs.existsSync(componentPath)) {
    if (fs.statSync(componentPath).isDirectory()) {
      const files = getAllFiles(componentPath);
      for (const file of files) {
        if (fixImports(file)) count++;
      }
    } else {
      if (fixImports(componentPath)) count++;
    }
  }
}

console.log(`\nFixed ${count} admin files`);
