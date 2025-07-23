//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { CodingSystem, LoincCode } from '../codes/codes.js'
import { QuantityUnit } from '../codes/quantityUnit.js'
import { Coding, Observation, Reference } from 'fhir/r4b.js'
import { ObservationQuantity } from '../types/observationQuantity.js'
import { FHIRResource } from './fhirResource.js'
import { observationSchema } from '@stanfordspezi/spezi-firebase-fhir'
import { FHIRSchemaConverter } from '../helpers/fhirSchemaConverter.js'

export class FHIRObservation extends FHIRResource<Observation> {
  // Static Functions

  private static readonly loincDisplay = new Map<LoincCode, string>([
    [
      LoincCode.bloodPressure,
      'Blood pressure panel with all children optional',
    ],
    [LoincCode.systolicBloodPressure, 'Systolic blood pressure'],
    [LoincCode.diastolicBloodPressure, 'Diastolic blood pressure'],
    [LoincCode.bodyWeight, 'Body weight'],
    [LoincCode.dryWeight, 'Dry body weight Estimated'],
    [LoincCode.creatinine, 'Creatinine [Mass/volume] in Serum or Plasma'],
    [
      LoincCode.estimatedGlomerularFiltrationRate,
      'Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum, Plasma or Blood by Creatinine-based formula (CKD-EPI 2021)',
    ],
    [LoincCode.heartRate, 'Heart rate'],
    [LoincCode.potassium, 'Potassium [Moles/volume] in Blood'],
  ])

  static createBloodPressure(input: {
    id: string
    date: Date
    systolic: number
    diastolic: number
  }): FHIRObservation {
    return new FHIRObservation({
      resourceType: 'Observation',
      id: input.id,
      status: 'final',
      code: {
        text: this.loincDisplay.get(LoincCode.bloodPressure),
        coding: [
          {
            system: CodingSystem.loinc,
            code: LoincCode.bloodPressure,
            display: this.loincDisplay.get(LoincCode.bloodPressure),
          },
        ],
      },
      component: [
        {
          code: {
            text: this.loincDisplay.get(LoincCode.systolicBloodPressure),
            coding: [
              {
                system: CodingSystem.loinc,
                code: LoincCode.systolicBloodPressure,
                display: this.loincDisplay.get(LoincCode.systolicBloodPressure),
              },
            ],
          },
          valueQuantity: {
            value: input.systolic,
            unit: QuantityUnit.mmHg.unit,
            system: QuantityUnit.mmHg.system,
            code: QuantityUnit.mmHg.code,
          },
        },
        {
          code: {
            text: this.loincDisplay.get(LoincCode.diastolicBloodPressure),
            coding: [
              {
                system: CodingSystem.loinc,
                code: LoincCode.diastolicBloodPressure,
                display: this.loincDisplay.get(
                  LoincCode.diastolicBloodPressure,
                ),
              },
            ],
          },
          valueQuantity: {
            value: input.diastolic,
            unit: QuantityUnit.mmHg.unit,
            system: QuantityUnit.mmHg.system,
            code: QuantityUnit.mmHg.code,
          },
        },
      ],
      effectiveDateTime: input.date.toISOString(),
    })
  }

  static createSimple(input: {
    id: string
    date: Date
    value: number
    unit: QuantityUnit
    code: LoincCode
    derivedFrom?: Reference[]
  }): FHIRObservation {
    return new FHIRObservation({
      resourceType: 'Observation',
      id: input.id,
      status: 'final',
      code: {
        text: this.loincDisplay.get(input.code) ?? undefined,
        coding: [
          {
            system: CodingSystem.loinc,
            code: input.code,
            display: this.loincDisplay.get(input.code) ?? undefined,
          },
        ],
      },
      valueQuantity: {
        value: input.value,
        unit: input.unit.unit,
        system: input.unit.system,
        code: input.unit.code,
      },
      effectiveDateTime: input.date.toISOString(),
      derivedFrom: input.derivedFrom,
    })
  }

  // Computed Properties

  get systolicBloodPressure(): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.bloodPressure,
      system: CodingSystem.loinc,
      unit: QuantityUnit.mmHg,
      component: {
        code: LoincCode.systolicBloodPressure,
        system: CodingSystem.loinc,
      },
    }).at(0)
  }

  get diastolicBloodPressure(): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.bloodPressure,
      system: CodingSystem.loinc,
      unit: QuantityUnit.mmHg,
      component: {
        code: LoincCode.diastolicBloodPressure,
        system: CodingSystem.loinc,
      },
    }).at(0)
  }

  bodyWeight(unit: QuantityUnit): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.bodyWeight,
      system: CodingSystem.loinc,
      unit: unit,
    }).at(0)
  }

  dryWeight(unit: QuantityUnit): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.dryWeight,
      system: CodingSystem.loinc,
      unit: unit,
    }).at(0)
  }

  get creatinine(): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.creatinine,
      system: CodingSystem.loinc,
      unit: QuantityUnit.mg_dL,
    }).at(0)
  }

  get estimatedGlomerularFiltrationRate(): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.estimatedGlomerularFiltrationRate,
      system: CodingSystem.loinc,
      unit: QuantityUnit.mL_min_173m2,
    }).at(0)
  }

  get heartRate(): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.heartRate,
      system: CodingSystem.loinc,
      unit: QuantityUnit.bpm,
    }).at(0)
  }

  get potassium(): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.potassium,
      system: CodingSystem.loinc,
      unit: QuantityUnit.mEq_L,
    }).at(0)
  }

  // Methods

  private observationQuantities(
    options: {
      unit: QuantityUnit
      component?: Coding
    } & Coding,
  ): ObservationQuantity[] {
    const result: ObservationQuantity[] = []
    if (!this.containsCoding(this.data.code, [options])) return result
    const date =
      this.data.effectiveDateTime ??
      this.data.effectiveInstant ??
      this.data.effectivePeriod?.start ??
      this.data.effectivePeriod?.end
    if (!date) return result

    if (options.component) {
      for (const component of this.data.component ?? []) {
        if (!this.containsCoding(component.code, [options.component])) continue
        const value = options.unit.valueOf(component.valueQuantity)
        if (!value) continue
        result.push({
          date: new Date(date),
          value: value,
          unit: options.unit,
        })
      }
    } else {
      const value = options.unit.valueOf(this.data.valueQuantity)
      if (!value) return result
      result.push({ date: new Date(date), value: value, unit: options.unit })
    }
    return result
  }
}

/*
export const fhirObservationConverter =
  new FHIRSchemaConverter<FHIRObservation>({
    schema: observationSchema.transform((data) => new FHIRObservation(data)),
    nullProperties: ['effectiveDateTime', 'effectiveInstant'],
  })
*/
