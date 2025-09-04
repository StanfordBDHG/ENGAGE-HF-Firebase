//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { QuantityUnit, UserSex } from "@stanfordbdhg/engagehf-models";

export class EgfrCalculator {
  calculate(input: {
    sexAssignedAtBirth: UserSex;
    age: number;
    creatinine: number;
  }): { value: number; unit: QuantityUnit } {
    //
    // https://www.kidney.org/ckd-epi-creatinine-equation-2021
    //
    // eGFR = 142 x min(S_cr/κ, 1)^alpha x max(S_cr/κ, 1)-1.200 x 0.9938^age x 1.012 [if female]
    //
    // where:
    // - S_cr = standardized serum creatinine in mg/dL
    // - κ = 0.7 (females) or 0.9 (males)
    // - alpha = -0.241 (female) or -0.302 (male)
    // - min(Scr/κ, 1) is the minimum of Scr/κ or 1.0
    // - max(Scr/κ, 1) is the maximum of Scr/κ or 1.0
    // - age (years)
    //
    // Additional source for testing:
    // - https://www.mdcalc.com/calc/3939/ckd-epi-equations-glomerular-filtration-rate-gfr
    //

    let value: number;
    switch (input.sexAssignedAtBirth) {
      case UserSex.female: {
        const k = 0.7;
        const min = Math.min(input.creatinine / k, 1);
        const max = Math.max(input.creatinine / k, 1);
        value =
          142 *
          Math.pow(min, -0.241) *
          Math.pow(max, -1.2) *
          Math.pow(0.9938, input.age) *
          1.012;
        break;
      }
      case UserSex.male: {
        const k = 0.9;
        const min = Math.min(input.creatinine / k, 1);
        const max = Math.max(input.creatinine / k, 1);
        value =
          142 *
          Math.pow(min, -0.302) *
          Math.pow(max, -1.2) *
          Math.pow(0.9938, input.age);
        break;
      }
    }

    return {
      value,
      unit: QuantityUnit.mL_min_173m2,
    };
  }
}
