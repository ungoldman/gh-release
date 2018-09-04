var chalk = require('chalk')
var extend = require('deep-extend')
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
  delete copy.yes
  delete copy.workpath

  var keys = Object.keys(copy).reverse()

  keys.forEach(function (key) {
    if (['assets', 'draft', 'prerelease'].indexOf(key) > -1) {
      if (!copy[key]) return
    }

    if (key === 'body') {
      var body = formatBody(copy.body)
      formatted.push.apply(formatted, body)
    } else {
      formatted.push({column1: justify(key), column2: copy[key]})
    }
  })

  return formatted
}

function formatBody (body) {
  var arr = []
  arr.push({ column1: justify('body'), column2: '' })
  arr.push({ column1: '', column2: '' })
  body.split('\n').map(function (line, i) {
    arr.push({ column1: '', column2: line })
  })
  return arr
}

function justify (word) {
  var justified = word + ':'
  while (justified.length < columnWidth) justified += ' '
  return justified
}

module.exports = preview
