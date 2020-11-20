#!/usr/bin/env node

const extend = require('deep-extend')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const ghauth = require('ghauth')
const inquirer = require('inquirer')
const ghRelease = require('../')
const getDefaults = require('./lib/get-defaults')
const preview = require('./lib/preview')
const yargs = require('./lib/yargs')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const Gauge = require('gauge')
const argv = yargs.argv

// notify of update if needed

updateNotifier({ pkg: pkg }).notify()

// check dir

const pkgExists = fs.existsSync(path.resolve(argv.workpath, 'package.json'))
const logExists = fs.existsSync(path.resolve(argv.workpath, 'CHANGELOG.md'))

if (!pkgExists || !logExists) {
  console.log('Must be run in a directory with package.json and CHANGELOG.md')
  yargs.showHelp()
  process.exit(1)
}

const isEnterprise = !!argv.endpoint && argv.endpoint !== 'https://api.github.com'

// get auth

const ghauthOpts = {
  clientId: ghRelease.clientId,
  configName: 'gh-release',
  scopes: ['repo'],
  note: 'gh-release',
  userAgent: 'gh-release',
  authUrl: isEnterprise ? argv.endpoint.replace(/\/+$/, '') + '/authorizations' : null
}

if (argv.assets) {
  argv.assets = argv.assets.split(',').map(function (asset) {
    return asset.trim()
  })
}

if (process.env.GH_RELEASE_GITHUB_API_TOKEN) {
  releaseWithAuth({
    token: process.env.GH_RELEASE_GITHUB_API_TOKEN
  })
} else {
  ghauth(ghauthOpts).then(function (auth) {
    releaseWithAuth(auth)
  }).catch(function (err) {
    return handleError(err)
  })
}

function releaseWithAuth (auth) {
  const options = {}
  options.auth = auth
  options.cli = true
  // get defaults

  getDefaults(argv.workpath, isEnterprise, function getDefaultsCallback (err, defaults) {
    if (err) return handleError(err)

    // merge defaults and command line arguments into options

    extend(options, defaults, argv)

    // filter options through whitelist

    const whitelist = ghRelease.OPTIONS.whitelist

    Object.keys(options).forEach(function (key) {
      if (whitelist.indexOf(key) === -1) delete options[key]
    })

    // @TODO: prompt for user options if mode is interactive
    // if (argv.interactive) {
    //   var questions = []
    // }

    // show preview

    preview(options)

    // exit 0 if dry run

    if (options.dryRun) process.exit(0)

    if (options.yes) {
      return performRelease(options)
    }
    // confirm & release

    const confirmation = [{
      type: 'confirm',
      name: 'confirm',
      message: 'publish release to github?',
      default: false,
      validate: function (input) {
        if (!input) return false
        return true
      }
    }]

    inquirer.prompt(confirmation).then(function (answers) {
      if (!answers.confirm) return process.exit(1)
      performRelease(options)
    })
  })
}

function performRelease (options) {
  // pass options to api

  const release = ghRelease(options, function ghReleaseCallback (err, result) {
    // handle errors
    if (err) return handleError(err)

    if (result.message === 'Moved Permanently') {
      console.error('repository url in package.json is out of date and requires a redirect')
      process.exit(1)
    }

    if (!result || !result.html_url) {
      console.error('missing result info')
      process.exit(1)
    }

    // log release url & exit 0
    console.log(result.html_url)
    process.exit(0)
  })
  const gauge = new Gauge(process.stderr, {
    updateInterval: 50,
    theme: 'colorBrailleSpinner'
  })
  release.on('upload-asset', function (name) {
    gauge.show(name + ': 0.0%', 0)
  })
  release.on('upload-progress', function (name, progress) {
    gauge.show(name + ': ' + progress.percentage.toFixed(1) + '% ETA: ' + progress.eta + 's', progress.percentage / 100)
    gauge.pulse()
  })
  release.on('uploaded-asset', function (name) {
    gauge.hide()
    console.log('Uploaded ' + name)
  })
}

function handleError (err) {
  const msg = err.message || JSON.stringify(err, null, 2)
  console.log(chalk.red(msg))
  process.exit(1)
}
