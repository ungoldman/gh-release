#!/usr/bin/env node
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { type CliDeps, run } from './cli.js'
import Release from './index.js'

const deps: CliDeps = {
  cwd: process.cwd(),
  env: process.env,
  stdout: (msg) => console.log(msg),
  stderr: (msg) => console.error(msg),
  progress: (line) => process.stderr.write(`${process.stderr.isTTY ? '\r' : ''}${line}`),
  confirm: async (question) => {
    const rl = createInterface({ input: stdin, output: stdout })
    const answer = await rl.question(`${question} `)
    rl.close()
    return /^y(es)?$/i.test(answer.trim())
  },
  exit: (code) => process.exit(code),
  release: Release
}

run(process.argv.slice(2), deps)
