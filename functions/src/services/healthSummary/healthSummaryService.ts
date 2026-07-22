//
// This source file is part of the Stanford ENGAGE-HF project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type QuantityUnit } from "@schmiedmayerlab/engagehf-models";
import { type HealthSummaryData } from "../../models/healthSummaryData.js";

export interface HealthSummaryService {
  getHealthSummaryData(
    userId: string,
    date: Date,
    weightUnit: QuantityUnit,
  ): Promise<HealthSummaryData>;
}
