# gh-release

[![](https://img.shields.io/github/release/ngoldman/gh-release.svg?style=flat-square)](https://github.com/ngoldman/gh-release/releases/latest)
[![](https://img.shields.io/npm/v/gh-release.svg?style=flat-square)](https://www.npmjs.com/package/gh-release)
[![](https://img.shields.io/travis/ngoldman/gh-release.svg?style=flat-square)](https://travis-ci.org/ngoldman/gh-release)

Create a release for a node package on github.

Uses the [Github Releases API](https://developer.github.com/v3/repos/releases/) to create a new release using information from your `package.json` and `CHANGELOG.md`. Has strong [defaults](#defaults), relies on [standards](#standards).

## Usage

### CLI

```
$ npm install -g gh-release
$ gh-release --help
Usage: gh-release -t [tag_name] -c [commit] -n [name] -b [body] -o [owner] -r [repo] -d -p

Options:
  -t, --tag_name          tag for this release
  -c, --target_commitish  commitish value for tag
  -n, --name              text of release title
  -b, --body              text of release body
  -o, --owner             repo owner
  -r, --repo              repo name
  -d, --draft             publish as draft         [default: false]
  -p, --prerelease        publish as prerelease    [default: false]
  -h, --help              Show help
  -v, --version           Show version number

$ gh-release
? github username: ngoldman
? github password: *************
{ tag_name: 'v1.0.7',
  target_commitish: '395a7f8dfa6fcc961b2dc5c2ced2220e04f9f28a',
  name: 'v1.0.7',
  body: '* add `standard` to dev dependencies\n* add `.travis.yml` & badge for travis-ci\n* improve cli usage info & move to top of readme\n\n',
  owner: 'ngoldman',
  repo: 'gh-release',
  draft: false,
  prerelease: false }
? does this look right? (y/N) y
https://github.com/ngoldman/gh-release/releases/tag/v1.0.7
```

Should be run at the root of the project to be released.

Expects a `package.json` and `CHANGELOG.md` in the working directory.

Prints release URL (e.g. https://github.com/ngoldman/gh-release/releases/tag/v1.0.7) to terminal on success.

### Node

```
$ npm install gh-release --save-dev
```

```js
var ghRelease = require('gh-release')
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
var auth = {
  username: 'ngoldman',
  password: 'XXXXXXXX'
}

ghRelease(options, auth, function (err, result) {
  if (err) throw err
  console.log('Release URL: ' + result)
})
```

All settings in `options` are optional (see [defaults](#defaults)).

`username` and `password` in `auth` are required. Ideally this will support a token in the future as well -- storing these things in plaintext as env vars or anything else is obviously a bad idea (don't do it!). Right now user & pass are mainly there to support the CLI prompt use case.

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

Override defaults with flags ([cli](#cli)) or the `options` object ([node](#node)).

## Standards

Currently using http://keepachangelog.com/ as a standard CHANGELOG.md reference.

All other standards are from npm's [package.json](https://docs.npmjs.com/files/package.json) documentation.

## Example

All [releases](https://github.com/ngoldman/gh-release/releases) of `gh-release` were created with `gh-release`.

## Motivation

There are packages that already do something like this, and they're great, but I want something that does this one thing really well and nothing else, leans heavily on standards in `package.json` and `CHANGELOG.md`, and can work both as a cli tool and programmatically in node. Mostly I want this to work well as a dependency in [versioneer](https://github.com/ngoldman/versioneer).

## Contributing

`gh-release` is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more details.

## License

[ISC](LICENSE.md)
