//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type DocumentSnapshot } from 'firebase-admin/firestore'
import { type Change } from 'firebase-functions'
import { type HistoryService } from './historyService.js'
import { type DatabaseService } from '../database/databaseService.js'

export class DatabaseHistoryService implements HistoryService {
  // Properties

  private readonly databaseService: DatabaseService

  // Constructor

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
  }

  // Methods

  async recordChange(input: {
    path: string
    change: Change<DocumentSnapshot>
  }): Promise<void> {
    await this.databaseService.runTransaction((collections, transaction) => {
      transaction.set(collections.history.doc(), {
        path: input.path,
        data: input.change.after.data(),
        date: new Date(),
      })
    })
  }
}
