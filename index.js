var defaults = require('./get-defaults')()
var extend = require('util')._extend
var GHAPI = require('github')
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

function ghRelease (options, auth, callback) {
  if (!auth) return callback(new Error('Missing auth info'))
  if (!auth.username) return callback(new Error('Missing auth.username'))
  if (!auth.password) return callback(new Error('Missing auth.password'))

  client.authenticate({
    type: 'basic',
    username: auth.username,
    password: auth.password
  })

  options = extend(defaults, options || {})

  console.log(options)

  inquirer.prompt(questions, function (answers) {
    if (!answers.confirm) {
      console.log('release canceled')
      process.exit(0)
    }

    client.releases.createRelease(options, function(err, res) {
      if (err) throw err
      callback(null, res)
    })
  })
}

module.exports = ghRelease
