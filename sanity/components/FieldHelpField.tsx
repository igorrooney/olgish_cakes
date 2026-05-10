import { Box, Button, Dialog, Flex, Stack, Text } from '@sanity/ui'
import { FormField, type FieldProps } from 'sanity'
import { useId, useState, type ReactNode } from 'react'

export interface FieldHelpContent {
  title: string
  whatItIs: string
  whatToEnter: string
  whyItMatters: string
  whereUsed: readonly string[]
  examples: readonly string[]
}

function toSentenceCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function toDisplayLabel(value: string | number) {
  if (typeof value === 'number') {
    return `Item ${value + 1}`
  }

  return toSentenceCase(value)
    .replace(/^\w/, (character) => character.toUpperCase())
}

function getFieldLabel(props: FieldProps) {
  if (typeof props.title === 'string' && props.title.trim().length > 0) {
    return props.title
  }

  if (typeof props.name === 'string' && props.name.trim().length > 0) {
    return toDisplayLabel(props.name)
  }

  return 'Field'
}

function getPathLabels(props: FieldProps) {
  return props.path
    .filter((segment) => typeof segment === 'string' || typeof segment === 'number')
    .map((segment) => toDisplayLabel(segment))
}

function buildTypeSpecificExamples(props: FieldProps, fieldLabel: string) {
  const fieldPath = getPathLabels(props).join(' > ').toLowerCase()
  const normalisedLabel = fieldLabel.toLowerCase()

  if (fieldPath.includes('slug') || normalisedLabel.includes('slug')) {
    return [
      'honey-cake-by-post',
      'birthday-cakes-leeds',
    ]
  }

  if (fieldPath.includes('alt') || normalisedLabel.includes('alt')) {
    return [
      'Close-up of honey cake with visible cream layers',
      'Gift hamper box with cake, tea, and ribbon on a table',
    ]
  }

  if (fieldPath.includes('meta title') || normalisedLabel.includes('meta title')) {
    return [
      'Honey Cake Delivery in Leeds | Olgish Cakes',
      'Gift Hampers by Post UK | Olgish Cakes',
    ]
  }

  if (fieldPath.includes('meta description') || normalisedLabel.includes('meta description')) {
    return [
      'Order handmade Ukrainian honey cake in Leeds with local delivery and natural ingredients.',
      'Send a gift hamper by post across the UK with cakes, treats, and a personal message.',
    ]
  }

  if (fieldPath.includes('canonical') || normalisedLabel.includes('canonical')) {
    return [
      'Usually leave this blank',
      'https://olgishcakes.co.uk/cakes/honey-cake',
    ]
  }

  if (fieldPath.includes('keyword') || normalisedLabel.includes('keyword')) {
    return [
      'honey cake leeds',
      'gift hamper by post uk',
    ]
  }

  if (fieldPath.includes('order') || normalisedLabel.includes('order')) {
    return [
      '0 for the first item you want to show',
      '1 for the next item',
    ]
  }

  if (props.schemaType.name === 'boolean') {
    return [
      'Turn this on when you want this shown or enabled',
      'Leave it off when this should stay hidden or inactive',
    ]
  }

  if (props.schemaType.name === 'image') {
    return [
      'A bright, clear photo that shows the product properly',
      'A cropped image that still keeps the main subject easy to see',
    ]
  }

  if (props.schemaType.name === 'reference') {
    return [
      'Choose the matching cake, hamper, topic, or collection from the list',
      'Pick the one that best fits what this page is about',
    ]
  }

  if (props.schemaType.name === 'array') {
    return [
      'Add one item at a time in the order you want it shown',
      'Keep only entries that are genuinely useful to the customer',
    ]
  }

  if (props.schemaType.name === 'url') {
    return [
      'https://olgishcakes.co.uk/cakes/honey-cake',
      'https://olgishcakes.co.uk/gift-hampers',
    ]
  }

  if (props.schemaType.name === 'number') {
    return [
      '0',
      '10',
    ]
  }

  if (props.schemaType.name === 'datetime') {
    return [
      'Use the real publish or event date and time',
      'Pick a future date if this should go live later',
    ]
  }

  return [
    `Use clear, plain wording for ${fieldLabel.toLowerCase()}.`,
    'Keep it accurate and specific to what the customer will actually see.',
  ]
}

function buildWhatItIs(props: FieldProps, fieldLabel: string) {
  switch (props.schemaType.name) {
    case 'boolean':
      return `This is a simple on or off setting for ${fieldLabel.toLowerCase()}.`
    case 'image':
      return `This is the image used for ${fieldLabel.toLowerCase()}.`
    case 'slug':
      return `This is the short web address part used for ${fieldLabel.toLowerCase()}.`
    case 'reference':
      return `This links ${fieldLabel.toLowerCase()} to another item already saved in Sanity.`
    case 'array':
      return `This is a list of items for ${fieldLabel.toLowerCase()}.`
    case 'object':
      return `This section groups together settings for ${fieldLabel.toLowerCase()}.`
    case 'number':
      return `This stores the number used for ${fieldLabel.toLowerCase()}.`
    case 'datetime':
      return `This stores the date and time for ${fieldLabel.toLowerCase()}.`
    case 'url':
      return `This stores the web link for ${fieldLabel.toLowerCase()}.`
    default:
      return `This field stores the ${fieldLabel.toLowerCase()} for this item.`
  }
}

function buildWhatToEnter(props: FieldProps, fieldLabel: string) {
  const description = typeof props.description === 'string' && props.description.trim().length > 0
    ? props.description.trim()
    : ''

  let guidance = 'Add the wording or value you want customers to see on the website.'

  switch (props.schemaType.name) {
    case 'boolean':
      guidance = 'Choose on only when this should be visible, highlighted, or active.'
      break
    case 'image':
      guidance = 'Upload a clear image that matches this content and looks good when cropped.'
      break
    case 'slug':
      guidance = 'Use short lowercase words with hyphens only. Keep it simple and close to the title.'
      break
    case 'reference':
      guidance = 'Pick the existing item that best matches this content.'
      break
    case 'array':
      guidance = 'Add only the items that are genuinely useful, and keep them in the right order.'
      break
    case 'object':
      guidance = 'Open this section and fill in only the settings you really need.'
      break
    case 'number':
      guidance = 'Enter a whole number or decimal only if this setting needs one.'
      break
    case 'datetime':
      guidance = 'Choose the real date and time this content should use.'
      break
    case 'url':
      guidance = 'Paste the full web address, including https://.'
      break
    default:
      if (fieldLabel.toLowerCase().includes('description') || props.schemaType.name === 'text') {
        guidance = 'Write clear, natural English that explains the point quickly.'
      }
  }

  return description.length > 0
    ? `${guidance} Guide: ${description}`
    : guidance
}

function buildWhyItMatters(props: FieldProps, fieldLabel: string) {
  if (props.schemaType.name === 'boolean') {
    return 'This setting changes how the content behaves or whether people can see it.'
  }

  if (props.schemaType.name === 'object') {
    return 'This section keeps related settings together so the page stays organised and easier to manage.'
  }

  if (fieldLabel.toLowerCase().includes('alt')) {
    return 'It helps people using screen readers and gives search engines a better understanding of the image.'
  }

  if (fieldLabel.toLowerCase().includes('meta title') || fieldLabel.toLowerCase().includes('meta description') || fieldLabel.toLowerCase().includes('canonical')) {
    return 'It affects how this page is understood in search and sharing previews, so it should be used carefully.'
  }

  if (fieldLabel.toLowerCase().includes('slug')) {
    return 'It becomes part of the page link people share and visit.'
  }

  return 'It helps keep the website content clear, accurate, and ready to publish.'
}

function buildWhereUsed(props: FieldProps, fieldLabel: string) {
  const pathLabels = getPathLabels(props)
  const parentLabels = pathLabels.slice(0, -1)
  const whereUsed = ['This item inside Sanity while editors manage content']

  if (parentLabels.length > 0) {
    whereUsed.push(`Inside the ${parentLabels.join(' > ')} section`)
  }

  if (props.schemaType.name !== 'object') {
    whereUsed.push(`On the website anywhere ${fieldLabel.toLowerCase()} is shown`)
  }

  if (fieldLabel.toLowerCase().includes('seo') || parentLabels.some((label) => label.toLowerCase().includes('seo'))) {
    whereUsed.push('Search and social metadata when relevant')
  }

  return whereUsed
}

export function createAutomaticFieldHelpContent(props: FieldProps): FieldHelpContent {
  const fieldLabel = getFieldLabel(props)

  return {
    title: fieldLabel,
    whatItIs: buildWhatItIs(props, fieldLabel),
    whatToEnter: buildWhatToEnter(props, fieldLabel),
    whyItMatters: buildWhyItMatters(props, fieldLabel),
    whereUsed: buildWhereUsed(props, fieldLabel),
    examples: buildTypeSpecificExamples(props, fieldLabel),
  }
}

interface FieldHelpFieldProps {
  helpContent: FieldHelpContent
  props: FieldProps
}

function FieldHelpSection({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <Stack space={2}>
      <Text size={1} weight='semibold'>
        {heading}
      </Text>
      <Box>{children}</Box>
    </Stack>
  )
}

export function FieldHelpField({ helpContent, props }: FieldHelpFieldProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const dialogId = useId()
  const renderedField = props.children ?? props.renderDefault(props)

  return (
    <>
      <Stack space={2}>
        <Flex align='center' gap={3} justify='space-between'>
          <Box flex={1}>
            <Text size={1} weight='semibold'>
              {props.title ?? helpContent.title}
            </Text>
          </Box>
          <Button
            fontSize={1}
            mode='bleed'
            onClick={() => setIsDialogOpen(true)}
            padding={2}
            text='Help'
            type='button'
          />
        </Flex>

        <FormField
          __internal_comments={props.__internal_comments}
          __internal_slot={props.__internal_slot}
          __unstable_presence={props.presence}
          deprecated={props.schemaType.deprecated}
          description={props.description}
          inputId={props.inputId}
          level={props.level}
          path={props.path}
          title={undefined}
          validation={props.validation}
        >
          {renderedField}
        </FormField>
      </Stack>

      {isDialogOpen ? (
        <Dialog
          header={`${helpContent.title} help`}
          id={dialogId}
          onClose={() => setIsDialogOpen(false)}
          width={1}
        >
          <Box padding={4}>
            <Stack space={5}>
              <FieldHelpSection heading='What this is'>
                <Text size={1}>{helpContent.whatItIs}</Text>
              </FieldHelpSection>

              <FieldHelpSection heading='What to enter'>
                <Text size={1}>{helpContent.whatToEnter}</Text>
              </FieldHelpSection>

              <FieldHelpSection heading='Why it matters'>
                <Text size={1}>{helpContent.whyItMatters}</Text>
              </FieldHelpSection>

              <FieldHelpSection heading='Where we use it'>
                <Stack as='ul' margin={0} paddingLeft={4} space={3}>
                  {helpContent.whereUsed.map((item) => (
                    <Box as='li' key={item}>
                      <Text size={1}>{item}</Text>
                    </Box>
                  ))}
                </Stack>
              </FieldHelpSection>

              <FieldHelpSection heading='Examples'>
                <Stack as='ul' margin={0} paddingLeft={4} space={3}>
                  {helpContent.examples.map((item) => (
                    <Box as='li' key={item}>
                      <Text size={1}>{item}</Text>
                    </Box>
                  ))}
                </Stack>
              </FieldHelpSection>

              <Flex justify='flex-end'>
                <Button
                  mode='default'
                  onClick={() => setIsDialogOpen(false)}
                  text='Close help'
                  type='button'
                />
              </Flex>
            </Stack>
          </Box>
        </Dialog>
      ) : null}
    </>
  )
}

export function createFieldHelpFieldComponent(helpContent: FieldHelpContent) {
  function FieldHelpFieldComponent(props: FieldProps) {
    return <FieldHelpField helpContent={helpContent} props={props} />
  }

  FieldHelpFieldComponent.displayName = `${helpContent.title.replace(/\s+/g, '')}HelpField`

  return FieldHelpFieldComponent
}

export function AutomaticFieldHelpField(props: FieldProps) {
  return (
    <FieldHelpField
      helpContent={createAutomaticFieldHelpContent(props)}
      props={props}
    />
  )
}
