//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export interface FHIRCodeableConcept extends FHIRElement {
  coding?: FHIRCoding[]
  text?: string
}

export interface FHIRCoding extends FHIRElement {
  system?: string
  version?: string
  code?: string
  display?: string
  userSelected?: boolean
}

export interface FHIRElement {
  id?: string
  extension?: FHIRExtension[]
}

export interface FHIRExtension {
  url: string
  valueString?: string
  valueQuantity?: FHIRSimpleQuantity
}

export interface FHIRPeriod {
  start?: Date
  end?: Date
}

export interface FHIRRatio {
  numerator?: FHIRSimpleQuantity
  denominator?: FHIRSimpleQuantity
}

export interface FHIRReference<T> {
  reference?: string
  type?: string
  identifier?: string
  display?: string
}

export interface FHIRSimpleQuantity {
  system?: string
  code?: string
  value?: number
  unit?: string
}
