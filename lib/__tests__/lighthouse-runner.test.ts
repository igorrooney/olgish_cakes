/**
 * @jest-environment node
 */

import type {
  BrowserLaunchConfig,
  LaunchedBrowser,
  LighthouseArtifacts,
  LighthouseRunnerDependencies
} from '../lighthouse-runner'
import {
  buildLaunchFailureMessage,
  createReportBasename,
  formatLighthouseSummary,
  parseLighthouseArgs,
  resolveChromePath,
  resolveRunSettings,
  resolveTargetUrl,
  runLighthouseAudit
} from '../lighthouse-runner'

function createDependencies(
  overrides: Partial<LighthouseRunnerDependencies> = {}
): LighthouseRunnerDependencies {
  return {
    allocatePort: async () => 4567,
    ensureDir: () => {},
    launchBrowser: async (_config: BrowserLaunchConfig): Promise<LaunchedBrowser> => ({
      cleanup: async () => {},
      logPath: 'C:\\reports\\generated\\lighthouse-chrome.log',
      port: 4567
    }),
    pathExists: () => false,
    readTextFile: () => '',
    runAudit: async () =>
      ({
        lhr: {
          categories: {
            accessibility: { score: 0.95 },
            'best-practices': { score: 0.92 },
            performance: { score: 0.98 },
            seo: { score: 1 }
          },
          finalDisplayedUrl: 'https://preview.example.com/blog'
        },
        report: '<html>report</html>'
      }) satisfies LighthouseArtifacts,
    writeTextFile: () => {},
    ...overrides
  }
}

describe('lighthouse-runner', () => {
  it('parses supported CLI flags', () => {
    const options = parseLighthouseArgs([
      '--mode=prod',
      '--url',
      '/blog',
      '--port',
      '9222',
      '--chrome-path',
      'C:\\Chrome\\chrome.exe',
      '--output-dir',
      'reports\\custom',
      '--attach'
    ])

    expect(options).toMatchObject({
      attach: true,
      chromePath: 'C:\\Chrome\\chrome.exe',
      mode: 'prod',
      port: 9222,
      url: '/blog'
    })
    expect(options.outputDir).toContain('reports')
  })

  it('resolves browser paths in the documented order', () => {
    const existingPaths = new Set([
      'C:\\manual\\chrome.exe',
      'C:\\env\\chrome.exe',
      'C:\\env\\edge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ])

    expect(
      resolveChromePath({
        cliChromePath: 'C:\\manual\\chrome.exe',
        env: {
          CHROME_PATH: 'C:\\env\\edge.exe',
          LIGHTHOUSE_CHROME_PATH: 'C:\\env\\chrome.exe'
        },
        pathExists: filePath => existingPaths.has(filePath)
      })
    ).toBe('C:\\manual\\chrome.exe')

    expect(
      resolveChromePath({
        env: {
          CHROME_PATH: 'C:\\env\\edge.exe',
          LIGHTHOUSE_CHROME_PATH: 'C:\\env\\chrome.exe'
        },
        pathExists: filePath => existingPaths.has(filePath)
      })
    ).toBe('C:\\env\\chrome.exe')

    expect(
      resolveChromePath({
        env: {},
        pathExists: filePath =>
          filePath === 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' ||
          filePath === 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
      })
    ).toBe('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  })

  it('builds local and production target URLs correctly', () => {
    expect(resolveTargetUrl({ localAppPort: 3100, mode: 'local', url: '/blog?page=2' })).toBe(
      'http://127.0.0.1:3100/blog?page=2'
    )

    expect(resolveTargetUrl({ mode: 'prod', url: '/blog' })).toBe(
      'https://olgishcakes.co.uk/blog'
    )

    expect(resolveTargetUrl({ mode: 'prod', url: 'https://preview.example.com/blog' })).toBe(
      'https://preview.example.com/blog'
    )
  })

  it('treats attach mode port as the DevTools port and keeps the local app on port 3000 by default', () => {
    expect(resolveRunSettings({ attach: true, mode: 'local', port: 9222, url: '/blog' })).toEqual({
      attach: true,
      devToolsPort: 9222,
      mode: 'local',
      shouldLaunchBrowser: false,
      targetUrl: 'http://127.0.0.1:3000/blog'
    })
  })

  it('builds a failure message with the captured browser log and attach-mode recovery steps', () => {
    const message = buildLaunchFailureMessage({
      attachCommand: 'pnpm run lighthouse:attach -- --port=9222 --url=http://127.0.0.1:3000/blog',
      browserPath: 'C:\\Chrome\\chrome.exe',
      chromeLog: 'CreateFile: Access is denied. (0x5)\nmojo platform_channel.cc:108',
      chromeLogPath: 'C:\\reports\\generated\\blog-chrome.log',
      manualChromeCommand:
        '"C:\\Chrome\\chrome.exe" --remote-debugging-address=127.0.0.1 --remote-debugging-port=9222 --user-data-dir="C:\\reports\\generated\\chrome-manual-profile" "http://127.0.0.1:3000/blog"',
      targetUrl: 'http://127.0.0.1:3000/blog'
    })

    expect(message).toContain('Chrome failed to launch for Lighthouse.')
    expect(message).toContain('CreateFile: Access is denied. (0x5)')
    expect(message).toContain('pnpm run lighthouse:attach')
    expect(message).toContain('--remote-debugging-port=9222')
  })

  it('runs Lighthouse in attach mode without launching a browser and writes both reports', async () => {
    const writes: Array<{ filePath: string; content: string }> = []
    const launchBrowser = jest.fn<Promise<LaunchedBrowser>, [BrowserLaunchConfig]>()
    const runAudit = jest.fn<
      Promise<LighthouseArtifacts | null>,
      [string, { disableStorageReset: boolean; port: number }]
    >(async () => ({
      lhr: {
        categories: {
          accessibility: { score: 0.94 },
          'best-practices': { score: 0.9 },
          performance: { score: 0.97 },
          seo: { score: 0.99 }
        },
        finalDisplayedUrl: 'https://preview.example.com/blog'
      },
      report: '<html>attach mode</html>'
    }))

    const summary = await runLighthouseAudit(
      {
        attach: true,
        help: false,
        mode: 'prod',
        outputDir: 'C:\\reports\\generated',
        port: 9222,
        url: 'https://preview.example.com/blog'
      },
      createDependencies({
        launchBrowser,
        runAudit,
        writeTextFile: (filePath, content) => {
          writes.push({ content, filePath })
        }
      })
    )

    expect(launchBrowser).not.toHaveBeenCalled()
    expect(runAudit).toHaveBeenCalledWith('https://preview.example.com/blog', {
      disableStorageReset: true,
      port: 9222
    })
    expect(summary.scores.performance).toBe(97)
    expect(writes).toHaveLength(2)
    expect(writes[0]?.filePath).toContain(createReportBasename('https://preview.example.com/blog'))
    expect(formatLighthouseSummary(summary)).toContain('Lighthouse completed for https://preview.example.com/blog')
  })

  it('turns browser launch failures into an attach-mode recovery message', async () => {
    const launchBrowser = jest.fn<Promise<LaunchedBrowser>, [BrowserLaunchConfig]>(async () => {
      throw new Error('launch failed')
    })

    await expect(
      runLighthouseAudit(
        {
          attach: false,
          chromePath: 'C:\\Chrome\\chrome.exe',
          help: false,
          mode: 'local',
          outputDir: 'C:\\reports\\generated',
          url: '/blog'
        },
        createDependencies({
          allocatePort: async () => 4555,
          launchBrowser,
          pathExists: filePath =>
            filePath === 'C:\\Chrome\\chrome.exe' || filePath.endsWith('-chrome.log'),
          readTextFile: () => 'CreateFile: Access is denied. (0x5)'
        })
      )
    ).rejects.toThrow(/pnpm run lighthouse:attach/)
  })
})
