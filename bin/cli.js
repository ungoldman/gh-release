#!/usr/bin/env node

var ghRelease = require('..')
var options = {} // parse opts from argv

ghRelease(options, function (err, result) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(result)
})
