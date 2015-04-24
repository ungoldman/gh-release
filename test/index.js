var path = require('path')
var test = require('tape')
var ghRelease = require('../')
var fixture = path.join.bind(null, __dirname, 'fixtures')

test('should return err if no authentication is provided', function (t) {
  t.plan(1)
  ghRelease({
    workpath: fixture('basic')
  }, function (err, result) {
    t.deepEqual(err, new Error('missing auth info'))
  })
})

test('should return error if changelog version !== package.json version', function (t) {
  t.plan(1)
  ghRelease({
    workpath: fixture('mismatch')
  }, function (err, result) {
    t.deepEqual(err, new Error('CHANGELOG.md out of sync with package.json (0.0.0 !== 0.0.1)'))
  })
})
