//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import assert from "assert";
import {
  FHIRMedicationRequest,
  LoincCode,
  type ObservationQuantity,
  type FHIRQuestionnaireResponse,
  UserSex,
  QuantityUnit,
  FHIRAppointment,
  UserObservationCollection,
  MedicationReference,
} from "@stanfordbdhg/engagehf-models";
import { logger } from "firebase-functions/v2";
import { z } from "zod";
import { medicationClassReference } from "../../models/medicationRequestContext.js";
import { type Document } from "../database/databaseService.js";
import { type PatientService } from "../patient/patientService.js";
import { type EgfrCalculator } from "./egfr/egfrCalculator.js";
import {
  medicationClassesForGroup,
  MedicationGroup,
  QuestionnaireLinkId,
} from "../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js";

export interface QuestionnaireResponseMedicationRequests {
  reference: string;
  display: string;
  quantity: number;
  frequency: number;
}

export abstract class QuestionnaireResponseService {
  // Methods - Abstract

  abstract handle(
    userId: string,
    response: Document<FHIRQuestionnaireResponse>,
    options: { isNew: boolean },
  ): Promise<boolean>;

  // Methods - Extract

  protected extractAppointment(
    userId: string,
    response: FHIRQuestionnaireResponse,
  ): FHIRAppointment | null {
    const linkIds = QuestionnaireLinkId.appointment;

    const exists = response
      .leafResponseItem(linkIds.exists)
      ?.answer?.at(0)?.valueBoolean;
    if (exists !== true) return null;

    const dateAnswer = response
      .leafResponseItem(linkIds.dateTime)
      ?.answer?.at(0)?.valueDateTime;
    if (dateAnswer === undefined) return null;

    return FHIRAppointment.create({
      userId,
      created: new Date(),
      start: new Date(dateAnswer),
      durationInMinutes: 30,
    });
  }

  protected extractPersonalInfo(
    response: FHIRQuestionnaireResponse,
  ): { dateOfBirth: Date; sex: UserSex } | null {
    const linkIds = QuestionnaireLinkId.personalInformation;
    try {
      const dateOfBirth = response
        .leafResponseItem(linkIds.dateOfBirth)
        ?.answer?.at(0)?.valueDate;
      if (dateOfBirth === undefined) return null;

      const sexCode = response.leafResponseItem(linkIds.sex)?.answer?.at(0)
        ?.valueCoding?.code;
      const sex = z.enum(UserSex).parse(sexCode);
      return {
        dateOfBirth: new Date(dateOfBirth),
        sex,
      };
    } catch {}
    return null;
  }

  protected extractLabValue(
    response: FHIRQuestionnaireResponse,
    options: {
      code: LoincCode;
      unit: QuantityUnit;
    },
  ): ObservationQuantity | null {
    const linkIds = QuestionnaireLinkId.labValue(options.code);
    const dateAnswer = response
      .leafResponseItem(linkIds.dateTime)
      ?.answer?.at(0)?.valueDateTime;
    if (dateAnswer === undefined) return null;

    const decimalAnswer = response
      .leafResponseItem(linkIds.number)
      ?.answer?.at(0)?.valueDecimal;

    if (decimalAnswer === undefined) return null;

    return {
      value: decimalAnswer,
      unit: options.unit,
      date: new Date(dateAnswer),
    };
  }

  protected extractMedicationRequests(response: FHIRQuestionnaireResponse): {
    requests: FHIRMedicationRequest[];
    keepUnchanged: MedicationGroup[];
  } {
    const requests: FHIRMedicationRequest[] = [];
    const keepUnchanged: MedicationGroup[] = [];
    for (const medicationGroup of Object.values(MedicationGroup)) {
      const linkIds = QuestionnaireLinkId.medication(medicationGroup);
      const existsCoding = response
        .leafResponseItem(linkIds.exists)
        ?.answer?.at(0)?.valueCoding;

      if (existsCoding === undefined) {
        throw new Error(`Missing medication group: ${medicationGroup}.`);
      }

      switch (existsCoding.system) {
        case linkIds.registrationExistsValueSet.system: {
          const noCode = linkIds.registrationExistsValueSet.values.no;
          if (existsCoding.code === noCode) {
            continue;
          }
          assert(
            existsCoding.code === linkIds.registrationExistsValueSet.values.yes,
            `Unexpected coding for medication group: ${medicationGroup}. Expected 'yes' or 'no', but got '${existsCoding.code}'.`,
          );
          break;
        }
        case linkIds.updateExistsValueSet.system: {
          const yesUnchangedCode =
            linkIds.updateExistsValueSet.values.yesUnchanged;
          if (existsCoding.code === yesUnchangedCode) {
            keepUnchanged.push(medicationGroup);
            continue;
          }
          const noCode = linkIds.updateExistsValueSet.values.no;
          if (existsCoding.code === noCode) {
            continue;
          }
          assert(
            existsCoding.code ===
              linkIds.updateExistsValueSet.values.yesChanged,
            `Unexpected coding for medication group: ${medicationGroup}. Expected 'yes-changed', 'yes-unchanged' or 'no', but got '${existsCoding.code}'.`,
          );
          break;
        }
        default:
          throw new Error(
            `Unknown coding system for medication group: ${medicationGroup}.`,
          );
      }

      const drugCoding = response
        .leafResponseItem(linkIds.drug)
        ?.answer?.at(0)?.valueCoding;
      const quantity = response
        .leafResponseItem(linkIds.quantity)
        ?.answer?.at(0)?.valueDecimal;
      const frequency = response
        .leafResponseItem(linkIds.frequency)
        ?.answer?.at(0)?.valueInteger;

      if (
        drugCoding?.code === undefined ||
        quantity === undefined ||
        frequency === undefined
      )
        throw new Error(
          `Missing medication group: ${medicationGroup} - drug, quantity or frequency.`,
        );

      const request = FHIRMedicationRequest.create({
        medicationReference: drugCoding.code,
        medicationReferenceDisplay: drugCoding.display?.replace(/\s+/g, " "),
        frequencyPerDay: frequency,
        quantity: quantity,
      });
      requests.push(request);
    }
    return { requests, keepUnchanged };
  }

  // Methods - Handle

  protected async handleLabValues(input: {
    userId: string;
    patientService: PatientService;
    egfrCalculator: EgfrCalculator;
    dateOfBirth: Date | null;
    sex: UserSex | null;
    response: Document<FHIRQuestionnaireResponse>;
  }): Promise<void> {
    const observationValues: Array<{
      observation: ObservationQuantity;
      loincCode: LoincCode;
      collection: UserObservationCollection;
    }> = [];

    const creatinine = this.extractLabValue(input.response.content, {
      code: LoincCode.creatinine,
      unit: QuantityUnit.mg_dL,
    });
    if (creatinine !== null) {
      observationValues.push({
        observation: creatinine,
        loincCode: LoincCode.creatinine,
        collection: UserObservationCollection.creatinine,
      });
      logger.info(
        `${this.constructor.name}.handleLabValues(${input.userId}): Found creatinine value.`,
      );

      if (input.dateOfBirth !== null && input.sex !== null) {
        const age = this.calculateAge(input.dateOfBirth, creatinine.date);
        const eGfr = input.egfrCalculator.calculate({
          creatinine: creatinine.value,
          age,
          sexAssignedAtBirth: input.sex,
        });
        observationValues.push({
          observation: {
            ...eGfr,
            date: creatinine.date,
          },
          loincCode: LoincCode.estimatedGlomerularFiltrationRate,
          collection: UserObservationCollection.eGfr,
        });
        logger.info(
          `${this.constructor.name}.handleLabValues(${input.userId}): Calculated eGfr.`,
        );
      } else {
        logger.error(
          `Missing date of birth or user sex for eGFR calculation for user ${input.userId}.`,
        );
      }
    }

    const dryWeight = this.extractLabValue(input.response.content, {
      code: LoincCode.dryWeight,
      unit: QuantityUnit.lbs,
    });
    if (dryWeight !== null) {
      observationValues.push({
        observation: dryWeight,
        loincCode: LoincCode.dryWeight,
        collection: UserObservationCollection.dryWeight,
      });
      logger.info(
        `${this.constructor.name}.handleLabValues(${input.userId}): Found dry weight.`,
      );
    }

    const potassium = this.extractLabValue(input.response.content, {
      code: LoincCode.potassium,
      unit: QuantityUnit.mEq_L,
    });
    if (potassium !== null) {
      observationValues.push({
        observation: potassium,
        loincCode: LoincCode.potassium,
        collection: UserObservationCollection.potassium,
      });
      logger.info(
        `${this.constructor.name}.handleLabValues(${input.userId}): Found potassium.`,
      );
    }

    if (observationValues.length > 0) {
      await input.patientService.createObservations(
        input.userId,
        observationValues,
        {
          type: input.response.content.data.resourceType,
          reference: input.response.path,
        },
      );
      logger.info(
        `${this.constructor.name}.handleLabValues(${input.userId}): Successfully stored ${observationValues.length} observations.`,
      );
    }
  }

  protected async handleMedicationRequests(input: {
    userId: string;
    patientService: PatientService;
    response: Document<FHIRQuestionnaireResponse>;
  }): Promise<void> {
    const medicationExtraction = this.extractMedicationRequests(
      input.response.content,
    );
    const medicationClasses = medicationExtraction.keepUnchanged.flatMap(
      medicationClassesForGroup,
    );
    logger.info(
      `${this.constructor.name}.handleMedicationRequests(${input.userId}): About to store ${medicationExtraction.requests.length} medication requests and ignore ${medicationClasses.length} medication classes.`,
    );
    await input.patientService.replaceMedicationRequests(
      input.userId,
      medicationExtraction.requests,
      medicationClasses.length > 0 ?
        (doc) => {
          const referenceString =
            doc.content.data.medicationReference?.reference;
          if (referenceString === undefined) {
            logger.error(
              `Encountered medication request without reference at ${doc.path}: ${JSON.stringify(doc.content)}`,
            );
            return false;
          }
          const reference = Object.values(MedicationReference).find((value) =>
            referenceString.startsWith(value + "/"),
          );
          if (reference === undefined) {
            logger.error(
              `Unknown medication reference in questionnaire response at ${doc.path}: ${referenceString}`,
            );
            return false;
          }
          return medicationClasses.includes(
            medicationClassReference(reference),
          );
        }
      : undefined,
    );
    logger.info(
      `${this.constructor.name}.handleMedicationRequests(${input.userId}): Successfully stored medication requests.`,
    );
  }

  // Methods - Helpers

  private calculateAge(dateOfBirth: Date, present: Date = new Date()): number {
    const yearDiff = present.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = present.getMonth() - dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && present.getDate() < dateOfBirth.getDate())
    ) {
      return yearDiff - 1;
    }
    return yearDiff;
  }
}
