import fs from 'node:fs';
import path from 'node:path';

const sourceRoot = path.resolve('src');
const systemsRoot = path.join(sourceRoot, 'systems');
const systemNames = new Set(['homepage', 'storefront', 'admin']);
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);
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
  const pattern = /(?:from\s*|import\s*\(|import\s*|@import\s*(?:url\s*\()?)['"]([^'"]+)['"]/g;
  return [...source.matchAll(pattern)].map((match) => match[1]);
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


// The entire storefront experience (pages, components, checkout and styles)
// must be store-agnostic. Store-specific copy and presentation live in core
// configuration or store-owned theme modules.
const storefrontExperienceRoot = path.join(systemsRoot, 'storefront', 'experience');
for (const file of collectFiles(storefrontExperienceRoot)) {
  const source = fs.readFileSync(file, 'utf8');
  const relativeFile = path.relative(process.cwd(), file);
  if (/\b(?:isPoshies|isYotaabo)\b|\b(?:storeName|name|storeKey)\s*!?==?\s*['"](?:Poshies|Yotaabo|poshies|yotaabo)['"]/.test(source)) {
    errors.push(relativeFile + ' contains store-identity branching; move the decision into storefront configuration');
  }
  if (/['"](?:Poshies|Yotaabo)['"]/.test(source)) {
    errors.push(relativeFile + ' contains a hard-coded store identity; read the active store name or copy from configuration');
  }
  const importsStoreOwnedModule = /(?:from\s*|import\s*)['"][^'"]*\/stores\/(?:poshies|yotaabo)\//.test(source);
  if (importsStoreOwnedModule) {
    errors.push(relativeFile + ' imports a store-owned implementation; store themes must be discovered by key, not registered in shared experience files');
  }
  if (/\b(?:poshies|yotaabo)-[a-z0-9_-]+/i.test(source)) {
    errors.push(relativeFile + ' contains a brand-prefixed presentation selector; use a neutral storefront class');
  }
  if (/#(?:ff1493|8aa89b|c8ad8d)\b/i.test(source)) {
    errors.push(relativeFile + ' contains a store-owned palette literal; consume a semantic storefront token');
  }
  if (/\b(?:primaryAccent|accentColor)\s*===/.test(source)) {
    errors.push(relativeFile + ' branches on a concrete accent value; use configured presentation roles or semantic tokens');
  }
}

// Storefront routes and cart storage must be configuration-driven so a new
// store does not require edits to shared route or cart implementations.
const storefrontRoutesPath = path.join(sourceRoot, 'app', 'App.tsx');
const storefrontRoutesSource = fs.existsSync(storefrontRoutesPath)
  ? fs.readFileSync(storefrontRoutesPath, 'utf8')
  : '';
if (!/Object\.entries\(STOREFRONTS\)/.test(storefrontRoutesSource)) {
  errors.push('src/app/App.tsx must generate storefront routes from STOREFRONTS configuration');
}

const storefrontCartPath = path.join(systemsRoot, 'storefront', 'core', 'context', 'CartContext.tsx');
const storefrontCartSource = fs.existsSync(storefrontCartPath)
  ? fs.readFileSync(storefrontCartPath, 'utf8')
  : '';
if (!/storefront:\s*string/.test(storefrontCartSource)) {
  errors.push('StorefrontCartProvider must accept any configured storefront key');
}

const storefrontConfigurationPath = path.join(systemsRoot, 'storefront', 'core', 'configuration', 'storefronts.ts');
const storefrontConfigurationSource = fs.existsSync(storefrontConfigurationPath)
  ? fs.readFileSync(storefrontConfigurationPath, 'utf8')
  : '';
if (!/STOREFRONTS:\s*Record<string,\s*StorefrontConfiguration>/.test(storefrontConfigurationSource)) {
  errors.push('Storefront configuration must accept arbitrary storefront keys');
}

const storefrontThemeProviderPath = path.join(systemsRoot, 'storefront', 'core', 'components', 'StorefrontThemeProvider.tsx');
const storefrontThemeProviderSource = fs.existsSync(storefrontThemeProviderPath)
  ? fs.readFileSync(storefrontThemeProviderPath, 'utf8')
  : '';
if (!/designSystem\.overrides/.test(storefrontThemeProviderSource) ||
    !/import\.meta\.glob/.test(storefrontThemeProviderSource) ||
    !/query:\s*['"]\?url['"]/.test(storefrontThemeProviderSource)) {
  errors.push('StorefrontThemeProvider must apply semantic overrides and auto-discover store theme stylesheets');
}

const storefrontCategoriesApiPath = path.resolve('netlify/functions/categories.mjs');
const storefrontCategoriesApiSource = fs.existsSync(storefrontCategoriesApiPath)
  ? fs.readFileSync(storefrontCategoriesApiPath, 'utf8')
  : '';
if (/new Set\(\[['"]yotaabo['"],\s*['"]poshies['"]\]\)/.test(storefrontCategoriesApiSource) ||
    !/FROM public\.stores\s+WHERE slug = \$1 AND is_active IS TRUE/.test(storefrontCategoriesApiSource)) {
  errors.push('Storefront category API must resolve any active storefront from the stores table, not a fixed brand allowlist');
}

if (errors.length > 0) {
  console.error('Architecture boundary violations:');
  for (const error of errors) console.error(' - ' + error);
  process.exitCode = 1;
} else {
  console.log('Architecture boundaries: passed');
}
