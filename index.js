var getDefaults = require(__dirname + '/lib/get-defaults')
var extend = require('util')._extend
var GHAPI = require('github')
var chalk = require('chalk')
var wrap = require('word-wrap')
var size = require('window-size')
var client = new GHAPI({
  version: '3.0.0',
  headers: {
    'user-agent': 'gh-release'
  }
})
var inquirer = require('inquirer')
var questions = [
  {
    type: 'confirm',
    name: 'confirm',
    message: 'does this look right?',
    default: false,
    validate: function (input) {
      if (!input) return false
      return true
    }
  }
]

function justify (word) {
  var justifiedWord = word + ':'
  while (justifiedWord.length < 18) {
    justifiedWord += ' '
  }
  return justifiedWord
}

function indentBody (body) {
  var lines = wrap(body, {
    indent: '',
    width: size.width - 18
  })
  .split('\n')
  .filter(function (line) {
    return line !== ''
  })
  return lines.map(function (line, i) {
    if (i === 0) {
      return {column1: justify('body'), column2: line}
    } else {
      return {column1: '                  ', column2: line}
    }
  })
}

function formatOptions (options) {
  var prettyOptions = []
  var keys = Object.keys(options)
  keys.forEach(function (key) {
    var column1 = justify(key)
    if (key === 'body') {
      var body = indentBody(options.body)
      prettyOptions.push.apply(prettyOptions, body)
    } else {
      prettyOptions.push({column1: column1, column2: options[key]})
    }
  })
  return prettyOptions
}

function ghRelease (options, auth, callback) {
  if (auth && auth.token) {
    client.authenticate({
      type: 'oauth',
      token: auth.token
    })
  } else if (auth && auth.username && auth.password) {
    client.authenticate({
      type: 'basic',
      username: auth.username,
      password: auth.password
    })
  } else {
    return callback(new Error('missing auth info'))
  }

  getDefaults(options.workpath, function (err, defaults) {
    if (err) return callback(err)

    var releaseOptions = extend(defaults, options || {})
    var prettyOptions = formatOptions(releaseOptions)

    prettyOptions.forEach(function (option) {
      console.log(chalk.blue(option.column1) + chalk.green(option.column2))
    })
    console.log('')

    if (options.dryRun) process.exit(0)

    inquirer.prompt(questions, function (answers) {
      if (!answers.confirm) {
        console.log('release canceled')
        process.exit(0)
      }

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
          process.exit(1)
        } else {
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
              process.exit(1)
            }
            callback(null, res)
          })
        }
      })
    })
  })
}

module.exports = ghRelease
