import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = S =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("cake").title("Cakes"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("faq").title("FAQs"),
    ]);
