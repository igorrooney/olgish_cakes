import { Box, Card, Flex, Radio, Stack, Text } from '@sanity/ui'
import { ObjectInputMember, set, type FieldMember, type ObjectInputProps, type ObjectMember } from 'sanity'
import {
  cakeServingsRows,
  resolveCakeServingsDefaultState,
  type CakeServingsDefaultFieldName,
  type CakeServingsPricingValue
} from './cakeServingsPricingDefaults'

function isFieldMember(member: ObjectMember): member is FieldMember {
  return member.kind === 'field'
}

export function CakeServingsPricingInput(props: ObjectInputProps<CakeServingsPricingValue>) {
  const fieldMembersByName = new Map(
    props.members
      .filter(isFieldMember)
      .map((member) => [member.name, member] as const)
  )

  const defaultState = resolveCakeServingsDefaultState(props.value)
  const minimumDefaultFieldNames = new Set(defaultState.minimumPricedDefaultFieldNames)

  function handleDefaultSelection(defaultFieldName: CakeServingsDefaultFieldName) {
    const nextDefaultPatches = cakeServingsRows.map((row) => {
      return set(row.defaultFieldName === defaultFieldName, [row.defaultFieldName])
    })

    props.onChange(nextDefaultPatches)
  }

  return (
    <Stack space={4}>
      <Text size={1} muted>
        Choose one default serving. Only lowest-priced serving tiers can be selected as default.
      </Text>

      {!defaultState.hasExactlyOneDefault ? (
        <Card border radius={2} padding={3}>
          <Text size={1}>
            Select exactly one default serving option. Current selected defaults: {defaultState.selectedDefaultsCount}.
          </Text>
        </Card>
      ) : null}

      <Stack space={3}>
        {cakeServingsRows.map((row) => {
          const priceFieldMember = fieldMembersByName.get(row.priceFieldName)

          if (!priceFieldMember) {
            return null
          }

          const isLowestPricedTier = minimumDefaultFieldNames.size === 0 || minimumDefaultFieldNames.has(row.defaultFieldName)
          const isRadioDisabled = props.readOnly || !isLowestPricedTier

          return (
            <Card key={row.priceFieldName} border radius={2} padding={3}>
              <Flex gap={4} align='flex-start'>
                <Box flex={1}>
                  <ObjectInputMember
                    member={priceFieldMember}
                    renderAnnotation={props.renderAnnotation}
                    renderBlock={props.renderBlock}
                    renderField={props.renderField}
                    renderInlineBlock={props.renderInlineBlock}
                    renderInput={props.renderInput}
                    renderItem={props.renderItem}
                    renderPreview={props.renderPreview}
                  />
                </Box>

                <Box paddingTop={5}>
                  <Flex as='label' align='center' gap={2}>
                    <Radio
                      checked={defaultState.selectedDefaultFieldName === row.defaultFieldName}
                      disabled={isRadioDisabled}
                      name='cake-servings-default'
                      onChange={() => handleDefaultSelection(row.defaultFieldName)}
                    />
                    <Text size={1} muted={!isLowestPricedTier}>Default for {row.label}</Text>
                  </Flex>
                  {!isLowestPricedTier ? (
                    <Text size={1} muted>
                      Default can only be selected on lowest-priced tiers.
                    </Text>
                  ) : null}
                </Box>
              </Flex>
            </Card>
          )
        })}
      </Stack>
    </Stack>
  )
}