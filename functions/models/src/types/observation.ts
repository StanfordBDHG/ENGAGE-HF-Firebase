//
// This source file is part of the Stanford ENGAGE-HF project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type QuantityUnit } from "../codes/quantityUnit.js";

export interface Observation {
  date: Date;
  value: number;
  unit: QuantityUnit;
}
