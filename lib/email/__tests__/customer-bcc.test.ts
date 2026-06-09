import { getCustomerEmailBcc, isCustomerEmailBccEnabled } from '../customer-bcc'

describe('customer email BCC', () => {
  const originalCustomerEmailBccEnabled = process.env.CUSTOMER_EMAIL_BCC_ENABLED

  afterEach(() => {
    if (originalCustomerEmailBccEnabled === undefined) {
      delete process.env.CUSTOMER_EMAIL_BCC_ENABLED
    } else {
      process.env.CUSTOMER_EMAIL_BCC_ENABLED = originalCustomerEmailBccEnabled
    }
  })

  it('keeps customer BCC enabled when the flag is not configured', () => {
    delete process.env.CUSTOMER_EMAIL_BCC_ENABLED

    expect(isCustomerEmailBccEnabled()).toBe(true)
    expect(getCustomerEmailBcc(' admin@example.com ')).toBe('admin@example.com')
  })

  it.each(['false', '0', 'no', 'off', ' FALSE '])('disables customer BCC for %s', (value) => {
    process.env.CUSTOMER_EMAIL_BCC_ENABLED = value

    expect(isCustomerEmailBccEnabled()).toBe(false)
    expect(getCustomerEmailBcc('admin@example.com')).toBeUndefined()
  })

  it('treats any other configured value as enabled', () => {
    process.env.CUSTOMER_EMAIL_BCC_ENABLED = 'true'

    expect(isCustomerEmailBccEnabled()).toBe(true)
    expect(getCustomerEmailBcc('admin@example.com')).toBe('admin@example.com')
  })

  it('does not return an empty BCC recipient', () => {
    process.env.CUSTOMER_EMAIL_BCC_ENABLED = 'true'

    expect(getCustomerEmailBcc('  ')).toBeUndefined()
    expect(getCustomerEmailBcc()).toBeUndefined()
  })
})
