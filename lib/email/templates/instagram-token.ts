import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

const alertScenarios = [
  {
    id: 'default',
    label: 'Instagram token refresh alert (default)',
    input: createDefaultScenarioInput({
      customerName: 'Olgish Cakes team',
      customerEmail: 'hello@olgishcakes.co.uk',
      orderType: 'system-alert',
      productName: 'Instagram access token',
      dateNeeded: '2026-06-05T08:00:00.000Z',
      titleOverride: 'Instagram token expires in 10 days',
      intro: 'The Instagram access token used on the site needs to be refreshed soon.',
      message: 'The current Instagram token expires in 10 days. Refresh it before it expires to avoid losing homepage Instagram posts.',
      note: 'Run pnpm instagram:refresh-token, update INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_TOKEN_EXPIRES_AT, then deploy the new env values to Vercel.'
    })
  }
]

export const instagramTokenTemplateDefinitions: Record<string, TemplateDefinition<EmailTemplateCommonInput>> = {
  'instagram-token-refresh-alert': createTemplateDefinition(
    {
      subject: 'Instagram token refresh reminder',
      heading: 'Instagram token refresh reminder',
      intro: 'The Instagram access token used by the site needs attention.',
      admin: true
    },
    alertScenarios
  )
}
