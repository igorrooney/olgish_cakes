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

  it("renders the top-level custom cakes placeholder with live onward links", async () => {
    const view = await PlaceholderRoutePage({
      params: Promise.resolve({ placeholderSlug: "custom-cakes" }),
    });

    render(view);

    expect(
      screen.getByRole("heading", { name: /custom cake details are coming soon/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse celebration cakes/i })).toHaveAttribute(
      "href",
      "/cakes"
    );
    expect(screen.getByRole("link", { name: /send a custom brief/i })).toHaveAttribute(
      "href",
      "/get-custom-quote#quote-form"
    );
  });

  it("generates metadata for top-level placeholder pages", async () => {
    const metadata = await generateTopLevelMetadata({
      params: Promise.resolve({ placeholderSlug: "allergens" }),
    });

    expect(metadata.title).toBe("Detailed allergen guidance is coming soon");
    expect(metadata.alternates?.canonical).toBe("https://olgishcakes.co.uk/allergens");
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
