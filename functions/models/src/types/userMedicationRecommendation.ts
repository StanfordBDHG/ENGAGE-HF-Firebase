//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Reference } from 'fhir/r4b.js'
import { z } from 'zod'
import { localizedTextConverter } from './localizedText.js'
import { Lazy } from '../helpers/lazy.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export enum UserMedicationRecommendationType {
  improvementAvailable = 'improvementAvailable',
  moreLabObservationsRequired = 'moreLabObservationsRequired',
  morePatientObservationsRequired = 'morePatientObservationsRequired',
  noActionRequired = 'noActionRequired',
  notStarted = 'notStarted',
  personalTargetDoseReached = 'personalTargetDoseReached',
  targetDoseReached = 'targetDoseReached',
}

export const userMedicationRecommendationDoseScheduleConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        frequency: z.number(),
        quantity: z.number().array(),
      }),
      encode: (object) => ({
        frequency: object.frequency,
        quantity: object.quantity,
      }),
    }),
)

export type UserMedicationRecommendationDoseSchedule = z.output<
  typeof userMedicationRecommendationDoseScheduleConverter.value.schema
>

export const userMedicationRecommendationDosageInformationConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        currentSchedule: z
          .lazy(
            () =>
              userMedicationRecommendationDoseScheduleConverter.value.schema,
          )
          .array(),
        minimumSchedule: z
          .lazy(
            () =>
              userMedicationRecommendationDoseScheduleConverter.value.schema,
          )
          .array(),
        targetSchedule: z
          .lazy(
            () =>
              userMedicationRecommendationDoseScheduleConverter.value.schema,
          )
          .array(),
        unit: z.string(),
      }),
      encode: (object) => ({
        currentSchedule: object.currentSchedule.map(
          userMedicationRecommendationDoseScheduleConverter.value.encode,
        ),
        minimumSchedule: object.minimumSchedule.map(
          userMedicationRecommendationDoseScheduleConverter.value.encode,
        ),
        targetSchedule: object.targetSchedule.map(
          userMedicationRecommendationDoseScheduleConverter.value.encode,
        ),
        unit: object.unit,
      }),
    }),
)

export const userMedicationRecommendationDisplayInformationConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        title: localizedTextConverter.schema,
        subtitle: localizedTextConverter.schema,
        description: localizedTextConverter.schema,
        type: z.enum(UserMedicationRecommendationType),
        videoPath: optionalish(z.string()),
        dosageInformation: z.lazy(
          () =>
            userMedicationRecommendationDosageInformationConverter.value.schema,
        ),
      }),
      encode: (object) => ({
        title: localizedTextConverter.encode(object.title),
        subtitle: localizedTextConverter.encode(object.subtitle),
        description: localizedTextConverter.encode(object.description),
        type: object.type,
        videoPath: object.videoPath ?? null,
        dosageInformation:
          userMedicationRecommendationDosageInformationConverter.value.encode(
            object.dosageInformation,
          ),
      }),
    }),
)

export type UserMedicationRecommendationDisplayInformation = z.output<
  typeof userMedicationRecommendationDisplayInformationConverter.value.schema
>

const referenceSchema = z.object({
  reference: z.string().optional(),
  type: z.string().optional(),
  display: z.string().optional(),
})

export const userMedicationRecommendationConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z
        .object({
          currentMedication: referenceSchema.array(),
          recommendedMedication: optionalish(referenceSchema),
          displayInformation: z.lazy(
            () =>
              userMedicationRecommendationDisplayInformationConverter.value
                .schema,
          ),
        })
        .transform((values) => new UserMedicationRecommendation(values)),
      encode: (object) => ({
        currentMedication: object.currentMedication,
        recommendedMedication: object.recommendedMedication ?? null,
        displayInformation:
          userMedicationRecommendationDisplayInformationConverter.value.encode(
            object.displayInformation,
          ),
      }),
    }),
)

export class UserMedicationRecommendation {
  // Properties

  readonly currentMedication: Reference[]
  readonly recommendedMedication?: Reference
  readonly displayInformation: UserMedicationRecommendationDisplayInformation

  // Constructor

  constructor(input: {
    currentMedication: Reference[]
    recommendedMedication?: Reference
    displayInformation: UserMedicationRecommendationDisplayInformation
  }) {
    this.currentMedication = input.currentMedication
    this.recommendedMedication = input.recommendedMedication
    this.displayInformation = input.displayInformation
  }
}
