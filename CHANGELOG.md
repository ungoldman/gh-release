# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).
This change log adheres to [keepachangelog.com](http://keepachangelog.com).

## [1.1.8] - 2015-04-22
### Fixed
* exit process with code 1 on aborted release or invalid directory ([#31](https://github.com/ngoldman/gh-release/issues/31))

## [1.1.7] - 2015-04-07
### Fixed
* If cli is successful, should exit with code of 0

## [1.1.6] - 2015-04-03
* update demo
* update doc

## [1.1.5] - 2015-04-02
* more improvements to CLI style & formatting
* bump `changelog-parser` to 2.x
* bump `standard` to 3.x
* readme updates

## [1.1.4] - 2015-04-01
* improve preview style & formatting ([#15](https://github.com/ngoldman/gh-release/issues/15) & [#24](https://github.com/ngoldman/gh-release/pull/24))

## [1.1.3] - 2015-03-22
* Handle error when release number already exists on github

## [1.1.2] - 2015-03-09
* add `dry-run` and `workpath` options
* add a `get-defaults.js` test
* check if commit exists on github before trying to create release [#11](https://github.com/ngoldman/gh-release/issues/11)
* add support for git URLs [#16](https://github.com/ngoldman/gh-release/issues/16)

## [1.1.1] - 2015-03-02
* use `changelog-parser` for more reliable change log parsing

## [1.1.0] - 2015-03-01
* target node `0.12` and `iojs` on travis
* use docker and cache `node_modules` on travis
* add oauth2 token authentication method [#5](https://github.com/ngoldman/gh-release/issues/5)
* add `CONTRIBUTING.md`
* refactor getDefaults, cli
* fix error when in directories w/o `package.json` & `CHANGELOG.md` [#9](https://github.com/ngoldman/gh-release/issues/9)

## [1.0.8] - 2015-02-22
* fix for standard [#4](https://github.com/ngoldman/gh-release/issues/4)
* fix ordering in readme

## [1.0.7] - 2015-02-11
* add `standard` to dev dependencies
* add `.travis.yml` & badge for travis-ci
* improve cli usage info & move to top of readme
* add `files` to `package.json` for future build/zip/dist support

## [1.0.6] - 2015-02-08
* move `get-defaults.js` to `lib`
* improve usage info for cli
* improve defaults management in cli
* add proper target_commitish default

## [1.0.5] - 2015-02-08
* hotfix for help/usage in dir w/o `package.json` or `CHANGELOG.md`

## [1.0.4] - 2015-02-07
* remove `files` from `package.json` to fix cli again

## [1.0.3] - 2015-02-07
* actual fix for cli.. should work fine now
* allow `v` prefix for change log version names

## [1.0.2] - 2015-02-07
* hotfix for local requires in cli

## [1.0.1] - 2015-02-07
* add better options info to readme

## 1.0.0 - 2015-02-07
* create working prototype
* define basic node interface
* define basic cli interface

[1.1.7]: https://github.com/ngoldman/gh-release/compare/v1.1.6...v1.1.7
[1.1.6]: https://github.com/ngoldman/gh-release/compare/v1.1.5...v1.1.6
[1.1.5]: https://github.com/ngoldman/gh-release/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/ngoldman/gh-release/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/ngoldman/gh-release/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/ngoldman/gh-release/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/ngoldman/gh-release/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/ngoldman/gh-release/compare/v1.0.8...v1.1.0
[1.0.8]: https://github.com/ngoldman/gh-release/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/ngoldman/gh-release/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/ngoldman/gh-release/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/ngoldman/gh-release/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/ngoldman/gh-release/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/ngoldman/gh-release/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/ngoldman/gh-release/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/ngoldman/gh-release/compare/v1.0.0...v1.0.1
