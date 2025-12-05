//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";

export const exportDataInputSchema = z.object({
  userId: z.string().optional(),
});

export type ExportDataInputSchema = z.input<typeof exportDataInputSchema>;

export interface ExportDataOutputSchema {
  content: string;
}
