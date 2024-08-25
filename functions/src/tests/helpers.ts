//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'

export async function expectError(
  func: () => void | Promise<void>,
  check: (error: unknown) => void,
): Promise<void> {
  try {
    await func()
    expect.fail('Expected an error to be thrown')
  } catch (error) {
    check(error)
  }
}
