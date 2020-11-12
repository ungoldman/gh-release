const path = require('path')
const fs = require('fs')
const changelogParser = require('changelog-parser')
const exec = require('shelljs').exec
const parseRepo = require('github-url-to-object')

function getDefaults (workPath, isEnterprise, callback) {
  const pkg = require(path.resolve(workPath, 'package.json'))
  const lernaPath = path.resolve(workPath, 'lerna.json')

  if (!Object.hasOwnProperty.call(pkg, 'repository')) {
    return callback(new Error('You must define a repository for your module => https://docs.npmjs.com/files/package.json#repository'))
  }

  const commit = getTargetCommitish()
  const repoParts = parseRepo(pkg.repository, {
    enterprise: isEnterprise
  })
  if (!repoParts) {
    return callback(new Error('The repository defined in your package.json is invalid => https://docs.npmjs.com/files/package.json#repository'))
  }
  const owner = repoParts.user
  const repo = repoParts.repo
  const logPath = path.resolve(workPath, 'CHANGELOG.md')

  changelogParser(logPath, function (err, result) {
    if (err) return callback(err)

    // check for 'unreleased' section in CHANGELOG: allow sections which do not include a body (eg. 'Added', 'Changed', etc.)

    const unreleased = result.versions.filter(function (release) {
      return release.title && release.title.toLowerCase
        ? release.title.toLowerCase().indexOf('unreleased') !== -1
        : false
    }).filter(function (release) {
      return !!release.body
    })

    if (unreleased.length > 0) {
      return callback(new Error('Unreleased changes detected in CHANGELOG.md, aborting'))
    }

    const log = result.versions.filter(function (release) { return release.version !== null })[0]

    if (!log) {
      return callback(new Error('CHANGELOG.md does not contain any versions'))
    }

    let lerna = {}
    let errStr
    if (fs.existsSync(lernaPath)) {
      lerna = require(lernaPath) /* || {} */ // 👈 though I prefer this expression
      if (log.version !== lerna.version) {
        errStr = 'CHANGELOG.md out of sync with lerna.json '
        errStr += '(' + (log.version || log.title) + ' !== ' + lerna.version + ')'
        return callback(new Error(errStr))
      }
    } else if (log.version !== pkg.version) {
      errStr = 'CHANGELOG.md out of sync with package.json '
      errStr += '(' + (log.version || log.title) + ' !== ' + pkg.version + ')'
      return callback(new Error(errStr))
    }

    const version = pkg.version ? 'v' + pkg.version : lerna.version ? 'v' + lerna.version : null

    callback(null, {
      body: log.body,
      assets: false,
      owner: owner,
      repo: repo,
      dryRun: false,
      yes: false,
      endpoint: 'https://api.github.com',
      workpath: process.cwd(),
      prerelease: false,
      draft: false,
      target_commitish: commit,
      tag_name: version,
      name: version
    })
  })
}

function getTargetCommitish () {
  const commit = exec('git rev-parse HEAD', { silent: true }).split('\n')[0]
  if (commit.indexOf('fatal') === -1) return commit
  return 'master'
}

module.exports = getDefaults
module.exports.getTargetCommitish = getTargetCommitish
