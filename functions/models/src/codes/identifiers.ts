//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2026 Stanford University
//
// SPDX-License-Identifier: MIT
//

/// The base under which every ENGAGE-HF FHIR identifier lives.
export const fhirIdentifierBase = "https://www.engage-hf.com/fhir";

// Documents written before the move to engage-hf.com carry one of these bases — extensions and
// value sets the first, questionnaire canonicals the others. Reads accept every spelling while
// everything written from here on uses the new base. Nothing else may mention them.
const legacyFHIRIdentifierBases = [
  "http://engagehf.bdh.stanford.edu/fhir",
  "http://spezi.health/fhir",
  "http://spezi.stanford.edu/fhir",
];

export const legacyFHIRIdentifiers = (identifier: string): string[] =>
  identifier.startsWith(fhirIdentifierBase) ?
    legacyFHIRIdentifierBases.map(
      (base) => base + identifier.slice(fhirIdentifierBase.length),
    )
  : [];

export const fhirIdentifiersMatch = (
  candidate: string | undefined,
  identifier: string,
): boolean => {
  if (candidate === undefined) return false;
  if (candidate === identifier) return true;
  return legacyFHIRIdentifiers(identifier).includes(candidate);
};
