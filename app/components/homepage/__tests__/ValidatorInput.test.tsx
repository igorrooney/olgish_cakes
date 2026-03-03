/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ValidatorInput } from '../ValidatorInput'

describe('ValidatorInput error card', () => {
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
})
