var test = require('tape')
var tmp = require('tmp')
var gits = require('quick-gits')
var rimraf = require('rimraf')

var getDefaults = require('../bin/lib/get-defaults')

var tmpDir
var repo
var remote = 'https://github.com/bcomnes/gh-release-test.git'
// var remotePath

test('Set up test environment', function (t) {
  t.plan(2)
  tmpDir = tmp.dirSync({ unsafeCleanup: true })
  t.ok(tmpDir.name, 'valid tmp dir exists')
  repo = gits(tmpDir.name)
  repo.clone(remote, function (err) {
    t.error(err, 'cloned test repo')
  })
})

test('get-defaults', function (t) {
  t.plan(2)
  var commitish = getDefaults.getTargetCommitish()
  t.ok(commitish, 'Check for commitish')
  getDefaults(tmpDir.name, function (err, defaults) {
    t.error(err, 'Got the defaults from the test repo')
  })
})

test('Clean up tests', function (t) {
  t.plan(1)
  rimraf(tmpDir.name, function (err) {
    t.error(err, 'repo cleaned up')
  })
})
