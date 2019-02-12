var path = require('path')
var fs = require('fs')
var changelogParser = require('changelog-parser')
var exec = require('shelljs').exec
var parseRepo = require('github-url-to-object')

function getDefaults (workPath, isEnterprise, callback) {
  var pkg = require(path.resolve(workPath, 'package.json'))
  var lernaPath = path.resolve(workPath, 'lerna.json')

  if (!pkg.hasOwnProperty('repository')) {
    return callback(new Error('You must define a repository for your module => https://docs.npmjs.com/files/package.json#repository'))
  }

  var commit = getTargetCommitish()
  var repoParts = parseRepo(pkg.repository, {
    enterprise: isEnterprise
  })
  if (!repoParts) {
    return callback(new Error('The repository defined in your package.json is invalid => https://docs.npmjs.com/files/package.json#repository'))
  }
  var owner = repoParts.user
  var repo = repoParts.repo
  var logPath = path.resolve(workPath, 'CHANGELOG.md')

  changelogParser(logPath, function (err, result) {
    if (err) return callback(err)

    // check for 'unreleased' section in CHANGELOG: allow sections which do not include a body (eg. 'Added', 'Changed', etc.)

    var unreleased = result.versions.filter(function (release) {
      return release.title && release.title.toLowerCase
        ? release.title.toLowerCase().indexOf('unreleased') !== -1
        : false
    }).filter(function (release) {
      return !!release.body
    })

    if (unreleased.length > 0) {
      return callback(new Error('Unreleased changes detected in CHANGELOG.md, aborting'))
    }

    var log = result.versions.filter(function (release) { return release.version !== null })[0]

    if (!log) {
      return callback(new Error('CHANGELOG.md does not contain any versions'))
    }

    var lerna = {}
    if (fs.existsSync(lernaPath)) {
      lerna = require(lernaPath) /* || {} */ // 👈 though I prefer this expression
      if (log.version !== lerna.version) {
        var errStr = 'CHANGELOG.md out of sync with lerna.json '
        errStr += '(' + (log.version || log.title) + ' !== ' + lerna.version + ')'
        return callback(new Error(errStr))
      }
    } else if (log.version !== pkg.version) {
      errStr = 'CHANGELOG.md out of sync with package.json '
      errStr += '(' + (log.version || log.title) + ' !== ' + pkg.version + ')'
      return callback(new Error(errStr))
    }

    var version = pkg.version ? 'v' + pkg.version : lerna.version ? 'v' + lerna.version : null

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
  var commit = exec('git rev-parse HEAD', { silent: true }).output.split('\n')[0]
  if (commit.indexOf('fatal') === -1) return commit
  return 'master'
}

module.exports = getDefaults
module.exports.getTargetCommitish = getTargetCommitish
