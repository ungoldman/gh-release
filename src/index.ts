import { EventEmitter } from 'node:events'
import { join } from 'node:path'
import { Octokit } from '@octokit/rest'
import uploadAssets from 'gh-release-assets'
import { getDefaults } from './lib/get-defaults.js'

/** Token-based authentication. */
export interface Auth {
  token: string
}

/** An asset to upload: a path string, or `{ name, path }` to rename on upload. */
export type AssetInput = string | { name: string; path: string }

/** Options accepted by {@link Release}. */
export interface ReleaseOptions {
  auth?: Auth
  owner?: string
  repo?: string
  body?: string
  target_commitish?: string
  tag_name?: string
  name?: string
  draft?: boolean
  prerelease?: boolean
  generate_release_notes?: boolean
  endpoint?: string
  dryRun?: boolean
  yes?: boolean
  workpath?: string
  assets?: AssetInput[] | false
  cli?: boolean
}

/** Completion callback. `result` is the GitHub createRelease response data. */
export type ReleaseCallback = (err: Error | null, result?: unknown) => void

interface OptionsSpec {
  required: string[]
  defaults: Record<string, unknown>
}

interface HttpError extends Error {
  status?: number
  response?: { data?: { errors?: Array<{ code?: string }> } }
}

const OPTIONS: OptionsSpec = {
  // `body` is intentionally not required: an empty release body is allowed
  required: ['auth', 'owner', 'repo', 'target_commitish', 'tag_name', 'name'],
  defaults: {
    dryRun: false,
    yes: false,
    draft: false,
    endpoint: 'https://api.github.com',
    prerelease: false,
    workpath: process.cwd()
  }
}

/** Shared no-op used to silence Octokit's logger. */
const noop = (): void => {}

/** Report any required options that are missing. */
function validate(options: ReleaseOptions): { missing: string[] } {
  const opts = options as Record<string, unknown>
  return { missing: OPTIONS.required.filter((opt) => !opts[opt]) }
}

/** True when a createRelease error is GitHub's "release already exists" validation failure. */
function isAlreadyExists(err: HttpError): boolean {
  try {
    const response = err.response as { data: { errors: Array<{ code?: string }> } }
    return response.data.errors[0].code === 'already_exists'
  } catch {
    return false
  }
}

/** Create a GitHub release. Returns an EventEmitter that relays asset-upload events. */
function Release(options: ReleaseOptions, callback: ReleaseCallback): EventEmitter {
  const emitter = new EventEmitter()

  if (options.cli) {
    runRelease(options, emitter, callback)
    return emitter
  }

  const workpath = options.workpath ?? (OPTIONS.defaults.workpath as string)
  const isEnterprise = !!options.endpoint && options.endpoint !== OPTIONS.defaults.endpoint
  getDefaults(workpath, isEnterprise)
    .then((defaults) => runRelease({ ...defaults, ...options }, emitter, callback))
    .catch((err: Error) => callback(err))

  return emitter
}

async function runRelease(
  options: ReleaseOptions,
  emitter: EventEmitter,
  callback: ReleaseCallback
): Promise<void> {
  const { missing } = validate(options)
  if (missing.length) return callback(new Error(`missing required options: ${missing.join(', ')}`))

  const token = (options.auth as Auth).token
  if (!token) return callback(new Error('missing auth info'))

  const octokit = new Octokit({
    auth: token,
    baseUrl: options.endpoint,
    // gh-release surfaces errors via the callback; silence Octokit's own request logging
    log: { debug: noop, info: noop, warn: noop, error: noop }
  })
  const owner = options.owner as string
  const repo = options.repo as string

  try {
    await octokit.repos.getCommit({ owner, repo, ref: options.target_commitish as string })
  } catch (err) {
    const e = err as HttpError
    // GitHub returns 404 when the repo is unreachable and 422 for a ref/SHA that does not resolve
    if (e.status === 404 || e.status === 422) {
      return callback(
        new Error(`Target commitish ${options.target_commitish} not found in ${owner}/${repo}`)
      )
    }
    return callback(e)
  }

  if (options.dryRun) return callback(null, options)

  let result: { data: { upload_url: string; html_url: string } }
  try {
    result = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: options.tag_name as string,
      target_commitish: options.target_commitish,
      name: options.name,
      body: options.body,
      draft: options.draft,
      prerelease: options.prerelease,
      generate_release_notes: options.generate_release_notes
    })
  } catch (err) {
    const e = err as HttpError
    if (e.status === 404) {
      return callback(
        new Error(
          `404 Not Found. Check that your token has the 'repo' scope and access to ${owner}/${repo} (authorize SSO for the org if required).`
        )
      )
    }
    if (isAlreadyExists(e)) {
      return callback(
        new Error(`Release already exists for tag ${options.tag_name} in ${owner}/${repo}`)
      )
    }
    return callback(e)
  }

  if (!options.assets || options.assets.length === 0) {
    return callback(null, result.data)
  }

  const assets = options.assets.map((asset) =>
    typeof asset === 'object'
      ? { name: asset.name, path: join(options.workpath as string, asset.path) }
      : join(options.workpath as string, asset)
  )

  const upload = uploadAssets({ url: result.data.upload_url, assets, token }, (err) => {
    if (err) return callback(err)
    return callback(null, result.data)
  })
  upload.on('upload-asset', (name) => emitter.emit('upload-asset', name))
  upload.on('upload-progress', (name, progress) => emitter.emit('upload-progress', name, progress))
  upload.on('uploaded-asset', (name) => emitter.emit('uploaded-asset', name))
}

/** {@link Release} with its static helpers attached. */
export interface ReleaseFn {
  (options: ReleaseOptions, callback: ReleaseCallback): EventEmitter
  OPTIONS: OptionsSpec
  validate: typeof validate
}

const ghRelease = Release as ReleaseFn
ghRelease.OPTIONS = OPTIONS
ghRelease.validate = validate

export { ghRelease, OPTIONS, validate }
export default ghRelease
