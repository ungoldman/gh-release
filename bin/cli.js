#!/usr/bin/env node

var ghRelease = require('..')
var defaults = require('../get-defaults')()
var argv = require('yargs')
  .usage('Usage: $0 [options]')
  .options({
    't': {
      alias: 'tag_name',
      default: defaults.tag_name
    },
    'c': {
      alias: 'target_commitish',
      default: defaults.target_commitish
    },
    'n': {
      alias: 'name',
      default: defaults.name
    },
    'b': {
      alias: 'body',
      default: defaults.body
    },
    'o': {
      alias: 'owner',
      default: defaults.owner
    },
    'r': {
      alias: 'repo',
      default: defaults.repo
    },
    'd': {
      alias: 'draft',
      default: defaults.draft
    },
    'p': {
      alias: 'prerelease',
      default: defaults.prerelease
    }
  })
  .help('h')
  .alias('h', 'help')
  .version(require('../package.json').version + '\n', 'v')
  .alias('v', 'version')
  .argv

var inquirer = require('inquirer')
var questions = [
  {
    type: 'input',
    name: 'username',
    message: 'github username',
    validate: function (input) {
      if (!input) return false
      return true
    }
  },
  {
    type: 'password',
    name: 'password',
    message: 'github password',
    validate: function (input) {
      if (!input) return false
      return true
    }
  }
]

var options = {
  tag_name: argv.t,
  target_commitish: argv.c,
  name: argv.n,
  body: argv.b,
  owner: argv.o,
  repo: argv.r,
  draft: argv.d,
  prerelease: argv.p
}

inquirer.prompt(questions, function (auth) {
  ghRelease(options, auth, function (err, result) {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    if (!result || !result.html_url) {
      console.error('unknown error')
    }

    console.log(result.html_url)
  })
})
