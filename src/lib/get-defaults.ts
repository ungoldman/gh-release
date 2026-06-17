import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import parseChangelog from 'changelog-parser'

/** Release defaults derived from package.json, lerna.json, CHANGELOG.md, and git. */
export interface Defaults {
  body: string
  assets: false
  owner: string
  repo: string
  dryRun: boolean
  yes: boolean
  endpoint: string
  workpath: string
  prerelease: boolean
  draft: boolean
  target_commitish: string
  tag_name: string
  name: string
}

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

/** Current HEAD commit, or `master` when not in a git repo. */
export function getTargetCommitish(): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).split('\n')[0]
  } catch {
    return 'master'
  }
}

/**
 * Extract `{ owner, repo }` from a package.json `repository` field. Accepts the
 * forms npm allows: full URLs (`https://`, `git://`, `git+ssh://`), the scp-like
 * `git@host:owner/repo.git`, the `github:owner/repo` shorthand, and a bare
 * `owner/repo`. Non-github hosts are only accepted when `isEnterprise` is set.
 */
function parseRepo(
  repository: unknown,
  isEnterprise: boolean
): { owner: string; repo: string } | null {
  const value = typeof repository === 'string' ? repository : (repository as { url?: string })?.url
  if (typeof value !== 'string') return null
  const raw = value.replace(/^git\+/, '')

  let host: string
  let path: string
  const scp = raw.match(/^[^@/]+@([^:/]+):(.+)$/)
  if (scp) {
    host = scp[1]
    path = scp[2]
  } else if (raw.includes('://')) {
    try {
      const url = new URL(raw)
      host = url.hostname
      path = url.pathname
    } catch {
      return null
    }
  } else if (raw.startsWith('github:')) {
    host = 'github.com'
    path = raw.slice('github:'.length)
  } else if (/^[^/:]+\/[^/:]+$/.test(raw)) {
    host = 'github.com'
    path = raw
  } else {
    return null
  }

  const isGitHub = host === 'github.com' || host === 'www.github.com'
  if (!isGitHub && !isEnterprise) return null

  const [owner, repo] = path
    .replace(/^\/+/, '')
    .replace(/\.git$/, '')
    .split('/')
  if (!owner || !repo) return null
  return { owner, repo }
}

/** Derive release defaults for a package directory. Throws on validation failure. */
export async function getDefaults(workPath: string, isEnterprise: boolean): Promise<Defaults> {
  const pkg = readJson(resolve(workPath, 'package.json'))
  if (!Object.hasOwn(pkg, 'repository')) {
    throw new Error(
      'You must define a repository for your module => https://docs.npmjs.com/files/package.json#repository'
    )
  }

  const commit = getTargetCommitish()
  const repoParts = parseRepo(pkg.repository, isEnterprise)
  if (!repoParts) {
    throw new Error(
      'The repository defined in your package.json is invalid => https://docs.npmjs.com/files/package.json#repository'
    )
  }
  const { owner, repo } = repoParts

  const result = await parseChangelog(resolve(workPath, 'CHANGELOG.md'))

  // an 'unreleased' heading is allowed only if it carries no list items
  const unreleased = result.versions
    .filter((release) => String(release.title).toLowerCase().includes('unreleased'))
    .filter((release) => Object.values(release.parsed).flat().length > 0)
  if (unreleased.length > 0) {
    throw new Error('Unreleased changes detected in CHANGELOG.md, aborting')
  }

  const log = result.versions.filter((release) => release.version !== null)[0]
  if (!log) {
    throw new Error('CHANGELOG.md does not contain any versions')
  }

  const lernaPath = resolve(workPath, 'lerna.json')
  if (existsSync(lernaPath)) {
    const lerna = readJson(lernaPath) as { version?: string }
    if (log.version !== lerna.version) {
      throw new Error(
        `CHANGELOG.md out of sync with lerna.json (${log.version} !== ${lerna.version})`
      )
    }
  } else if (log.version !== pkg.version) {
    throw new Error(
      `CHANGELOG.md out of sync with package.json (${log.version} !== ${pkg.version})`
    )
  }

  // log.version was confirmed equal to the package or lerna version above
  const version = `v${log.version}`

  return {
    body: log.body,
    assets: false,
    owner,
    repo,
    dryRun: false,
    yes: false,
    endpoint: 'https://api.github.com',
    workpath: process.cwd(),
    prerelease: false,
    draft: false,
    target_commitish: commit,
    tag_name: version,
    name: version
  }
}
