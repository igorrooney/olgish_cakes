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
          title={undefined}
          validation={props.validation}
        >
          {props.children}
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
