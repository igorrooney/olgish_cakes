/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CopyEnquirySummaryButton } from '../CopyEnquirySummaryButton'

describe('CopyEnquirySummaryButton', () => {
  const originalClipboard = navigator.clipboard

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard
    })
    jest.useRealTimers()
  })

  it('copies the enquiry summary to the clipboard', async () => {
    jest.useFakeTimers()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    })

    render(<CopyEnquirySummaryButton summaryText='Customer summary' />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy summary' }))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Customer summary')
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    })

    act(() => {
      jest.advanceTimersByTime(1800)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy summary' })).toBeInTheDocument()
    })
  })
})
