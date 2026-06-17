import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import fc from 'fast-check'
import { type ReleaseOptions, validate } from '../src/index.js'
import { parseCliArgs, usage, version } from '../src/lib/args.js'
import { getDefaults, getTargetCommitish } from '../src/lib/get-defaults.js'
import { preview } from '../src/lib/preview.js'

const fixture = (name: string) => join(import.meta.dirname, 'fixtures', name)

/** Write a temp package dir with a given `repository` value and a matching changelog. */
function pkgDir(repository: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'r', version: '1.0.0', repository })
  )
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 1.0.0\n- a\n')
  return dir
}

// --- get-defaults ---

test('reads owner and repo from a repository object', async () => {
  const defaults = await getDefaults(fixture('basic'), false)
  assert.equal(defaults.owner, 'bcomnes')
  assert.equal(defaults.repo, 'gh-release-test')
  assert.equal(defaults.tag_name, 'v0.0.0')
})

test('reads owner and repo from a repository string', async () => {
  const defaults = await getDefaults(fixture('stringy-repo'), false)
  assert.equal(defaults.owner, 'stringy')
  assert.equal(defaults.repo, 'repo')
})

test('reads an enterprise (non-github) repository host', async () => {
  const defaults = await getDefaults(fixture('enterprise-repo'), true)
  assert.equal(defaults.owner, 'stringy')
  assert.equal(defaults.repo, 'repo')
})

test('reads an scp-like git@host:owner/repo.git repository', async () => {
  const defaults = await getDefaults(pkgDir('git@github.com:o/r.git'), false)
  assert.equal(defaults.owner, 'o')
  assert.equal(defaults.repo, 'r')
})

test('reads a github:owner/repo shorthand repository', async () => {
  const defaults = await getDefaults(pkgDir('github:o/r'), false)
  assert.equal(defaults.owner, 'o')
  assert.equal(defaults.repo, 'r')
})

test('reads a bare owner/repo shorthand repository', async () => {
  const defaults = await getDefaults(pkgDir('o/r'), false)
  assert.equal(defaults.owner, 'o')
  assert.equal(defaults.repo, 'r')
})

test('rejects a malformed repository url', async () => {
  await assert.rejects(
    getDefaults(pkgDir('https://'), false),
    /repository defined in your package.json is invalid/
  )
})

test('allows an unreleased heading with empty subsections', async () => {
  const defaults = await getDefaults(fixture('unreleased-empty-subsections'), false)
  assert.equal(defaults.owner, 'bcomnes')
})

test('allows an empty unreleased heading', async () => {
  const defaults = await getDefaults(fixture('unreleased-alt'), false)
  assert.equal(defaults.tag_name, 'v1.0.0')
})

test('rejects an invalid repository string', async () => {
  await assert.rejects(
    getDefaults(fixture('invalid-repo'), false),
    /repository defined in your package.json is invalid/
  )
})

test('rejects a package.json with no repository field', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', version: '1.0.0' }))
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 1.0.0\n- a\n')
  await assert.rejects(getDefaults(dir, false), /must define a repository/)
})

test('rejects a repository object with no url', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'x', version: '1.0.0', repository: { type: 'git' } })
  )
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 1.0.0\n- a\n')
  await assert.rejects(
    getDefaults(dir, false),
    /repository defined in your package.json is invalid/
  )
})

test('rejects a non-github host when not enterprise', async () => {
  await assert.rejects(
    getDefaults(fixture('enterprise-repo'), false),
    /repository defined in your package.json is invalid/
  )
})

test('rejects a repository url missing the repo segment', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'x', version: '1.0.0', repository: 'https://github.com/foo' })
  )
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 1.0.0\n- a\n')
  await assert.rejects(
    getDefaults(dir, false),
    /repository defined in your package.json is invalid/
  )
})

test('accepts a lerna.json version matching the changelog', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'x', version: '9.9.9', repository: 'https://github.com/o/r.git' })
  )
  writeFileSync(join(dir, 'lerna.json'), JSON.stringify({ version: '1.0.0' }))
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 1.0.0\n- a\n')
  const defaults = await getDefaults(dir, false)
  assert.equal(defaults.tag_name, 'v1.0.0')
})

test('rejects a changelog out of sync with package.json', async () => {
  await assert.rejects(
    getDefaults(fixture('mismatch'), false),
    /out of sync with package.json \(0\.0\.1 !== 0\.0\.0\)/
  )
})

test('rejects a changelog out of sync with lerna.json', async () => {
  await assert.rejects(
    getDefaults(fixture('lerna-mismatch'), false),
    /out of sync with lerna.json \(0\.0\.1 !== 0\.0\.0\)/
  )
})

test('rejects a changelog with no recognized version entries', async () => {
  await assert.rejects(getDefaults(fixture('no-versions'), false), /no recognized version entries/)
})

test('wraps a present-but-unreadable changelog error', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'x', version: '1.0.0', repository: 'https://github.com/o/r.git' })
  )
  // a directory at the CHANGELOG.md path exists but cannot be read as a file
  mkdirSync(join(dir, 'CHANGELOG.md'))
  await assert.rejects(getDefaults(dir, false), /Could not read CHANGELOG.md: /)
})

test('releases without a CHANGELOG.md, from the package.json version', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'x', version: '2.3.4', repository: 'https://github.com/o/r.git' })
  )
  // no CHANGELOG.md written
  const defaults = await getDefaults(dir, false)
  assert.equal(defaults.body, '')
  assert.equal(defaults.tag_name, 'v2.3.4')
  assert.equal(defaults.name, 'v2.3.4')
})

test('rejects a missing CHANGELOG.md when package.json has no version', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'x', repository: 'https://github.com/o/r.git' })
  )
  await assert.rejects(getDefaults(dir, false), /package.json has no version to release/)
})

test('allows an empty release body', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'x', version: '1.0.0', repository: 'https://github.com/o/r.git' })
  )
  writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog\n\n## [1.0.0] - 2020-01-01\n')
  const defaults = await getDefaults(dir, false)
  assert.equal(defaults.body, '')
  assert.equal(defaults.tag_name, 'v1.0.0')
})

test('parses an auto-changelog changelog (changelog-parser 4.1)', async () => {
  const defaults = await getDefaults(fixture('auto-changelog'), false)
  assert.equal(defaults.tag_name, 'v1.1.0')
  assert.match(defaults.body, /add a format option/)
})

test('rejects a non-empty unreleased section', async () => {
  await assert.rejects(getDefaults(fixture('unreleased'), false), /Unreleased changes detected/)
})

test('getTargetCommitish returns the current HEAD', () => {
  assert.match(getTargetCommitish(), /^[0-9a-f]{7,40}$/)
})

test('getTargetCommitish falls back to master outside a git repo', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-nogit-'))
  const cwd = process.cwd()
  process.chdir(dir)
  try {
    assert.equal(getTargetCommitish(), 'master')
  } finally {
    process.chdir(cwd)
  }
})

// --- preview ---

test('preview prints a release summary, hiding sensitive and falsy fields', () => {
  const lines: string[] = []
  preview(
    {
      tag_name: 'v1.0.0',
      owner: 'o',
      repo: 'r',
      auth: { token: 'secret' },
      workpath: '/tmp',
      dryRun: false,
      yes: false,
      draft: false,
      assets: false,
      prerelease: true,
      body: 'line one\nline two'
    },
    (msg) => lines.push(msg)
  )
  const output = lines.join('\n')
  assert.match(output, /creating release v1\.0\.0 for o\/r/)
  assert.match(output, /line one/)
  assert.match(output, /prerelease:/)
  assert.doesNotMatch(output, /secret/)
  assert.doesNotMatch(output, /draft:/)
})

test('preview defaults to console.log', () => {
  const original = console.log
  const lines: string[] = []
  console.log = (msg: string) => lines.push(msg)
  try {
    preview({ tag_name: 'v1.0.0', owner: 'o', repo: 'r', body: undefined })
  } finally {
    console.log = original
  }
  assert.ok(lines.some((line) => line.includes('creating release v1.0.0')))
})

// --- args ---

test('parses flags and short aliases', () => {
  const values = parseCliArgs(['-t', 'v1.0.0', '--draft', '--dry-run', '--token', 'abc'])
  assert.equal(values.tag_name, 'v1.0.0')
  assert.equal(values.draft, true)
  assert.equal(values['dry-run'], true)
  assert.equal(values.token, 'abc')
})

test('throws on an unknown flag', () => {
  assert.throws(() => parseCliArgs(['--nope']))
})

test('parses the --generate-notes flag', () => {
  assert.equal(parseCliArgs(['--generate-notes'])['generate-notes'], true)
})

test('exposes usage text and the package version', () => {
  assert.match(usage, /Usage: gh-release/)
  assert.match(version, /^\d+\.\d+\.\d+$/)
})

// --- validate (property) ---

// `body` is intentionally absent: an empty release body is allowed
const required = ['auth', 'owner', 'repo', 'target_commitish', 'tag_name', 'name']

test('validate reports exactly the missing required options', () => {
  fc.assert(
    fc.property(fc.subarray(required), (present) => {
      const options: Record<string, unknown> = {}
      for (const key of present) options[key] = 'x'
      const { missing } = validate(options as ReleaseOptions)
      assert.deepEqual(missing.sort(), required.filter((key) => !present.includes(key)).sort())
    })
  )
})
