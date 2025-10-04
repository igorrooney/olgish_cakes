import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  icon: () => '📦',
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      description: 'Unique order identifier (auto-generated)',
      validation: Rule => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'New Order', value: 'new' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'In Progress', value: 'in-progress' },
          { title: 'Ready for Pickup', value: 'ready-pickup' },
          { title: 'Out for Delivery', value: 'out-delivery' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'dropdown'
      },
      initialValue: 'new',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'orderType',
      title: 'Order Type',
      type: 'string',
      options: {
        list: [
          { title: 'Browse Catalog', value: 'browse-catalog' },
          { title: 'Custom Design', value: 'custom-design' },
          { title: 'Wedding Cake', value: 'wedding-cake' },
          { title: 'Gift Hamper', value: 'gift-hamper' },
          { title: 'Custom Quote', value: 'custom-quote' },
        ],
        layout: 'dropdown'
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'customer',
      title: 'Customer Information',
      type: 'object',
      fields: [
        defineField({
          name: 'name',
          title: 'Full Name',
          type: 'string',
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: 'email',
          title: 'Email Address',
          type: 'email',
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: 'address',
          title: 'Delivery Address',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
        }),
        defineField({
          name: 'postcode',
          title: 'Postcode',
          type: 'string',
        }),
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'productType',
              title: 'Product Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Cake', value: 'cake' },
                  { title: 'Gift Hamper', value: 'gift-hamper' },
                  { title: 'Custom Product', value: 'custom' },
                ],
                layout: 'dropdown'
              },
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'productId',
              title: 'Product ID/Slug',
              type: 'string',
              description: 'Reference to the product (cake slug, hamper slug, etc.)',
            }),
            defineField({
              name: 'productName',
              title: 'Product Name',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'designType',
              title: 'Design Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Standard Design', value: 'standard' },
                  { title: 'Individual Design', value: 'individual' },
                ],
                layout: 'dropdown'
              },
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              initialValue: 1,
              validation: Rule => Rule.required().min(1),
            }),
            defineField({
              name: 'unitPrice',
              title: 'Unit Price (£)',
              type: 'number',
              validation: Rule => Rule.required().min(0),
            }),
            defineField({
              name: 'totalPrice',
              title: 'Total Price (£)',
              type: 'number',
              validation: Rule => Rule.required().min(0),
            }),
            defineField({
              name: 'size',
              title: 'Size',
              type: 'string',
            }),
            defineField({
              name: 'flavor',
              title: 'Flavor',
              type: 'string',
            }),
            defineField({
              name: 'specialInstructions',
              title: 'Special Instructions',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: {
              title: 'productName',
              subtitle: 'totalPrice',
              quantity: 'quantity',
            },
            prepare(selection) {
              const { title, subtitle, quantity } = selection
              return {
                title: `${title} (x${quantity})`,
                subtitle: `£${subtitle}`,
              }
            },
          },
        },
      ],
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'delivery',
      title: 'Delivery Information',
      type: 'object',
      fields: [
        defineField({
          name: 'dateNeeded',
          title: 'Date Needed',
          type: 'date',
          description: 'When the customer needs the order (optional)',
        }),
        defineField({
          name: 'deliveryMethod',
          title: 'Delivery Method',
          type: 'string',
          options: {
            list: [
              { title: 'Collection', value: 'collection' },
              { title: 'Local Delivery', value: 'local-delivery' },
              { title: 'Postal Delivery', value: 'postal' },
              { title: 'Market Stall Pickup', value: 'market-pickup' },
            ],
            layout: 'dropdown'
          },
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: 'deliveryAddress',
          title: 'Delivery Address',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'trackingNumber',
          title: 'Tracking Number',
          type: 'string',
          description: 'For postal deliveries',
        }),
        defineField({
          name: 'deliveryNotes',
          title: 'Delivery Notes',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'giftNote',
          title: 'Gift Note',
          type: 'text',
          rows: 3,
          description: 'Personal message to be included with gift hamper',
        }),
      ],
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing Information',
      type: 'object',
      fields: [
        defineField({
          name: 'subtotal',
          title: 'Subtotal (£)',
          type: 'number',
          validation: Rule => Rule.required().min(0),
        }),
        defineField({
          name: 'deliveryFee',
          title: 'Delivery Fee (£)',
          type: 'number',
          initialValue: 0,
        }),
        defineField({
          name: 'discount',
          title: 'Discount (£)',
          type: 'number',
          initialValue: 0,
        }),
        defineField({
          name: 'total',
          title: 'Total Amount (£)',
          type: 'number',
          validation: Rule => Rule.required().min(0),
        }),
        defineField({
          name: 'paymentStatus',
          title: 'Payment Status',
          type: 'string',
          options: {
            list: [
              { title: 'Pending', value: 'pending' },
              { title: 'Paid', value: 'paid' },
              { title: 'Partially Paid', value: 'partial' },
              { title: 'Refunded', value: 'refunded' },
            ],
            layout: 'dropdown'
          },
          initialValue: 'pending',
        }),
        defineField({
          name: 'paymentMethod',
          title: 'Payment Method',
          type: 'string',
          options: {
            list: [
              { title: 'Cash on Collection', value: 'cash-collection' },
              { title: 'Bank Transfer', value: 'bank-transfer' },
              { title: 'Card Payment', value: 'card' },
              { title: 'PayPal', value: 'paypal' },
            ],
            layout: 'dropdown'
          },
        }),
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'messages',
      title: 'Customer Messages',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'message',
              title: 'Message',
              type: 'text',
              rows: 3,
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'attachments',
              title: 'Attachments',
              type: 'array',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                },
              ],
            }),
          ],
          preview: {
            select: {
              message: 'message',
            },
            prepare(selection) {
              const { message } = selection
              return {
                title: message?.substring(0, 50) + (message?.length > 50 ? '...' : ''),
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'notes',
      title: 'Internal Notes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'note',
              title: 'Note',
              type: 'text',
              rows: 2,
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'author',
              title: 'Author',
              type: 'string',
              initialValue: 'Admin',
            }),
            defineField({
              name: 'createdAt',
              title: 'Created At',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            }),
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    {
                      name: 'alt',
                      title: 'Alt Text',
                      type: 'string',
                      description: 'Important for accessibility',
                    },
                    {
                      name: 'caption',
                      title: 'Caption',
                      type: 'string',
                    },
                  ],
                },
              ],
              description: 'Attach images to this note',
            }),
          ],
          preview: {
            select: {
              note: 'note',
              author: 'author',
              createdAt: 'createdAt',
            },
            prepare(selection) {
              const { note, author, createdAt } = selection
              return {
                title: note?.substring(0, 40) + (note?.length > 40 ? '...' : ''),
                subtitle: `${author} - ${new Date(createdAt).toLocaleDateString('en-GB')}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'metadata',
      title: 'Order Metadata',
      type: 'object',
      fields: [
        defineField({
          name: 'source',
          title: 'Order Source',
          type: 'string',
          options: {
            list: [
              { title: 'Website Order Form', value: 'website' },
              { title: 'Email', value: 'email' },
              { title: 'Phone', value: 'phone' },
              { title: 'Market Stall', value: 'market' },
              { title: 'Social Media', value: 'social' },
            ],
            layout: 'dropdown'
          },
          initialValue: 'website',
        }),
        defineField({
          name: 'referrer',
          title: 'Referrer URL',
          type: 'url',
        }),
        defineField({
          name: 'userAgent',
          title: 'User Agent',
          type: 'string',
        }),
        defineField({
          name: 'ipAddress',
          title: 'IP Address',
          type: 'string',
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Newest Orders First',
      name: 'newestFirst',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    {
      title: 'Order Number',
      name: 'orderNumber',
      by: [{ field: 'orderNumber', direction: 'desc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      customerName: 'customer.name',
      status: 'status',
      total: 'pricing.total',
      createdAt: '_createdAt',
    },
    prepare(selection) {
      const { orderNumber, customerName, status, total, createdAt } = selection
      const statusColors = {
        'new': '🔴',
        'confirmed': '🟡',
        'in-progress': '🟠',
        'ready-pickup': '🔵',
        'out-delivery': '🚚',
        'delivered': '✅',
        'completed': '✅',
        'cancelled': '❌',
      }
      
      return {
        title: `#${orderNumber} - ${customerName}`,
        subtitle: `${statusColors[status as keyof typeof statusColors] || '📦'} ${status?.charAt(0).toUpperCase() + status?.slice(1)} - £${total} - ${new Date(createdAt).toLocaleDateString('en-GB')}`,
      }
    },
  },
})
