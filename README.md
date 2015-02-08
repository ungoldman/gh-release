# gh-release

Create a release for a node package on github.

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
  body: '* create working prototype\n* define basic node interface\n* define basic cli interface\n',
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

Defaults:

* `tag_name`: `v` + `version` from `package.json`
* `target_commitish`: `master` for now
* `name`: `v` + `version` from `package.json`
* `body`: section from `CHANGELOG.md` matching `version` from `package.json`
* `owner`: repo owner parsed out of `repository.url` from `package.json`
* `repo`: repo name parsed out of `repository.url` from `package.json`
* `draft`: false
* `prerelease`: false

Not yet implemented:

* zip and upload dist using `files` array from `package.json`

Override defaults with flags (cli) or the `options` object (node).

## Example

The first release of this module was created using this module: https://github.com/ngoldman/gh-release/releases/tag/v1.0.0

## Reference

* [github release api docs](https://developer.github.com/v3/repos/releases/)

## Motivation

There are packages that already do something like this, and they're great, but I want something that does this one thing really well and nothing else, leans heavily on standard keys in `package.json`, and can work both as a cli tool and programmatically in node. Mostly I want this to work well as a dependency in [versioneer](https://github.com/ngoldman/versioneer).

## License

[ISC](LICENSE.md)
