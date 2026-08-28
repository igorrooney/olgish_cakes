/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import type { CSSProperties } from 'react'
import { OlgishCakesFounder } from '../OlgishCakesFounder'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    style
  }: {
    src: string
    alt: string
    width?: number
    height?: number
    style?: CSSProperties
  }) => (
    <img src={src} alt={alt} width={width} height={height} style={style} />
  )
}))

describe('OlgishCakesFounder', () => {
  it('uses each decorative image at its natural aspect ratio', () => {
    const { container } = render(<OlgishCakesFounder />)
    const topCorner = container.querySelector('img[src="/design/top_left_corner.png"]')
    const bottomCorner = container.querySelector('img[src="/design/bottom_right_corner.png"]')

    expect(topCorner).toHaveAttribute('width', '79')
    expect(topCorner).toHaveAttribute('height', '59')
    expect(topCorner).toHaveStyle({ width: '79px', height: '59px' })
    expect(bottomCorner).toHaveAttribute('width', '75')
    expect(bottomCorner).toHaveAttribute('height', '59')
    expect(bottomCorner).toHaveStyle({ width: '75px', height: '59px' })
  })
})
