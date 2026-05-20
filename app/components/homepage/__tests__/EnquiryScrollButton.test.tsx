/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { EnquiryScrollButton } from '../EnquiryScrollButton'

const createHeading = () => {
  const heading = document.createElement('h2')
  heading.id = 'custom-cake-enquiry-heading'
  const scrollIntoViewMock = jest.fn()
  Object.defineProperty(heading, 'scrollIntoView', {
    value: scrollIntoViewMock,
    writable: true
  })
  document.body.appendChild(heading)
  return { heading, scrollIntoViewMock }
}

describe('EnquiryScrollButton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    jest.restoreAllMocks()
  })

  it('scrolls to the enquiry heading on click', () => {
    const { scrollIntoViewMock } = createHeading()

    render(
      <EnquiryScrollButton className='btn'>
        Custom cake enquiry form
      </EnquiryScrollButton>
    )

    fireEvent.click(screen.getByRole('button', { name: /custom cake enquiry form/i }))

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('does not throw when the heading is missing', () => {
    const getByIdSpy = jest.spyOn(document, 'getElementById')

    render(
      <EnquiryScrollButton className='btn'>
        Custom cake enquiry form
      </EnquiryScrollButton>
    )

    fireEvent.click(screen.getByRole('button', { name: /custom cake enquiry form/i }))

    expect(getByIdSpy).toHaveBeenCalledWith('custom-cake-enquiry-heading')
  })
})
