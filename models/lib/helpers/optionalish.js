//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function optionalish(type) {
    return type.or(z.null().transform(function () { return undefined; })).optional();
}
