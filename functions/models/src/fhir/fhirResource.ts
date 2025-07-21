//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { CodeableConcept, Coding, DomainResource, Extension } from 'fhir/r4b'
import { FHIRExtensionUrl } from '../codes/codes'

export abstract class FHIRResource<ResourceType extends DomainResource> {
  // Properties

  data: ResourceType

  // Constructor

  constructor(data: ResourceType) {
    this.data = data
  }

  // Methods

  codes(concept: CodeableConcept | undefined, filter: Coding): string[] {
    return (
      concept?.coding?.flatMap((coding) => {
        if (filter.system && coding.system !== filter.system) return []
        if (filter.version && coding.version !== filter.version) return []
        return coding.code ? [coding.code] : []
      }) ?? []
    )
  }

  containsCoding(
    concept: CodeableConcept | undefined,
    filter: Coding[],
  ): boolean {
    return filter.some(
      (filterCoding) =>
        concept?.coding?.some((coding) => {
          if (filterCoding.code && coding.code !== filterCoding.code)
            return false
          if (filterCoding.system && coding.system !== filterCoding.system)
            return false
          if (filterCoding.version && coding.version !== filterCoding.version)
            return false
          return true
        }) ?? false,
    )
  }

  containedResource<T extends DomainResource>(id: string): T | undefined {
    return this.data.contained?.find((resource) => resource.id === id) as
      | T
      | undefined
  }

  extensionsWithUrl(url: FHIRExtensionUrl): Extension[] {
    return (
      this.data.extension?.filter(
        (extension) => extension.url === url.toString(),
      ) ?? []
    )
  }
}
