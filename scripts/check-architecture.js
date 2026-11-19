import fs from 'node:fs';
import path from 'node:path';

const systemsRoot = path.resolve('src/systems');
const systemNames = new Set(['homepage', 'storefront', 'admin']);
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const errors = [];

function collectFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(target);
    return sourceExtensions.has(path.extname(entry.name)) ? [target] : [];
  });
}

function resolveRelativeImport(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const resolved = path.resolve(path.dirname(fromFile), specifier);
  const relative = path.relative(systemsRoot, resolved).split(path.sep);
  return relative[0] === '..' ? null : relative[0];
}

for (const systemName of systemNames) {
  const systemDirectory = path.join(systemsRoot, systemName);
  for (const file of collectFiles(systemDirectory)) {
    const source = fs.readFileSync(file, 'utf8');
    const importPattern = /(?:from\s*|import\s*\()(['"])([^'"]+)\1/g;
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[2];
      let targetSystem = null;

      if (specifier.startsWith('@/systems/')) {
        targetSystem = specifier.split('/')[2] ?? null;
      } else {
        targetSystem = resolveRelativeImport(file, specifier);
      }

      if (targetSystem && systemNames.has(targetSystem) && targetSystem !== systemName) {
        errors.push(
          `${path.relative(process.cwd(), file)} imports private code from systems/${targetSystem} (${specifier})`
        );
      }

      if (specifier.startsWith('@/shared/') || specifier.includes('/shared/')) {
        // Shared imports are allowed; shared modules are separately checked below.
      }
    }
  }
}

for (const file of collectFiles(path.resolve('src/shared'))) {
  const source = fs.readFileSync(file, 'utf8');
  if (/from\s*['"][^'"]*systems\//.test(source) || /import\s*\(['"][^'"]*systems\//.test(source)) {
    errors.push(`${path.relative(process.cwd(), file)} must not depend on a system module`);
  }
}

if (errors.length > 0) {
  console.error('Architecture boundary violations:');
  for (const error of errors) console.error(` - ${error}`);
  process.exitCode = 1;
} else {
  console.log('Architecture boundaries: passed');
}
