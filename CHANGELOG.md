# gh-release changelog

## 1.1.0 - 2015-03-01
* target node `0.12` and `iojs` on travis
* user docker and cache `node_modules` on travis
* add oauth2 token authentication method [#5](https://github.com/ngoldman/gh-release/issues/5)
* add `CONTRIBUTING.md`
* refactor getDefaults, cli
* fix error when in directories w/o package.json & CHANGELOG.md [#9](https://github.com/ngoldman/gh-release/issues/9)

## 1.0.8 - 2015-02-22
* fix for standard [#4](https://github.com/ngoldman/gh-release/issues/4)
* fix ordering in readme

## 1.0.7 - 2015-02-11
* add `standard` to dev dependencies
* add `.travis.yml` & badge for travis-ci
* improve cli usage info & move to top of readme
* add `files` to `package.json` for future build/zip/dist support

## 1.0.6 - 2015-02-08
* move `get-defaults.js` to `lib`
* improve usage info for cli
* improve defaults management in cli
* add proper target_commitish default

## 1.0.5 - 2015-02-08
* hotfix for help/usage in dir w/o `package.json` or `CHANGELOG.md`

## 1.0.4 - 2015-02-07
* remove `files` from `package.json` to fix cli again

## 1.0.3 - 2015-02-07
* actual fix for cli.. should work fine now
* allow `v` prefix for changelog version names

## 1.0.2 - 2015-02-07
* hotfix for local requires in cli

## 1.0.1 - 2015-02-07
* add better options info to readme

## 1.0.0 - 2015-02-07
* create working prototype
* define basic node interface
* define basic cli interface
