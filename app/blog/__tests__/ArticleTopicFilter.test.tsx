/**
 * @jest-environment jsdom
 */

import { render, screen, within } from "@testing-library/react";
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
  function getMobileDisclosure() {
    return screen.getByRole("button", { name: "Browse topics" }).closest("details") as HTMLDetailsElement;
  }

  it("renders crawlable links that reset pagination when a topic is selected", () => {
    render(<ArticleTopicFilter topics={topics} />);
    const mobileRegion = getMobileDisclosure();

    expect(within(mobileRegion).getByRole("link", { name: "All stories" })).toHaveAttribute(
      "href",
      "/blog"
    );
    expect(within(mobileRegion).getByRole("link", { name: "Cake by post" })).toHaveAttribute(
      "href",
      "/blog?topic=cake-by-post"
    );
    expect(within(mobileRegion).getByRole("link", { name: "Custom cakes" })).toHaveAttribute(
      "href",
      "/blog?topic=custom-cakes"
    );
  });

  it("marks the active topic link as the current page", () => {
    render(<ArticleTopicFilter topics={topics} activeTopic="cake-by-post" />);
    const mobileRegion = getMobileDisclosure();
    const links = within(mobileRegion).getAllByRole("link", { name: "Cake by post" });

    expect(links).toHaveLength(2);
    links.forEach(link => expect(link).toHaveAttribute("aria-current", "page"));
    expect(
      within(mobileRegion).getByRole("link", { name: "All stories" })
    ).not.toHaveAttribute("aria-current");
  });

  it("uses 44px touch targets for topic chips", () => {
    render(<ArticleTopicFilter topics={topics} />);
    const mobileRegion = getMobileDisclosure();
    const allStoriesLink = within(mobileRegion).getByRole("link", { name: "All stories" });
    const trigger = screen.getByRole("button", { name: "Browse topics" });

    expect(allStoriesLink.className).toContain("min-h-11");
    expect(allStoriesLink.className).toContain("h-11");
    expect(allStoriesLink.className).not.toContain("btn-sm");
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("h-11");
  });

  it("renders a native mobile disclosure with topics inside the details element", () => {
    render(<ArticleTopicFilter topics={topics} />);

    const trigger = screen.getByRole("button", { name: "Browse topics" });
    const mobileRegion = getMobileDisclosure();
    const summary = trigger.closest("summary");

    expect(trigger).toHaveAttribute("aria-controls", "blog-topic-filter-panel");
    expect(summary).toBeInTheDocument();
    expect(summary?.parentElement).toBe(mobileRegion);
    expect(mobileRegion.open).toBe(false);
    expect(within(mobileRegion).getByRole("link", { name: "All stories" })).toBeInTheDocument();
  });

  it("shows the active chip next to the mobile disclosure trigger and keeps the panel wrapped", () => {
    render(<ArticleTopicFilter topics={topics} activeTopic="custom-cakes" />);
    const mobileRegion = getMobileDisclosure();

    expect(screen.getByRole("button", { name: "Browse topics" })).toHaveAttribute(
      "aria-controls",
      "blog-topic-filter-panel-custom-cakes"
    );
    expect(screen.getAllByRole("link", { name: "Custom cakes" })[0]).toHaveAttribute(
      "aria-current",
      "page"
    );
    const topicsRow = within(mobileRegion).getByLabelText("Article topics");

    expect(topicsRow.className).toContain("flex-wrap");
    expect(topicsRow.className).not.toContain("flex-nowrap");
    expect(topicsRow.className).not.toContain("overflow-x-auto");
    expect(within(mobileRegion).getAllByRole("link", { name: "Custom cakes" })[0]).toHaveAttribute(
      "href",
      "/blog?topic=custom-cakes"
    );
  });
});
