//
// This source file is part of the Stanford ENGAGE-HF project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";

export const optionalish = <T extends z.ZodTypeAny>(type: T) =>
  type.or(z.null().transform(() => undefined)).optional();

export const optionalishDefault = <T extends z.ZodTypeAny>(
  type: T,
  defaultValue: z.output<T>,
) =>
  type
    .or(z.null().transform(() => undefined))
    .optional()
    .transform((value) => value ?? defaultValue);
