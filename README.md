# gh-release

Create a release for a node package on GitHub.

[![npm][1]][2]
[![travis][3]][4]
[![standard][5]][6]
[![downloads][7]][2]

[1]: https://img.shields.io/npm/v/gh-release.svg?style=flat-square
[2]: https://www.npmjs.com/package/gh-release
[3]: https://img.shields.io/travis/hypermodules/gh-release/master.svg?style=flat-square
[4]: https://travis-ci.org/hypermodules/gh-release
[5]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[6]: http://standardjs.com/
[7]: https://img.shields.io/npm/dm/gh-release.svg?style=flat-square

## Features

- Uses the [Github Releases API](https://developer.github.com/v3/repos/releases/) to create a new GitHub release.
- Defaults to using information from `package.json` and `CHANGELOG.md`.
- Supports uploading release assets.

![gh-release example](demo.gif)

## ⚠️ Important ⚠️

This library abides by the well-established and widely adopted changelog conventions set forth in http://keepachangelog.com.

Any other conventions (autochangelog, standard-version, your favorite thing) are not supported, and support will not be added for them. This library is several years old and well into maintenance mode.

## Install

```
$ npm install gh-release
```

## Usage

### Command-line interface

```console
$ gh-release
Your GitHub username: ungoldman
Your GitHub password: ✔✔✔✔✔✔✔✔

creating release v1.0.0 for ungoldman/cool-project

name:               v1.0.0
tag_name:           v1.0.0
target_commitish:   9561804a4d1fca2525d3207bec4907dd5ec7a705
body:

* engage

? publish release to github? Yes
https://github.com/ungoldman/cool-project/releases/tag/v1.0.0
```

Should be run at the root of the project to be released.

Expects a `package.json` and `CHANGELOG.md` in the working directory.

Prints release URL to `stdout` on success.

Uses [`ghauth`](https://github.com/rvagg/ghauth) for authentication with Github. A Github API OAuth token is saved to the `gh-release` config directory after the first time authenticating. Note that the config directory is determined by [`application-config`](https://github.com/LinusU/node-application-config) and is OS-specific. gh-release will alternatively use the token specified in the `GH_RELEASE_GITHUB_API_TOKEN` environment variable if it exists. This allows it to be used in continuous deployment systems, which can inject different GitHub API tokens depending on the location of the project.

Get usage info by running with `--help` or `-h`.

```console
$ gh-release --help
Usage: gh-release [options]

Examples:
  gh-release -n v2.0.3 -c master -d    create a draft release with title v2.0.3 tagged at HEAD of master


Options:
  -t, --tag_name          tag for this release
  -c, --target_commitish  commitish value for tag
  -n, --name              text of release title
  -b, --body              text of release body
  -o, --owner             repo owner
  -r, --repo              repo name
  -d, --draft             publish as draft                          [default: false]
  -p, --prerelease        publish as prerelease                     [default: false]
  -w, --workpath          path to working directory                 [default: "/Users/ng/dev/git/gh-release"]
  -e, --endpoint          GitHub API endpoint URL                   [default: "https://api.github.com"]
  -a, --assets            comma-delimited list of assets to upload  [default: false]
  --dry-run               dry run (stops before release step)       [default: false]
  -y, --yes               bypass confirmation prompt for release    [default: false]
  -h, --help              Show help
  -v, --version           Show version number
```

### Node API

```js
var ghRelease = require('gh-release')

// all options have defaults and can be omitted
var options = {
  tag_name: 'v1.0.0',
  target_commitish: 'master',
  name: 'v1.0.0',
  body: '* init\n',
  draft: false,
  prerelease: false,
  repo: 'gh-release',
  owner: 'ungoldman',
  endpoint: 'https://api.github.com' // for GitHub enterprise, use http(s)://hostname/api/v3
}

// options can also be just an empty object
var options = {}

// auth is required
// it can be an API token...
options.auth = {
  token: 'XXXXXXXX'
}

// or it can either be a username & password
// (But only for GitHub Enterprise when endpoint is set)
options.auth = {
  username: 'ungoldman',
  password: 'XXXXXXXX'
}

ghRelease(options, function (err, result) {
  if (err) throw err
  console.log(result) // create release response: https://developer.github.com/v3/repos/releases/#response-4
})
```

## Defaults

All default values taken from `package.json` unless specified otherwise.

| name | description | default |
| ---: | ----------- | ------- |
| `tag_name` | release tag | 'v' + `version` |
| `target_commitish` | commitish value to tag | HEAD of current branch |
| `name` | release title | 'v' + `version` |
| `body` | release text | `CHANGELOG.md` section matching `version` |
| `owner` | repo owner | repo owner in `repository` |
| `repo` | repo name | repo name in `repository` |
| `draft` | publish as draft | false |
| `prerelease` | publish as prerelease | false |
| `assets` | release assets to upload | false |
| `endpoint` | GitHub API endpoint URL | https://api.github.com |

Override defaults with flags (CLI) or the `options` object (node).

## Standards

* `CHANGELOG.md`: http://keepachangelog.com
* `package.json`: https://docs.npmjs.com/files/package.json

## Example

All [releases](https://github.com/hypermodules/gh-release/releases) of `gh-release` were created with `gh-release`.

## Config location

Platform | Location
--- | ---
OS X | `~/Library/Application Support/gh-release/config.json`
Linux (XDG) | `$XDG_CONFIG_HOME/gh-release/config.json`
Linux (Legacy) | `~/.config/gh-release/config.json`
Windows (> Vista) | `%LOCALAPPDATA%/gh-release/config.json`
Windows (XP, 2000) | `%USERPROFILE%/Local Settings/Application Data/gh-release/config.json`

## Motivation

There are packages that already do something like this, and they're great, but I want something that does this one thing really well and nothing else, leans heavily on standards in `package.json` and `CHANGELOG.md`, and can work both as a CLI tool and programmatically in node.

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## History

Please read the [change log](CHANGELOG.md) for a human-readable history of changes.

## Tests

`gh-release` uses [`standard`][6] and [`tape`](https://github.com/substack/tape) for testing. You can run all tests with `npm test`.

## See also

- [gh-release-assets](https://github.com/hypermodules/gh-release-assets)
- [maintenance-modules](https://github.com/maxogden/maintenance-modules)

## License

[ISC](LICENSE.md)
