const disabledCustomerBccValues = new Set(['false', '0', 'no', 'off'])

export function isCustomerEmailBccEnabled(): boolean {
  const configuredValue = process.env.CUSTOMER_EMAIL_BCC_ENABLED?.trim().toLowerCase()
  if (!configuredValue) {
    return true
  }

  return !disabledCustomerBccValues.has(configuredValue)
}

export function getCustomerEmailBcc(configuredBcc?: string): string | undefined {
  if (!isCustomerEmailBccEnabled()) {
    return undefined
  }

  const resolvedBcc = configuredBcc?.trim()
  if (!resolvedBcc || resolvedBcc.length === 0) {
    return undefined
  }

  return resolvedBcc
}
