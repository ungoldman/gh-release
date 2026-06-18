import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { makeTmpDir } from './helpers/tmp.js'

const bin = join(import.meta.dirname, '..', 'dist', 'bin.js')

function ghRelease(args: string[], env: NodeJS.ProcessEnv = process.env) {
  return spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', env })
}

test('bin --help prints usage and exits 0', () => {
  const res = ghRelease(['--help'])
  assert.equal(res.status, 0)
  assert.match(res.stdout, /Usage: gh-release/)
})

test('bin --version prints the version and exits 0', () => {
  const res = ghRelease(['--version'])
  assert.equal(res.status, 0)
  assert.match(res.stdout.trim(), /^\d+\.\d+\.\d+$/)
})

test('bin exits 1 when no token is available', (t) => {
  const dir = makeTmpDir(t, 'gh-release-bin-')
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'r', version: '1.0.0', repository: 'https://github.com/o/r.git' })
  )
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 1.0.0\n- a change\n')

  const env = { ...process.env }
  delete env.GH_RELEASE_GITHUB_API_TOKEN
  delete env.GITHUB_TOKEN

  const res = ghRelease(['-w', dir], env)
  assert.equal(res.status, 1)
  assert.match(res.stderr, /No token found/)
})
