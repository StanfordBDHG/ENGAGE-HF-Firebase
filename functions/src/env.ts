//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

/* eslint-disable @typescript-eslint/no-extraneous-class */

export class Env {
  static get WEB_FRONTEND_BASE_URL() {
    return `https://${process.env.GOOGLE_PROJECT_ID}.web.app`
  }
}
