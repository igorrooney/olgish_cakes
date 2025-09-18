import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = S =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("cake").title("Cakes"),
      S.documentTypeListItem("giftHamper").title("Gift Hampers"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.documentTypeListItem("blogPost").title("Blog Posts"),
      S.divider(),
      // Market Schedule section
      S.listItem()
        .title("Market Schedule")
        .child(
          S.list()
            .title("Market Events")
            .items([
              S.listItem()
                .title("All Events")
                .child(
                  S.documentTypeList("marketSchedule")
                    .title("All Market Events")
                    .filter('_type == "marketSchedule"')
                    .defaultOrdering([{ field: "date", direction: "desc" }])
                ),
              S.listItem()
                .title("Upcoming Events")
                .child(
                  S.documentTypeList("marketSchedule")
                    .title("Upcoming Events")
                    .filter('_type == "marketSchedule" && date >= now() && active == true')
                    .defaultOrdering([{ field: "date", direction: "asc" }])
                ),
              S.listItem()
                .title("Featured Events")
                .child(
                  S.documentTypeList("marketSchedule")
                    .title("Featured Events")
                    .filter('_type == "marketSchedule" && featured == true && active == true')
                    .defaultOrdering([{ field: "date", direction: "asc" }])
                ),
              S.listItem()
                .title("Past Events")
                .child(
                  S.documentTypeList("marketSchedule")
                    .title("Past Events")
                    .filter('_type == "marketSchedule" && date < now()')
                    .defaultOrdering([{ field: "date", direction: "desc" }])
                ),
            ])
        ),
    ]);
