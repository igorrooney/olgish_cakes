import { WHATSAPP_PHONE } from '@/lib/constants'

export function buildWhatsAppUrl(customerName: string): string {
  const safeName = customerName.trim() || '[customer name]'
  const message = `Hello Olga, I am trying to send an image for printing on a cake slice. My name is ${safeName}.`

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
