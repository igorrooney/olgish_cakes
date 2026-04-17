'use client'

import { useEffect } from 'react'

export const KLARO_DIALOG_LABEL = 'Cookie preferences'
export const KLARO_VISIBILITY_EVENT = 'klaro-visibility-change'

const klaroDialogSelector = [
  '#klaro .cookie-notice',
  '#klaro .cookie-modal',
  '.klaro .cookie-notice',
  '.klaro .cookie-modal',
  '.klaro .cn',
  '.klaro .cm',
].join(', ')

function getOwnerDocument(root: ParentNode | Document) {
  return 'ownerDocument' in root && root.ownerDocument ? root.ownerDocument : (root as Document)
}

function hasValidAriaLabelledBy(
  dialog: HTMLElement,
  ownerDocument: Document
) {
  const labelledBy = dialog.getAttribute('aria-labelledby')?.trim()

  if (!labelledBy) {
    return false
  }

  const ids = labelledBy.split(/\s+/).filter(Boolean)

  if (ids.length === 0) {
    return false
  }

  return ids.every(id => {
    const labelNode = ownerDocument.getElementById(id)
    const labelText = labelNode?.textContent?.trim()

    return Boolean(labelNode && labelText)
  })
}

function isNoticeDialog(dialog: HTMLElement) {
  return dialog.matches('.cookie-notice, .cn, #id-cookie-notice')
}

function syncKlaroNoticePosition(dialog: HTMLElement, ownerDocument: Document) {
  if (!isNoticeDialog(dialog)) {
    return
  }

  const viewportWidth = ownerDocument.defaultView?.innerWidth ?? 0

  if (viewportWidth >= 640) {
    dialog.style.setProperty('position', 'fixed', 'important')
    dialog.style.setProperty('top', 'auto', 'important')
    dialog.style.setProperty('right', 'auto', 'important')
    dialog.style.setProperty('bottom', '1.25rem', 'important')
    dialog.style.setProperty('left', '50%', 'important')
    dialog.style.setProperty('width', 'calc(100vw - 2rem)', 'important')
    dialog.style.setProperty(
      'max-width',
      viewportWidth >= 1024 ? '44rem' : '42rem',
      'important'
    )
    dialog.style.setProperty('padding', '0.875rem 1rem', 'important')
    dialog.style.setProperty('transform', 'translateX(-50%)', 'important')
    dialog.style.setProperty('inset', 'auto auto 1.25rem 50%', 'important')
    return
  }

  dialog.style.setProperty('position', 'fixed', 'important')
  dialog.style.setProperty('top', 'auto', 'important')
  dialog.style.setProperty('bottom', '0.75rem', 'important')
  dialog.style.setProperty('width', 'calc(100vw - 1rem)', 'important')
  dialog.style.setProperty('max-width', '24rem', 'important')
  dialog.style.setProperty('padding', '0.75rem 0.875rem', 'important')
  dialog.style.setProperty('left', '0.5rem', 'important')
  dialog.style.setProperty('right', '0.5rem', 'important')
  dialog.style.setProperty('transform', '', 'important')
  dialog.style.setProperty('inset', 'auto 0.5rem 0.75rem 0.5rem', 'important')
}

export function syncKlaroDialogState(root: ParentNode | Document = document) {
  const ownerDocument = getOwnerDocument(root)
  const dialogs = Array.from(root.querySelectorAll<HTMLElement>(klaroDialogSelector)).filter(
    element => element.isConnected
  )
  const isOpen = dialogs.length > 0

  dialogs.forEach(dialog => {
    if (!dialog.hasAttribute('role')) {
      dialog.setAttribute('role', 'dialog')
    }

    const hasValidLabelledBy = hasValidAriaLabelledBy(dialog, ownerDocument)
    const ariaLabel = dialog.getAttribute('aria-label')?.trim()

    if (!hasValidLabelledBy && dialog.hasAttribute('aria-labelledby')) {
      dialog.removeAttribute('aria-labelledby')
    }

    if (!hasValidLabelledBy && !ariaLabel) {
      dialog.setAttribute('aria-label', KLARO_DIALOG_LABEL)
    }

    dialog.setAttribute('aria-modal', 'true')
    syncKlaroNoticePosition(dialog, ownerDocument)
  })

  const nextValue = isOpen ? 'true' : 'false'

  if (ownerDocument.body.dataset.klaroOpen !== nextValue) {
    ownerDocument.body.dataset.klaroOpen = nextValue
    ownerDocument.defaultView?.dispatchEvent(
      new CustomEvent(KLARO_VISIBILITY_EVENT, {
        detail: { isOpen },
      })
    )
  }

  return isOpen
}

export function KlaroA11yBridge() {
  useEffect(() => {
    syncKlaroDialogState(document)

    const handleResize = () => {
      syncKlaroDialogState(document)
    }

    const observer = new MutationObserver(() => {
      syncKlaroDialogState(document)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'role', 'aria-hidden', 'aria-label', 'aria-labelledby'],
    })

    window.addEventListener('resize', handleResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      document.body.dataset.klaroOpen = 'false'
      window.dispatchEvent(
        new CustomEvent(KLARO_VISIBILITY_EVENT, {
          detail: { isOpen: false },
        })
      )
    }
  }, [])

  return null
}
