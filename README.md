**under active development**

*not actually working yet, so don't try to use it*

# gh-release

Create a release for a node package on github (wip).

## Usage

### Node

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

```
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

* in `package.json`:
  * `version`
  * `repository.url`
* in `CHANGELOG.md`:
  * changes section matching `version` in `package.json`

Optional:

* in `package.json`:
  * (not yet implemented) `files` array containing files to zip & upload w/ release

Override defaults with flags (cli) or options object (node).

## Reference

* [github release api docs](https://developer.github.com/v3/repos/releases/)

## Motivation

There are packages that already do something like this, and they're great, but I want something that does this one thing really well and nothing else, leans heavily on standard keys in `package.json`, and can work both as a cli tool and programmatically in node. Mostly I want this to work well as a dependency in [versioneer](https://github.com/ngoldman/versioneer).

## License

[ISC](LICENSE.md)
