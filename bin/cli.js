#!/usr/bin/env node

var ghRelease = require(__dirname + '/../')
var getDefaults = require(__dirname + '/../lib/get-defaults')
var extend = require('util')._extend
var fs = require('fs')
var ghauth = require('ghauth')
var path = require('path')
var authOptions = {
  configName: 'gh-release',
  scopes: ['repo'],
  note: 'gh-release',
  userAgent: 'gh-release'
}
var yargs = require('yargs')
  .usage('Usage: $0 -t [tag_name] -c [commit] -n [name] -b [body] -o [owner] -r [repo] -d -p')
  .options({
    't': {
      alias: 'tag_name',
      type: 'string',
      describe: 'tag for this release'
    },
    'c': {
      alias: 'target_commitish',
      type: 'string',
      describe: 'commitish value for tag'
    },
    'n': {
      alias: 'name',
      type: 'string',
      describe: 'text of release title'
    },
    'b': {
      alias: 'body',
      type: 'string',
      describe: 'text of release body'
    },
    'o': {
      alias: 'owner',
      describe: 'repo owner'
    },
    'r': {
      alias: 'repo',
      describe: 'repo name'
    },
    'd': {
      alias: 'draft',
      type: 'boolean',
      default: false,
      describe: 'publish as draft'
    },
    'p': {
      alias: 'prerelease',
      type: 'boolean',
      default: false,
      describe: 'publish as prerelease'
    },
    'dry-run': {
      type: 'boolean',
      default: false
    },
    'w': {
      alias: 'workpath',
      type: 'string',
      default: process.cwd(),
      describe: 'path to working directory'
    }
  })
  .help('h')
  .alias('h', 'help')
  .version(require(__dirname + '/../package.json').version + '\n', 'v')
  .alias('v', 'version')

var argv = yargs.argv
var auth

checkDir(argv.workpath)

function checkDir (workpath) {
  var pkgExists = fs.existsSync(path.resolve(workpath, 'package.json'))
  var logExists = fs.existsSync(path.resolve(workpath, 'CHANGELOG.md'))

  if (!pkgExists || !logExists) {
    console.log('Must be run in a directory with package.json and CHANGELOG.md')
    yargs.showHelp()
    process.exit(0)
  }

  authenticate()
}

function authenticate () {
  ghauth(authOptions, function (err, authInfo) {
    if (err) handleError(err)
    auth = authInfo
    getDefaults(argv.workpath, handleDefaults)
  })
}

function handleDefaults (err, defaults) {
  if (err) handleError(err)

  var whitelist = Object.keys(defaults)
  var options = extend(defaults, argv)

  Object.keys(options).forEach(function (key) {
    if (whitelist.indexOf(key) === -1)
      delete options[key]
  })

  ghRelease(options, auth, handleRelease)
}

function handleRelease (err, result) {
  if (err) handleError(err)

  if (!result || !result.html_url) {
    console.error('missing result info')
    process.exit(1)
  }

  console.log(result.html_url)
}

function handleError (err) {
  console.error(err)
  process.exit(1)
}
