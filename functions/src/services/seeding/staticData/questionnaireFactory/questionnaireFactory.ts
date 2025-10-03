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
  type FHIRExtension,
  FHIRExtensionUrl,
  type FHIRMedication,
  FHIRQuestionnaire,
  type FHIRQuestionnaireItem,
  type FHIRQuestionnaireItemAnswerOption,
  type FHIRQuestionnaireItemEnableBehavior,
  type FHIRQuestionnaireItemEnableWhen,
  FHIRQuestionnaireItemEnableWhenOperator,
  FHIRQuestionnaireItemType,
  FHIRQuestionnairePublicationStatus,
  LoincCode,
  QuantityUnit,
} from "@stanfordbdhg/engagehf-models";
import { type FHIRUsageContext } from "@stanfordbdhg/engagehf-models/lib/fhir/baseTypes/fhirUsageContext";
import {
  medicationClassesForGroup,
  MedicationGroup,
  type QuestionnaireId,
  QuestionnaireLinkId,
} from "./questionnaireLinkIds.js";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class QuestionnaireFactory<Input> {
  // Abstract functions

  abstract create(input: Input): FHIRQuestionnaire;

  // Helper functions - ENGAGE-HF specific

  protected appointmentInputPages(): FHIRQuestionnaireItem[] {
    const linkIds = QuestionnaireLinkId.appointment;
    return [
      this.pageItem({
        linkId: linkIds.page0,
        text: "Next appointment",
        item: [
          this.displayItem({
            linkId: linkIds.existsDescription,
            text: "Next appointment",
          }),
          this.booleanItem({
            linkId: linkIds.exists,
            text: "Do you already have a new appointment scheduled?",
          }),
        ],
      }),
      this.pageItem({
        linkId: linkIds.page1,
        text: "Next appointment",
        enableWhen: [
          {
            question: linkIds.exists,
            operator: FHIRQuestionnaireItemEnableWhenOperator.equals,
            answerBoolean: true,
          },
        ],
        item: [
          this.displayItem({
            linkId: linkIds.description,
            text: "Upcoming appointment",
          }),
          this.dateTimeItem({
            linkId: linkIds.dateTime,
            text: "Date:",
          }),
        ],
      }),
    ];
  }

  protected labInputPages(): FHIRQuestionnaireItem[] {
    return [
      ...this.labInputPagesForValue({
        loincCode: LoincCode.creatinine,
        title: "Creatinine",
        name: "creatinine",
        description:
          "The creatinine level in your body helps understand how your kidneys handle the drugs you are taking.",
        unit: QuantityUnit.mg_dL,
        minValue: 0,
        maxValue: 100,
      }),
      ...this.labInputPagesForValue({
        loincCode: LoincCode.potassium,
        title: "Potassium",
        name: "potassium",
        description:
          "The potassium level in your body helps understand how your liver handles the drugs you are taking.",
        unit: QuantityUnit.mEq_L,
        minValue: 0,
        maxValue: 100,
      }),
      ...this.labInputPagesForValue({
        loincCode: LoincCode.dryWeight,
        title: "Dry Weight",
        name: "dry weight",
        description:
          "The dry weight is useful to set a baseline to check that your weight does not increase unnoticed.",
        unit: QuantityUnit.lbs,
        minValue: 0,
        maxValue: 1000,
      }),
    ];
  }

  protected labInputPagesForValue(input: {
    loincCode: LoincCode;
    title: string;
    name: string;
    description: string;
    unit: QuantityUnit;
    minValue?: number;
    maxValue?: number;
  }): FHIRQuestionnaireItem[] {
    const linkIds = QuestionnaireLinkId.labValue(input.loincCode);
    return [
      this.pageItem({
        linkId: linkIds.page0,
        text: input.title,
        item: [
          this.displayItem({
            linkId: linkIds.existsDescription,
            text: input.description,
          }),
          this.booleanItem({
            linkId: linkIds.exists,
            text: `Have you recently received a new ${input.name} value?`,
          }),
        ],
      }),
      this.pageItem({
        linkId: linkIds.page1,
        text: input.title,
        enableWhen: [
          {
            question: linkIds.exists,
            operator: FHIRQuestionnaireItemEnableWhenOperator.equals,
            answerBoolean: true,
          },
        ],
        item: [
          this.displayItem({
            linkId: linkIds.description,
            text: input.description,
          }),
          this.decimalItem({
            linkId: linkIds.number,
            text: `${input.title} (${input.unit.unit}):`,
            unit: input.unit.unit,
            minValue: input.minValue,
            maxValue: input.maxValue,
          }),
          this.dateTimeItem({
            linkId: linkIds.dateTime,
            text: "Date:",
          }),
        ],
      }),
    ];
  }

  protected medicationInputPages(input: {
    medications: Record<string, FHIRMedication>;
    drugs: Record<string, Record<string, FHIRMedication>>;
    isRegistration: boolean;
  }): FHIRQuestionnaireItem[] {
    return [
      ...this.medicationInputPagesForMedicationGroup({
        ...input,
        text: "Beta Blockers",
        group: MedicationGroup.betaBlockers,
      }),
      ...this.medicationInputPagesForMedicationGroup({
        ...input,
        text: "Renin-Angiotensin System Inhibitors (RASI)",
        group: MedicationGroup.rasi,
      }),
      ...this.medicationInputPagesForMedicationGroup({
        ...input,
        text: "Mineralocorticoid Receptor Antagonists (MRA)",
        group: MedicationGroup.mra,
      }),
      ...this.medicationInputPagesForMedicationGroup({
        ...input,
        text: "SGLT2 Inhibitors (SGLT2i)",
        group: MedicationGroup.sglt2i,
      }),
      ...this.medicationInputPagesForMedicationGroup({
        ...input,
        text: "Diuretics",
        group: MedicationGroup.diuretics,
      }),
    ];
  }

  protected medicationInputPagesForMedicationGroup(input: {
    drugs: Record<string, Record<string, FHIRMedication>>;
    medications: Record<string, FHIRMedication>;
    group: MedicationGroup;
    text: string;
    isRegistration: boolean;
  }): FHIRQuestionnaireItem[] {
    const linkIds = QuestionnaireLinkId.medication(input.group);
    const medicationClasses = medicationClassesForGroup(
      input.group,
    ) as string[];
    const medicationIds = compactMap(
      Object.entries(input.medications),
      ([id, medication]) =>
        (
          medicationClasses.includes(
            medication.medicationClassReference?.reference ?? "",
          )
        ) ?
          id
        : undefined,
    );
    const answers: Array<{
      id: string;
      medication: FHIRMedication;
      drug: FHIRMedication;
      text: string;
    }> = [];
    for (const medicationId of medicationIds) {
      const medication = input.medications[medicationId];
      for (const [drugId, drug] of Object.entries(
        input.drugs[medicationId] ?? {},
      )) {
        let text = medication.displayName ?? "";
        if (medication.brandNames.length > 0)
          text += ` (${medication.brandNames.join(", ")})`;

        text += `\n${drug.ingredient?.map((i) => i.strength?.numerator?.value ?? 0).join("/") ?? ""} mg ${drug.form?.text ?? ""}`;
        answers.push({
          id: `medications/${medicationId}/drugs/${drugId}`,
          medication,
          drug,
          text,
        });
      }
    }
    const medicationListTexts = medicationIds
      .map((id) => {
        const medication = input.medications[id];
        let text = medication.displayName ?? "";
        if (medication.brandNames.length > 0)
          text += ` (${medication.brandNames.join(", ")})`;
        return text;
      })
      .join("\n");

    const answerOptions =
      input.isRegistration ?
        this.valueSetAnswerOptions({
          system: linkIds.registrationExistsValueSet.system,
          values: [
            {
              code: linkIds.registrationExistsValueSet.values.yes,
              display: "Yes",
            },
            {
              code: linkIds.registrationExistsValueSet.values.no,
              display: "No",
            },
          ],
        })
      : this.valueSetAnswerOptions({
          system: linkIds.updateExistsValueSet.system,
          values: [
            {
              code: linkIds.updateExistsValueSet.values.yesChanged,
              display: "Yes, changed since last update",
            },
            {
              code: linkIds.updateExistsValueSet.values.yesUnchanged,
              display: "Yes, unchanged since last update",
            },
            {
              code: linkIds.updateExistsValueSet.values.no,
              display: "No",
            },
          ],
        });
    return [
      this.pageItem({
        linkId: linkIds.page0,
        text: input.text,
        item: [
          this.displayItem({
            linkId: linkIds.existsDescription,
            text: `Do you take any of the following medications?\n\n${medicationListTexts}`,
          }),
          this.radioButtonItem({
            linkId: linkIds.exists,
            text: "Do you take any medication from the above list?",
            answerOption: answerOptions,
          }),
        ],
      }),
      this.pageItem({
        linkId: linkIds.page1,
        text: input.text,
        enableWhen: [
          {
            question: linkIds.exists,
            operator: FHIRQuestionnaireItemEnableWhenOperator.equals,
            answerCoding:
              input.isRegistration ?
                answerOptions.find(
                  (option) =>
                    option.valueCoding?.code ===
                    linkIds.registrationExistsValueSet.values.yes,
                )?.valueCoding
              : answerOptions.find(
                  (option) =>
                    option.valueCoding?.code ===
                    linkIds.updateExistsValueSet.values.yesChanged,
                )?.valueCoding,
          },
        ],
        item: [
          this.displayItem({
            linkId: linkIds.description,
            text: "Please enter which drug you are taking, how often you take it per day and how many pills/tablets you take per intake.\n\nDo not enter the total amount of pills/tablets you take per day.",
          }),
          this.decimalItem({
            linkId: linkIds.frequency,
            text: "Intake frequency (per day):",
          }),
          this.decimalItem({
            linkId: linkIds.quantity,
            text: "Pills/tablets per intake:",
          }),
          this.radioButtonItem({
            linkId: linkIds.drug,
            text: "Which pill/tablet do you take?",
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
    ];
  }

  // Helper functions - Generic

  protected booleanItem(input: {
    linkId: string;
    text: string;
    required?: boolean;
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.boolean,
      required: input.required ?? true,
    };
  }

  protected dateItem(input: {
    linkId: string;
    text: string;
    required?: boolean;
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.date,
      required: input.required ?? true,
    };
  }

  protected dateTimeItem(input: {
    linkId: string;
    text: string;
    required?: boolean;
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.dateTime,
      required: input.required ?? true,
    };
  }

  protected decimalItem(input: {
    linkId: string;
    text: string;
    required?: boolean;
    unit?: string;
    minValue?: number;
    maxValue?: number;
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.decimal,
      unit: input.unit,
      required: input.required ?? true,
    };
  }

  protected displayItem(input: {
    linkId: string;
    text: string;
    required?: boolean;
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      type: FHIRQuestionnaireItemType.display,
      text: input.text,
      required: input.required ?? false,
    };
  }

  protected pageItem(input: {
    linkId: string;
    text: string;
    item: FHIRQuestionnaireItem[];
    enableWhen?: FHIRQuestionnaireItemEnableWhen[];
    enableBehavior?: FHIRQuestionnaireItemEnableBehavior;
    extension?: FHIRExtension[];
    required?: boolean;
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      type: FHIRQuestionnaireItemType.group,
      extension: [
        ...(input.extension ?? []),
        {
          url: FHIRExtensionUrl.questionnaireItemControl,
          valueCodeableConcept: {
            coding: [
              {
                system: CodingSystem.questionnaireItemControl,
                code: "page",
                display: "Page",
              },
            ],
            text: "Page",
          },
        },
      ],
      item: input.item,
      required: input.required ?? true,
      text: input.text,
      enableWhen: input.enableWhen,
      enableBehavior: input.enableBehavior,
    };
  }

  protected questionnaire(input: {
    id: QuestionnaireId;
    title: string;
    status?: FHIRQuestionnairePublicationStatus;
    item: FHIRQuestionnaireItem[];
    useContext?: FHIRUsageContext[];
  }): FHIRQuestionnaire {
    return new FHIRQuestionnaire({
      id: input.id,
      title: input.title,
      language: "en-US",
      status: input.status ?? FHIRQuestionnairePublicationStatus.active,
      publisher: "Stanford Biodesign Digital Health",
      meta: {
        profile: [
          "http://spezi.health/fhir/StructureDefinition/sdf-Questionnaire",
        ],
        tag: [
          {
            system: "urn:ietf:bcp:47",
            code: "en-US",
            display: "English",
          },
        ],
      },
      useContext: input.useContext ?? [],
      contact: [
        {
          name: "http://spezi.health",
        },
      ],
      subjectType: ["Patient"],
      url: QuestionnaireLinkId.url(input.id),
      item: input.item,
    });
  }

  protected radioButtonItem(input: {
    linkId: string;
    text: string;
    answerOption: FHIRQuestionnaireItemAnswerOption[];
    required?: boolean;
  }): FHIRQuestionnaireItem {
    return {
      extension: [
        {
          url: FHIRExtensionUrl.questionnaireItemControl,
          valueCodeableConcept: {
            coding: [
              {
                system: CodingSystem.questionnaireItemControl,
                code: "radio-button",
                display: "Radio Button",
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
    };
  }

  protected valueSetAnswerOptions(input: {
    system: string;
    values: Array<{
      id?: string;
      code: string;
      display: string;
    }>;
  }): FHIRQuestionnaireItemAnswerOption[] {
    return input.values.map((option) => ({
      valueCoding: {
        id: option.id ?? option.code,
        code: option.code,
        system: input.system,
        display: option.display,
      },
    }));
  }
}
