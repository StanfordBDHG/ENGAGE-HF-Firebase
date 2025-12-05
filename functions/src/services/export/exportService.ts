//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export interface ExportService {
  exportPatientDataForUser(userId: string): Promise<Buffer>;

  exportPatientDataForOrganization(organizationId: string): Promise<Buffer>;

  exportPatientDataForAll(): Promise<Buffer>;
}
