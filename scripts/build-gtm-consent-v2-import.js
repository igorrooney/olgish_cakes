import fs from 'node:fs'
import path from 'node:path'

const [, , sourcePathArgument, outputPathArgument] = process.argv

if (!sourcePathArgument || !outputPathArgument) {
  throw new Error(
    'Usage: node scripts/build-gtm-consent-v2-import.js <source-export.json> <output-import.json>'
  )
}

const sourcePath = path.resolve(sourcePathArgument)
const outputPath = path.resolve(outputPathArgument)
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
const containerVersion = source.containerVersion

if (
  source.exportFormatVersion !== 2 ||
  containerVersion?.container?.publicId !== 'GTM-5JZDTM8N'
) {
  throw new Error('Expected a GTM v2 export for container GTM-5JZDTM8N')
}

const sourceTags = Array.isArray(containerVersion.tag)
  ? containerVersion.tag
  : []
const googleAnalyticsTag = sourceTags.find(tag => tag.tagId === '6')
const clarityTag = sourceTags.find(tag => tag.tagId === '8')

if (
  googleAnalyticsTag?.type !== 'googtag' ||
  clarityTag?.type !== 'cvt_MQDKZ'
) {
  throw new Error('Expected the existing GA4 and Microsoft Clarity tags')
}

const accountId = containerVersion.accountId
const containerId = containerVersion.containerId
const fingerprint = Date.now().toString()

const templateParameter = (key, value) => ({
  type: 'TEMPLATE',
  key,
  value
})

const customEventCondition = eventName => ({
  type: 'EQUALS',
  parameter: [
    templateParameter('arg0', '{{_event}}'),
    templateParameter('arg1', eventName)
  ]
})

const trueCondition = variableName => ({
  type: 'EQUALS',
  parameter: [
    templateParameter('arg0', `{{${variableName}}}`),
    templateParameter('arg1', 'true')
  ]
})

const createConsentTrigger = ({
  triggerId,
  name,
  eventName,
  variableName
}) => ({
  accountId,
  containerId,
  triggerId,
  name,
  type: 'CUSTOM_EVENT',
  customEventFilter: [customEventCondition(eventName)],
  ...(variableName ? { filter: [trueCondition(variableName)] } : {}),
  fingerprint
})

const createDataLayerVariable = ({
  variableId,
  name,
  dataLayerName
}) => ({
  accountId,
  containerId,
  variableId,
  name,
  type: 'v',
  parameter: [
    {
      type: 'INTEGER',
      key: 'dataLayerVersion',
      value: '2'
    },
    templateParameter('name', dataLayerName)
  ],
  fingerprint
})

const additionalConsent = (...consentTypes) => ({
  consentStatus: 'NEEDED',
  consentType: {
    type: 'LIST',
    list: consentTypes.map(value => ({
      type: 'TEMPLATE',
      value
    }))
  }
})

const noAdditionalConsent = {
  consentStatus: 'NOT_NEEDED'
}

const variables = {
  googleAnalytics: 'DLV - Consent - Google Analytics',
  microsoftClarity: 'DLV - Consent - Microsoft Clarity',
  googleAds: 'DLV - Consent - Google Ads'
}

const triggers = [
  createConsentTrigger({
    triggerId: '3',
    name: 'CE - Consent Ready - Google Analytics',
    eventName: 'olgish_consent_ready',
    variableName: variables.googleAnalytics
  }),
  createConsentTrigger({
    triggerId: '4',
    name: 'CE - Consent Update - Google Analytics',
    eventName: 'olgish_consent_update',
    variableName: variables.googleAnalytics
  }),
  createConsentTrigger({
    triggerId: '5',
    name: 'CE - Consent Ready - Microsoft Clarity',
    eventName: 'olgish_consent_ready',
    variableName: variables.microsoftClarity
  }),
  createConsentTrigger({
    triggerId: '6',
    name: 'CE - Consent Update - Microsoft Clarity',
    eventName: 'olgish_consent_update',
    variableName: variables.microsoftClarity
  }),
  createConsentTrigger({
    triggerId: '7',
    name: 'CE - Consent Ready - Google Ads',
    eventName: 'olgish_consent_ready',
    variableName: variables.googleAds
  }),
  createConsentTrigger({
    triggerId: '8',
    name: 'CE - Consent Update - Google Ads',
    eventName: 'olgish_consent_update',
    variableName: variables.googleAds
  }),
  createConsentTrigger({
    triggerId: '9',
    name: 'CE - Consent Ready - All Choices',
    eventName: 'olgish_consent_ready'
  }),
  createConsentTrigger({
    triggerId: '10',
    name: 'CE - Consent Update - All Choices',
    eventName: 'olgish_consent_update'
  })
]

const clarityConsentHtml = `<script>
(function () {
  if (typeof window.clarity !== 'function') return

  var clarityConsent = {{${variables.microsoftClarity}}} === true
  var adsConsent = {{${variables.googleAds}}} === true

  window.clarity('consentv2', {
    source: 'olgish-cakes',
    ad_Storage: adsConsent ? 'granted' : 'denied',
    analytics_Storage: clarityConsent ? 'granted' : 'denied'
  })

  if (!clarityConsent) {
    window.clarity('consent', false)
  }
})()
</script>`

const tags = [
  {
    ...googleAnalyticsTag,
    name: 'Google Analytics - Consent v2',
    notes:
      'Fires only when the canonical Google Analytics choice is true and analytics_storage is granted.',
    fingerprint,
    firingTriggerId: ['3', '4'],
    tagFiringOption: 'ONCE_PER_LOAD',
    consentSettings: additionalConsent('analytics_storage')
  },
  {
    ...clarityTag,
    name: 'Microsoft Clarity - Consent v2',
    notes:
      'Initialises Clarity only when the canonical Microsoft Clarity choice is true.',
    priority: {
      type: 'INTEGER',
      value: '100'
    },
    fingerprint,
    firingTriggerId: ['5', '6'],
    tagFiringOption: 'ONCE_PER_LOAD',
    consentSettings: noAdditionalConsent
  },
  {
    accountId,
    containerId,
    tagId: '9',
    name: 'Microsoft Clarity - Consent API V2',
    type: 'html',
    parameter: [
      templateParameter('html', clarityConsentHtml),
      {
        type: 'BOOLEAN',
        key: 'supportDocumentWrite',
        value: 'false'
      }
    ],
    notes:
      'Updates Clarity consent on every canonical consent event and revokes consent on withdrawal. This tag does not load Clarity.',
    fingerprint,
    firingTriggerId: ['9', '10'],
    tagFiringOption: 'ONCE_PER_EVENT',
    monitoringMetadata: {
      type: 'MAP'
    },
    consentSettings: noAdditionalConsent
  }
]

const output = {
  ...source,
  exportTime: new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''),
  containerVersion: {
    ...containerVersion,
    tag: tags,
    trigger: triggers,
    variable: [
      createDataLayerVariable({
        variableId: '1',
        name: variables.googleAnalytics,
        dataLayerName: 'olgishConsent.googleAnalytics'
      }),
      createDataLayerVariable({
        variableId: '2',
        name: variables.microsoftClarity,
        dataLayerName: 'olgishConsent.microsoftClarity'
      }),
      createDataLayerVariable({
        variableId: '3',
        name: variables.googleAds,
        dataLayerName: 'olgishConsent.googleAds'
      })
    ],
    fingerprint
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

console.log(`Created ${outputPath}`)
