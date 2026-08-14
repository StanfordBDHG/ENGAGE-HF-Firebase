//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2026 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { FHIRExtensionUrl } from "./codes.js";
import {
  fhirIdentifierBase,
  fhirIdentifiersMatch,
  legacyFHIRIdentifiers,
} from "./identifiers.js";
import { FHIRMedication } from "../fhir/fhirMedication.js";

describe("legacyFHIRIdentifiers", () => {
  it("maps an engage-hf.com identifier onto its pre-migration spellings", () => {
    expect(
      legacyFHIRIdentifiers(
        `${fhirIdentifierBase}/StructureDefinition/Medication/extension/brandName`,
      ),
    ).toEqual([
      "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/brandName",
      "http://spezi.health/fhir/StructureDefinition/Medication/extension/brandName",
      "http://spezi.stanford.edu/fhir/StructureDefinition/Medication/extension/brandName",
    ]);
  });

  it("leaves identifiers outside the engage-hf.com base alone", () => {
    expect(
      legacyFHIRIdentifiers(
        "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
      ),
    ).toEqual([]);
  });
});

describe("FHIRExtensionUrl", () => {
  it("keeps every ENGAGE-HF extension under the base so each has a legacy spelling", () => {
    for (const url of Object.values(FHIRExtensionUrl)) {
      if (url === FHIRExtensionUrl.questionnaireItemControl) continue;
      expect(url.startsWith(`${fhirIdentifierBase}/`)).toBe(true);
      expect(legacyFHIRIdentifiers(url)).not.toHaveLength(0);
    }
  });
});

describe("fhirIdentifiersMatch", () => {
  it("matches the current spelling", () => {
    expect(
      fhirIdentifiersMatch(
        FHIRExtensionUrl.brandName,
        FHIRExtensionUrl.brandName,
      ),
    ).toBe(true);
  });

  it("matches a document written before the migration", () => {
    expect(
      fhirIdentifiersMatch(
        "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/brandName",
        FHIRExtensionUrl.brandName,
      ),
    ).toBe(true);
  });

  it("matches a questionnaire canonical written before the migration", () => {
    expect(
      fhirIdentifiersMatch(
        "http://spezi.health/fhir/questionnaire/engagehf-kccq",
        `${fhirIdentifierBase}/questionnaire/engagehf-kccq`,
      ),
    ).toBe(true);
  });

  it("does not match unrelated identifiers or missing values", () => {
    expect(
      fhirIdentifiersMatch(
        FHIRExtensionUrl.medicationClass,
        FHIRExtensionUrl.brandName,
      ),
    ).toBe(false);
    expect(fhirIdentifiersMatch(undefined, FHIRExtensionUrl.brandName)).toBe(
      false,
    );
  });
});

describe("extensionsWithUrl", () => {
  it("resolves extensions regardless of which spelling a document carries", () => {
    const medication = new FHIRMedication({
      extension: [
        {
          url: "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/brandName",
          valueString: "Legacy Brand",
        },
        {
          url: FHIRExtensionUrl.brandName as string,
          valueString: "Current Brand",
        },
      ],
    });
    expect(medication.brandNames).toEqual(["Legacy Brand", "Current Brand"]);
  });
});
