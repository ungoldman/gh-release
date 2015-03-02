var path = require('path')
var changelogParser = require('changelog-parser')
var exec = require('shelljs').exec

module.exports = function getDefaults (callback) {
  var pkg = require(path.resolve(process.cwd(), 'package.json'))
  var commit = getTargetCommitish()
  var repoPath = pkg.repository.url.split('github.com/')[1].split('/')
  var owner = repoPath[0]
  var repo = repoPath[1].split('.git')[0]
  var logPath = path.resolve(process.cwd(), 'CHANGELOG.md')

  changelogParser(logPath, function (err, result) {
    if (err) return callback(err)
    var log = result.versions[0]

    if (log.version !== pkg.version) {
      var errStr = 'CHANGELOG.md out of sync with package.json '
      errStr += '(' + log.version + ' !== ' + pkg.version + ')'
      return callback(new Error(errStr))
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
  })
}

function getTargetCommitish () {
  var commit = exec('git rev-parse HEAD', { silent: true }).output.split('\n')[0]
  if (commit.indexOf('fatal') === -1) return commit
  return 'master'
}
