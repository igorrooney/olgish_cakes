export const RESEND_ORDER_EMAIL_QUERY = `
  *[_type == "order" && orderNumber == $orderNumber][0] {
    _id,
    orderNumber,
    status,
    customer,
    items,
    pricing
  }
`
