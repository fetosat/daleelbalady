const fs = require('fs');
const path = require('path');

// Script to automatically migrate <img> elements to <Image /> components
// This handles the bulk of the migration work

const projectRoot = path.resolve(__dirname);
const srcDir = path.join(projectRoot, 'src');

// Ensure we're in the frontend directory
if (!fs.existsSync(srcDir)) {
  console.error('❌ Error: src directory not found.');
  console.error('   Make sure you run this script from the frontend directory');
  console.error('   Current directory:', __dirname);
  process.exit(1);
}

// Common patterns and their replacements
const patterns = [
  // Basic img to Image migration
  {
    pattern: /<img\s+([^>]*?)\s*\/?>(?:\s*<\/img>)?/g,
    replacement: (match, attributes) => {
      // Extract src and alt attributes
      const srcMatch = attributes.match(/src=["']([^"']*)["']/);
      const altMatch = attributes.match(/alt=["']([^"']*?)["']/);
      const classMatch = attributes.match(/className=["']([^"']*?)["']/);
      const styleMatch = attributes.match(/style=["']([^"']*?)["']/);
      const onErrorMatch = attributes.match(/onError=\{[^}]*\}/);
      
      if (!srcMatch) return match; // Skip if no src
      
      const src = srcMatch[1];
      const alt = altMatch ? altMatch[1] : '';
      const className = classMatch ? classMatch[1] : '';
      const hasObjectCover = className.includes('object-cover');
      const hasObjectContain = className.includes('object-contain');
      const hasRounded = className.includes('rounded');
      const hasSquareAspect = className.includes('aspect-square') || className.includes('w-full h-full');
      
      // Determine which OptimizedImage component to use
      let componentName = 'OptimizedImage';
      let extraProps = [];
      
      if (hasSquareAspect && hasRounded) {
        componentName = 'AvatarImage';
      } else if (hasSquareAspect || className.includes('product')) {
        componentName = 'ProductImage';
      } else if (className.includes('hero') || className.includes('banner')) {
        componentName = 'HeroImage';
      }
      
      // Add aspect ratio if detected
      if (className.includes('aspect-video') || className.includes('aspect-[16/9]')) {
        extraProps.push('aspectRatio="16/9"');
      } else if (className.includes('aspect-square')) {
        extraProps.push('aspectRatio="square"');
      }
      
      // Add object fit
      if (hasObjectContain) {
        extraProps.push('objectFit="contain"');
      } else if (hasObjectCover || !hasObjectContain) {
        extraProps.push('objectFit="cover"');
      }
      
      // Clean className (remove Next.js Image incompatible classes)
      let cleanClassName = className
        .replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, '')
        .replace(/\bw-full\b/g, '')
        .replace(/\bh-full\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Build the replacement
      let result = `<${componentName}`;
      result += `\\n          src="${src}"`;
      result += `\\n          alt="${alt}"`;
      if (cleanClassName) {
        result += `\\n          className="${cleanClassName}"`;
      }
      if (extraProps.length > 0) {
        result += `\\n          ${extraProps.join('\\n          ')}`;
      }
      result += `\\n          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`;
      result += `\\n          quality={85}`;
      result += `\\n        />`;
      
      return result;
    }
  }
];

// Import statements to add
const importsToAdd = [
  {
    pattern: /^(import.*from ['"][^'"]*['"])/gm,
    addAfter: "import { OptimizedImage, ProductImage, AvatarImage, HeroImage } from '@/components/ui/OptimizedImage'"
  }
];

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.tsx', '.ts', '.jsx', '.js'].includes(ext)) return;
  
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Check if file contains img elements
  if (!content.includes('<img')) return;
  
  // Apply patterns
  patterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  // Add imports if we modified the file
  if (modified && !content.includes('OptimizedImage')) {
    // Find the last import statement
    const importMatches = [...content.matchAll(/^import.*from ['"][^'"]*['"];?$/gm)];
    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const insertIndex = lastImport.index + lastImport[0].length;
      content = content.slice(0, insertIndex) + 
               "\\nimport { OptimizedImage, ProductImage, AvatarImage, HeroImage } from '@/components/ui/OptimizedImage';" +
               content.slice(insertIndex);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir);
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git', 'dist', 'build'].includes(entry)) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

console.log('🚀 Starting image migration...');
console.log('📁 Processing directory:', srcDir);

try {
  processDirectory(srcDir);
  console.log('');
  console.log('✅ Migration completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Review the changes in your files');
  console.log('   2. Test the application to ensure images load correctly');
  console.log('   3. Update any manual cases that need special handling');
  console.log('   4. Remove the ESLint warning suppression once satisfied');
  console.log('');
  console.log('🎯 Benefits of the migration:');
  console.log('   • Automatic image optimization');
  console.log('   • Better Core Web Vitals (LCP)');
  console.log('   • Reduced bandwidth usage');
  console.log('   • Built-in lazy loading');
  console.log('   • Error handling and fallbacks');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
