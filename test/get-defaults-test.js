var test = require('tape')
var path = require('path')
var tmp = require('tmp')
var gits = require('quick-gits')
var rimraf = require('rimraf')

var getDefaults = require('../bin/lib/get-defaults')
var remote = 'https://github.com/bcomnes/gh-release-test.git'

var tmpDir, repo

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
  getDefaults(tmpDir.name, false, function (err, defaults) {
    t.error(err, 'Got the defaults from the test repo')
  })
})

test('get-defaults supports package.json with a `repository` object', function (t) {
  t.plan(3)
  getDefaults(path.join(__dirname, 'fixtures/basic'), false, function (err, defaults) {
    t.equal(err, null, 'error should be null')
    t.equal(defaults.owner, 'bcomnes', 'gets owner from package.json')
    t.equal(defaults.repo, 'gh-release-test', 'gets repo from package.json')
  })
})

test('get-defaults supports package.json with a `repository` string', function (t) {
  t.plan(3)
  getDefaults(path.join(__dirname, 'fixtures/stringy-repo'), false, function (err, defaults) {
    t.equal(err, null, 'error should be null')
    t.equal(defaults.owner, 'stringy', 'gets owner from package.json')
    t.equal(defaults.repo, 'repo', 'gets repo from package.json')
  })
})

test('get-defaults supports package.json with an enterprise repo', function (t) {
  t.plan(3)
  getDefaults(path.join(__dirname, 'fixtures/enterprise-repo'), true, function (err, defaults) {
    t.equal(err, null, 'error should be null')
    t.equal(defaults.owner, 'stringy', 'gets owner from package.json')
    t.equal(defaults.repo, 'repo', 'gets repo from package.json')
  })
})

test('get-defaults errors out with an invalid repository URL', function (t) {
  t.plan(1)
  getDefaults(path.join(__dirname, 'fixtures/invalid-repo'), false, function (err, defaults) {
    t.deepEqual(err.message, 'The repository defined in your package.json is invalid => https://docs.npmjs.com/files/package.json#repository')
  })
})

test('Clean up tests', function (t) {
  t.plan(1)
  rimraf(tmpDir.name, function (err) {
    t.error(err, 'repo cleaned up')
  })
})
