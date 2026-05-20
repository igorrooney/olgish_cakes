/**
 * @jest-environment jsdom
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ValidatorInput } from '../ValidatorInput'

describe('ValidatorInput error card', () => {
  const calendarAriaFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const formatCalendarButtonName = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    return calendarAriaFormatter.format(new Date(year, month - 1, day))
  }

  it('renders helper text for standard inputs and wires aria-describedby', () => {
    render(
      <ValidatorInput
        id='fullName'
        type='text'
        placeholder='Enter name'
        value=''
        label='Full Name:'
        hintText='Enter your full name'
        onValueChange={() => {}}
      />
    )

    expect(screen.getByText('Enter your full name')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name:')).toHaveAttribute(
      'aria-describedby',
      'fullName-hint'
    )
  })

  it('renders a visible error card for input field', () => {
    render(
      <ValidatorInput
        id='fullName'
        type='text'
        placeholder='Enter name'
        value=''
        label='Full Name:'
        error='Name is required'
        hintText='Enter your full name'
        onValueChange={() => {}}
      />
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeVisible()
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(alert).toHaveTextContent('Name is required')
    expect(screen.getByLabelText('Full Name:')).toHaveAttribute(
      'aria-describedby',
      'fullName-hint fullName-error'
    )
  })

  it('renders a visible error card for select field', () => {
    render(
      <ValidatorInput
        fieldType='select'
        id='occasion'
        value=''
        label='Occasion'
        options={[
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Birthday', value: 'birthday' }
        ]}
        error='Please select an occasion'
        hintText='Select an occasion'
        onValueChange={() => {}}
      />
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeVisible()
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(alert).toHaveTextContent('Please select an occasion')
    expect(screen.getByRole('combobox', { name: 'Occasion' })).toHaveAttribute(
      'aria-describedby',
      'occasion-hint occasion-error'
    )
  })

  it('applies custom className to select field when provided', () => {
    render(
      <ValidatorInput
        fieldType='select'
        id='occasion'
        value=''
        label='Occasion'
        options={[
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Birthday', value: 'birthday' }
        ]}
        selectClassName='cursor-pointer'
        hintText='Select an occasion'
        onValueChange={() => {}}
      />
    )

    expect(screen.getByLabelText('Occasion')).toHaveClass('cursor-pointer')
  })

  it('applies cursor-pointer class to select trigger by default', () => {
    render(
      <ValidatorInput
        fieldType='select'
        id='occasion'
        value=''
        label='Occasion'
        options={[
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Birthday', value: 'birthday' }
        ]}
        hintText='Select an occasion'
        onValueChange={() => {}}
      />
    )

    expect(screen.getByLabelText('Occasion')).toHaveClass('cursor-pointer')
  })

  it('renders placeholder text for the empty disabled option', () => {
    render(
      <ValidatorInput
        fieldType='select'
        id='occasion'
        value=''
        label='Occasion'
        options={[
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Birthday', value: 'birthday' }
        ]}
        hintText='Select an occasion'
        onValueChange={() => {}}
      />
    )

    expect(screen.getByRole('combobox', { name: 'Occasion' })).toHaveTextContent('Select from list')
  })

  it('opens listbox and selects an enabled option', () => {
    const handleValueChange = jest.fn()

    render(
      <ValidatorInput
        fieldType='select'
        id='occasion'
        value=''
        label='Occasion'
        options={[
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Birthday', value: 'birthday' }
        ]}
        hintText='Select an occasion'
        onValueChange={handleValueChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Occasion' }))
    fireEvent.click(screen.getByRole('option', { name: 'Birthday' }))

    expect(handleValueChange).toHaveBeenCalledWith('birthday')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not select the disabled placeholder option', () => {
    const handleValueChange = jest.fn()

    render(
      <ValidatorInput
        fieldType='select'
        id='occasion'
        value=''
        label='Occasion'
        options={[
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Birthday', value: 'birthday' }
        ]}
        hintText='Select an occasion'
        onValueChange={handleValueChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Occasion' }))
    fireEvent.click(screen.getByRole('option', { name: 'Select from list' }))

    expect(handleValueChange).not.toHaveBeenCalled()
  })

  it('exposes combobox semantics and active descendant while open', () => {
    render(
      <ValidatorInput
        fieldType='select'
        id='occasion'
        value=''
        label='Occasion'
        options={[
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Birthday', value: 'birthday' },
          { label: 'Wedding', value: 'wedding' }
        ]}
        hintText='Select an occasion'
        onValueChange={() => {}}
      />
    )

    const trigger = screen.getByRole('combobox', { name: 'Occasion' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).not.toHaveAttribute('aria-activedescendant')

    fireEvent.click(trigger)

    const birthdayOption = screen.getByRole('option', { name: 'Birthday' })
    const weddingOption = screen.getByRole('option', { name: 'Wedding' })

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-activedescendant', birthdayOption.id)
    expect(trigger).toHaveAttribute('aria-controls', 'occasion-listbox')
    expect(birthdayOption.id).toBe('occasion-listbox-option-1')
    expect(weddingOption.id).toBe('occasion-listbox-option-2')
  })

  it('supports keyboard navigation, selection, and escape', () => {
    const handleValueChange = jest.fn()

    function ControlledSelectHarness() {
      const [value, setValue] = React.useState('')

      return (
        <ValidatorInput
          fieldType='select'
          id='occasion'
          value={value}
          label='Occasion'
          options={[
            { label: 'Select from list', value: '', disabled: true },
            { label: 'Birthday', value: 'birthday' },
            { label: 'Wedding', value: 'wedding' }
          ]}
          hintText='Select an occasion'
          onValueChange={(nextValue) => {
            handleValueChange(nextValue)
            setValue(nextValue)
          }}
        />
      )
    }

    render(<ControlledSelectHarness />)

    const trigger = screen.getByRole('combobox', { name: 'Occasion' })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Birthday' }).id)

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Wedding' }).id)
    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(handleValueChange).toHaveBeenCalledWith('wedding')
    expect(trigger).toHaveFocus()
    expect(trigger).not.toHaveAttribute('aria-activedescendant')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Wedding' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).not.toHaveAttribute('aria-activedescendant')
  })

  it('closes listbox on outside click', () => {
    render(
      <div>
        <button type='button'>Outside</button>
        <ValidatorInput
          fieldType='select'
          id='occasion'
          value=''
          label='Occasion'
          options={[
            { label: 'Select from list', value: '', disabled: true },
            { label: 'Birthday', value: 'birthday' }
          ]}
          hintText='Select an occasion'
          onValueChange={() => {}}
        />
      </div>
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Occasion' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('applies cursor-pointer class to date picker trigger', () => {
    render(
      <ValidatorInput
        id='date'
        type='date'
        placeholder='Select a date'
        value=''
        label='When do you need it?'
        hintText='Select a date'
        onValueChange={() => {}}
      />
    )

    const dateTrigger = screen.getByRole('button', { name: /when do you need it/i })
    expect(dateTrigger).toHaveClass('cursor-pointer')
    expect(dateTrigger).toHaveAttribute('aria-haspopup', 'dialog')
  })

  it('renders a custom date picker calendar and selects an enabled date', () => {
    const handleValueChange = jest.fn()

    render(
      <ValidatorInput
        fieldType='datePicker'
        id='date'
        placeholder='Select a date'
        value=''
        label='When do you need it?'
        hintText='Select a date'
        min='2026-03-18'
        onValueChange={handleValueChange}
      />
    )

    const trigger = screen.getByRole('button', { name: /when do you need it/i })

    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('data-min-date', '2026-03-18')

    fireEvent.click(trigger)

    expect(screen.getByRole('dialog')).toHaveTextContent('March 2026')
    expect(screen.getByRole('button', { name: /17 March 2026 is not available/i })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', {
      name: new RegExp(`select ${formatCalendarButtonName('2026-03-19')}`, 'i')
    }))

    expect(handleValueChange).toHaveBeenCalledWith('2026-03-19')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('supports keyboard movement and escape in the custom date picker', () => {
    render(
      <ValidatorInput
        fieldType='datePicker'
        id='date'
        placeholder='Select a date'
        value=''
        label='When do you need it?'
        hintText='Select a date'
        min='2026-03-18'
        onValueChange={() => {}}
      />
    )

    const trigger = screen.getByRole('button', { name: /when do you need it/i })

    fireEvent.click(trigger)

    const minDateButton = screen.getByRole('button', {
      name: new RegExp(`select ${formatCalendarButtonName('2026-03-18')}`, 'i')
    })
    const nextDateButton = screen.getByRole('button', {
      name: new RegExp(`select ${formatCalendarButtonName('2026-03-19')}`, 'i')
    })

    expect(minDateButton).toHaveFocus()

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' })

    expect(nextDateButton).toHaveFocus()

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('renders a visible error card for textarea field', () => {
    render(
      <ValidatorInput
        fieldType='textarea'
        id='requirements'
        value=''
        label='Requirements'
        placeholder='Enter requirements'
        error='Requirements are required'
        hintText='Enter requirements'
        onValueChange={() => {}}
      />
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeVisible()
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(alert).toHaveTextContent('Requirements are required')
    expect(screen.getByRole('textbox', { name: 'Requirements' })).toHaveAttribute(
      'aria-describedby',
      'requirements-hint requirements-error'
    )
  })

  it('renders a visible error card for upload field', () => {
    render(
      <ValidatorInput
        fieldType='upload'
        id='referenceImage'
        label='Upload a reference image'
        error='Image must be 5MB or smaller'
        hintText='Upload a reference image'
      />
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeVisible()
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(alert).toHaveTextContent('Image must be 5MB or smaller')
  })

  it('renders upload format and size helper text as a readable sentence', () => {
    render(
      <ValidatorInput
        fieldType='upload'
        id='referenceImage'
        label='Upload a reference image'
        hintText='Upload a reference image'
        infoLeft='JPEG, PNG, HEIC'
        infoRight='5MB max'
      />
    )

    expect(screen.getByText('JPEG, PNG, HEIC. 5MB max')).toBeInTheDocument()
    expect(screen.queryByText(/HEIC5MB max/i)).not.toBeInTheDocument()
  })

  it('hydrates select and date inputs without changing deterministic ids or attributes', () => {
    const originalMessageChannel = global.MessageChannel
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    class TestMessagePort {
      onmessage: ((event: { data: unknown }) => void) | null = null

      postMessage(data: unknown) {
        this.onmessage?.({ data })
      }

      start() {}

      close() {}

      addEventListener() {}

      removeEventListener() {}
    }

    class TestMessageChannel {
      port1 = new TestMessagePort()
      port2 = new TestMessagePort()
    }

    global.MessageChannel = TestMessageChannel as typeof MessageChannel
    const { hydrateRoot } = require('react-dom/client')
    const { renderToString } = require('react-dom/server')
    const container = document.createElement('div')
    const element = (
      <div>
        <ValidatorInput
          fieldType='select'
          id='occasion'
          value=''
          label='Occasion'
          options={[
            { label: 'Select from list', value: '', disabled: true },
            { label: 'Birthday', value: 'birthday' }
          ]}
          hintText='Select an occasion'
          onValueChange={() => {}}
        />
        <ValidatorInput
          id='date'
          type='date'
          placeholder='Select a date'
          value=''
          label='When do you need it?'
          hintText='Select a date'
          min='2026-03-18'
          onValueChange={() => {}}
        />
      </div>
    )

    container.innerHTML = renderToString(element)

    let root: { unmount: () => void } | undefined

    act(() => {
      root = hydrateRoot(container, element)
    })

    const combobox = container.querySelector('[role="combobox"]')
    const dateTrigger = container.querySelector('#date')

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(combobox?.getAttribute('aria-controls')).toBe('occasion-listbox')
    expect(dateTrigger?.getAttribute('data-min-date')).toBe('2026-03-18')

    act(() => {
      root?.unmount()
    })

    global.MessageChannel = originalMessageChannel
    consoleErrorSpy.mockRestore()
  })
})
