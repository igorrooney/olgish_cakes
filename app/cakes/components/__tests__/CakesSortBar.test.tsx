import { fireEvent, render, screen } from '@testing-library/react'
import { CakesSortBar } from '../CakesSortBar'

describe('CakesSortBar', () => {
  it('renders all sort options', () => {
    render(<CakesSortBar selectedSort='new' onSelectSort={() => {}} />)

    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Price: High to low' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Price: Low to high' })).toBeInTheDocument()
  })

  it('applies active classes and shows checkmark only for the active option', () => {
    render(<CakesSortBar selectedSort='priceHighToLow' onSelectSort={() => {}} />)

    const activeButton = screen.getByRole('button', { name: 'Price: High to low' })
    const inactiveButton = screen.getByRole('button', { name: 'New' })

    expect(activeButton).toHaveClass('border-primary', 'bg-primary', 'text-primary-content')
    expect(activeButton.querySelector('svg')).toBeInTheDocument()

    expect(inactiveButton).toHaveClass('border-transparent', 'bg-primary-50', 'text-base-content/55')
    expect(inactiveButton.querySelector('svg')).not.toBeInTheDocument()
  })

  it('applies tablet size and spacing classes to all sort buttons', () => {
    render(<CakesSortBar selectedSort='new' onSelectSort={() => {}} />)

    const labels = ['New', 'Price: High to low', 'Price: Low to high']

    labels.forEach((label) => {
      const button = screen.getByRole('button', { name: label })

      expect(button).toHaveClass(
        'tablet:h-8',
        'tablet:min-h-8',
        'tablet:px-2',
        'tablet:gap-2',
        'tablet:rounded-btn'
      )
    })
  })

  it('keeps visible keyboard focus styles on sort buttons', () => {
    render(<CakesSortBar selectedSort='new' onSelectSort={() => {}} />)

    const button = screen.getByRole('button', { name: 'New' })

    expect(button).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-primary',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-base-100'
    )
    expect(button).not.toHaveClass('focus-visible:!shadow-none')
  })

  it('calls onSelectSort with the clicked option', () => {
    const onSelectSort = jest.fn()
    render(<CakesSortBar selectedSort='new' onSelectSort={onSelectSort} />)

    fireEvent.click(screen.getByRole('button', { name: 'Price: High to low' }))

    expect(onSelectSort).toHaveBeenCalledTimes(1)
    expect(onSelectSort).toHaveBeenCalledWith('priceHighToLow')
  })
})
