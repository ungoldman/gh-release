var fs = require('fs')
var path = require('path')
var pkg = { version: null }
var log = {
  version: null,
  body: null
}
var owner = null
var repo = null
var version = null

module.exports = function getDefaults () {
  try {
    pkg = require(path.resolve(process.cwd(), 'package.json'))
    var repoPath = pkg.repository.url.split('github.com/')[1].split('/')
    owner = repoPath[0]
    repo = repoPath[1].split('.git')[0]
  } catch (e) {}

  try {
    var logPath = path.resolve(process.cwd(), 'CHANGELOG.md')
    log.src = fs.readFileSync(logPath, { encoding: 'utf-8' })
    log.version = log.src.split('## ')[1].split('\n')[0].split(' ')[0]
    if (log.version.indexOf('v') === 0) log.version = log.version.slice(1)
    log.body = log.src.split('## ')[1].split('\n').slice(1).join('\n')
  } catch (e) {}

  if (log.version !== pkg.version) {
    var err = 'CHANGELOG.md out of sync with package.json'
    err += '(' + log.version + ' !== ' + pkg.version + ')'
    throw new Error(err)
  }

  version = pkg.version ? 'v' + pkg.version : null

  return {
    tag_name: version,
    target_commitish: 'master',
    name: version,
    body: log.body,
    owner: owner,
    repo: repo,
    draft: false,
    prerelease: false
  }
}
