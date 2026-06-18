import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { TestContext } from 'node:test'

/**
 * Make a temp dir and remove it after the test, pass or throw. `force` also
 * covers the case where a CHANGELOG.md path is itself a directory.
 */
export function makeTmpDir(t: TestContext, prefix = 'gh-release-'): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}
