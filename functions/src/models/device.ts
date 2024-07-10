//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export enum UserDevicePlatform {
  Android = 'Android',
  iOS = 'iOS',
}

export interface UserDevice {
  modifiedDate: Date
  notificationToken: string
  platform?: UserDevicePlatform
  osVersion?: string
  appVersion?: string
  appBuild?: string
  language?: string
}
