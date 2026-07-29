export type TermsSection = {
  id: string
  title: string
  paragraphs: readonly string[]
  items?: readonly string[]
  links?: readonly {
    label: string
    href: string
  }[]
}

export const termsSummaryItems = [
  'Sending a form or message is an order request, not an accepted order.',
  'We send a final written offer confirming the product, date, details and price.',
  'A contract starts only when you accept that offer in writing or make the requested payment.',
  'Made-to-order and perishable products have limited change-of-mind cancellation rights.',
  'Different cancellation rights apply to workshops and other services.',
  'Your rights for faulty, damaged or misdescribed products are not affected.',
  'Please tell us about allergies and dietary requirements with your request.'
] as const

export const termsSections: readonly TermsSection[] = [
  {
    id: 'trader-and-scope',
    title: '1. Who we are and when these terms apply',
    paragraphs: [
      'Olgish Cakes is the trading name of Olga Ieromenko, a sole trader at 15 Allerton Grange Avenue, Leeds, LS17 6PR, United Kingdom.',
      'These terms apply to products and services that we supply to customers in the United Kingdom, including cakes, desserts, postal products, workshops, delivery and collection. Please read them before sending an order request.'
    ]
  },
  {
    id: 'enquiries-and-contract',
    title: '2. Enquiries, order requests and contract formation',
    paragraphs: [
      'Submitting a website form, sending us a message, receiving an automated acknowledgement or discussing an idea with us is an order request only. It does not mean that we have accepted the request.',
      'If we can fulfil your request, we will personally send a final written offer confirming availability, the product or service, the agreed final details, the required date, delivery or collection arrangements, the final price and any payment deadline. Our offer is not a contract by itself.',
      'A binding contract starts only when you accept our final offer in writing or make the payment requested in that offer, whichever happens first. Until then, either you or we may decide not to proceed. Please check the offer carefully before accepting or paying and tell us promptly if anything is incorrect.',
      'You are responsible for giving us accurate contact, delivery, dietary and event information. We will confirm any agreed correction or material change in writing.'
    ]
  },
  {
    id: 'products-and-custom-orders',
    title: '3. Products and custom orders',
    paragraphs: [
      'Our products are handmade. Small differences in colour, decoration, size and finish are natural and will not make a product faulty where it still matches the agreed description.',
      'For a custom order, the specification in our final written offer, as accepted by you, takes priority over earlier discussions, inspiration images or website photographs. Screen colours and handmade decorations cannot always be reproduced exactly.',
      'If an ingredient or decoration becomes unavailable, we will contact you before making a material substitution. We may make a minor equivalent substitution that does not change the agreed character, quality or declared allergen information of the product.'
    ]
  },
  {
    id: 'price-and-payment',
    title: '4. Price and payment',
    paragraphs: [
      'Prices are quoted in pounds sterling. We are not VAT registered, so we do not charge VAT. The final price, any delivery charge, deposit and payment deadline will be stated in our final written offer.',
      'An estimate or earlier quote is not our final offer and may be withdrawn before a contract starts. If a deposit or payment is required before work begins, we are not required to reserve the date or start work until cleared payment is received.',
      'We will agree any additional price before carrying out a customer-requested change. We will not add hidden charges after the contract starts.'
    ]
  },
  {
    id: 'customer-changes',
    title: '5. Changes requested by you',
    paragraphs: [
      'Please ask for changes as early as possible. We will tell you whether the change is possible and whether it affects the price, collection or delivery time.',
      'We do not have to accept a change once ingredients or decorations have been ordered or preparation has begun. If we cannot accept a requested change, the original contract remains in place unless we agree a cancellation with you.'
    ]
  },
  {
    id: 'cancellations-and-refunds',
    title: '6. Cancellations and refunds',
    paragraphs: [
      'Goods made to your specification, clearly personalised goods and goods liable to deteriorate or expire rapidly do not have the usual 14-day change-of-mind cancellation right. We will tell you before the contract starts when this exception applies. It does not affect your rights if goods are faulty, damaged, not as described or not fit for purpose.',
      'The usual 14-day change-of-mind cancellation right does not apply to a workshop, catering service or another leisure service where the contract is for a specific date or period. We will tell you before the contract starts when this exception applies.',
      'For another service booked at a distance that is not covered by an exception, you will normally have 14 days from the day after the contract starts to change your mind. You can cancel by a clear statement sent by email, post or our contact form. The cancellation form below is optional.',
      'If you expressly ask us to start a service during the 14-day cancellation period and then cancel, we may charge a proportionate amount for the service properly supplied before cancellation. If the service is fully performed during that period after your express request and acknowledgement that the cancellation right will be lost on full performance, the cancellation right ends when the service is completed.',
      'Where no statutory change-of-mind right applies but we agree to a cancellation, we will refund payments made before work or purchasing specifically for your order has begun. After work or non-recoverable purchasing has begun, we may deduct a fair amount for work already completed and actual costs that we cannot reasonably recover, up to the contract price. We will explain any deduction.',
      'If we cancel because we cannot supply the order, we will refund the amount paid for anything not supplied. Nothing in this section limits any other statutory remedy.'
    ],
    items: [
      'Optional cancellation form: To Olgish Cakes, 15 Allerton Grange Avenue, Leeds, LS17 6PR, United Kingdom, hello@olgishcakes.co.uk — I give notice that I cancel my contract for the following service: [describe the service].',
      'Include your name, address, order or booking reference, contract date and the date you send the cancellation. Sign the form only if you send it on paper.'
    ]
  },
  {
    id: 'delivery-and-collection',
    title: '7. Delivery and collection',
    paragraphs: [
      'The agreed delivery or collection method, place and timing will be shown in our final written offer. Please make sure that someone is available to receive and safely store the product.',
      'For local delivery, responsibility passes to you when the order is handed to you or to a person you authorised. For postal products, your statutory delivery rights continue to apply until the product is delivered to you or a person you identified.',
      'If delivery or collection cannot be completed because the details you supplied are wrong or nobody is available, we will contact you. Any redelivery or storage charge must reflect our reasonable additional cost and will be agreed before we proceed.'
    ],
    links: [
      {
        label: 'Delivery and collection information',
        href: 'https://olgishcakes.co.uk/delivery'
      }
    ]
  },
  {
    id: 'damaged-or-faulty-products',
    title: '8. Damaged, faulty or incorrect products',
    paragraphs: [
      'Please inspect the order as soon as reasonably possible. If something is damaged, faulty or not what we agreed, contact us promptly with your order details and, where practical, photographs so we can investigate.',
      'For perishable products, contacting us within 24 hours usually gives us the best opportunity to assess the problem. This request does not remove or shorten your statutory rights.',
      'Where a product does not conform to the contract, we will provide the remedy required by law, which may include replacement, a price reduction or a refund depending on the circumstances.'
    ]
  },
  {
    id: 'allergens',
    title: '9. Allergens and dietary requirements',
    paragraphs: [
      'Our kitchen handles ingredients containing the 14 allergens that UK food businesses must declare, including cereals containing gluten, crustaceans, eggs, fish, peanuts, soya, milk, tree nuts, celery, mustard, sesame, sulphur dioxide and sulphites, lupin and molluscs. Not every allergen is used in every product. Although we use careful working practices, we cannot guarantee that any product is completely free from unintended cross-contact.',
      'Tell us about allergies, intolerances and dietary requirements with your request. Before you accept our final offer or pay, we will confirm whether we can meet the request and give you the product-specific allergen information available at that time. We will also provide written allergen information with food supplied at delivery or collection.',
      'Nothing in these terms removes our food-safety responsibilities or liability that the law does not allow us to exclude.'
    ],
    links: [
      {
        label: 'Olgish Cakes allergen guide',
        href: 'https://olgishcakes.co.uk/allergens'
      },
      {
        label: 'Food Standards Agency allergy guidance',
        href: 'https://www.food.gov.uk/safety-hygiene/food-allergy-and-intolerance'
      }
    ]
  },
  {
    id: 'website-and-intellectual-property',
    title: '10. Website use and intellectual property',
    paragraphs: [
      'You may use this website for personal, lawful purposes. Website text, photographs, illustrations, branding and original cake designs belong to us or are used with permission and must not be copied or used commercially without written permission.',
      'If you provide an image, logo or design, you confirm that we may use it to fulfil your order and that doing so will not infringe another person’s rights. We may refuse content that is unlawful, abusive or likely to infringe rights.'
    ]
  },
  {
    id: 'liability',
    title: '11. Our responsibility to you',
    paragraphs: [
      'We are responsible for loss or damage that is a foreseeable result of breaking the contract or failing to use reasonable care and skill. We are not responsible for loss that was not foreseeable when the contract started.',
      'We do not exclude or limit liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, breach of your statutory rights, or anything else that cannot lawfully be excluded.',
      'Our products are supplied for private use unless we agree otherwise in writing. We are not responsible for business losses arising from private consumer use.'
    ]
  },
  {
    id: 'events-beyond-control',
    title: '12. Events beyond our reasonable control',
    paragraphs: [
      'We are not responsible for delay or failure caused by an event beyond our reasonable control, but we will contact you as soon as reasonably possible and take steps to reduce the effect.',
      'If a significant delay means the order can no longer serve its agreed purpose, you may end the affected contract and receive a refund for anything paid but not supplied.'
    ]
  },
  {
    id: 'changes-to-terms',
    title: '13. Changes to these terms',
    paragraphs: [
      'We may update these terms for future order requests, for example to reflect changes in law or how we operate. The version included with our final offer and accepted when the contract started will continue to govern that contract unless a change is required by law or you agree to it in writing.',
      'We will not use a later version to reduce rights under an existing contract without your agreement. The date and version at the top of this page identify the current terms.'
    ]
  },
  {
    id: 'complaints-law-and-contact',
    title: '14. Complaints, governing law and contact',
    paragraphs: [
      'If you have a concern, please contact us first so we can try to resolve it promptly. Include your order number and the best way to reach you.',
      'These terms are governed by the law of England and Wales. If you are a consumer living elsewhere in the United Kingdom, you may also rely on mandatory local consumer protections and bring proceedings in the courts available to you under applicable law.',
      'Our current contact details are set out below.'
    ]
  }
] as const
