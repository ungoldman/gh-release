var extend = require('deep-extend')
var GHAPI = require('github')

var OPTIONS = {
  required: [
    'auth',
    'owner',
    'repo',
    'body',
    'target_commitish',
    'tag_name',
    'name'
  ],
  valid: [],
  defaults: {
    'dryRun': false,
    'draft': false,
    'prerelease': false,
    'workpath': process.cwd()
  },
  whitelist: [
    'auth',
    'owner',
    'repo',
    'body',
    'target_commitish',
    'tag_name',
    'name',
    'dryRun',
    'draft',
    'prerelease',
    'workpath'
  ]
}

// attempt to create release
// err if release already exists
// return release url

function Release (options, callback) {
  // validate release options

  var errors = validate(options)
  var err

  if (errors.missing.length) {
    err = new Error('missing required options: ' + errors.missing.join(', '))
    return callback(err)
  }

  if (errors.invalid.length) {
    err = new Error('invalid options: ' + errors.invalid.join(', '))
    return callback(err)
  }

  // create client

  var client = createClient(options)
  if (!client) return callback(new Error('missing auth info'))

  // check if commit exists on remote

  var commitOpts = {
    user: options.owner,
    repo: options.repo,
    sha: options.target_commitish
  }

  client.repos.getCommit(commitOpts, function (err, res) {
    if (err) {
      return callback(new Error('Target commitish "' + options.target_commitish +
        '" not found in ' + options.owner + '/' + options.repo))
    }

    var releaseOpts = prepOptions(options)

    if (options.dryRun) return callback(null, options)

    client.releases.createRelease(releaseOpts, function (err, res) {
      if (err) {
        var message = JSON.parse(err.message)
        var tagExists = (message.errors[0].code === 'already_exists')
        if (err.code === 422 && tagExists) {
          return callback(new Error('Release already exists for tag "' + options.tag_name +
            '" in ' + options.owner + '/' + options.repo))
        } else {
          return callback(err)
        }
      }

      callback(null, res)
    })
  })
}

function validate (options) {
  var missing = []
  var invalid = []

  function checkMissing (opt) {
    if (!options[opt]) missing.push(opt)
  }

  function validateInput (opt) {
    if (OPTIONS.valid[opt].indexOf(options[opt]) === -1) {
      invalid.push(opt)
    }
  }

  OPTIONS.required.forEach(checkMissing)
  Object.keys(OPTIONS.valid).forEach(validateInput)

  return {
    invalid: invalid,
    missing: missing
  }
}

function createClient (options) {
  var client = new GHAPI({
    version: '3.0.0',
    headers: { 'user-agent': 'gh-release' }
  })

  var auth = options.auth || {}
  var hasToken = auth && auth.token
  var hasUser = auth && auth.username
  var hasPass = auth && auth.password
  var hasBasic = hasUser && hasPass
  var authOptions

  if (!hasToken && !hasBasic) return false

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

  return client
}

function prepOptions (options) {
  var copy = extend({}, options)

  delete copy.auth

  return copy
}

Release.OPTIONS = OPTIONS
Release.validate = validate
Release.createClient = createClient

module.exports = Release
