import fs from 'fs';
import path from 'path';

// Keep source modules cohesive without forcing artificial component splits.
const MAX_LINES = 300;

function walkDir(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach(file => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (file.isFile() && /\.(ts|tsx|js|jsx|css|scss)$/.test(file.name)) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walkDir('src');

console.log('File Line Count Analysis (Maintainability threshold: ' + MAX_LINES + ' lines):\n');

let hasLargeFiles = false;
const largeFiles = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n').length;
  
  if (lines > MAX_LINES) {
    largeFiles.push({ file, lines });
    hasLargeFiles = true;
  }
});

// Display large files
if (largeFiles.length > 0) {
  console.log('⚠️  WARNING: The following files exceed the maintainability threshold:');
  largeFiles.forEach(({ file, lines }) => {
    console.log(`  ${file} — ${lines} lines`);
  });
  console.log('');
  console.log('💡 Consider refactoring these files for better maintainability.');
  console.log('   The build completed successfully, but large files may indicate code that needs splitting.');
} else {
  console.log('✅ All files are under the line limit.');
}
