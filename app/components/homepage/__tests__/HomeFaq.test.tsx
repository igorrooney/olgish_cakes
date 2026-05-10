/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { HomeFaq } from '../HomeFaq'

describe('HomeFaq', () => {
  it('renders the FAQ section content', () => {
    render(<HomeFaq />)

    expect(screen.getByRole('heading', { name: 'Cake FAQ' })).toBeInTheDocument()
    expect(screen.getByText('What is Medovik honey cake?')).toBeInTheDocument()
    expect(screen.getByText('Do you make Napoleon cake in Leeds?')).toBeInTheDocument()
    expect(screen.getByText('Do you deliver cakes across the UK?')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(5)
    expect(screen.getByRole('checkbox', {
      name: 'Toggle answer for What is Medovik honey cake?'
    })).toBeInTheDocument()
  })
})
