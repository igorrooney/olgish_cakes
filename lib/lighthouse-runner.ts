import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import net from 'net'
import path from 'path'
import { spawn } from 'child_process'

export type LighthouseMode = 'local' | 'prod'

export interface LighthouseCliOptions {
  attach: boolean
  chromePath?: string
  help: boolean
  mode: LighthouseMode
  outputDir: string
  port?: number
  url?: string
}

export interface ResolvedRunSettings {
  attach: boolean
  devToolsPort?: number
  mode: LighthouseMode
  shouldLaunchBrowser: boolean
  targetUrl: string
}

export interface LighthouseCategoryScore {
  score: number | null
}

export interface LighthouseResult {
  categories?: {
    accessibility?: LighthouseCategoryScore
    'best-practices'?: LighthouseCategoryScore
    performance?: LighthouseCategoryScore
    seo?: LighthouseCategoryScore
  }
  finalDisplayedUrl?: string
}

export interface LighthouseArtifacts {
  lhr: LighthouseResult
  report: string | string[]
}

export interface BrowserLaunchConfig {
  chromeLogPath: string
  chromePath: string
  devToolsPort: number
  targetUrl: string
  userDataDir: string
}

export interface LaunchedBrowser {
  cleanup: () => Promise<void>
  logPath: string
  port: number
}

export interface LighthouseAuditSummary {
  chromeLogPath?: string
  htmlReportPath: string
  jsonReportPath: string
  mode: LighthouseMode
  scores: {
    accessibility: number | null
    bestPractices: number | null
    performance: number | null
    seo: number | null
  }
  url: string
}

export interface LighthouseRunnerDependencies {
  allocatePort: () => Promise<number>
  ensureDir: (directoryPath: string) => void
  launchBrowser: (config: BrowserLaunchConfig) => Promise<LaunchedBrowser>
  pathExists: (filePath: string) => boolean
  readTextFile: (filePath: string) => string
  runAudit: (
    targetUrl: string,
    options: {
      disableStorageReset: boolean
      port: number
    }
  ) => Promise<LighthouseArtifacts | null>
  writeTextFile: (filePath: string, content: string) => void
}

const DEFAULT_ATTACH_PORT = 9222
const DEFAULT_LOCAL_APP_PORT = 3000
const DEFAULT_MODE: LighthouseMode = 'local'
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'reports', 'generated')
const DEFAULT_PROD_BASE_URL = 'https://olgishcakes.co.uk'

const WINDOWS_CHROME_STABLE_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
]

const WINDOWS_EDGE_STABLE_PATHS = [
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
]

function getOptionValue(args: string[], index: number, currentArgument: string) {
  const [flag, inlineValue] = currentArgument.split('=', 2)

  if (inlineValue !== undefined) {
    return {
      consumedNextArgument: false,
      flag,
      value: inlineValue
    }
  }

  const nextValue = args[index + 1]

  if (!nextValue || nextValue.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`)
  }

  return {
    consumedNextArgument: true,
    flag,
    value: nextValue
  }
}

export function parseLighthouseArgs(args: string[]): LighthouseCliOptions {
  const options: LighthouseCliOptions = {
    attach: false,
    help: false,
    mode: DEFAULT_MODE,
    outputDir: DEFAULT_OUTPUT_DIR
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--attach') {
      options.attach = true
      continue
    }

    if (argument === '--help' || argument === '-h') {
      options.help = true
      continue
    }

    if (
      argument.startsWith('--chrome-path') ||
      argument.startsWith('--mode') ||
      argument.startsWith('--output-dir') ||
      argument.startsWith('--port') ||
      argument.startsWith('--url')
    ) {
      const resolvedOption = getOptionValue(args, index, argument)

      if (resolvedOption.flag === '--chrome-path') {
        options.chromePath = resolvedOption.value
      }

      if (resolvedOption.flag === '--mode') {
        if (resolvedOption.value !== 'local' && resolvedOption.value !== 'prod') {
          throw new Error(`Invalid mode "${resolvedOption.value}". Use local or prod.`)
        }

        options.mode = resolvedOption.value
      }

      if (resolvedOption.flag === '--output-dir') {
        options.outputDir = path.resolve(resolvedOption.value)
      }

      if (resolvedOption.flag === '--port') {
        const parsedPort = Number.parseInt(resolvedOption.value, 10)

        if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
          throw new Error(`Invalid port "${resolvedOption.value}". Use a positive integer.`)
        }

        options.port = parsedPort
      }

      if (resolvedOption.flag === '--url') {
        options.url = resolvedOption.value
      }

      if (resolvedOption.consumedNextArgument) {
        index += 1
      }

      continue
    }

    throw new Error(`Unknown argument "${argument}"`)
  }

  return options
}

export function resolveTargetUrl({
  mode,
  url,
  localAppPort = DEFAULT_LOCAL_APP_PORT
}: {
  localAppPort?: number
  mode: LighthouseMode
  url?: string
}) {
  if (url && /^https?:\/\//i.test(url)) {
    return url
  }

  const requestedPath = url ?? '/blog'

  if (!requestedPath.startsWith('/')) {
    throw new Error('Use an absolute URL or a path starting with "/".')
  }

  if (mode === 'prod') {
    return new URL(requestedPath, DEFAULT_PROD_BASE_URL).toString()
  }

  return new URL(requestedPath, `http://127.0.0.1:${localAppPort}`).toString()
}

export function resolveRunSettings(options: Pick<LighthouseCliOptions, 'attach' | 'mode' | 'port' | 'url'>) {
  const localAppPort = options.attach ? DEFAULT_LOCAL_APP_PORT : options.port ?? DEFAULT_LOCAL_APP_PORT

  return {
    attach: options.attach,
    devToolsPort: options.attach ? options.port ?? DEFAULT_ATTACH_PORT : undefined,
    mode: options.mode,
    shouldLaunchBrowser: !options.attach,
    targetUrl: resolveTargetUrl({
      localAppPort,
      mode: options.mode,
      url: options.url
    })
  } satisfies ResolvedRunSettings
}

export function resolveChromePath({
  cliChromePath,
  env,
  pathExists
}: {
  cliChromePath?: string
  env?: NodeJS.ProcessEnv
  pathExists?: (filePath: string) => boolean
}) {
  const effectiveEnv = env ?? process.env
  const fileExists = pathExists ?? existsSync
  const candidates = [
    cliChromePath,
    effectiveEnv.LIGHTHOUSE_CHROME_PATH,
    effectiveEnv.CHROME_PATH,
    ...WINDOWS_CHROME_STABLE_PATHS,
    ...WINDOWS_EDGE_STABLE_PATHS
  ].filter((candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0)

  return candidates.find(candidate => fileExists(candidate)) ?? null
}

function sanitizeSegment(value: string) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

export function createReportBasename(targetUrl: string) {
  const parsedUrl = new URL(targetUrl)
  const hostSegment = sanitizeSegment(parsedUrl.host)
  const pathSegment = sanitizeSegment(parsedUrl.pathname) || 'home'
  return `lighthouse-${hostSegment}-${pathSegment}`
}

function normaliseReport(report: string | string[]) {
  if (typeof report === 'string') {
    return report
  }

  return report[0] ?? ''
}

function readTail(logText: string, lineLimit = 20) {
  return logText
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0)
    .slice(-lineLimit)
    .join('\n')
}

function toScore(value?: LighthouseCategoryScore) {
  if (typeof value?.score !== 'number') {
    return null
  }

  return Math.round(value.score * 100)
}

export function buildManualChromeCommand({
  browserPath,
  devToolsPort,
  targetUrl,
  userDataDir
}: {
  browserPath: string
  devToolsPort: number
  targetUrl: string
  userDataDir: string
}) {
  return `"${browserPath}" --remote-debugging-address=127.0.0.1 --remote-debugging-port=${devToolsPort} --user-data-dir="${userDataDir}" "${targetUrl}"`
}

export function buildAttachCommand({
  devToolsPort,
  targetUrl
}: {
  devToolsPort: number
  targetUrl: string
}) {
  return `pnpm run lighthouse:attach -- --port=${devToolsPort} --url=${targetUrl}`
}

export function buildLaunchFailureMessage({
  attachCommand,
  browserPath,
  chromeLog,
  chromeLogPath,
  manualChromeCommand,
  targetUrl
}: {
  attachCommand: string
  browserPath: string
  chromeLog: string
  chromeLogPath: string
  manualChromeCommand: string
  targetUrl: string
}) {
  const logExcerpt = readTail(chromeLog)

  return [
    'Chrome failed to launch for Lighthouse.',
    `Browser: ${browserPath}`,
    `Target URL: ${targetUrl}`,
    `Chrome log: ${chromeLogPath}`,
    logExcerpt.length > 0 ? `Captured log:\n${logExcerpt}` : 'Captured log: (no output captured)',
    'Start a browser with DevTools enabled, then rerun in attach mode:',
    manualChromeCommand,
    attachCommand
  ].join('\n')
}

function getMissingBrowserMessage(cliChromePath?: string) {
  const requestedPathNote = cliChromePath
    ? ` The configured --chrome-path was "${cliChromePath}".`
    : ''

  return `Could not find a Chrome or Edge executable for Lighthouse.${requestedPathNote} Set LIGHTHOUSE_CHROME_PATH or CHROME_PATH, or pass --chrome-path explicitly.`
}

function delay(milliseconds: number) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds)
  })
}

async function canConnect(port: number) {
  return new Promise<boolean>(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port })

    socket.once('connect', () => {
      socket.end()
      resolve(true)
    })

    socket.once('error', () => {
      socket.destroy()
      resolve(false)
    })
  })
}

async function waitForDevToolsPort(chromeProcess: ReturnType<typeof spawn>, port: number) {
  const timeoutAt = Date.now() + 30000

  while (Date.now() < timeoutAt) {
    if (chromeProcess.exitCode !== null) {
      throw new Error(`Chrome exited before opening DevTools on port ${port}.`)
    }

    if (await canConnect(port)) {
      return
    }

    await delay(250)
  }

  throw new Error(`Timed out waiting for Chrome DevTools on port ${port}.`)
}

export function getChromeLaunchArgs({
  devToolsPort,
  targetUrl,
  userDataDir
}: {
  devToolsPort: number
  targetUrl: string
  userDataDir: string
}) {
  return [
    '--headless=new',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-component-update',
    '--disable-crash-reporter',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-popup-blocking',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--hide-scrollbars',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--remote-debugging-address=127.0.0.1',
    `--remote-debugging-port=${devToolsPort}`,
    `--user-data-dir=${userDataDir}`,
    targetUrl
  ]
}

export async function defaultAllocatePort() {
  return new Promise<number>((resolve, reject) => {
    const server = net.createServer()

    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()

      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Could not allocate a free port.')))
        return
      }

      const { port } = address
      server.close(error => {
        if (error) {
          reject(error)
          return
        }

        resolve(port)
      })
    })
  })
}

export async function defaultLaunchBrowser(config: BrowserLaunchConfig): Promise<LaunchedBrowser> {
  mkdirSync(config.userDataDir, { recursive: true })
  mkdirSync(path.dirname(config.chromeLogPath), { recursive: true })

  const logStream = createWriteStream(config.chromeLogPath, { flags: 'w' })
  const chromeProcess = spawn(config.chromePath, getChromeLaunchArgs(config), {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  })

  chromeProcess.stdout?.pipe(logStream)
  chromeProcess.stderr?.pipe(logStream)

  try {
    await waitForDevToolsPort(chromeProcess, config.devToolsPort)
  } catch (error) {
    if (!chromeProcess.killed) {
      chromeProcess.kill()
    }

    throw error
  }

  return {
    cleanup: async () => {
      if (!chromeProcess.killed) {
        chromeProcess.kill()
      }

      logStream.end()
      await delay(50)
    },
    logPath: config.chromeLogPath,
    port: config.devToolsPort
  }
}

export async function defaultRunAudit(
  targetUrl: string,
  options: {
    disableStorageReset: boolean
    port: number
  }
) {
  const lighthouseModule = (await import('lighthouse')) as {
    default: (
      url: string,
      flags: {
        disableStorageReset: boolean
        logLevel: 'info'
        output: 'html'
        port: number
      }
    ) => Promise<LighthouseArtifacts | null>
  }

  return lighthouseModule.default(targetUrl, {
    disableStorageReset: options.disableStorageReset,
    logLevel: 'info',
    output: 'html',
    port: options.port
  })
}

export function createRunnerDependencies(): LighthouseRunnerDependencies {
  return {
    allocatePort: defaultAllocatePort,
    ensureDir: directoryPath => mkdirSync(directoryPath, { recursive: true }),
    launchBrowser: defaultLaunchBrowser,
    pathExists: existsSync,
    readTextFile: filePath => readFileSync(filePath, 'utf8'),
    runAudit: defaultRunAudit,
    writeTextFile: (filePath, content) => writeFileSync(filePath, content, 'utf8')
  }
}

export async function runLighthouseAudit(
  options: LighthouseCliOptions,
  dependencies: LighthouseRunnerDependencies = createRunnerDependencies()
): Promise<LighthouseAuditSummary> {
  const settings = resolveRunSettings(options)
  const reportBasename = createReportBasename(settings.targetUrl)
  const reportDir = path.resolve(options.outputDir)
  const htmlReportPath = path.join(reportDir, `${reportBasename}.html`)
  const jsonReportPath = path.join(reportDir, `${reportBasename}.json`)
  const chromeLogPath = path.join(reportDir, `${reportBasename}-chrome.log`)
  const chromeUserDataDir = path.join(reportDir, `${reportBasename}-chrome-profile`)

  dependencies.ensureDir(reportDir)

  let launchedBrowser: LaunchedBrowser | null = null
  let devToolsPort = settings.devToolsPort ?? 0
  let resolvedChromePath: string | null = null

  try {
    if (settings.shouldLaunchBrowser) {
      resolvedChromePath = resolveChromePath({
        cliChromePath: options.chromePath,
        pathExists: dependencies.pathExists
      })

      if (!resolvedChromePath) {
        throw new Error(getMissingBrowserMessage(options.chromePath))
      }

      devToolsPort = await dependencies.allocatePort()
      launchedBrowser = await dependencies.launchBrowser({
        chromeLogPath,
        chromePath: resolvedChromePath,
        devToolsPort,
        targetUrl: settings.targetUrl,
        userDataDir: chromeUserDataDir
      })
    }

    const lighthouseResult = await dependencies.runAudit(settings.targetUrl, {
      disableStorageReset: settings.attach,
      port: settings.devToolsPort ?? devToolsPort
    })

    if (!lighthouseResult) {
      throw new Error('Lighthouse did not return a result.')
    }

    dependencies.writeTextFile(htmlReportPath, normaliseReport(lighthouseResult.report))
    dependencies.writeTextFile(jsonReportPath, JSON.stringify(lighthouseResult.lhr, null, 2))

    return {
      chromeLogPath: settings.shouldLaunchBrowser ? chromeLogPath : undefined,
      htmlReportPath,
      jsonReportPath,
      mode: settings.mode,
      scores: {
        accessibility: toScore(lighthouseResult.lhr.categories?.accessibility),
        bestPractices: toScore(lighthouseResult.lhr.categories?.['best-practices']),
        performance: toScore(lighthouseResult.lhr.categories?.performance),
        seo: toScore(lighthouseResult.lhr.categories?.seo)
      },
      url: lighthouseResult.lhr.finalDisplayedUrl || settings.targetUrl
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ''
    const shouldRewriteAsLaunchFailure =
      settings.shouldLaunchBrowser &&
      resolvedChromePath !== null &&
      (launchedBrowser === null || /chrome|devtools|port/i.test(errorMessage))

    if (shouldRewriteAsLaunchFailure) {
      if (resolvedChromePath === null) {
        throw error instanceof Error ? error : new Error('Lighthouse audit failed.')
      }

      const browserPath = resolvedChromePath
      const chromeLog = dependencies.pathExists(chromeLogPath)
        ? dependencies.readTextFile(chromeLogPath)
        : ''

      throw new Error(
        buildLaunchFailureMessage({
          attachCommand: buildAttachCommand({
            devToolsPort: DEFAULT_ATTACH_PORT,
            targetUrl: settings.targetUrl
          }),
          browserPath,
          chromeLog,
          chromeLogPath,
          manualChromeCommand: buildManualChromeCommand({
            browserPath,
            devToolsPort: DEFAULT_ATTACH_PORT,
            targetUrl: settings.targetUrl,
            userDataDir: path.join(reportDir, 'chrome-manual-profile')
          }),
          targetUrl: settings.targetUrl
        })
      )
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Lighthouse audit failed.')
  } finally {
    await launchedBrowser?.cleanup()
  }
}

export function formatLighthouseSummary(summary: LighthouseAuditSummary) {
  const scoreLine = [
    `Performance ${summary.scores.performance ?? 'n/a'}`,
    `Accessibility ${summary.scores.accessibility ?? 'n/a'}`,
    `Best Practices ${summary.scores.bestPractices ?? 'n/a'}`,
    `SEO ${summary.scores.seo ?? 'n/a'}`
  ].join(' | ')

  return [
    `Lighthouse completed for ${summary.url}`,
    scoreLine,
    `HTML report: ${summary.htmlReportPath}`,
    `JSON report: ${summary.jsonReportPath}`,
    summary.chromeLogPath ? `Chrome log: ${summary.chromeLogPath}` : null
  ]
    .filter((line): line is string => typeof line === 'string' && line.length > 0)
    .join('\n')
}

export function getLighthouseHelpText() {
  return [
    'Usage: pnpm run lighthouse -- [options]',
    '',
    'Options:',
    '  --mode=local|prod       Choose local or production base URL. Default: local',
    '  --url=/path|https://... Audit a relative path or an absolute URL. Default: /blog',
    '  --port=<number>         Local app port in normal mode, or DevTools port with --attach',
    '  --chrome-path=<path>    Explicit Chrome or Edge executable path',
    '  --output-dir=<path>     Report directory. Default: reports/generated',
    '  --attach                Skip auto-launch and use an existing DevTools port',
    '  --help                  Show this help text',
    '',
    'Attach mode note:',
    '  If you need a local URL on a port other than 3000, pass an absolute URL alongside --attach.'
  ].join('\n')
}
