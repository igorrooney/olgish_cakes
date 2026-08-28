/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import PlaceholderRoutePage, {
  generateMetadata as generateTopLevelMetadata,
} from "../[placeholderSlug]/page";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("placeholder routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a remaining top-level placeholder with live onward links", async () => {
    const view = await PlaceholderRoutePage({
      params: Promise.resolve({ placeholderSlug: "farmers-markets" }),
    });

    render(view);

    expect(
      screen.getByRole("heading", { name: /market dates and visit details are coming soon/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/we are still putting together the full market calendar/i)).toBeInTheDocument();
    expect(screen.queryByText(/contact me/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ask about the next market/i })).toHaveAttribute(
      "href",
      "/contact"
    );
  });

  it("generates metadata for top-level placeholder pages", async () => {
    const metadata = await generateTopLevelMetadata({
      params: Promise.resolve({ placeholderSlug: "farmers-markets" }),
    });

    expect(metadata.title).toBe("Market dates and visit details are coming soon");
    expect(metadata.alternates?.canonical).toBe("https://olgishcakes.co.uk/farmers-markets");
    expect(metadata.robots?.index).toBe(false);
    expect(typeof metadata.robots === "object" && "googleBot" in metadata.robots
      ? metadata.robots.googleBot?.index
      : undefined).toBe(false);
  });

  it("calls notFound for unknown placeholder routes", async () => {
    await expect(
      PlaceholderRoutePage({
        params: Promise.resolve({ placeholderSlug: "missing-page" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });
});
