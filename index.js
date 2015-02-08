var fs = require('fs')
var extend = require('util')._extend
var pkg = require('./package.json')
var request = require('request')
var baseUrl = 'https://api.github.com'

module.exports = function (options, callback) {
  var reqOptions = {
    uri: buildCreateUri(),
    method: 'POST',
    json: extend(getDefaults(), options || {}),
    headers: {
      'User-Agent': 'gh-release'
    }
  }

  console.log(reqOptions)

  request.post(reqOptions, function (error, response, body) {
    console.log(error, response.statusCode, body)

    if (error) return callback(error)

    if (!error && response.statusCode == 201) {
      callback(null, body)
    } else {
      callback(new Error(response.statusCode + ' ' + body))
    }
  })
}

function getDefaults () {
  var log = fs.readFileSync('./CHANGELOG.md', { encoding: 'utf-8' })

  return {
    tag_name: 'v' + pkg.version,
    target_commitish: 'master',
    name: 'v' + pkg.version,
    body: log.split('## ')[1].split('\n').slice(1).join('\n'),
    draft: true,
    prerelease: true
  }
}

function buildCreateUri () {
  var path = pkg.repository.url.split('github.com/')[1].split('/')
  var owner = path[0]
  var repo = path[1].split('.git')[0]
  var uri = baseUrl + '/repos/' + owner + '/' + repo + '/releases'

  return uri
}
