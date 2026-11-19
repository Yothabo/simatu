import fs from 'node:fs';
import path from 'node:path';

const sourceRoot = path.resolve('src');
const systemsRoot = path.join(sourceRoot, 'systems');
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

function importsIn(source) {
  const pattern = /(?:from\s*|import\s*\(|import\s*)(['"])([^'"]+)\1/g;
  return [...source.matchAll(pattern)].map((match) => match[2]);
}

function systemTarget(fromFile, specifier) {
  if (specifier.startsWith('@/systems/')) {
    return specifier.slice('@/systems/'.length).split('/')[0] ?? null;
  }
  if (!specifier.startsWith('.')) return null;
  const resolved = path.resolve(path.dirname(fromFile), specifier);
  const relative = path.relative(systemsRoot, resolved).split(path.sep);
  if (relative[0] === '..' || relative[0] === '') return null;
  return relative[0] ?? null;
}

// Systems may depend on their own internals and neutral shared code, never
// another system's implementation details.
for (const systemName of systemNames) {
  for (const file of collectFiles(path.join(systemsRoot, systemName))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const specifier of importsIn(source)) {
      const targetSystem = systemTarget(file, specifier);
      if (targetSystem && systemNames.has(targetSystem) && targetSystem !== systemName) {
        errors.push(
          path.relative(process.cwd(), file) +
          ' imports private code from systems/' + targetSystem + ' (' + specifier + ')'
        );
      }
    }
  }
}

// Shared infrastructure must remain independent of system implementations.
for (const file of collectFiles(path.join(sourceRoot, 'shared'))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const specifier of importsIn(source)) {
    const resolved = specifier.startsWith('.')
      ? path.resolve(path.dirname(file), specifier)
      : '';
    if (
      specifier.startsWith('@/systems/') ||
      (resolved && resolved.split(path.sep).includes('systems'))
    ) {
      errors.push(
        path.relative(process.cwd(), file) +
        ' must not depend on a system module (' + specifier + ')'
      );
    }
  }
}

// App composition can import only public entry points for each system.
const publicSystemEntrypoints = new Map([
  ['homepage', new Set([''])],
  ['storefront', new Set(['core', 'experience'])],
  ['admin', new Set([''])],
]);

for (const file of collectFiles(path.join(sourceRoot, 'app'))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const specifier of importsIn(source)) {
    let parts = null;
    if (specifier.startsWith('@/systems/')) {
      parts = specifier.slice('@/systems/'.length).split('/');
    } else if (specifier.startsWith('.')) {
      const resolved = path.resolve(path.dirname(file), specifier);
      const relative = path.relative(systemsRoot, resolved).split(path.sep);
      if (relative[0] !== '..' && relative[0] !== '') parts = relative;
    }

    if (!parts || !systemNames.has(parts[0])) continue;
    const subpath = parts.slice(1).join('/');
    if (!publicSystemEntrypoints.get(parts[0]).has(subpath)) {
      errors.push(
        path.relative(process.cwd(), file) +
        ' must import the public systems/' + parts[0] +
        ' entry point, not ' + specifier
      );
    }
  }
}

if (errors.length > 0) {
  console.error('Architecture boundary violations:');
  for (const error of errors) console.error(' - ' + error);
  process.exitCode = 1;
} else {
  console.log('Architecture boundaries: passed');
}
