//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { RxNormApi } from "./rxNormApi.js";
import { TestFlags } from "../../../../tests/testFlags.js";

describe("RxNormApi", () => {
  if (!TestFlags.connectsToRxNormApi) {
    it("doesn't run tests because connectsToRxNormApi is false", () => {
      expect(true).toBe(true);
    });
    return;
  }

  const api = new RxNormApi();

  it("getAllRxTermInfo: Medication", async () => {
    const termInfo = await api.getAllRxTermInfo("20352");
    expect(termInfo).toBeUndefined();
  });

  it("getAllRxTermInfo: Drug", async () => {
    const termInfo = await api.getAllRxTermInfo("200031");
    expect(termInfo).toBeDefined();
    expect(termInfo?.displayName).toBe("Carvedilol (Oral Pill)");
    expect(termInfo?.fullName).toBe("carvedilol 6.25 MG Oral Tablet");
    expect(termInfo?.rxnormDoseForm).toBe("Oral Tablet");
    expect(termInfo?.strength).toBe("6.25 mg");
  });

  it("getRelated: constitutes", async () => {
    const related = await api.getRelated("315577", "constitutes");
    expect(
      related.relatedGroup?.conceptGroup
        .find((group) => group.tty === "SCD")
        ?.conceptProperties.find((props) => props.rxcui === "200031"),
    ).toBeDefined();
  });

  it("getRelated: ingredient_of", async () => {
    const related = await api.getRelated("20352", "ingredient_of");
    expect(
      related.relatedGroup?.conceptGroup
        .find((group) => group.tty === "SCDC")
        ?.conceptProperties.find((props) => props.rxcui === "315577"),
    ).toBeDefined();
  });

  it("getRxNormName", async () => {
    const name = await api.getRxNormName("20352");
    expect(name).toBe("carvedilol");
  });
});
