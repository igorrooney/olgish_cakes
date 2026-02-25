import type { StructureResolver } from 'sanity/structure'
import { apiVersion } from './env'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = S =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Catalog')
        .child(
          S.list()
            .title('Catalog')
            .items([
              S.documentTypeListItem('cake').title('Cakes'),
              S.documentTypeListItem('giftHamper').title('Gift Hampers'),
              S.divider(),
              S.documentTypeListItem('cakeFillingType').title('Cake Filling Types'),
              S.documentTypeListItem('collection').title('Cakes Collections'),
              S.documentTypeListItem('giftHamperCollection').title('Gift Hampers Collections')
            ])
        ),
      S.listItem()
        .title('Merchandising')
        .child(
          S.list()
            .title('Merchandising')
            .items([
              S.listItem()
                .title('Cakes Featured Offer')
                .child(
                  S.document()
                    .schemaType('cakesFeaturedOffer')
                    .documentId('cakesFeaturedOffer')
                ),
              S.listItem()
                .title('Cakes Delivery Section')
                .child(
                  S.document()
                    .schemaType('cakesDeliverySection')
                    .documentId('cakesDeliverySection')
                ),
              S.listItem()
                .title('Gift Hampers Delivery Section')
                .child(
                  S.document()
                    .schemaType('giftHampersDeliverySection')
                    .documentId('giftHampersDeliverySection')
                ),
              S.listItem()
                .title('Collections Display Order')
                .child(
                  S.document()
                    .schemaType('collectionsDisplayOrder')
                    .documentId('collectionsDisplayOrder')
                ),
              S.listItem()
                .title('Products Display Order')
                .child(
                  S.document()
                    .schemaType('productsDisplayOrder')
                    .documentId('productsDisplayOrder')
                )
            ])
        ),
      S.listItem()
        .title('Content Marketing')
        .child(
          S.list()
            .title('Content Marketing')
            .items([
              S.documentTypeListItem('testimonial').title('Testimonials'),
              S.documentTypeListItem('faq').title('FAQs'),
              S.documentTypeListItem('blogPost').title('Blog Posts'),
              S.documentTypeListItem('ingredient').title('Ingredients')
            ])
        ),
      S.listItem()
        .title('Operations')
        .child(
          S.list()
            .title('Operations')
            .items([
              S.listItem()
                .title('Orders')
                .child(
                  S.list()
                    .title('Order Management')
                    .items([
                      S.listItem()
                        .title('All Orders')
                        .child(
                          S.documentTypeList('order')
                            .title('All Orders')
                            .apiVersion(apiVersion)
                            .filter('_type == "order"')
                            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                        ),
                      S.listItem()
                        .title('New Orders')
                        .child(
                          S.documentTypeList('order')
                            .title('New Orders')
                            .apiVersion(apiVersion)
                            .filter('_type == "order" && status == "new"')
                            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                        ),
                      S.listItem()
                        .title('In Progress')
                        .child(
                          S.documentTypeList('order')
                            .title('Orders In Progress')
                            .apiVersion(apiVersion)
                            .filter('_type == "order" && status in ["confirmed", "in-progress"]')
                            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                        ),
                      S.listItem()
                        .title('Ready for Pickup')
                        .child(
                          S.documentTypeList('order')
                            .title('Ready for Pickup')
                            .apiVersion(apiVersion)
                            .filter('_type == "order" && status == "ready-pickup"')
                            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                        ),
                      S.listItem()
                        .title('Completed')
                        .child(
                          S.documentTypeList('order')
                            .title('Completed Orders')
                            .apiVersion(apiVersion)
                            .filter('_type == "order" && status in ["delivered", "completed"]')
                            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                        )
                    ])
                ),
              S.listItem()
                .title('Market Schedule')
                .child(
                  S.list()
                    .title('Market Events')
                    .items([
                      S.listItem()
                        .title('All Events')
                        .child(
                          S.documentTypeList('marketSchedule')
                            .title('All Market Events')
                            .apiVersion(apiVersion)
                            .filter('_type == "marketSchedule"')
                            .defaultOrdering([{ field: 'date', direction: 'desc' }])
                        ),
                      S.listItem()
                        .title('Upcoming Events')
                        .child(
                          S.documentTypeList('marketSchedule')
                            .title('Upcoming Events')
                            .apiVersion(apiVersion)
                            .filter('_type == "marketSchedule" && date >= now() && active == true')
                            .defaultOrdering([{ field: 'date', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Featured Events')
                        .child(
                          S.documentTypeList('marketSchedule')
                            .title('Featured Events')
                            .apiVersion(apiVersion)
                            .filter('_type == "marketSchedule" && featured == true && active == true')
                            .defaultOrdering([{ field: 'date', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Past Events')
                        .child(
                          S.documentTypeList('marketSchedule')
                            .title('Past Events')
                            .apiVersion(apiVersion)
                            .filter('_type == "marketSchedule" && date < now()')
                            .defaultOrdering([{ field: 'date', direction: 'desc' }])
                        )
                    ])
                )
            ])
        )
    ])
