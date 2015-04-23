var chalk = require('chalk')
var extend = require('deep-extend')
var size = require('window-size')
var wrap = require('word-wrap')
var columnWidth = 20

function preview (options) {
  var intro = '\ncreating release ' + chalk.bold(options.tag_name) +
    ' for ' + chalk.bold(options.owner + '/' + options.repo) + '\n'
  var prettyOptions = formatOptions(options)

  console.log(intro)

  prettyOptions.forEach(function (option) {
    console.log(chalk.cyan(option.column1) + option.column2)
  })

  console.log('')
}

function formatOptions (options) {
  var formatted = []
  var copy = extend({}, options)

  delete copy.auth
  delete copy.owner
  delete copy.repo
  delete copy.dryRun
  delete copy.workpath

  var keys = Object.keys(copy).reverse()

  keys.forEach(function (key) {
    if (key === 'body') {
      var body = indentBody(copy.body)
      formatted.push.apply(formatted, body)
    } else {
      formatted.push({column1: justify(key), column2: copy[key]})
    }
  })

  return formatted
}

function indentBody (body) {
  var lines = wrap(body, {
    indent: '',
    width: size.width - columnWidth
  })
    .split('\n')
    .filter(function (line) {
      return line !== ''
    })

  return lines.map(function (line, i) {
    if (i === 0) {
      return { column1: justify('body'), column2: line }
    } else {
      return { column1: new Array(columnWidth + 1).join(' '), column2: line }
    }
  })
}

function justify (word) {
  var justified = word + ':'
  while (justified.length < columnWidth) justified += ' '
  return justified
}

module.exports = preview
