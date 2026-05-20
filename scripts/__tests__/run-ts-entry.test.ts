/**
 * @jest-environment node
 */

import fs from 'fs'
import path from 'path'

const {
  repoRoot,
  resolveImportPath,
  toOutputPath,
  transpileEntry,
  writeCommonJsPackage
} = require('../run-ts-entry.cjs') as {
  repoRoot: string
  resolveImportPath: (importerPath: string, specifier: string) => string
  toOutputPath: (inputPath: string, outputRoot?: string) => string
  transpileEntry: (inputPath: string, seenPaths?: Set<string>, outputRoot?: string) => string
  writeCommonJsPackage: (outputRoot?: string) => void
}

describe('run-ts-entry', () => {
  const fixtureRoot = path.join(repoRoot, '.tmp-script-run', 'test-fixtures')
  const outputRoot = path.join(repoRoot, '.tmp-script-run', 'test-compiled')

  beforeAll(() => {
    fs.mkdirSync(fixtureRoot, { recursive: true })
    fs.mkdirSync(outputRoot, { recursive: true })
  })

  beforeEach(() => {
    // Keep the temp directories stable so Jest watch mode does not race
    // against directory deletion while crawling the repo.
    fs.mkdirSync(fixtureRoot, { recursive: true })
    fs.mkdirSync(outputRoot, { recursive: true })
  })

  it('maps repo files into the compiled output tree', () => {
    const sourcePath = path.join(repoRoot, 'scripts', 'lighthouse-test.ts')

    expect(toOutputPath(sourcePath, outputRoot)).toBe(
      path.join(outputRoot, 'scripts', 'lighthouse-test.js')
    )
  })

  it('rejects paths outside the repository root', () => {
    expect(() => toOutputPath(path.join(path.dirname(repoRoot), 'outside.ts'), outputRoot)).toThrow(
      /inside the repository/
    )
  })

  it('resolves extensionless relative imports to a TypeScript file', () => {
    const importerPath = path.join(fixtureRoot, 'entry.ts')
    const dependencyPath = path.join(fixtureRoot, 'dep.ts')

    fs.writeFileSync(importerPath, "import './dep'\n", 'utf8')
    fs.writeFileSync(dependencyPath, 'export const value = 42\n', 'utf8')

    expect(resolveImportPath(importerPath, './dep')).toBe(dependencyPath)
  })

  it('transpiles the entry file and its relative dependencies to CommonJS', () => {
    const entryPath = path.join(fixtureRoot, 'entry.ts')
    const dependencyPath = path.join(fixtureRoot, 'dep.ts')

    fs.writeFileSync(
      entryPath,
      "import { value } from './dep'\nexport const total = value + 1\n",
      'utf8'
    )
    fs.writeFileSync(dependencyPath, 'export const value = 41\n', 'utf8')

    writeCommonJsPackage(outputRoot)
    const compiledEntryPath = transpileEntry(entryPath, new Set<string>(), outputRoot)

    const compiledDependencyPath = path.join(outputRoot, path.relative(repoRoot, dependencyPath))
      .replace(/\.ts$/, '.js')

    expect(fs.existsSync(compiledEntryPath)).toBe(true)
    expect(fs.existsSync(compiledDependencyPath)).toBe(true)
    expect(fs.readFileSync(compiledEntryPath, 'utf8')).toContain('require("./dep")')
    expect(fs.readFileSync(path.join(outputRoot, 'package.json'), 'utf8')).toContain('commonjs')
  })
})
