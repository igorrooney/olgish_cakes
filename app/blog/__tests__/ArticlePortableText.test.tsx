/**
 * @jest-environment jsdom
 */

import type { ImgHTMLAttributes } from 'react'
import { render, screen } from '@testing-library/react'
import { ArticlePortableText } from '../ArticlePortableText'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt = '',
    fill,
    priority,
    unoptimized,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean, priority?: boolean, unoptimized?: boolean }) => <img alt={alt} {...props} />
}))

describe('ArticlePortableText', () => {
  it('uses display typography for headings and calmer body typography for reading content', () => {
    render(
      <ArticlePortableText
        value={[
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: 'Paragraph copy' }],
            markDefs: []
          },
          {
            _type: 'block',
            style: 'h2',
            children: [{ _type: 'span', text: 'Section title' }],
            markDefs: []
          },
          {
            _type: 'block',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            children: [{ _type: 'span', text: 'Bullet item' }],
            markDefs: []
          },
          {
            _type: 'block',
            style: 'blockquote',
            children: [{ _type: 'span', text: 'Quoted copy' }],
            markDefs: []
          }
        ]}
      />
    )

    expect(screen.getByText('Paragraph copy').closest('p')?.className).toContain('font-body')
    expect(screen.getByRole('heading', { level: 2, name: 'Section title' }).className).toContain('font-oldenburg')
    expect(screen.getByText('Bullet item').closest('ul')?.className).toContain('font-body')
    expect(screen.getByText('Quoted copy').closest('blockquote')?.className).toContain('font-body')
  })
})
