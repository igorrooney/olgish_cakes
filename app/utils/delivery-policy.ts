import {
  defaultDeliveryMethod,
  defaultDeliveryPolicy,
  isSupportedDeliveryMethod,
  type DeliveryPolicy
} from '@/types/deliveryPolicy'

interface DeliveryDayRange {
  minDays: number
  maxDays: number
}

interface DeliveryCostExtractionResult {
  signal: 'free' | 'paid' | null
  amounts: number[]
}

interface DeliveryAmountMatch {
  amount: number
  beforeText: string
  afterText: string
  context: string
}

export interface DeliveryPolicyMismatchResult {
  shouldEmitShippingDetails: boolean
  reason?: string
}

export interface DeliveryPolicyVisibleClaims {
  timing: boolean
  shippingCost: boolean
  destinationCountry: boolean
  deliveryMethod: boolean
}

const dayRangePattern = /(\d+)\s*(?:-|to|\u2013|\u2014)\s*(\d+)\s*(?:(?:working|business)\s*)?days?/i
const singleDayPattern = /\b(?:within|in|around|about)?\s*(\d+)\s*(?:(?:working|business)\s*)?days?\b/i
const freeShippingLeadingPattern = /\bfree\b[^\n.]{0,40}\b(?:uk\s+)?(?:delivery|shipping)\b/i
const freeShippingTrailingPattern = /\b(?:uk\s+)?(?:delivery|shipping)\b[^\n.]{0,40}\bfree\b/i
const explicitPaidLeadingPattern = /\bpaid\b[^\n.]{0,40}\b(?:delivery|shipping)\b/i
const explicitPaidTrailingPattern = /\b(?:delivery|shipping)\b[^\n.]{0,40}\bpaid\b/i
const explicitAdditionalFeeLeadingPattern = /\b(?:extra|additional)\b[^\n.]{0,20}\b(?:delivery|shipping)\b[^\n.]{0,20}\b(?:fee|fees|charge|charges|cost|costs|postage)\b/i
const explicitAdditionalFeeTrailingPattern = /\b(?:delivery|shipping)\b[^\n.]{0,20}\b(?:fee|fees|charge|charges|cost|costs|postage)\b[^\n.]{0,20}\b(?:extra|additional)\b/i
const deliveryOrShippingPattern = /\b(?:delivery|shipping)\b/i
const deliveryContextPattern = /\b(?:delivery|shipping|dispatch|despatch|prepare|preparation|turnaround|ship(?:ped|ping)?)\b/i
const explicitUkCountryPattern = /\b(?:uk|u\.k\.|united kingdom|great britain|gb)\b/i
const explicitCountryCodeBeforeDeliveryPattern = /\b([a-z]{2})\s+(?:delivery|shipping)\b/i
const explicitCountryCodeAfterDeliveryPattern = /\b(?:delivery|shipping)\s+(?:to|within|across|for)\s+([a-z]{2})\b/i
const pickupOrCollectionPattern = /\b(?:pickup|pick[\s-]?up|collection|collect in person|click and collect)\b/i
const mailOrPostalDeliveryPattern = /\b(?:by\s+post|postal(?:\s+delivery)?|mail(?:\s+delivery)?|cake[-\s]?by[-\s]?post)\b/i
const currencyAmountPattern = /(\u00A3\s*\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?\s*gbp)/gi
const orderThresholdIndicatorPattern = /\b(?:order|orders|spend|basket|subtotal|purchase)\b/i
const orderThresholdQualifierPattern = /\b(?:over|above|minimum|min|at\s+least|from)\b/i
const minimumOrderAfterPattern = /\b(?:minimum order|min(?:imum)?\s+spend)\b/i
const freeThresholdLeadingPattern = /\bfree\b[^\n.]{0,40}\b(?:over|above|at\s+least)\b/i
const freeThresholdTrailingPattern = /\b(?:over|above|at\s+least)\b[^\n.]{0,40}\bfree\b/i
const moneyComparisonToleranceGbp = 0.01
const isoCountryCodePattern = /^[A-Z]{2}$/
const currencyAmountContextWindow = 35
const nearbyDeliveryAmountWindow = 24
const deliverySegmentDelimiterPattern = /(?:(?<!\d)\.|\.(?!\d)|[!?]|\n)+/
const requiredShippingDetailsClaims = [
  'timing',
  'shippingCost',
  'destinationCountry'
] as const
const nonCountryIsoWordSet = new Set<string>([
  'as',
  'at',
  'by',
  'for',
  'in',
  'is',
  'of',
  'on',
  'or',
  'to',
  'up'
])

function createEmptyDeliveryPolicyVisibleClaims(): DeliveryPolicyVisibleClaims {
  return {
    timing: false,
    shippingCost: false,
    destinationCountry: false,
    deliveryMethod: false
  }
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function normalizeCountryCode(value: unknown) {
  if (typeof value !== 'string') {
    return defaultDeliveryPolicy.shippingDestinationCountry
  }

  const normalized = value.trim().toUpperCase()
  const compactCountryCode = normalized.replace(/[\s.]/g, '')

  if (compactCountryCode === 'UK') {
    return 'GB'
  }

  return isoCountryCodePattern.test(normalized)
    ? normalized
    : defaultDeliveryPolicy.shippingDestinationCountry
}

function toSupportedCountryCode(value: unknown) {
  const normalizedCountryCode = normalizeCountryCode(value)

  // The business only ships inside the UK, so policy country is fixed to GB.
  return normalizedCountryCode === 'GB'
    ? normalizedCountryCode
    : defaultDeliveryPolicy.shippingDestinationCountry
}

export function getDeliveryCountryLabel(countryCode: string) {
  const normalizedCountryCode = normalizeCountryCode(countryCode)

  return normalizedCountryCode === 'GB'
    ? 'UK'
    : normalizedCountryCode
}

function extractExplicitDestinationCountryCode(sourceText: string): string | null {
  const deliveryOrShippingSegments = extractDeliveryContextSegments(sourceText)
    .filter((segment) => deliveryOrShippingPattern.test(segment))

  for (const segment of deliveryOrShippingSegments) {
    const normalizedSegment = segment.toLowerCase()

    if (explicitUkCountryPattern.test(normalizedSegment)) {
      return 'GB'
    }

    const beforeDeliveryMatch = explicitCountryCodeBeforeDeliveryPattern.exec(normalizedSegment)
    const afterDeliveryMatch = explicitCountryCodeAfterDeliveryPattern.exec(normalizedSegment)
    const matchedCountryCode = beforeDeliveryMatch?.[1] ?? afterDeliveryMatch?.[1]

    if (!matchedCountryCode) {
      continue
    }

    if (nonCountryIsoWordSet.has(matchedCountryCode)) {
      continue
    }

    const normalizedCountryCode = normalizeCountryCode(matchedCountryCode)

    if (normalizedCountryCode.length === 2) {
      return normalizedCountryCode
    }
  }

  return null
}

function toDeliveryMethod(value: unknown) {
  if (typeof value !== 'string') {
    return defaultDeliveryMethod
  }

  const normalized = value.trim()

  if (normalized.length === 0) {
    return defaultDeliveryMethod
  }

  return isSupportedDeliveryMethod(normalized)
    ? normalized
    : defaultDeliveryMethod
}

function toDispatchMinDays(value: unknown) {
  return isFiniteNonNegativeNumber(value)
    ? value
    : defaultDeliveryPolicy.dispatchMinDays
}

function toDispatchMaxDays(value: unknown, dispatchMinDays: number) {
  const normalizedMax = isFiniteNonNegativeNumber(value)
    ? value
    : defaultDeliveryPolicy.dispatchMaxDays

  return normalizedMax >= dispatchMinDays
    ? normalizedMax
    : dispatchMinDays
}

function extractDeliveryDayRange(text: string): DeliveryDayRange | null {
  const rangeMatch = dayRangePattern.exec(text)

  if (rangeMatch) {
    const firstValue = Number.parseInt(rangeMatch[1], 10)
    const secondValue = Number.parseInt(rangeMatch[2], 10)

    if (!Number.isNaN(firstValue) && !Number.isNaN(secondValue)) {
      const minDays = Math.min(firstValue, secondValue)
      const maxDays = Math.max(firstValue, secondValue)

      return { minDays, maxDays }
    }
  }

  const singleDayMatch = singleDayPattern.exec(text)

  if (!singleDayMatch) {
    return null
  }

  const dayValue = Number.parseInt(singleDayMatch[1], 10)

  if (Number.isNaN(dayValue)) {
    return null
  }

  return {
    minDays: dayValue,
    maxDays: dayValue
  }
}

function splitDeliveryTextIntoSegments(text: string) {
  return text
    .split(deliverySegmentDelimiterPattern)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

function extractDeliveryContextSegments(text: string) {
  return splitDeliveryTextIntoSegments(text)
    .filter((segment) => deliveryContextPattern.test(segment))
}

function parseCurrencyAmount(value: string) {
  const normalizedValue = value.replace(/[^0-9.]/g, '')
  const parsedAmount = Number.parseFloat(normalizedValue)

  return Number.isFinite(parsedAmount)
    ? parsedAmount
    : null
}

function formatCurrencyAmount(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2)
}

function extractDeliveryAmountMatches(segment: string): DeliveryAmountMatch[] {
  const amountMatches: DeliveryAmountMatch[] = []
  const segmentLength = segment.length
  let regexMatch: RegExpExecArray | null

  currencyAmountPattern.lastIndex = 0

  while ((regexMatch = currencyAmountPattern.exec(segment)) !== null) {
    const rawAmount = regexMatch[0]
    const parsedAmount = parseCurrencyAmount(rawAmount)

    if (parsedAmount === null) {
      continue
    }

    const amountStartIndex = regexMatch.index
    const amountEndIndex = amountStartIndex + rawAmount.length
    const contextStart = Math.max(0, amountStartIndex - currencyAmountContextWindow)
    const contextEnd = Math.min(segmentLength, amountEndIndex + currencyAmountContextWindow)
    const context = segment.slice(contextStart, contextEnd)
    const beforeText = segment.slice(contextStart, amountStartIndex)
    const afterText = segment.slice(amountEndIndex, contextEnd)

    amountMatches.push({
      amount: parsedAmount,
      beforeText,
      afterText,
      context
    })
  }

  currencyAmountPattern.lastIndex = 0

  return amountMatches
}

function hasDeliveryOrShippingNearAmount(match: DeliveryAmountMatch) {
  const nearbyBeforeText = match.beforeText.slice(-nearbyDeliveryAmountWindow)
  const nearbyAfterText = match.afterText.slice(0, nearbyDeliveryAmountWindow)

  return deliveryOrShippingPattern.test(nearbyBeforeText)
    || deliveryOrShippingPattern.test(nearbyAfterText)
}

function isOrderThresholdAmountMatch(match: DeliveryAmountMatch) {
  const hasThresholdContextBeforeAmount = orderThresholdIndicatorPattern.test(match.beforeText)
    && orderThresholdQualifierPattern.test(match.beforeText)
  const hasMinimumOrderContextAfterAmount = minimumOrderAfterPattern.test(match.afterText)
  const hasFreeThresholdContext = freeThresholdLeadingPattern.test(match.context)
    || freeThresholdTrailingPattern.test(match.context)

  return hasThresholdContextBeforeAmount
    || hasMinimumOrderContextAfterAmount
    || hasFreeThresholdContext
}

function extractDeliveryCostData(text: string): DeliveryCostExtractionResult {
  const hasFreeShippingSignal = freeShippingLeadingPattern.test(text)
    || freeShippingTrailingPattern.test(text)
  const hasExplicitPaidSignal = explicitPaidLeadingPattern.test(text)
    || explicitPaidTrailingPattern.test(text)
    || explicitAdditionalFeeLeadingPattern.test(text)
    || explicitAdditionalFeeTrailingPattern.test(text)
  let signal: DeliveryCostExtractionResult['signal'] = null

  if (hasFreeShippingSignal && !hasExplicitPaidSignal) {
    signal = 'free'
  }

  if (hasExplicitPaidSignal && !hasFreeShippingSignal) {
    signal = 'paid'
  }

  const deliveryContextSegments = extractDeliveryContextSegments(text)
    .filter((segment) => deliveryOrShippingPattern.test(segment))

  if (deliveryContextSegments.length === 0) {
    return {
      signal,
      amounts: []
    }
  }

  const parsedAmounts = deliveryContextSegments
    .flatMap((segment) => {
      return extractDeliveryAmountMatches(segment)
    })
    .filter((amountMatch) => {
      return hasDeliveryOrShippingNearAmount(amountMatch)
    })
    .filter((amountMatch) => {
      return !isOrderThresholdAmountMatch(amountMatch)
    })
    .map((amountMatch) => amountMatch.amount)

  if (parsedAmounts.length === 0) {
    return {
      signal,
      amounts: []
    }
  }

  if (signal === null) {
    const hasPositiveAmount = parsedAmounts.some((amount) => amount > 0)

    if (hasPositiveAmount) {
      signal = 'paid'
    }
  }

  if (signal === null) {
    const hasZeroAmount = parsedAmounts.some((amount) => amount === 0)

    if (hasZeroAmount) {
      signal = 'free'
    }
  }

  return {
    signal,
    amounts: parsedAmounts
  }
}

function detectDeliveryDayRangeFromContext(text: string) {
  const deliveryContextSegments = extractDeliveryContextSegments(text)

  for (const segment of deliveryContextSegments) {
    const dayRange = extractDeliveryDayRange(segment)

    if (dayRange) {
      return dayRange
    }
  }

  return null
}

interface DeliveryPolicyTextAnalysis {
  deliveryDayRange: DeliveryDayRange | null
  deliveryCostData: DeliveryCostExtractionResult
  explicitDestinationCountryCode: string | null
  hasPickupOrCollectionClaim: boolean
  hasExplicitMailOrPostalDeliveryClaim: boolean
  hasExplicitDeliveryPolicyClaim: boolean
  visibleClaims: DeliveryPolicyVisibleClaims
}

function analyzeDeliveryPolicyText(deliveryText: string): DeliveryPolicyTextAnalysis {
  const normalizedText = deliveryText.toLowerCase()
  const deliveryDayRange = detectDeliveryDayRangeFromContext(normalizedText)
  const deliveryCostData = extractDeliveryCostData(normalizedText)
  const explicitDestinationCountryCode = extractExplicitDestinationCountryCode(deliveryText)
  const hasPickupOrCollectionClaim = pickupOrCollectionPattern.test(normalizedText)
  const hasExplicitMailOrPostalDeliveryClaim = mailOrPostalDeliveryPattern.test(normalizedText)
  const visibleClaims: DeliveryPolicyVisibleClaims = {
    timing: deliveryDayRange !== null,
    shippingCost: deliveryCostData.signal !== null || deliveryCostData.amounts.length > 0,
    destinationCountry: explicitDestinationCountryCode !== null,
    deliveryMethod: hasPickupOrCollectionClaim || hasExplicitMailOrPostalDeliveryClaim
  }
  const hasExplicitDeliveryPolicyClaim = (
    visibleClaims.timing ||
    visibleClaims.shippingCost ||
    visibleClaims.destinationCountry ||
    visibleClaims.deliveryMethod
  )

  return {
    deliveryDayRange,
    deliveryCostData,
    explicitDestinationCountryCode,
    hasPickupOrCollectionClaim,
    hasExplicitMailOrPostalDeliveryClaim,
    hasExplicitDeliveryPolicyClaim,
    visibleClaims
  }
}

export function normalizeDeliveryPolicy(policyInput?: Partial<DeliveryPolicy> | null): DeliveryPolicy {
  const dispatchMinDays = toDispatchMinDays(policyInput?.dispatchMinDays)

  return {
    dispatchMinDays,
    dispatchMaxDays: toDispatchMaxDays(policyInput?.dispatchMaxDays, dispatchMinDays),
    shippingFeeGbp: isFiniteNonNegativeNumber(policyInput?.shippingFeeGbp)
      ? policyInput.shippingFeeGbp
      : defaultDeliveryPolicy.shippingFeeGbp,
    shippingDestinationCountry: toSupportedCountryCode(policyInput?.shippingDestinationCountry),
    deliveryMethod: toDeliveryMethod(policyInput?.deliveryMethod)
  }
}

export function detectDeliveryPolicyMismatch(
  deliveryText: string,
  policyInput?: Partial<DeliveryPolicy> | null
): DeliveryPolicyMismatchResult {
  const normalizedPolicy = normalizeDeliveryPolicy(policyInput)
  const trimmedDeliveryText = deliveryText.trim()
  const normalizedText = trimmedDeliveryText.toLowerCase()

  if (normalizedText.length === 0) {
    return {
      shouldEmitShippingDetails: false,
      reason: 'delivery text is missing required claims for shippingDetails: timing, shipping-cost, destination-country'
    }
  }

  const analysis = analyzeDeliveryPolicyText(trimmedDeliveryText)
  const {
    deliveryDayRange,
    deliveryCostData,
    explicitDestinationCountryCode,
    hasPickupOrCollectionClaim,
    hasExplicitMailOrPostalDeliveryClaim,
    hasExplicitDeliveryPolicyClaim,
    visibleClaims
  } = analysis
  const deliveryCostSignal = deliveryCostData.signal

  if (!hasExplicitDeliveryPolicyClaim) {
    return {
      shouldEmitShippingDetails: false,
      reason: 'delivery text is missing required claims for shippingDetails: timing, shipping-cost, destination-country'
    }
  }

  const mismatchReasons: string[] = []

  if (
    deliveryDayRange &&
    (
      deliveryDayRange.minDays !== normalizedPolicy.dispatchMinDays ||
      deliveryDayRange.maxDays !== normalizedPolicy.dispatchMaxDays
    )
  ) {
    mismatchReasons.push(
      `delivery text says ${deliveryDayRange.minDays}-${deliveryDayRange.maxDays} days, policy is ${normalizedPolicy.dispatchMinDays}-${normalizedPolicy.dispatchMaxDays} days`
    )
  }

  if (deliveryCostSignal === 'free' && normalizedPolicy.shippingFeeGbp > 0) {
    mismatchReasons.push(
      `delivery text says free shipping, policy fee is \u00A3${normalizedPolicy.shippingFeeGbp}`
    )
  }

  if (deliveryCostSignal === 'paid' && normalizedPolicy.shippingFeeGbp === 0) {
    mismatchReasons.push('delivery text says paid shipping, policy fee is \u00A30')
  }

  const hasExplicitFeeMismatch = deliveryCostData.amounts.some((amount) => {
    return Math.abs(amount - normalizedPolicy.shippingFeeGbp) > moneyComparisonToleranceGbp
  })

  if (hasExplicitFeeMismatch) {
    const distinctTextFees = Array.from(new Set(deliveryCostData.amounts))
      .map((amount) => `\u00A3${formatCurrencyAmount(amount)}`)
      .join(', ')
    const formattedPolicyFee = `\u00A3${formatCurrencyAmount(normalizedPolicy.shippingFeeGbp)}`

    mismatchReasons.push(
      `delivery text says shipping fee ${distinctTextFees}, policy fee is ${formattedPolicyFee}`
    )
  }

  const policyCountryCode = normalizedPolicy.shippingDestinationCountry

  if (explicitDestinationCountryCode && explicitDestinationCountryCode !== policyCountryCode) {
    const deliveryCountryLabel = getDeliveryCountryLabel(explicitDestinationCountryCode)

    mismatchReasons.push(
      `delivery text says ${deliveryCountryLabel} delivery, policy destination is ${policyCountryCode}`
    )
  }

  const policyIsMailDelivery = normalizedPolicy.deliveryMethod === defaultDeliveryMethod

  if (hasPickupOrCollectionClaim && policyIsMailDelivery) {
    mismatchReasons.push(
      `delivery text says collection/pickup, policy delivery method is ${normalizedPolicy.deliveryMethod}`
    )
  }

  if (hasExplicitMailOrPostalDeliveryClaim && !policyIsMailDelivery) {
    mismatchReasons.push(
      `delivery text says mail/post delivery, policy delivery method is ${normalizedPolicy.deliveryMethod}`
    )
  }

  const missingRequiredClaims = getMissingRequiredShippingDetailsClaimLabels(visibleClaims)

  if (mismatchReasons.length === 0 && missingRequiredClaims.length > 0) {
    return {
      shouldEmitShippingDetails: false,
      reason: `delivery text is missing required claims for shippingDetails: ${missingRequiredClaims.join(', ')}`
    }
  }

  if (mismatchReasons.length === 0) {
    return {
      shouldEmitShippingDetails: true
    }
  }

  return {
    shouldEmitShippingDetails: false,
    reason: mismatchReasons.join('; ')
  }
}

export function extractDeliveryPolicyVisibleClaims(deliveryText: string): DeliveryPolicyVisibleClaims {
  const trimmedDeliveryText = deliveryText.trim()
  const normalizedText = trimmedDeliveryText.toLowerCase()

  if (normalizedText.length === 0) {
    return createEmptyDeliveryPolicyVisibleClaims()
  }

  return analyzeDeliveryPolicyText(trimmedDeliveryText).visibleClaims
}

export function getMissingRequiredShippingDetailsClaimLabels(
  visibleClaims: DeliveryPolicyVisibleClaims
) {
  const requiredClaimLabels: Record<(typeof requiredShippingDetailsClaims)[number], string> = {
    timing: 'timing',
    shippingCost: 'shipping-cost',
    destinationCountry: 'destination-country'
  }

  return requiredShippingDetailsClaims
    .filter((claimKey) => !visibleClaims[claimKey])
    .map((claimKey) => requiredClaimLabels[claimKey])
}

export function hasRequiredShippingDetailsVisibleClaims(
  visibleClaims: DeliveryPolicyVisibleClaims
) {
  return getMissingRequiredShippingDetailsClaimLabels(visibleClaims).length === 0
}
