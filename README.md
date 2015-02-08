# gh-release

Create a release for a node package on github.

[![](https://nodei.co/npm/gh-release.png)](https://www.npmjs.com/package/gh-release)

Uses the [Github Releases API](https://developer.github.com/v3/repos/releases/) to create a new release using information from your `package.json` and `CHANGELOG.md`. Has strong defaults, relies on standards.

## Usage

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

All settings in `options` are optional (see [options](#options) for defaults).

`username` and `password` in `auth` are required. Ideally this will support a token in the future as well -- storing these things in plaintext as env vars or anything else is obviously a bad idea. Right now user & pass are mainly there to support the CLI prompt use case.

### CLI

Should be run at the root of the project to be released.

Expects a `package.json` and `CHANGELOG.md`.

```
$ npm install -g gh-release
$ gh-release --help
Usage: gh-release [options]

Options:
  -h, --help              Show help
  -v, --version           Show version number
  -t, --tag_name                               [default: "v1.0.0"]
  -c, --target_commitish                       [default: "master"]
  -n, --name                                   [default: "v1.0.0"]
  -b, --body                                   [default: "* create working prototype\n* define basic node interface\n* define basic cli interface\n"]
  -o, --owner                                  [default: "ngoldman"]
  -r, --repo                                   [default: "gh-release"]
  -d, --draft                                  [default: false]
  -p, --prerelease                             [default: false]
```

### Options

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

## Example

All [releases](https://github.com/ngoldman/gh-release/releases) of `gh-release` were created with `gh-release`.

## Motivation

There are packages that already do something like this, and they're great, but I want something that does this one thing really well and nothing else, leans heavily on standards in `package.json` and `CHANGELOG.md`, and can work both as a cli tool and programmatically in node. Mostly I want this to work well as a dependency in [versioneer](https://github.com/ngoldman/versioneer).

## License

[ISC](LICENSE.md)
