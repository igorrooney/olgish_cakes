/**
 * @jest-environment jsdom
 */
import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import { WorkshopEnquiryScrollLink } from '../WorkshopEnquiryScrollLink'

function createWorkshopFormTarget() {
  const target = document.createElement('section')
  target.id = 'workshop-enquiry-form'
  target.tabIndex = -1
  const scrollIntoView = jest.fn()
  target.scrollIntoView = scrollIntoView
  document.body.appendChild(target)

  return { scrollIntoView, target }
}

describe('WorkshopEnquiryScrollLink', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.history.replaceState({}, '', '/learn/workshops')
    window.matchMedia = jest.fn().mockReturnValue({ matches: false })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.restoreAllMocks()
  })

  it('updates the hash, focuses the form section and scrolls smoothly', () => {
    const { scrollIntoView, target } = createWorkshopFormTarget()

    render(
      <WorkshopEnquiryScrollLink>Ask about your date</WorkshopEnquiryScrollLink>
    )

    fireEvent.click(screen.getByRole('link', { name: /ask about your date/i }))

    expect(window.location.hash).toBe('#workshop-enquiry-form')
    expect(target).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('uses instant scrolling when reduced motion is requested', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true })
    const { scrollIntoView, target } = createWorkshopFormTarget()

    render(
      <WorkshopEnquiryScrollLink>Ask about your date</WorkshopEnquiryScrollLink>
    )

    fireEvent.click(screen.getByRole('link', { name: /ask about your date/i }))

    expect(target).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
  })

  it('keeps modified clicks available for native browser behaviour', () => {
    const { scrollIntoView } = createWorkshopFormTarget()

    render(
      <WorkshopEnquiryScrollLink>Ask about your date</WorkshopEnquiryScrollLink>
    )

    const link = screen.getByRole('link', { name: /ask about your date/i })
    const clickEvent = createEvent.click(link, { metaKey: true })
    fireEvent(link, clickEvent)

    expect(clickEvent.defaultPrevented).toBe(false)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
