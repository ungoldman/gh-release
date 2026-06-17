import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type Release from './index.js'
import type { ReleaseOptions } from './index.js'
import { parseCliArgs, usage, version } from './lib/args.js'
import { getDefaults } from './lib/get-defaults.js'
import { preview } from './lib/preview.js'

/** Injectable seams for {@link run}, so the CLI is testable without a real terminal. */
export interface CliDeps {
  cwd: string
  env: NodeJS.ProcessEnv
  stdout: (msg: string) => void
  stderr: (msg: string) => void
  progress: (line: string) => void
  confirm: (question: string) => Promise<boolean>
  exit: (code: number) => void
  release: typeof Release
}

function resolveToken(token: string | undefined, env: NodeJS.ProcessEnv): string | undefined {
  return token ?? env.GH_RELEASE_GITHUB_API_TOKEN ?? env.GITHUB_TOKEN
}

/** Run the CLI. Resolves once the release completes (or the process is told to exit). */
export async function run(argv: string[], deps: CliDeps): Promise<void> {
  let values: ReturnType<typeof parseCliArgs>
  try {
    values = parseCliArgs(argv)
  } catch (err) {
    deps.stderr((err as Error).message)
    deps.stderr(usage)
    return deps.exit(1)
  }

  if (values.help) {
    deps.stdout(usage)
    return deps.exit(0)
  }
  if (values.version) {
    deps.stdout(version)
    return deps.exit(0)
  }

  const workpath = values.workpath ?? deps.cwd
  if (!existsSync(join(workpath, 'package.json'))) {
    deps.stdout('Must be run in a directory with a package.json')
    deps.stdout(usage)
    return deps.exit(1)
  }

  const endpoint = values.endpoint ?? 'https://api.github.com'
  const isEnterprise = endpoint !== 'https://api.github.com'

  const token = resolveToken(values.token, deps.env)
  if (!token) {
    deps.stderr(
      'No token found. Set GH_RELEASE_GITHUB_API_TOKEN or GITHUB_TOKEN, or pass --token. (e.g. export GH_RELEASE_GITHUB_API_TOKEN=$(gh auth token))'
    )
    return deps.exit(1)
  }

  let defaults: Awaited<ReturnType<typeof getDefaults>>
  try {
    defaults = await getDefaults(workpath, isEnterprise)
  } catch (err) {
    deps.stderr((err as Error).message)
    return deps.exit(1)
  }

  const options: ReleaseOptions = { ...defaults, auth: { token }, cli: true, workpath, endpoint }
  if (values.tag_name !== undefined) options.tag_name = values.tag_name
  if (values.target_commitish !== undefined) options.target_commitish = values.target_commitish
  if (values.name !== undefined) options.name = values.name
  if (values.body !== undefined) options.body = values.body
  if (values.owner !== undefined) options.owner = values.owner
  if (values.repo !== undefined) options.repo = values.repo
  if (values.draft) options.draft = true
  if (values.prerelease) options.prerelease = true
  if (values['dry-run']) options.dryRun = true
  if (values.yes) options.yes = true
  if (values['generate-notes']) options.generate_release_notes = true
  if (values.assets) options.assets = values.assets.split(',').map((asset) => asset.trim())

  if (!existsSync(join(workpath, 'CHANGELOG.md'))) {
    deps.stderr('warning: no CHANGELOG.md found, releasing from package.json')
  } else if (!options.body && !options.generate_release_notes) {
    deps.stderr('warning: the release body is empty')
  }

  preview(options as Record<string, unknown>, deps.stdout)

  if (options.dryRun) return deps.exit(0)

  if (!options.yes) {
    const confirmed = await deps.confirm('publish release to github?')
    if (!confirmed) return deps.exit(1)
  }

  await performRelease(options, deps)
}

function performRelease(options: ReleaseOptions, deps: CliDeps): Promise<void> {
  return new Promise((resolve) => {
    const release = deps.release(options, (err, result) => {
      if (err) {
        deps.stderr(err.message)
        deps.exit(1)
        return resolve()
      }
      const res = result as { message?: string; html_url?: string }
      if (res.message === 'Moved Permanently') {
        deps.stderr('repository url in package.json is out of date and requires a redirect')
        deps.exit(1)
        return resolve()
      }
      if (!res.html_url) {
        deps.stderr('missing result info')
        deps.exit(1)
        return resolve()
      }
      deps.stdout(res.html_url)
      deps.exit(0)
      return resolve()
    })

    release.on('upload-asset', (name: string) => deps.progress(`uploading ${name}...`))
    release.on('upload-progress', (name: string, progress: { percentage: number }) =>
      deps.progress(`uploading ${name}... ${Math.round(progress.percentage)}%`)
    )
    release.on('uploaded-asset', (name: string) => deps.stdout(`uploaded ${name}`))
  })
}
