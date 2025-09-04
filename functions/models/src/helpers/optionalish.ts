//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z, type ZodType } from "zod";

export const optionalish = <T extends ZodType>(type: T) =>
  type.or(z.null().transform(() => undefined)).optional();

export const optionalishDefault = <T extends ZodType>(
  type: T,
  defaultValue: z.output<T>,
) =>
  type
    .or(z.null().transform(() => undefined))
    .optional()

    .transform((value) => value ?? defaultValue);
