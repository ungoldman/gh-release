# gh-release

[![release][release-image]][release-url]
[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![stability][stability-image]][stability-url]

[release-image]: https://img.shields.io/github/release/ngoldman/gh-release.svg?style=flat-square
[release-url]: https://github.com/ngoldman/gh-release/releases/latest
[npm-image]: https://img.shields.io/npm/v/gh-release.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/gh-release
[travis-image]: https://img.shields.io/travis/ngoldman/gh-release.svg?style=flat-square
[travis-url]: https://travis-ci.org/ngoldman/gh-release
[stability-image]: https://img.shields.io/badge/stability-1%20--%20experimental-orange.svg?style=flat-square
[stability-url]: https://iojs.org/api/documentation.html#documentation_stability_index

Create a release for a node package on GitHub.

Uses the [Github Releases API](https://developer.github.com/v3/repos/releases/) to create a new release. Defaults to using information from `package.json` and `CHANGELOG.md`.

![gh-release example](demo.gif)

## Command-line interface

### Install

```
$ npm install gh-release -g
```

### Usage

```
$ gh-release
Your GitHub username: ngoldman
Your GitHub password: ✔✔✔✔✔✔✔✔

creating release v1.0.0 for ngoldman/cool-project

name:               v1.0.0
tag_name:           v1.0.0
target_commitish:   9561804a4d1fca2525d3207bec4907dd5ec7a705
draft:              false
prerelease:         false
body:               * engage

? publish release to github? Yes
https://github.com/ngoldman/cool-project/releases/tag/v1.0.0
```

Should be run at the root of the project to be released.

Expects a `package.json` and `CHANGELOG.md` in the working directory.

Prints release URL to terminal on success.

Saves Github API token to `$HOME/.config/gh-release.json` after first authentication.

Get usage info by running with `--help` or `-h`.

```
$ gh-release --help
Usage: gh-release [options]

Options:
  -t, --tag_name          tag for this release
  -c, --target_commitish  commitish value for tag
  -n, --name              text of release title
  -b, --body              text of release body
  -o, --owner             repo owner
  -r, --repo              repo name
  -d, --draft             publish as draft           [default: false]
  -p, --prerelease        publish as prerelease      [default: false]
  -w, --workpath          path to working directory  [default: current working directory]
  -a, --assets            list of assets to upload to release
  -h, --help              Show help
  -v, --version           Show version number
  --dry-run                                          [default: false]
```

## Node API

### Install

```
$ npm install gh-release --save-dev
```

### Usage

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
  owner: 'ngoldman'
}
// options can also be just an empty object
var options = {}

// auth is required
// it can either be a username & password...
options.auth = {
  username: 'ngoldman',
  password: 'XXXXXXXX'
}

// or an API token
options.auth = {
  token: 'XXXXXXXX'
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
| `owner` | repo owner | repo owner parsed out of `repository.url` |
| `repo` | repo name | repo name parsed out of `repository.url` |
| `draft` | publish as draft | false |
| `prerelease` | publish as prerelease | false |

Override defaults with flags (CLI) or the `options` object (node).

## Standards

* `CHANGELOG.md`: http://keepachangelog.com
* `package.json`: https://docs.npmjs.com/files/package.json

## Example

All [releases](https://github.com/ngoldman/gh-release/releases) of `gh-release` were created with `gh-release`.

## Motivation

There are packages that already do something like this, and they're great, but I want something that does this one thing really well and nothing else, leans heavily on standards in `package.json` and `CHANGELOG.md`, and can work both as a CLI tool and programmatically in node.

## Contributing

`gh-release` is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more details.

## License

[ISC](LICENSE.md)
