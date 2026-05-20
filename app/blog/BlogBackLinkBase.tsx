import type { MouseEventHandler } from 'react'

const backLinkClassName = 'inline-flex items-center gap-2 text-base leading-none text-base-content transition-colors hover:text-primary-500'
const backLabelClassName = 'font-sans text-[16px] leading-6 text-base-content'

interface BlogBackLinkBaseProps {
  href: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export function BlogBackLinkBase({ href, onClick }: BlogBackLinkBaseProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={backLinkClassName}
      aria-label='Back to articles'
      data-testid='blog-back-link'
    >
      <span aria-hidden='true' className='text-[16px] leading-none'>&lsaquo;</span>
      <span className={backLabelClassName}>Back to articles</span>
    </a>
  )
}
