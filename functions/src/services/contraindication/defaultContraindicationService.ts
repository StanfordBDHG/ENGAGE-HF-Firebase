import {
  ContraindicationCategory,
  type ContraindicationService,
} from './contraindicationService.js'
import {
  type FHIRAllergyIntolerance,
  FHIRAllergyIntoleranceCriticality,
  FHIRAllergyIntoleranceType,
} from '../../models/fhir/allergyIntolerance.js'
import {
  CodingSystem,
  MedicationClassReference,
  MedicationReference,
} from '../codes.js'
import { type FhirService } from '../fhir/fhirService.js'

export class DefaultContraindicationService implements ContraindicationService {
  // Properties

  private readonly fhirService: FhirService

  /// Medication class contraindications
  /// - Key: SNOMED CT code used in FHIRAllergyIntolerance
  /// - Value: List of Medication references
  private readonly medicationContraindications = new Map<
    string,
    MedicationReference[]
  >([
    ['293472002', [MedicationReference.spironolactone]],
    ['470681000124105', [MedicationReference.eplerenone]],
    ['471761000124104', [MedicationReference.dapagliflozin]],
    ['471811000124106', [MedicationReference.empagliflozin]],
  ])

  /// Medication class contraindications
  /// - Key: SNOMED CT code used in FHIRAllergyIntolerance
  /// - Value: List of MedicationClass references
  private readonly medicationClassContraindications = new Map<
    string,
    MedicationClassReference[]
  >([
    ['293963004', [MedicationClassReference.betaBlockers]],
    ['293962009', [MedicationClassReference.betaBlockers]],
    ['292419005', [MedicationClassReference.betaBlockers]],
    ['292420004', [MedicationClassReference.betaBlockers]],
    [
      '295009002',
      [MedicationClassReference.mineralocorticoidReceptorAntagonists],
    ],
    [
      '470181000124100',
      [MedicationClassReference.mineralocorticoidReceptorAntagonists],
    ],
    [
      '295007000',
      [MedicationClassReference.mineralocorticoidReceptorAntagonists],
    ],
    ['470691000124108', [MedicationClassReference.sglt2inhibitors]],
    ['1208353007', [MedicationClassReference.sglt2inhibitors]],
    ['471811000124106', [MedicationClassReference.sglt2inhibitors]],
    [
      '371627004',
      [
        MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
        MedicationClassReference.angiotensinReceptorBlockers,
        MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
      ],
    ],
    [
      '407590002',
      [
        MedicationClassReference.angiotensinReceptorBlockers,
        MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
      ],
    ],
    [
      '293500009',
      [MedicationClassReference.angiotensinConvertingEnzymeInhibitors],
    ],
  ])

  // Constructor

  constructor(fhirService: FhirService) {
    this.fhirService = fhirService
  }

  // Methods

  checkMedication(
    contraindications: FHIRAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory {
    return this.checkAll(contraindications, CodingSystem.snomedCt, (code) => {
      const references = this.medicationContraindications.get(code) ?? []
      return references.some((reference) => reference === medicationReference)
    })
  }

  checkMedicationClass(
    contraindications: FHIRAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory {
    return this.checkAll(contraindications, CodingSystem.snomedCt, (code) => {
      const references = this.medicationClassContraindications.get(code) ?? []
      return references.some(
        (reference) => reference === medicationClassReference,
      )
    })
  }

  // Helpers

  private checkAll(
    contraindications: FHIRAllergyIntolerance[],
    system: CodingSystem,
    check: (code: string) => boolean,
  ): ContraindicationCategory {
    const categories = contraindications.map((contraindication) => {
      if (!this.check(contraindication, system, check))
        return ContraindicationCategory.none
      if (
        contraindication.criticality == FHIRAllergyIntoleranceCriticality.high
      )
        return ContraindicationCategory.severeAllergyIntolerance
      return this.category(contraindication.type)
    })
    if (categories.includes(ContraindicationCategory.severeAllergyIntolerance))
      return ContraindicationCategory.severeAllergyIntolerance
    if (categories.includes(ContraindicationCategory.allergyIntolerance))
      return ContraindicationCategory.allergyIntolerance
    if (categories.includes(ContraindicationCategory.clinicianListed))
      return ContraindicationCategory.clinicianListed
    return ContraindicationCategory.none
  }

  private check(
    contraindication: FHIRAllergyIntolerance,
    system: CodingSystem,
    check: (code: string) => boolean,
  ): boolean {
    const codes = this.fhirService.extractCodes(contraindication, {
      system: system,
    })
    for (const code of codes) {
      if (check(code)) return true
    }
    return false
  }

  private category(type: FHIRAllergyIntoleranceType): ContraindicationCategory {
    switch (type) {
      case FHIRAllergyIntoleranceType.allergy:
      case FHIRAllergyIntoleranceType.intolerance:
        return ContraindicationCategory.allergyIntolerance
      default:
        return ContraindicationCategory.clinicianListed
    }
  }
}
