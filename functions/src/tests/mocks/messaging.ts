//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Message } from 'firebase-admin/messaging'

/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockMessaging {
  async sendEach(messages: Message[], dryRun?: boolean) {
    return
  }
}
