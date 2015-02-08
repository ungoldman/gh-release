# gh-release

Create a release for a node package on github (wip).

## Usage

### Node

```js
var ghRelease = require('gh-release')

ghRelease(options, function (err, results) {})
```

### CLI

```shell
$ gh-release [options]
```

### Options

Defaults:

* in `package.json`:
  * `name`
  * `version`
  * `repository.url`
* in `CHANGELOG.md`:
  * changes section matching `version` in `package.json`

Optional:

* in `package.json`:
  * `files` array containing files to zip & upload w/ release
  * `scripts.pre-gh-release` to run before release
  * `scripts.post-gh-release` to run after release

Override defaults with flags (cli) or options object (node). Interface tbd.

## Reference

* [github release api docs](https://developer.github.com/v3/repos/releases/)

## License

ISC
