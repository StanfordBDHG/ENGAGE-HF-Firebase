//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type HealthSummaryData } from '../../models/healthSummaryData.js'
import { MockHealthSummaryService } from '../../services/healthSummary/healthSummaryService.mock.js'

export function mockHealthSummaryData(
  startDate: Date = new Date('2024-02-02'),
): Promise<HealthSummaryData> {
  const service = new MockHealthSummaryService(startDate)
  return service.getHealthSummaryData('')
}
