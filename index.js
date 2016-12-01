var extend = require('deep-extend')
var request = require('request')
var format = require('util').format
var url = require('url')
var path = require('path')
var ghReleaseAssets = require('gh-release-assets')

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
    'endpoint': 'https://api.github.com',
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
    'endpoint',
    'prerelease',
    'workpath',
    'assets'
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

  // err if auth info not provided (token or user/pass)
  if (!getAuth(options)) return callback(new Error('missing auth info'))

  var commitOptsPath = format('/repos/%s/%s/commits/%s', options.owner, options.repo, options.target_commitish)
  var commitOptsUri = url.resolve(options.endpoint, commitOptsPath)

  // check if commit exists on remote
  var commitOpts = extend(getAuth(options), {
    method: 'GET',
    uri: commitOptsUri
  })

  request(commitOpts, function (err, res, body) {
    if (err || res.statusCode === 404) {
      var errorMessage = format('Target commitish %s not found in %s/%s', options.target_commitish, options.owner, options.repo)
      return callback(new Error(errorMessage))
    }

    var releaseOptsPath = format('/repos/%s/%s/releases', options.owner, options.repo)
    var releaseOptsUri = url.resolve(options.endpoint, releaseOptsPath)

    var releaseOpts = extend(getAuth(options), {
      uri: releaseOptsUri,
      body: {
        tag_name: options.tag_name,
        target_commitish: options.target_commitish,
        name: options.name,
        body: options.body,
        draft: options.draft,
        prerelease: options.prerelease,
        repo: options.repo,
        owner: options.owner
      }
    })

    if (options.dryRun) return callback(null, options)

    request(releaseOpts, function (err, res, body) {
      if (err) {
        return callback(err)
      }

      if (body.errors) {
        if (body.errors[0].code !== 'already_exists') {
          return callback(body.errors)
        }

        var errorMessage = format('Release already exists for tag %s in %s/%s', options.tag_name, options.owner, options.repo)
        return callback(new Error(errorMessage))
      }

      if (body.message === 'Bad credentials') {
        return callback(new Error('GitHub says password is no beuno. please clear your cache manually. https://github.com/ungoldman/gh-release#config-location'))
      }

      if (options.assets) {
        var assets = options.assets.map(function (asset) {
          return path.join(options.workpath, asset)
        })

        var assetOptions = {
          url: body.upload_url,
          assets: assets
        }

        if (options.auth.token) {
          assetOptions.token = options.auth.token
        } else {
          assetOptions.auth = options.auth
        }

        ghReleaseAssets(assetOptions, function (err) {
          if (err) return callback(err)
          return callback(null, body)
        })
      } else {
        callback(null, body)
      }
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

function getAuth (options) {
  var defaultRequest = {
    method: 'POST',
    json: true,
    headers: {
      'User-Agent': 'gh-release'
    }
  }

  if (options.auth.token) {
    defaultRequest.headers.Authorization = 'token ' + options.auth.token
  } else if (options.auth.username && options.auth.password) {
    defaultRequest.auth = options.auth
  } else {
    return false
  }

  return defaultRequest
}

Release.OPTIONS = OPTIONS
Release.validate = validate

module.exports = Release
