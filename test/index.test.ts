import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import Release, { ghRelease, type ReleaseOptions } from '../src/index.js'
import { type MockConfig, startMockServer } from './helpers/mock-server.js'
import { makeTmpDir } from './helpers/tmp.js'

test('exposes the same function as the default and the ghRelease named export', () => {
  assert.equal(ghRelease, Release)
})

interface Outcome {
  err: Error | null
  result: unknown
  events: Array<[string, string]>
}

function release(options: ReleaseOptions): Promise<Outcome> {
  return new Promise((resolve) => {
    const events: Array<[string, string]> = []
    const emitter = Release(options, (err, result) => resolve({ err, result, events }))
    emitter.on('upload-asset', (name: string) => events.push(['upload-asset', name]))
    emitter.on('upload-progress', (name: string) => events.push(['upload-progress', name]))
    emitter.on('uploaded-asset', (name: string) => events.push(['uploaded-asset', name]))
  })
}

/** Full set of required options, with the API pointed at the mock server. */
function baseOptions(url: string, overrides: Partial<ReleaseOptions> = {}): ReleaseOptions {
  return {
    cli: true,
    auth: { token: 'test-token' },
    endpoint: url,
    owner: 'o',
    repo: 'r',
    body: 'release notes',
    target_commitish: 'main',
    tag_name: 'v1.0.0',
    name: 'v1.0.0',
    ...overrides
  }
}

async function withServer(config: MockConfig, fn: (url: string) => Promise<void>): Promise<void> {
  const server = await startMockServer(config)
  try {
    await fn(server.url)
  } finally {
    await server.close()
  }
}

test('errors when a required option is missing', async () => {
  const withoutAuth = baseOptions('https://api.github.com')
  delete withoutAuth.auth
  const { err } = await release(withoutAuth)
  assert.equal(err?.message, 'missing required options: auth')
})

test('errors when auth has no token', async () => {
  const { err } = await release(
    baseOptions('https://api.github.com', { auth: {} as { token: string } })
  )
  assert.equal(err?.message, 'missing auth info')
})

test('errors when the target commitish is not found', async () => {
  await withServer({ getCommit: { status: 404 } }, async (url) => {
    const { err } = await release(baseOptions(url))
    assert.equal(err?.message, 'Target commitish main not found in o/r')
  })
})

test('treats a 422 from getCommit as a missing commitish', async () => {
  // GitHub returns 422 (not 404) for a ref/SHA that does not resolve
  await withServer({ getCommit: { status: 422 } }, async (url) => {
    const { err } = await release(baseOptions(url))
    assert.equal(err?.message, 'Target commitish main not found in o/r')
  })
})

test('passes through any other getCommit error', async () => {
  await withServer({ getCommit: { status: 500, body: { message: 'boom' } } }, async (url) => {
    const { err } = await release(baseOptions(url))
    assert.equal((err as { status?: number }).status, 500)
  })
})

test('a dry run returns the options without creating a release', async () => {
  await withServer({}, async (url) => {
    const { err, result } = await release(baseOptions(url, { dryRun: true }))
    assert.equal(err, null)
    assert.equal((result as ReleaseOptions).tag_name, 'v1.0.0')
  })
})

test('creates a release with no assets', async () => {
  await withServer({}, async (url) => {
    const { err, result } = await release(baseOptions(url))
    assert.equal(err, null)
    assert.match((result as { html_url: string }).html_url, /releases\/tag/)
  })
})

test('reports an already-existing release', async () => {
  const body = { message: 'Validation Failed', errors: [{ code: 'already_exists' }] }
  await withServer({ createRelease: { status: 422, body } }, async (url) => {
    const { err } = await release(baseOptions(url))
    assert.equal(err?.message, 'Release already exists for tag v1.0.0 in o/r')
  })
})

test('passes through a validation error that is not already_exists', async () => {
  const body = { message: 'Validation Failed', errors: [{ code: 'custom' }] }
  await withServer({ createRelease: { status: 422, body } }, async (url) => {
    const { err } = await release(baseOptions(url))
    assert.equal((err as { status?: number }).status, 422)
  })
})

test('reworded message on a createRelease 404', async () => {
  await withServer(
    { createRelease: { status: 404, body: { message: 'Not Found' } } },
    async (url) => {
      const { err } = await release(baseOptions(url))
      assert.match(err?.message ?? '', /Check that your token has the 'repo' scope/)
    }
  )
})

test('passes through a generic createRelease error', async () => {
  await withServer({ createRelease: { status: 500, body: { message: 'boom' } } }, async (url) => {
    const { err } = await release(baseOptions(url))
    assert.equal((err as { status?: number }).status, 500)
  })
})

test('uploads string and object assets and relays their events', async (t) => {
  const dir = makeTmpDir(t)
  writeFileSync(join(dir, 'a.txt'), 'aaa')
  writeFileSync(join(dir, 'b.txt'), 'bbb')
  await withServer({}, async (url) => {
    const { err, result, events } = await release(
      baseOptions(url, { workpath: dir, assets: ['a.txt', { name: 'renamed.txt', path: 'b.txt' }] })
    )
    assert.equal(err, null)
    assert.match((result as { html_url: string }).html_url, /releases\/tag/)
    const uploaded = events.filter(([type]) => type === 'uploaded-asset').map(([, name]) => name)
    assert.deepEqual(uploaded.sort(), ['a.txt', 'renamed.txt'])
    assert.ok(events.some(([type]) => type === 'upload-asset'))
    assert.ok(events.some(([type]) => type === 'upload-progress'))
  })
})

test('treats an empty assets array as no assets', async () => {
  await withServer({}, async (url) => {
    const { err, result } = await release(baseOptions(url, { assets: [] }))
    assert.equal(err, null)
    assert.match((result as { html_url: string }).html_url, /releases\/tag/)
  })
})

test('errors when an asset file is missing', async (t) => {
  const dir = makeTmpDir(t)
  await withServer({}, async (url) => {
    const { err } = await release(baseOptions(url, { workpath: dir, assets: ['missing.txt'] }))
    assert.ok(err instanceof Error)
  })
})

test('non-cli path derives defaults then creates a release', async () => {
  await withServer({}, async (url) => {
    const { err, result } = await release({
      workpath: join(import.meta.dirname, 'fixtures', 'basic'),
      auth: { token: 'test-token' },
      endpoint: url
    })
    assert.equal(err, null)
    assert.match((result as { html_url: string }).html_url, /releases\/tag/)
  })
})

test('non-cli path applies the tagPrefix option', async () => {
  const server = await startMockServer({})
  try {
    const { err } = await release({
      workpath: join(import.meta.dirname, 'fixtures', 'basic'),
      auth: { token: 'test-token' },
      endpoint: server.url,
      tagPrefix: ''
    })
    assert.equal(err, null)
    const createReq = server.requests.find(
      (r) => r.method === 'POST' && r.url.endsWith('/releases')
    )
    assert.ok(createReq && createReq.body.includes('"tag_name":"0.0.0"'))
  } finally {
    await server.close()
  }
})

test('non-cli path falls back to the default workpath (cwd)', async () => {
  await withServer({}, async (url) => {
    // no workpath: derives defaults from this package's own root
    const { err, result } = await release({ auth: { token: 'test-token' }, endpoint: url })
    assert.equal(err, null)
    assert.match((result as { html_url: string }).html_url, /releases\/tag/)
  })
})

test('non-cli path propagates a getDefaults error', async () => {
  const { err } = await release({
    workpath: join(import.meta.dirname, 'fixtures', 'mismatch'),
    auth: { token: 'test-token' }
  })
  assert.match(err?.message ?? '', /out of sync with package.json/)
})

test('non-cli path treats the default endpoint as non-enterprise', async () => {
  const { err } = await release({
    workpath: join(import.meta.dirname, 'fixtures', 'mismatch'),
    auth: { token: 'test-token' },
    endpoint: 'https://api.github.com'
  })
  assert.match(err?.message ?? '', /out of sync with package.json/)
})
