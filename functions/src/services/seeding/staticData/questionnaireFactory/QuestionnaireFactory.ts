//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CodingSystem,
  compactMap,
  FHIRExtension,
  FHIRExtensionUrl,
  FHIRMedication,
  FHIRQuestionnaire,
  FHIRQuestionnaireItem,
  FHIRQuestionnaireItemAnswerOption,
  FHIRQuestionnaireItemEnableBehavior,
  FHIRQuestionnaireItemEnableWhen,
  FHIRQuestionnaireItemEnableWhenOperator,
  FHIRQuestionnaireItemType,
  FHIRQuestionnairePublicationStatus,
  MedicationClassReference,
  QuantityUnit,
} from '@stanfordbdhg/engagehf-models'
import { FHIRUsageContext } from '@stanfordbdhg/engagehf-models/lib/fhir/baseTypes/fhirUsageContext'
import { randomUUID } from 'crypto'

export abstract class QuestionnaireFactory<Input> {
  // Abstract functions

  abstract create(input: Input): FHIRQuestionnaire

  // Helper functions - ENGAGE-HF specific

  protected labInputPages(input: {}): FHIRQuestionnaireItem[] {
    return [
      ...this.labInputPages({
        linkId: randomUUID(),
        text: 'Creatinine',
        description:
          'The creatinine level in your body helps understand how your liver handles the drugs you are taking.',
        unit: QuantityUnit.mg_dL,
      }),
      ...this.labInputPages({
        linkId: 'egfr',
        title: 'eGFR',
        name: 'eGFR',
        description:
          'eGFR (estimated Glomerular Filtration Rate) is a test that estimates how well your kidneys are filtering blood.',
        unit: QuantityUnit.mL_min_173m2,
        minValue: 0,
        maxValue: 200,
      }),
      ...this.labInputPages({
        linkId: randomUUID(),
        text: 'Potassium',
        description:
          'The potassium level in your body helps understand how your liver handles the drugs you are taking.',
        unit: QuantityUnit.mEq_L,
      }),
      ...this.labInputPages({
        linkId: randomUUID(),
        text: 'Dry Weight',
        description:
          'The dry weight is useful to set a baseline to check that your weight does not increase unnoticed.',
        unit: QuantityUnit.lbs,
      }),
    ]
  }

  protected labInputPagesForValue(input: {
    linkId: string
    title: string
    name: string
    description: string
    unit: QuantityUnit
    minValue?: number
    maxValue?: number
  }): FHIRQuestionnaireItem[] {
    const existsLinkId = input.linkId + '-exists'
    return [
      this.pageItem({
        linkId: existsLinkId,
        text: input.title,
        item: [
          this.displayItem({
            linkId: input.linkId + '-exists-description',
            text: input.description,
          }),
          this.booleanItem({
            linkId: existsLinkId,
            text: `Have you recently received a new ${input.name} value?`,
          }),
        ],
      }),
      this.pageItem({
        linkId: input.linkId + '-page1',
        text: input.title,
        enableWhen: [
          {
            question: existsLinkId,
            operator: FHIRQuestionnaireItemEnableWhenOperator.equals,
            answerBoolean: true,
          },
        ],
        item: [
          this.displayItem({
            linkId: input.linkId + '-value-description',
            text: input.description,
          }),
          this.decimalItem({
            linkId: input.linkId + '-value',
            text: `${input.title} (${input.unit.unit}):`,
            unit: input.unit.unit,
            minValue: input.minValue,
            maxValue: input.maxValue,
          }),
          this.dateItem({
            linkId: input.linkId + '-date',
            text: 'Date:',
          }),
        ],
      }),
    ]
  }

  protected medicationInputPages(input: {
    medications: Record<string, FHIRMedication>
    drugs: Record<string, Record<string, FHIRMedication>>
  }): FHIRQuestionnaireItem[] {
    return [
      ...this.medicationInputPagesForMedicationClasses({
        medications: input.medications,
        drugs: input.drugs,
        medicationClasses: [MedicationClassReference.betaBlockers],
        text: 'Beta Blockers',
        linkId: 'betablockers',
      }),
      ...this.medicationInputPagesForMedicationClasses({
        medications: input.medications,
        drugs: input.drugs,
        medicationClasses: [
          MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
          MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
        ],
        text: 'Renin-Angiotensin System Inhibitors (RASI)',
        linkId: 'rasi',
      }),
      ...this.medicationInputPagesForMedicationClasses({
        medications: input.medications,
        drugs: input.drugs,
        medicationClasses: [
          MedicationClassReference.mineralocorticoidReceptorAntagonists,
        ],
        text: 'Mineralocorticoid Receptor Antagonists (MRA)',
        linkId: 'mra',
      }),
      ...this.medicationInputPagesForMedicationClasses({
        medications: input.medications,
        drugs: input.drugs,
        medicationClasses: [MedicationClassReference.sglt2inhibitors],
        text: 'SGLT2 Inhibitors (SGLT2i)',
        linkId: 'sglt2i',
      }),
      ...this.medicationInputPagesForMedicationClasses({
        medications: input.medications,
        drugs: input.drugs,
        medicationClasses: [MedicationClassReference.diuretics],
        text: 'Diuretics',
        linkId: 'diuretics',
      }),
    ]
  }

  protected medicationInputPagesForMedicationClasses(input: {
    linkId: string
    text: string
    medications: Record<string, FHIRMedication>
    drugs: Record<string, Record<string, FHIRMedication>>
    medicationClasses: MedicationClassReference[]
  }): FHIRQuestionnaireItem[] {
    const medicationClasses = input.medicationClasses.map((medicationClass) =>
      medicationClass.toString(),
    )
    const ingredientIds = compactMap(
      Object.entries(input.medications),
      ([id, medication]) =>
        (
          medicationClasses.includes(
            medication.medicationClassReference?.reference ?? '',
          )
        ) ?
          id
        : undefined,
    )
    const answers: {
      id: string
      ingredient: FHIRMedication
      drug: FHIRMedication
      text: string
    }[] = []
    for (const ingredientId of ingredientIds) {
      const ingredient = input.medications[ingredientId]
      if (ingredient === undefined) continue
      for (const [drugId, drug] of Object.entries(
        input.drugs[ingredientId] ?? {},
      )) {
        let text = ingredient.displayName ?? ''
        if (ingredient.brandNames.length > 0)
          text += ` (${ingredient.brandNames.join(', ')})`

        text += `\n${drug.ingredient?.map((i) => i.strength?.numerator?.value ?? 0).join('/') ?? ''} mg ${drug.form?.text ?? ''}`
        answers.push({
          id: drugId,
          ingredient: ingredient,
          drug: drug,
          text: text,
        })
      }
    }
    const ingredientListText = ingredientIds
      .map((id) => {
        const ingredient = input.medications[id]
        let text = ingredient.displayName ?? ''
        if (ingredient.brandNames.length > 0)
          text += ` (${ingredient.brandNames.join(', ')})`
        return text
      })
      .join('\n')
    const existsLinkId = input.linkId + '-exists'
    return [
      this.pageItem({
        linkId: existsLinkId,
        text: input.text,
        item: [
          this.displayItem({
            linkId: input.linkId + '-exists-display',
            text: `Do you take any of the following medications?\n\n${ingredientListText}`,
          }),
          this.booleanItem({
            linkId: existsLinkId,
            text: 'Do you take any medication from the above list?',
          }),
        ],
      }),
      this.pageItem({
        linkId: input.linkId + '-page1',
        text: input.text,
        enableWhen: [
          {
            question: existsLinkId,
            operator: FHIRQuestionnaireItemEnableWhenOperator.equals,
            answerBoolean: true,
          },
        ],
        item: [
          this.displayItem({
            linkId: input.linkId + '-page1-description',
            text: 'Please enter which drug you are taking, how often you take it per day and how many pills/tablets you take per intake.\n\nDo not enter the total amount of pills/tablets you take per day.',
          }),
          this.decimalItem({
            linkId: input.linkId + '-frequency',
            text: 'Intake frequency (per day):',
          }),
          this.decimalItem({
            linkId: input.linkId + '-quantity',
            text: 'Pills/tablets per intake:',
          }),
          this.radioButtonItem({
            linkId: input.linkId + '-drug',
            text: 'Which pill/tablet do you take?',
            answerOption: this.valueSetAnswerOptions({
              system: CodingSystem.rxNorm,
              values: answers
                .sort((a, b) => a.text.localeCompare(b.text))
                .map((answer) => ({
                  id: answer.id,
                  code: answer.id,
                  display: answer.text,
                })),
            }),
          }),
        ],
      }),
    ]
  }

  // Helper functions - Generic

  protected booleanItem(input: {
    linkId: string
    text: string
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.boolean,
      required: input.required ?? true,
    }
  }

  protected dateItem(input: {
    linkId: string
    text: string
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.date,
      required: input.required ?? true,
    }
  }

  protected decimalItem(input: {
    linkId: string
    text: string
    required?: boolean
    unit?: string
    minValue?: number
    maxValue?: number
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.decimal,
      unit: input.unit,
      required: input.required ?? true,
    }
  }

  protected displayItem(input: {
    linkId?: string
    text: string
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId ?? randomUUID(),
      type: FHIRQuestionnaireItemType.display,
      text: input.text,
      required: input.required ?? false,
    }
  }

  protected pageItem(input: {
    linkId?: string
    text: string
    item: FHIRQuestionnaireItem[]
    enableWhen?: FHIRQuestionnaireItemEnableWhen[]
    enableBehavior?: FHIRQuestionnaireItemEnableBehavior
    extension?: FHIRExtension[]
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId ?? randomUUID(),
      type: FHIRQuestionnaireItemType.group,
      extension: [
        ...(input.extension ?? []),
        {
          url: FHIRExtensionUrl.questionnaireItemControl,
          valueCodeableConcept: {
            coding: [
              {
                system: CodingSystem.questionnaireItemControl,
                code: 'page',
                display: 'Page',
              },
            ],
            text: 'Page',
          },
        },
      ],
      item: input.item,
      required: input.required ?? false,
      text: input.text,
      enableWhen: input.enableWhen,
      enableBehavior: input.enableBehavior,
    }
  }

  protected questionnaire(input: {
    id: string
    title: string
    status?: FHIRQuestionnairePublicationStatus
    item: FHIRQuestionnaireItem[]
    useContext?: FHIRUsageContext[]
  }): FHIRQuestionnaire {
    return new FHIRQuestionnaire({
      id: input.id,
      title: input.title,
      language: 'en-US',
      status: input.status ?? FHIRQuestionnairePublicationStatus.active,
      publisher: 'Stanford Biodesign Digital Health',
      meta: {
        profile: [
          'http://spezi.health/fhir/StructureDefinition/sdf-Questionnaire',
        ],
        tag: [
          {
            system: 'urn:ietf:bcp:47',
            code: 'en-US',
            display: 'English',
          },
        ],
      },
      useContext: input.useContext ?? [],
      contact: [
        {
          name: 'http://spezi.health',
        },
      ],
      subjectType: ['Patient'],
      url: `http://spezi.health/fhir/questionnaire/${input.id}`,
      item: input.item,
    })
  }

  protected radioButtonItem(input: {
    linkId: string
    text: string
    answerOption: FHIRQuestionnaireItemAnswerOption[]
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      extension: [
        {
          url: FHIRExtensionUrl.questionnaireItemControl,
          valueCodeableConcept: {
            coding: [
              {
                system: CodingSystem.questionnaireItemControl,
                code: 'radio-button',
                display: 'Radio Button',
              },
            ],
          },
        },
      ],
      linkId: input.linkId,
      type: FHIRQuestionnaireItemType.choice,
      text: input.text,
      required: input.required ?? true,
      answerOption: input.answerOption,
    }
  }

  protected valueSetAnswerOptions(input: {
    system?: string
    values: {
      id?: string
      code: string
      display: string
    }[]
  }): FHIRQuestionnaireItemAnswerOption[] {
    const system = input.system ?? `urn:uuid:${randomUUID()}`
    return input.values.map((option) => ({
      valueCoding: {
        id: option.id ?? randomUUID(),
        code: option.code,
        system: system,
        display: option.display,
      },
    }))
  }
}
