//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import { expectError } from '../tests/helpers.js'
import { https } from 'firebase-functions'
import { createInvitation } from './createInvitation.js'

describeWithEmulators(
  'function: createInvitation',
  { triggersEnabled: true },
  (env) => {},
)
