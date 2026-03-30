import Link from "next/link";
import type { ArticleTopic } from "@/lib/articles";
import { getBlogArchiveHref } from "@/lib/articles";

interface ArticleTopicFilterProps {
  topics: ArticleTopic[];
  activeTopic?: string;
}

export function ArticleTopicFilter({ topics, activeTopic }: ArticleTopicFilterProps) {
  const baseClassName =
    "btn min-h-11 h-11 rounded-full border px-4 normal-case shadow-none transition-colors font-sans text-sm font-semibold";

  return (
    <div className="flex flex-wrap gap-2" aria-label="Article topics">
      <Link
        href={getBlogArchiveHref({})}
        className={`${baseClassName} ${
          !activeTopic
            ? "border-primary-500 bg-primary-500 text-primary-content hover:border-primary-800 hover:bg-primary-800"
            : "border-base-300 bg-base-100 text-base-content hover:border-primary-400 hover:text-primary-500"
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
                ? "border-primary-500 bg-primary-500 text-primary-content hover:border-primary-800 hover:bg-primary-800"
                : "border-base-300 bg-base-100 text-base-content hover:border-primary-400 hover:text-primary-500"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {topicOption.title}
          </Link>
        );
      })}
    </div>
  );
}
