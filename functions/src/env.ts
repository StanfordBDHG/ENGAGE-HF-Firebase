//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { defineSecret } from 'firebase-functions/params'

/* eslint-disable @typescript-eslint/no-extraneous-class */

const webFrontendBaseUrl = defineSecret('WEB_FRONTEND_BASE_URL')

export class Env {
  static get WEB_FRONTEND_BASE_URL() {
    return webFrontendBaseUrl.value()
  }
}
