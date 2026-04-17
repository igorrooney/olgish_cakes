import {
  consentDefaultsScript,
  gtmSnippet,
  isConsentRuntimeEnabled as consentRuntimeEnabled,
  klaroConfigScript,
  klaroOverridesHref,
  klaroScriptSrc,
  klaroStyleHref,
  serializedKlaroConfig
} from './consent-runtime-config'

type ConsentRuntimeOptions = {
  openModal?: boolean
}

type GtagFunction = (...args: unknown[]) => void

type KlaroManager = {
  show: (config?: unknown, modal?: boolean) => void
}

type ConsentWindow = Window & typeof globalThis & {
  klaro?: KlaroManager
  klaroConfig?: Record<string, unknown>
  dataLayer?: unknown[]
  gtag?: GtagFunction
}

let runtimeLoadPromise: Promise<void> | null = null

function getConsentWindow() {
  return window as ConsentWindow
}

function appendScriptIfMissing(id: string, contents: string) {
  if (document.getElementById(id)) {
    return
  }

  const script = document.createElement('script')
  script.id = id
  script.textContent = contents
  document.head.appendChild(script)
}

function appendTemplateScriptIfMissing(id: string, contents: string) {
  if (!contents || document.getElementById(id)) {
    return
  }

  const script = document.createElement('script')
  script.id = id
  script.type = 'text/plain'
  script.dataset.type = 'application/javascript'
  script.dataset.name = 'google-tag-manager'
  script.textContent = contents
  document.body.appendChild(script)
}

function appendStylesheetIfMissing(href: string, dataAttribute: string) {
  if (document.querySelector(`link[${dataAttribute}]`)) {
    return
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  link.setAttribute(dataAttribute, 'true')
  document.head.appendChild(link)
}

function buildExternalScriptLoadError(src: string) {
  return new Error(`Failed to load ${src}`)
}

function loadExternalScript(id: string, src: string, attributes: Record<string, string>) {
  const existingScript = document.getElementById(id) as HTMLScriptElement | null

  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      if (existingScript.dataset.loaded === 'true') {
        resolve()
        return
      }

      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => {
          existingScript.remove()
          reject(buildExternalScriptLoadError(src))
        },
        { once: true }
      )
    })
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = id
    script.src = src

    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value)
    })

    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true'
        resolve()
      },
      { once: true }
    )
    script.addEventListener(
      'error',
      () => {
        script.remove()
        reject(buildExternalScriptLoadError(src))
      },
      { once: true }
    )
    document.body.appendChild(script)
  })
}

async function waitForKlaroManager() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const klaro = getConsentWindow().klaro

    if (klaro?.show) {
      return klaro
    }

    await new Promise(resolve => {
      window.setTimeout(resolve, 100)
    })
  }

  return null
}

async function openConsentModal() {
  const klaro = await waitForKlaroManager()
  klaro?.show(undefined, true)
}

export function isConsentRuntimeEnabled() {
  return consentRuntimeEnabled
}

export async function loadConsentRuntime(options: ConsentRuntimeOptions = {}) {
  if (typeof window === 'undefined' || !isConsentRuntimeEnabled()) {
    return
  }

  if (runtimeLoadPromise === null) {
    runtimeLoadPromise = (async () => {
      appendStylesheetIfMissing(klaroStyleHref, 'data-klaro-style')
      appendStylesheetIfMissing(klaroOverridesHref, 'data-klaro-overrides-style')
      appendScriptIfMissing('gtag-consent-default', consentDefaultsScript)
      appendScriptIfMissing('klaro-config', klaroConfigScript)
      getConsentWindow().klaroConfig = serializedKlaroConfig
      appendTemplateScriptIfMissing('google-tag-manager-template', gtmSnippet)

      await loadExternalScript('klaro-script', klaroScriptSrc, {
        'data-config': 'klaroConfig'
      })
    })()
  }

  try {
    await runtimeLoadPromise
  } catch (error) {
    runtimeLoadPromise = null
    console.warn('Failed to load consent runtime:', error)
    return
  }

  if (options.openModal) {
    await openConsentModal()
  }
}
