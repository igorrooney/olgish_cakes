/**
 * @jest-environment jsdom
 */

import {
  KLARO_DIALOG_LABEL,
  KLARO_VISIBILITY_EVENT,
  syncKlaroDialogState,
} from '../KlaroA11yBridge'

describe('syncKlaroDialogState', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.dataset.klaroOpen = 'false'
  })

  it('labels Klaro dialogs and marks the body when consent UI is open', () => {
    const eventListener = jest.fn()

    window.addEventListener(KLARO_VISIBILITY_EVENT, eventListener)

    document.body.innerHTML = `
      <div id="klaro" class="klaro">
        <div class="cookie-modal">
          <p>Choose your cookie settings</p>
        </div>
      </div>
    `

    const isOpen = syncKlaroDialogState(document)
    const dialog = document.querySelector<HTMLElement>('.cookie-modal')

    expect(isOpen).toBe(true)
    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-label')).toBe(KLARO_DIALOG_LABEL)
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(document.body.dataset.klaroOpen).toBe('true')
    expect(eventListener).toHaveBeenCalledTimes(1)

    window.removeEventListener(KLARO_VISIBILITY_EVENT, eventListener)
  })

  it('keeps a valid aria-labelledby reference intact', () => {
    document.body.innerHTML = `
      <div id="klaro" class="klaro">
        <h2 id="cookie-title">Cookie preferences</h2>
        <div class="cookie-modal" role="dialog" aria-labelledby="cookie-title">
          <p>Choose your cookie settings</p>
        </div>
      </div>
    `

    syncKlaroDialogState(document)

    const dialog = document.querySelector<HTMLElement>('.cookie-modal')

    expect(dialog?.getAttribute('aria-labelledby')).toBe('cookie-title')
    expect(dialog?.hasAttribute('aria-label')).toBe(false)
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
  })

  it('replaces a broken aria-labelledby reference with an aria-label', () => {
    document.body.innerHTML = `
      <div id="klaro" class="klaro">
        <div class="cookie-modal" role="dialog" aria-labelledby="missing-cookie-title">
          <p>Choose your cookie settings</p>
        </div>
      </div>
    `

    syncKlaroDialogState(document)

    const dialog = document.querySelector<HTMLElement>('.cookie-modal')

    expect(dialog?.hasAttribute('aria-labelledby')).toBe(false)
    expect(dialog?.getAttribute('aria-label')).toBe(KLARO_DIALOG_LABEL)
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
  })

  it('replaces an empty aria-labelledby target with an aria-label', () => {
    document.body.innerHTML = `
      <div id="klaro" class="klaro">
        <h2 id="cookie-title">   </h2>
        <div class="cookie-modal" role="dialog" aria-labelledby="cookie-title">
          <p>Choose your cookie settings</p>
        </div>
      </div>
    `

    syncKlaroDialogState(document)

    const dialog = document.querySelector<HTMLElement>('.cookie-modal')

    expect(dialog?.hasAttribute('aria-labelledby')).toBe(false)
    expect(dialog?.getAttribute('aria-label')).toBe(KLARO_DIALOG_LABEL)
  })

  it('clears the body flag when no Klaro dialog is present', () => {
    const eventListener = jest.fn()

    document.body.dataset.klaroOpen = 'true'
    window.addEventListener(KLARO_VISIBILITY_EVENT, eventListener)

    const isOpen = syncKlaroDialogState(document)

    expect(isOpen).toBe(false)
    expect(document.body.dataset.klaroOpen).toBe('false')
    expect(eventListener).toHaveBeenCalledTimes(1)

    window.removeEventListener(KLARO_VISIBILITY_EVENT, eventListener)
  })
})
