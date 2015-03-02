var fs = require('fs')
var path = require('path')
var exec = require('shelljs').exec
var semver = /\[?v?([\w\d\.-]+\.[\w\d\.-]+[a-zA-Z0-9])\]?/

module.exports = function getDefaults (callback) {
  var pkg = require(path.resolve(process.cwd(), 'package.json'))
  var commit = getTargetCommitish()
  var repoPath = pkg.repository.url.split('github.com/')[1].split('/')
  var owner = repoPath[0]
  var repo = repoPath[1].split('.git')[0]
  var log = getChangelog()

  if (log.version !== pkg.version) {
    var err = 'CHANGELOG.md out of sync with package.json '
    err += '(' + log.version + ' !== ' + pkg.version + ')'
    return callback(new Error(err))
  }

  var version = pkg.version ? 'v' + pkg.version : null

  callback(null, {
    tag_name: version,
    target_commitish: commit,
    name: version,
    body: log.body,
    owner: owner,
    repo: repo,
    draft: false,
    prerelease: false
  })
}

function getTargetCommitish () {
  var commit = exec('git rev-parse HEAD', { silent: true }).output.split('\n')[0]
  if (commit.indexOf('fatal') === -1) return commit
  return 'master'
}

function getChangelog () {
  var log = {}
  var logPath = path.resolve(process.cwd(), 'CHANGELOG.md')

  log.src = fs.readFileSync(logPath, { encoding: 'utf-8' })
  log.version = log.src.split('## ')[1].split('\n')[0].split(' ')[0]
  log.body = log.src.split('## ')[1].split('\n').slice(1).join('\n')

  var isSemver = semver.exec(log.version)
  if (isSemver) log.version = isSemver[1]

  return log
}
