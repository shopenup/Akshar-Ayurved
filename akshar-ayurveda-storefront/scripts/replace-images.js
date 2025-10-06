#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const srcDir = path.join(__dirname, '../src');
const patterns = ['**/*.tsx', '**/*.ts'];

// Find all files matching patterns
const files = patterns.flatMap(pattern => 
  glob.sync(pattern, { cwd: srcDir })
);

console.log(`Found ${files.length} files to process...`);

let processedCount = 0;
let modifiedCount = 0;

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Skip files that already use CompressedImage
    if (content.includes('CompressedImage')) {
      return;
    }
    
    // Replace import statements
    if (content.includes("import Image from 'next/image'")) {
      content = content.replace(
        "import Image from 'next/image'",
        "import CompressedImage from '@components/CompressedImage'"
      );
      modified = true;
    }
    
    // Replace Image components with CompressedImage
    if (content.includes('<Image')) {
      // Add useCase prop to Image components
      content = content.replace(
        /<Image\s+([^>]*?)>/g,
        (match, props) => {
          // Check if useCase is already present
          if (props.includes('useCase=')) {
            return match;
          }
          
          // Add useCase prop based on context
          let useCase = 'card'; // default
          if (props.includes('width={80}') || props.includes('height={80}')) {
            useCase = 'thumbnail';
          } else if (props.includes('fill')) {
            useCase = 'hero';
          }
          
          return `<CompressedImage ${props} useCase="${useCase}">`;
        }
      );
      
      // Replace closing tags
      content = content.replace(/<\/Image>/g, '</CompressedImage>');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log(`✅ Modified: ${file}`);
    }
    
    processedCount++;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Processed: ${processedCount} files`);
console.log(`- Modified: ${modifiedCount} files`);
console.log(`\n🎉 Image compression is now enabled across your app!`);
console.log(`\n📝 Next steps:`);
console.log(`1. Start your development server: npm run dev`);
console.log(`2. Open browser dev tools and go to Network tab`);
console.log(`3. Disable cache in dev tools`);
console.log(`4. Visit your product pages to see compression in action`);
console.log(`5. Check the console for compression logs`);

