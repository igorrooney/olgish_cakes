export const defaultDeliveryMethod = 'https://purl.org/goodrelations/v1#DeliveryModeMail'
export const supportedDeliveryMethods = [defaultDeliveryMethod] as const
const supportedDeliveryMethodSet = new Set<string>(supportedDeliveryMethods)

export interface DeliveryPolicy {
  dispatchMinDays: number
  dispatchMaxDays: number
  shippingFeeGbp: number
  shippingDestinationCountry: string
  deliveryMethod: string
}

export function isSupportedDeliveryMethod(
  deliveryMethod: string
): deliveryMethod is (typeof supportedDeliveryMethods)[number] {
  return supportedDeliveryMethodSet.has(deliveryMethod)
}

export const defaultDeliveryPolicy: DeliveryPolicy = {
  dispatchMinDays: 2,
  dispatchMaxDays: 3,
  shippingFeeGbp: 0,
  shippingDestinationCountry: 'GB',
  deliveryMethod: defaultDeliveryMethod
}
