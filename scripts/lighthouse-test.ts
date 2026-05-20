#!/usr/bin/env node

import {
  formatLighthouseSummary,
  getLighthouseHelpText,
  parseLighthouseArgs,
  runLighthouseAudit
} from '../lib/lighthouse-runner'

async function main() {
  const options = parseLighthouseArgs(process.argv.slice(2))

  if (options.help) {
    console.log(getLighthouseHelpText())
    return
  }

  const summary = await runLighthouseAudit(options)
  console.log(formatLighthouseSummary(summary))
}

main().catch(error => {
  const message = error instanceof Error ? error.message : 'Lighthouse audit failed.'
  console.error(message)
  process.exitCode = 1
})
