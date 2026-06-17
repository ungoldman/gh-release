import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { type CliDeps, isConfirmed, run } from '../src/cli.js'
import Release from '../src/index.js'
import { type MockConfig, startMockServer } from './helpers/mock-server.js'

const fixture = (name: string) => join(import.meta.dirname, 'fixtures', name)

function makeDeps(overrides: Partial<CliDeps> = {}) {
  const out: string[] = []
  const errs: string[] = []
  const progress: string[] = []
  const exits: number[] = []
  const deps: CliDeps = {
    cwd: process.cwd(),
    env: {},
    stdout: (msg) => out.push(msg),
    stderr: (msg) => errs.push(msg),
    progress: (line) => progress.push(line),
    confirm: async () => true,
    exit: (code) => exits.push(code),
    release: Release,
    ...overrides
  }
  return { deps, out, errs, progress, exits }
}

async function withServer(
  config: MockConfig,
  fn: (url: string, requests: number[]) => Promise<void>
) {
  const server = await startMockServer(config)
  try {
    await fn(server.url, [] as number[])
  } finally {
    await server.close()
  }
}

/** A self-contained package directory the release flow can run against. */
function makeWorkdir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-cli-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'r', version: '1.0.0', repository: 'https://github.com/o/r.git' })
  )
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 1.0.0\n- a change\n')
  return dir
}

test('isConfirmed defaults to yes, declining only on an explicit no', () => {
  for (const yes of ['', 'y', 'Y', 'yes', 'YES', 'sure']) assert.equal(isConfirmed(yes), true)
  for (const no of ['n', 'N', 'no', 'NO', '  no  ']) assert.equal(isConfirmed(no), false)
})

test('--help prints usage and exits 0', async () => {
  const { deps, out, exits } = makeDeps()
  await run(['--help'], deps)
  assert.ok(out.join('\n').includes('Usage: gh-release'))
  assert.deepEqual(exits, [0])
})

test('--version prints the version and exits 0', async () => {
  const { deps, out, exits } = makeDeps()
  await run(['--version'], deps)
  assert.match(out.join('\n'), /^\d+\.\d+\.\d+$/)
  assert.deepEqual(exits, [0])
})

test('an unknown flag exits 1 with usage', async () => {
  const { deps, errs, exits } = makeDeps()
  await run(['--nope'], deps)
  assert.ok(errs.join('\n').includes('Usage: gh-release'))
  assert.deepEqual(exits, [1])
})

test('missing package.json/CHANGELOG exits 1', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gh-release-empty-'))
  const { deps, out, exits } = makeDeps()
  await run(['-w', dir], deps)
  assert.ok(out.join('\n').includes('Must be run in a directory'))
  assert.deepEqual(exits, [1])
})

test('no token exits 1 with a hint', async () => {
  const { deps, errs, exits } = makeDeps()
  await run(['-w', fixture('basic')], deps)
  assert.match(errs.join('\n'), /No token found/)
  assert.deepEqual(exits, [1])
})

test('defaults workpath to cwd when not provided', async () => {
  const { deps, errs, exits } = makeDeps()
  await run([], deps)
  assert.match(errs.join('\n'), /No token found/)
  assert.deepEqual(exits, [1])
})

test('a token from --token drives a successful release', async () => {
  await withServer({}, async (url) => {
    const { deps, out, exits } = makeDeps()
    await run(['-w', fixture('basic'), '-e', url, '--token', 'abc', '-y'], deps)
    assert.match(out.join('\n'), /releases\/tag/)
    assert.deepEqual(exits, [0])
  })
})

test('a token from GH_RELEASE_GITHUB_API_TOKEN works', async () => {
  await withServer({}, async (url) => {
    const { deps, exits } = makeDeps({ env: { GH_RELEASE_GITHUB_API_TOKEN: 'x' } })
    await run(['-w', fixture('basic'), '-e', url, '-y'], deps)
    assert.deepEqual(exits, [0])
  })
})

test('a token from GITHUB_TOKEN works', async () => {
  await withServer({}, async (url) => {
    const { deps, exits } = makeDeps({ env: { GITHUB_TOKEN: 'y' } })
    await run(['-w', fixture('basic'), '-e', url, '-y'], deps)
    assert.deepEqual(exits, [0])
  })
})

test('a getDefaults error exits 1', async () => {
  await withServer({}, async (url) => {
    const { deps, errs, exits } = makeDeps()
    await run(['-w', fixture('mismatch'), '-e', url, '--token', 'x', '-y'], deps)
    assert.match(errs.join('\n'), /out of sync with package.json/)
    assert.deepEqual(exits, [1])
  })
})

test('a dry run previews and exits 0 without contacting the server', async () => {
  const server = await startMockServer({})
  try {
    const { deps, out, exits } = makeDeps()
    await run(
      [
        '-w',
        fixture('basic'),
        '-e',
        server.url,
        '--token',
        'x',
        '-t',
        'v9.9.9',
        '-c',
        'abc',
        '-n',
        'Title',
        '-b',
        'Body',
        '-o',
        'own',
        '-r',
        'rep',
        '-d',
        '-p',
        '--dry-run'
      ],
      deps
    )
    assert.match(out.join('\n'), /creating release/)
    assert.deepEqual(exits, [0])
    assert.equal(server.requests.length, 0)
  } finally {
    await server.close()
  }
})

test('declining the confirmation exits 1', async () => {
  const server = await startMockServer({})
  try {
    const { deps, exits } = makeDeps({ confirm: async () => false })
    await run(['-w', fixture('basic'), '-e', server.url, '--token', 'x'], deps)
    assert.deepEqual(exits, [1])
    assert.equal(server.requests.length, 0)
  } finally {
    await server.close()
  }
})

test('confirming the prompt drives a release', async () => {
  await withServer({}, async (url) => {
    const { deps, out, exits } = makeDeps({ confirm: async () => true })
    await run(['-w', fixture('basic'), '-e', url, '--token', 'x'], deps)
    assert.match(out.join('\n'), /releases\/tag/)
    assert.deepEqual(exits, [0])
  })
})

test('a redirect (Moved Permanently) exits 1', async () => {
  const body = { message: 'Moved Permanently' }
  await withServer({ createRelease: { status: 200, body } }, async (url) => {
    const { deps, errs, exits } = makeDeps()
    await run(['-w', fixture('basic'), '-e', url, '--token', 'x', '-y'], deps)
    assert.match(errs.join('\n'), /out of date/)
    assert.deepEqual(exits, [1])
  })
})

test('a response with no html_url exits 1', async () => {
  await withServer({ createRelease: { status: 200, body: {} } }, async (url) => {
    const { deps, errs, exits } = makeDeps()
    await run(['-w', fixture('basic'), '-e', url, '--token', 'x', '-y'], deps)
    assert.match(errs.join('\n'), /missing result info/)
    assert.deepEqual(exits, [1])
  })
})

test('a release error exits 1', async () => {
  await withServer({ createRelease: { status: 500, body: { message: 'boom' } } }, async (url) => {
    const { deps, errs, exits } = makeDeps()
    await run(['-w', fixture('basic'), '-e', url, '--token', 'x', '-y'], deps)
    assert.ok(errs.length > 0)
    assert.deepEqual(exits, [1])
  })
})

test('uploads assets and reports progress', async () => {
  const dir = makeWorkdir()
  writeFileSync(join(dir, 'a.txt'), 'aaa')
  await withServer({}, async (url) => {
    const { deps, out, progress, exits } = makeDeps()
    await run(['-w', dir, '-e', url, '--token', 'x', '-y', '-a', 'a.txt'], deps)
    assert.match(out.join('\n'), /uploaded a\.txt/)
    assert.ok(progress.length > 0)
    assert.deepEqual(exits, [0])
  })
})
