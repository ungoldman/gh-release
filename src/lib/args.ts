import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8')
) as { version: string }

export const version = pkg.version

export const usage = `Usage: gh-release [options]

Create a GitHub Release for a Node package.

Options:
  -t, --tag_name <tag>          tag for this release
  -c, --target_commitish <ref>  commitish value for tag
  -n, --name <name>             text of release title
  -b, --body <body>             text of release body
  -o, --owner <owner>           repo owner
  -r, --repo <repo>             repo name
  -d, --draft                   publish as draft
  -p, --prerelease              publish as prerelease
  -w, --workpath <path>         path to working directory
  -e, --endpoint <url>          GitHub API endpoint URL
  -a, --assets <list>           comma-delimited list of assets to upload
      --dry-run                 dry run (stops before release step)
      --token <token>           GitHub token (defaults to $GH_RELEASE_GITHUB_API_TOKEN or $GITHUB_TOKEN)
  -y, --yes                     bypass confirmation prompt for release
  -h, --help                    show help
  -v, --version                 show version number`

/** Parse CLI arguments into raw parseArgs values. Throws on unknown options. */
export function parseCliArgs(argv: string[]) {
  const { values } = parseArgs({
    args: argv,
    allowPositionals: false,
    options: {
      tag_name: { type: 'string', short: 't' },
      target_commitish: { type: 'string', short: 'c' },
      name: { type: 'string', short: 'n' },
      body: { type: 'string', short: 'b' },
      owner: { type: 'string', short: 'o' },
      repo: { type: 'string', short: 'r' },
      draft: { type: 'boolean', short: 'd' },
      prerelease: { type: 'boolean', short: 'p' },
      workpath: { type: 'string', short: 'w' },
      endpoint: { type: 'string', short: 'e' },
      assets: { type: 'string', short: 'a' },
      'dry-run': { type: 'boolean' },
      token: { type: 'string' },
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' }
    }
  })
  return values
}
