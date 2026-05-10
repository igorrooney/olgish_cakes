import Link from "next/link";
import type { ArticleTopic } from "@/lib/articles";
import { getBlogArchiveHref } from "@/lib/articles";

interface ArticleTopicFilterProps {
  topics: ArticleTopic[];
  activeTopic?: string;
}

export function ArticleTopicFilter({ topics, activeTopic }: ArticleTopicFilterProps) {
  const panelId = activeTopic
    ? `blog-topic-filter-panel-${activeTopic}`
    : "blog-topic-filter-panel";
  const baseClassName =
    "inline-flex h-11 min-h-11 items-center rounded-full border px-4 font-sans text-sm font-semibold normal-case tracking-[0.01em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";
  const toggleButtonClassName =
    "inline-flex h-11 min-h-11 cursor-pointer list-none items-center justify-center rounded-full border border-primary-500 bg-primary-50/85 px-4 font-sans text-sm font-semibold normal-case tracking-[0.01em] text-primary-800 transition-colors duration-200 hover:border-primary-600 hover:bg-primary-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 [&::-webkit-details-marker]:hidden";

  const renderTopicLinks = () => (
    <>
      <Link
        href={getBlogArchiveHref({})}
        className={`${baseClassName} ${
          !activeTopic
            ? "border-primary-500 bg-primary-50/85 text-primary-800 shadow-none hover:border-primary-600 hover:bg-primary-100/80"
            : "border-base-300/70 bg-transparent text-base-content/72 hover:border-primary-300 hover:bg-primary-50/35 hover:text-primary-700"
        }`}
        aria-current={!activeTopic ? "page" : undefined}
      >
        All stories
      </Link>
      {topics.map(topicOption => {
        const isActive = activeTopic === topicOption.slug;

        return (
          <Link
            key={topicOption._id}
            href={getBlogArchiveHref({ topic: topicOption.slug })}
            className={`${baseClassName} ${
              isActive
                ? "border-primary-500 bg-primary-50/85 text-primary-800 shadow-none hover:border-primary-600 hover:bg-primary-100/80"
                : "border-base-300/70 bg-transparent text-base-content/72 hover:border-primary-300 hover:bg-primary-50/35 hover:text-primary-700"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {topicOption.title}
          </Link>
        );
      })}
    </>
  );

  const activeTopicOption = topics.find(topic => topic.slug === activeTopic);

  return (
    <div className="pb-1">
      <details className="space-y-3 tablet:hidden">
        <summary className="list-none [&::-webkit-details-marker]:hidden">
          <span
            className={`${toggleButtonClassName} inline-flex`}
            aria-controls={panelId}
            role="button"
          >
            Browse topics
          </span>
        </summary>
        <div className="flex flex-wrap items-center gap-2.5">
          {activeTopicOption ? (
            <Link
              href={getBlogArchiveHref({ topic: activeTopicOption.slug })}
              className={`${baseClassName} border-primary-500 bg-primary-50/85 text-primary-800 shadow-none hover:border-primary-600 hover:bg-primary-100/80`}
              aria-current="page"
            >
              {activeTopicOption.title}
            </Link>
          ) : null}
        </div>
        <div id={panelId} className="flex flex-wrap gap-2.5" aria-label="Article topics">
          {renderTopicLinks()}
        </div>
      </details>
      <div className="hidden flex-wrap gap-2.5 tablet:flex" aria-label="Article topics">
        {renderTopicLinks()}
      </div>
    </div>
  );
}
