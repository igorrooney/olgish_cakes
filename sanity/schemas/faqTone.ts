const syntheticQuestionPhrases = [
  'everything you need to know',
  'ultimate guide',
  'complete guide',
  'explore our',
  'discover our',
  'learn more about',
  'common questions',
  'before ordering',
  'what you need to know'
]

const syntheticAnswerPhrases = [
  'we are delighted to',
  'we would be delighted to',
  'perfect for',
  'tailored to your needs',
  'crafted to',
  'designed to',
  'elevate your',
  'unforgettable',
  'please do not hesitate',
  'feel free to reach out',
  'seamless experience',
  'hassle-free',
  'absolutely',
  'we can certainly',
  'we can assist',
  'simply send',
  'high-quality',
  'beautifully crafted',
  'special day',
  'made with love',
  'carefully curated',
  'bring your vision to life',
  'whether you are',
  'whether you\'re',
  'for any occasion',
  'to help you',
  'please note that',
  'rest assured',
  'you can easily',
  'i offer a range',
  'we offer a range'
]

const weakAnswerOpeners = [
  'yes, absolutely',
  'yes, of course',
  'yes, we can',
  'yes, i can',
  'of course',
  'certainly'
]

const syntheticAnswerOpeners = [
  'to help you',
  'whether you are',
  'whether you\'re',
  'when it comes to',
  'if you are looking for',
  'if you\'re looking for'
]

const genericAnswerFragments = [
  'it depends on the order',
  'different options available',
  'handled individually',
  'depends on your requirements',
  'best option',
  'get in touch for more information',
  'contact us to discuss',
  'i can help with that'
]

const mechanicalTransitionWords = [
  'however',
  'additionally',
  'furthermore',
  'moreover',
  'therefore',
  'in addition'
]

const concreteDetailPattern =
  /\b(Leeds|UK|post|posted|delivery|deliver|collect|collection|quote|size|servings|flavour|date|postcode|photo|design|buttercream|medovik|allergen|notice|deposit|price|pricing)\b/gi

function normaliseCopy(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function findSyntheticPhrase(value: string, phrases: string[]) {
  const normalisedValue = normaliseCopy(value)
  return phrases.find((phrase) => normalisedValue.includes(phrase))
}

function countMatchedPhrases(value: string, phrases: string[]) {
  const normalisedValue = normaliseCopy(value)
  return phrases.filter((phrase) => normalisedValue.includes(phrase)).length
}

export function getFaqQuestionToneWarning(value: string | undefined) {
  if (typeof value !== 'string' || value.trim() === '') {
    return true
  }

  const matchedPhrase = findSyntheticPhrase(value, syntheticQuestionPhrases)

  if (matchedPhrase) {
    return `This sounds like a content heading, not a customer question. Remove phrases like "${matchedPhrase}".`
  }

  const trimmedValue = value.trim()
  const hasQuestionMark = trimmedValue.endsWith('?')
  const looksLikeQuestion = /^(can|do|does|how|what|when|where|which|who|why|is|are|will|would|could|should|may|i)\b/i.test(trimmedValue)

  if (!hasQuestionMark && !looksLikeQuestion) {
    return 'Write this as something a customer would actually ask, ideally as a direct question.'
  }

  return true
}

export function getFaqAnswerToneWarning(value: string | undefined) {
  if (typeof value !== 'string' || value.trim() === '') {
    return true
  }

  const trimmedValue = value.trim()
  const normalisedValue = normaliseCopy(trimmedValue)
  const lines = trimmedValue
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
  const sentenceCount = trimmedValue
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence !== '').length

  const concreteDetailCount = (trimmedValue.match(concreteDetailPattern) ?? []).length
  const transitionCount = countMatchedPhrases(value, mechanicalTransitionWords)
  const listItemCount = lines.filter((line) => /^[-*]\s+/.test(line)).length

  const hasWeakOpener = weakAnswerOpeners.some((opener) => normalisedValue.startsWith(opener))

  if (hasWeakOpener && concreteDetailCount < 2) {
    return 'This opens with a generic reassurance. Start with the real condition, limit or next step instead.'
  }

  const matchedSyntheticOpener = syntheticAnswerOpeners.find((opener) => normalisedValue.startsWith(opener))

  if (matchedSyntheticOpener) {
    return `This opens like website copy, not a direct reply. Replace phrases like "${matchedSyntheticOpener}" with the actual answer.`
  }

  const matchedPhrase = findSyntheticPhrase(value, syntheticAnswerPhrases)

  if (matchedPhrase) {
    return `This sounds padded or salesy. Replace phrases like "${matchedPhrase}" with a direct answer.`
  }

  const matchedGenericFragment = findSyntheticPhrase(value, genericAnswerFragments)

  if (matchedGenericFragment && concreteDetailCount < 2) {
    return 'This still sounds generic. Replace vague filler with the actual rule, limit or next step.'
  }

  if (sentenceCount >= 3 && countMatchedPhrases(value, genericAnswerFragments) >= 2) {
    return 'This answer circles around the point. Say what you do, where you deliver, how much notice you need or what the customer should send.'
  }

  if (transitionCount >= 2 && concreteDetailCount < 3) {
    return 'This sounds over-written. Cut transition words and say the practical answer more plainly.'
  }

  if (listItemCount >= 4 && concreteDetailCount < 3) {
    return 'This is turning into generic content-list copy. Keep the list short or replace it with the actual rule, limit or next step.'
  }

  if (sentenceCount >= 4 && concreteDetailCount <= 1) {
    return 'This answer is long but still vague. Add practical details such as delivery area, timings, cake type, servings or what the customer needs to send.'
  }

  if (sentenceCount >= 2 && concreteDetailCount === 0) {
    return 'This still sounds generic. Add practical details such as area, notice, cake type, servings, delivery or what the customer needs to send.'
  }

  return true
}
