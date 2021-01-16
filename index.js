const extend = require('deep-extend')
const format = require('util').format
const path = require('path')
const ghReleaseAssets = require('gh-release-assets')
const getDefaults = require('./bin/lib/get-defaults')
const Emitter = require('events').EventEmitter
const { Octokit } = require('@octokit/rest')

const clientId = '04dac3c40b7e49b11f38'

const OPTIONS = {
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
    dryRun: false,
    yes: false,
    draft: false,
    endpoint: 'https://api.github.com',
    prerelease: false,
    workpath: process.cwd()
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
    'yes',
    'draft',
    'endpoint',
    'prerelease',
    'workpath',
    'assets'
  ]
}

function Release (options, callback) {
  const emitter = new Emitter()
  if (options.cli) {
    _Release(options, emitter, callback)
    return emitter
  }
  const workpath = options.workpath || OPTIONS.defaults.workpath
  const isEnterprise = !!options.endpoint && options.endpoint !== OPTIONS.defaults.endpoint
  getDefaults(workpath, isEnterprise, function (err, defaults) {
    options = extend(defaults, options)
    if (err) {
      return callback(err)
    }
    return _Release(options, emitter, callback)
  })
  return emitter
}

// attempt to create release
// err if release already exists
// return release url
function _Release (options, emitter, callback) {
  // validate release options
  const errors = validate(options)
  let err
  if (errors.missing.length) {
    err = new Error('missing required options: ' + errors.missing.join(', '))
    return callback(err)
  }

  if (errors.invalid.length) {
    err = new Error('invalid options: ' + errors.invalid.join(', '))
    return callback(err)
  }

  // err if auth info not provided (token or user/pass)
  if (!getToken(options)) return callback(new Error('missing auth info'))

  const octokit = new Octokit({
    auth: getToken(options),
    baseUrl: options.endpoint
  })

  octokit.repos.getCommit({
    owner: options.owner,
    repo: options.repo,
    ref: options.target_commitish
  }).then(results => {
    if (options.dryRun) return callback(null, options)

    octokit.repos.createRelease({
      tag_name: options.tag_name,
      target_commitish: options.target_commitish,
      name: options.name,
      body: options.body,
      draft: options.draft,
      prerelease: options.prerelease,
      repo: options.repo,
      owner: options.owner
    }).then(results => {
      if (options.assets) {
        const assets = options.assets.map(function (asset) {
          if (typeof asset === 'object') {
            return {
              name: asset.name,
              path: path.join(options.workpath, asset.path)
            }
          }

          return path.join(options.workpath, asset)
        })

        const assetOptions = {
          url: results.data.upload_url,
          assets: assets
        }

        if (options.auth.token) {
          assetOptions.token = options.auth.token
        } else {
          assetOptions.auth = options.auth
        }

        const assetUpload = ghReleaseAssets(assetOptions, function (err) {
          if (err) return callback(err)
          return callback(null, results.data)
        })
        assetUpload.on('upload-asset', function (name) {
          emitter.emit('upload-asset', name)
        })
        assetUpload.on('upload-progress', function (name, progress) {
          emitter.emit('upload-progress', name, progress)
        })
        assetUpload.on('uploaded-asset', function (name) {
          emitter.emit('uploaded-asset', name)
        })
      } else {
        callback(null, results.data)
      }
    }).catch(err => {
      // Create Release error handling
      if (err.status === 404) {
        const notFoundError = new Error(format('404 Not Found.  Review gh-release oAuth Organization access: https://github.com/settings/connections/applications/%s', clientId))
        notFoundError.wrapped = err
        return callback(notFoundError)
      }
      if (err.errors) {
        if (err.errors[0].code !== 'already_exists') {
          return callback(err)
        }

        const errorMessage = format('Release already exists for tag %s in %s/%s', options.tag_name, options.owner, options.repo)
        return callback(new Error(errorMessage))
      }
      return callback(err)
    })
  }).catch(err => {
    // Check target error handling
    if (err.status === 404) {
      const errorMessage = format('Target commitish %s not found in %s/%s', options.target_commitish, options.owner, options.repo)
      return callback(new Error(errorMessage))
    } else {
      return callback(err)
    }
  })
}

function validate (options) {
  const missing = []
  const invalid = []

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

function getToken (options) {
  if (options.auth.token) {
    return options.auth.token
  } else if (options.auth.username && options.auth.password) {
    return options.auth
  } else {
    return false
  }
}

Release.OPTIONS = OPTIONS
Release.validate = validate
Release.clientId = clientId

module.exports = Release
