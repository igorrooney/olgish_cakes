import Link from 'next/link'
import type { ArticleTopic } from '@/lib/articles'
import { getBlogArchiveHref } from '@/lib/articles'

interface ArticleTopicFilterProps {
  topics: ArticleTopic[]
  activeTopic?: string
}

export function ArticleTopicFilter({ topics, activeTopic }: ArticleTopicFilterProps) {
  const panelId = activeTopic
    ? `blog-topic-filter-panel-${activeTopic}`
    : 'blog-topic-filter-panel'
  const baseClassName =
    'badge badge-lg h-11 min-h-11 rounded-selector border px-4 font-sans text-sm font-semibold normal-case transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
  const toggleButtonClassName =
    'btn btn-outline min-h-11 rounded-selector border-primary-500 bg-primary-50/85 px-4 font-sans text-sm font-semibold normal-case text-primary-800 shadow-none hover:border-primary-600 hover:bg-primary-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'

  const renderTopicLinks = () => (
    <>
      <Link
        href={getBlogArchiveHref({})}
        className={`${baseClassName} ${
          !activeTopic
            ? 'border-primary-500 bg-primary-50/85 text-primary-800 shadow-none hover:border-primary-600 hover:bg-primary-100/80'
            : 'border-base-300/70 bg-transparent text-base-content/72 hover:border-primary-300 hover:bg-primary-50/35 hover:text-primary-700'
        }`}
        aria-current={!activeTopic ? 'page' : undefined}
      >
        All stories
      </Link>
      {topics.map(topicOption => {
        const isActive = activeTopic === topicOption.slug

        return (
          <Link
            key={topicOption._id}
            href={getBlogArchiveHref({ topic: topicOption.slug })}
            className={`${baseClassName} ${
              isActive
                ? 'border-primary-500 bg-primary-50/85 text-primary-800 shadow-none hover:border-primary-600 hover:bg-primary-100/80'
                : 'border-base-300/70 bg-transparent text-base-content/72 hover:border-primary-300 hover:bg-primary-50/35 hover:text-primary-700'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {topicOption.title}
          </Link>
        )
      })}
    </>
  )

  const activeTopicOption = topics.find(topic => topic.slug === activeTopic)

  return (
    <div className='pb-1'>
      <details className='collapse collapse-arrow rounded-box border border-base-300 bg-base-100 tablet:hidden'>
        <summary
          className='collapse-title min-h-11 rounded-selector p-0 pr-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
          aria-controls={panelId}
          role='button'
        >
          <span className={toggleButtonClassName}>
            Browse topics
          </span>
        </summary>
        <div className='collapse-content'>
          <div
            id={panelId}
            className='flex flex-wrap gap-2.5 pt-3'
            aria-label='Article topics'
          >
            {renderTopicLinks()}
          </div>
        </div>
      </details>
      {activeTopicOption ? (
        <span className='sr-only'>Current topic: {activeTopicOption.title}</span>
      ) : null}
      <div className='hidden flex-wrap gap-2.5 tablet:flex' aria-label='Article topics'>
        {renderTopicLinks()}
      </div>
    </div>
  )
}
