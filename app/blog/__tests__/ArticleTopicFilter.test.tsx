/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { ArticleTopicFilter } from "../ArticleTopicFilter";

const topics = [
  {
    _id: "topic-1",
    title: "Cake by post",
    slug: "cake-by-post",
  },
  {
    _id: "topic-2",
    title: "Custom cakes",
    slug: "custom-cakes",
  },
];

describe("ArticleTopicFilter", () => {
  it("renders crawlable links that reset pagination when a topic is selected", () => {
    render(<ArticleTopicFilter topics={topics} />);

    expect(screen.getByRole("link", { name: "All stories" })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: "Cake by post" })).toHaveAttribute(
      "href",
      "/blog?topic=cake-by-post"
    );
    expect(screen.getByRole("link", { name: "Custom cakes" })).toHaveAttribute(
      "href",
      "/blog?topic=custom-cakes"
    );
  });

  it("marks the active topic link as the current page", () => {
    render(<ArticleTopicFilter topics={topics} activeTopic="cake-by-post" />);

    expect(screen.getByRole("link", { name: "Cake by post" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "All stories" })).not.toHaveAttribute("aria-current");
  });

  it("uses 44px touch targets for topic chips", () => {
    render(<ArticleTopicFilter topics={topics} />);

    const allStoriesLink = screen.getByRole("link", { name: "All stories" });

    expect(allStoriesLink.className).toContain("min-h-11");
    expect(allStoriesLink.className).toContain("h-11");
    expect(allStoriesLink.className).not.toContain("btn-sm");
  });
});
