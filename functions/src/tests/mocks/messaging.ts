//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Message } from 'firebase-admin/messaging'

export class MockMessaging {
  sendEach(messages: Message[], dryRun?: boolean): Promise<void> {
    return Promise.resolve()
  }
}
