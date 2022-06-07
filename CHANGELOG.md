# gh-release change log

All notable changes to this project will be documented in this file.

Project versioning adheres to [Semantic Versioning](http://semver.org/).
Commit convention is based on [Conventional Commits](http://conventionalcommits.org).
Change log format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased

### Misc
- removed npm scripts, dev dependencies, and source files related to deprecated doc site

## [6.0.4](https://github.com/ungoldman/gh-release/compare/v6.0.3...v6.0.4) - 2022-04-14

### Changed

- pkg(engines): set min node to 12
- deps: gauge@^v4.0.4 (#169)

### Misc
- minor (cosmetic) doc updates

## [6.0.3](https://github.com/ungoldman/gh-release/compare/v6.0.2...v6.0.3) - 2022-03-15

### Changed

- deps: rm chalk (#163)
- deps(dev): rm live-server, tap-spec, use serve (#162)

## [6.0.2](https://github.com/ungoldman/gh-release/compare/v6.0.1...v6.0.2) - 2022-03-14

**Note:** this repo has moved from https://github.com/hypermodules/gh-release to
https://github.com/ungoldman/gh-release. @ungoldman is the original author and
the same people that have been maintaining gh-release will continue to do so.
The move was made because the hypermodules org is being retired.

### Changed
- Repo ownership changed! Updated links. https://github.com/ungoldman/gh-release/pull/161
- Update gauge to ^4. https://github.com/ungoldman/gh-release/pull/147

## [6.0.1](https://github.com/ungoldman/gh-release/compare/v6.0.0...v6.0.1) - 2021-09-20

### Changed
- Re-read package.json when creating releases. https://github.com/ungoldman/gh-release/pull/137
- Update gauge to ^3. https://github.com/ungoldman/gh-release/pull/136

## [6.0.0](https://github.com/ungoldman/gh-release/compare/v5.0.2...v6.0.0) - 2021-05-20

### Changed
- BREAKING CHANGE: upgrade to Yargs 16. Node 10 is definitely EOL and not supported now.

## [5.0.2](https://github.com/ungoldman/gh-release/compare/v5.0.1...v5.0.2) - 2021-05-20

### Changed
- Roll back to yargs@16 due to introduced breaking changes.

## [5.0.1](https://github.com/ungoldman/gh-release/compare/v5.0.0...v5.0.1) - 2021-05-18

### Changed
- Allow unreleased CHANGELOG section if all subsections are empty (#128) - thanks @leviathan747

## [5.0.0](https://github.com/ungoldman/gh-release/compare/v4.0.5-beta.0...v5.0.0) - 2021-01-16

- A release of 4.0.5-beta.0 as a breaking change
- BREAKING CHANGE: new underlying request library (@octokit/rest) in use to fix edge case where releases would time out.
- No API changes, it should be safe to upgrade, but there is a risk of new bugs.  Please update at your convenience.

## [4.0.5-beta.0](https://github.com/ungoldman/gh-release/compare/v4.0.4...v4.0.5-beta.0) - 2020-12-04

- Replace `simple-get` with `@octokit/rest`. This should fix some spurious timeout bugs.
- Republish on correct npm channel.

## [4.0.4](https://github.com/ungoldman/gh-release/compare/v4.0.3...v4.0.4) - 2020-12-04

- Republish of 4.0.3 due to a bad beta version publish on the latest npm tag.

## [4.0.4-beta.0](https://github.com/ungoldman/gh-release/compare/v4.0.3...v4.0.4-beta.0) - 2020-12-04

- Replace `simple-get` with `@octokit/rest`. This should fix some spurious timeout bugs.

## [4.0.3](https://github.com/ungoldman/gh-release/compare/v4.0.2...v4.0.3) - 2020-09-30

- update-notifier version 5.0.0 (drops old node, and bugfixes)

## [4.0.2](https://github.com/ungoldman/gh-release/compare/v4.0.1...v4.0.2) - 2020-09-15

- Fix bad import path.

## [4.0.1](https://github.com/ungoldman/gh-release/compare/v4.0.0...v4.0.1) - 2020-09-15

- Replace `request` with `simple-get`.
- Roll back `gauge` version due to [upstream bug](https://github.com/npm/gauge/pull/126).
- Yargs updates.
- gh-release-assets 2.0.0
- Switch back to unforked ghauth.

## [4.0.0](https://github.com/ungoldman/gh-release/compare/v3.5.0...v4.0.0) - 2020-09-13

- Better error handling (#88) - thanks @jgravois
- Fix typos (#95) - thanks @jcfranco
- allow passing asset object as gh-release-assets supports #96 - thanks @jcfranco
- Update all dependencies #93 - thanks @bcomnes
- Support Github oAuth device flow and oAuth tokens #94 - thanks @bcomnes

BREAKING CHANGES:

- Remove support for Github basic (password) auth.
- Add support for oAuth [Device flow tokens](https://github.blog/changelog/2020-07-27-oauth-2-0-device-authorization-flow/).
- Existing tokens should still work fine.  Basic auth generated Personal Access tokens which will work as long as you don't revoke them.
- Updated dependencies bring with it newer Node.js requirements.  Run LTS or Latest.
- The `--endpoint` flag only works on Github Enterprise now.
- Github enterprise still uses basic auth, since it does not support the new device flow yet.

## [3.5.0](https://github.com/ungoldman/gh-release/compare/v3.4.0...v3.5.0) - 2019-02-14

### Features
- Add support for lerna (#85) - thanks @DrSensor

## [3.4.0](https://github.com/ungoldman/gh-release/compare/v3.3.4...v3.4.0) - 2018-10-10

### Features
- Add asset upload progress indicator (#80) - thanks @tjaneczko

## [3.3.4](https://github.com/ungoldman/gh-release/compare/v3.3.3...v3.3.4) - 2018-10-10

### Fixes
- Fix unhandled invalid repository URL error (#83) - thanks @tjaneczko

## [3.3.3](https://github.com/ungoldman/gh-release/compare/v3.3.2...v3.3.3) - 2018-10-08

### Fixes
- fix unhandled exception when changelog contains no versions (#81) - thanks @tjaneczko

## [3.3.2](https://github.com/ungoldman/gh-release/compare/v3.3.1...v3.3.2) - 2018-09-13

### Fixes
- use promise syntax for inquirer prompt (#79) - thanks @paulcpederson

## [3.3.1](https://github.com/ungoldman/gh-release/compare/v3.3.0...v3.3.1) - 2018-09-11

### Fixes
- deps(sec): inquirer@6, deep-extend@0.6 (#77) - thanks @paulcpederson

## [3.3.0](https://github.com/ungoldman/gh-release/compare/v3.2.3...v3.3.0) - 2018-09-04

### Additions
- `--yes` CLI option to skip the release confirmation prompt (#76)
- Support for reading the GitHub access token from the `GH_RELEASE_GITHUB_API_TOKEN` environment variable (#76)

## [3.2.3](https://github.com/ungoldman/gh-release/compare/v3.2.2...v3.2.3) - 2018-08-30

### Fixes
- Fix enterprise github auth (#74) - thanks @tjaneczko

## [3.2.2](https://github.com/ungoldman/gh-release/compare/v3.2.1...v3.2.2) - 2018-08-26

### Fixes
- Fix enterprise github API access (#73) - thanks @tjaneczko

## [3.2.1](https://github.com/ungoldman/gh-release/compare/v3.2.0...v3.2.1) - 2018-04-27

### Fixes
- update `request` dependency (#72)

## [3.2.0](https://github.com/ungoldman/gh-release/compare/v3.1.2...v3.2.0) - 2018-01-04

### Features
- allow empty unreleased section (#62) (#67) - thanks @jrmykolyn

## [3.1.2](https://github.com/ungoldman/gh-release/compare/v3.1.1...v3.1.2) - 2018-01-03

### Fixes
- catch 'bracketed' unreleased changelog entries (eg. '[Unreleased]') (#66) - thanks @jrmykolyn

## [3.1.1](https://github.com/ungoldman/gh-release/compare/v3.1.0...v3.1.1) - 2017-08-06

### Fixes
- fix: update outdated link in error message

### Changes
- docs(site): update old link, freshen up style
- docs(readme): shorten second feature line

## [3.1.0](https://github.com/ungoldman/gh-release/compare/v3.0.0...v3.1.0) - 2017-08-06

### Additions
- feat: add update notifier (#50)

### Fixes
- fix: error on unreleased (#43)
- fix: set default endpoint properly (#60) - thanks @roman0x58
- fix: warn when package.json url is out of date (#61) - thanks @jgravois

### Changes
- refactor: improve cli & usage output
- refactor: add default endpoint back for usage info
- docs(readme): update CLI usage, simplify link refs

## [3.0.0](https://github.com/ungoldman/gh-release/compare/v2.2.1...v3.0.0) - 2017-06-28

### Breaking Changes
- get defaults in Node API using same method as CLI - thanks @roman0x58

### Changes
- allow spaces between asset filenames - thanks @zeke

### Fixes
- fixed false positives in a couple of error equality tests - thanks @roman0x58
- updated repo URLs

## [2.2.1](https://github.com/ungoldman/gh-release/compare/v2.2.0...v2.2.1) - 2017-02-01

### Fixes

- bug: support `package.json` files where `repository` is a string ([#44](https://github.com/ungoldman/gh-release/issues/48)) - thanks @zeke

## [2.2.0](https://github.com/ungoldman/gh-release/compare/v2.1.0...v2.2.0) - 2016-12-03

### Additions

- feature: add support for Github Enterprise (use `endpoint` option) ([#44](https://github.com/ungoldman/gh-release/issues/44)) - thanks @henryhuang

### Miscellaneous

- site: add scripts for generating a gh-pages site

## [2.1.0](https://github.com/ungoldman/gh-release/compare/v2.0.3...v2.1.0) - 2016-07-01

### Changes

- Using `ghauth@^3.2.0` (better 2FA support). Config directory is now determined by [`application-config`](https://github.com/LinusU/node-application-config) and is OS-specific. You may want to delete your old config directory (`~/.config/gh-release`).

### Fixes

- Trap failed authentication ([#41](https://github.com/ungoldman/gh-release/pull/41))

## [2.0.3](https://github.com/ungoldman/gh-release/compare/v2.0.2...v2.0.3) - 2016-03-22

### Changes

- improve cli body preview
  * no word-wrap
  * no window-size
  * show newlines

### Fixes

- fix project URLs (ngoldman -> ungoldman)

## [2.0.2](https://github.com/ungoldman/gh-release/compare/v2.0.1...v2.0.2) - 2015-10-12

- Use the most recently released version when comparing versions ([#39](https://github.com/ungoldman/gh-release/pull/39))
- Set travis-ci to test builds on `0.10`, `0.12`, and `stable` ([#40](https://github.com/ungoldman/gh-release/pull/40))

## [2.0.1](https://github.com/ungoldman/gh-release/compare/v2.0.0...v2.0.1) - 2015-08-11

- if target commit returns a 404, throw error

## [2.0.0](https://github.com/ungoldman/gh-release/compare/v1.1.8...v2.0.0) - 2015-04-28

### Changes

- **breaking:** changed API parameters from `options, auth, callback` to `options, callback`
  * `auth` is now in `options` as `options.auth`
- moved all logging and CLI-related logic out of API and into CLI
- no longer uses the `node-github` client

### Additions

- `assets` option for uploading assets

## [1.1.8](https://github.com/ungoldman/gh-release/compare/v1.1.7...v1.1.8) - 2015-04-22

### Fixes

- exit process with code 1 on aborted release or invalid directory ([#31](https://github.com/ungoldman/gh-release/issues/31))

## [1.1.7](https://github.com/ungoldman/gh-release/compare/v1.1.6...v1.1.7) - 2015-04-07

### Fixes

- If cli is successful, should exit with code of 0

## [1.1.6](https://github.com/ungoldman/gh-release/compare/v1.1.5...v1.1.6) - 2015-04-03

- update demo
- update doc

## [1.1.5](https://github.com/ungoldman/gh-release/compare/v1.1.4...v1.1.5) - 2015-04-02

- more improvements to CLI style & formatting
- bump `changelog-parser` to 2.x
- bump `standard` to 3.x
- readme updates

## [1.1.4](https://github.com/ungoldman/gh-release/compare/v1.1.3...v1.1.4) - 2015-04-01

- improve preview style & formatting ([#15](https://github.com/ungoldman/gh-release/issues/15) & [#24](https://github.com/ungoldman/gh-release/pull/24))

## [1.1.3](https://github.com/ungoldman/gh-release/compare/v1.1.2...v1.1.3) - 2015-03-22

- Handle error when release number already exists on github

## [1.1.2](https://github.com/ungoldman/gh-release/compare/v1.1.1...v1.1.2) - 2015-03-09

- add `dry-run` and `workpath` options
- add a `get-defaults.js` test
- check if commit exists on github before trying to create release [#11](https://github.com/ungoldman/gh-release/issues/11)
- add support for git URLs [#16](https://github.com/ungoldman/gh-release/issues/16)

## [1.1.1](https://github.com/ungoldman/gh-release/compare/v1.1.0...v1.1.1) - 2015-03-02

- use `changelog-parser` for more reliable change log parsing

## [1.1.0](https://github.com/ungoldman/gh-release/compare/v1.0.8...v1.1.0) - 2015-03-01

- target node `0.12` and `iojs` on travis
- use docker and cache `node_modules` on travis
- add oauth2 token authentication method [#5](https://github.com/ungoldman/gh-release/issues/5)
- add `CONTRIBUTING.md`
- refactor getDefaults, cli
- fix error when in directories w/o `package.json` & `CHANGELOG.md` [#9](https://github.com/ungoldman/gh-release/issues/9)

## [1.0.8](https://github.com/ungoldman/gh-release/compare/v1.0.7...v1.0.8) - 2015-02-22

- fix for standard [#4](https://github.com/ungoldman/gh-release/issues/4)
- fix ordering in readme

## [1.0.7](https://github.com/ungoldman/gh-release/compare/v1.0.6...v1.0.7) - 2015-02-11

- add `standard` to dev dependencies
- add `.travis.yml` & badge for travis-ci
- improve cli usage info & move to top of readme
- add `files` to `package.json` for future build/zip/dist support

## [1.0.6](https://github.com/ungoldman/gh-release/compare/v1.0.5...v1.0.6) - 2015-02-08

- move `get-defaults.js` to `lib`
- improve usage info for cli
- improve defaults management in cli
- add proper target_commitish default

## [1.0.5](https://github.com/ungoldman/gh-release/compare/v1.0.4...v1.0.5) - 2015-02-08

- hotfix for help/usage in dir w/o `package.json` or `CHANGELOG.md`

## [1.0.4](https://github.com/ungoldman/gh-release/compare/v1.0.3...v1.0.4) - 2015-02-07

- remove `files` from `package.json` to fix cli again

## [1.0.3](https://github.com/ungoldman/gh-release/compare/v1.0.2...v1.0.3) - 2015-02-07

- actual fix for cli.. should work fine now
- allow `v` prefix for change log version names

## [1.0.2](https://github.com/ungoldman/gh-release/compare/v1.0.1...v1.0.2) - 2015-02-07

- hotfix for local requires in cli

## [1.0.1](https://github.com/ungoldman/gh-release/compare/v1.0.0...v1.0.1) - 2015-02-07

- add better options info to readme

## 1.0.0 - 2015-02-07

- create working prototype
- define basic node interface
- define basic cli interface
