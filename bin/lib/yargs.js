var version
try {
  version = require('../../lerna.json').version
} catch (_) {
  version = require('../../package.json').version
}

module.exports = require('yargs')
  .usage('Usage: $0 [options]')
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
    'w': {
      alias: 'workpath',
      type: 'string',
      default: process.cwd(),
      describe: 'path to working directory'
    },
    'e': {
      alias: 'endpoint',
      type: 'string',
      default: 'https://api.github.com',
      describe: 'GitHub API endpoint URL'
    },
    'a': {
      alias: 'assets',
      type: 'string',
      default: false,
      describe: 'comma-delimited list of assets to upload'
    },
    'dry-run': {
      type: 'boolean',
      default: false,
      describe: 'dry run (stops before release step)'
    },
    'y': {
      alias: 'yes',
      type: 'boolean',
      default: false,
      describe: 'bypass confirmation prompt for release'
    }
  })
  .example('$0 -n v' + version + ' -c master -d', 'create a draft release with title v' + version + ' tagged at HEAD of master')
  .help('h')
  .alias('h', 'help')
  .version(version + '\n', 'v')
  .alias('v', 'version')
