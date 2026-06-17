#!/usr/bin/env node
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { type CliDeps, isConfirmed, run } from './cli.js'
import Release from './index.js'

const deps: CliDeps = {
  cwd: process.cwd(),
  env: process.env,
  stdout: (msg) => console.log(msg),
  stderr: (msg) => console.error(msg),
  progress: (line) => process.stderr.write(`${process.stderr.isTTY ? '\r' : ''}${line}`),
  confirm: async (question) => {
    const rl = createInterface({ input: stdin, output: stdout })
    const answer = await rl.question(`${question} (Y/n) `)
    rl.close()
    return isConfirmed(answer)
  },
  exit: (code) => process.exit(code),
  release: Release
}

run(process.argv.slice(2), deps)
