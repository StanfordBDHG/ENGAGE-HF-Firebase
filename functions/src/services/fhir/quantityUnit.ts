import { type FHIRSimpleQuantity } from '../../models/fhir/baseTypes.js'

export class QuantityUnit {
  // Static Properties

  static mg = new QuantityUnit('mg', 'mg')
  static lbs = new QuantityUnit('[lb_av]', 'lbs')
  static kg = new QuantityUnit('kg', 'kg')
  static bpm = new QuantityUnit('/min', '/min')
  static mmHg = new QuantityUnit('mm[Hg]', 'mm[Hg]')

  // Properties

  readonly unit: string
  readonly code: string
  readonly system: string

  // Constructor

  constructor(
    unit: string,
    code: string,
    system = 'http://unitsofmeasure.org',
  ) {
    this.unit = unit
    this.code = code
    this.system = system
  }

  // Methods

  isUsedIn(other: FHIRSimpleQuantity): boolean {
    return (
      this.code === other.code &&
      this.system === other.system &&
      this.unit === other.unit
    )
  }

  equals(other: QuantityUnit): boolean {
    return (
      this.code === other.code &&
      this.system === other.system &&
      this.unit === other.unit
    )
  }

  convert(value: number, target: QuantityUnit): number | undefined {
    const converter = QuantityUnitConverter.allValues.find(
      (converter) =>
        converter.sourceUnit.equals(this) &&
        converter.targetUnit.equals(target),
    )
    if (!converter) return undefined
    return converter.convert(value)
  }

  fhirQuantity(value: number): FHIRSimpleQuantity {
    return {
      system: this.system,
      code: this.code,
      value: value,
      unit: this.unit,
    }
  }

  valueOf(quantity: FHIRSimpleQuantity | undefined): number | undefined {
    if (!quantity?.value) return undefined
    if (this.isUsedIn(quantity)) return quantity.value

    return QuantityUnitConverter.allValues
      .find(
        (converter) =>
          converter.sourceUnit.isUsedIn(quantity) &&
          converter.targetUnit.equals(this),
      )
      ?.convert(quantity.value)
  }
}

class QuantityUnitConverter {
  sourceUnit: QuantityUnit
  targetUnit: QuantityUnit
  convert: (value: number) => number

  constructor(
    sourceUnit: QuantityUnit,
    targetUnit: QuantityUnit,
    convert: (value: number) => number,
  ) {
    this.sourceUnit = sourceUnit
    this.targetUnit = targetUnit
    this.convert = convert
  }

  static allValues = [
    new QuantityUnitConverter(
      QuantityUnit.lbs,
      QuantityUnit.kg,
      (value) => value * 0.45359237,
    ),
    new QuantityUnitConverter(
      QuantityUnit.kg,
      QuantityUnit.lbs,
      (value) => value / 0.45359237,
    ),
  ]
}
