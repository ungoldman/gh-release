module.exports = ghRelease

var getDefaults = require(__dirname + '/lib/get-defaults')
var extend = require('util')._extend
var GHAPI = require('github')
var chalk = require('chalk')
var wrap = require('word-wrap')
var size = require('window-size')
var client = new GHAPI({
  version: '3.0.0',
  headers: { 'user-agent': 'gh-release' }
})
var inquirer = require('inquirer')
var columnWidth = 20
var questions = [
  {
    type: 'confirm',
    name: 'confirm',
    message: 'publish release to github?',
    default: false,
    validate: function (input) {
      if (!input) return false
      return true
    }
  }
]

function ghRelease (options, auth, callback) {
  var hasToken = auth && auth.token
  var hasUser = auth && auth.username
  var hasPass = auth && auth.password
  var hasBasic = hasUser && hasPass
  var authOptions

  if (!hasToken && !hasBasic) return callback(new Error('missing auth info'))

  if (hasToken) {
    authOptions = {
      type: 'oauth',
      token: auth.token
    }
  } else {
    authOptions = {
      type: 'basic',
      username: auth.username,
      password: auth.password
    }
  }

  client.authenticate(authOptions)

  getDefaults(options.workpath, function (err, defaults) {
    if (err) return callback(err)

    var releaseOptions = extend(defaults, options || {})

    showPreview(releaseOptions)

    if (options.dryRun) process.exit(0)

    inquirer.prompt(questions, function (answers) {
      if (!answers.confirm) return process.exit(0)

      var checkCommitForm = {
        user: releaseOptions.owner,
        repo: releaseOptions.repo,
        sha: releaseOptions.target_commitish
      }

      client.repos.getCommit(checkCommitForm, function (err, res) {
        if (err) {
          console.log('Couldn\'t find the target commit on GitHub.')
          console.log('Make sure you\'ve pushed everything up to ' + releaseOptions.owner + '/' + releaseOptions.repo + ' and try again')
          console.log('Target commit: ' + releaseOptions.target_commitish)
          return process.exit(1)
        }

        client.releases.createRelease(releaseOptions, function (err, res) {
          if (err) {
            var message = JSON.parse(err.message)
            var tagExists = (message.errors[0].code === 'already_exists')
            if (err.code === 422 && tagExists) {
              console.log('A release already exists for the tag ' + releaseOptions.tag_name)
              console.log('Try bumping the version in your package.json.\nThen push to ' + releaseOptions.owner + '/' + releaseOptions.repo + ' and try again.')
            } else {
              console.error(err)
            }
            return process.exit(1)
          }

          callback(null, res)
        })
      })
    })
  })
}

function showPreview (opts) {
  var intro = '\ncreating release ' + chalk.bold(opts.tag_name) +
    ' for ' + chalk.bold(opts.owner + '/' + opts.repo) + '\n'
  var prettyOptions = formatOptions(opts)

  console.log(intro)

  prettyOptions.forEach(function (option) {
    console.log(chalk.cyan(option.column1) + option.column2)
  })

  console.log('')
}

function formatOptions (options) {
  var opts = extend({}, options)

  delete opts.owner
  delete opts.repo
  delete opts.dryRun
  delete opts.workpath

  var prettyOptions = []
  var keys = Object.keys(opts)

  keys.forEach(function (key) {
    var column1 = justify(key)
    if (key === 'body') {
      var body = indentBody(opts.body)
      prettyOptions.push.apply(prettyOptions, body)
    } else {
      prettyOptions.push({column1: column1, column2: opts[key]})
    }
  })

  return prettyOptions
}

function indentBody (body) {
  var lines = wrap(body, {
      indent: '',
      width: size.width - columnWidth
    })
    .split('\n')
    .filter(function (line) {
      return line !== ''
    })

  return lines.map(function (line, i) {
    if (i === 0) {
      return { column1: justify('body'), column2: line }
    } else {
      return { column1: new Array(columnWidth + 1).join(' '), column2: line }
    }
  })
}

function justify (word) {
  var justifiedWord = word + ':'
  while (justifiedWord.length < columnWidth) justifiedWord += ' '
  return justifiedWord
}
