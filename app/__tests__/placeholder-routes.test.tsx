/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import LearnPlaceholderPage, {
  generateMetadata as generateLearnMetadata,
} from "../learn/[[...slug]]/page";
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

  it("renders the learn root placeholder and uses blog links as the live fallback", async () => {
    const view = await LearnPlaceholderPage({
      params: Promise.resolve({}),
    });

    render(view);

    expect(
      screen.getByRole("heading", { name: /the learn hub is being assembled/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read the blog/i })).toHaveAttribute("href", "/blog");
  });

  it("renders nested learn placeholders and generates metadata for them", async () => {
    const view = await LearnPlaceholderPage({
      params: Promise.resolve({ slug: ["guides"] }),
    });

    render(view);

    expect(
      screen.getByRole("heading", { name: /more practical guides are coming soon/i })
    ).toBeInTheDocument();

    const metadata = await generateLearnMetadata({
      params: Promise.resolve({ slug: ["customer-stories"] }),
    });

    expect(metadata.title).toBe("Customer stories are being gathered");
    expect(metadata.alternates?.canonical).toBe("https://olgishcakes.co.uk/learn/customer-stories");
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

  it("calls notFound for unsupported learn paths", async () => {
    await expect(
      LearnPlaceholderPage({
        params: Promise.resolve({ slug: ["guides", "extra"] }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    await expect(
      LearnPlaceholderPage({
        params: Promise.resolve({ slug: ["workshops"] }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    await expect(
      LearnPlaceholderPage({
        params: Promise.resolve({ slug: ["unknown-section"] }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
