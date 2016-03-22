#!/usr/bin/env node

var extend = require('deep-extend')
var fs = require('fs')
var path = require('path')
var chalk = require('chalk')
var ghauth = require('ghauth')
var inquirer = require('inquirer')
var ghRelease = require('../')
var getDefaults = require('./lib/get-defaults')
var preview = require('./lib/preview')
var yargs = require('./lib/yargs')
var argv = yargs.argv

// check dir

var pkgExists = fs.existsSync(path.resolve(argv.workpath, 'package.json'))
var logExists = fs.existsSync(path.resolve(argv.workpath, 'CHANGELOG.md'))

if (!pkgExists || !logExists) {
  console.log('Must be run in a directory with package.json and CHANGELOG.md')
  yargs.showHelp()
  process.exit(1)
}

// get auth

var ghauthOpts = {
  configName: 'gh-release',
  scopes: ['repo'],
  note: 'gh-release',
  userAgent: 'gh-release'
}

if (argv.assets) {
  argv.assets = argv.assets.split(',')
}

ghauth(ghauthOpts, function (err, auth) {
  if (err) return handleError(err)

  var options = {}
  options.auth = auth

  // get defaults

  getDefaults(argv.workpath, function getDefaultsCallback (err, defaults) {
    if (err) return handleError(err)

    // merge defaults and command line arguments into options

    extend(options, defaults, argv)

    // filter options through whitelist

    var whitelist = ghRelease.OPTIONS.whitelist

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

    // confirm & release

    var confirmation = [{
      type: 'confirm',
      name: 'confirm',
      message: 'publish release to github?',
      default: false,
      validate: function (input) {
        if (!input) return false
        return true
      }
    }]

    inquirer.prompt(confirmation, function (answers) {
      if (!answers.confirm) return process.exit(1)

      // pass options to api

      ghRelease(options, function ghReleaseCallback (err, result) {
        // handle errors
        if (err) return handleError(err)

        if (!result || !result.html_url) {
          console.error('missing result info')
          process.exit(1)
        }

        // log release url & exit 0
        console.log(result.html_url)
        process.exit(0)
      })
    })
  })
})

function handleError (err) {
  var msg = err.msg || err
  console.log(chalk.red(msg))
  process.exit(1)
}
