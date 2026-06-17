<div align="center">

<img src="./rocket.png" width="120" height="120" alt="rocket">

# gh-release

Create a GitHub Release for a Node package.

[![npm][npm-image]][npm-url]
[![build][build-image]][build-url]
[![downloads][downloads-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/gh-release.svg
[npm-url]: https://www.npmjs.com/package/gh-release
[build-image]: https://github.com/ungoldman/gh-release/actions/workflows/tests.yml/badge.svg
[build-url]: https://github.com/ungoldman/gh-release/actions/workflows/tests.yml
[downloads-image]: https://img.shields.io/npm/dm/gh-release.svg

</div>

## Features

- Creates a GitHub release via the [Releases API](https://docs.github.com/en/rest/releases/releases).
- Defaults to information from `package.json` and `CHANGELOG.md`.
- Uploads release assets.
- Works as a CLI tool or programmatically.

## Install

```
npm install gh-release
```

## Usage

This package is ESM-only and ships TypeScript types. It requires Node 22.12 or newer.

Run it at the root of the project to be released. It expects a `package.json` (and optionally a `CHANGELOG.md`) in the working directory, and prints the release URL to `stdout` on success.

### Authentication

Authentication is token-only. gh-release resolves a GitHub token in this order:

1. the `--token` flag,
2. the `GH_RELEASE_GITHUB_API_TOKEN` environment variable,
3. the `GITHUB_TOKEN` environment variable.

If none is set it exits with an error. The token needs the `repo` scope. If you use the [GitHub CLI](https://cli.github.com) (`gh`), its `gh auth token` command prints a token for the account you are signed in as, which is a convenient way to provide one locally:

```
export GH_RELEASE_GITHUB_API_TOKEN=$(gh auth token)
```

### Command-line interface

```console
$ gh-release

creating release v1.0.9 for ungoldman/gh-release-test

name:               v1.0.9
tag_name:           v1.0.9
target_commitish:   3b06705e43be83363f063966f36ede3990a2842a
endpoint:           https://api.github.com
body:

### Maintenance
* test: testing latest CLI output
* deps: gh-release@8

publish release to github? (Y/n)
https://github.com/ungoldman/gh-release-test/releases/tag/v1.0.9
```

Get usage info with `--help` or `-h`:

```console
$ gh-release --help
Usage: gh-release [options]

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
      --generate-notes          let GitHub generate the release notes
      --token <token>           GitHub token (defaults to $GH_RELEASE_GITHUB_API_TOKEN or $GITHUB_TOKEN)
  -y, --yes                     bypass confirmation prompt for release
  -h, --help                    show help
  -v, --version                 show version number
```

### Node API

Import the named `ghRelease` export. The default export remains available for backwards compatibility.

```js
import { ghRelease } from 'gh-release'
// backwards-compatible alternative: import ghRelease from 'gh-release'

// all options except auth have defaults and can be omitted
const options = {
  tag_name: 'v1.0.0',
  target_commitish: 'main',
  name: 'v1.0.0',
  body: '* init\n',
  draft: false,
  prerelease: false,
  repo: 'gh-release',
  owner: 'ungoldman',
  endpoint: 'https://api.github.com', // for GitHub Enterprise, use http(s)://hostname/api/v3
  // auth is required and must be a token
  auth: { token: process.env.GH_RELEASE_GITHUB_API_TOKEN }
}

const release = ghRelease(options, (err, result) => {
  if (err) throw err
  console.log(result.html_url)
})

// when uploading assets, the returned EventEmitter relays progress
release.on('upload-asset', (name) => {})
release.on('upload-progress', (name, progress) => {})
release.on('uploaded-asset', (name) => {})
```

## Defaults

All default values are taken from `package.json` unless specified otherwise.

| name | description | default |
| ---: | ----------- | ------- |
| `tag_name` | release tag | 'v' + `version` |
| `target_commitish` | commitish value to tag | HEAD of current branch |
| `name` | release title | 'v' + `version` |
| `body` | release text | `CHANGELOG.md` section matching `version` (empty if no changelog) |
| `owner` | repo owner | repo owner in `repository` |
| `repo` | repo name | repo name in `repository` |
| `draft` | publish as draft | false |
| `prerelease` | publish as prerelease | false |
| `assets` | release assets to upload | false |
| `endpoint` | GitHub API endpoint URL | https://api.github.com |

Override defaults with flags (CLI) or the `options` object (Node).

`CHANGELOG.md` is optional. Without it, gh-release tags from the `package.json` version with an empty body. When it is present, the matching section is used, and that section may itself be empty. Either way the CLI prints a warning when the body ends up empty.

To fill the body without a changelog, pass `--generate-notes` (CLI) or set `generate_release_notes: true` (Node). This enables GitHub's [automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes), which GitHub builds server-side from the merged pull requests and commits since the previous release. The option name matches the [GitHub API field](https://docs.github.com/en/rest/releases/releases#create-a-release) it sets.

## Standards

* `CHANGELOG.md`: any changelog format recognized by [changelog-parser](https://github.com/ungoldman/changelog-parser#supported-formats):
  * [Keep a Changelog](https://keepachangelog.com/)
  * [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)
  * [Release Please](https://github.com/googleapis/release-please)
  * [Standard Version](https://github.com/conventional-changelog/standard-version)
  * [auto-changelog](https://github.com/CookPete/auto-changelog)
* `package.json`: https://docs.npmjs.com/files/package.json

## Motivation

There are packages that already do something like this, and they're great, but I want something that does this one thing really well and nothing else, leans heavily on standards in `package.json` and `CHANGELOG.md`, and works both as a CLI tool and programmatically in Node.

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## History

Please read the [change log](CHANGELOG.md) for a human-readable history of changes.

## Tests

`gh-release` uses [Biome](https://biomejs.dev) for linting and formatting and Node's built-in test runner. Run everything with `npm test`, and check coverage with `npm run coverage`.

## See also

- [gh-release-assets](https://github.com/ungoldman/gh-release-assets)
- [changelog-parser](https://github.com/ungoldman/changelog-parser)

## License

[ISC](LICENSE.md)

Rocket image is from [emojipedia](https://emojipedia.org/rocket/).
