var fs = require('fs')
var path = require('path')
var pkg = require(path.resolve(process.cwd(), 'package.json'))

module.exports = function getDefaults () {
  var repoPath = pkg.repository.url.split('github.com/')[1].split('/')
  var owner = repoPath[0]
  var repo = repoPath[1].split('.git')[0]
  var logPath = path.resolve(process.cwd(), 'CHANGELOG.md')
  var log = fs.readFileSync(logPath, { encoding: 'utf-8' })
  var logVersion = log.split('## ')[1].split('\n')[0].split(' ')[0]

  if (logVersion.indexOf('v') === 0) logVersion = logVersion.slice(1)

  if (logVersion !== pkg.version) {
    var err = 'CHANGELOG.md out of sync with package.json'
    err += '(' + logVersion + ' !== ' + pkg.version + ')'
    throw new Error(err)
  }

  return {
    tag_name: 'v' + pkg.version,
    target_commitish: 'master',
    name: 'v' + pkg.version,
    body: log.split('## ')[1].split('\n').slice(1).join('\n'),
    owner: owner,
    repo: repo,
    draft: false,
    prerelease: false
  }
}
