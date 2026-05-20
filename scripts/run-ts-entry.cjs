#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const repoRoot = path.resolve(__dirname, '..')
const compiledRoot = path.join(repoRoot, '.tmp-script-run', 'compiled')

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true })
}

function resolveImportPath(importerPath, specifier) {
  const absoluteBasePath = path.resolve(path.dirname(importerPath), specifier)
  const candidates = [
    absoluteBasePath,
    `${absoluteBasePath}.ts`,
    `${absoluteBasePath}.tsx`,
    `${absoluteBasePath}.js`,
    `${absoluteBasePath}.cjs`,
    `${absoluteBasePath}.mjs`,
    `${absoluteBasePath}.json`,
    path.join(absoluteBasePath, 'index.ts'),
    path.join(absoluteBasePath, 'index.tsx'),
    path.join(absoluteBasePath, 'index.js'),
    path.join(absoluteBasePath, 'index.cjs'),
    path.join(absoluteBasePath, 'index.mjs'),
    path.join(absoluteBasePath, 'index.json')
  ]

  const resolvedPath = candidates.find(candidatePath => fs.existsSync(candidatePath))

  if (!resolvedPath) {
    throw new Error(`Could not resolve "${specifier}" from ${importerPath}`)
  }

  return resolvedPath
}

function toOutputPath(inputPath, outputRoot = compiledRoot) {
  const relativePath = path.relative(repoRoot, inputPath)

  if (relativePath.startsWith('..')) {
    throw new Error(`Script path must stay inside the repository: ${inputPath}`)
  }

  return path.join(outputRoot, relativePath).replace(/\.(cts|mts|ts|tsx)$/, '.js')
}

function writeCommonJsPackage(outputRoot = compiledRoot) {
  ensureDirectory(outputRoot)
  fs.writeFileSync(
    path.join(outputRoot, 'package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2),
    'utf8'
  )
}

function transpileEntry(inputPath, seenPaths = new Set(), outputRoot = compiledRoot) {
  if (seenPaths.has(inputPath)) {
    return
  }

  seenPaths.add(inputPath)

  const outputPath = toOutputPath(inputPath, outputRoot)
  const sourceText = fs.readFileSync(inputPath, 'utf8')
  const sourceExtension = path.extname(inputPath)

  if (sourceExtension === '.ts' || sourceExtension === '.tsx' || sourceExtension === '.mts' || sourceExtension === '.cts') {
    const references = ts.preProcessFile(sourceText, true, true)

    for (const importedFile of references.importedFiles) {
      if (!importedFile.fileName.startsWith('.')) {
        continue
      }

      const dependencyPath = resolveImportPath(inputPath, importedFile.fileName)
      transpileEntry(dependencyPath, seenPaths, outputRoot)
    }

    const transpiled = ts.transpileModule(sourceText, {
      compilerOptions: {
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        resolveJsonModule: true,
        target: ts.ScriptTarget.ES2020
      },
      fileName: inputPath
    })

    ensureDirectory(path.dirname(outputPath))
    fs.writeFileSync(outputPath, transpiled.outputText, 'utf8')
    return outputPath
  }

  ensureDirectory(path.dirname(outputPath))
  fs.copyFileSync(inputPath, outputPath)
  return outputPath
}

function run() {
  const [, , scriptPathArg, ...scriptArgs] = process.argv

  if (!scriptPathArg) {
    throw new Error('Usage: node scripts/run-ts-entry.cjs <script.ts> [args...]')
  }

  const absoluteScriptPath = path.resolve(repoRoot, scriptPathArg)
  writeCommonJsPackage()
  const compiledEntryPath = transpileEntry(absoluteScriptPath)

  process.argv = [process.argv[0], absoluteScriptPath, ...scriptArgs]
  require(compiledEntryPath)
}

if (require.main === module) {
  try {
    run()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to run the TypeScript entry.'
    console.error(message)
    process.exitCode = 1
  }
}

module.exports = {
  compiledRoot,
  repoRoot,
  resolveImportPath,
  run,
  toOutputPath,
  transpileEntry,
  writeCommonJsPackage
}
